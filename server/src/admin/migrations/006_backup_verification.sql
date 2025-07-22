-- Backup Verification System Migration - Epic 17.4.6
-- Task: E17-1753114397279-AC5DA5 - Create verification steps
-- Epic: 17 - Backstage Admin Controls (Story 17.4.6 - Backup System)

-- ==========================================
-- BACKUP VERIFICATION SESSIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS backup_verification_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  backup_id VARCHAR(255) NOT NULL,
  initiated_by VARCHAR(255) NOT NULL,
  initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Session configuration
  configuration_steps_enabled TEXT, -- JSON array of enabled step IDs
  configuration_steps_disabled TEXT, -- JSON array of disabled step IDs
  configuration_timeout_overrides TEXT, -- JSON object of timeout overrides
  configuration_retry_overrides TEXT, -- JSON object of retry overrides
  configuration_custom_parameters TEXT, -- JSON object of custom parameters
  configuration_skip_on_warnings BOOLEAN DEFAULT FALSE,
  configuration_abort_on_critical_failure BOOLEAN DEFAULT TRUE,
  
  -- Summary statistics
  total_steps INTEGER DEFAULT 0,
  passed_steps INTEGER DEFAULT 0,
  failed_steps INTEGER DEFAULT 0,
  warning_steps INTEGER DEFAULT 0,
  skipped_steps INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- milliseconds
  overall_status VARCHAR(50) DEFAULT 'pending',
  risk_level VARCHAR(50) DEFAULT 'low',
  critical_issues TEXT, -- JSON array of critical issues
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_backup_verification_sessions_backup_id (backup_id),
  INDEX idx_backup_verification_sessions_status (status),
  INDEX idx_backup_verification_sessions_initiated_by (initiated_by),
  INDEX idx_backup_verification_sessions_initiated_at (initiated_at),
  INDEX idx_backup_verification_sessions_overall_status (overall_status),
  INDEX idx_backup_verification_sessions_risk_level (risk_level)
);

-- ==========================================
-- BACKUP VERIFICATION RESULTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS backup_verification_results (
  result_id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  step_id VARCHAR(255) NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_type VARCHAR(100) NOT NULL,
  
  -- Result details
  status VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
  
  -- Result data
  details TEXT, -- JSON object with step-specific details
  warnings TEXT, -- JSON array of warning messages
  recommendations TEXT, -- JSON array of recommendations
  
  -- Execution metadata
  execution_order INTEGER NOT NULL DEFAULT 0,
  retry_attempt INTEGER NOT NULL DEFAULT 0,
  dependency_resolution_time INTEGER DEFAULT 0, -- milliseconds
  
  -- Indexes
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES backup_verification_sessions(session_id) ON DELETE CASCADE,
  INDEX idx_backup_verification_results_session_id (session_id),
  INDEX idx_backup_verification_results_step_id (step_id),
  INDEX idx_backup_verification_results_step_type (step_type),
  INDEX idx_backup_verification_results_status (status),
  INDEX idx_backup_verification_results_timestamp (timestamp),
  INDEX idx_backup_verification_results_execution_order (execution_order)
);

-- ==========================================
-- BACKUP VERIFICATION STEPS CONFIGURATION
-- ==========================================

CREATE TABLE IF NOT EXISTS backup_verification_step_config (
  step_id VARCHAR(255) PRIMARY KEY,
  step_name VARCHAR(255) NOT NULL,
  step_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  
  -- Step configuration
  required BOOLEAN NOT NULL DEFAULT FALSE,
  timeout INTEGER NOT NULL DEFAULT 30000, -- milliseconds
  retry_attempts INTEGER NOT NULL DEFAULT 2,
  dependencies TEXT, -- JSON array of dependent step IDs
  configurable BOOLEAN NOT NULL DEFAULT TRUE,
  estimated_duration INTEGER NOT NULL DEFAULT 10, -- seconds
  
  -- Custom parameters schema
  parameter_schema TEXT, -- JSON schema for custom parameters
  default_parameters TEXT, -- JSON object with default parameter values
  
  -- Configuration state
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_modified_by VARCHAR(255),
  last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_backup_verification_step_config_step_type (step_type),
  INDEX idx_backup_verification_step_config_required (required),
  INDEX idx_backup_verification_step_config_enabled (enabled),
  INDEX idx_backup_verification_step_config_last_modified (last_modified_at)
);

