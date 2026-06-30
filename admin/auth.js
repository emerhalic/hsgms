/**
 * Authentication state engine for HSGMS Admin.
 * Pub-Sub pattern — mirrors booking.js architecture.
 */

import {
    subscribeAuthState,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    getCurrentUser
} from "./auth-service.js";
import { fetchAdminProfile } from "./rbac-service.js";
import { hasPermission, PERMISSIONS, ROLE_LABELS } from "./constants/rbac.js";
import * as logger from "./logger/index.js";

/** @type {Set<Function>} */
const subscribers = new Set();

/** @type {ReturnType<typeof subscribeAuthState>|null} */
let _authUnsub = null;

/** @type {Object} */
let state = {
    user:        null,
    profile:     null,
    isLoading:   true,
    isAuthenticated: false,
    error:       null
};

const _notify = () => {
    const copy = getAuthState();
    subscribers.forEach((cb) => {
        try { cb(copy); } catch (e) { logger.error("Auth", "Subscriber error", e); }
    });
};

/**
 * @returns {Object}
 */
export const getAuthState = () => structuredClone(state);

/**
 * @param {Function} callback
 * @returns {Function}
 */
export const subscribeAuth = (callback) => {
    subscribers.add(callback);
    callback(getAuthState());
    return () => subscribers.delete(callback);
};

/**
 * @param {string} permission
 * @returns {boolean}
 */
export const can = (permission) => {
    return hasPermission(state.profile?.role, permission);
};

export { PERMISSIONS, ROLE_LABELS };

/**
 * Initializes auth state listener.
 */
export const initAuthEngine = () => {
    if (_authUnsub) return;

    _authUnsub = subscribeAuthState(async (user) => {
        state.isLoading = true;
        state.error = null;
        _notify();

        if (!user) {
            state.user = null;
            state.profile = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            _notify();
            return;
        }

        try {
            const profile = await fetchAdminProfile(user.uid);

            if (!profile) {
                await signOutUser();
                state.user = null;
                state.profile = null;
                state.isAuthenticated = false;
                state.error = "Akun tidak terdaftar sebagai admin HSGMS.";
            } else {
                state.user = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || profile.displayName
                };
                state.profile = profile;
                state.isAuthenticated = true;
            }
        } catch (err) {
            state.error = err.message;
            state.isAuthenticated = false;
        }

        state.isLoading = false;
        _notify();
    });
};

/**
 * @param {string} email
 * @param {string} password
 */
export const loginWithEmail = async (email, password) => {
    state.error = null;
    _notify();
    await signInWithEmail(email, password);
};

/**
 * Google OAuth login.
 */
export const loginWithGoogle = async () => {
    state.error = null;
    _notify();
    await signInWithGoogle();
};

/**
 * Signs out and clears state.
 */
export const logout = async () => {
    await signOutUser();
};

/**
 * @returns {Object|null}
 */
export const getActor = () => {
    if (!state.user || !state.profile) return null;
    return {
        uid: state.user.uid,
        email: state.user.email || state.profile.email,
        displayName: state.user.displayName || state.profile.displayName
    };
};

/**
 * Redirects to login if unauthenticated.
 * @param {string} [returnPath]
 */
export const requireAuth = (returnPath) => {
    const path = returnPath || window.location.pathname + window.location.search;
    if (!state.isAuthenticated && !state.isLoading) {
        window.location.href = `./login.html?return=${encodeURIComponent(path)}`;
    }
};

/**
 * @returns {import("firebase/auth").User|null}
 */
export const getFirebaseUser = () => getCurrentUser();
