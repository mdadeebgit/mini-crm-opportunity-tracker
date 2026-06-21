import jwt from 'jsonwebtoken';

/**
 * Sign a JWT for a given user id.
 * The token carries only the user id; identity is re-verified on each request.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });

export default generateToken;
