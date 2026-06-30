/**
 * Transfer proof viewer with skeleton, retry, and fallback.
 */

import { escapeHtml } from "../utils/dom.js";
import { getDriveViewUrl, getDrivePreviewUrl } from "../utils/drive.js";

/**
 * Mounts proof viewer into container.
 * @param {HTMLElement} container
 * @param {string|null} proofUrl
 */
export const mountProofViewer = (container, proofUrl) => {
    if (!container) return;

    if (!proofUrl) {
        container.innerHTML = `<p class="adm-detail__empty-proof">Bukti transfer belum tersedia.</p>`;
        return;
    }

    const viewUrl    = getDriveViewUrl(proofUrl);
    const previewUrl = getDrivePreviewUrl(proofUrl);

    container.innerHTML = `
        <div class="adm-proof" data-proof-url="${escapeHtml(proofUrl)}">
            <div class="adm-proof__preview">
                <div class="adm-proof__skeleton" aria-hidden="true"></div>
                <img
                    src="${escapeHtml(previewUrl)}"
                    alt="Bukti transfer"
                    class="adm-proof__image"
                    loading="lazy"
                    hidden
                />
                <div class="adm-proof__fallback" hidden>
                    <span class="adm-proof__fallback-icon" aria-hidden="true">📄</span>
                    <p>Preview tidak tersedia</p>
                    <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm adm-proof__retry">Coba Lagi</button>
                </div>
            </div>
            <div class="adm-proof__actions">
                <a href="${escapeHtml(viewUrl)}" target="_blank" rel="noopener noreferrer"
                   class="adm-btn adm-btn--secondary adm-btn--sm" data-action="open-drive">
                    Buka di Google Drive ↗
                </a>
            </div>
        </div>
    `;

    const img       = container.querySelector(".adm-proof__image");
    const skeleton  = container.querySelector(".adm-proof__skeleton");
    const fallback  = container.querySelector(".adm-proof__fallback");
    const retryBtn  = container.querySelector(".adm-proof__retry");

    const loadImage = () => {
        if (!img) return;
        img.hidden = true;
        skeleton?.removeAttribute("hidden");
        fallback?.setAttribute("hidden", "");

        img.onload = () => {
            skeleton?.setAttribute("hidden", "");
            img.hidden = false;
        };

        img.onerror = () => {
            skeleton?.setAttribute("hidden", "");
            img.hidden = true;
            fallback?.removeAttribute("hidden");
        };

        const src = img.getAttribute("src");
        img.removeAttribute("src");
        img.setAttribute("src", src + (src.includes("?") ? "&" : "?") + "t=" + Date.now());
    };

    loadImage();

    retryBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        loadImage();
    });
};
