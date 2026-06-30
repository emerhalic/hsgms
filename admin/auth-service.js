/**
 * Firebase Authentication service for HSGMS Admin.
 * No DOM. No state.
 */

import { auth } from "../js/firebase-config.js";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/** @type {GoogleAuthProvider} */
const googleProvider = new GoogleAuthProvider();

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
    if (!email?.trim() || !password) {
        throw new Error("Email dan password wajib diisi.");
    }
    try {
        return await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
        throw new Error(_mapAuthError(err));
    }
};

/**
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signInWithGoogle = async () => {
    try {
        return await signInWithPopup(auth, googleProvider);
    } catch (err) {
        if (err?.code === "auth/popup-closed-by-user") {
            throw new Error("Login Google dibatalkan.");
        }
        throw new Error(_mapAuthError(err));
    }
};

/**
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
    await signOut(auth);
};

/**
 * @param {Function} callback
 * @returns {Function} Unsubscribe
 */
export const subscribeAuthState = (callback) => {
    return onAuthStateChanged(auth, callback, (err) => {
        callback(null);
        throw new Error(_mapAuthError(err));
    });
};

/**
 * @returns {import("firebase/auth").User|null}
 */
export const getCurrentUser = () => auth.currentUser;

/**
 * @param {Error & { code?: string }} err
 * @returns {string}
 * @private
 */
const _mapAuthError = (err) => {
    const code = err?.code || "";
    const map = {
        "auth/invalid-email":        "Format email tidak valid.",
        "auth/user-disabled":        "Akun dinonaktifkan. Hubungi administrator.",
        "auth/user-not-found":       "Email atau password salah.",
        "auth/wrong-password":       "Email atau password salah.",
        "auth/invalid-credential":   "Email atau password salah.",
        "auth/too-many-requests":    "Terlalu banyak percobaan. Coba lagi nanti.",
        "auth/network-request-failed": "Koneksi gagal. Periksa jaringan Anda.",
        "auth/popup-blocked":          "Popup diblokir browser. Izinkan popup untuk login Google."
    };
    return map[code] || err?.message || "Autentikasi gagal.";
};