-- ==========================================
-- BACKUP DATA REGISTRY
-- ==========================================

CREATE TABLE IF NOT EXISTS backup_data_registry (
  backup_id VARCHAR(255) PRIMARY KEY,
  backup_path VARCHAR(500) NOT NULL,
  backup_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  
  -- Size information
  original_size BIGINT NOT NULL DEFAULT 0,
  compressed_size BIGINT NOT NULL DEFAULT 0,
  compression_ratio DECIMAL(5,2) DEFAULT 0.00,
  
  -- Integrity information
  checksum VARCHAR(255),
  checksum_algorithm VARCHAR(50) DEFAULT 'sha256',
  
  -- Metadata
  metadata_version VARCHAR(50),
  metadata_source VARCHAR(255),
  metadata_components TEXT, -- JSON array of backup components
  metadata_dependencies TEXT, -- JSON array of dependencies
  
  -- Encryption information
  encryption_enabled BOOLEAN DEFAULT FALSE,
  encryption_algorithm VARCHAR(100),
  encryption_key_id VARCHAR(255),
  
  -- Retention information
  retention_policy VARCHAR(100) DEFAULT 'default',
  retention_period_days INTEGER DEFAULT 30,
  expiration_date TIMESTAMP,
  
  -- Registry metadata
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at TIMESTAMP,
  verification_status VARCHAR(50) DEFAULT 'not_verified',
  
  INDEX idx_backup_data_registry_backup_type (backup_type),
  INDEX idx_backup_data_registry_created_at (created_at),
  INDEX idx_backup_data_registry_verification_status (verification_status),
  INDEX idx_backup_data_registry_expiration_date (expiration_date),
  INDEX idx_backup_data_registry_last_verified (last_verified_at)
);

-- ==========================================
-- VERIFICATION STEP PERFORMANCE METRICS
-- ==========================================

CREATE TABLE IF NOT EXISTS backup_verification_step_metrics (
  metric_id VARCHAR(255) PRIMARY KEY,
  step_id VARCHAR(255) NOT NULL,
  step_type VARCHAR(100) NOT NULL,
  
  -- Performance data
  execution_date DATE NOT NULL,
  total_executions INTEGER NOT NULL DEFAULT 0,
  successful_executions INTEGER NOT NULL DEFAULT 0,
  failed_executions INTEGER NOT NULL DEFAULT 0,
  average_duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
  min_duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
  max_duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
  
  -- Success rate calculations
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  failure_rate DECIMAL(5,2) DEFAULT 0.00,
  timeout_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Reliability metrics
  retry_rate DECIMAL(5,2) DEFAULT 0.00,
  dependency_failure_rate DECIMAL(5,2) DEFAULT 0.00,
  critical_failure_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Metadata
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_step_date (step_id, execution_date),
  INDEX idx_backup_verification_step_metrics_step_id (step_id),
  INDEX idx_backup_verification_step_metrics_step_type (step_type),
  INDEX idx_backup_verification_step_metrics_execution_date (execution_date),
  INDEX idx_backup_verification_step_metrics_success_rate (success_rate)
);

-- ==========================================
-- INSERT DEFAULT VERIFICATION STEPS
-- ==========================================

INSERT INTO backup_verification_step_config (
  step_id, step_name, step_type, description, required, timeout, retry_attempts, 
  dependencies, configurable, estimated_duration, parameter_schema, default_parameters
) VALUES
-- Integrity verification steps
('integrity_checksum', 'Checksum Verification', 'integrity', 'Verify backup file integrity using checksum validation', TRUE, 60000, 2, '[]', TRUE, 30, '{"type":"object","properties":{"algorithm":{"type":"string","enum":["md5","sha1","sha256","sha512"],"default":"sha256"}}}', '{"algorithm":"sha256"}'),
('integrity_structure', 'Archive Structure Check', 'integrity', 'Validate internal archive structure and file listings', TRUE, 45000, 1, '["integrity_checksum"]', TRUE, 20, '{"type":"object","properties":{"deep_scan":{"type":"boolean","default":true}}}', '{"deep_scan":true}'),
('integrity_corruption', 'Corruption Detection', 'integrity', 'Scan for data corruption patterns and inconsistencies', TRUE, 90000, 2, '["integrity_structure"]', TRUE, 45, '{}', '{}'),

