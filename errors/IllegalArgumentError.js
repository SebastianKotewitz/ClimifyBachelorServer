module.exports = class IllegalArgumentError extends Error {
    constructor(...args) {
        super(...args)
        Error.captureStackTrace(this, IllegalArgumentError)
    }
}
