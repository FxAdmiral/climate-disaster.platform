-- ============================================================
-- Climate Disaster Platform — Provisional Risk Scoring
-- backend/src/database/schema_risk.sql
--
-- ⚠️ PROVISIONAL / PLACEHOLDER METHODOLOGY ⚠️
-- No risk criteria have been provided by the Data Analyst yet due to the voluminous data needed for this.
-- (per the Implementation Plan, defining risk indicators and
-- thresholds is their deliverable, not the Software Engineer's).
--
-- This view exists so the GIS risk map and dashboard have.
-- SOMETHING real to render in the meantime. It ranks each month's
-- flood extent and river discharge against their own historical
-- record (percentile-based), the same logic GloFAS itself uses for
-- flood-warning return periods — so it's a defensible starting
-- point, but the weighting (50/50) and cutoffs (33rd/66th
-- percentile) below are Software-Engineer defaults, NOT validated
-- risk science. Replace this view's logic as soon as the Data
-- Analyst delivers an actual Risk Indicator Framework.
--
-- Run with: psql "$DATABASE_URL" -f src/database/schema_risk.sql
-- ============================================================

CREATE OR REPLACE VIEW risk_score_monthly AS
WITH ranked AS (
    SELECT
        f.year,
        f.month,
        f.flood_area_km2,
        d.avg_discharge_m3s,
        d.max_discharge_m3s,
        PERCENT_RANK() OVER (ORDER BY f.flood_area_km2) AS flood_percentile,
        PERCENT_RANK() OVER (ORDER BY d.max_discharge_m3s) AS discharge_percentile
    FROM flood_monthly_stats f
    JOIN river_discharge_monthly d
        ON d.year = f.year AND d.month = f.month
)
SELECT
    year,
    month,
    flood_area_km2,
    avg_discharge_m3s,
    max_discharge_m3s,
    ROUND(flood_percentile::numeric, 3) AS flood_percentile,
    ROUND(discharge_percentile::numeric, 3) AS discharge_percentile,
    -- composite_score: simple 50/50 average of the two percentiles, 0-1 scale
    ROUND(((flood_percentile + discharge_percentile) / 2)::numeric, 3) AS composite_score,
    CASE
        WHEN (flood_percentile + discharge_percentile) / 2 >= 0.66 THEN 'high'
        WHEN (flood_percentile + discharge_percentile) / 2 >= 0.33 THEN 'medium'
        ELSE 'low'
    END AS risk_level,
    TRUE AS is_provisional -- flag every row so the API/frontend can label it clearly
FROM ranked
ORDER BY year, month;