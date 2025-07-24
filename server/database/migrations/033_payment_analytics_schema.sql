/**
 * Payment Analytics Database Schema
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Complete database schema for payment analytics collection and reporting
 */

-- Payment Events Table
CREATE TABLE IF NOT EXISTS payment_events (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_payment_events_type (type),
    INDEX idx_payment_events_timestamp (timestamp),
    INDEX idx_payment_events_user (user_id),
    INDEX idx_payment_events_session (session_id),
    INDEX idx_payment_events_provider ((metadata->>'provider')),
    INDEX idx_payment_events_composite (type, timestamp, (metadata->>'provider'))
);

-- Payment Webhook Events Table
CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    data JSONB,
    received_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    processing_status ENUM('pending', 'processed', 'failed', 'ignored') DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_webhook_events_provider (provider),
    INDEX idx_webhook_events_type (event_type),
    INDEX idx_webhook_events_status (processing_status),
    INDEX idx_webhook_events_received (received_at),
    INDEX idx_webhook_events_composite (provider, event_type, processing_status)
);

-- Provider Metrics Hourly Aggregation Table
CREATE TABLE IF NOT EXISTS provider_metrics_hourly (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    hour_key VARCHAR(13) NOT NULL, -- YYYY-MM-DDTHH format
    attempts INT DEFAULT 0,
    successes INT DEFAULT 0,
    failures INT DEFAULT 0,
    total_volume BIGINT DEFAULT 0,
    total_fees BIGINT DEFAULT 0,
    processing_time_sum BIGINT DEFAULT 0,
    processing_time_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_provider_hour (provider, hour_key),
    
    -- Indexes
    INDEX idx_provider_metrics_provider (provider),
    INDEX idx_provider_metrics_hour (hour_key),
    INDEX idx_provider_metrics_composite (provider, hour_key)
);

-- Payment Method Performance Table
CREATE TABLE IF NOT EXISTS payment_method_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    attempts INT DEFAULT 0,
    successes INT DEFAULT 0,
    failures INT DEFAULT 0,
    total_volume BIGINT DEFAULT 0,
    total_processing_time BIGINT DEFAULT 0,
    device_mobile_attempts INT DEFAULT 0,
    device_mobile_successes INT DEFAULT 0,
    device_desktop_attempts INT DEFAULT 0,
    device_desktop_successes INT DEFAULT 0,
    device_tablet_attempts INT DEFAULT 0,
    device_tablet_successes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_method_date (provider, method_type, date),
    
    -- Indexes
    INDEX idx_method_performance_provider (provider),
    INDEX idx_method_performance_method (method_type),
    INDEX idx_method_performance_date (date),
    INDEX idx_method_performance_composite (provider, method_type, date)
);

-- Payment Failure Analysis Table
CREATE TABLE IF NOT EXISTS payment_failure_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    error_code VARCHAR(100) NOT NULL,
    failure_reason TEXT,
    hour_key VARCHAR(13) NOT NULL, -- YYYY-MM-DDTHH format
    count INT DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_failure_hour (provider, error_code, hour_key),
    
    -- Indexes
    INDEX idx_failure_analysis_provider (provider),
    INDEX idx_failure_analysis_error (error_code),
    INDEX idx_failure_analysis_hour (hour_key),
    INDEX idx_failure_analysis_composite (provider, error_code, hour_key)
);

-- Geographic Payment Performance Table
CREATE TABLE IF NOT EXISTS geographic_payment_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    date DATE NOT NULL,
    attempts INT DEFAULT 0,
    successes INT DEFAULT 0,
    failures INT DEFAULT 0,
    total_volume BIGINT DEFAULT 0,
    total_processing_time BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_geo_date (provider, country_code, date),
    
    -- Indexes
    INDEX idx_geo_performance_provider (provider),
    INDEX idx_geo_performance_country (country_code),
    INDEX idx_geo_performance_date (date),
    INDEX idx_geo_performance_composite (provider, country_code, date)
);

-- Payment Routing Rules Table
CREATE TABLE IF NOT EXISTS payment_routing_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB,
    actions JSONB,
    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_routing_rules_active (is_active),
    INDEX idx_routing_rules_priority (priority),
    INDEX idx_routing_rules_composite (is_active, priority)
);

