/**
 * Toast queue — never stacks multiple toasts simultaneously.
 */

/** @type {Array<{ message: string, type: string }>} */
const _queue = [];

/** @type {boolean} */
let _isShowing = false;

/** @type {HTMLElement|null} */
let _container = null;

/** @type {number} */
const DISPLAY_MS = 3500;

/**
 * @param {HTMLElement} container
 */
export const initToastQueue = (container) => {
    _container = container;
};

/**
 * @param {string} message
 * @param {"success"|"error"|"info"} [type]
 */
export const enqueueToast = (message, type = "info") => {
    _queue.push({ message, type });
    _processNext();
};

const _processNext = () => {
    if (_isShowing || !_container || _queue.length === 0) return;

    _isShowing = true;
    const { message, type } = _queue.shift();

    const toast = document.createElement("div");
    toast.className = `adm-toast adm-toast--${type}`;
    toast.setAttribute("role", "status");
    toast.textContent = message;
    _container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    setTimeout(() => {
        toast.classList.remove("is-visible");
        setTimeout(() => {
            toast.remove();
            _isShowing = false;
            _processNext();
        }, 300);
    }, DISPLAY_MS);
};
