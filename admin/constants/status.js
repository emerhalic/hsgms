/**
 * Future-proof booking status registry.
 * Sprint 5 uses verification statuses; full workflow reserved for later sprints.
 */

/** @enum {string} */
export const BOOKING_STATUS = Object.freeze({
    WAITING_PAYMENT:   "WAITING_PAYMENT",
    WAITING_APPROVAL:  "WAITING_APPROVAL",
    VERIFIED:          "VERIFIED",
    REJECTED:          "REJECTED",
    SCHEDULED:         "SCHEDULED",
    CHECKED_IN:        "CHECKED_IN",
    PHOTO_SESSION:     "PHOTO_SESSION",
    EDITING:           "EDITING",
    READY_TO_PICKUP:   "READY_TO_PICKUP",
    COMPLETED:         "COMPLETED",
    ARCHIVED:          "ARCHIVED"
});

/** Legacy values from Sprint 4 database-service. */
export const LEGACY_STATUS_MAP = Object.freeze({
    pending:      BOOKING_STATUS.WAITING_APPROVAL,
    dp_verified:  BOOKING_STATUS.VERIFIED,
    qr_generated: BOOKING_STATUS.VERIFIED,
    checked_in:   BOOKING_STATUS.CHECKED_IN,
    in_queue:     BOOKING_STATUS.PHOTO_SESSION,
    in_progress:  BOOKING_STATUS.PHOTO_SESSION,
    completed:    BOOKING_STATUS.COMPLETED,
    cancelled:    BOOKING_STATUS.REJECTED
});

/** Statuses that appear in the Sprint 5 verification dashboard filter. */
export const VERIFICATION_STATUSES = Object.freeze([
    BOOKING_STATUS.WAITING_APPROVAL,
    BOOKING_STATUS.VERIFIED,
    BOOKING_STATUS.REJECTED
]);

/**
 * @param {string|null|undefined} rawStatus
 * @returns {string}
 */
export const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return BOOKING_STATUS.WAITING_APPROVAL;
    if (Object.values(BOOKING_STATUS).includes(rawStatus)) return rawStatus;
    return LEGACY_STATUS_MAP[rawStatus] || rawStatus;
};

/**
 * @param {string} status
 * @returns {{ label: string, modifier: string }}
 */
export const getStatusBadgeMeta = (status) => {
    const normalized = normalizeStatus(status);

    const map = {
        [BOOKING_STATUS.WAITING_APPROVAL]: { label: "WAITING APPROVAL", modifier: "waiting" },
        [BOOKING_STATUS.WAITING_PAYMENT]:  { label: "WAITING PAYMENT",  modifier: "waiting" },
        [BOOKING_STATUS.VERIFIED]:         { label: "VERIFIED",         modifier: "verified" },
        [BOOKING_STATUS.REJECTED]:         { label: "REJECTED",         modifier: "rejected" },
        [BOOKING_STATUS.SCHEDULED]:        { label: "SCHEDULED",        modifier: "verified" },
        [BOOKING_STATUS.CHECKED_IN]:       { label: "CHECKED IN",       modifier: "verified" },
        [BOOKING_STATUS.PHOTO_SESSION]:    { label: "PHOTO SESSION",    modifier: "verified" },
        [BOOKING_STATUS.EDITING]:          { label: "EDITING",          modifier: "waiting" },
        [BOOKING_STATUS.READY_TO_PICKUP]:  { label: "READY TO PICKUP",  modifier: "verified" },
        [BOOKING_STATUS.COMPLETED]:        { label: "COMPLETED",        modifier: "verified" },
        [BOOKING_STATUS.ARCHIVED]:         { label: "ARCHIVED",         modifier: "rejected" }
    };

    return map[normalized] || { label: normalized.replace(/_/g, " "), modifier: "waiting" };
};

/**
 * @param {string} rawStatus
 * @returns {boolean}
 */
export const isPendingVerification = (rawStatus) => {
    return normalizeStatus(rawStatus) === BOOKING_STATUS.WAITING_APPROVAL;
};
