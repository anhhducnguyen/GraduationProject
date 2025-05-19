const parseQueryOptions = (query) => {
    // Pagination
    let page = 1;
    let limit = 10;

    if (query._start !== undefined && query._end !== undefined) {
        const start = parseInt(query._start);
        const end = parseInt(query._end);
        limit = end - start;
        page = Math.floor(start / limit) + 1;
    } else if (query._page) {
        page = parseInt(query._page);
        limit = parseInt(query._per_page) || 10;
    }

    // Sorting
    let sort = {};
    if (query._sort && query._order) {
        sort[query._sort] = query._order.toLowerCase();
    }

    return { page, limit, sort };
};

module.exports = { parseQueryOptions };

