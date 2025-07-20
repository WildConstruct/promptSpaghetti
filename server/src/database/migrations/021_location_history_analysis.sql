-- Location History Analysis System Migration
-- Enhanced security insights and user behavior pattern analysis

-- User location clusters table for grouping similar locations
CREATE TABLE IF NOT EXISTS user_location_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label VARCHAR(20) NOT NULL CHECK (label IN ('home', 'work', 'frequent', 'occasional')),
  center_latitude DECIMAL(10, 8) NOT NULL,
  center_longitude DECIMAL(11, 8) NOT NULL,
  center_country VARCHAR(100),
  center_city VARCHAR(100),
  radius_km DECIMAL(8, 2) NOT NULL,
  access_count INTEGER DEFAULT 0,
  first_seen TIMESTAMP NOT NULL,
  last_seen TIMESTAMP NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  is_verified BOOLEAN DEFAULT false,
  verification_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User travel patterns table for analyzing movement between clusters
CREATE TABLE IF NOT EXISTS user_travel_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  route_id VARCHAR(100) NOT NULL,
  origin_cluster_id UUID REFERENCES user_location_clusters(id),
  destination_cluster_id UUID REFERENCES user_location_clusters(id),
  frequency INTEGER DEFAULT 1,
  avg_travel_time_minutes INTEGER,
  typical_travel_methods JSONB,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  anomalies JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User location profiles table for storing comprehensive analysis results
CREATE TABLE IF NOT EXISTS user_location_profiles (
  user_id UUID PRIMARY KEY,
  clusters_data JSONB NOT NULL,
  travel_patterns_data JSONB NOT NULL,
  risk_metrics JSONB NOT NULL,
  insights JSONB NOT NULL,
  last_analyzed TIMESTAMP DEFAULT NOW(),
  profile_version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Location anomalies table for tracking security events
CREATE TABLE IF NOT EXISTS location_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN (
    'new_location', 'unusual_timing', 'frequency_spike', 
    'travel_anomaly', 'risk_escalation'
  )),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),
  location_data JSONB NOT NULL,
  context_data JSONB,
  resolved BOOLEAN DEFAULT false,
  false_positive BOOLEAN DEFAULT false,
  resolution_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes for location clustering
CREATE INDEX IF NOT EXISTS idx_location_clusters_user_id ON user_location_clusters(user_id);
CREATE INDEX IF NOT EXISTS idx_location_clusters_label ON user_location_clusters(label);
CREATE INDEX IF NOT EXISTS idx_location_clusters_confidence ON user_location_clusters(confidence);
CREATE INDEX IF NOT EXISTS idx_location_clusters_risk_score ON user_location_clusters(risk_score);
CREATE INDEX IF NOT EXISTS idx_location_clusters_last_seen ON user_location_clusters(last_seen);
CREATE INDEX IF NOT EXISTS idx_location_clusters_verified ON user_location_clusters(is_verified);

-- Performance indexes for travel patterns
CREATE INDEX IF NOT EXISTS idx_travel_patterns_user_id ON user_travel_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_route ON user_travel_patterns(route_id);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_frequency ON user_travel_patterns(frequency);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_risk_score ON user_travel_patterns(risk_score);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_origin ON user_travel_patterns(origin_cluster_id);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_destination ON user_travel_patterns(destination_cluster_id);

-- Performance indexes for location profiles
CREATE INDEX IF NOT EXISTS idx_location_profiles_analyzed ON user_location_profiles(last_analyzed);
CREATE INDEX IF NOT EXISTS idx_location_profiles_version ON user_location_profiles(profile_version);
CREATE INDEX IF NOT EXISTS idx_location_profiles_updated ON user_location_profiles(updated_at);

-- Performance indexes for location anomalies
CREATE INDEX IF NOT EXISTS idx_location_anomalies_user_id ON location_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_severity ON location_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_resolved ON location_anomalies(resolved);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_type ON location_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_detected ON location_anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_false_positive ON location_anomalies(false_positive);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_location_clusters_user_label ON user_location_clusters(user_id, label);
CREATE INDEX IF NOT EXISTS idx_location_clusters_user_confidence ON user_location_clusters(user_id, confidence);
CREATE INDEX IF NOT EXISTS idx_travel_patterns_user_frequency ON user_travel_patterns(user_id, frequency);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_user_severity ON location_anomalies(user_id, severity);
CREATE INDEX IF NOT EXISTS idx_location_anomalies_user_resolved ON location_anomalies(user_id, resolved);

-- Geospatial indexes for location-based queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_location_clusters_geospatial ON user_location_clusters 
--   USING GIST (ST_Point(center_longitude, center_latitude));

-- Foreign key constraints
ALTER TABLE user_travel_patterns 
  ADD CONSTRAINT fk_travel_patterns_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_location_clusters 
  ADD CONSTRAINT fk_location_clusters_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_location_profiles 
  ADD CONSTRAINT fk_location_profiles_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE location_anomalies 
  ADD CONSTRAINT fk_location_anomalies_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Table comments for documentation
COMMENT ON TABLE user_location_clusters IS 'Location clusters for identifying home, work, and frequent locations';
COMMENT ON TABLE user_travel_patterns IS 'Travel patterns and routes between location clusters';
COMMENT ON TABLE user_location_profiles IS 'Comprehensive location behavior profiles for users';
COMMENT ON TABLE location_anomalies IS 'Location-based security anomalies and behavioral deviations';

COMMENT ON COLUMN user_location_clusters.label IS 'Type of location cluster (home, work, frequent, occasional)';
COMMENT ON COLUMN user_location_clusters.confidence IS 'Confidence score for cluster classification (0-1)';
COMMENT ON COLUMN user_location_clusters.radius_km IS 'Radius of cluster in kilometers';
COMMENT ON COLUMN user_location_clusters.verification_method IS 'How the cluster was verified (user_confirmed, pattern_analysis, etc.)';

COMMENT ON COLUMN user_travel_patterns.route_id IS 'Unique identifier for travel route between clusters';
COMMENT ON COLUMN user_travel_patterns.frequency IS 'Number of times this travel pattern was observed';
COMMENT ON COLUMN user_travel_patterns.avg_travel_time_minutes IS 'Average travel time for this route';
COMMENT ON COLUMN user_travel_patterns.typical_travel_methods IS 'JSON array of typical travel methods (air, ground, etc.)';
COMMENT ON COLUMN user_travel_patterns.anomalies IS 'JSON object describing travel anomalies';

COMMENT ON COLUMN user_location_profiles.clusters_data IS 'JSON array of location clusters';
COMMENT ON COLUMN user_location_profiles.travel_patterns_data IS 'JSON array of travel patterns';
COMMENT ON COLUMN user_location_profiles.risk_metrics IS 'JSON object with risk scoring metrics';
COMMENT ON COLUMN user_location_profiles.insights IS 'JSON object with behavioral insights';
COMMENT ON COLUMN user_location_profiles.profile_version IS 'Version of the analysis algorithm used';

COMMENT ON COLUMN location_anomalies.anomaly_type IS 'Type of location anomaly detected';
COMMENT ON COLUMN location_anomalies.location_data IS 'JSON object with location information';
COMMENT ON COLUMN location_anomalies.context_data IS 'JSON object with additional context';
COMMENT ON COLUMN location_anomalies.resolution_data IS 'JSON object with resolution details';