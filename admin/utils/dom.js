/**
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = (str) => {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
};

/**
 * @param {HTMLElement|null} container
 * @param {string} html
 */
export const setSafeHtml = (container, html) => {
    if (!container) return;
    container.innerHTML = html;
};
