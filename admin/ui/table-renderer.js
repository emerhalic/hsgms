/**
 * Bookings table renderer with DocumentFragment batching.
 */

import { formatDate, formatCurrency } from "../utils/format.js";
import { getStatusBadgeMeta } from "../constants/status.js";
import { escapeHtml } from "../utils/dom.js";
import { BOOKING_STATUS } from "../constants/status.js";
import { PERMISSIONS } from "../constants/rbac.js";

/**
 * @param {Object} booking
 * @param {string|null} selectedId
 * @param {Function} canFn
 * @returns {HTMLTableRowElement}
 */
const buildRow = (booking, selectedId, canFn) => {
    const tr = document.createElement("tr");
    tr.dataset.bookingId = booking.bookingId;
    tr.className = "adm-table__row";
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", `Lihat detail booking ${booking.identity.fullName}`);

    if (booking.bookingId === selectedId) tr.classList.add("is-selected");

    const badge = getStatusBadgeMeta(booking.normalizedStatus);
    const canApprove = canFn(PERMISSIONS.BOOKING_APPROVE);
    const isPending = booking.normalizedStatus === BOOKING_STATUS.WAITING_APPROVAL;

    tr.innerHTML = `
        <td class="adm-table__cell">${formatDate(booking.createdAt)}</td>
        <td class="adm-table__cell adm-table__cell--name">${escapeHtml(booking.identity.fullName)}</td>
        <td class="adm-table__cell">${escapeHtml(booking.identity.phoneNumber)}</td>
        <td class="adm-table__cell">${escapeHtml(booking.identity.universityName)}</td>
        <td class="adm-table__cell">${escapeHtml(booking.identity.studyProgram)}</td>
        <td class="adm-table__cell">${escapeHtml(booking.packageName)}</td>
        <td class="adm-table__cell adm-table__cell--num">${formatCurrency(booking.payment.dpAmount)}</td>
        <td class="adm-table__cell adm-table__cell--num">${formatCurrency(booking.payment.remainingBalance)}</td>
        <td class="adm-table__cell"><span class="adm-badge adm-badge--${badge.modifier}">${badge.label}</span></td>
        <td class="adm-table__cell adm-table__cell--actions">
            <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="view" data-id="${escapeHtml(booking.bookingId)}" aria-label="Lihat detail ${escapeHtml(booking.identity.fullName)}">Detail</button>
            ${isPending && canApprove ? `<button type="button" class="adm-btn adm-btn--success adm-btn--sm" data-action="approve" data-id="${escapeHtml(booking.bookingId)}" aria-label="Approve ${escapeHtml(booking.identity.fullName)}">✓</button>` : ""}
        </td>
    `;

    return tr;
};

/**
 * @param {Object} params
 */
export const renderBookingsTable = ({
    tbody,
    bookings,
    selectedId,
    viewState,
    canFn
}) => {
    if (!tbody) return;

    const loadingEl = document.getElementById("tableLoading");
    const emptyEl   = document.getElementById("tableEmpty");
    const errorEl   = document.getElementById("tableError");
    const offlineEl = document.getElementById("tableOffline");

    [loadingEl, emptyEl, errorEl, offlineEl].forEach((el) => {
        if (el) el.hidden = true;
    });

    if (viewState === "loading") {
        if (loadingEl) loadingEl.hidden = false;
        tbody.innerHTML = "";
        return;
    }

    if (viewState === "offline") {
        if (offlineEl) offlineEl.hidden = false;
        tbody.innerHTML = "";
        return;
    }

    if (viewState === "network_error" || viewState === "firebase_error") {
        if (errorEl) errorEl.hidden = false;
        tbody.innerHTML = "";
        return;
    }

    if (!bookings.length) {
        if (emptyEl) emptyEl.hidden = false;
        tbody.innerHTML = "";
        return;
    }

    const fragment = document.createDocumentFragment();
    for (const booking of bookings) {
        fragment.appendChild(buildRow(booking, selectedId, canFn));
    }

    tbody.innerHTML = "";
    tbody.appendChild(fragment);
};

/**
 * @param {Object} pagination
 */
export const renderPagination = (pagination) => {
    const info = document.getElementById("paginationInfo");
    const prev = document.getElementById("btnPagePrev");
    const next = document.getElementById("btnPageNext");
    const pageLabel = document.getElementById("paginationPage");

    if (info) {
        info.textContent = pagination.totalItems === 0
            ? "Tidak ada data"
            : `Menampilkan ${pagination.rangeStart}–${pagination.rangeEnd} dari ${pagination.totalItems}`;
    }

    if (pageLabel) {
        pageLabel.textContent = `Halaman ${pagination.currentPage} / ${pagination.totalPages}`;
    }

    if (prev) prev.disabled = !pagination.hasPrev;
    if (next) next.disabled = !pagination.hasNext;
};
