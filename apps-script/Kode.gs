/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File: Kode.gs
 * Target: Google Apps Script
 *
 * Purpose:
 * Backend service to receive Base64 file data via HTTP POST,
 * save it to Google Drive, rename the file automatically,
 * set permissions, and return the public URL.
 * ===========================================================
 */

const FOLDER_ID = "1OSaa5Ml5YO7t9IA5n9d9xY_VxuYbZjye";

function doPost(e) {
  try {

    // =======================================================
    // Validate Request
    // =======================================================

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request payload.");
    }

    const payload = JSON.parse(e.postData.contents);

    const filename = payload.filename;
    const mimeType = payload.mimeType;
    const base64Data = payload.base64;
    const fullName = payload.fullName || "Unknown";

    if (!filename || !mimeType || !base64Data) {
      throw new Error("Missing required parameters.");
    }

    // =======================================================
    // Clean Base64
    // =======================================================

    let cleanBase64 = base64Data;

    if (cleanBase64.indexOf(",") !== -1) {
      cleanBase64 = cleanBase64.split(",")[1];
    }

    // =======================================================
    // Create Filename
    // =======================================================

    const now = new Date();

    const timestamp = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "yyyyMMdd_HHmmss"
    );

    const safeName = fullName
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_");

    const extension = filename.split(".").pop().toLowerCase();

    const finalFilename =
      `${timestamp}_${safeName}_DP.${extension}`;

    // =======================================================
    // Decode File
    // =======================================================

    const decoded = Utilities.base64Decode(cleanBase64);

    const blob = Utilities.newBlob(
      decoded,
      mimeType,
      finalFilename
    );

    // =======================================================
    // Upload Google Drive
    // =======================================================

    const folder = DriveApp.getFolderById(FOLDER_ID);

    const file = folder.createFile(blob);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    // Metadata
    file.setDescription(
      "Uploaded from HSGMS\n" +
      "Student: " + fullName + "\n" +
      "Original Filename: " + filename + "\n" +
      "Uploaded: " + timestamp
    );

    // =======================================================
    // Response
    // =======================================================

    const fileId = file.getId();

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        provider: "google-drive",
        fileId: fileId,
        fileName: finalFilename,
        url: `https://drive.google.com/file/d/${fileId}/view`
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }
}