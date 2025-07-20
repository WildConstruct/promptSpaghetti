-- Device Fingerprinting System Migration
-- Advanced device identification and tracking for enhanced security

-- Device fingerprints table
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint VARCHAR(128) UNIQUE NOT NULL,
  components JSONB NOT NULL,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  seen_count INTEGER DEFAULT 1,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device-user associations table
CREATE TABLE IF NOT EXISTS device_user_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint VARCHAR(128) NOT NULL,
  user_id UUID NOT NULL,
  first_associated TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,
  is_trusted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_device_user_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_device_user_device FOREIGN KEY (device_fingerprint) REFERENCES device_fingerprints(fingerprint) ON DELETE CASCADE,
  CONSTRAINT uk_device_user UNIQUE (device_fingerprint, user_id)
);

-- Device trust profiles table
CREATE TABLE IF NOT EXISTS device_trust_profiles (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint VARCHAR(128) UNIQUE NOT NULL,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'suspicious', 'blocked')),
  behavior_metrics JSONB,
  location_history JSONB DEFAULT '[]'::jsonb,
  security_events JSONB DEFAULT '[]'::jsonb,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_device_trust_device FOREIGN KEY (fingerprint) REFERENCES device_fingerprints(fingerprint) ON DELETE CASCADE
);

-- Device security events table
CREATE TABLE IF NOT EXISTS device_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint VARCHAR(128) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  context_data JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_device_security_device FOREIGN KEY (device_fingerprint) REFERENCES device_fingerprints(fingerprint) ON DELETE CASCADE
);

-- Performance indexes for device fingerprints
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_trust_score ON device_fingerprints(trust_score);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_blocked ON device_fingerprints(is_blocked);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_last_seen ON device_fingerprints(last_seen);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_risk_factors ON device_fingerprints USING GIN(risk_factors);

-- Performance indexes for device-user associations
CREATE INDEX IF NOT EXISTS idx_device_user_device ON device_user_associations(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_user_user ON device_user_associations(user_id);
CREATE INDEX IF NOT EXISTS idx_device_user_trusted ON device_user_associations(is_trusted);
CREATE INDEX IF NOT EXISTS idx_device_user_primary ON device_user_associations(is_primary);
CREATE INDEX IF NOT EXISTS idx_device_user_last_accessed ON device_user_associations(last_accessed);

-- Performance indexes for device trust profiles
CREATE INDEX IF NOT EXISTS idx_device_trust_fingerprint ON device_trust_profiles(fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_trust_status ON device_trust_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_device_trust_score ON device_trust_profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_device_trust_updated ON device_trust_profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_device_trust_behavior ON device_trust_profiles USING GIN(behavior_metrics);

-- Performance indexes for device security events
CREATE INDEX IF NOT EXISTS idx_device_security_device ON device_security_events(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_security_type ON device_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_device_security_severity ON device_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_device_security_resolved ON device_security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_device_security_created ON device_security_events(created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_device_user_device_trusted ON device_user_associations(device_fingerprint, is_trusted);
CREATE INDEX IF NOT EXISTS idx_device_user_user_primary ON device_user_associations(user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_device_security_device_unresolved ON device_security_events(device_fingerprint, resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_blocked_trust ON device_fingerprints(is_blocked, trust_score);

-- Table comments for documentation
COMMENT ON TABLE device_fingerprints IS 'Stores unique device fingerprints and their trust metrics';
COMMENT ON TABLE device_user_associations IS 'Maps devices to users with trust and access metrics';
COMMENT ON TABLE device_trust_profiles IS 'Detailed trust profiles for device behavior analysis';
COMMENT ON TABLE device_security_events IS 'Security events related to specific devices';

COMMENT ON COLUMN device_fingerprints.fingerprint IS 'SHA256 hash of device components';
COMMENT ON COLUMN device_fingerprints.components IS 'JSON object containing device characteristics';
COMMENT ON COLUMN device_fingerprints.trust_score IS 'Trust score from 0-100, higher is more trusted';
COMMENT ON COLUMN device_fingerprints.risk_factors IS 'JSON array of identified risk factors';

COMMENT ON COLUMN device_user_associations.is_primary IS 'Whether this is the user primary device';
COMMENT ON COLUMN device_user_associations.is_trusted IS 'Whether the user has explicitly trusted this device';
COMMENT ON COLUMN device_user_associations.access_count IS 'Number of times user accessed from this device';

COMMENT ON COLUMN device_trust_profiles.verification_status IS 'Current verification state of the device';
COMMENT ON COLUMN device_trust_profiles.behavior_metrics IS 'JSON object with behavioral analysis metrics';
COMMENT ON COLUMN device_trust_profiles.location_history IS 'JSON array of recent location accesses';
COMMENT ON COLUMN device_trust_profiles.security_events IS 'JSON array of security events summary';

COMMENT ON COLUMN device_security_events.event_type IS 'Type of security event (new_device, fingerprint_change, etc.)';
COMMENT ON COLUMN device_security_events.context_data IS 'JSON object with event-specific context';
COMMENT ON COLUMN device_security_events.resolved_by IS 'User or system that resolved the event';

-- Cleanup function for old device data
CREATE OR REPLACE FUNCTION cleanup_old_device_data()
RETURNS void AS $$
BEGIN
  -- Delete unaccessed devices older than 180 days
  DELETE FROM device_fingerprints
  WHERE last_seen < NOW() - INTERVAL '180 days'
    AND trust_score < 50
    AND NOT EXISTS (
      SELECT 1 FROM device_user_associations
      WHERE device_fingerprint = device_fingerprints.fingerprint
        AND is_trusted = true
    );
  
  -- Delete resolved security events older than 90 days
  DELETE FROM device_security_events
  WHERE resolved = true
    AND resolved_at < NOW() - INTERVAL '90 days';
  
  -- Update trust scores for inactive devices
  UPDATE device_fingerprints
  SET trust_score = GREATEST(trust_score - 5, 0),
      updated_at = NOW()
  WHERE last_seen < NOW() - INTERVAL '30 days'
    AND trust_score > 20;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-device-data', '0 3 * * *', 'SELECT cleanup_old_device_data();');