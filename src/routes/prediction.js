/**
 * backend/src/routes/prediction.js
 * Mount in app.js: app.use('/api/predict', require('./routes/prediction'));
 */

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.post('/', predictionController.predict);

module.exports = router;