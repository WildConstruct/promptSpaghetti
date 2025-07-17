-- Epic 13 - Analytics Dashboard Database Schema
-- Extends existing SQLite schema for comprehensive analytics collection

-- Analytics sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    user_id INTEGER,
    organization_id INTEGER,
    
    -- Session metadata
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_ms INTEGER,
    user_agent TEXT,
    platform VARCHAR(50),
    
    -- Session metrics
    total_events INTEGER DEFAULT 0,
    graphs_executed INTEGER DEFAULT 0,
    nodes_created INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Analytics events table (main event store)
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(36) UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    -- Session and user context
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    organization_id INTEGER,
    
    -- Event metadata (stored as JSON)
    metadata TEXT NOT NULL DEFAULT '{}',
    
    -- Event categorization
    category VARCHAR(30) NOT NULL DEFAULT 'general',
    severity VARCHAR(20) DEFAULT 'info',
    
    -- Performance tracking
    processing_time_ms REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Graph execution analytics
CREATE TABLE IF NOT EXISTS graph_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(36) UNIQUE NOT NULL,
    graph_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    
    -- Execution details
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    execution_time_ms REAL,
    
    -- Graph characteristics
    node_count INTEGER NOT NULL,
    connection_count INTEGER NOT NULL,
    graph_complexity_score REAL DEFAULT 1.0,
    
    -- Execution results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    output_length INTEGER,
    seed_value INTEGER,
    
    -- Performance metrics
    memory_usage_mb REAL,
    cpu_time_ms REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Node execution analytics
CREATE TABLE IF NOT EXISTS node_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(36) NOT NULL,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    graph_execution_id INTEGER NOT NULL,
    
    -- Timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    execution_time_ms REAL,
    
    -- Data flow
    input_size_bytes INTEGER,
    output_size_bytes INTEGER,
    
    -- Results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Performance
    memory_delta_mb REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (graph_execution_id) REFERENCES graph_executions(id) ON DELETE CASCADE
);

-- Token usage and cost tracking
CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usage_id VARCHAR(36) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    organization_id INTEGER,
    
    -- API call context
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(200),
    
    -- Token counts
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    
    -- Cost calculation
    estimated_cost_usd REAL NOT NULL,
    cost_per_token REAL,
    
    -- Context
    node_id VARCHAR(100),
    graph_id VARCHAR(100),
    execution_id VARCHAR(36),
    
    -- Timing
    request_start TIMESTAMP NOT NULL,
    request_end TIMESTAMP,
    latency_ms REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User interaction tracking
CREATE TABLE IF NOT EXISTS user_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id VARCHAR(36) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    
    -- Interaction details
    interaction_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    -- UI context
    component VARCHAR(50),
    element_id VARCHAR(100),
    graph_id VARCHAR(100),
    node_id VARCHAR(100),
    
    -- Spatial data for heat maps
    canvas_x REAL,
    canvas_y REAL,
    viewport_x REAL,
    viewport_y REAL,
    
    -- Interaction metadata
    metadata TEXT DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance metrics aggregation
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_id VARCHAR(36) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    
    -- Metric identification
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    component VARCHAR(50) NOT NULL,
    
    -- Metric data
    metric_value REAL NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    -- Context
    node_id VARCHAR(100),
    graph_id VARCHAR(100),
    user_id INTEGER,
    
    -- Aggregation support
    aggregation_period VARCHAR(20) DEFAULT 'instant',
    sample_count INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS feature_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    
    -- Feature identification
    feature_name VARCHAR(100) NOT NULL,
    feature_category VARCHAR(50) NOT NULL,
    
    -- Usage data
    usage_count INTEGER DEFAULT 1,
    first_used TIMESTAMP NOT NULL,
    last_used TIMESTAMP NOT NULL,
    total_usage_time_ms REAL DEFAULT 0,
    
    -- Success metrics
    successful_uses INTEGER DEFAULT 0,
    failed_uses INTEGER DEFAULT 0,
    
    -- Date aggregation
    date_bucket DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(session_id, feature_name, date_bucket)
);

