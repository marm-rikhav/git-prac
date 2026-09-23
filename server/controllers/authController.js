const User = require('../models/User');
const bcrypt = require('bcryptjs');

const isValidEmail = (email) => {
  const atIndex = email.indexOf('@');
  const domain = email.slice(atIndex + 1);

  return (
    atIndex > 0 &&
    atIndex === email.lastIndexOf('@') &&
    !email.includes(' ') &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.')
  );
};

const validateCredentials = ({ email, password }) => {
  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return { error: 'Invalid email format.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  return { email: normalizedEmail, password };
};

// Register Handler
exports.register = async (req, res) => {
  try {
    const credentials = validateCredentials(req.body);
    if (credentials.error) {
      return res.status(400).json({ message: credentials.error });
    }
    const { email, password } = credentials;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create new user
    const newUser = new User({
      email,
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
    const credentials = validateCredentials(req.body);
    if (credentials.error) {
      return res.status(400).json({ message: credentials.error });
    }
    const { email, password } = credentials;

    const user = await User.findOne({ email });
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
