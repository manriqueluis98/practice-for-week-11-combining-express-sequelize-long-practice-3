const paginationMiddleware = function (req, res, next) {
    const page = req.query.page === undefined ? 1 : parseInt(req.query.page)
    const size = req.query.size === undefined ? 10 : parseInt(req.query.size)

    let limit
    let offset
    if(page === 0 || size === 0){
        limit = null
        offset = null
    }else if(page >= 1 && size >= 1){
        limit = size
        offset = size * (page-1)
    }else{
        req.errorMessage = 'Requires valid page and size params'
    }

    req.limit = limit
    req.offset = offset
    req.page = page
    req.size = size

    next()
}

module.exports = paginationMiddleware