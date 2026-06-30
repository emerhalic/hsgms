/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : upload-storage.js
 * Sprint    : 3C (Revision)
 *
 * Purpose:
 * Dedicated Upload Service for handling client DP transfer
 * proof files via Netlify Functions and Google Drive.
 * Strictly adheres to the Single Responsibility Principle.
 *
 * Responsibilities (ONLY):
 * - Validate file input before upload (Size & MIME type)
 * - Transmit multipart/form-data to the Netlify endpoint
 * - Return the resulting file metadata and Download URL to the caller
 *
 * This module MUST NOT:
 * - Read or manipulate the booking form
 * - Write to Firebase Realtime Database
 * - Redirect pages or navigate the browser
 * - Manipulate the DOM or render UI elements
 * - Display Toast notifications or alerts
 * - Perform booking form validation
 *
 * Architecture:
 * Vanilla JavaScript (ES Modules) + Netlify Functions API
 *
 * Consumed by:
 * booking.js / booking-ui.js (form submission orchestrator)
 * ===========================================================
 */

// ===========================================================
// Constants — Validation configuration
// ===========================================================

/**
 * Endpoint for Netlify Function that handles Google Drive uploads.
 * @constant {string}
 */
const UPLOAD_ENDPOINT = "/.netlify/functions/upload-proof";

/**
 * Maximum allowed file size in bytes (10MB).
 * Matches the Netlify backend validation.
 * @constant {number}
 */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Accepted MIME types for transfer proof uploads.
 * Matches the Netlify backend validation.
 * @constant {string[]}
 */
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];


// ===========================================================
// Helper Function — Generate a unique filename
// ===========================================================

/**
 * Generates a unique, collision-resistant filename for the
 * uploaded file to maintain organization in Google Drive.
 *
 * Format: `{timestamp}_{randomHex}.{ext}`
 *
 * @param {File} file - The original File object from the caller.
 * @returns {string} A unique filename string with the correct extension.
 */
const generateUniqueFilename = (file) => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).slice(2, 10);
    const originalExtension = file.name.split(".").pop().toLowerCase();

    return `${timestamp}_${randomHex}.${originalExtension}`;
};


// ===========================================================
// Main Upload Function
// ===========================================================

/**
 * Uploads a client's DP transfer proof file to Google Drive
 * via a Netlify Function and returns the metadata.
 *
 * This is the sole export of this module. It performs:
 * 1. File object existence check
 * 2. MIME type validation (JPEG, PNG, WEBP only)
 * 3. File size validation (max 10MB)
 * 4. Unique filename generation
 * 5. HTTP POST Request with FormData
 * 6. Error parsing and handling
 * 7. Return of metadata object to the caller
 *
 * @param {File} file - The File object selected by the client.
 * @returns {Promise<{provider: string, fileId: string, fileName: string, url: string}>} 
 * Resolves with the upload metadata on success.
 * @throws {Error} Throws a descriptive Error if the file is
 * invalid or if the upload operation fails.
 */
export const uploadTransferProof = async (file, fullName) => {
    // --- Step 1: Validate file object existence ---
    if (!file || !(file instanceof File)) {
        throw new Error(
            "HSGMS Upload: File tidak valid. Pastikan file telah dipilih sebelum upload."
        );
    }

    // --- Step 2: Validate MIME type ---
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        throw new Error(
            `HSGMS Upload: Format file tidak didukung (${file.type}). ` +
            "Hanya JPEG, PNG, dan WEBP yang diizinkan."
        );
    }

    // --- Step 3: Validate file size ---
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(
            `HSGMS Upload: Ukuran file terlalu besar (${fileSizeMB} MB). ` +
            "Maksimum yang diizinkan adalah 10 MB."
        );
    }

    try {
        // --- Step 4: Create a new File with a unique name ---
        const uniqueFilename = generateUniqueFilename(file);
        const renamedFile = new File([file], uniqueFilename, { type: file.type });

        // --- Step 5: Construct FormData ---
        const formData = new FormData();
        formData.append("fullName", fullName);

        // --- Step 6: Transmit to Netlify Function ---
        const response = await fetch(UPLOAD_ENDPOINT, {
            method: "POST",
            body: formData // fetch automatically sets the correct multipart/form-data boundary
        });

        // --- Step 7: Parse Response ---
        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            throw new Error(`Upload failed. Server returned HTTP ${response.status}.`);
        }

        // --- Step 8: Handle Server-Side Validation Errors ---
        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || "Upload failed.");
        }

        // --- Step 9: Return Metadata Object ---
        return {
            provider: responseData.provider,
            fileId: responseData.fileId,
            fileName: responseData.fileName,
            url: responseData.url
        };

    } catch (error) {
        // Centralized error format catching both network and logic errors
        if (error.message.startsWith("HSGMS Upload:")) {
            throw error;
        }
        throw new Error(
            `HSGMS Upload: Gagal mengupload bukti transfer. ${error.message}`
        );
    }
};