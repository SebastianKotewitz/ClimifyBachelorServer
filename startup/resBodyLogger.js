const logger = require("../startup/logger");

module.exports = endMiddleware = (req, res, next) => {



    const defaultWrite = res.write;
    const defaultEnd = res.end;
    const chunks = [];

    res.write = (...restArgs) => {
        chunks.push(new Buffer(restArgs[0]));
        defaultWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
        if (res.statusCode >= 400 || process.env.NODE_ENV === "test") {

            if (restArgs[0]) {
                chunks.push(Buffer.from(restArgs[0]));
            }
            var body = "Res body: " + Buffer.concat(chunks).toString('utf8');

            // To avoid printing entire HTML
            if (body.includes("<!DOCTYPE html>"))
                body = body.substring(0, 25) + "...";
            logger.error(body);
        }
        defaultEnd.apply(res, restArgs);
    };

    next();
};
