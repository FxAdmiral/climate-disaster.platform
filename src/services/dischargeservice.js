/**
 * backend/src/services/dischargeService.js
 */

const pool = require('../database/connection');

async function upsertDailyRow(client, row) {
  await client.query(
    `INSERT INTO river_discharge_daily
       (date, max_discharge_m3s, mean_discharge_m3s, sum_discharge_m3s, valid_cell_count)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (date)
     DO UPDATE SET max_discharge_m3s = EXCLUDED.max_discharge_m3s,
                   mean_discharge_m3s = EXCLUDED.mean_discharge_m3s,
                   sum_discharge_m3s = EXCLUDED.sum_discharge_m3s,
                   valid_cell_count = EXCLUDED.valid_cell_count,
                   ingested_at = now()`,
    [row.date, row.max_discharge_m3s, row.mean_discharge_m3s, row.sum_discharge_m3s, row.valid_cell_count]
  );
}

async function upsertMonthlyRow(client, row) {
  await client.query(
    `INSERT INTO river_discharge_monthly
       (year, month, avg_discharge_m3s, max_discharge_m3s, min_discharge_m3s, days_count)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (year, month)
     DO UPDATE SET avg_discharge_m3s = EXCLUDED.avg_discharge_m3s,
                   max_discharge_m3s = EXCLUDED.max_discharge_m3s,
                   min_discharge_m3s = EXCLUDED.min_discharge_m3s,
                   days_count = EXCLUDED.days_count,
                   ingested_at = now()`,
    [row.year, row.month, row.avg_discharge_m3s, row.max_discharge_m3s, row.min_discharge_m3s, row.days_count]
  );
}

async function ingestDailyRows(rows) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of rows) {
      await upsertDailyRow(client, {
        date: r.date,
        max_discharge_m3s: parseFloat(r.max_discharge_m3s),
        mean_discharge_m3s: parseFloat(r.mean_discharge_m3s),
        sum_discharge_m3s: parseFloat(r.sum_discharge_m3s),
        valid_cell_count: parseInt(r.valid_cell_count, 10),
      });
    }
    await client.query('COMMIT');
    return { rowsIngested: rows.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function ingestMonthlyRows(rows) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of rows) {
      await upsertMonthlyRow(client, {
        year: parseInt(r.year, 10),
        month: parseInt(r.month, 10),
        avg_discharge_m3s: parseFloat(r.avg_discharge_m3s),
        max_discharge_m3s: parseFloat(r.max_discharge_m3s),
        min_discharge_m3s: parseFloat(r.min_discharge_m3s),
        days_count: parseInt(r.days_count, 10),
      });
    }
    await client.query('COMMIT');
    return { rowsIngested: rows.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getDailySeries(startDate, endDate) {
  const { rows } = await pool.query(
    `SELECT date, max_discharge_m3s, mean_discharge_m3s, sum_discharge_m3s
     FROM river_discharge_daily
     WHERE date BETWEEN $1 AND $2
     ORDER BY date`,
    [startDate, endDate]
  );
  return rows;
}

async function getMonthlySeries(year) {
  const query = year
    ? { text: `SELECT * FROM river_discharge_monthly WHERE year = $1 ORDER BY month`, values: [year] }
    : { text: `SELECT * FROM river_discharge_monthly ORDER BY year, month`, values: [] };
  const { rows } = await pool.query(query);
  return rows;
}

async function getRiskOverview() {
  const { rows } = await pool.query(`SELECT * FROM flood_risk_overview`);
  return rows;
}

module.exports = {
  ingestDailyRows,
  ingestMonthlyRows,
  getDailySeries,
  getMonthlySeries,
  getRiskOverview,
};