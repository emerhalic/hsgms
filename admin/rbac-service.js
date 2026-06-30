/**
 * Admin user profile & role resolution from Firebase Realtime Database.
 */

import { database } from "../js/firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { ROLES, isValidRole } from "./constants/rbac.js";
import * as logger from "./logger/index.js";

/** @constant {string} */
const ADMIN_USERS_NODE = "adminUsers";

/**
 * @typedef {Object} AdminProfile
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {string} role
 * @property {number|null} createdAt
 * @property {number|null} updatedAt
 */

/**
 * @param {string} uid
 * @returns {Promise<AdminProfile|null>}
 */
export const fetchAdminProfile = async (uid) => {
    if (!uid) return null;

    try {
        const snap = await get(ref(database, `${ADMIN_USERS_NODE}/${uid}`));
        if (!snap.exists()) return null;

        const data = snap.val();
        const role = isValidRole(data?.role) ? data.role : null;

        if (!role) {
            logger.warn("RBAC", `Invalid role for uid ${uid}`);
            return null;
        }

        return {
            uid,
            email:       data.email       ?? "",
            displayName: data.displayName ?? data.email ?? "",
            role,
            createdAt:   data.createdAt   ?? null,
            updatedAt:   data.updatedAt   ?? null
        };
    } catch (err) {
        logger.error("RBAC", "Failed to fetch admin profile", err);
        throw new Error("Gagal memuat profil admin.");
    }
};

/**
 * Seeds default owner profile structure (for documentation / manual setup).
 * @param {string} uid
 * @param {string} email
 * @param {string} displayName
 * @returns {Object}
 */
export const buildOwnerProfileSeed = (uid, email, displayName) => ({
    email,
    displayName,
    role: ROLES.OWNER,
    createdAt: Date.now(),
    updatedAt: Date.now()
});
