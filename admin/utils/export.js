/**
 * @param {Array<Object>} bookings
 * @param {Function} rowMapper
 * @returns {string}
 */
const _buildCsvContent = (bookings, rowMapper) => {
    const rows = bookings.map(rowMapper);
    if (!rows.length) return "";

    const headers = Object.keys(rows[0]);
    const escape = (val) => {
        const str = String(val ?? "");
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };

    const lines = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))
    ];

    return lines.join("\r\n");
};

/**
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
const _downloadBlob = (content, filename, mimeType) => {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

/**
 * @param {Array<Object>} bookings
 * @param {Function} rowMapper
 * @param {string} [filename]
 */
export const exportToCsv = (bookings, rowMapper, filename = "hsgms-bookings.csv") => {
    const csv = _buildCsvContent(bookings, rowMapper);
    if (!csv) throw new Error("Tidak ada data untuk diekspor.");
    _downloadBlob(csv, filename, "text/csv;charset=utf-8;");
};

/**
 * @param {Array<Object>} bookings
 * @param {Function} rowMapper
 * @param {string} [filename]
 */
export const exportToExcel = (bookings, rowMapper, filename = "hsgms-bookings.xls") => {
    const rows = bookings.map(rowMapper);
    if (!rows.length) throw new Error("Tidak ada data untuk diekspor.");

    const headers = Object.keys(rows[0]);
    const headerRow = headers.map((h) => `<th>${h}</th>`).join("");
    const bodyRows = rows.map((row) =>
        `<tr>${headers.map((h) => `<td>${String(row[h] ?? "").replace(/</g, "&lt;")}</td>`).join("")}</tr>`
    ).join("");

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"></head>
<body><table border="1"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;

    _downloadBlob(html, filename, "application/vnd.ms-excel;charset=utf-8;");
};

/**
 * Default row mapper for booking export.
 * @param {Object} booking
 * @returns {Object}
 */
export const defaultBookingRowMapper = (booking) => ({
    "Booking ID":     booking.bookingId,
    "Booking Date":   booking.createdAt ? new Date(booking.createdAt).toISOString() : "",
    "Full Name":      booking.identity?.fullName || "",
    "Phone":          booking.identity?.phoneNumber || "",
    "University":     booking.identity?.universityName || "",
    "Study Program":  booking.identity?.studyProgram || "",
    "Package":        booking.packageName || "",
    "DP":             booking.payment?.dpAmount || 0,
    "Remaining":      booking.payment?.remainingBalance || 0,
    "Status":         booking.normalizedStatus || booking.status || "",
    "Reject Reason":  booking.audit?.rejectReason || ""
});
