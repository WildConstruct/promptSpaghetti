/**
 * Webhook Authentication Service - Standardized Auth Handler Framework
 * 
 * Unified webhook authentication framework providing standardized signature verification,
 * provider management, and event routing for webhook endpoints across the application.
 * 
 * Task: T-1752989144373-142 - Standardize auth handler framework (OAuth2, API keys, webhooks)
 */

import crypto from 'crypto';
import { FastifyRequest } from 'fastify';
import { AuditService } from './AuditService';

}
}
export interface WebhookProvider {
  providerId: string;
  name: string;
  description: string;
  signatureHeader: string;
  signatureAlgorithm: 'sha256' | 'sha1' | 'sha512';
  signaturePrefix?: string;
  secretKey: string;
  active: boolean;
  endpoints: string[];
  eventTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface WebhookValidationResult {
  valid: boolean;
  providerId?: string;
  provider?: WebhookProvider;
  eventType?: string;
  payload?: any;
  signature?: string;
  computedSignature?: string;
  timestamp?: Date;
  error?: string;
  metadata?: Record<string, any>;
}
}
}

}
}
export interface WebhookRequest {
  providerId: string;
  signature: string;
  payload: string | Buffer;
  headers: Record<string, string>;
  timestamp?: string;
  eventType?: string;
}
}
}

}
}
export interface WebhookEvent {
  eventId: string;
  providerId: string;
  eventType: string;
  payload: any;
  signature: string;
  timestamp: Date;
  processed: boolean;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}
}
}

}
}
export interface WebhookConfig {
  providers: Record<string, WebhookProvider>;
  globalTimeout: number;
  maxRetries: number;
  retryBackoff: number;
  enableReplayProtection: boolean;
  replayWindowSeconds: number;
  enableAuditLogging: boolean;
}
}
}

export class WebhookAuthenticationService {
  private providers = new Map<string, WebhookProvider>();
  private processedEvents = new Set<string>();
  private config: WebhookConfig;

  constructor(
    private auditService: AuditService,
    config: Partial<WebhookConfig> = {}
  ) {
    this.config = {
      providers: config.providers || {},
      globalTimeout: config.globalTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryBackoff: config.retryBackoff || 1000,
      enableReplayProtection: config.enableReplayProtection ?? true,
      replayWindowSeconds: config.replayWindowSeconds || 300, // 5 minutes
      enableAuditLogging: config.enableAuditLogging ?? true
    };

    this.initializeProviders();
  }

  /**
   * Register a webhook provider with the authentication service
   */
  async registerProvider(provider: Omit<WebhookProvider, 'createdAt' | 'updatedAt'>): Promise<void> {

    const webhookProvider: WebhookProvider = {
      ...provider,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.providers.set(provider.providerId, webhookProvider);

    if (this.config.enableAuditLogging) {
      await this.auditService.logEvent({
        eventType: 'WEBHOOK_PROVIDER_REGISTERED',
        details: {
          providerId: provider.providerId,
          name: provider.name,
          endpoints: provider.endpoints,
          eventTypes: provider.eventTypes
  }
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['webhook_management'],
          evidenceLevel: 'STANDARD'
        }
      });
    }
  }

