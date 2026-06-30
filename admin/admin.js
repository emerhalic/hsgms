/**
 * Admin Verification State Engine.
 * Business logic, optimistic UI, pagination, pub-sub.
 */

import {
    subscribeToBookings,
    approveBookingInDb,
    rejectBookingInDb,
    applyBookingQuery,
    computeStatistics,
    paginate,
    buildBookingRecord
} from "./admin-service.js";

import { BOOKING_STATUS, normalizeStatus } from "./constants/status.js";
import { FILTER_KEYS, SORT_KEYS } from "./constants/filters.js";
import { PAGE_SIZE } from "./constants/pagination.js";
import { PERMISSIONS, hasPermission } from "./constants/rbac.js";
import { getActor } from "./auth.js";
import { isOnline, subscribeConnectivity } from "./utils/connectivity.js";
import * as logger from "./logger/index.js";

/** @typedef {"loading"|"ready"|"empty"|"network_error"|"firebase_error"|"offline"} ViewState */

const INITIAL_STATE = Object.freeze({
    allBookings:       [],
    filteredBookings:  [],
    paginatedBookings: [],
    pagination: {
        currentPage: 1, totalPages: 1, totalItems: 0,
        pageSize: PAGE_SIZE, hasNext: false, hasPrev: false,
        rangeStart: 0, rangeEnd: 0
    },
    statistics: computeStatistics([]),
    selectedBooking:   null,
    filter:            FILTER_KEYS.ALL,
    search:            "",
    sort:              SORT_KEYS.NEWEST,
    currentPage:       1,
    viewState:         "loading",
    isUpdating:        false,
    optimisticLock:    null,
    lastError:         null,
    isOffline:         false,
    userRole:          null
});

let state = structuredClone(INITIAL_STATE);
const subscribers = new Set();
/** @type {Function|null} */
let _firebaseUnsub = null;
/** @type {Function|null} */
let _connectivityUnsub = null;

const _notify = () => {
    subscribers.forEach((cb) => {
        try { cb(getState()); } catch (e) { logger.error("AdminEngine", "Subscriber error", e); }
    });
};

const _recompute = () => {
    state.filteredBookings = applyBookingQuery(state.allBookings, {
        filter: state.filter,
        search: state.search,
        sort:   state.sort
    });

    state.statistics = computeStatistics(state.allBookings);

    const pg = paginate(state.filteredBookings, state.currentPage, PAGE_SIZE);
    state.paginatedBookings = pg.items;
    state.pagination = pg;

    if (state.selectedBooking) {
        const fresh = state.allBookings.find((b) => b.bookingId === state.selectedBooking.bookingId);
        state.selectedBooking = fresh || null;
    }

    if (state.viewState !== "network_error" && state.viewState !== "firebase_error") {
        if (state.isOffline) {
            state.viewState = "offline";
        } else if (state.allBookings.length === 0 && state.viewState !== "loading") {
            state.viewState = "empty";
        } else if (state.filteredBookings.length === 0 && state.allBookings.length > 0) {
            state.viewState = "ready";
        } else {
            state.viewState = "ready";
        }
    }
};

const _patch = (updates) => {
    Object.assign(state, updates);
    _recompute();
    _notify();
};

export const getState = () => structuredClone(state);

export const subscribe = (callback) => {
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
};

export const setUserRole = (role) => {
    state.userRole = role;
    _notify();
};

export const setFilter = (filterKey) => {
    _patch({ filter: filterKey, currentPage: 1 });
};

export const setSearch = (query) => {
    _patch({ search: query || "", currentPage: 1 });
};

export const setSort = (sortKey) => {
    _patch({ sort: sortKey, currentPage: 1 });
};

export const setPage = (page) => {
    _patch({ currentPage: page });
};

export const selectBooking = (bookingId) => {
    if (!bookingId) {
        _patch({ selectedBooking: null });
        return;
    }
    const booking = state.allBookings.find((b) => b.bookingId === bookingId) || null;
    _patch({ selectedBooking: booking });
};

export const clearError = () => {
    state.lastError = null;
    _notify();
};

export const retryLoad = () => {
    state.viewState = "loading";
    state.lastError = null;
    state.allBookings = [];
    _notify();
    destroyAdminEngine();
    initAdminEngine();
};

/**
 * @param {string} permission
 * @returns {boolean}
 */
