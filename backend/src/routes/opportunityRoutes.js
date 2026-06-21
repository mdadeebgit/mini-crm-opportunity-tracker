import { Router } from 'express';
import { body } from 'express-validator';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../controllers/opportunityController.js';
import { STAGES, PRIORITIES } from '../models/Opportunity.js';
import protect from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

// All opportunity routes require authentication.
router.use(protect);

const writeValidators = [
  body('customerName').trim().notEmpty().withMessage('Customer / company name is required'),
  body('requirement').trim().notEmpty().withMessage('Requirement summary is required'),
  body('estimatedValue')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a non-negative number'),
  body('stage').optional().isIn(STAGES).withMessage('Invalid stage'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('contactEmail').optional({ checkFalsy: true }).isEmail().withMessage('Invalid contact email'),
  body('nextFollowUpDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid follow-up date'),
];

// For update, customerName/requirement are optional (partial updates allowed),
// but if present they must not be empty.
const updateValidators = [
  body('customerName').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
  body('requirement').optional().trim().notEmpty().withMessage('Requirement cannot be empty'),
  body('estimatedValue')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a non-negative number'),
  body('stage').optional().isIn(STAGES).withMessage('Invalid stage'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('contactEmail').optional({ checkFalsy: true }).isEmail().withMessage('Invalid contact email'),
  body('nextFollowUpDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid follow-up date'),
];

router
  .route('/')
  .get(getOpportunities)
  .post(writeValidators, validate, createOpportunity);

router
  .route('/:id')
  .get(getOpportunityById)
  .put(updateValidators, validate, updateOpportunity)
  .delete(deleteOpportunity);

export default router;
