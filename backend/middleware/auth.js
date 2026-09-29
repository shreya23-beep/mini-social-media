const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from Authorization header (Bearer <token>)
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { id: user._id }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};