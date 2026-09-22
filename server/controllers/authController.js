const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register Handler
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim();

    // 2. Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // 3. Validate password length (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // 4. Check if email already exists
    const existingUser = await User.findOne({ email: trimmedEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create new user
    const newUser = new User({
      email: trimmedEmail.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// Login Handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim();

    // 2. Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // 3. Validate password length (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // 4. Find user by email
    const user = await User.findOne({ email: trimmedEmail.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // 5. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};
