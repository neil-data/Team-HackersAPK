-- storage/postgres/schema.sql
-- SentinelScan case metadata & IOC storage schema.
-- Apply with: psql -U ps4 -d ps4_malware -f storage/postgres/schema.sql

-- ============================================================
-- CASES — one row per submitted sample
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
    sample_id           VARCHAR(64) PRIMARY KEY,       -- SHA-256 hash, doubles as sample ID
    platform            VARCHAR(20) NOT NULL CHECK (platform IN ('android', 'windows', 'linux', 'macos')),
    file_type           VARCHAR(10) NOT NULL,           -- apk, exe, dll, elf, macho
    file_size_bytes     BIGINT,
    risk_score          INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    status              VARCHAR(20) CHECK (status IN ('clean', 'suspicious', 'malicious')),
    narrative_summary   TEXT,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    analyzed_at         TIMESTAMPTZ,

    -- Ingestion-time triage (fast heuristic, see ingestion/india_scam_triage.py)
    triage_flagged      BOOLEAN DEFAULT FALSE,
    triage_category     VARCHAR(50),                    -- loan_app_scam | echallan_scam | utility_bill_scam
    triage_confidence   NUMERIC(3,2),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_platform ON cases(platform);
CREATE INDEX IF NOT EXISTS idx_cases_submitted_at ON cases(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_triage_category ON cases(triage_category) WHERE triage_flagged = TRUE;


-- ============================================================
-- MITRE_TECHNIQUES — one row per technique matched, per case
-- ============================================================
CREATE TABLE IF NOT EXISTS mitre_techniques (
    id                  SERIAL PRIMARY KEY,
    sample_id           VARCHAR(64) NOT NULL REFERENCES cases(sample_id) ON DELETE CASCADE,
    technique_id        VARCHAR(20) NOT NULL,           -- e.g. "T1517", "T1547.001"
    technique_name      VARCHAR(200) NOT NULL,
    confidence          NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mitre_sample_id ON mitre_techniques(sample_id);
CREATE INDEX IF NOT EXISTS idx_mitre_technique_id ON mitre_techniques(technique_id);


-- ============================================================
-- CAPABILITY_TAGS — one row per capability, per case
-- ============================================================
CREATE TABLE IF NOT EXISTS capability_tags (
    id                  SERIAL PRIMARY KEY,
    sample_id           VARCHAR(64) NOT NULL REFERENCES cases(sample_id) ON DELETE CASCADE,
    capability          VARCHAR(50) NOT NULL,           -- e.g. "sms_otp_theft", "keylogging"
    confidence          NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
    evidence            JSONB,                          -- list of evidence strings
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capability_sample_id ON capability_tags(sample_id);
CREATE INDEX IF NOT EXISTS idx_capability_name ON capability_tags(capability);


-- ============================================================
-- IOCS — indicators of compromise (IPs, domains, URLs), per case
-- Supports the IOC Export (CSV/STIX) and IOC Relationship Graph
-- dashboard features, and cross-case campaign correlation.
-- ============================================================
CREATE TABLE IF NOT EXISTS iocs (
    id                  SERIAL PRIMARY KEY,
    sample_id           VARCHAR(64) NOT NULL REFERENCES cases(sample_id) ON DELETE CASCADE,
    ioc_type            VARCHAR(20) NOT NULL CHECK (ioc_type IN ('ip', 'domain', 'url')),
    ioc_value           VARCHAR(500) NOT NULL,
    is_c2               BOOLEAN DEFAULT FALSE,
    first_seen          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iocs_sample_id ON iocs(sample_id);
CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs(ioc_value);
-- Powers cross-sample campaign correlation: "which other cases share this IOC?"
CREATE INDEX IF NOT EXISTS idx_iocs_value_type ON iocs(ioc_value, ioc_type);


-- ============================================================
-- CHAIN_OF_CUSTODY — hash-chained, evidence-grade audit log
-- Each row's prev_hash links to the previous row's row_hash,
-- forming a tamper-evident chain per case (differentiator #3).
-- ============================================================
CREATE TABLE IF NOT EXISTS chain_of_custody (
    id                  SERIAL PRIMARY KEY,
    sample_id           VARCHAR(64) NOT NULL REFERENCES cases(sample_id) ON DELETE CASCADE,
    event_type          VARCHAR(50) NOT NULL,           -- e.g. "ingested", "static_analysis_complete", "detonated", "report_signed"
    event_detail        TEXT,
    prev_hash           VARCHAR(64),                    -- SHA-256 of previous row in this case's chain, NULL for first row
    row_hash            VARCHAR(64) NOT NULL,            -- SHA-256 of (sample_id + event_type + event_detail + prev_hash + timestamp)
    "timestamp"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custody_sample_id ON chain_of_custody(sample_id);


-- ============================================================
-- USERS — investigator accounts (minimal — real auth logic lives
-- in backend/app/auth.py; this table replaces the in-memory
-- _DEMO_USERS dict once Postgres is wired up)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    hashed_password     VARCHAR(255) NOT NULL,
    full_name           VARCHAR(200),
    department          VARCHAR(200),                   -- e.g. "Cyber Cell — Gandhinagar"
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- Auto-update trigger for cases.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cases_updated_at ON cases;
CREATE TRIGGER trg_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
