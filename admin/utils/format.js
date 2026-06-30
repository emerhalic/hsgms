/**
 * @param {number|null|undefined} timestamp
 * @returns {string}
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "short", year: "numeric"
    }).format(new Date(timestamp));
};

/**
 * @param {number|null|undefined} timestamp
 * @returns {string}
 */
export const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    }).format(new Date(timestamp));
};

/**
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR",
        minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
};

/**
 * @returns {{ startOfToday: number, startOfWeek: number, startOfMonth: number }}
 */
export const getPeriodBoundaries = () => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
        startOfToday: startOfToday.getTime(),
        startOfWeek:  startOfWeek.getTime(),
        startOfMonth: startOfMonth.getTime()
    };
};
