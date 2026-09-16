/**
 * backend/src/services/floodService.js
 *
 * All SQL lives here. Controllers call these functions and never
 * touch `pool` directly — keeps query logic in one testable place.
 */

const pool = require('../database/connection');

async function upsertMonthlyStat(client, { year, month, areaKm2, imageCount }) {
  await client.query(
    `INSERT INTO flood_monthly_stats (year, month, flood_area_km2, s1_image_count)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (year, month)
     DO UPDATE SET flood_area_km2 = EXCLUDED.flood_area_km2,
                   s1_image_count = EXCLUDED.s1_image_count,
                   ingested_at = now()`,
    [year, month, areaKm2, imageCount]
  );
}

async function upsertRaster(client, { year, storagePath }) {
  await client.query(
    `INSERT INTO flood_raster (year, storage_path)
     VALUES ($1, $2)
     ON CONFLICT (year)
     DO UPDATE SET storage_path = EXCLUDED.storage_path,
                   ingested_at = now()`,
    [year, storagePath]
  );
}

/**
 * Ingests a parsed array of CSV rows inside one transaction.
 * rows: [{ year, month, flood_area_km2, S1_image_count }, ...]
 * rasterBasePath: e.g. "s3://climate-platform-data/flood/"
 */
async function ingestMonthlyStatsRows(rows, rasterBasePath) {
  const client = await pool.connect();
  const yearsSeen = new Set();

  try {
    await client.query('BEGIN');

    for (const row of rows) {
      const year = parseInt(row.year, 10);
      const month = parseInt(row.month, 10);
      const areaKm2 = row.flood_area_km2 === '' || row.flood_area_km2 == null
        ? null : parseFloat(row.flood_area_km2);
      const imageCount = row.S1_image_count === '' || row.S1_image_count == null
        ? null : parseInt(row.S1_image_count, 10);

      if (Number.isNaN(year) || Number.isNaN(month)) {
        throw new Error(`Invalid row: ${JSON.stringify(row)}`);
      }

      await upsertMonthlyStat(client, { year, month, areaKm2, imageCount });
      yearsSeen.add(year);
    }

    for (const year of yearsSeen) {
      const storagePath = `${rasterBasePath}NigerDelta_Flood_${year}.tif`;
      await upsertRaster(client, { year, storagePath });
    }

    await client.query('COMMIT');
    return { rowsIngested: rows.length, yearsUpdated: [...yearsSeen] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getYears() {
  const { rows } = await pool.query(
    `SELECT DISTINCT year FROM flood_monthly_stats ORDER BY year`
  );
  return rows.map((r) => r.year);
}

async function getStatsForYear(year) {
  const { rows } = await pool.query(
    `SELECT month, flood_area_km2, s1_image_count
     FROM flood_monthly_stats
     WHERE year = $1
     ORDER BY month`,
    [year]
  );
  return rows;
}

async function getAllStats() {
  const { rows } = await pool.query(
    `SELECT year, month, flood_area_km2, s1_image_count
     FROM flood_monthly_stats
     ORDER BY year, month`
  );
  return rows;
}

async function getRaster(year) {
  const { rows } = await pool.query(
    `SELECT year, storage_path, band_count, scale_m
     FROM flood_raster
     WHERE year = $1`,
    [year]
  );
  return rows[0] || null;
}

module.exports = {
  ingestMonthlyStatsRows,
  getYears,
  getStatsForYear,
  getAllStats,
  getRaster,
};