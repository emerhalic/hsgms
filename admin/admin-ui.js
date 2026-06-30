/**
 * Admin Verification Dashboard — Presentation Layer.
 */

import {
    subscribe, getState, initAdminEngine, setFilter, setSearch, setSort,
    setPage, selectBooking, approveBooking, rejectBooking,
    clearError, retryLoad, setUserRole, canPerform,
    PERMISSIONS
} from "./admin.js";

import {
    subscribeAuth, initAuthEngine, logout, getAuthState, ROLE_LABELS
} from "./auth.js";

import { initStatsRenderer, renderStatistics } from "./ui/stats-renderer.js";
import { renderBookingsTable, renderPagination } from "./ui/table-renderer.js";
import { renderDetailPanel } from "./ui/detail-renderer.js";

import { debounce } from "./utils/debounce.js";
import { SEARCH_DEBOUNCE_MS } from "./constants/pagination.js";
import { initToastQueue, enqueueToast } from "./utils/toast-queue.js";
import { copyToClipboard, buildWhatsAppUrl } from "./utils/clipboard.js";
import { getDriveViewUrl } from "./utils/drive.js";
import { exportToCsv, exportToExcel, defaultBookingRowMapper } from "./utils/export.js";
import { REJECT_REASONS, REJECT_REASON_OTHER } from "./constants/reject-reasons.js";

/** @private */
let _pendingReject = null;

/** @private */
const _redirectToLogin = () => {
    window.location.href = "./login.html?return=admin.html";
};

