/**
 * Package inference from payment totals.
 * Booking module does not persist packageId — derived at read time.
 */

/** @type {Readonly<Record<number, string>>} */
export const PACKAGE_BY_TOTAL = Object.freeze({
    300000: "Paket 1 - Basic",
    490000: "Paket 2 - Premium",
    999000: "Paket 3 - VIP"
});

/**
 * @param {number} totalPrice
 * @returns {string}
 */
export const inferPackageName = (totalPrice) => {
    return PACKAGE_BY_TOTAL[totalPrice] || "—";
};
