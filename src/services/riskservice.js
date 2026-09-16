/**
 * backend/src/services/riskService.js
 * Reads from the provisional risk_score_monthly view.
 * See schema_risk.sql for the methodology caveat.
 */

const pool = require('../database/connection');

async function getRiskOverview() {
  const { rows } = await pool.query(`SELECT * FROM risk_score_monthly`);
  return rows;
}

async function getRiskForYear(year) {
  const { rows } = await pool.query(
    `SELECT * FROM risk_score_monthly WHERE year = $1 ORDER BY month`,
    [year]
  );
  return rows;
}

async function getLatestRisk() {
  const { rows } = await pool.query(
    `SELECT * FROM risk_score_monthly ORDER BY year DESC, month DESC LIMIT 1`
  );
  return rows[0] || null;
}

module.exports = { getRiskOverview, getRiskForYear, getLatestRisk };