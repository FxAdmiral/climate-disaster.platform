/**
 * backend/src/controllers/dischargeController.js
 */

const { Readable } = require('stream');
const csv = require('csv-parser');
const dischargeService = require('../services/dischargeService');

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// POST /api/ingest/discharge/daily
async function ingestDailyCsv(req, res) {
  try {
    const rows = await parseCsvBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ error: 'CSV contained no rows' });
    const result = await dischargeService.ingestDailyRows(rows);
    res.status(201).json({ message: 'Daily discharge data ingested', ...result });
  } catch (err) {
    console.error('Discharge ingestion error:', err);
    res.status(500).json({ error: 'Ingestion failed', detail: err.message });
  }
}

// POST /api/ingest/discharge/monthly
async function ingestMonthlyCsv(req, res) {
  try {
    const rows = await parseCsvBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ error: 'CSV contained no rows' });
    const result = await dischargeService.ingestMonthlyRows(rows);
    res.status(201).json({ message: 'Monthly discharge data ingested', ...result });
  } catch (err) {
    console.error('Discharge ingestion error:', err);
    res.status(500).json({ error: 'Ingestion failed', detail: err.message });
  }
}

// GET /api/discharge/daily?start=YYYY-MM-DD&end=YYYY-MM-DD
async function getDailySeries(req, res) {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Query params "start" and "end" (YYYY-MM-DD) are required' });
    }
    const rows = await dischargeService.getDailySeries(start, end);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/discharge/monthly?year=2020  (year optional — omit for full series)
async function getMonthlySeries(req, res) {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : null;
    const rows = await dischargeService.getMonthlySeries(year);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/discharge/risk-overview — discharge + flood extent joined by month
async function getRiskOverview(req, res) {
  try {
    const rows = await dischargeService.getRiskOverview();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  ingestDailyCsv,
  ingestMonthlyCsv,
  getDailySeries,
  getMonthlySeries,
  getRiskOverview,
};