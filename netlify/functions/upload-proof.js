/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File: netlify/functions/upload-proof.js
 * Stage: 2 (Validation + Google Drive Integration - Revision)
 * * Purpose:
 * Endpoint to receive multipart/form-data for transfer proof.
 * Validates file presence, size, and MIME type using the modern 
 * Netlify Functions Request/Response API, then uploads to Google Drive.
 * ===========================================================
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

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
        // STAGE 2: GOOGLE DRIVE UPLOAD
        // ==========================================

        const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID } = process.env;

        if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
            console.error("[upload-proof] Missing Google Drive environment variables.");
            throw new Error("Server configuration error");
        }

        // Handle private key formatting from environment variables
        const formattedPrivateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

        // Authenticate with Google Service Account
        const auth = new google.auth.JWT(
            GOOGLE_CLIENT_EMAIL,
            null,
            formattedPrivateKey,
            ['https://www.googleapis.com/auth/drive.file']
        );

        const drive = google.drive({ version: 'v3', auth });

        // Convert modern Web File API blob to Node.js Readable stream
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        // Upload configuration
        const fileMetadata = {
            name: file.name,
            parents: [GOOGLE_DRIVE_FOLDER_ID]
        };
        const media = {
            mimeType: file.type,
            body: stream
        };

        // Execute upload - Revision 1: only request id and name
        const uploadResponse = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name'
        });

        const uploadedFileId = uploadResponse.data.id;

        // Change file permissions to "Anyone with the link can view"
        await drive.permissions.create({
            fileId: uploadedFileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Revision 2: Construct the URL manually for stability
        const fileUrl = `https://drive.google.com/file/d/${uploadedFileId}/view`;

        // Stage 2 Success: Return metadata and accessible URL
        return new Response(
            JSON.stringify({
                success: true,
                provider: "google-drive",
                fileId: uploadedFileId,
                fileName: uploadResponse.data.name,
                url: fileUrl
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