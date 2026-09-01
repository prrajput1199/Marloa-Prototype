const Call = require('../models/Call');
const { getScenarioById, getRandomScenario, scenarios } = require('./scenarios');

const TICK_MS = Number(process.env.SIMULATOR_TICK_MS) || 1800;

async function startSimulatedCall(io, scenarioId) {
  const scenario = scenarioId ? getScenarioById(scenarioId) : getRandomScenario();
  if (!scenario) throw new Error(`Unknown scenario id: ${scenarioId}`);

  const call = await Call.create({
    callerName: scenario.callerName,
    topic: scenario.topic,
    scenarioId: scenario.id,
    status: 'ai_handling',
    messages: [],
  });

  io.emit('call:new', call);

  playScript(io, call._id, scenario.script, 0);

  return call;
}

function playScript(io, callId, script, stepIndex) {
  if (stepIndex >= script.length) return;

  setTimeout(async () => {
    try {
      const step = script[stepIndex];
      const call = await Call.findById(callId);

      if (!call || call.status === 'human_active' || call.status === 'resolved') {
        return;
      }

      const message = { sender: step.sender, text: step.text, timestamp: new Date() };
      call.messages.push(message);
      if (step.statusAfter) call.status = step.statusAfter;
      await call.save();

      io.emit('call:message', { callId: call._id, message });
      if (step.statusAfter) {
        io.emit('call:status', { callId: call._id, status: call.status });
      }

      playScript(io, callId, script, stepIndex + 1);
    } catch (err) {
      console.error('[simulator] error playing script step:', err.message);
    }
  }, TICK_MS);
}

function seedDemoCalls(io, count = 3) {
  const chosen = scenarios.slice(0, count);
  chosen.forEach((scenario, i) => {
    setTimeout(() => {
      startSimulatedCall(io, scenario.id).catch((err) =>
        console.error('[simulator] failed to seed demo call:', err.message)
      );
    }, i * 1200);
  });
}

module.exports = { startSimulatedCall, seedDemoCalls };
