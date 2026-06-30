/**
 * Booking detail panel renderer.
 */

import { formatDateTime, formatCurrency } from "../utils/format.js";
import { getStatusBadgeMeta } from "../constants/status.js";
import { escapeHtml } from "../utils/dom.js";
import { formatRejectReasonDisplay } from "../audit-service.js";
import { BOOKING_STATUS } from "../constants/status.js";
import { PERMISSIONS } from "../constants/rbac.js";
import { mountProofViewer } from "./proof-viewer.js";

/**
 * @param {Object} params
 */
export const renderDetailPanel = ({
    detailEmpty,
    detailContent,
    booking,
    isUpdating,
    canFn
}) => {
    if (!detailContent || !detailEmpty) return;

    if (!booking) {
        detailContent.hidden = true;
        detailEmpty.hidden = false;
        return;
    }

    detailEmpty.hidden = true;
    detailContent.hidden = false;

    const badge = getStatusBadgeMeta(booking.normalizedStatus);
    const isPending = booking.normalizedStatus === BOOKING_STATUS.WAITING_APPROVAL;
    const canApprove = canFn(PERMISSIONS.BOOKING_APPROVE);
    const canReject  = canFn(PERMISSIONS.BOOKING_REJECT);
    const canPrint   = canFn(PERMISSIONS.BOOKING_PRINT);
    const audit = booking.audit || {};

    detailContent.innerHTML = `
        <div class="adm-detail__header" id="printArea">
            <h3 class="adm-detail__title">${escapeHtml(booking.identity.fullName)}</h3>
            <span class="adm-badge adm-badge--${badge.modifier}">${badge.label}</span>
        </div>

        <div class="adm-detail__quick-actions no-print">
            <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="copy-id" data-value="${escapeHtml(booking.bookingId)}" aria-label="Salin Booking ID">📋 ID</button>
            <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="copy-phone" data-value="${escapeHtml(booking.identity.phoneNumber)}" aria-label="Salin nomor telepon">📞 Phone</button>
            ${booking.payment.transferProofUrl ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="copy-drive" data-value="${escapeHtml(booking.payment.transferProofUrl)}" aria-label="Salin URL Google Drive">🔗 Drive</button>` : ""}
            <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="whatsapp" data-phone="${escapeHtml(booking.identity.phoneNumber)}" aria-label="Buka WhatsApp">💬 WA</button>
            ${booking.payment.transferProofUrl ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="open-drive" data-url="${escapeHtml(booking.payment.transferProofUrl)}" aria-label="Buka Google Drive">📁 Drive</button>` : ""}
            ${canPrint ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-action="print" aria-label="Cetak detail booking">🖨 Print</button>` : ""}
        </div>

        <p class="adm-detail__meta">
            <span class="adm-detail__meta-label">Booking ID</span>
            <code class="adm-detail__code">${escapeHtml(booking.bookingId)}</code>
        </p>

        <section class="adm-detail__section">
            <h4 class="adm-detail__section-title">Identitas</h4>
            <dl class="adm-detail__list">
                <div class="adm-detail__item"><dt>Nama Lengkap</dt><dd>${escapeHtml(booking.identity.fullName)}</dd></div>
                <div class="adm-detail__item"><dt>Nomor WhatsApp</dt><dd>${escapeHtml(booking.identity.phoneNumber)}</dd></div>
                <div class="adm-detail__item"><dt>Universitas</dt><dd>${escapeHtml(booking.identity.universityName)}</dd></div>
                <div class="adm-detail__item"><dt>Fakultas</dt><dd>${escapeHtml(booking.identity.facultyName)}</dd></div>
                <div class="adm-detail__item"><dt>Program Studi</dt><dd>${escapeHtml(booking.identity.studyProgram)}</dd></div>
                <div class="adm-detail__item"><dt>Tanggal Wisuda</dt><dd>${escapeHtml(booking.identity.graduationDate || "—")}</dd></div>
                <div class="adm-detail__item"><dt>Catatan</dt><dd>${escapeHtml(booking.identity.notes || "—")}</dd></div>
            </dl>
        </section>

        <section class="adm-detail__section">
            <h4 class="adm-detail__section-title">Pembayaran</h4>
            <dl class="adm-detail__list">
                <div class="adm-detail__item"><dt>Paket</dt><dd>${escapeHtml(booking.packageName)}</dd></div>
                <div class="adm-detail__item"><dt>DP Dibayar</dt><dd>${formatCurrency(booking.payment.dpAmount)}</dd></div>
                <div class="adm-detail__item"><dt>Sisa Pembayaran</dt><dd>${formatCurrency(booking.payment.remainingBalance)}</dd></div>
                <div class="adm-detail__item"><dt>Metode</dt><dd>${escapeHtml(booking.payment.paymentMethod || "—")}</dd></div>
            </dl>
        </section>

        <section class="adm-detail__section">
            <h4 class="adm-detail__section-title">Bukti Transfer</h4>
            <div id="proofViewerMount"></div>
        </section>

        <section class="adm-detail__section">
            <h4 class="adm-detail__section-title">Audit Log</h4>
            <dl class="adm-detail__list">
                <div class="adm-detail__item"><dt>Approved By</dt><dd>${escapeHtml(audit.approvedBy || "—")}</dd></div>
                <div class="adm-detail__item"><dt>Approved At</dt><dd>${formatDateTime(audit.approvedAt)}</dd></div>
                <div class="adm-detail__item"><dt>Rejected By</dt><dd>${escapeHtml(audit.rejectedBy || "—")}</dd></div>
                <div class="adm-detail__item"><dt>Rejected At</dt><dd>${formatDateTime(audit.rejectedAt)}</dd></div>
                <div class="adm-detail__item"><dt>Reject Reason</dt><dd>${escapeHtml(formatRejectReasonDisplay(audit.rejectReason))}</dd></div>
                <div class="adm-detail__item"><dt>Last Modified By</dt><dd>${escapeHtml(audit.lastModifiedBy || "—")}</dd></div>
                <div class="adm-detail__item"><dt>Last Modified At</dt><dd>${formatDateTime(audit.lastModifiedAt)}</dd></div>
            </dl>
        </section>

        <section class="adm-detail__section">
            <h4 class="adm-detail__section-title">Waktu Booking</h4>
            <dl class="adm-detail__list">
                <div class="adm-detail__item"><dt>Dibuat</dt><dd>${formatDateTime(booking.createdAt)}</dd></div>
                <div class="adm-detail__item"><dt>Diperbarui</dt><dd>${formatDateTime(booking.updatedAt)}</dd></div>
            </dl>
        </section>

        ${isPending && (canApprove || canReject) ? `
            <div class="adm-detail__actions no-print">
                ${canApprove ? `<button type="button" class="adm-btn adm-btn--success adm-btn-approve" data-id="${escapeHtml(booking.bookingId)}" ${isUpdating ? "disabled" : ""} aria-label="Approve booking">${isUpdating ? "Memproses..." : "✓ Approve"}</button>` : ""}
                ${canReject ? `<button type="button" class="adm-btn adm-btn--danger adm-btn-reject" data-id="${escapeHtml(booking.bookingId)}" data-name="${escapeHtml(booking.identity.fullName)}" ${isUpdating ? "disabled" : ""} aria-label="Reject booking">✕ Reject</button>` : ""}
            </div>
        ` : ""}
    `;

    mountProofViewer(detailContent.querySelector("#proofViewerMount"), booking.payment.transferProofUrl);
};
