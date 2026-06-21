import { validationResult } from 'express-validator';

/**
 * Runs after express-validator rule chains. If any rule failed,
 * responds with 400 and a flat list of validation messages.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: 'Validation failed',
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

export default validate;
