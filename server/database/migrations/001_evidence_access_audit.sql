-- Evidence Access Audit Trail Database Schema
-- Task: T-1752989143998-782 - Add evidence access audit trail
-- Epic: 18 - Technical Debt & Refactoring

-- Create audit trail table with comprehensive tracking
CREATE TABLE IF NOT EXISTS evidence_access_audit (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  evidence_id VARCHAR(255) NOT NULL,
  evidence_version VARCHAR(100),
  
  -- Subject (user) information
  subject_user_id VARCHAR(255) NOT NULL,
  subject_session_id VARCHAR(255),
  subject_roles JSONB DEFAULT '[]'::jsonb,
  subject_permissions JSONB DEFAULT '[]'::jsonb,
  subject_ip_address INET,
  subject_user_agent TEXT,
  
  -- Resource (evidence) information
  resource_evidence_type VARCHAR(100),
  resource_classification_level VARCHAR(50),
  resource_sensitivity_score DECIMAL(3,2) CHECK (resource_sensitivity_score >= 0 AND resource_sensitivity_score <= 1),
  resource_data_location VARCHAR(255),
  resource_compliance_frameworks JSONB DEFAULT '[]'::jsonb,
  
  -- Action information
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('READ', 'WRITE', 'DELETE', 'EXPORT', 'SHARE', 'SEARCH', 'CLASSIFY', 'VERSION', 'BACKUP', 'RESTORE')),
  action_operation VARCHAR(100),
  action_intent VARCHAR(100),
  action_parameters JSONB DEFAULT '{}'::jsonb,
  action_result_size BIGINT,
  
  -- Environment information
  environment_application_context VARCHAR(100),
  environment_network_zone VARCHAR(50),
  environment_device_type VARCHAR(50),
  environment_security_level VARCHAR(50),
  environment_geo_location VARCHAR(255),
  
  -- Outcome and risk assessment
  outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('SUCCESS', 'DENIED', 'ERROR', 'PARTIAL', 'TIMEOUT')),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  risk_mitigations JSONB DEFAULT '[]'::jsonb,
  
  -- Integrity and traceability
  content_hash VARCHAR(64) NOT NULL,
  chain_hash VARCHAR(64),
  correlation_id UUID NOT NULL,
  parent_trace_id UUID,
  
  -- Compliance and retention
  retention_period INTEGER NOT NULL DEFAULT 365,
  compliance_flags JSONB DEFAULT '[]'::jsonb,
  legal_hold BOOLEAN DEFAULT FALSE,
  
  -- Performance and debugging
  processing_time INTEGER, -- milliseconds
  error_details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_evidence_id ON evidence_access_audit(evidence_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_user_id ON evidence_access_audit(subject_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_timestamp ON evidence_access_audit(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_correlation_id ON evidence_access_audit(correlation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_risk_level ON evidence_access_audit(risk_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_action_type ON evidence_access_audit(action_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_outcome ON evidence_access_audit(outcome);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_evidence_timestamp ON evidence_access_audit(evidence_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_user_timestamp ON evidence_access_audit(subject_user_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_risk_timestamp ON evidence_access_audit(risk_level, timestamp DESC);

-- Partial indexes for specific use cases
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_high_risk ON evidence_access_audit(timestamp DESC) WHERE risk_level IN ('HIGH', 'CRITICAL');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_failures ON evidence_access_audit(timestamp DESC) WHERE outcome IN ('DENIED', 'ERROR');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_legal_hold ON evidence_access_audit(evidence_id, timestamp DESC) WHERE legal_hold = TRUE;

-- GIN indexes for JSONB fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_compliance_frameworks ON evidence_access_audit USING GIN(resource_compliance_frameworks);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_risk_factors ON evidence_access_audit USING GIN(risk_factors);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_access_audit_metadata ON evidence_access_audit USING GIN(metadata);

-- Create audit trail summary view for reporting
CREATE OR REPLACE VIEW evidence_access_audit_summary AS
SELECT 
  evidence_id,
  subject_user_id,
  COUNT(*) as total_accesses,
  COUNT(DISTINCT DATE(timestamp)) as active_days,
  MIN(timestamp) as first_access,
  MAX(timestamp) as last_access,
  COUNT(CASE WHEN outcome = 'SUCCESS' THEN 1 END) as successful_accesses,
  COUNT(CASE WHEN outcome = 'DENIED' THEN 1 END) as denied_accesses,
  COUNT(CASE WHEN outcome = 'ERROR' THEN 1 END) as error_accesses,
  COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_accesses,
  COUNT(CASE WHEN risk_level = 'CRITICAL' THEN 1 END) as critical_risk_accesses,
  AVG(risk_score) as avg_risk_score,
  SUM(CASE WHEN action_type = 'READ' THEN 1 ELSE 0 END) as read_operations,
  SUM(CASE WHEN action_type = 'WRITE' THEN 1 ELSE 0 END) as write_operations,
  SUM(CASE WHEN action_type = 'DELETE' THEN 1 ELSE 0 END) as delete_operations,
  SUM(CASE WHEN action_type = 'EXPORT' THEN 1 ELSE 0 END) as export_operations,
  AVG(processing_time) as avg_processing_time
FROM evidence_access_audit
GROUP BY evidence_id, subject_user_id;

-- Create real-time audit alerts view
CREATE OR REPLACE VIEW evidence_access_audit_alerts AS
SELECT 
  id,
  timestamp,
  evidence_id,
  subject_user_id,
  action_type,
  risk_level,
  risk_score,
  risk_factors,
  outcome,
  correlation_id,
  'HIGH_RISK_ACCESS' as alert_type,
  CASE 
    WHEN risk_level = 'CRITICAL' THEN 'IMMEDIATE'
    WHEN risk_level = 'HIGH' THEN 'URGENT'
    ELSE 'NORMAL'
  END as alert_priority
FROM evidence_access_audit 
WHERE risk_level IN ('HIGH', 'CRITICAL')
  AND timestamp >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  id,
  timestamp,
  evidence_id,
  subject_user_id,
  action_type,
  risk_level,
  risk_score,
  risk_factors,
  outcome,
  correlation_id,
  'REPEATED_FAILURES' as alert_type,
  'URGENT' as alert_priority
FROM evidence_access_audit 
WHERE outcome IN ('DENIED', 'ERROR')
  AND timestamp >= NOW() - INTERVAL '1 hour'
  AND subject_user_id IN (
    SELECT subject_user_id 
    FROM evidence_access_audit 
    WHERE outcome IN ('DENIED', 'ERROR')
      AND timestamp >= NOW() - INTERVAL '1 hour'
    GROUP BY subject_user_id 
    HAVING COUNT(*) >= 5
  );

-- Create function for automatic retention policy enforcement
CREATE OR REPLACE FUNCTION enforce_audit_retention_policy()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete audit records past their retention period (unless legal hold)
  DELETE FROM evidence_access_audit 
  WHERE timestamp < NOW() - (retention_period || ' days')::INTERVAL
    AND legal_hold = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log retention policy execution
  INSERT INTO evidence_access_audit (
    evidence_id, 
    subject_user_id, 
    action_type, 
    outcome,
    risk_level,
    content_hash,
    correlation_id,
    metadata
  ) VALUES (
    'system',
    'retention_policy',
    'DELETE',
    'SUCCESS',
    'LOW',
    encode(sha256('retention_policy_execution'), 'hex'),
    gen_random_uuid(),
    jsonb_build_object(
      'deleted_records', deleted_count,
      'execution_time', NOW(),
      'policy_type', 'automatic_retention'
    )
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for audit trail integrity verification
CREATE OR REPLACE FUNCTION verify_audit_chain_integrity(p_evidence_id VARCHAR)
RETURNS TABLE(
  entry_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE,
  expected_chain_hash VARCHAR(64),
  actual_chain_hash VARCHAR(64),
  is_valid BOOLEAN
) AS $$
DECLARE
  prev_hash VARCHAR(64) := 'genesis';
  entry_record RECORD;
  expected_hash VARCHAR(64);
BEGIN
  FOR entry_record IN 
    SELECT id, timestamp, content_hash, chain_hash
    FROM evidence_access_audit 
    WHERE evidence_id = p_evidence_id 
    ORDER BY timestamp ASC
  LOOP
    -- Calculate expected chain hash
    expected_hash := encode(
      sha256(
        concat(prev_hash, entry_record.content_hash, entry_record.timestamp::text)::bytea
      ), 
      'hex'
    );
    
    -- Return verification result
    RETURN QUERY SELECT 
      entry_record.id,
      entry_record.timestamp,
      expected_hash,
      entry_record.chain_hash,
      (expected_hash = entry_record.chain_hash);
    
    prev_hash := entry_record.chain_hash;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_evidence_access_audit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evidence_access_audit_update_timestamp
  BEFORE UPDATE ON evidence_access_audit
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_access_audit_timestamp();

-- Create row-level security policies (if RLS is enabled)
-- ALTER TABLE evidence_access_audit ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own audit records
-- CREATE POLICY evidence_access_audit_user_policy ON evidence_access_audit
--   FOR SELECT
--   USING (subject_user_id = current_setting('app.current_user_id', true));

-- Policy for auditors to see all records
-- CREATE POLICY evidence_access_audit_auditor_policy ON evidence_access_audit
--   FOR ALL
--   USING (current_setting('app.user_role', true) = 'auditor');

-- Create materialized view for performance analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS evidence_access_audit_analytics AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour_bucket,
  COUNT(*) as total_accesses,
  COUNT(DISTINCT subject_user_id) as unique_users,
  COUNT(DISTINCT evidence_id) as unique_evidence,
  AVG(risk_score) as avg_risk_score,
  AVG(processing_time) as avg_processing_time,
  COUNT(CASE WHEN outcome = 'SUCCESS' THEN 1 END) as successful_accesses,
  COUNT(CASE WHEN outcome = 'DENIED' THEN 1 END) as denied_accesses,
  COUNT(CASE WHEN outcome = 'ERROR' THEN 1 END) as error_accesses,
  COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_accesses,
  COUNT(CASE WHEN risk_level = 'CRITICAL' THEN 1 END) as critical_risk_accesses
FROM evidence_access_audit
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour_bucket DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_evidence_access_audit_analytics_hour 
ON evidence_access_audit_analytics(hour_bucket);

-- Create function to refresh analytics materialized view
CREATE OR REPLACE FUNCTION refresh_evidence_access_audit_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY evidence_access_audit_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for bulk audit trail export
CREATE OR REPLACE FUNCTION export_evidence_access_audit(
  p_evidence_id VARCHAR DEFAULT NULL,
  p_user_id VARCHAR DEFAULT NULL,
  p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_format VARCHAR DEFAULT 'json'
)
RETURNS TABLE(
  export_data JSONB
) AS $$
DECLARE
  query_filter TEXT := '1=1';
BEGIN
  -- Build dynamic filter
  IF p_evidence_id IS NOT NULL THEN
    query_filter := query_filter || ' AND evidence_id = ' || quote_literal(p_evidence_id);
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    query_filter := query_filter || ' AND subject_user_id = ' || quote_literal(p_user_id);
  END IF;
  
  IF p_date_from IS NOT NULL THEN
    query_filter := query_filter || ' AND timestamp >= ' || quote_literal(p_date_from);
  END IF;
  
  IF p_date_to IS NOT NULL THEN
    query_filter := query_filter || ' AND timestamp <= ' || quote_literal(p_date_to);
  END IF;
  
  -- Return audit data as JSONB
  RETURN QUERY EXECUTE 
    'SELECT to_jsonb(t) FROM (SELECT * FROM evidence_access_audit WHERE ' || query_filter || ' ORDER BY timestamp DESC) t';
END;
$$ LANGUAGE plpgsql;

-- Create comments for documentation
COMMENT ON TABLE evidence_access_audit IS 'Comprehensive audit trail for evidence access with integrity verification';
COMMENT ON COLUMN evidence_access_audit.content_hash IS 'SHA-256 hash of audit entry content for integrity verification';
COMMENT ON COLUMN evidence_access_audit.chain_hash IS 'SHA-256 hash linking to previous audit entry for chain integrity';
COMMENT ON COLUMN evidence_access_audit.correlation_id IS 'Unique identifier for correlating related audit events';
COMMENT ON COLUMN evidence_access_audit.retention_period IS 'Number of days to retain this audit record';
COMMENT ON COLUMN evidence_access_audit.legal_hold IS 'Flag to prevent deletion due to legal requirements';

-- Grant appropriate permissions
GRANT SELECT ON evidence_access_audit TO readonly_users;
GRANT SELECT, INSERT ON evidence_access_audit TO audit_writers;
GRANT ALL PRIVILEGES ON evidence_access_audit TO audit_admins;

-- Create schema version tracking
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('001', 'Evidence Access Audit Trail', NOW())
ON CONFLICT (version) DO NOTHING;