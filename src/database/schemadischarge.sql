-- ============================================================
-- Climate Disaster Platform — River Discharge Schema (GloFAS)
-- backend/src/database/schema_discharge.sql
-- Run with: psql "$DATABASE_URL" -f src/database/schema_discharge.sql
--
-- Source: Copernicus Global Flood Awareness System (GloFAS), via CDS API.
-- Grid: 0.05 deg, 60x73 cells over the Niger Delta AOI. 579 of 4380 cells
-- are outside the river network (no data) and are excluded upstream.
-- "Virtual gauge" cell (max discharge, main outlet channel):
--   lat 4.325 N, lon 5.975 E  (near Forcados/Warri outlet)
-- ============================================================

CREATE TABLE IF NOT EXISTS river_discharge_daily (
    id                  SERIAL PRIMARY KEY,
    date                DATE NOT NULL UNIQUE,
    max_discharge_m3s   NUMERIC,   -- "virtual gauge": highest single-cell discharge that day (main channel)
    mean_discharge_m3s  NUMERIC,   -- delta-wide average across all valid river cells
    sum_discharge_m3s   NUMERIC,   -- total discharge volume proxy across all valid river cells
    valid_cell_count    INTEGER,   -- QA: how many of the 3801 river cells had data that day
    ingested_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discharge_daily_date ON river_discharge_daily (date);

CREATE TABLE IF NOT EXISTS river_discharge_monthly (
    id                  SERIAL PRIMARY KEY,
    year                INTEGER NOT NULL,
    month               INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    avg_discharge_m3s   NUMERIC,   -- mean of daily mean_discharge_m3s
    max_discharge_m3s   NUMERIC,   -- max of daily max_discharge_m3s (peak flow that month)
    min_discharge_m3s   NUMERIC,   -- min of daily mean_discharge_m3s
    days_count          INTEGER,
    ingested_at         TIMESTAMPTZ DEFAULT now(),
    UNIQUE (year, month)
);

CREATE INDEX IF NOT EXISTS idx_discharge_monthly_year ON river_discharge_monthly (year);

-- Groundwork: a joined view for the dashboard/presentation — flood extent
-- next to discharge, by year+month, so the correlation is visible at a glance.
-- (Populates once flood_monthly_stats has real data ingested.)
CREATE OR REPLACE VIEW flood_risk_overview AS
SELECT
    d.year,
    d.month,
    d.avg_discharge_m3s,
    d.max_discharge_m3s AS peak_discharge_m3s,
    f.flood_area_km2
FROM river_discharge_monthly d
LEFT JOIN flood_monthly_stats f
    ON f.year = d.year AND f.month = d.month
ORDER BY d.year, d.month;