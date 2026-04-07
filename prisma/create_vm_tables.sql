CREATE TABLE IF NOT EXISTS vm_clients (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyName"  TEXT NOT NULL,
  "contactName"  TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  "clientType"   TEXT NOT NULL DEFAULT 'VESSEL_OWNER',
  stage        TEXT NOT NULL DEFAULT 'LEAD',
  location     TEXT,
  notes        TEXT,
  "monthlyValue" INTEGER,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_vessels (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name           TEXT NOT NULL,
  "vesselType"     TEXT NOT NULL DEFAULT 'MOTOR_YACHT',
  "lengthM"        DOUBLE PRECISION,
  "listingPrice"   INTEGER,
  marina         TEXT,
  "listingStatus"  TEXT NOT NULL DEFAULT 'PRIVATE',
  "clientId"       TEXT NOT NULL REFERENCES vm_clients(id) ON DELETE CASCADE,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_shoots (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vesselId"       TEXT NOT NULL REFERENCES vm_vessels(id) ON DELETE CASCADE,
  "shootDate"      TIMESTAMPTZ,
  location       TEXT,
  "weatherNotes"   TEXT,
  services       TEXT NOT NULL DEFAULT 'PHOTO',
  status         TEXT NOT NULL DEFAULT 'ENQUIRY',
  budget         INTEGER,
  notes          TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_shoot_deliverables (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "shootId"     TEXT NOT NULL REFERENCES vm_shoots(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'PHOTO',
  title       TEXT NOT NULL,
  link        TEXT,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  "dueDate"     TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_leads (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                 TEXT NOT NULL,
  email                TEXT,
  phone                TEXT,
  "vesselName"           TEXT,
  "vesselType"           TEXT,
  location             TEXT,
  "servicesInterested"   TEXT,
  budget               TEXT,
  timeline             TEXT,
  stage                TEXT NOT NULL DEFAULT 'NEW',
  notes                TEXT,
  source               TEXT,
  "clientId"             TEXT REFERENCES vm_clients(id) ON DELETE SET NULL,
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_agent_conversations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vm_agent_conv_session_idx ON vm_agent_conversations ("sessionId", "createdAt");

CREATE TABLE IF NOT EXISTS vm_agent_memory (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_settings (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vm_expenses (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  amount      INTEGER NOT NULL,
  purpose     TEXT,
  month       TEXT NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
