const express = require('express');
const router = express.Router();
const {
  listCalls,
  getCall,
  createCall,
  addMessage,
  updateStatus,
  resolveCall,
} = require('../controllers/callController');

router.get('/', listCalls);
router.get('/:id', getCall);
router.post('/', createCall);
router.post('/:id/messages', addMessage);
router.patch('/:id/status', updateStatus);
router.post('/:id/resolve', resolveCall);

module.exports = router;
