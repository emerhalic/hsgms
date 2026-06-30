/**
 * Predefined reject reasons for booking verification.
 */

/** @typedef {{ id: string, label: string }} RejectReasonOption */

/** @type {readonly RejectReasonOption[]} */
export const REJECT_REASONS = Object.freeze([
    { id: "photo_blurry",       label: "Photo Blurry" },
    { id: "wrong_amount",       label: "Wrong Amount" },
    { id: "transfer_not_found", label: "Transfer Not Found" },
    { id: "duplicate_payment",  label: "Duplicate Payment" },
    { id: "fake_proof",         label: "Fake Proof" },
    { id: "other",              label: "Other" }
]);

/** @constant {string} */
export const REJECT_REASON_OTHER = "other";

/**
 * @param {string} reasonId
 * @returns {string}
 */
export const getRejectReasonLabel = (reasonId) => {
    const found = REJECT_REASONS.find((r) => r.id === reasonId);
    return found ? found.label : reasonId || "—";
};