/** @private */
const _renderFilterButtons = (activeFilter) => {
    document.querySelectorAll("[data-filter]").forEach((btn) => {
        const active = btn.dataset.filter === activeFilter;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
};

/** @private */
const _updateUserHeader = (authState) => {
    const nameEl = document.getElementById("userDisplayName");
    const roleEl = document.getElementById("userRoleBadge");
    const logoutBtn = document.getElementById("btnLogout");

    if (nameEl && authState.profile) {
        nameEl.textContent = authState.profile.displayName || authState.profile.email;
    }
    if (roleEl && authState.profile) {
        roleEl.textContent = ROLE_LABELS[authState.profile.role] || authState.profile.role;
    }
    if (logoutBtn) {
        logoutBtn.hidden = !authState.isAuthenticated;
    }
};

/** @private */
const _render = (adminState) => {
    renderStatistics(adminState.statistics);
    _renderFilterButtons(adminState.filter);

    renderBookingsTable({
        tbody: document.getElementById("bookingsTbody"),
        bookings: adminState.paginatedBookings,
        selectedId: adminState.selectedBooking?.bookingId ?? null,
        viewState: adminState.viewState,
        canFn: canPerform
    });

    renderPagination(adminState.pagination);

    renderDetailPanel({
        detailEmpty: document.getElementById("detailEmpty"),
        detailContent: document.getElementById("detailContent"),
        booking: adminState.selectedBooking,
        isUpdating: adminState.isUpdating,
        canFn: canPerform
    });

    if (adminState.lastError) {
        enqueueToast(adminState.lastError, "error");
        clearError();
    }

};

/** @private */
const _openRejectModal = (bookingId, fullName) => {
    _pendingReject = { bookingId, fullName };
    const modal = document.getElementById("rejectModal");
    const msg = document.getElementById("rejectModalMsg");
    const reasonsEl = document.getElementById("rejectReasons");
    const otherWrap = document.getElementById("rejectOtherWrap");
    const otherInput = document.getElementById("rejectOtherInput");

    if (msg) {
        msg.textContent = `Tolak booking milik "${fullName}"? Pilih alasan penolakan.`;
    }

    if (reasonsEl) {
        reasonsEl.innerHTML = REJECT_REASONS.map((r) => `
            <label class="adm-reason-option">
                <input type="radio" name="rejectReason" value="${r.id}" ${r.id === REJECT_REASONS[0].id ? "checked" : ""} />
                <span>${r.label}</span>
            </label>
        `).join("");
    }

    if (otherWrap) otherWrap.hidden = true;
    if (otherInput) otherInput.value = "";

    if (modal) {
        modal.hidden = false;
        modal.classList.add("is-open");
        document.getElementById("btnRejectConfirm")?.focus();
    }
};

/** @private */
const _closeRejectModal = () => {
    _pendingReject = null;
    const modal = document.getElementById("rejectModal");
    if (modal) {
        modal.hidden = true;
        modal.classList.remove("is-open");
    }
};

/** @private */
const _getSelectedRejectReason = () => {
    const selected = document.querySelector('input[name="rejectReason"]:checked');
    const reasonId = selected?.value || REJECT_REASONS[0].id;
    const otherNote = document.getElementById("rejectOtherInput")?.value?.trim() || "";
    return { reasonId, reasonNote: reasonId === REJECT_REASON_OTHER ? otherNote : "" };
};

/** @private */
const _handleApprove = async (bookingId) => {
    try {
        await approveBooking(bookingId);
        enqueueToast("Booking berhasil diverifikasi.", "success");
    } catch (err) {
        enqueueToast(err.message || "Gagal memverifikasi booking.", "error");
    }
};

/** @private */
const _handleRejectConfirm = async () => {
    if (!_pendingReject) return;

    const { reasonId, reasonNote } = _getSelectedRejectReason();

    if (reasonId === REJECT_REASON_OTHER && !reasonNote) {
        enqueueToast("Harap isi alasan penolakan.", "error");
        return;
    }

    const { bookingId } = _pendingReject;
    _closeRejectModal();

    try {
        await rejectBooking(bookingId, reasonId, reasonNote);
        enqueueToast("Booking ditolak.", "success");
    } catch (err) {
        enqueueToast(err.message || "Gagal menolak booking.", "error");
    }
};

/** @private */
const _handleQuickAction = async (action, el) => {
    try {
        switch (action) {
            case "copy-id":
            case "copy-phone":
            case "copy-drive":
                await copyToClipboard(el.dataset.value);
                enqueueToast("Disalin ke clipboard.", "success");
                break;
            case "whatsapp": {
                const url = buildWhatsAppUrl(el.dataset.phone);
                if (url) window.open(url, "_blank", "noopener,noreferrer");
                else enqueueToast("Nomor telepon tidak valid.", "error");
                break;
            }
            case "open-drive": {
                const url = getDriveViewUrl(el.dataset.url);
                if (url) window.open(url, "_blank", "noopener,noreferrer");
                break;
            }
            case "print":
                window.print();
                break;
        }
    } catch (err) {
        enqueueToast(err.message || "Aksi gagal.", "error");
    }
};

/** @private */
const _handleExport = (format) => {
    if (!canPerform(PERMISSIONS.BOOKING_EXPORT)) {
        enqueueToast("Anda tidak memiliki izin export.", "error");
        return;
    }

    const { filteredBookings } = getState();
    if (!filteredBookings.length) {
        enqueueToast("Tidak ada data untuk diekspor.", "error");
        return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    try {
        if (format === "csv") {
            exportToCsv(filteredBookings, defaultBookingRowMapper, `hsgms-bookings-${stamp}.csv`);
        } else {
            exportToExcel(filteredBookings, defaultBookingRowMapper, `hsgms-bookings-${stamp}.xls`);
        }
        enqueueToast(`Export ${format.toUpperCase()} berhasil.`, "success");
    } catch (err) {
        enqueueToast(err.message, "error");
    }
};

/** @private */
const _bindEvents = () => {
    const debouncedSearch = debounce((value) => setSearch(value), SEARCH_DEBOUNCE_MS);

    document.getElementById("searchInput")?.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
    });

    document.getElementById("sortSelect")?.addEventListener("change", (e) => {
        setSort(e.target.value);
    });

    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", () => setFilter(btn.dataset.filter));
    });

    document.getElementById("bookingsTbody")?.addEventListener("click", (e) => {
        const approveBtn = e.target.closest("[data-action='approve']");
        if (approveBtn) {
            e.stopPropagation();
            _handleApprove(approveBtn.dataset.id);
            return;
        }

        const viewBtn = e.target.closest("[data-action='view']");
        if (viewBtn) {
            e.stopPropagation();
            selectBooking(viewBtn.dataset.id);
            return;
        }

        const row = e.target.closest("tr[data-booking-id]");
        if (row) selectBooking(row.dataset.bookingId);
    });

    document.getElementById("bookingsTbody")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const row = e.target.closest("tr[data-booking-id]");
            if (row) {
                e.preventDefault();
                selectBooking(row.dataset.bookingId);
            }
        }
    });

    document.getElementById("detailPanel")?.addEventListener("click", (e) => {
        const approveBtn = e.target.closest(".adm-btn-approve");
        if (approveBtn) { _handleApprove(approveBtn.dataset.id); return; }

        const rejectBtn = e.target.closest(".adm-btn-reject");
        if (rejectBtn) { _openRejectModal(rejectBtn.dataset.id, rejectBtn.dataset.name); return; }

        const actionBtn = e.target.closest("[data-action]");
        if (actionBtn) {
            _handleQuickAction(actionBtn.dataset.action, actionBtn);
        }
    });

    document.getElementById("btnRejectConfirm")?.addEventListener("click", _handleRejectConfirm);
    document.getElementById("btnRejectCancel")?.addEventListener("click", _closeRejectModal);

    document.getElementById("rejectModal")?.addEventListener("click", (e) => {
        if (e.target.id === "rejectModal" || e.target.classList.contains("adm-modal__backdrop")) {
            _closeRejectModal();
        }
    });

    document.getElementById("rejectReasons")?.addEventListener("change", (e) => {
        if (e.target.name === "rejectReason") {
            const otherWrap = document.getElementById("rejectOtherWrap");
            if (otherWrap) otherWrap.hidden = e.target.value !== REJECT_REASON_OTHER;
        }
    });

    document.getElementById("btnPagePrev")?.addEventListener("click", () => {
        setPage(getState().pagination.currentPage - 1);
    });

    document.getElementById("btnPageNext")?.addEventListener("click", () => {
        setPage(getState().pagination.currentPage + 1);
    });

    document.getElementById("btnRetry")?.addEventListener("click", () => retryLoad());
    document.getElementById("btnRetryOffline")?.addEventListener("click", () => retryLoad());
    document.getElementById("btnExportCsv")?.addEventListener("click", () => _handleExport("csv"));
    document.getElementById("btnExportExcel")?.addEventListener("click", () => _handleExport("xls"));
    document.getElementById("btnLogout")?.addEventListener("click", async () => {
        await logout();
        _redirectToLogin();
    });

    document.getElementById("menuToggle")?.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.toggle("is-open");
    });

    document.addEventListener("keydown", (e) => {
        const modal = document.getElementById("rejectModal");
        if (!modal?.classList.contains("is-open")) return;

        if (e.key === "Escape") _closeRejectModal();
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
            _handleRejectConfirm();
        }
    });
};

/** @private */
const _bootstrapDashboard = () => {
    initStatsRenderer({});
    initToastQueue(document.getElementById("toastContainer"));
    _bindEvents();
    initAdminEngine();
    subscribe(_render);
};

/** @private */
const initAdminUI = () => {
    initAuthEngine();

    subscribeAuth((authState) => {
        _updateUserHeader(authState);

        if (authState.isLoading) return;

        if (!authState.isAuthenticated) {
            _redirectToLogin();
            return;
        }

        if (authState.error) {
            enqueueToast(authState.error, "error");
            _redirectToLogin();
            return;
        }

        setUserRole(authState.profile?.role ?? null);

        if (!window.__HSGMS_ADMIN_BOOTED) {
            window.__HSGMS_ADMIN_BOOTED = true;
            _bootstrapDashboard();
        }
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminUI);
} else {
    initAdminUI();
}
