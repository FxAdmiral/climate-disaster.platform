/**
 * backend/src/routes/ingestion.js
 * Mount in app.js: app.use('/api/ingest', require('./routes/ingestion'));
 *
 * npm install multer
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();

const ingestionController = require('../controllers/ingestionController');
const dischargeController = require('../controllers/dischargeController');
const { validateCsvUpload } = require('../validators/floodValidator');

// Files stay in memory and get parsed immediately — no need to write to disk.
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/flood',
  upload.single('file'),
  validateCsvUpload,
  ingestionController.ingestFloodCsv
);

router.post(
  '/discharge/daily',
  upload.single('file'),
  validateCsvUpload,
  dischargeController.ingestDailyCsv
);

router.post(
  '/discharge/monthly',
  upload.single('file'),
  validateCsvUpload,
  dischargeController.ingestMonthlyCsv
);

module.exports = router;