const setTotalCountHeader = (res, count) => {
    res.set('X-Total-Count', count);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');
};

module.exports = setTotalCountHeader;