  /**
   * Validate incoming webhook request with signature verification
   */
  async validateWebhook(request: WebhookRequest): Promise<WebhookValidationResult> {

    try {
      const provider = this.providers.get(request.providerId);
      
      if (!provider) {
        const error = `Unknown webhook provider: ${request.providerId}`;
        await this.logValidationEvent('WEBHOOK_VALIDATION_FAILED', request.providerId, { error });
        return { valid: false, error };
      }

      if (!provider.active) {
        const error = `Webhook provider is inactive: ${request.providerId}`;
        await this.logValidationEvent('WEBHOOK_PROVIDER_INACTIVE', request.providerId, { error });
        return { valid: false, error, providerId: request.providerId, provider };
      }

      // Verify signature
      const signatureValidation = this.verifySignature(request, provider);
      if (!signatureValidation.valid) {
        await this.logValidationEvent('WEBHOOK_SIGNATURE_INVALID', request.providerId, {
          error: signatureValidation.error,
          expectedSignature: signatureValidation.computedSignature,
          receivedSignature: request.signature
        });
        return signatureValidation;
      }

      // Parse payload
      let payload: any;
      try {
        payload = typeof request.payload === 'string' 
          ? JSON.parse(request.payload) 
          : request.payload;
      } catch (error) {
        const parseError = `Invalid JSON payload: ${error.message}`;
        await this.logValidationEvent('WEBHOOK_PAYLOAD_INVALID', request.providerId, { error: parseError });
        return { valid: false, error: parseError, providerId: request.providerId, provider };
      }

      // Check for replay attacks if enabled
      if (this.config.enableReplayProtection) {
        const replayCheck = this.checkReplayProtection(request, payload);
        if (!replayCheck.valid) {
          await this.logValidationEvent('WEBHOOK_REPLAY_DETECTED', request.providerId, {
            error: replayCheck.error,
            timestamp: request.timestamp
          });
          return replayCheck;
        }
      }

      // Validate event type if provided
      if (request.eventType && provider.eventTypes.length > 0) {
        if (!provider.eventTypes.includes(request.eventType)) {
          const error = `Unsupported event type: ${request.eventType}`;
          await this.logValidationEvent('WEBHOOK_EVENT_TYPE_INVALID', request.providerId, { error });
          return { valid: false, error, providerId: request.providerId, provider };
        }
      }

      const result: WebhookValidationResult = {
        valid: true,
        providerId: request.providerId,
        provider,
        eventType: request.eventType,
        payload,
        signature: request.signature,
        computedSignature: signatureValidation.computedSignature,
        timestamp: new Date(),
        metadata: {
          headers: request.headers,
          payloadSize: JSON.stringify(payload).length
        }
      };

      await this.logValidationEvent('WEBHOOK_VALIDATION_SUCCESS', request.providerId, {
        eventType: request.eventType,
        payloadSize: result.metadata.payloadSize
      });

      return result;

    } catch (error) {
      const errorMessage = `Webhook validation error: ${error.message}`;
      await this.logValidationEvent('WEBHOOK_VALIDATION_ERROR', request.providerId, { error: errorMessage });
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Validate webhook from Fastify request
   */
  async validateWebhookFromRequest(
    request: FastifyRequest,
    providerId: string
  ): Promise<WebhookValidationResult> {

    const provider = this.providers.get(providerId);
    if (!provider) {
      return { valid: false, error: `Unknown provider: ${providerId}` };
    }

    const signature = request.headers[provider.signatureHeader.toLowerCase()] as string;
    if (!signature) {
      return { 
        valid: false, 
        error: `Missing signature header: ${provider.signatureHeader}`,
        providerId
      };
    }

    const payload = request.body as string | Buffer;
    const eventType = this.extractEventType(request, provider);
    const timestamp = request.headers['x-timestamp'] as string || 
                     request.headers['timestamp'] as string;

    const webhookRequest: WebhookRequest = {
      providerId,
      signature,
      payload,
      headers: request.headers as Record<string, string>,
      timestamp,
      eventType
    };

    return await this.validateWebhook(webhookRequest);
  }

  /**
   * Get registered providers
   */
  getProviders(): WebhookProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get specific provider
   */
  getProvider(providerId: string): WebhookProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Update provider configuration
   */
  async updateProvider(providerId: string, updates: Partial<WebhookProvider>): Promise<boolean> {

    const provider = this.providers.get(providerId);
    if (!provider) {
      return false;
    }

    const updatedProvider = {
      ...provider,
      ...updates,
      updatedAt: new Date()
    };

    this.providers.set(providerId, updatedProvider);

    if (this.config.enableAuditLogging) {
      await this.auditService.logEvent({
        eventType: 'WEBHOOK_PROVIDER_UPDATED',
        details: {
          providerId,
          updates: Object.keys(updates)
  }
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['webhook_management'],
          evidenceLevel: 'ENHANCED'
        }
      });
    }

    return true;
  }

  /**
   * Remove provider
   */
  async removeProvider(providerId: string): Promise<boolean> {

    const removed = this.providers.delete(providerId);

    if (removed && this.config.enableAuditLogging) {
      await this.auditService.logEvent({
        eventType: 'WEBHOOK_PROVIDER_REMOVED',
        details: { providerId },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['webhook_management'],
          evidenceLevel: 'ENHANCED'
        }
      });
    }

    return removed;
  }

  /**
   * Test webhook provider configuration
   */
  async testProvider(providerId: string, testPayload: any): Promise<WebhookValidationResult> {

    const provider = this.providers.get(providerId);
    if (!provider) {
      return { valid: false, error: `Provider not found: ${providerId}` };
    }

    const testSignature = this.generateSignature(JSON.stringify(testPayload), provider);
    
    const testRequest: WebhookRequest = {
      providerId,
      signature: testSignature,
      payload: JSON.stringify(testPayload),
      headers: { [provider.signatureHeader.toLowerCase()]: testSignature },
      eventType: 'test',
      timestamp: new Date().toISOString()
    };

    return await this.validateWebhook(testRequest);
  }