-- Payment Optimization Recommendations Table
CREATE TABLE IF NOT EXISTS payment_optimization_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    type ENUM('routing', 'retry', 'method', 'provider', 'performance') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact ENUM('high', 'medium', 'low') NOT NULL,
    effort ENUM('high', 'medium', 'low') NOT NULL,
    priority INT NOT NULL,
    estimated_improvement JSONB,
    action_items JSONB,
    status ENUM('pending', 'in_progress', 'completed', 'dismissed') DEFAULT 'pending',
    provider VARCHAR(50),
    method_type VARCHAR(50),
    failure_code VARCHAR(100),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_recommendations_status (status),
    INDEX idx_recommendations_priority (priority),
    INDEX idx_recommendations_type (type),
    INDEX idx_recommendations_provider (provider),
    INDEX idx_recommendations_composite (status, priority, type)
);

-- Payment Performance Alerts Table
CREATE TABLE IF NOT EXISTS payment_performance_alerts (
    id VARCHAR(255) PRIMARY KEY,
    alert_type ENUM('success_rate', 'processing_time', 'failure_rate', 'volume_drop') NOT NULL,
    provider VARCHAR(50) NOT NULL,
    method_type VARCHAR(50),
    threshold_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    message TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_alerts_type (alert_type),
    INDEX idx_alerts_provider (provider),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_resolved (is_resolved),
    INDEX idx_alerts_created (created_at),
    INDEX idx_alerts_composite (provider, alert_type, is_resolved)
);

-- Payment Analytics Dashboard Config Table
CREATE TABLE IF NOT EXISTS payment_analytics_dashboard_config (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    dashboard_name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_dashboard_config_user (user_id),
    INDEX idx_dashboard_config_default (is_default),
    INDEX idx_dashboard_config_composite (user_id, is_default)
);

-- Payment Provider API Keys Table (encrypted)
CREATE TABLE IF NOT EXISTS payment_provider_api_keys (
    id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    key_type ENUM('public', 'secret', 'webhook_secret') NOT NULL,
    key_value_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    environment ENUM('sandbox', 'production') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_provider_key_env (provider, key_type, environment),
    
    -- Indexes
    INDEX idx_api_keys_provider (provider),
    INDEX idx_api_keys_type (key_type),
    INDEX idx_api_keys_active (is_active),
    INDEX idx_api_keys_env (environment),
    INDEX idx_api_keys_composite (provider, key_type, environment, is_active)
);

-- Payment Retry Logic Configuration Table
CREATE TABLE IF NOT EXISTS payment_retry_configuration (
    id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    error_code VARCHAR(100) NOT NULL,
    max_retries INT DEFAULT 3,
    retry_delays JSONB, -- Array of delay intervals in milliseconds
    exponential_backoff BOOLEAN DEFAULT true,
    jitter_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_provider_error (provider, error_code),
    
    -- Indexes
    INDEX idx_retry_config_provider (provider),
    INDEX idx_retry_config_error (error_code),
    INDEX idx_retry_config_active (is_active),
    INDEX idx_retry_config_composite (provider, error_code, is_active)
);

-- Create Views for Common Queries

-- Provider Performance Summary View
CREATE OR REPLACE VIEW provider_performance_summary AS
SELECT 
    provider,
    DATE(FROM_UNIXTIME(timestamp / 1000)) as date,
    COUNT(CASE WHEN type = 'payment_attempt' THEN 1 END) as attempts,
    COUNT(CASE WHEN type = 'payment_success' THEN 1 END) as successes,
    COUNT(CASE WHEN type = 'payment_failure' THEN 1 END) as failures,
    ROUND(
        (COUNT(CASE WHEN type = 'payment_success' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN type = 'payment_attempt' THEN 1 END), 0), 
        2
    ) as success_rate,
    SUM(CASE 
        WHEN type = 'payment_success' AND JSON_VALID(metadata) THEN 
            CAST(JSON_EXTRACT(metadata, '$.amount') AS SIGNED)
        ELSE 0 
    END) as total_volume,
    AVG(CASE 
        WHEN type = 'payment_success' AND JSON_VALID(metadata) THEN 
            CAST(JSON_EXTRACT(metadata, '$.processingTime') AS SIGNED)
        ELSE NULL 
    END) as avg_processing_time
FROM payment_events 
WHERE JSON_EXTRACT(metadata, '$.provider') IS NOT NULL
GROUP BY provider, DATE(FROM_UNIXTIME(timestamp / 1000));

