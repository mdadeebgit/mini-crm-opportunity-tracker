import mongoose from 'mongoose';

export const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

const opportunitySchema = new mongoose.Schema(
  {
    // Owner is always derived from the JWT on the backend, never from the request body.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer / company name is required'],
      trim: true,
    },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    requirement: {
      type: String,
      required: [true, 'Requirement summary is required'],
      trim: true,
    },
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated value must be non-negative'],
      default: 0,
    },
    stage: {
      type: String,
      enum: STAGES,
      default: 'New',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Medium',
    },
    nextFollowUpDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
