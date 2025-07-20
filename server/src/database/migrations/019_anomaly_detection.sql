-- Migration 019: Anomaly Detection System
-- Creates tables and indexes for anomaly detection and security incident management

-- Create security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  affected_entities JSONB,
  assigned_to VARCHAR(255),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Create anomaly patterns table
CREATE TABLE IF NOT EXISTS anomaly_patterns (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN DEFAULT true,
  threshold DECIMAL(10,2) NOT NULL,
  window_size_minutes INTEGER NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create anomaly events table
CREATE TABLE IF NOT EXISTS anomaly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id VARCHAR(255) NOT NULL REFERENCES anomaly_patterns(id),
  pattern_name VARCHAR(255) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMP DEFAULT NOW(),
  trigger_value DECIMAL(10,2) NOT NULL,
  threshold DECIMAL(10,2) NOT NULL,
  affected_entities JSONB,
  event_data JSONB,
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255),
  false_positive BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create anomaly actions log table
CREATE TABLE IF NOT EXISTS anomaly_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_event_id UUID NOT NULL REFERENCES anomaly_events(id),
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
  executed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create IP blocking table for automated responses
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  blocked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  reason TEXT,
  created_by VARCHAR(255), -- 'system' for automated blocks
  anomaly_event_id UUID REFERENCES anomaly_events(id),
  active BOOLEAN DEFAULT true
);

-- Create user security flags table
CREATE TABLE IF NOT EXISTS user_security_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type VARCHAR(50) NOT NULL, -- e.g., 'require_2fa', 'high_risk', 'monitoring'
  flag_value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_by VARCHAR(255),
  anomaly_event_id UUID REFERENCES anomaly_events(id),
  active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anomaly_events_timestamp ON anomaly_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_pattern_id ON anomaly_events(pattern_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_severity ON anomaly_events(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_resolved ON anomaly_events(resolved);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_affected_entities_gin ON anomaly_events USING gin(affected_entities);

CREATE INDEX IF NOT EXISTS idx_anomaly_actions_log_event_id ON anomaly_actions_log(anomaly_event_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_actions_log_status ON anomaly_actions_log(status);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_priority ON security_incidents(priority);
CREATE INDEX IF NOT EXISTS idx_security_incidents_category ON security_incidents(category);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON security_incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON blocked_ips(expires_at);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON blocked_ips(active);

CREATE INDEX IF NOT EXISTS idx_user_security_flags_user_id ON user_security_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_flags_flag_type ON user_security_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_user_security_flags_active ON user_security_flags(active);
CREATE INDEX IF NOT EXISTS idx_user_security_flags_expires_at ON user_security_flags(expires_at);

-- Create function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_security_records()
RETURNS void AS $$
BEGIN
  -- Clean up expired IP blocks
  UPDATE blocked_ips 
  SET active = false 
  WHERE expires_at < NOW() AND active = true;

  -- Clean up expired security flags
  UPDATE user_security_flags 
  SET active = false 
  WHERE expires_at < NOW() AND active = true;

  -- Clean up old anomaly events (keep for 90 days)
  DELETE FROM anomaly_events 
  WHERE created_at < NOW() - INTERVAL '90 days' 
    AND resolved = true;

  -- Clean up old security incidents (keep resolved ones for 1 year)
  DELETE FROM security_incidents 
  WHERE resolved_at < NOW() - INTERVAL '1 year' 
    AND status IN ('resolved', 'false_positive');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER trigger_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_anomaly_patterns_updated_at
    BEFORE UPDATE ON anomaly_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial comment for tracking
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('019', 'Anomaly Detection System - tables, indexes, and cleanup functions', NOW())
ON CONFLICT (version) DO NOTHING;