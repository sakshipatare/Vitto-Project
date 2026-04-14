const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vitto_secret_key');

      // Set user info to request (optional, can fetch from DB if needed)
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ 
        success: false, 
        error: 'UNAUTHORIZED', 
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'NO_TOKEN', 
      message: 'Not authorized, no token' 
    });
  }
};

module.exports = { protect };