-- Accessibility verification steps
('accessibility_read', 'Read Access Test', 'accessibility', 'Test backup file read accessibility and permissions', TRUE, 30000, 3, '[]', FALSE, 10, '{}', '{}'),
('accessibility_mount', 'Mount Point Verification', 'accessibility', 'Verify backup storage mount points and availability', TRUE, 20000, 2, '["accessibility_read"]', TRUE, 15, '{"type":"object","properties":{"verify_space":{"type":"boolean","default":true}}}', '{"verify_space":true}'),
('accessibility_network', 'Network Path Validation', 'accessibility', 'Validate network paths and remote storage connectivity', FALSE, 40000, 2, '["accessibility_mount"]', TRUE, 25, '{"type":"object","properties":{"timeout_seconds":{"type":"integer","default":30}}}', '{"timeout_seconds":30}'),

-- Encryption verification steps
('encryption_status', 'Encryption Status Check', 'encryption', 'Verify backup encryption status and algorithm', FALSE, 15000, 1, '[]', FALSE, 5, '{}', '{}'),
('encryption_key', 'Key Availability Test', 'encryption', 'Test encryption key accessibility and validity', FALSE, 25000, 2, '["encryption_status"]', TRUE, 10, '{"type":"object","properties":{"key_rotation_check":{"type":"boolean","default":false}}}', '{"key_rotation_check":false}'),

-- Restoration verification steps
('restoration_test', 'Test Restoration', 'restoration', 'Perform sample restoration to verify backup completeness', FALSE, 180000, 1, '["integrity_checksum","accessibility_read"]', TRUE, 120, '{"type":"object","properties":{"sample_size":{"type":"integer","default":10},"temp_location":{"type":"string"}}}', '{"sample_size":10}'),
('restoration_validate', 'Restoration Validation', 'restoration', 'Validate restored data against original checksums', FALSE, 120000, 1, '["restoration_test"]', TRUE, 90, '{}', '{}'),

-- Compliance verification steps
('compliance_retention', 'Retention Policy Check', 'compliance', 'Verify backup meets retention policy requirements', TRUE, 10000, 1, '[]', TRUE, 5, '{"type":"object","properties":{"policy_name":{"type":"string"}}}', '{}'),
('compliance_audit', 'Audit Trail Verification', 'compliance', 'Verify backup audit trail and metadata completeness', TRUE, 15000, 1, '["compliance_retention"]', FALSE, 10, '{}', '{}'),

-- Metadata verification steps
('metadata_extract', 'Metadata Extraction', 'metadata', 'Extract and validate backup metadata information', TRUE, 20000, 1, '[]', FALSE, 15, '{}', '{}'),
('metadata_consistency', 'Metadata Consistency Check', 'metadata', 'Verify metadata consistency with actual backup content', TRUE, 30000, 2, '["metadata_extract"]', TRUE, 20, '{}', '{}'),

-- Performance verification steps
('performance_size', 'Size Analysis', 'performance', 'Analyze backup size efficiency and compression ratios', FALSE, 25000, 1, '[]', TRUE, 15, '{"type":"object","properties":{"compression_threshold":{"type":"number","default":0.3}}}', '{"compression_threshold":0.3}');

-- ==========================================
-- TRIGGER FOR UPDATING TIMESTAMPS
-- ==========================================

DELIMITER //

CREATE TRIGGER backup_verification_sessions_updated_at
  BEFORE UPDATE ON backup_verification_sessions
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER backup_verification_step_config_updated_at  
  BEFORE UPDATE ON backup_verification_step_config
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ==========================================
-- INITIAL INDEXES FOR PERFORMANCE
-- ==========================================

-- Composite indexes for common queries
CREATE INDEX idx_sessions_status_backup ON backup_verification_sessions(status, backup_id);
CREATE INDEX idx_sessions_initiated_status ON backup_verification_sessions(initiated_at, status);
CREATE INDEX idx_results_session_execution ON backup_verification_results(session_id, execution_order);
CREATE INDEX idx_results_step_status ON backup_verification_results(step_id, status);
CREATE INDEX idx_metrics_step_date ON backup_verification_step_metrics(step_id, execution_date);

-- ==========================================
-- MIGRATION COMPLETION LOG
-- ==========================================

INSERT INTO migration_log (migration_name, executed_at, description) VALUES
('006_backup_verification', CURRENT_TIMESTAMP, 'Epic 17.4.6 - Backup verification system tables and default step configuration');