-- Error tracking and analysis
CREATE TABLE IF NOT EXISTS error_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_id VARCHAR(36) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    user_id INTEGER,
    
    -- Error details
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    component VARCHAR(50) NOT NULL,
    function_name VARCHAR(100),
    node_id VARCHAR(100),
    graph_id VARCHAR(100),
    
    -- Impact
    severity VARCHAR(20) DEFAULT 'error',
    user_impact VARCHAR(50),
    recovery_time_ms REAL,
    
    -- Environment
    browser_info TEXT,
    timestamp TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Analytics aggregation tables for performance

-- Hourly aggregations
CREATE TABLE IF NOT EXISTS analytics_hourly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hour_bucket TIMESTAMP NOT NULL,
    user_id INTEGER,
    organization_id INTEGER,
    
    -- Activity metrics
    total_events INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    graphs_executed INTEGER DEFAULT 0,
    nodes_executed INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_execution_time_ms REAL DEFAULT 0,
    p95_execution_time_ms REAL DEFAULT 0,
    total_token_usage INTEGER DEFAULT 0,
    total_cost_usd REAL DEFAULT 0,
    
    -- Quality metrics
    success_rate REAL DEFAULT 100.0,
    error_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(hour_bucket, user_id, organization_id)
);

-- Daily aggregations
CREATE TABLE IF NOT EXISTS analytics_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_bucket DATE NOT NULL,
    user_id INTEGER,
    organization_id INTEGER,
    
    -- Activity metrics
    total_events INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    graphs_executed INTEGER DEFAULT 0,
    nodes_executed INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_execution_time_ms REAL DEFAULT 0,
    p95_execution_time_ms REAL DEFAULT 0,
    total_token_usage INTEGER DEFAULT 0,
    total_cost_usd REAL DEFAULT 0,
    
    -- Quality metrics
    success_rate REAL DEFAULT 100.0,
    error_count INTEGER DEFAULT 0,
    
    -- Feature adoption
    features_used INTEGER DEFAULT 0,
    new_feature_adoptions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(date_bucket, user_id, organization_id)
);

-- Indexes for performance optimization

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_timestamp ON analytics_events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(category, timestamp);

-- Graph execution indexes
CREATE INDEX IF NOT EXISTS idx_graph_executions_graph_time ON graph_executions(graph_id, start_time);
CREATE INDEX IF NOT EXISTS idx_graph_executions_user_time ON graph_executions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_graph_executions_success ON graph_executions(success, start_time);
CREATE INDEX IF NOT EXISTS idx_graph_executions_session ON graph_executions(session_id, start_time);

-- Node execution indexes
CREATE INDEX IF NOT EXISTS idx_node_executions_type_time ON node_executions(node_type, start_time);
CREATE INDEX IF NOT EXISTS idx_node_executions_graph_exec ON node_executions(graph_execution_id, start_time);
CREATE INDEX IF NOT EXISTS idx_node_executions_success ON node_executions(success, start_time);

-- Token usage indexes
CREATE INDEX IF NOT EXISTS idx_token_usage_provider_time ON token_usage(provider, request_start);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_time ON token_usage(user_id, request_start);
CREATE INDEX IF NOT EXISTS idx_token_usage_cost ON token_usage(estimated_cost_usd, request_start);
CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id, request_start);

-- User interaction indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_type_time ON user_interactions(interaction_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_time ON user_interactions(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_canvas ON user_interactions(canvas_x, canvas_y, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_component ON user_interactions(component, timestamp);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON performance_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component_time ON performance_metrics(component, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(metric_category, timestamp);

-- Aggregation indexes
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_bucket ON analytics_hourly(hour_bucket);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_bucket ON analytics_daily(date_bucket);
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_user ON analytics_hourly(user_id, hour_bucket);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_user ON analytics_daily(user_id, date_bucket);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_time ON analytics_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);

-- Error analytics indexes
CREATE INDEX IF NOT EXISTS idx_error_analytics_type_time ON error_analytics(error_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_error_analytics_component ON error_analytics(component, timestamp);
CREATE INDEX IF NOT EXISTS idx_error_analytics_severity ON error_analytics(severity, timestamp);