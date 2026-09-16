/**
 * backend/src/routes/risk.js
 * Mount in app.js: app.use('/api/risk', require('./routes/risk'));
 */

const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.get('/overview', riskController.getRiskOverview);
router.get('/latest', riskController.getLatestRisk);
router.get('/:year', riskController.getRiskForYear);

module.exports = router;