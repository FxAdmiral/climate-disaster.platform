/**
 * backend/src/routes/discharge.js
 * Mount in app.js: app.use('/api/discharge', require('./routes/discharge'));
 */

const express = require('express');
const router = express.Router();
const dischargeController = require('../controllers/dischargeController');

router.get('/daily', dischargeController.getDailySeries);
router.get('/monthly', dischargeController.getMonthlySeries);
router.get('/risk-overview', dischargeController.getRiskOverview);

module.exports = router;