/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : upload-storage.js
 * ===========================================================
 */

const UPLOAD_ENDPOINT = "/.netlify/functions/upload-proof";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const generateUniqueFilename = (file) => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).slice(2, 10);
    const originalExtension = file.name.split(".").pop().toLowerCase();
    return `${timestamp}_${randomHex}.${originalExtension}`;
};

export const uploadTransferProof = async (file) => {
    if (!file || !(file instanceof File)) {
        throw new Error("HSGMS Upload: File tidak valid. Pastikan file telah dipilih sebelum upload.");
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        throw new Error(`HSGMS Upload: Format file tidak didukung (${file.type}). Hanya JPEG, PNG, dan WEBP yang diizinkan.`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`HSGMS Upload: Ukuran file terlalu besar (${fileSizeMB} MB). Maksimum 10 MB.`);
    }

    try {
        const uniqueFilename = generateUniqueFilename(file);
        
        const formData = new FormData();
        // FIX UTAMA: Gunakan parameter ketiga untuk merename file dengan aman.
        // Jangan pernah gunakan `new File()` di sini.
        formData.append("file", file, uniqueFilename);

        const response = await fetch(UPLOAD_ENDPOINT, {
            method: "POST",
            body: formData 
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            throw new Error(`Upload failed. Server returned HTTP ${response.status}.`);
        }

        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || "Upload failed.");
        }

        return {
            provider: responseData.provider,
            fileId: responseData.fileId,
            fileName: responseData.fileName,
            url: responseData.url
        };

    } catch (error) {
        if (error.message.startsWith("HSGMS Upload:")) {
            throw error;
        }
        throw new Error(`HSGMS Upload: Gagal mengupload bukti transfer. ${error.message}`);
    }
};