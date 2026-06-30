/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File: netlify/functions/upload-proof.js
 * Stage: 3 (Validation + Google Apps Script Integration - Revision)
 * * Purpose:
 * Endpoint to receive multipart/form-data for transfer proof.
 * Validates file presence, size, and MIME type, then forwards
 * the file as a Base64 JSON payload to Google Apps Script.
 * ===========================================================
 */

export default async (req, context) => {
    const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        // Enforce POST method
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Method not allowed. Only POST is accepted."
                }),
                { status: 405, headers: corsHeaders }
            );
        }

        // ==========================================
        // STAGE 1: VALIDATION
        // ==========================================

        // Parse multipart/form-data using the modern Request API
        const formData = await req.formData();
        const file = formData.get('file');

        // Validation 1: Check if file exists in the request
        if (!file || typeof file === 'string') {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No file uploaded. Please provide a file in the 'file' field."
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        // Validation 2: Check file size (Limit: 10 MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "File size exceeds the 10 MB limit."
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        // Validation 3: Check file type (Allowed: JPEG, PNG, WEBP)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.type)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid file format. Only JPEG, PNG, and WEBP images are allowed."
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ==========================================
        // STAGE 2: FORWARD TO GOOGLE APPS SCRIPT
        // ==========================================

        // Read file into Buffer and convert to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');

        // Prepare JSON payload for Google Apps Script
        const gasUrl = "https://script.google.com/macros/s/AKfycbw2vM7cz_NBf1dzXylHCSOBRxA3-DsWoYOT9XIGfveuBn3TcxvHK-_-WX9su9I52g_Tww/exec";
        const gasPayload = {
            filename: file.name,
            mimeType: file.type,
            base64: base64String
        };

        // Send HTTP POST to Google Apps Script using native fetch
        const gasResponse = await fetch(gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gasPayload)
        });

        // Handle HTTP errors from Apps Script before parsing JSON
        if (!gasResponse.ok) {
            throw new Error(`Apps Script HTTP ${gasResponse.status}`);
        }

        const gasResult = await gasResponse.json();

        // Handle Apps Script logic failure
        if (!gasResult.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: gasResult.message || "Failed to upload file to Google Drive."
                }),
                { status: 500, headers: corsHeaders }
            );
        }

        // Stage 2 Success: Return metadata exactly matching previous schema
        return new Response(
            JSON.stringify({
                success: true,
                provider: "google-drive",
                fileId: gasResult.fileId,
                fileName: gasResult.fileName,
                url: gasResult.url
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("[upload-proof] System Error:", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal Server Error"
            }),
            { status: 500, headers: corsHeaders }
        );
    }
};