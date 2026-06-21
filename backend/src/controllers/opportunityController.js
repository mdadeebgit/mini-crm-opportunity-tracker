import Opportunity from '../models/Opportunity.js';

// Fields a client is allowed to set/update. owner is intentionally excluded.
const WRITABLE_FIELDS = [
  'customerName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'requirement',
  'estimatedValue',
  'stage',
  'priority',
  'nextFollowUpDate',
  'notes',
];

const pickWritable = (body) =>
  WRITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

/**
 * @route   GET /api/opportunities
 * @desc    List all opportunities (shared pipeline) with optional filters
 * @access  Private
 */
export const getOpportunities = async (req, res, next) => {
  try {
    const { stage, priority, search, sort } = req.query;

    const filter = {};
    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { requirement: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      value: { estimatedValue: -1 },
      followup: { nextFollowUpDate: 1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const opportunities = await Opportunity.find(filter)
      .populate('owner', 'name email')
      .sort(sortBy);

    return res.status(200).json(opportunities);
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   GET /api/opportunities/:id
 * @desc    Get a single opportunity
 * @access  Private
 */
export const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('owner', 'name email');
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    return res.status(200).json(opportunity);
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   POST /api/opportunities
 * @desc    Create an opportunity. Owner is taken from the JWT (req.user).
 * @access  Private
 */
export const createOpportunity = async (req, res, next) => {
  try {
    const data = pickWritable(req.body);
    data.owner = req.user._id; // derived from token, never from the body

    const opportunity = await Opportunity.create(data);
    const populated = await opportunity.populate('owner', 'name email');

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   PUT /api/opportunities/:id
 * @desc    Update an opportunity. Only the owner may update.
 * @access  Private
 */
export const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Ownership enforced on the backend regardless of frontend UI.
    if (opportunity.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own opportunities' });
    }

    Object.assign(opportunity, pickWritable(req.body));
    const updated = await opportunity.save();
    const populated = await updated.populate('owner', 'name email');

    return res.status(200).json(populated);
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   DELETE /api/opportunities/:id
 * @desc    Delete an opportunity. Only the owner may delete.
 * @access  Private
 */
export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own opportunities' });
    }

    await opportunity.deleteOne();
    return res.status(200).json({ message: 'Opportunity deleted', id: req.params.id });
  } catch (error) {
    return next(error);
  }
};
