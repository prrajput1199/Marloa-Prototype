const mongoose = require('mongoose');

const { Schema } = mongoose;

const OUTCOME_TYPES = ['booking', 'enquiry', 'lead'];

const outcomeSchema = new Schema(
  {
    callId: {
      type: Schema.Types.ObjectId,
      ref: 'Call',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: OUTCOME_TYPES,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Outcome', outcomeSchema);
module.exports.OUTCOME_TYPES = OUTCOME_TYPES;
