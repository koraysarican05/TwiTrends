const jwt = require('jsonwebtoken');
const secretKey = 'secret-key'; // Buraya senin backend'de kullandığın secretKey yazılmalı

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken;
