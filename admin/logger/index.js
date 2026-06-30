/**
 * HSGMS Admin Logger — structured, level-based logging.
 * Disabled in production unless debug flag is set.
 */

const LOG_LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3 });

/** @type {number} */
let _minLevel = LOG_LEVELS.warn;

/** @param {"debug"|"info"|"warn"|"error"} level */
const _shouldLog = (level) => LOG_LEVELS[level] >= _minLevel;

/**
 * Enable verbose logging (development).
 */
export const enableDebug = () => {
    _minLevel = LOG_LEVELS.debug;
};

/**
 * @param {string} scope
 * @param {string} message
 * @param {unknown} [data]
 */
export const debug = (scope, message, data) => {
    if (_shouldLog("debug")) {
        /* eslint-disable no-console */
        if (data !== undefined) console.debug(`[HSGMS:${scope}] ${message}`, data);
        else console.debug(`[HSGMS:${scope}] ${message}`);
    }
};

/**
 * @param {string} scope
 * @param {string} message
 * @param {unknown} [data]
 */
export const info = (scope, message, data) => {
    if (_shouldLog("info")) {
        if (data !== undefined) console.info(`[HSGMS:${scope}] ${message}`, data);
        else console.info(`[HSGMS:${scope}] ${message}`);
    }
};

/**
 * @param {string} scope
 * @param {string} message
 * @param {unknown} [data]
 */
export const warn = (scope, message, data) => {
    if (_shouldLog("warn")) {
        if (data !== undefined) console.warn(`[HSGMS:${scope}] ${message}`, data);
        else console.warn(`[HSGMS:${scope}] ${message}`);
    }
};

/**
 * @param {string} scope
 * @param {string} message
 * @param {unknown} [data]
 */
export const error = (scope, message, data) => {
    if (_shouldLog("error")) {
        if (data !== undefined) console.error(`[HSGMS:${scope}] ${message}`, data);
        else console.error(`[HSGMS:${scope}] ${message}`);
    }
};
