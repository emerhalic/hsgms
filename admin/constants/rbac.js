/**
 * Extensible Role-Based Access Control for HSGMS Admin.
 * Permissions are data-driven — never hardcode role checks in UI logic.
 */

/** @enum {string} */
export const ROLES = Object.freeze({
    OWNER:   "owner",
    ADMIN:   "admin",
    CASHIER: "cashier",
    EDITOR:  "editor"
});

/** @enum {string} */
export const PERMISSIONS = Object.freeze({
    BOOKING_READ:    "booking:read",
    BOOKING_APPROVE: "booking:approve",
    BOOKING_REJECT:  "booking:reject",
    BOOKING_EXPORT:  "booking:export",
    BOOKING_PRINT:   "booking:print",
    ADMIN_MANAGE:    "admin:manage"
});

/**
 * Role → permission matrix.
 * Extend by adding permissions or roles without changing consumer code.
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const ROLE_PERMISSIONS = Object.freeze({
    [ROLES.OWNER]: Object.freeze([
        PERMISSIONS.BOOKING_READ,
        PERMISSIONS.BOOKING_APPROVE,
        PERMISSIONS.BOOKING_REJECT,
        PERMISSIONS.BOOKING_EXPORT,
        PERMISSIONS.BOOKING_PRINT,
        PERMISSIONS.ADMIN_MANAGE
    ]),
    [ROLES.ADMIN]: Object.freeze([
        PERMISSIONS.BOOKING_READ,
        PERMISSIONS.BOOKING_APPROVE,
        PERMISSIONS.BOOKING_REJECT,
        PERMISSIONS.BOOKING_EXPORT,
        PERMISSIONS.BOOKING_PRINT
    ]),
    [ROLES.CASHIER]: Object.freeze([
        PERMISSIONS.BOOKING_READ,
        PERMISSIONS.BOOKING_EXPORT,
        PERMISSIONS.BOOKING_PRINT
    ]),
    [ROLES.EDITOR]: Object.freeze([
        PERMISSIONS.BOOKING_READ,
        PERMISSIONS.BOOKING_EXPORT,
        PERMISSIONS.BOOKING_PRINT
    ])
});

/** Display labels for roles. */
export const ROLE_LABELS = Object.freeze({
    [ROLES.OWNER]:   "Owner",
    [ROLES.ADMIN]:   "Admin",
    [ROLES.CASHIER]: "Cashier",
    [ROLES.EDITOR]:  "Editor"
});

/**
 * @param {string|null|undefined} role
 * @returns {boolean}
 */
export const isValidRole = (role) => {
    return Boolean(role && Object.values(ROLES).includes(role));
};

/**
 * @param {string|null|undefined} role
 * @param {string} permission
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
    if (!isValidRole(role)) return false;
    const perms = ROLE_PERMISSIONS[role];
    return Array.isArray(perms) && perms.includes(permission);
};

/**
 * @param {string|null|undefined} role
 * @returns {readonly string[]}
 */
export const getPermissionsForRole = (role) => {
    if (!isValidRole(role)) return [];
    return ROLE_PERMISSIONS[role] || [];
};
