-- Epic 17.5.3 - Transaction Monitoring Database Schema
-- Migration to add transaction monitoring and anomaly detection tables

-- Transaction audit log for admin actions
CREATE TABLE IF NOT EXISTS transaction_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    admin_user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_transaction_audit_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_audit_admin 
        FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction notes for admin investigations
CREATE TABLE IF NOT EXISTS transaction_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    admin_user_id VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_transaction_notes_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_notes_admin 
        FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction flags for manual review
CREATE TABLE IF NOT EXISTS transaction_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    admin_user_id VARCHAR(255) NOT NULL,
    flag_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    
    CONSTRAINT fk_transaction_flags_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_flags_admin 
        FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_flags_resolver 
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_flag_status 
        CHECK (status IN ('active', 'resolved', 'dismissed'))
);

-- Transaction anomaly detection results
CREATE TABLE IF NOT EXISTS transaction_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    suggested_actions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    detected_at TIMESTAMP DEFAULT NOW(),
    investigated_by VARCHAR(255),
    investigated_at TIMESTAMP,
    resolution TEXT,
    
    CONSTRAINT fk_transaction_anomalies_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_anomalies_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_anomalies_investigator 
        FOREIGN KEY (investigated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_anomaly_severity 
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_anomaly_status 
        CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive')),
    CONSTRAINT chk_confidence_range 
        CHECK (confidence >= 0 AND confidence <= 1)
);

-- Fraud ring detection results
CREATE TABLE IF NOT EXISTS fraud_rings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ids JSONB NOT NULL,
    suspicious_activities JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    total_amount_cents BIGINT NOT NULL,
    transaction_count INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'suspected',
    detected_at TIMESTAMP DEFAULT NOW(),
    investigated_by VARCHAR(255),
    investigated_at TIMESTAMP,
    resolution TEXT,
    
    CONSTRAINT fk_fraud_rings_investigator 
        FOREIGN KEY (investigated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_fraud_ring_status 
        CHECK (status IN ('suspected', 'confirmed', 'dismissed')),
    CONSTRAINT chk_fraud_ring_confidence 
        CHECK (confidence >= 0 AND confidence <= 1)
);

-- Transaction monitoring alerts
CREATE TABLE IF NOT EXISTS transaction_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_transaction_alerts_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_alerts_acknowledger 
        FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_alert_severity 
        CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Transaction monitoring configuration
CREATE TABLE IF NOT EXISTS transaction_monitoring_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_transaction_config_updater 
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_transaction_audit_log_transaction_id ON transaction_audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_audit_log_created_at ON transaction_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_audit_log_admin_user_id ON transaction_audit_log(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_transaction_notes_transaction_id ON transaction_notes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_notes_created_at ON transaction_notes(created_at);

CREATE INDEX IF NOT EXISTS idx_transaction_flags_transaction_id ON transaction_flags(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_flags_status ON transaction_flags(status);
CREATE INDEX IF NOT EXISTS idx_transaction_flags_created_at ON transaction_flags(created_at);

CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_transaction_id ON transaction_anomalies(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_user_id ON transaction_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_severity ON transaction_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_status ON transaction_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_detected_at ON transaction_anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_pattern_type ON transaction_anomalies(pattern_type);

CREATE INDEX IF NOT EXISTS idx_fraud_rings_status ON fraud_rings(status);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_detected_at ON fraud_rings(detected_at);

CREATE INDEX IF NOT EXISTS idx_transaction_alerts_transaction_id ON transaction_alerts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_alerts_severity ON transaction_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_transaction_alerts_acknowledged ON transaction_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_transaction_alerts_created_at ON transaction_alerts(created_at);

-- GIN indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_evidence_gin ON transaction_anomalies USING GIN(evidence);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_user_ids_gin ON fraud_rings USING GIN(user_ids);
CREATE INDEX IF NOT EXISTS idx_transaction_alerts_metadata_gin ON transaction_alerts USING GIN(metadata);

-- Insert default configuration values
INSERT INTO transaction_monitoring_config (config_key, config_value, description) VALUES 
(
    'anomaly_detection_patterns',
    '{
        "velocity_threshold": 5,
        "amount_threshold_low": 100000,
        "amount_threshold_high": 500000,
        "behavior_threshold": 3,
        "payment_method_sharing_threshold": 5,
        "enabled_patterns": ["velocity", "amount", "behavior", "payment_method", "time"]
    }',
    'Configuration for anomaly detection patterns and thresholds'
),
(
    'alert_settings',
    '{
        "email_enabled": true,
        "webhook_enabled": false,
        "critical_alert_threshold": 0.8,
        "auto_escalation_minutes": 30,
        "max_alerts_per_hour": 50
    }',
    'Alert notification and escalation settings'
),
(
    'fraud_ring_detection',
    '{
        "min_users_for_ring": 3,
        "min_amount_for_ring": 50000,
        "time_window_days": 30,
        "confidence_threshold": 0.7,
        "auto_investigate": false
    }',
    'Fraud ring detection configuration'
),
(
    'dashboard_settings',
    '{
        "refresh_interval_seconds": 30,
        "default_time_range": "24h",
        "max_export_rows": 10000,
        "enable_real_time_updates": true
    }',
    'Transaction monitoring dashboard settings'
)
ON CONFLICT (config_key) DO NOTHING;

