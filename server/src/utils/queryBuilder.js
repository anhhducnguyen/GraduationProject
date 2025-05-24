const buildQuery = (db, table, options) => {
    const {
        filters = {},
        likeFilters = [],
        exactFilters = [],
        sort = {},
        page = 1,
        // limit = 10,
        limit
    } = options;

    const offset = (page - 1) * limit;
    const query = db(table).select('*');

    // Exact filters
    for (const key of exactFilters) {
        if (filters[key] !== undefined) {
            query.where(key, filters[key]);
        }
    }

    // LIKE filters
    for (const key of likeFilters) {
        if (filters[key]) {
            const field = key.replace('_like', '');
            if (field === 'capacity') {
                query.whereRaw(`CAST(${field} AS CHAR) LIKE ?`, [`%${filters[key]}%`]);
            } else {
                query.where(field, 'like', `%${filters[key]}%`);
            }
        }
    }

    // Sorting
    for (const [field, order] of Object.entries(sort)) {
        query.orderBy(field, order);
    }

    // Pagination
    // query.limit(limit).offset(offset);
    if (limit !== undefined && limit !== 0) {
        query.limit(limit).offset(offset);
    }

    return query;
};

module.exports = {
    buildQuery,
};