const express = require('express');
const router = express.Router();
const { startSimulatedCall } = require('../simulator/simulator');
const { scenarios } = require('../simulator/scenarios');

// GET /api/simulator/scenarios -> list available scripted scenarios (for a "start a call" picker in the UI)
router.get('/scenarios', (req, res) => {
  res.json(scenarios.map(({ id, callerName, topic }) => ({ id, callerName, topic })));
});

// POST /api/simulator/run { scenarioId? } -> start a new simulated call (random scenario if omitted)
router.post('/run', async (req, res) => {
  try {
    const { scenarioId } = req.body || {};
    const call = await startSimulatedCall(req.io, scenarioId);
    res.status(201).json(call);
  } catch (err) {
    res.status(400).json({ error: 'Failed to start simulated call', details: err.message });
  }
});

module.exports = router;
