/**
 * backend/src/controllers/ingestionController.js
 *
 * Handles ingestion of the Data Analyst's GEE outputs:
 * POST /api/ingest/flood  (multipart/form-data, field "file" = the CSV)
 *
 * npm install multer csv-parser
 */

const { Readable } = require('stream');
const csv = require('csv-parser');
const floodService = require('../services/floodService');

const RASTER_BASE_PATH = process.env.RASTER_BASE_PATH || 's3://climate-platform-data/flood/';

async function ingestFloodCsv(req, res) {
  try {
    const rows = await parseCsvBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV contained no rows' });
    }

    const result = await floodService.ingestMonthlyStatsRows(rows, RASTER_BASE_PATH);

    res.status(201).json({
      message: 'Flood data ingested successfully',
      ...result,
    });
  } catch (err) {
    console.error('Ingestion error:', err);
    res.status(500).json({ error: 'Ingestion failed', detail: err.message });
  }
}

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

module.exports = { ingestFloodCsv };