export const canPerform = (permission) => {
    return hasPermission(state.userRole, permission);
};

/**
 * Optimistically patch a booking in local state.
 * @param {string} bookingId
 * @param {Object} patch
 * @private
 */
const _optimisticPatch = (bookingId, patch) => {
    const idx = state.allBookings.findIndex((b) => b.bookingId === bookingId);
    if (idx === -1) return null;

    const original = structuredClone(state.allBookings[idx]);
    const updated = { ...original, ...patch };
    updated.normalizedStatus = normalizeStatus(updated.status);

    state.allBookings = [
        ...state.allBookings.slice(0, idx),
        updated,
        ...state.allBookings.slice(idx + 1)
    ];

    if (state.selectedBooking?.bookingId === bookingId) {
        state.selectedBooking = updated;
    }

    _recompute();
    _notify();
    return original;
};

/**
 * @param {string} bookingId
 * @returns {Promise<void>}
 */
export const approveBooking = async (bookingId) => {
    if (!canPerform(PERMISSIONS.BOOKING_APPROVE)) {
        throw new Error("Anda tidak memiliki izin untuk approve booking.");
    }

    const actor = getActor();
    if (!actor) throw new Error("Sesi admin tidak valid.");

    const original = _optimisticPatch(bookingId, {
        status: BOOKING_STATUS.VERIFIED,
        normalizedStatus: BOOKING_STATUS.VERIFIED,
        updatedAt: Date.now()
    });

    state.isUpdating = true;
    state.optimisticLock = bookingId;
    _notify();

    try {
        await approveBookingInDb(bookingId, actor);
    } catch (err) {
        if (original) _optimisticPatch(bookingId, original);
        state.lastError = err.message;
        throw err;
    } finally {
        state.isUpdating = false;
        state.optimisticLock = null;
        _notify();
    }
};

/**
 * @param {string} bookingId
 * @param {string} reasonId
 * @param {string} [reasonNote]
 * @returns {Promise<void>}
 */
export const rejectBooking = async (bookingId, reasonId, reasonNote = "") => {
    if (!canPerform(PERMISSIONS.BOOKING_REJECT)) {
        throw new Error("Anda tidak memiliki izin untuk reject booking.");
    }

    const actor = getActor();
    if (!actor) throw new Error("Sesi admin tidak valid.");

    const existing = state.allBookings.find((b) => b.bookingId === bookingId);
    const original = _optimisticPatch(bookingId, {
        status: BOOKING_STATUS.REJECTED,
        normalizedStatus: BOOKING_STATUS.REJECTED,
        updatedAt: Date.now(),
        audit: {
            ...(existing?.audit || {}),
            rejectReason: reasonNote ? `${reasonId}:${reasonNote}` : reasonId,
            rejectedBy: actor.displayName || actor.email,
            rejectedAt: Date.now()
        }
    });

    state.isUpdating = true;
    state.optimisticLock = bookingId;
    _notify();

    try {
        await rejectBookingInDb(bookingId, actor, reasonId, reasonNote);
    } catch (err) {
        if (original) _optimisticPatch(bookingId, original);
        state.lastError = err.message;
        throw err;
    } finally {
        state.isUpdating = false;
        state.optimisticLock = null;
        _notify();
    }
};

export const initAdminEngine = () => {
    if (_firebaseUnsub) return;

    state.viewState = "loading";
    _notify();

    _connectivityUnsub = subscribeConnectivity((online) => {
        state.isOffline = !online;
        if (!online) {
            state.viewState = "offline";
        } else if (state.viewState === "offline") {
            state.viewState = state.allBookings.length ? "ready" : "loading";
        }
        _recompute();
        _notify();
    });

    _firebaseUnsub = subscribeToBookings(
        (bookings) => {
            state.allBookings = bookings;
            state.viewState = bookings.length === 0 ? "empty" : "ready";
            _recompute();
            _notify();
        },
        (err) => {
            state.viewState = isOnline() ? "firebase_error" : "network_error";
            state.lastError = err.message;
            _recompute();
            _notify();
        }
    );
};

export const destroyAdminEngine = () => {
    _firebaseUnsub?.();
    _firebaseUnsub = null;
    _connectivityUnsub?.();
    _connectivityUnsub = null;
};

export { BOOKING_STATUS, FILTER_KEYS, SORT_KEYS, PERMISSIONS };
export { buildBookingRecord };
