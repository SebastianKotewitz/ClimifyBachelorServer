module.exports = function (err, req, res, next) {
    /* Here we use winston library to log errors
    * First argument is logging level if you use winston.log.
    * Or you can use specified function to log
    * error, warn, info, verbose, debug, silly
    * With error method first argument is the message to be logged,
    * the next arguments are all objects to be stored with the log message */
    //winston.error(err.message, err);
    if (err.name === 'ValidationError') {
        return res.status(422).send(err.message);
    }

    res.status(500).send('Something failed' + err.name);
    next();
};
