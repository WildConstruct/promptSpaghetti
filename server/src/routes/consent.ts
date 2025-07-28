/**
 * Consent Management API Routes
 * 
 * RESTful API endpoints for consent management and GDPR compliance
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConsentRevocationService } from '../services/ConsentRevocationService';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../database/DatabaseService';

// Request/Response Types
}
interface ConsentConfigRequest {
  Params: {
    version?: string;
}
  };
}

}
interface UserPreferencesRequest {
  Params: {
    userId: string;
}
  };
}

}
interface SavePreferencesRequest {
  Body: {
    userId?: string;
    sessionId: string;
    consents: Record<string, unknown>;
    userPreferences: Record<string, unknown>;
    lastUpdated: string;
}
  };
}

}
interface ConsentEventRequest {
  Body: {
    eventId: string;
    eventType: string;
    timestamp: string;
    userId?: string;
    sessionId: string;
    consentType?: string;
    source: string;
    metadata: Record<string, unknown>;
}
  };
}

}
interface ExportDataRequest {
  Params: {
    userId: string;
}
  };
  Querystring: {
    format?: 'json' | 'xml' | 'csv';
  };
}

}
interface ResetConsentsRequest {
  Params: {
    userId: string;
}
  };
}

export async function consentRoutes(fastify: FastifyInstance) {
  const auditService = new AuditService(fastify.db as DatabaseService);
  const consentRevocationService = new ConsentRevocationService(auditService);

  // Get consent configuration
  fastify.get<ConsentConfigRequest>('/config', {
    schema: {
      description: 'Get consent configuration and policy settings',
      tags: ['consent'],
      params: {
        type: 'object',
        properties: {
          version: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                lastUpdated: { type: 'string' },
                consentTypes: { type: 'array' },
                bannerConfig: { type: 'object' },
                complianceSettings: { type: 'object' },
                retentionSettings: { type: 'object' }
              }
  }
            timestamp: { type: 'string' },
            requestId: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<ConsentConfigRequest>, reply: FastifyReply) => {
    try {
      const version = request.params?.version || 'latest';
      
      // Get consent configuration from database or configuration service
      const config = await getConsentConfiguration(version);
      
      await auditService.logEvent({
        eventType: 'CONSENT_CONFIG_ACCESSED',
        userId: 'anonymous',
        details: {
          version,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Transparency'],
          evidenceLevel: 'BASIC'
        }
      });

      return reply.send({
        success: true,
        data: config,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
      
    } catch (error) {
      fastify.log.error('Failed to get consent configuration:', error);
      
      await auditService.logEvent({
        eventType: 'CONSENT_CONFIG_ERROR',
        userId: 'anonymous',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: request.ip
  }
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Transparency'],
          evidenceLevel: 'STANDARD'
        }
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to load consent configuration',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });

  // Get user consent preferences
  fastify.get<UserPreferencesRequest>('/preferences/:userId', {
    schema: {
      description: 'Get user consent preferences',
      tags: ['consent'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string' },
            requestId: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<UserPreferencesRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      
      // Get user preferences from database
      const preferences = await getUserConsentPreferences(userId);
      
      await auditService.logEvent({
        eventType: 'CONSENT_PREFERENCES_ACCESSED',
        userId,
        details: {
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Data Access'],
          evidenceLevel: 'STANDARD'
        }
      });

      return reply.send({
        success: true,
        data: preferences,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
      
    } catch (error) {
      fastify.log.error('Failed to get user preferences:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to load user preferences',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });

  // Save consent preferences
  fastify.post<SavePreferencesRequest>('/preferences', {
    schema: {
      description: 'Save user consent preferences',
      tags: ['consent'],
      body: {
        type: 'object',
        required: ['sessionId', 'consents', 'lastUpdated'],
        properties: {
          userId: { type: 'string' },
          sessionId: { type: 'string' },
          consents: { type: 'object' },
          userPreferences: { type: 'object' },
          lastUpdated: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            timestamp: { type: 'string' },
            requestId: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<SavePreferencesRequest>, reply: FastifyReply) => {
    try {
      const preferences = request.body;
      
      // Save preferences to database
      await saveUserConsentPreferences(preferences);
      
      await auditService.logEvent({
        eventType: 'CONSENT_PREFERENCES_SAVED',
        userId: preferences.userId || 'anonymous',
        details: {
          sessionId: preferences.sessionId,
          consentTypes: Object.keys(preferences.consents),
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['GDPR', 'CCPA'],
          requirements: ['Consent Management'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return reply.send({
        success: true,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
      
    } catch (error) {
      fastify.log.error('Failed to save consent preferences:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to save consent preferences',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });

  // Log consent events
  fastify.post<ConsentEventRequest>('/events', {
    schema: {
      description: 'Log consent-related events',
      tags: ['consent'],
      body: {
        type: 'object',
        required: ['eventId', 'eventType', 'timestamp', 'sessionId', 'source'],
        properties: {
          eventId: { type: 'string' },
          eventType: { type: 'string' },
          timestamp: { type: 'string' },
          userId: { type: 'string' },
          sessionId: { type: 'string' },
          consentType: { type: 'string' },
          source: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<ConsentEventRequest>, reply: FastifyReply) => {
    try {
      const event = request.body;
      
      // Store consent event
      await storeConsentEvent(event);
      
      // Log to audit service
      await auditService.logEvent({
        eventType: `CONSENT_${event.eventType.toUpperCase()}`,
        userId: event.userId || 'anonymous',
        details: {
          originalEventId: event.eventId,
          consentType: event.consentType,
          source: event.source,
          sessionId: event.sessionId,
          metadata: event.metadata,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: getEventRiskLevel(event.eventType),
        compliance: {
          frameworks: ['GDPR', 'CCPA'],
          requirements: ['Audit Trail'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return reply.send({
        success: true,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
      
    } catch (error) {
      fastify.log.error('Failed to log consent event:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to log consent event',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });

  // Export user consent data
  fastify.get<ExportDataRequest>('/export/:userId', {
    schema: {
      description: 'Export user consent data (GDPR Article 20)',
      tags: ['consent'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
  }
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'xml', 'csv'] }
        }
      }
    }
  }, async (request: FastifyRequest<ExportDataRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const format = request.query.format || 'json';
      
      // Get comprehensive consent data export
      const exportData = await generateConsentDataExport(userId, format);
      
      await auditService.logEvent({
        eventType: 'CONSENT_DATA_EXPORTED',
        userId,
        details: {
          format,
          exportSize: JSON.stringify(exportData).length,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Article 20 - Data Portability'],
          evidenceLevel: 'FORENSIC'
        }
      });

      // Set appropriate content type
      const contentTypes = {
        json: 'application/json',
        xml: 'application/xml',
        csv: 'text/csv'
      };

      reply.type(contentTypes[format]);
      
      if (format === 'json') {
        return reply.send({
          success: true,
          data: exportData,
          timestamp: new Date().toISOString(),
          requestId: generateRequestId()
        });
      } else {
        return reply.send(exportData);
      }
      
    } catch (error) {
      fastify.log.error('Failed to export consent data:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to export consent data',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });

  // Reset user consents (GDPR Article 17 - Right to be Forgotten)
  fastify.delete<ResetConsentsRequest>('/reset/:userId', {
    schema: {
      description: 'Reset/delete user consent data',
      tags: ['consent'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<ResetConsentsRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      
      // Trigger consent revocation process
      const revocationResult = await consentRevocationService.submitRevocationRequest(
        userId,
        [], // Will fetch all user consents internally
        'USER_REQUEST',
        'EMAIL_LINK',
        {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          sessionContext: {},
          requestMethod: 'API',
          source: 'USER_REQUEST'
        }
      );
      
      await auditService.logEvent({
        eventType: 'CONSENT_RESET_REQUESTED',
        userId,
        details: {
          revocationId: revocationResult.revocationId,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Article 17 - Right to Erasure'],
          evidenceLevel: 'FORENSIC'
        }
      });

      return reply.send({
        success: true,
        data: {
          revocationId: revocationResult.revocationId,
          message: 'Consent reset process initiated'
  }
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
      
    } catch (error) {
      fastify.log.error('Failed to reset consents:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to reset consents',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }
  });
}

// Helper functions

async function getConsentConfiguration(version: string) {
  // This would typically fetch from a database or configuration service
  // For now, return a mock configuration
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    consentTypes: [
      {
        type: 'necessary',
        name: 'Necessary',
        description: 'Essential for basic website functionality',
        purpose: 'Website operation',
        legalBasis: 'legitimate_interest',
        isEssential: true,
        defaultStatus: 'granted',
        dependencies: [],
        dataCategories: [],
        thirdParties: [],
        retentionPeriod: 365,
        cookies: [],
        storageItems: []
  }
      {
        type: 'analytics',
        name: 'Analytics',
        description: 'Help us understand how you use our website',
        purpose: 'Website analytics and improvement',
        legalBasis: 'consent',
        isEssential: false,
        defaultStatus: 'not_set',
        dependencies: [],
        dataCategories: [
          {
            name: 'Usage Data',
            description: 'Information about how you interact with our website',
            sensitivity: 'low',
            examples: ['page views', 'click events', 'session duration']
          }
        ],
        thirdParties: [],
        retentionPeriod: 365,
        cookies: [
          {
            name: '_ga',
            purpose: 'Google Analytics tracking',
            type: 'persistent',
            duration: 730,
            domain: '.example.com',
            isHttpOnly: false,
            isSecure: true,
            sameSite: 'lax'
          }
        ],
        storageItems: []
      }
    ],
    bannerConfig: {
      mode: 'compact',
      position: 'bottom',
      theme: 'light',
      showOnFirstVisit: true,
      showAfterDays: 30,
      enableRejectAll: true,
      enableAcceptAll: true,
      enableCustomize: true,
      layout: {
        showLogo: false,
        showCloseButton: true,
        buttonsLayout: 'horizontal',
        maxWidth: 800,
        responsive: true
  }
      content: {
        title: 'Cookie Consent',
        message: 'We use cookies to enhance your experience and analyze our traffic.',
        acceptAllText: 'Accept All',
        rejectAllText: 'Reject All',
        customizeText: 'Customize',
        learnMoreText: 'Learn More',
        privacyPolicyUrl: '/privacy',
        cookiePolicyUrl: '/cookies',
        termsOfServiceUrl: '/terms',
        languages: []
  }
      styling: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        linkColor: '#007bff',
        primaryButtonColor: '#007bff',
        primaryButtonTextColor: '#ffffff',
        secondaryButtonColor: '#6c757d',
        secondaryButtonTextColor: '#ffffff',
        borderColor: '#dee2e6',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'system-ui, sans-serif',
        zIndex: 9999,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
  }
    complianceSettings: {
      gdprEnabled: true,
      ccpaEnabled: false,
      cookieLawEnabled: true,
      tcfEnabled: false,
      consentDuration: 365,
      requireExplicitConsent: true,
      enableConsentWithdrawal: true,
      enableDataPortability: true,
      enableRightToBeForgotten: true,
      auditTrailEnabled: true,
      jurisdictionDetection: false,
      ageGateEnabled: false,
      minimumAge: 16
  }
    retentionSettings: {
      consentRecordRetention: 2555, // 7 years
      auditLogRetention: 2555,
      anonymizeAfterRetention: true,
      purgeWithdrawnConsents: false,
      exportBeforePurge: true
    }
  };
}

async function getUserConsentPreferences(userId: string) {
  // Mock implementation - would fetch from database
  return {
    userId,
    sessionId: `session_${Date.now()}`,
    consents: {},
    lastUpdated: new Date(),
    userPreferences: {
      language: 'en',
      timezone: 'UTC',
      communicationPreferences: {
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        marketingEmails: false,
        productUpdates: false,
        securityAlerts: true
  }
      accessibilitySettings: {
        highContrast: false,
        largeFonts: false,
        reduceMotion: false,
        screenReaderOptimized: false,
        keyboardNavigation: false
  }
      privacySettings: {
        dataProcessingOptOut: false,
        profileVisibility: 'private',
        trackingOptOut: false,
        analyticsOptOut: false,
        marketingOptOut: false,
        thirdPartyDataSharing: false
      }
    }
  };
}

async function saveUserConsentPreferences(preferences: Record<string, unknown>) {
  // Mock implementation - would save to database
  console.log('Saving consent preferences:', preferences);
}

async function storeConsentEvent(event: Record<string, unknown>) {
  // Mock implementation - would save to database
  console.log('Storing consent event:', event);
}

async function generateConsentDataExport(userId: string, format: string) {
  // Mock implementation - would generate comprehensive export
  const exportData = {
    exportId: `export_${Date.now()}`,
    userId,
    requestedAt: new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    format,
    data: {
      userInfo: {
        userId,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
  }
      consents: [],
      preferences: {},
      events: []
    }
  };

  if (format === 'csv') {
    return 'userId,consentType,status,grantedAt\n' + 
           `${userId},analytics,granted,${new Date().toISOString()}`;
  } else if (format === 'xml') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<consentExport>
  <userId>${userId}</userId>
  <exportedAt>${new Date().toISOString()}</exportedAt>
  <consents></consents>
</consentExport>`;
  }

  return exportData;
}

function getEventRiskLevel(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const highRiskEvents = ['consent_withdrawn', 'data_deleted', 'export_requested'];
  const mediumRiskEvents = ['consent_given', 'preferences_saved'];
  
  if (highRiskEvents.includes(eventType)) return 'HIGH';
  if (mediumRiskEvents.includes(eventType)) return 'MEDIUM';
  return 'LOW';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}