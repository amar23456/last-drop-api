const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

module.exports = (req, res, next) => {
  
  const { authorisation } = req.headers;
  // Autorization ==='Bearer asdadsadg'
  if (!authorisation) {
    return res.status(401).send({ error: 'You must be logged in' });
  }
  const token = authorisation.replace('Bearer ', '');
  jwt.verify(token, 'My_Secret_key', async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: 'You must be logged in,' });
    }
    const { userId } = payload;
    req.user = await User.findById(userId);
    next();
  });
};
