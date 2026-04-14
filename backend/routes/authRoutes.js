const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'vitto_secret_key',
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            role: user.role
          }
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'INVALID_CREDENTIALS', 
        message: 'Invalid username or password' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'SERVER_ERROR', 
      message: error.message 
    });
  }
});

module.exports = router;
