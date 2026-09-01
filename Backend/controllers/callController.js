const Call = require('../models/Call');
const Outcome = require('../models/Outcome');

// GET /api/calls  -> list calls, most recent first, optionally filtered by status
async function listCalls(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const calls = await Call.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list calls', details: err.message });
  }
}

// GET /api/calls/:id -> single call with full transcript
async function getCall(req, res) {
  try {
    const call = await Call.findById(req.params.id).lean();
    if (!call) return res.status(404).json({ error: 'Call not found' });
    res.json(call);
  } catch (err) {
    res.status(400).json({ error: 'Invalid call id', details: err.message });
  }
}

// POST /api/calls -> create a new call (used by the simulator and available for manual testing)
async function createCall(req, res) {
  try {
    const { callerName, topic, scenarioId, status } = req.body;
    if (!callerName || !topic) {
      return res.status(400).json({ error: 'callerName and topic are required' });
    }

    const call = await Call.create({
      callerName,
      topic,
      scenarioId,
      status: status || 'ai_handling',
      messages: [],
    });

    req.io.emit('call:new', call);
    res.status(201).json(call);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create call', details: err.message });
  }
}

// POST /api/calls/:id/messages -> append a message (caller/ai/human) to a call's transcript
async function addMessage(req, res) {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) {
      return res.status(400).json({ error: 'sender and text are required' });
    }

    const call = await Call.findById(req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    const message = { sender, text, timestamp: new Date() };
    call.messages.push(message);

    // A human sending a message is, by definition, taking the call over.
    if (sender === 'human' && call.status !== 'human_active') {
      call.status = 'human_active';
    }

    await call.save();

    req.io.emit('call:message', { callId: call._id, message });
    if (call.isModified('status')) {
      req.io.emit('call:status', { callId: call._id, status: call.status });
    }

    res.status(201).json(call);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add message', details: err.message });
  }
}

// PATCH /api/calls/:id/status -> explicit status transition (e.g. operator "take over")
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['ai_handling', 'needs_human', 'human_active', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const call = await Call.findById(req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    call.status = status;
    if (status === 'resolved') call.resolvedAt = new Date();
    await call.save();

    req.io.emit('call:status', { callId: call._id, status: call.status });
    res.json(call);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update status', details: err.message });
  }
}

// POST /api/calls/:id/resolve -> mark resolved AND create the structured Outcome record
async function resolveCall(req, res) {
  try {
    const { type, details } = req.body;
    const allowedTypes = ['booking', 'enquiry', 'lead'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${allowedTypes.join(', ')}` });
    }

    const call = await Call.findById(req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    call.status = 'resolved';
    call.resolvedAt = new Date();
    await call.save();

    const outcome = await Outcome.create({
      callId: call._id,
      type,
      details: details || {},
    });

    req.io.emit('call:status', { callId: call._id, status: 'resolved' });
    req.io.emit('outcome:new', outcome);

    res.status(201).json({ call, outcome });
  } catch (err) {
    res.status(400).json({ error: 'Failed to resolve call', details: err.message });
  }
}

module.exports = {
  listCalls,
  getCall,
  createCall,
  addMessage,
  updateStatus,
  resolveCall,
};