-- Create a view for transaction monitoring dashboard
CREATE OR REPLACE VIEW transaction_monitoring_dashboard AS
SELECT 
    DATE_TRUNC('hour', t.created_at) as hour_bucket,
    COUNT(*) as transaction_count,
    SUM(t.amount_cents) as total_amount_cents,
    COUNT(*) FILTER (WHERE t.status = 'succeeded') as successful_transactions,
    COUNT(*) FILTER (WHERE t.status = 'failed') as failed_transactions,
    COUNT(*) FILTER (WHERE t.risk_score > 70) as high_risk_transactions,
    COUNT(ta.id) as anomaly_count,
    COUNT(ta.id) FILTER (WHERE ta.severity = 'critical') as critical_anomalies,
    AVG(t.risk_score) as avg_risk_score
FROM transactions t
LEFT JOIN transaction_anomalies ta ON t.id = ta.transaction_id AND ta.detected_at >= DATE_TRUNC('hour', t.created_at)
WHERE t.created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', t.created_at)
ORDER BY hour_bucket DESC;

-- Create a function to automatically detect anomalies on transaction insert/update
CREATE OR REPLACE FUNCTION detect_transaction_anomalies()
RETURNS TRIGGER AS $$
BEGIN
    -- This would trigger anomaly detection service
    -- For now, just log the event
    INSERT INTO transaction_audit_log (
        transaction_id, 
        admin_user_id, 
        action, 
        new_value, 
        reason
    ) VALUES (
        NEW.id,
        'system',
        'transaction_created',
        row_to_json(NEW)::text,
        'Automatic anomaly detection trigger'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for anomaly detection
DROP TRIGGER IF EXISTS trigger_detect_anomalies ON transactions;
CREATE TRIGGER trigger_detect_anomalies
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION detect_transaction_anomalies();

-- Add comments for documentation
COMMENT ON TABLE transaction_audit_log IS 'Audit trail for all admin actions on transactions';
COMMENT ON TABLE transaction_notes IS 'Admin notes and comments for transaction investigations';
COMMENT ON TABLE transaction_flags IS 'Manual flags added by admins for transactions requiring review';
COMMENT ON TABLE transaction_anomalies IS 'Automatically detected transaction anomalies and patterns';
COMMENT ON TABLE fraud_rings IS 'Detected fraud rings and coordinated suspicious activities';
COMMENT ON TABLE transaction_alerts IS 'System-generated alerts for transaction monitoring';
COMMENT ON TABLE transaction_monitoring_config IS 'Configuration settings for transaction monitoring system';

COMMENT ON INDEX idx_transaction_anomalies_evidence_gin IS 'GIN index for fast JSONB queries on anomaly evidence';
COMMENT ON INDEX idx_fraud_rings_user_ids_gin IS 'GIN index for fast JSONB queries on fraud ring user IDs';

COMMENT ON VIEW transaction_monitoring_dashboard IS 'Aggregated view for transaction monitoring dashboard metrics';

COMMENT ON FUNCTION detect_transaction_anomalies() IS 'Trigger function to automatically detect anomalies on transaction changes';