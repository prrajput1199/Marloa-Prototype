const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['caller', 'ai', 'human'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const CALL_STATUSES = ['ai_handling', 'needs_human', 'human_active', 'resolved'];

const callSchema = new Schema(
  {
    callerName: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: CALL_STATUSES,
      default: 'ai_handling',
      index: true,
    },
    scenarioId: {
      type: String,
      required: false,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

callSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Call', callSchema);
module.exports.CALL_STATUSES = CALL_STATUSES;
