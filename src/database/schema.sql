-- ============================================================
-- Climate Disaster Platform — Flood/Risk Data Schema
-- backend/src/database/schema.sql
-- Run with: psql "$DATABASE_URL" -f src/database/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- One row per year: the 12-band GeoTIFF produced by the GEE pipeline.
-- The raster file itself lives in object storage; this just references it.
CREATE TABLE IF NOT EXISTS flood_raster (
    id            SERIAL PRIMARY KEY,
    year          INTEGER NOT NULL UNIQUE,
    storage_path  TEXT NOT NULL,
    band_count    INTEGER DEFAULT 12,
    bbox          GEOMETRY(POLYGON, 4326),
    scale_m       INTEGER DEFAULT 30,
    ingested_at   TIMESTAMPTZ DEFAULT now()
);

-- One row per year/month: flood-area statistics from the CSV.
CREATE TABLE IF NOT EXISTS flood_monthly_stats (
    id              SERIAL PRIMARY KEY,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    flood_area_km2  NUMERIC,
    s1_image_count  INTEGER,
    ingested_at     TIMESTAMPTZ DEFAULT now(),
    UNIQUE (year, month)
);

CREATE INDEX IF NOT EXISTS idx_flood_stats_year ON flood_monthly_stats (year);

-- Groundwork for later phases (risk zones, shelters, routes).
CREATE TABLE IF NOT EXISTS risk_zones (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    risk_level  TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    geom        GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_zones_geom ON risk_zones USING GIST (geom);