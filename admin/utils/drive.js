/**
 * @param {string|null} url
 * @returns {string|null}
 */
export const extractDriveFileId = (url) => {
    if (!url || typeof url !== "string") return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
};

/**
 * @param {string|null} storedUrl
 * @returns {string|null}
 */
export const getDriveViewUrl = (storedUrl) => {
    if (!storedUrl) return null;
    const fileId = extractDriveFileId(storedUrl);
    return fileId
        ? `https://drive.google.com/file/d/${fileId}/view`
        : storedUrl;
};

/**
 * @param {string|null} storedUrl
 * @returns {string|null}
 */
export const getDrivePreviewUrl = (storedUrl) => {
    const fileId = extractDriveFileId(storedUrl);
    if (!fileId) return storedUrl;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
};
