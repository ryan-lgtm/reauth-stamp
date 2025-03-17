import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware to validate MFA secret creation
 */
export const validateMFASecret = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('initialAuth').trim().notEmpty().withMessage('Initial auth secret is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware to validate token creation
 */
export const validateTokenCreation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('expiresInDays').optional().isInt({ min: 1 }).withMessage('If provided, expiry days must be a positive integer'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];