-- Failure Analysis Summary View
CREATE OR REPLACE VIEW failure_analysis_summary AS
SELECT 
    JSON_EXTRACT(metadata, '$.provider') as provider,
    JSON_EXTRACT(metadata, '$.errorCode') as error_code,
    JSON_EXTRACT(metadata, '$.failureReason') as failure_reason,
    COUNT(*) as frequency,
    DATE(FROM_UNIXTIME(timestamp / 1000)) as date,
    HOUR(FROM_UNIXTIME(timestamp / 1000)) as hour
FROM payment_events 
WHERE type = 'payment_failure' 
    AND JSON_VALID(metadata)
    AND JSON_EXTRACT(metadata, '$.errorCode') IS NOT NULL
GROUP BY provider, error_code, failure_reason, date, hour;

-- Real-time Performance Dashboard View
CREATE OR REPLACE VIEW realtime_performance_dashboard AS
SELECT 
    JSON_EXTRACT(metadata, '$.provider') as provider,
    COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR) * 1000 
               AND type = 'payment_attempt' THEN 1 END) as attempts_last_hour,
    COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR) * 1000 
               AND type = 'payment_success' THEN 1 END) as successes_last_hour,
    COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR) * 1000 
               AND type = 'payment_failure' THEN 1 END) as failures_last_hour,
    ROUND(
        (COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR) * 1000 
                    AND type = 'payment_success' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR) * 1000 
                          AND type = 'payment_attempt' THEN 1 END), 0), 
        2
    ) as success_rate_last_hour,
    COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 24 HOUR) * 1000 
               AND type = 'payment_attempt' THEN 1 END) as attempts_last_24h,
    COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 24 HOUR) * 1000 
               AND type = 'payment_success' THEN 1 END) as successes_last_24h,
    ROUND(
        (COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 24 HOUR) * 1000 
                    AND type = 'payment_success' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 24 HOUR) * 1000 
                          AND type = 'payment_attempt' THEN 1 END), 0), 
        2
    ) as success_rate_last_24h
FROM payment_events 
WHERE JSON_VALID(metadata)
    AND JSON_EXTRACT(metadata, '$.provider') IS NOT NULL
    AND timestamp >= UNIX_TIMESTAMP(NOW() - INTERVAL 24 HOUR) * 1000
GROUP BY provider;

-- Add Triggers for Real-time Metrics Updates

DELIMITER //

-- Trigger for provider metrics hourly aggregation
CREATE TRIGGER update_provider_metrics_on_payment_event
AFTER INSERT ON payment_events
FOR EACH ROW
BEGIN
    DECLARE provider_name VARCHAR(50);
    DECLARE hour_key_val VARCHAR(13);
    DECLARE amount_val BIGINT DEFAULT 0;
    DECLARE fees_val BIGINT DEFAULT 0;
    DECLARE processing_time_val BIGINT DEFAULT 0;
    
    -- Extract provider from metadata
    IF JSON_VALID(NEW.metadata) THEN
        SET provider_name = JSON_UNQUOTE(JSON_EXTRACT(NEW.metadata, '$.provider'));
        SET hour_key_val = DATE_FORMAT(FROM_UNIXTIME(NEW.timestamp / 1000), '%Y-%m-%dT%H');
        
        -- Extract values based on event type
        IF NEW.type = 'payment_success' THEN
            SET amount_val = COALESCE(JSON_EXTRACT(NEW.metadata, '$.amount'), 0);
            SET fees_val = COALESCE(JSON_EXTRACT(NEW.metadata, '$.fees'), 0);
            SET processing_time_val = COALESCE(JSON_EXTRACT(NEW.metadata, '$.processingTime'), 0);
        END IF;
        
        -- Update or insert provider metrics
        INSERT INTO provider_metrics_hourly (
            provider, hour_key, attempts, successes, failures, 
            total_volume, total_fees, processing_time_sum, processing_time_count
        ) VALUES (
            provider_name, hour_key_val,
            CASE WHEN NEW.type = 'payment_attempt' THEN 1 ELSE 0 END,
            CASE WHEN NEW.type = 'payment_success' THEN 1 ELSE 0 END,
            CASE WHEN NEW.type = 'payment_failure' THEN 1 ELSE 0 END,
            amount_val, fees_val, processing_time_val,
            CASE WHEN NEW.type = 'payment_success' AND processing_time_val > 0 THEN 1 ELSE 0 END
        )
        ON DUPLICATE KEY UPDATE
            attempts = attempts + CASE WHEN NEW.type = 'payment_attempt' THEN 1 ELSE 0 END,
            successes = successes + CASE WHEN NEW.type = 'payment_success' THEN 1 ELSE 0 END,
            failures = failures + CASE WHEN NEW.type = 'payment_failure' THEN 1 ELSE 0 END,
            total_volume = total_volume + amount_val,
            total_fees = total_fees + fees_val,
            processing_time_sum = processing_time_sum + processing_time_val,
            processing_time_count = processing_time_count + 
                CASE WHEN NEW.type = 'payment_success' AND processing_time_val > 0 THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

