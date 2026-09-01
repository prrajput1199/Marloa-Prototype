const Outcome = require('../models/Outcome');

// GET /api/outcomes -> structured outcomes table (bookings / enquiries / leads), newest first
async function listOutcomes(req, res) {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const outcomes = await Outcome.find(filter)
      .sort({ createdAt: -1 })
      .populate('callId', 'callerName topic status')
      .lean();
    res.json(outcomes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list outcomes', details: err.message });
  }
}

// POST /api/outcomes -> create an outcome directly (rarely needed; resolveCall covers the main flow)
async function createOutcome(req, res) {
  try {
    const { callId, type, details } = req.body;
    if (!callId || !type) {
      return res.status(400).json({ error: 'callId and type are required' });
    }

    const outcome = await Outcome.create({ callId, type, details: details || {} });
    req.io.emit('outcome:new', outcome);
    res.status(201).json(outcome);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create outcome', details: err.message });
  }
}

module.exports = { listOutcomes, createOutcome };
