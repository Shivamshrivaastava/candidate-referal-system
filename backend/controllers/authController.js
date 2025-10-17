const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateId = require('../utils/generateId');
const { validateEmail } = require('../utils/validators');

const signup = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ detail: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Create user
    const userId = generateId();
    const user = new User({
      id: userId,
      email,
      password,
      full_name
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const getMe = (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.full_name,
    created_at: req.user.created_at
  });
};

module.exports = {
  signup,
  login,
  getMe
};