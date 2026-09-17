/**
 * backend/src/controllers/predictionController.js
 */

const predictionService = require('../services/predictionService');

async function predict(req, res) {
  try {
    const result = await predictionService.getPrediction(req.body);
    res.json(result);
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(502).json({ error: 'Prediction service unavailable', detail: err.message });
  }
}

module.exports = { predict };