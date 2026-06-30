/**
 * Statistics cards renderer.
 */

import { formatCurrency } from "../utils/format.js";

/** @type {Record<string, HTMLElement|null>} */
let _els = {};

/**
 * @param {Object} map
 */
export const initStatsRenderer = (map) => {
    _els = map;
};

/**
 * @param {Object} stats
 */
export const renderStatistics = (stats) => {
    const map = {
        statTotal:              stats.total,
        statToday:              stats.today,
        statWeekly:             stats.weekly,
        statMonthly:            stats.monthly,
        statPending:            stats.pending,
        statVerified:           stats.verified,
        statRejected:           stats.rejected,
        statPendingPayment:     formatCurrency(stats.pendingPaymentValue),
        statVerifiedPayment:    formatCurrency(stats.verifiedPaymentValue),
        statRevenue:            formatCurrency(stats.totalRevenueEstimate)
    };

    for (const [id, value] of Object.entries(map)) {
        const el = _els[id] || document.getElementById(id);
        if (el) el.textContent = value;
    }
};
