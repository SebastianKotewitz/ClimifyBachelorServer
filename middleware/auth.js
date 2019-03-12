//const jwt = require('jsonwebtoken');
//const config = require('config');
const {User} = require('../models/user');

module.exports = async function (req, res, next) {
  /*const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded; 
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }*/

  const userId = req.header('userId');
  if (!userId) return res.status(401).send('Access denied. No userId provided.');
  const user = await User.findById(userId);
  if (!user) return res.status(401).send('Unauthorized user');
  req.user = user;
  next();
};