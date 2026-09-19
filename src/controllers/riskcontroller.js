/**
 * backend/src/controllers/riskController.js
 *
 * Every response includes "isProvisional: true" and a methodology
 * note so the frontend can (and should) visibly flag this as a
 * placeholder until the Data Analyst delivers real risk criteria.
 */

const riskService = require('../services/riskService');

const METHODOLOGY_NOTE =
  'Provisional scoring: percentile rank of flood extent and river discharge ' +
  'against historical record, 50/50 weighted. Not yet validated by the Data Analyst ' +
  'due to the voluminous size of historical data, well over 500GB of storage and counting, ' +
  'I must say they deserve their flowers.';

async function getRiskOverview(req, res) {
  try {
    const rows = await riskService.getRiskOverview();
    res.json({ isProvisional: true, methodology: METHODOLOGY_NOTE, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRiskForYear(req, res) {
  try {
    const year = parseInt(req.params.year, 10);
    const rows = await riskService.getRiskForYear(year);
    res.json({ isProvisional: true, methodology: METHODOLOGY_NOTE, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getLatestRisk(req, res) {
  try {
    const row = await riskService.getLatestRisk();
    if (!row) return res.status(404).json({ error: 'No risk data available yet' });
    res.json({ isProvisional: true, methodology: METHODOLOGY_NOTE, data: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getRiskOverview, getRiskForYear, getLatestRisk };