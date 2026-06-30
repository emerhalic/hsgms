/**
 * Admin login presentation layer.
 */

import { initAuthEngine, subscribeAuth, loginWithEmail, loginWithGoogle } from "./auth.js";
import { initToastQueue, enqueueToast } from "./utils/toast-queue.js";

/** @private */
const _getReturnUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const ret = params.get("return");
    if (ret && !ret.includes("login.html")) {
        return ret.endsWith("admin.html") ? "./admin.html" : `./${ret.replace(/^\//, "")}`;
    }
    return "./admin.html";
};

/** @private */
const _setLoading = (loading) => {
    document.getElementById("btnEmailLogin").disabled = loading;
    document.getElementById("btnGoogleLogin").disabled = loading;
};

/** @private */
const _showError = (msg) => {
    const el = document.getElementById("loginError");
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
};

const initLoginUI = () => {
    initToastQueue(document.getElementById("toastContainer"));
    initAuthEngine();

    subscribeAuth((authState) => {
        if (authState.isLoading) return;

        if (authState.isAuthenticated) {
            window.location.href = _getReturnUrl();
            return;
        }

        if (authState.error) {
            _showError(authState.error);
        }
    });

    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        _showError("");

        const email = document.getElementById("loginEmail")?.value;
        const password = document.getElementById("loginPassword")?.value;

        _setLoading(true);
        try {
            await loginWithEmail(email, password);
        } catch (err) {
            _showError(err.message);
            enqueueToast(err.message, "error");
        } finally {
            _setLoading(false);
        }
    });

    document.getElementById("btnGoogleLogin")?.addEventListener("click", async () => {
        _showError("");
        _setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            _showError(err.message);
            enqueueToast(err.message, "error");
        } finally {
            _setLoading(false);
        }
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginUI);
} else {
    initLoginUI();
}