-- Add Stored Procedures for Common Analytics Queries

DELIMITER //

-- Procedure to get provider performance metrics
CREATE PROCEDURE GetProviderMetrics(
    IN p_provider VARCHAR(50),
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        provider,
        SUM(attempts) as total_attempts,
        SUM(successes) as successful_payments,
        SUM(failures) as failed_payments,
        ROUND(
            (SUM(successes) * 100.0) / NULLIF(SUM(attempts), 0), 
            2
        ) as success_rate,
        ROUND(
            SUM(processing_time_sum) / NULLIF(SUM(processing_time_count), 0), 
            2
        ) as avg_processing_time,
        SUM(total_volume) as total_volume,
        SUM(total_fees) as total_fees,
        ROUND(
            (SUM(total_fees) * 100.0) / NULLIF(SUM(total_volume), 0), 
            2
        ) as avg_fee_rate
    FROM provider_metrics_hourly
    WHERE provider = p_provider
        AND DATE(STR_TO_DATE(hour_key, '%Y-%m-%dT%H')) BETWEEN p_start_date AND p_end_date
    GROUP BY provider;
END//

-- Procedure to get failure analysis
CREATE PROCEDURE GetFailureAnalysis(
    IN p_provider VARCHAR(50),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_limit INT DEFAULT 20
)
BEGIN
    SELECT 
        provider,
        error_code,
        failure_reason,
        SUM(count) as frequency,
        ROUND(
            (SUM(count) * 100.0) / (
                SELECT SUM(count) 
                FROM payment_failure_analysis pfa2 
                WHERE pfa2.provider = p_provider 
                    AND DATE(STR_TO_DATE(pfa2.hour_key, '%Y-%m-%dT%H')) BETWEEN p_start_date AND p_end_date
            ), 2
        ) as percentage
    FROM payment_failure_analysis
    WHERE provider = p_provider
        AND DATE(STR_TO_DATE(hour_key, '%Y-%m-%dT%H')) BETWEEN p_start_date AND p_end_date
    GROUP BY provider, error_code, failure_reason
    ORDER BY frequency DESC
    LIMIT p_limit;
END//

DELIMITER ;

-- Add Indexes for Performance Optimization
CREATE INDEX idx_payment_events_metadata_provider ON payment_events ((JSON_EXTRACT(metadata, '$.provider')));
CREATE INDEX idx_payment_events_metadata_amount ON payment_events ((JSON_EXTRACT(metadata, '$.amount')));
CREATE INDEX idx_payment_events_metadata_method ON payment_events ((JSON_EXTRACT(metadata, '$.methodType')));
CREATE INDEX idx_payment_events_metadata_country ON payment_events ((JSON_EXTRACT(metadata, '$.country')));

-- Add Comments for Documentation
ALTER TABLE payment_events COMMENT = 'Stores all payment-related events for analytics and monitoring';
ALTER TABLE payment_webhook_events COMMENT = 'Stores webhook events from payment providers';
ALTER TABLE provider_metrics_hourly COMMENT = 'Hourly aggregated metrics for payment providers';
ALTER TABLE payment_method_performance COMMENT = 'Daily performance metrics by payment method and provider';
ALTER TABLE payment_failure_analysis COMMENT = 'Hourly aggregated failure analysis data';
ALTER TABLE geographic_payment_performance COMMENT = 'Geographic performance data for payments';
ALTER TABLE payment_routing_rules COMMENT = 'Configuration for intelligent payment routing';
ALTER TABLE payment_optimization_recommendations COMMENT = 'AI-generated recommendations for payment optimization';
ALTER TABLE payment_performance_alerts COMMENT = 'Real-time alerts for payment performance issues';
ALTER TABLE payment_analytics_dashboard_config COMMENT = 'User dashboard configurations for payment analytics';
ALTER TABLE payment_provider_api_keys COMMENT = 'Encrypted storage for payment provider API keys';
ALTER TABLE payment_retry_configuration COMMENT = 'Configuration for payment retry logic by provider and error type';