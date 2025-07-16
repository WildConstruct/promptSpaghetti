-- Epic 8.2 - Corrections Manager Database Schema
-- SQLite implementation for persistent storage

-- Users table (simplified for single-user scenarios)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL DEFAULT 'default',
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings TEXT DEFAULT '{}'
);

-- Projects table (future expansion)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Correction rules table
CREATE TABLE IF NOT EXISTS correction_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    find_pattern TEXT NOT NULL,
    replace_with TEXT NOT NULL,
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    -- Ownership and scope
    user_id INTEGER NOT NULL DEFAULT 1,
    project_id INTEGER,
    scope VARCHAR(20) DEFAULT 'private',
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_rule_id INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL DEFAULT 1,
    updated_by INTEGER NOT NULL DEFAULT 1,
    
    -- Performance and validation
    validation_status VARCHAR(20) DEFAULT 'valid',
    validation_message TEXT,
    last_used_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_rule_id) REFERENCES correction_rules(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Correction rule history table
CREATE TABLE IF NOT EXISTS correction_rule_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    rule_uuid VARCHAR(36) NOT NULL,
    
    -- Snapshot of rule at this point in time
    name VARCHAR(255) NOT NULL,
    description TEXT,
    find_pattern TEXT NOT NULL,
    replace_with TEXT NOT NULL,
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    -- Change metadata
    change_type VARCHAR(20) NOT NULL,
    change_summary TEXT,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance tracking
    performance_impact REAL,
    
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Correction statistics table
CREATE TABLE IF NOT EXISTS correction_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    rule_uuid VARCHAR(36) NOT NULL,
    
    -- Usage metrics
    application_count INTEGER DEFAULT 0,
    character_count_before INTEGER DEFAULT 0,
    character_count_after INTEGER DEFAULT 0,
    execution_time_ms REAL DEFAULT 0,
    
    -- Effectiveness metrics
    success_rate REAL DEFAULT 100.0,
    error_count INTEGER DEFAULT 0,
    last_error_message TEXT,
    
    -- Enhanced effectiveness metrics
    quality_score REAL DEFAULT 0.0,
    impact_rating REAL DEFAULT 1.0,
    false_positive_count INTEGER DEFAULT 0,
    user_feedback_score REAL,
    
    -- Performance metrics
    avg_characters_saved REAL DEFAULT 0.0,
    complexity_score REAL DEFAULT 1.0,
    
    -- Time-based aggregation
    date_bucket DATE NOT NULL,
    hour_bucket INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    UNIQUE(rule_id, date_bucket, hour_bucket)
);

-- Correction sets table (for import/export)
CREATE TABLE IF NOT EXISTS correction_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Ownership
    created_by INTEGER NOT NULL DEFAULT 1,
    
    -- Export/Import metadata
    export_format VARCHAR(20) DEFAULT 'json',
    export_data TEXT,
    checksum VARCHAR(64),
    
    -- Sharing and collaboration
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Correction set rules junction table
CREATE TABLE IF NOT EXISTS correction_set_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    rule_id INTEGER NOT NULL,
    
    -- Rule configuration within set
    order_index INTEGER DEFAULT 0,
    is_included BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (set_id) REFERENCES correction_sets(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    UNIQUE(set_id, rule_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- UI preferences
    corrections_enabled BOOLEAN DEFAULT TRUE,
    auto_apply_corrections BOOLEAN DEFAULT FALSE,
    show_correction_preview BOOLEAN DEFAULT TRUE,
    
    -- Performance preferences
    max_rules_per_execution INTEGER DEFAULT 50,
    timeout_ms INTEGER DEFAULT 5000,
    
    -- Notification preferences
    notify_on_rule_conflicts BOOLEAN DEFAULT TRUE,
    notify_on_performance_issues BOOLEAN DEFAULT TRUE,
    
    -- Advanced settings
    advanced_settings TEXT DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_correction_rules_user_active ON correction_rules(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_correction_rules_priority ON correction_rules(priority, is_active);
CREATE INDEX IF NOT EXISTS idx_correction_rules_project ON correction_rules(project_id, is_active);
CREATE INDEX IF NOT EXISTS idx_correction_rules_scope ON correction_rules(scope, is_active);
CREATE INDEX IF NOT EXISTS idx_correction_rules_uuid ON correction_rules(uuid);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_correction_statistics_rule_date ON correction_statistics(rule_id, date_bucket);
CREATE INDEX IF NOT EXISTS idx_correction_statistics_date_hour ON correction_statistics(date_bucket, hour_bucket);

-- History indexes
CREATE INDEX IF NOT EXISTS idx_correction_rule_history_rule_time ON correction_rule_history(rule_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_correction_rule_history_type ON correction_rule_history(change_type, changed_at);

-- Insert default user
INSERT OR IGNORE INTO users (id, username, email) VALUES (1, 'default', 'default@localhost');

-- Insert default user preferences
INSERT OR IGNORE INTO user_preferences (user_id) VALUES (1);