/**
 * Network connectivity observer for admin dashboard.
 */

/** @type {Set<Function>} */
const _listeners = new Set();

/** @type {boolean} */
let _isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

/**
 * @returns {boolean}
 */
export const isOnline = () => _isOnline;

/**
 * @param {Function} callback
 * @returns {Function}
 */
export const subscribeConnectivity = (callback) => {
    _listeners.add(callback);
    callback(_isOnline);
    return () => _listeners.delete(callback);
};

const _notify = () => {
    _listeners.forEach((cb) => {
        try { cb(_isOnline); } catch { /* silent */ }
    });
};

if (typeof window !== "undefined") {
    window.addEventListener("online", () => { _isOnline = true; _notify(); });
    window.addEventListener("offline", () => { _isOnline = false; _notify(); });
}

/**
 * @param {Function} retryFn
 * @returns {Promise<void>}
 */
export const retryWhenOnline = async (retryFn) => {
    if (_isOnline) {
        await retryFn();
        return;
    }

    return new Promise((resolve, reject) => {
        const handler = async () => {
            window.removeEventListener("online", handler);
            try {
                await retryFn();
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        window.addEventListener("online", handler);
    });
};
