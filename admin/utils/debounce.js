/**
 * @param {Function} fn
 * @param {number} delayMs
 * @returns {Function}
 */
export const debounce = (fn, delayMs) => {
    /** @type {ReturnType<typeof setTimeout>|undefined} */
    let timer;

    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delayMs);
    };
};
