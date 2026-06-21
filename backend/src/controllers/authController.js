import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const buildAuthResponse = (user) => ({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  },
  token: generateToken(user._id),
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password });
    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      // Same message for both cases to avoid leaking which emails exist.
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently authenticated user's profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};
