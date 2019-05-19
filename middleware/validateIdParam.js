const mongoose = require('mongoose');

module.exports = async function (req, res, next) {

    const id = req.params[Object.keys(req.params)[0]];
    if (!id) return res.status(400).send('Id not provided');

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Id did not have the proper format (mongoose Object Id)');

    next();
};
