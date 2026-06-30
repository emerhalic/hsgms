/**
 * @param {Array<*>} items
 * @param {number} page
 * @param {number} pageSize
 * @returns {Object}
 */
export const paginate = (items, page, pageSize) => {
    const list = Array.isArray(items) ? items : [];
    const totalItems = list.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;

    return {
        items: list.slice(start, start + pageSize),
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        rangeStart: totalItems === 0 ? 0 : start + 1,
        rangeEnd: Math.min(start + pageSize, totalItems)
    };
};
