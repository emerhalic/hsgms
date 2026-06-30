/**
 * Reusable audit log builder for booking verification actions.
 * Writes optional audit sub-node fields — never modifies existing schema fields.
 */

/**
 * @typedef {Object} AuditActor
 * @property {string} uid
 * @property {string} email
 * @property {string} [displayName]
 */

/**
 * @param {AuditActor} actor
 * @returns {Object} Firebase partial update payload
 */
export const buildApproveAuditPayload = (actor) => {
    const now = Date.now();
    const actorLabel = actor.displayName || actor.email || actor.uid;

    return {
        status:    "VERIFIED",
        updatedAt: now,
        "payment/dpVerifiedBy": actorLabel,
        "payment/dpPaidAt":     now,
        "audit/approvedBy":       actorLabel,
        "audit/approvedAt":       now,
        "audit/lastModifiedBy":   actorLabel,
        "audit/lastModifiedAt":   now
    };
};

/**
 * @param {AuditActor} actor
 * @param {string} reasonId
 * @param {string} [reasonNote]
 * @returns {Object} Firebase partial update payload
 */
export const buildRejectAuditPayload = (actor, reasonId, reasonNote = "") => {
    const now = Date.now();
    const actorLabel = actor.displayName || actor.email || actor.uid;
    const rejectReason = reasonNote.trim()
        ? `${reasonId}:${reasonNote.trim()}`
        : reasonId;

    return {
        status:    "REJECTED",
        updatedAt: now,
        "audit/rejectedBy":       actorLabel,
        "audit/rejectedAt":       now,
        "audit/rejectReason":     rejectReason,
        "audit/lastModifiedBy":   actorLabel,
        "audit/lastModifiedAt":   now
    };
};

/**
 * Parses audit sub-node from raw Firebase record.
 * @param {Object|null|undefined} rawAudit
 * @returns {Object}
 */
export const parseAuditRecord = (rawAudit) => ({
    approvedBy:       rawAudit?.approvedBy       ?? null,
    approvedAt:       rawAudit?.approvedAt       ?? null,
    rejectedBy:       rawAudit?.rejectedBy       ?? null,
    rejectedAt:       rawAudit?.rejectedAt       ?? null,
    rejectReason:     rawAudit?.rejectReason     ?? null,
    lastModifiedBy:   rawAudit?.lastModifiedBy   ?? null,
    lastModifiedAt:   rawAudit?.lastModifiedAt   ?? null
});

/**
 * @param {string|null} rejectReason
 * @returns {string}
 */
export const formatRejectReasonDisplay = (rejectReason) => {
    if (!rejectReason) return "—";
    const [id, note] = rejectReason.split(":");
    return note ? `${id} — ${note}` : id;
};
