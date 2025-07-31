/**
 * Log Analysis API Routes - Epic 17
 * 
 * RESTful API endpoints for comprehensive log analysis system
 * for Epic 17 - Backstage Admin Controls.
 * 
 * Task: E17-1753114397254-30EC53 - Create log analysis
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  LogAnalysisService,
  LogLevel,
  LogSource,
  AnomalyType,
  AlertSeverity,
  AnalysisStatus
} from '../admin/LogAnalysisService';
import { Database } from '../database/connection';

// Request type definitions
}
}
interface IngestLogRequest {
  Body: {
    level: LogLevel;
    source: LogSource;
    component: string;
    message: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
}
}
  };
}

}
}
interface BatchIngestLogsRequest {
  Body: {
    logs: Array<{
      timestamp: string;
      level: LogLevel;
      source: LogSource;
      component: string;
      message: string;
      context?: Record<string, any>;
      user_id?: string;
      session_id?: string;
      request_id?: string;
      ip_address?: string;
      user_agent?: string;
      stack_trace?: string;
      metadata?: Record<string, any>;
}
}
    }>;
  };
}

}
}
interface CreateAnalysisRuleRequest {
  Body: {
    name: string;
    description?: string;
    log_sources: LogSource[];
    log_levels: LogLevel[];
    pattern_type: 'regex' | 'keyword' | 'statistical' | 'ml_based' | 'custom';
    pattern_definition: {
      regex?: string;
      keywords?: string[];
      statistical_threshold?: number;
      statistical_window_minutes?: number;
      ml_model?: string;
      custom_function?: string;
}
}
    };
    anomaly_type: AnomalyType;
    severity: AlertSeverity;
    trigger_conditions: {
      min_occurrences?: number;
      time_window_minutes?: number;
      threshold_value?: number;
      consecutive_matches?: number;
    };
    actions: {
      create_alert: boolean;
      send_notification: boolean;
      trigger_recovery?: boolean;
      escalate_to?: string[];
      custom_actions?: string[];
    };
  };
}

}
}
interface CreateAnalysisSessionRequest {
  Body: {
    name: string;
    description?: string;
    analysis_type: 'real_time' | 'batch' | 'historical' | 'custom';
    log_sources: LogSource[];
    log_levels: LogLevel[];
    time_range: {
      start_time: string;
      end_time?: string;
}
}
    };
    filters?: {
      components?: string[];
      users?: string[];
      ip_addresses?: string[];
      keywords?: string[];
      exclude_patterns?: string[];
    };
    analysis_rules?: string[];
  };
}

}
}
interface ListLogEntriesRequest {
  Querystring: {
    source?: LogSource;
    level?: LogLevel;
    component?: string;
    start_time?: string;
    end_time?: string;
    user_id?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
}
  };
}

}
}
interface ListAnalysisRulesRequest {
  Querystring: {
    enabled?: boolean;
    anomaly_type?: AnomalyType;
    severity?: AlertSeverity;
    page?: number;
    pageSize?: number;
}
}
  };
}

}
}
interface ListAlertsRequest {
  Querystring: {
    status?: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
    severity?: AlertSeverity;
    anomaly_type?: AnomalyType;
    assigned_to?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    pageSize?: number;
}
}
  };
}

}
}
interface GetAnalyticsRequest {
  Querystring: {
    start_date: string;
    end_date: string;
    source?: LogSource;
    include_patterns?: boolean;
}
}
  };
}

export async function logAnalysisRoutes(fastify: FastifyInstance) {
  // Initialize Log Analysis Service
  const db = new Database();
  const logAnalysisService = new LogAnalysisService(
    db,
    fastify.auditService
  );

  // ==========================================
  // LOG INGESTION ENDPOINTS
  // ==========================================

  // Ingest Single Log Entry
  fastify.post<IngestLogRequest>('/log-analysis/logs', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:write')],
    schema: {
      description: 'Ingest a single log entry for analysis',
      tags: ['Log Analysis'],
      body: {
        type: 'object',
        required: ['level', 'source', 'component', 'message'],
        properties: {
          level: { 
            type: 'string', 
            enum: ['debug', 'info', 'warn', 'error', 'fatal', 'trace']
  }
          source: { 
            type: 'string', 
            enum: ['application', 'database', 'web_server', 'system', 
              'security', 'audit', 'performance', 'user_activity']
  }
          component: { type: 'string', maxLength: 200 },
          message: { type: 'string' },
          context: { type: 'object' },
          metadata: { type: 'object' }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            log_id: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { level, source, component, message, context = {}, metadata = {} } = request.body;
      const log_id = await logAnalysisService.ingestLog(
        level, source, component, message, context, metadata
      );

      reply.code(201).send({
        success: true,
        log_id,
        message: 'Log entry ingested successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to ingest log entry'
      });
    }
  });

  // Batch Ingest Log Entries
  fastify.post<BatchIngestLogsRequest>('/log-analysis/logs/batch', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:write')],
    schema: {
      description: 'Batch ingest multiple log entries for analysis',
      tags: ['Log Analysis'],
      body: {
        type: 'object',
        required: ['logs'],
        properties: {
          logs: {
            type: 'array',
            items: {
              type: 'object',
              required: ['timestamp', 'level', 'source', 'component', 'message'],
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                level: { 
                  type: 'string', 
                  enum: ['debug', 'info', 'warn', 'error', 'fatal', 'trace']
  }
                source: { 
                  type: 'string', 
                  enum: ['application', 'database', 'web_server', 'system', 
                    'security', 'audit', 'performance', 'user_activity']
  }
                component: { type: 'string' },
                message: { type: 'string' },
                context: { type: 'object' },
                user_id: { type: 'string' },
                session_id: { type: 'string' },
                request_id: { type: 'string' },
                ip_address: { type: 'string' },
                user_agent: { type: 'string' },
                stack_trace: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            log_ids: { type: 'array', items: { type: 'string' } },
            count: { type: 'integer' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { logs } = request.body;
      
      const processedLogs = logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));

      const log_ids = await logAnalysisService.batchIngestLogs(processedLogs);

      reply.code(201).send({
        success: true,
        log_ids,
        count: log_ids.length,
        message: `${log_ids.length} log entries ingested successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch ingest log entries'
      });
    }
  });

  // ==========================================
  // LOG RETRIEVAL ENDPOINTS
  // ==========================================

  // List Log Entries
  fastify.get<ListLogEntriesRequest>('/log-analysis/logs', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:read')],
    schema: {
      description: 'List log entries with optional filters',
      tags: ['Log Analysis'],
      querystring: {
        type: 'object',
        properties: {
          source: { 
            type: 'string', 
            enum: ['application', 'database', 'web_server', 'system', 
              'security', 'audit', 'performance', 'user_activity']
  }
          level: { 
            type: 'string', 
            enum: ['debug', 'info', 'warn', 'error', 'fatal', 'trace']
  }
          component: { type: 'string' },
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: 'string', format: 'date-time' },
          user_id: { type: 'string' },
          search: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            logs: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { 
        source, level, component, start_time, end_time, user_id, search,
        page = 1, pageSize = 100 
      } = request.query;

      const logs = await logAnalysisService.searchLogs({
        source,
        level,
        component,
        start_time: start_time ? new Date(start_time) : undefined,
        end_time: end_time ? new Date(end_time) : undefined,
        user_id,
        search,
        page,
        pageSize
      });

      reply.send({
        success: true,
        logs: logs.entries,
        pagination: logs.pagination
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve log entries'
      });
    }
  });

  // ==========================================
  // ANALYSIS RULE MANAGEMENT ENDPOINTS
  // ==========================================

  // Create Analysis Rule
  fastify.post<CreateAnalysisRuleRequest>('/log-analysis/rules', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:manage')],
    schema: {
      description: 'Create a new log analysis rule',
      tags: ['Log Analysis'],
      body: {
        type: 'object',
        required: ['name', 'log_sources', 'log_levels', 'pattern_type', 'pattern_definition', 'anomaly_type', 'severity', 'trigger_conditions', 'actions'],
        properties: {
          name: { type: 'string', maxLength: 500 },
          description: { type: 'string' },
          log_sources: { 
            type: 'array', 
            items: { 
              type: 'string', 
              enum: ['application', 'database', 'web_server', 'system', 
                'security', 'audit', 'performance', 'user_activity']
            }
  }
          log_levels: { 
            type: 'array', 
            items: { 
              type: 'string', 
              enum: ['debug', 'info', 'warn', 'error', 'fatal', 'trace']
            }
  }
          pattern_type: { 
            type: 'string', 
            enum: ['regex', 'keyword', 'statistical', 'ml_based', 'custom']
  }
          pattern_definition: { type: 'object' },
          anomaly_type: { 
            type: 'string', 
            enum: ['error_spike', 'performance_degradation', 'unusual_activity',
              'security_threat', 'system_failure', 'data_anomaly',
              'access_anomaly', 'volume_anomaly']
  }
          severity: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'info']
  }
          trigger_conditions: { type: 'object' },
          actions: { type: 'object' }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rule: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      const rule = await logAnalysisService.createAnalysisRule(request.body, user.id);

      reply.code(201).send({
        success: true,
        rule,
        message: 'Analysis rule created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create analysis rule'
      });
    }
  });

  // List Analysis Rules
  fastify.get<ListAnalysisRulesRequest>('/log-analysis/rules', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:read')],
    schema: {
      description: 'List log analysis rules with optional filters',
      tags: ['Log Analysis'],
      querystring: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          anomaly_type: { 
            type: 'string', 
            enum: ['error_spike', 'performance_degradation', 'unusual_activity',
              'security_threat', 'system_failure', 'data_anomaly',
              'access_anomaly', 'volume_anomaly']
  }
          severity: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'info']
  }
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rules: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { enabled, anomaly_type, severity, page = 1, pageSize = 20 } = request.query;
      
      const rules = await logAnalysisService.listAnalysisRules({
        enabled,
        anomaly_type,
        severity
      });

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRules = rules.slice(startIndex, endIndex);

      reply.send({
        success: true,
        rules: paginatedRules,
        pagination: {
          page,
          pageSize,
          total: rules.length,
          totalPages: Math.ceil(rules.length / pageSize)
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list analysis rules'
      });
    }
  });

  // ==========================================
  // ANALYSIS SESSION ENDPOINTS
  // ==========================================

  // Create Analysis Session
  fastify.post<CreateAnalysisSessionRequest>('/log-analysis/sessions', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:analyze')],
    schema: {
      description: 'Create a new log analysis session',
      tags: ['Log Analysis'],
      body: {
        type: 'object',
        required: ['name', 'analysis_type', 'log_sources', 'log_levels', 'time_range'],
        properties: {
          name: { type: 'string', maxLength: 500 },
          description: { type: 'string' },
          analysis_type: { 
            type: 'string', 
            enum: ['real_time', 'batch', 'historical', 'custom']
  }
          log_sources: { 
            type: 'array', 
            items: { 
              type: 'string', 
              enum: ['application', 'database', 'web_server', 'system', 
                'security', 'audit', 'performance', 'user_activity']
            }
  }
          log_levels: { 
            type: 'array', 
            items: { 
              type: 'string', 
              enum: ['debug', 'info', 'warn', 'error', 'fatal', 'trace']
            }
  }
          time_range: {
            type: 'object',
            required: ['start_time'],
            properties: {
              start_time: { type: 'string', format: 'date-time' },
              end_time: { type: 'string', format: 'date-time' }
            }
  }
          filters: { type: 'object' },
          analysis_rules: { 
            type: 'array', 
            items: { type: 'string' }
          }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            session_id: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { time_range, ...sessionData } = request.body;
      
      const processedSessionData = {
        ...sessionData,
        time_range: {
          start_time: new Date(time_range.start_time),
          end_time: time_range.end_time ? new Date(time_range.end_time) : undefined
        }
      };

      const session_id = await logAnalysisService.createAnalysisSession(
        processedSessionData,
        user.id
      );

      reply.code(201).send({
        success: true,
        session_id,
        message: 'Analysis session created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create analysis session'
      });
    }
  });

  // Start Analysis Session
  fastify.post('/log-analysis/sessions/:sessionId/start', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:analyze')],
    schema: {
      description: 'Start a log analysis session',
      tags: ['Log Analysis'],
      params: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params;
      await logAnalysisService.startAnalysisSession(sessionId);

      reply.send({
        success: true,
        message: 'Analysis session started successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start analysis session'
      });
    }
  });

  // ==========================================
  // ALERT MANAGEMENT ENDPOINTS
  // ==========================================

  // List Alerts
  fastify.get<ListAlertsRequest>('/log-analysis/alerts', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:read')],
    schema: {
      description: 'List log analysis alerts with optional filters',
      tags: ['Log Analysis'],
      querystring: {
        type: 'object',
        properties: {
          status: { 
            type: 'string', 
            enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive']
  }
          severity: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'info']
  }
          anomaly_type: { 
            type: 'string', 
            enum: ['error_spike', 'performance_degradation', 'unusual_activity',
              'security_threat', 'system_failure', 'data_anomaly',
              'access_anomaly', 'volume_anomaly']
  }
          assigned_to: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            alerts: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { 
        status, severity, anomaly_type, assigned_to, start_date, end_date,
        page = 1, pageSize = 20 
      } = request.query;

      const alerts = await logAnalysisService.listAlerts({
        status,
        severity,
        anomaly_type,
        assigned_to,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined
      });

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedAlerts = alerts.slice(startIndex, endIndex);

      reply.send({
        success: true,
        alerts: paginatedAlerts,
        pagination: {
          page,
          pageSize,
          total: alerts.length,
          totalPages: Math.ceil(alerts.length / pageSize)
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list alerts'
      });
    }
  });

  // Acknowledge Alert
  fastify.post('/log-analysis/alerts/:alertId/acknowledge', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:manage')],
    schema: {
      description: 'Acknowledge a log analysis alert',
      tags: ['Log Analysis'],
      params: {
        type: 'object',
        properties: {
          alertId: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { alertId } = request.params;
      const user = request.user;

      await logAnalysisService.acknowledgeAlert(alertId, user.id);

      reply.send({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
      });
    }
  });

  // ==========================================
  // ANALYTICS AND REPORTING ENDPOINTS
  // ==========================================

  // Get Analytics Report
  fastify.get<GetAnalyticsRequest>('/log-analysis/analytics', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:read')],
    schema: {
      description: 'Get log analysis analytics and metrics',
      tags: ['Log Analysis'],
      querystring: {
        type: 'object',
        required: ['start_date', 'end_date'],
        properties: {
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          source: { 
            type: 'string', 
            enum: ['application', 'database', 'web_server', 'system', 
              'security', 'audit', 'performance', 'user_activity']
  }
          include_patterns: { type: 'boolean', default: false }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            analytics: { type: 'object' },
            period: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { start_date, end_date, source, include_patterns = false } = request.query;
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      const analytics = await logAnalysisService.getAnalyticsReport(startDate, endDate);

      reply.send({
        success: true,
        analytics,
        period: {
          start: start_date,
          end: end_date
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics report'
      });
    }
  });

  // Get System Health
  fastify.get('/log-analysis/health', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:read')],
    schema: {
      description: 'Get log analysis system health status',
      tags: ['Log Analysis'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            health: {
              type: 'object',
              properties: {
                processing_active: { type: 'boolean' },
                active_sessions: { type: 'integer' },
                recent_errors: { type: 'integer' },
                alert_backlog: { type: 'integer' },
                last_processed: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const health = await logAnalysisService.getSystemHealth();

      reply.send({
        success: true,
        health
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system health'
      });
    }
  });

  // ==========================================
  // SYSTEM CONTROL ENDPOINTS
  // ==========================================

  // Start/Stop Real-time Processing
  fastify.post('/log-analysis/processing/:action', {
    preHandler: [fastify.authenticate, fastify.requirePermission('logs:manage')],
    schema: {
      description: 'Start or stop real-time log processing',
      tags: ['Log Analysis'],
      params: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'stop'] }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { action } = request.params;
      const user = request.user;

      if (action === 'start') {
        await logAnalysisService.startRealTimeProcessing();
      } else {
        await logAnalysisService.stopRealTimeProcessing();
      }

      await fastify.auditService.logActivity(`log_processing_${action}`, user.id, {
        action
      });

      reply.send({
        success: true,
        message: `Log analysis processing ${action}ed successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : `Failed to ${request.params.action} processing`
      });
    }
  });
}

export default logAnalysisRoutes;