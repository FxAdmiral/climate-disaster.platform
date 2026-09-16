/**
 * backend/src/routes/flood.js
 * Mount in app.js: app.use('/api/flood', require('./routes/flood'));
 */

const express = require('express');
const router = express.Router();

const floodController = require('../controllers/floodController');
const { validateYearParam } = require('../validators/floodValidator');

router.get('/years', floodController.getYears);
router.get('/stats', floodController.getAllStats);
router.get('/:year/stats', validateYearParam, floodController.getStatsForYear);
router.get('/:year/raster', validateYearParam, floodController.getRaster);

module.exports = router;