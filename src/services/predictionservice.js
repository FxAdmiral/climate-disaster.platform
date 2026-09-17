/**
 * backend/src/services/predictionService.js
 * Calls the Python prediction microservice over HTTP.
 * Requires Node 18+ for global fetch.
 */

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || 'http://localhost:5000';

async function getPrediction(inputFeatures) {
  const response = await fetch(`${PREDICTION_SERVICE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputFeatures),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Prediction service returned ${response.status}: ${detail}`);
  }

  return response.json();
}

module.exports = { getPrediction };