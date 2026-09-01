const express = require('express');
const router = express.Router();
const { listOutcomes, createOutcome } = require('../controllers/outcomeController');

router.get('/', listOutcomes);
router.post('/', createOutcome);

module.exports = router;
