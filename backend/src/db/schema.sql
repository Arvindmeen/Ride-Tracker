/**
 * PostgreSQL Schema Definitions
 * Run with: psql -d ridetracker -f schema.sql
 *
 * TODO: Apply migrations with a migration tool (e.g. node-pg-migrate, Flyway)
 */

-- Enable PostGIS for geographic queries (alternative to Redis GEO for some use cases)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER','DRIVER','ADMIN')),
  rating      DECIMAL(3,2) DEFAULT 5.00,
  total_rides INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  preferred_payment VARCHAR(20) DEFAULT 'CARD',
  corporate_account VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Saved places
CREATE TABLE IF NOT EXISTS saved_places (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label     VARCHAR(100) NOT NULL,
  address   TEXT NOT NULL,
  lat       DECIMAL(10,6) NOT NULL,
  lng       DECIMAL(10,6) NOT NULL,
  icon      VARCHAR(20) DEFAULT 'OTHER'
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name     VARCHAR(255) NOT NULL,
  phone    VARCHAR(20) NOT NULL,
  relation VARCHAR(100)
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make         VARCHAR(100) NOT NULL,
  model        VARCHAR(100) NOT NULL,
  year         INTEGER,
  color        VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  category     VARCHAR(20) DEFAULT 'ECONOMY',
  total_seats  INTEGER DEFAULT 4,
  is_active    BOOLEAN DEFAULT TRUE
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id              UUID PRIMARY KEY REFERENCES users(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  status          VARCHAR(20) DEFAULT 'OFFLINE',
  rating          DECIMAL(3,2) DEFAULT 5.00,
  total_rides     INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100,
  cancellation_rate DECIMAL(5,2) DEFAULT 0,
  performance_score INTEGER DEFAULT 100,
  safety_score    INTEGER DEFAULT 100,
  punctuality_score INTEGER DEFAULT 100,
  current_lat     DECIMAL(10,6),
  current_lng     DECIMAL(10,6),
  current_speed   DECIMAL(5,2) DEFAULT 0,
  heading         INTEGER DEFAULT 0,
  h3_cell_id      VARCHAR(20),
  last_location_at TIMESTAMPTZ,
  online_since    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Rides
CREATE TABLE IF NOT EXISTS rides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  driver_id       UUID REFERENCES drivers(id),
  status          VARCHAR(30) DEFAULT 'SEARCHING',
  category        VARCHAR(20) DEFAULT 'ECONOMY',
  pickup_lat      DECIMAL(10,6) NOT NULL,
  pickup_lng      DECIMAL(10,6) NOT NULL,
  pickup_address  TEXT,
  dest_lat        DECIMAL(10,6) NOT NULL,
  dest_lng        DECIMAL(10,6) NOT NULL,
  dest_address    TEXT,
  distance_km     DECIMAL(8,2),
  duration_min    INTEGER,
  base_fare       DECIMAL(10,2),
  distance_fare   DECIMAL(10,2),
  surge_multiplier DECIMAL(4,2) DEFAULT 1.0,
  surge_fare      DECIMAL(10,2) DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  tax             DECIMAL(10,2),
  total_fare      DECIMAL(10,2),
  currency        VARCHAR(3) DEFAULT 'INR',
  payment_method  VARCHAR(20) DEFAULT 'CARD',
  payment_status  VARCHAR(20) DEFAULT 'PENDING',
  promo_code      VARCHAR(50),
  is_scheduled    BOOLEAN DEFAULT FALSE,
  scheduled_for   TIMESTAMPTZ,
  is_split_fare   BOOLEAN DEFAULT FALSE,
  user_rating     INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  driver_rating   INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
  user_comment    TEXT,
  h3_pickup_cell  VARCHAR(20),
  cancellation_reason TEXT,
  idempotency_key VARCHAR(255) UNIQUE,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);

-- Driver documents
CREATE TABLE IF NOT EXISTS driver_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID NOT NULL REFERENCES drivers(id),
  type        VARCHAR(30) NOT NULL,
  status      VARCHAR(20) DEFAULT 'PENDING',
  expires_at  DATE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Grid cells (H3-compatible)
CREATE TABLE IF NOT EXISTS grid_cells (
  id               VARCHAR(20) PRIMARY KEY, -- H3 cell ID
  zone_name        VARCHAR(100),
  center_lat       DECIMAL(10,6),
  center_lng       DECIMAL(10,6),
  resolution       INTEGER DEFAULT 8,
  is_surge_zone    BOOLEAN DEFAULT FALSE,
  surge_multiplier DECIMAL(4,2) DEFAULT 1.0,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing snapshots (written by Flink job every 5 min)
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id         VARCHAR(20) REFERENCES grid_cells(id),
  demand          INTEGER DEFAULT 0,
  supply          INTEGER DEFAULT 0,
  demand_ratio    DECIMAL(6,2),
  surge_multiplier DECIMAL(4,2) DEFAULT 1.0,
  category        VARCHAR(20) DEFAULT 'ECONOMY',
  effective_price DECIMAL(10,2),
  snapshot_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(50) NOT NULL,
  severity        VARCHAR(20) NOT NULL DEFAULT 'INFO',
  status          VARCHAR(20) DEFAULT 'OPEN',
  affected_area   VARCHAR(100),
  affected_cell_id VARCHAR(20),
  related_ride_id UUID,
  related_driver_id UUID,
  assigned_to     VARCHAR(255),
  auto_detected   BOOLEAN DEFAULT FALSE,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_requested_at ON rides(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_pricing_snapshots_cell_at ON pricing_snapshots(cell_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status_severity ON incidents(status, severity);
