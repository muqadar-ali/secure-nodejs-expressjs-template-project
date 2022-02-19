const Boom = require('boom')

/**
 * Boomify all errors. should be placed before any error handler
 */
const boomifyErrorsMiddleware = (err, req, res, next) => {
    if (!err) return next()
    return next((err) => {
        if (!(err instanceof Error)) err = new Error(err)
        return err.isBoom ? err : Boom.boomify(err)
    })
}

/**
* Handle errors 
*  should be placed after all error handlers
*/
const errorHandlerMiddleware = (err, req, res, next) => {
    if (!err) return next()
    const payload = Object.assign(
        {},
        err.output.payload,
        err.data && err.data,
        process.env.NODE_ENV !== 'production' && { stack: err.stack }
    )

    return res.status(err.output.statusCode).json(payload)
}

module.exports = {
    boomifyErrorsMiddleware,
    errorHandlerMiddleware
}