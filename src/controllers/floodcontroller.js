/**
 * backend/src/controllers/floodController.js
 * Read-facing endpoints consumed by the dashboard/map (Phase 3).
 */

const floodService = require('../services/floodService');

async function getYears(req, res) {
  try {
    const years = await floodService.getYears();
    res.json(years);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStatsForYear(req, res) {
  try {
    const rows = await floodService.getStatsForYear(req.year);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllStats(req, res) {
  try {
    const rows = await floodService.getAllStats();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRaster(req, res) {
  try {
    const raster = await floodService.getRaster(req.year);
    if (!raster) return res.status(404).json({ error: 'No raster for that year' });
    res.json(raster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getYears, getStatsForYear, getAllStats, getRaster };