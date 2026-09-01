const Call = require('../models/Call');
const Outcome = require('../models/Outcome');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on('operator:takeover', async ({ callId }) => {
      try {
        const call = await Call.findById(callId);
        if (!call) return socket.emit('operator:error', { message: 'Call not found' });

        call.status = 'human_active';
        await call.save();

        io.emit('call:status', { callId: call._id, status: call.status });
      } catch (err) {
        socket.emit('operator:error', { message: err.message });
      }
    });

    socket.on('operator:message', async ({ callId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const call = await Call.findById(callId);
        if (!call) return socket.emit('operator:error', { message: 'Call not found' });

        const message = { sender: 'human', text: text.trim(), timestamp: new Date() };
        call.messages.push(message);
        if (call.status !== 'human_active') call.status = 'human_active';
        await call.save();

        io.emit('call:message', { callId: call._id, message });
        io.emit('call:status', { callId: call._id, status: call.status });
      } catch (err) {
        socket.emit('operator:error', { message: err.message });
      }
    });

    socket.on('operator:resolve', async ({ callId, type, details }) => {
      try {
        const allowedTypes = ['booking', 'enquiry', 'lead'];
        if (!allowedTypes.includes(type)) {
          return socket.emit('operator:error', { message: 'Invalid outcome type' });
        }

        const call = await Call.findById(callId);
        if (!call) return socket.emit('operator:error', { message: 'Call not found' });

        call.status = 'resolved';
        call.resolvedAt = new Date();
        await call.save();

        const outcome = await Outcome.create({ callId: call._id, type, details: details || {} });

        io.emit('call:status', { callId: call._id, status: 'resolved' });
        io.emit('outcome:new', outcome);
      } catch (err) {
        socket.emit('operator:error', { message: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = registerSocketHandlers;