  /**
   * Get webhook statistics
   */
  getStatistics(): any {
    return {
      totalProviders: this.providers.size,
      activeProviders: Array.from(this.providers.values()).filter(p => p.active).length,
      providersWithEvents: Array.from(this.providers.values()).filter(p => p.eventTypes.length > 0).length,
      totalEventTypes: Array.from(this.providers.values())
        .reduce((total, p) => total + p.eventTypes.length, 0),
      replayProtectionEnabled: this.config.enableReplayProtection,
      processedEventsCount: this.processedEvents.size
    };
  }

  // Private helper methods

  private initializeProviders(): void {
    // Initialize default providers from config
    Object.entries(this.config.providers).forEach(([providerId, provider]) => {
      this.providers.set(providerId, provider);
    });
  }

  private verifySignature(request: WebhookRequest, provider: WebhookProvider): WebhookValidationResult {
    try {
      const computedSignature = this.generateSignature(request.payload, provider);
      const receivedSignature = this.normalizeSignature(request.signature, provider);
      
      const valid = crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'utf8'),
        Buffer.from(receivedSignature, 'utf8')
      );

      return {
        valid,
        providerId: request.providerId,
        provider,
        signature: request.signature,
        computedSignature,
        error: valid ? undefined : 'Signature verification failed'
      };
    } catch (error) {
      return {
        valid: false,
        providerId: request.providerId,
        provider,
        error: `Signature verification error: ${error.message}`
      };
    }
  }

  private generateSignature(payload: string | Buffer, provider: WebhookProvider): string {
    const data = typeof payload === 'string' ? payload : payload.toString('utf8');
    const hmac = crypto.createHmac(provider.signatureAlgorithm, provider.secretKey);
    hmac.update(data, 'utf8');
    const signature = hmac.digest('hex');
    
    return provider.signaturePrefix ? `${provider.signaturePrefix}${signature}` : signature;
  }

  private normalizeSignature(signature: string, provider: WebhookProvider): string {
    if (provider.signaturePrefix && signature.startsWith(provider.signaturePrefix)) {
      return signature.substring(provider.signaturePrefix.length);
    }
    return signature;
  }

  private checkReplayProtection(request: WebhookRequest, payload: any): WebhookValidationResult {
    // Generate event ID for replay detection
    const eventId = this.generateEventId(request, payload);
    
    if (this.processedEvents.has(eventId)) {
      return {
        valid: false,
        error: 'Duplicate webhook event detected',
        providerId: request.providerId
      };
    }

    // Check timestamp if available
    if (request.timestamp) {
      const timestampMs = Date.parse(request.timestamp);
      if (isNaN(timestampMs)) {
        return {
          valid: false,
          error: 'Invalid timestamp format',
          providerId: request.providerId
        };
      }

      const now = Date.now();
      const age = now - timestampMs;
      
      if (age > this.config.replayWindowSeconds * 1000) {
        return {
          valid: false,
          error: 'Webhook timestamp too old',
          providerId: request.providerId
        };
      }

      if (age < -60000) { // 1 minute in future
        return {
          valid: false,
          error: 'Webhook timestamp too far in future',
          providerId: request.providerId
        };
      }
    }

    // Add to processed events
    this.processedEvents.add(eventId);

    // Clean up old events periodically
    if (this.processedEvents.size > 10000) {
      this.cleanupProcessedEvents();
    }

    return { valid: true, providerId: request.providerId };
  }

  private generateEventId(request: WebhookRequest, payload: any): string {
    const data = `${request.providerId}:${request.signature}:${JSON.stringify(payload)}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private extractEventType(request: FastifyRequest, provider: WebhookProvider): string | undefined {
    // Common event type header patterns
    const eventTypeHeaders = [
      'x-event-type',
      'x-github-event',
      'x-stripe-event',
      'event-type',
      'webhook-event-type'
    ];

    for (const header of eventTypeHeaders) {
      const value = request.headers[header];
      if (value && typeof value === 'string') {
        return value;
      }
    }

    // Try to extract from payload
    try {
      const payload = request.body as any;
      if (payload && typeof payload === 'object') {
        return payload.type || payload.event_type || payload.eventType;
      }
    } catch (error) {
      // Ignore payload parsing errors
    }

    return undefined;
  }

  private cleanupProcessedEvents(): void {
    // Keep only the most recent 5000 events
    const events = Array.from(this.processedEvents);
    this.processedEvents.clear();
    
    events.slice(-5000).forEach(eventId => {
      this.processedEvents.add(eventId);
    });
  }

  private async logValidationEvent(eventType: string, providerId: string, details: any): Promise<void> {

    if (this.config.enableAuditLogging) {
      await this.auditService.logEvent({
        eventType,
        details: {
          providerId,
          ...details
  }
        riskLevel: eventType.includes('FAILED') || eventType.includes('INVALID') ? 'HIGH' : 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['webhook_security'],
          evidenceLevel: 'STANDARD'
        }
      });
    }
  }
}