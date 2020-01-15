module.exports = endMiddleware = (req, res, next) => {
    const defaultWrite = res.write;
    const defaultEnd = res.end;
    const chunks = [];

    res.write = (...restArgs) => {
        chunks.push(new Buffer(restArgs[0]));
        defaultWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
        if (restArgs[0]) {
            chunks.push(Buffer.from(restArgs[0]));
        }
        const body = "Res body: " + Buffer.concat(chunks).toString('utf8');
        console.log(body);

        defaultEnd.apply(res, restArgs);
    };

    next();
};
