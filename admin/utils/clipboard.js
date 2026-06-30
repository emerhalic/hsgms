/**
 * @param {string} text
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
    if (!text) throw new Error("Tidak ada teks untuk disalin.");

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
};

/**
 * @param {string|null} phone
 * @returns {string|null}
 */
export const buildWhatsAppUrl = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    const normalized = digits.startsWith("62") ? digits : `62${digits.replace(/^0/, "")}`;
    return `https://wa.me/${normalized}`;
};
