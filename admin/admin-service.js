/**
 * Firebase Realtime Database service for admin verification.
 * Reads, writes, queries, filtering — no DOM, no state.
 */

import { database } from "../js/firebase-config.js";
import {
    ref, onValue, off, update, get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import { BOOKING_STATUS, normalizeStatus } from "./constants/status.js";
import { FILTER_KEYS, SORT_KEYS } from "./constants/filters.js";
import { inferPackageName } from "./constants/packages.js";
import { getPeriodBoundaries } from "./utils/format.js";
import { paginate } from "./utils/pagination.js";
import {
    buildApproveAuditPayload,
    buildRejectAuditPayload,
    parseAuditRecord
} from "./audit-service.js";
import * as logger from "./logger/index.js";

/** @constant {string} */
const BOOKINGS_NODE = "bookings";

/** @typedef {"loading"|"ready"|"empty"|"network_error"|"firebase_error"|"offline"} LoadState */

export { BOOKING_STATUS, FILTER_KEYS, SORT_KEYS };
export { normalizeStatus };
export { paginate };
export { getDriveViewUrl, getDrivePreviewUrl, extractDriveFileId } from "./utils/drive.js";

/**
 * @param {import("firebase/database").DataSnapshot} snapshot
 * @returns {Array<Object>}
 */
export const snapshotToBookingsArray = (snapshot) => {
    if (!snapshot.exists()) return [];

    const raw = snapshot.val();
    const bookings = [];

    for (const bookingId in raw) {
        if (!Object.hasOwn(raw, bookingId)) continue;
        bookings.push(buildBookingRecord(bookingId, raw[bookingId]));
    }

    return bookings;
};

/**
 * @param {string} bookingId
 * @param {Object} record
 * @returns {Object}
 */
export const buildBookingRecord = (bookingId, record) => {
    const identity = record?.identity ?? {};
    const payment  = record?.payment  ?? {};
    const audit    = parseAuditRecord(record?.audit);
    const dpAmount = Number(payment.dpAmount) || 0;
    const remaining = Number(payment.remainingBalance) || 0;
    const totalPrice = dpAmount + remaining;

    return {
        bookingId,
        identity: {
            fullName:       identity.fullName       ?? "",
            phoneNumber:    identity.phoneNumber    ?? "",
            universityName: identity.universityName ?? "",
            facultyName:    identity.facultyName    ?? "",
            studyProgram:   identity.studyProgram   ?? "",
            graduationDate: identity.graduationDate ?? "",
            notes:          identity.notes          ?? ""
        },
        payment: {
            dpAmount,
            remainingBalance: remaining,
            paymentMethod:    payment.paymentMethod    ?? "",
            transferProofUrl: payment.transferProofUrl ?? null,
            dpPaidAt:         payment.dpPaidAt         ?? null,
            dpVerifiedBy:     payment.dpVerifiedBy     ?? null
        },
        audit,
        status:           record?.status ?? "pending",
        normalizedStatus: normalizeStatus(record?.status),
        packageName:      inferPackageName(totalPrice),
        totalPrice,
        createdAt:        record?.createdAt ?? 0,
        updatedAt:        record?.updatedAt ?? 0
    };
};

/**
 * @param {Array<Object>} bookings
 * @param {string} filterKey
 * @returns {Array<Object>}
 */
export const filterByStatus = (bookings, filterKey) => {
    if (!Array.isArray(bookings)) return [];
    if (filterKey === FILTER_KEYS.ALL) return bookings;

    return bookings.filter((b) => {
        const s = b.normalizedStatus;
        switch (filterKey) {
            case FILTER_KEYS.PENDING:  return s === BOOKING_STATUS.WAITING_APPROVAL;
            case FILTER_KEYS.VERIFIED: return s === BOOKING_STATUS.VERIFIED;
            case FILTER_KEYS.REJECTED: return s === BOOKING_STATUS.REJECTED;
            default: return true;
        }
    });
};

/**
 * @param {Array<Object>} bookings
 * @param {string} query
 * @returns {Array<Object>}
 */
export const searchBookings = (bookings, query) => {
    if (!Array.isArray(bookings)) return [];
    const trimmed = (query || "").trim().toLowerCase();
    if (!trimmed) return bookings;

    return bookings.filter((b) => {
        const { fullName, phoneNumber, universityName } = b.identity;
        return (
            (fullName       || "").toLowerCase().includes(trimmed) ||
            (phoneNumber    || "").toLowerCase().includes(trimmed) ||
            (universityName || "").toLowerCase().includes(trimmed)
        );
    });
};

/**
 * @param {Array<Object>} bookings
 * @param {string} sortKey
 * @returns {Array<Object>}
 */
export const sortBookings = (bookings, sortKey) => {
    if (!Array.isArray(bookings)) return [];
    const sorted = [...bookings];
    sorted.sort((a, b) => {
        const diff = (a.createdAt || 0) - (b.createdAt || 0);
        return sortKey === SORT_KEYS.OLDEST ? diff : -diff;
    });
    return sorted;
};

/**
 * @param {Array<Object>} bookings
 * @param {Object} options
 * @returns {Array<Object>}
 */
export const applyBookingQuery = (bookings, options) => {
    const {
        filter = FILTER_KEYS.ALL,
        search = "",
        sort   = SORT_KEYS.NEWEST
    } = options || {};

    let result = filterByStatus(bookings, filter);
    result = searchBookings(result, search);
    return sortBookings(result, sort);
};

/**
 * @param {Array<Object>} bookings
 * @returns {Object}
 */
export const computeStatistics = (bookings) => {
    const empty = {
        total: 0, today: 0, weekly: 0, monthly: 0,
        pending: 0, verified: 0, rejected: 0,
        pendingPaymentValue: 0, verifiedPaymentValue: 0,
        totalRevenueEstimate: 0
    };

    if (!Array.isArray(bookings)) return empty;

    const { startOfToday, startOfWeek, startOfMonth } = getPeriodBoundaries();
    const stats = { ...empty, total: bookings.length };

    for (const b of bookings) {
        const ts = b.createdAt || 0;
        const dp = b.payment?.dpAmount || 0;
        const total = b.totalPrice || dp + (b.payment?.remainingBalance || 0);
        const s = b.normalizedStatus;

        if (ts >= startOfToday)  stats.today++;
        if (ts >= startOfWeek)   stats.weekly++;
        if (ts >= startOfMonth)  stats.monthly++;

        if (s === BOOKING_STATUS.WAITING_APPROVAL) {
            stats.pending++;
            stats.pendingPaymentValue += dp;
        } else if (s === BOOKING_STATUS.VERIFIED) {
            stats.verified++;
            stats.verifiedPaymentValue += dp;
            stats.totalRevenueEstimate += total;
        } else if (s === BOOKING_STATUS.REJECTED) {
            stats.rejected++;
        }
    }

    return stats;
};

/**
 * @param {Function} onData
 * @param {Function} onError
 * @returns {Function}
 */
export const subscribeToBookings = (onData, onError) => {
    const bookingsRef = ref(database, BOOKINGS_NODE);

    const listener = (snapshot) => {
        try {
            onData(snapshotToBookingsArray(snapshot));
        } catch (err) {
            logger.error("AdminService", "Snapshot processing failed", err);
            onError?.({ type: "firebase_error", message: err.message });
        }
    };

    const errorListener = (err) => {
        logger.error("AdminService", "Firebase read error", err);
        onError?.({ type: "firebase_error", message: err.message || "Gagal memuat data booking." });
        onData([]);
    };

    onValue(bookingsRef, listener, errorListener);
    return () => off(bookingsRef, "value", listener);
};

/**
 * @param {string} bookingId
 * @returns {Promise<Object|null>}
 */
export const fetchBookingById = async (bookingId) => {
    const snap = await get(ref(database, `${BOOKINGS_NODE}/${bookingId}`));
    if (!snap.exists()) return null;
    return buildBookingRecord(bookingId, snap.val());
};

/**
 * @param {string} bookingId
 * @param {Object} actor
 * @returns {Promise<void>}
 */
export const approveBookingInDb = async (bookingId, actor) => {
    _guardBookingId(bookingId);
    _guardActor(actor);

    const payload = buildApproveAuditPayload(actor);
    await update(ref(database, `${BOOKINGS_NODE}/${bookingId}`), payload);
};

/**
 * @param {string} bookingId
 * @param {Object} actor
 * @param {string} reasonId
 * @param {string} [reasonNote]
 * @returns {Promise<void>}
 */
export const rejectBookingInDb = async (bookingId, actor, reasonId, reasonNote = "") => {
    _guardBookingId(bookingId);
    _guardActor(actor);
    if (!reasonId) throw new Error("Alasan penolakan wajib diisi.");

    const payload = buildRejectAuditPayload(actor, reasonId, reasonNote);
    await update(ref(database, `${BOOKINGS_NODE}/${bookingId}`), payload);
};

/** @param {string} bookingId @private */
const _guardBookingId = (bookingId) => {
    if (!bookingId || typeof bookingId !== "string") {
        throw new Error("HSGMS Admin Service: bookingId tidak valid.");
    }
};

/** @param {Object} actor @private */
const _guardActor = (actor) => {
    if (!actor?.uid) throw new Error("HSGMS Admin Service: Admin tidak terautentikasi.");
};
