/**
 * Service Mocks - Comprehensive Service Layer Mocking System
 *
 * Provides specialized mock implementations for external services, internal
 * services, authentication providers, file systems, and network operations.
 *
 * Task: E18-1753114562158-DAD671
 */

import MockFactory, { MockConfig } from './MockFactory';
import seedrandom from 'seedrandom';
import { EventEmitter } from 'events';

export interface ServiceConfig {
  name: string;
  type: 'http' | 'websocket' | 'grpc' | 'message_queue' | 'cache' | 'storage';
  endpoint?: string;
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key' | 'oauth';
    credentials?: unknown;
  };
  timeout?: number;
  retries?: number;
  circuitBreaker?: {
    failureThreshold: number;
    resetTimeout: number;
  };
}

export interface MockResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  latency?: number;
}

export interface ServiceCall {
  id: string;
  service: string;
  method: string;
  args: unknown[];
  timestamp: Date;
  response?: MockResponse;
  duration?: number;
}

export class ServiceMockManager extends EventEmitter {
  private factory: MockFactory;
  private services: Map<string, unknown> = new Map();
  private callHistory: ServiceCall[] = [];
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private rng: seedrandom.PRNG;

  constructor(config: MockConfig = {}) {
    super();
    this.factory = new MockFactory(config);
    this.rng = seedrandom(config.seed?.toString() || '12345');
    this.initializeDefaultServices();
  }

  /**
   * Register a new mock service
   */
  registerService(name: string, serviceConfig: ServiceConfig): unknown {
    const service = this.createMockService(name, serviceConfig);
    this.services.set(name, service);

    // Set up circuit breaker if configured
    if (serviceConfig.circuitBreaker) {
      this.circuitBreakers.set(name, new CircuitBreaker(serviceConfig.circuitBreaker));
    }

    console.log(`🔌 Registered mock service: ${name} (${serviceConfig.type})`);
    return service;
  }

  /**
   * Get a registered service
   */
  getService(name: string): unknown {
    return this.services.get(name);
  }

  /**
   * Create authentication service mock
   */
  createAuthenticationService(name: string = 'auth'): unknown {
    const users = new Map();
    const sessions = new Map();
    const tokens = new Map();

    const authService = {
      name,
      type: 'authentication',

      // User management
      createUser: async (userData: unknown) => {
        const user = {
          id: this.generateId(),
          ...userData,
          createdAt: new Date(),
          verified: false,
        };
        users.set(user.id, user);
        return this.createServiceResponse(name, 'createUser', { user });
      },

      // Authentication methods
      login: async (credentials: { email: string; password: string }) => {
        await this.simulateLatency(name);

        // Find user by email
        const user = Array.from(users.values()).find((u: unknown) => u.email === credentials.email);

        if (user && user.password === credentials.password) {
          const sessionId = this.generateId();
          const accessToken = this.generateJWT(user, sessionId);
          const refreshToken = this.generateId();

          const session = {
            id: sessionId,
            userId: user.id,
            accessToken,
            refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            deviceInfo: this.generateDeviceInfo(),
          };

          sessions.set(sessionId, session);
          tokens.set(accessToken, session);

          return this.createServiceResponse(name, 'login', {
            success: true,
            user: { ...user, password: undefined },
            session: { ...session, refreshToken: undefined }, // Don't expose refresh token
            accessToken,
            refreshToken,
          });
        }

        return this.createServiceResponse(
          name,
          'login',
          {
            success: false,
            error: 'Invalid credentials',
          },
          401
        );
      },

      logout: async (sessionId: string) => {
        const session = sessions.get(sessionId);
        if (session) {
          sessions.delete(sessionId);
          tokens.delete(session.accessToken);
          return this.createServiceResponse(name, 'logout', { success: true });
        }
        return this.createServiceResponse(name, 'logout', { error: 'Session not found' }, 404);
      },

      validateToken: async (token: string) => {
        const session = tokens.get(token);
        if (session && new Date() < session.expiresAt) {
          const user = users.get(session.userId);
          return this.createServiceResponse(name, 'validateToken', {
            valid: true,
            user: user ? { ...user, password: undefined } : null,
            session: { id: session.id, expiresAt: session.expiresAt },
          });
        }
        return this.createServiceResponse(name, 'validateToken', { valid: false }, 401);
      },

      refreshToken: async (refreshToken: string) => {
        const session = Array.from(sessions.values()).find((s: unknown) => s.refreshToken === refreshToken);
        if (session && new Date() < session.expiresAt) {
          const newAccessToken = this.generateJWT(users.get(session.userId), session.id);
          const newRefreshToken = this.generateId();

          // Update session
          tokens.delete(session.accessToken);
          session.accessToken = newAccessToken;
          session.refreshToken = newRefreshToken;
          tokens.set(newAccessToken, session);

          return this.createServiceResponse(name, 'refreshToken', {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        }
        return this.createServiceResponse(name, 'refreshToken', { error: 'Invalid refresh token' }, 401);
      },

      // OAuth provider simulation
      oauth: {
        google: async (code: string) => this.simulateOAuthFlow('google', code),
        github: async (code: string) => this.simulateOAuthFlow('github', code),
        microsoft: async (code: string) => this.simulateOAuthFlow('microsoft', code),
      },

      // Multi-factor authentication
      mfa: {
        setup: async (userId: string, type: 'totp' | 'sms' | 'email') => {
          const user = users.get(userId);
          if (user) {
            const secret = this.generateId();
            user.mfa = { type, secret, enabled: false };
            return this.createServiceResponse(name, 'mfa.setup', {
              secret,
              qrCode: type === 'totp' ? `otpauth://totp/App:${user.email}?secret=${secret}` : undefined,
            });
          }
          return this.createServiceResponse(name, 'mfa.setup', { error: 'User not found' }, 404);
        },

        verify: async (userId: string, token: string) => {
          const user = users.get(userId);
          if (user?.mfa) {
            // Simple mock verification - in real implementation, would validate TOTP/SMS
            const isValid = token.length === 6 && /^\d+$/.test(token);
            if (isValid) {
              user.mfa.enabled = true;
              return this.createServiceResponse(name, 'mfa.verify', { verified: true });
            }
          }
          return this.createServiceResponse(name, 'mfa.verify', { verified: false }, 400);
        },
      },

      // Password reset
      resetPassword: {
        request: async (email: string) => {
          const user = Array.from(users.values()).find((u: unknown) => u.email === email);
          if (user) {
            const resetToken = this.generateId();
            user.resetToken = resetToken;
            user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            return this.createServiceResponse(name, 'resetPassword.request', {
              success: true,
              resetToken, // In real app, would send via email
            });
          }
          return this.createServiceResponse(name, 'resetPassword.request', { success: true }); // Don't reveal if email exists
        },

        confirm: async (token: string, newPassword: string) => {
          const user = Array.from(users.values()).find((u: unknown) => u.resetToken === token);
          if (user && user.resetTokenExpires > new Date()) {
            user.password = newPassword;
            delete user.resetToken;
            delete user.resetTokenExpires;
            return this.createServiceResponse(name, 'resetPassword.confirm', { success: true });
          }
          return this.createServiceResponse(name, 'resetPassword.confirm', { error: 'Invalid or expired token' }, 400);
        },
      },

      // Utility methods
      getStats: () => ({
        totalUsers: users.size,
        activeSessions: sessions.size,
        tokensIssued: tokens.size,
      }),

      clearAll: () => {
        users.clear();
        sessions.clear();
        tokens.clear();
      },
    };

    this.services.set(name, authService);
    return authService;
  }

  /**
   * Create file storage service mock
   */
  createFileStorageService(name: string = 'storage'): unknown {
    const files = new Map();
    const metadata = new Map();

    const storageService = {
      name,
      type: 'storage',

      upload: async (file: { name: string; _content: unknown; mimeType?: string; size?: number }) => {
        await this.simulateLatency(name, 500); // File upload takes longer

        const fileId = this.generateId();
        const fileData = {
          id: fileId,
          name: file.name,
          mimeType: file.mimeType || 'application/octet-stream',
          size: file.size || (typeof file.content === 'string' ? file.content.length : 1000),
          uploadedAt: new Date(),
          checksum: this.generateChecksum(file.content),
        };

        files.set(fileId, file.content);
        metadata.set(fileId, fileData);

        return this.createServiceResponse(name, 'upload', {
          file: fileData,
          url: `https://mock-storage.example.com/${fileId}`,
        });
      },

      download: async (fileId: string) => {
        await this.simulateLatency(name, 200);

        const content = files.get(fileId);
        const meta = metadata.get(fileId);

        if (content && meta) {
          return this.createServiceResponse(name, 'download', {
            content,
            metadata: meta,
          });
        }

        return this.createServiceResponse(name, 'download', { error: 'File not found' }, 404);
      },

      delete: async (fileId: string) => {
        const existed = files.delete(fileId) && metadata.delete(fileId);
        return this.createServiceResponse(
          name,
          'delete',
          {
            success: existed,
            message: existed ? 'File deleted' : 'File not found',
          },
          existed ? 200 : 404
        );
      },

      list: async (filter?: { mimeType?: string; uploadedAfter?: Date }) => {
        let fileList = Array.from(metadata.values());

        if (filter) {
          if (filter.mimeType) {
            fileList = fileList.filter((f: unknown) => f.mimeType === filter.mimeType);
          }
          if (filter.uploadedAfter) {
            fileList = fileList.filter((f: unknown) => f.uploadedAt >= filter.uploadedAfter);
          }
        }

        return this.createServiceResponse(name, 'list', { files: fileList });
      },

      getMetadata: async (fileId: string) => {
        const meta = metadata.get(fileId);
        return meta
          ? this.createServiceResponse(name, 'getMetadata', { metadata: meta })
          : this.createServiceResponse(name, 'getMetadata', { error: 'File not found' }, 404);
      },
    };

    this.services.set(name, storageService);
    return storageService;
  }

  /**
   * Create email service mock
   */
  createEmailService(name: string = 'email'): unknown {
    const sentEmails: unknown[] = [];

    const emailService = {
      name,
      type: 'email',

      send: async (emailData: {
        to: string | string[];
        subject: string;
        body: string;
        from?: string;
        replyTo?: string;
        attachments?: unknown[];
        template?: string;
        templateData?: unknown;
      }) => {
        await this.simulateLatency(name, 300);

        const email = {
          id: this.generateId(),
          ...emailData,
          from: emailData.from || 'noreply@example.com',
          sentAt: new Date(),
          status: 'sent',
        };

        sentEmails.push(email);

        return this.createServiceResponse(name, 'send', {
          messageId: email.id,
          status: 'sent',
        });
      },

      sendBulk: async (emails: unknown[]) => {
        await this.simulateLatency(name, emails.length * 50); // Scale with email count

        const results = emails.map(emailData => {
          const email = {
            id: this.generateId(),
            ...emailData,
            sentAt: new Date(),
            status: this.rng() > 0.95 ? 'failed' : 'sent', // 5% failure rate
          };
          sentEmails.push(email);
          return { id: email.id, status: email.status };
        });

        return this.createServiceResponse(name, 'sendBulk', { results });
      },

      getDeliveryStatus: async (messageId: string) => {
        const email = sentEmails.find(e => e.id === messageId);
        if (email) {
          const statuses = ['sent', 'delivered', 'opened', 'clicked'];
          const randomIndex = Math.floor(this.rng() * statuses.length);
          const maxIndex = statuses.indexOf((email as { status: string }).status) + 1;
          const status = statuses[Math.min(randomIndex, maxIndex)];
          return this.createServiceResponse(name, 'getDeliveryStatus', {
            messageId,
            status,
            events: this.generateEmailEvents(email),
          });
        }
        return this.createServiceResponse(name, 'getDeliveryStatus', { error: 'Message not found' }, 404);
      },

      getStats: () => ({
        totalSent: sentEmails.length,
        successRate: sentEmails.filter(e => e.status === 'sent').length / sentEmails.length,
        recentEmails: sentEmails.slice(-10),
      }),
    };

    this.services.set(name, emailService);
    return emailService;
  }

  /**
   * Create analytics service mock
   */
  createAnalyticsService(name: string = 'analytics'): unknown {
    const events: unknown[] = [];
    const users: Map<string, unknown> = new Map();

    const analyticsService = {
      name,
      type: 'analytics',

      track: async (userId: string, event: string, properties?: unknown) => {
        const eventData = {
          id: this.generateId(),
          userId,
          event,
          properties: properties || {},
          timestamp: new Date(),
          sessionId: this.generateSessionId(),
        };

        events.push(eventData);
        return this.createServiceResponse(name, 'track', { eventId: eventData.id });
      },

      identify: async (userId: string, _traits: unknown) => {
        users.set(userId, {
          id: userId,
          traits,
          identifiedAt: new Date(),
          lastSeen: new Date(),
        });
        return this.createServiceResponse(name, 'identify', { success: true });
      },

      page: async (userId: string, pageName: string, properties?: unknown) => {
        return this.track(userId, 'page_view', {
          page: pageName,
          ...properties,
        });
      },

      group: async (userId: string, groupId: string, _traits?: unknown) => {
        return this.createServiceResponse(name, 'group', {
          userId,
          groupId,
          success: true,
        });
      },

      // Analytics queries
      getEvents: async (filter?: {
        userId?: string;
        event?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
      }) => {
        let filteredEvents = events;

        if (filter) {
          if (filter.userId) {
            filteredEvents = filteredEvents.filter(e => e.userId === filter.userId);
          }
          if (filter.event) {
            filteredEvents = filteredEvents.filter(e => e.event === filter.event);
          }
          if (filter.startDate) {
            filteredEvents = filteredEvents.filter(e => e.timestamp >= filter.startDate);
          }
          if (filter.endDate) {
            filteredEvents = filteredEvents.filter(e => e.timestamp <= filter.endDate);
          }
          if (filter.limit) {
            filteredEvents = filteredEvents.slice(-filter.limit);
          }
        }

        return this.createServiceResponse(name, 'getEvents', {
          events: filteredEvents,
          total: filteredEvents.length,
        });
      },

      getFunnel: async (steps: string[], userId?: string) => {
        const userEvents = userId ? events.filter(e => e.userId === userId) : events;

        const funnelData = steps.map(step => {
          const stepEvents = userEvents.filter(e => e.event === step);
          return {
            step,
            count: stepEvents.length,
            conversionRate: stepEvents.length / (userEvents.length || 1),
          };
        });

        return this.createServiceResponse(name, 'getFunnel', { funnel: funnelData });
      },

      getRetention: async (cohortDate: Date, periods: number = 7) => {
        // Mock retention analysis
        const retentionData = Array.from({ length: periods }, (_, i) => ({
          period: i,
          users: Math.floor(this.rng() * 100) + 10,
          percentage: Math.max(10, 100 - i * 15 + (this.rng() * 20 - 10)),
        }));

        return this.createServiceResponse(name, 'getRetention', { retention: retentionData });
      },
    };

    this.services.set(name, analyticsService);
    return analyticsService;
  }

  /**
   * Create WebSocket service mock
   */
  createWebSocketService(name: string = 'websocket'): unknown {
    const connections = new Map();
    const channels = new Map();

    const wsService = new EventEmitter();
    Object.assign(wsService, {
      name,
      type: 'websocket',

      connect: async (userId: string, protocols?: string[]) => {
        const connectionId = this.generateId();
        const connection = {
          id: connectionId,
          userId,
          protocols: protocols || [],
          connectedAt: new Date(),
          lastPing: new Date(),
          channels: new Set(),
        };

        connections.set(connectionId, connection);

        // Simulate connection events
        setTimeout(() => {
          wsService.emit('connection', connection);
        }, 10);

        return this.createServiceResponse(name, 'connect', {
          connectionId,
          protocols: connection.protocols,
        });
      },

      disconnect: async (connectionId: string) => {
        const connection = connections.get(connectionId);
        if (connection) {
          // Leave all channels
          connection.channels.forEach((channel: string) => {
            this.leaveChannel(connectionId, channel);
          });

          connections.delete(connectionId);
          wsService.emit('disconnect', connection);

          return this.createServiceResponse(name, 'disconnect', { success: true });
        }
        return this.createServiceResponse(name, 'disconnect', { error: 'Connection not found' }, 404);
      },

      send: async (connectionId: string, message: unknown) => {
        const connection = connections.get(connectionId);
        if (connection) {
          wsService.emit('message', { connectionId, message, timestamp: new Date() });
          return this.createServiceResponse(name, 'send', { delivered: true });
        }
        return this.createServiceResponse(name, 'send', { error: 'Connection not found' }, 404);
      },

      broadcast: async (channel: string, message: unknown, excludeConnection?: string) => {
        const channelConnections = channels.get(channel) || new Set();
        let delivered = 0;

        for (const connectionId of channelConnections) {
          if (connectionId !== excludeConnection) {
            wsService.emit('message', { connectionId, message, channel, timestamp: new Date() });
            delivered++;
          }
        }

        return this.createServiceResponse(name, 'broadcast', { delivered });
      },

      joinChannel: async (connectionId: string, channel: string) => {
        const connection = connections.get(connectionId);
        if (connection) {
          if (!channels.has(channel)) {
            channels.set(channel, new Set());
          }

          channels.get(channel).add(connectionId);
          connection.channels.add(channel);

          wsService.emit('join', { connectionId, channel });
          return this.createServiceResponse(name, 'joinChannel', { success: true });
        }
        return this.createServiceResponse(name, 'joinChannel', { error: 'Connection not found' }, 404);
      },

      leaveChannel: (connectionId: string, channel: string) => {
        const channelConnections = channels.get(channel);
        if (channelConnections) {
          channelConnections.delete(connectionId);
          if (channelConnections.size === 0) {
            channels.delete(channel);
          }
        }

        const connection = connections.get(connectionId);
        if (connection) {
          connection.channels.delete(channel);
        }

        wsService.emit('leave', { connectionId, channel });
      },

      getStats: () => ({
        activeConnections: connections.size,
        activeChannels: channels.size,
        connectionsByChannel: Object.fromEntries(
          Array.from(channels.entries()).map(([channel, conns]) => [channel, conns.size])
        ),
      }),
    });

    this.services.set(name, wsService);
    return wsService;
  }

  /**
   * Create notification service mock
   */
  createNotificationService(name: string = 'notifications'): unknown {
    const notifications: unknown[] = [];
    const subscriptions: Map<string, unknown[]> = new Map();

    const notificationService = {
      name,
      type: 'notifications',

      send: async (notification: {
        userId: string;
        type: 'email' | 'push' | 'sms' | 'in_app';
        title: string;
        message: string;
        data?: unknown;
        scheduledFor?: Date;
      }) => {
        const notif = {
          id: this.generateId(),
          ...notification,
          sentAt: notification.scheduledFor || new Date(),
          status: 'sent',
          delivered: this.rng() > 0.05, // 95% delivery rate
        };

        notifications.push(notif);
        return this.createServiceResponse(name, 'send', {
          notificationId: notif.id,
          status: notif.status,
        });
      },

      subscribe: async (userId: string, channels: string[], preferences?: unknown) => {
        const subscription = {
          userId,
          channels,
          preferences: preferences || {},
          subscribedAt: new Date(),
          active: true,
        };

        if (!subscriptions.has(userId)) {
          subscriptions.set(userId, []);
        }
        subscriptions.get(userId)?.push(subscription);

        return this.createServiceResponse(name, 'subscribe', { success: true });
      },

      unsubscribe: async (userId: string, channels?: string[]) => {
        const userSubs = subscriptions.get(userId);
        if (userSubs) {
          if (channels) {
            userSubs.forEach(sub => {
              sub.channels = sub.channels.filter((c: string) => !channels.includes(c));
            });
          } else {
            subscriptions.delete(userId);
          }
        }

        return this.createServiceResponse(name, 'unsubscribe', { success: true });
      },

      getNotifications: async (
        userId: string,
        filter?: {
          type?: string;
          startDate?: Date;
          limit?: number;
        }
      ) => {
        let userNotifications = notifications.filter(n => n.userId === userId);

        if (filter) {
          if (filter.type) {
            userNotifications = userNotifications.filter(n => n.type === filter.type);
          }
          if (filter.startDate) {
            userNotifications = userNotifications.filter(n => n.sentAt >= filter.startDate);
          }
          if (filter.limit) {
            userNotifications = userNotifications.slice(-filter.limit);
          }
        }

        return this.createServiceResponse(name, 'getNotifications', {
          notifications: userNotifications,
        });
      },
    };

    this.services.set(name, notificationService);
    return notificationService;
  }

  // Helper methods
  private createMockService(name: string, config: ServiceConfig): unknown {
    const baseService = {
      name,
      config,
      isHealthy: () => this.rng() > 0.05, // 95% uptime
      getLatency: () => Math.floor(this.rng() * 200) + 10, // 10-210ms
      call: async (method: string, ...args: unknown[]) => {
        return this.recordServiceCall(name, method, args);
      },
    };

    switch (config.type) {
      case 'http':
        return { ...baseService, ...this.createHTTPMethods(name) };
      case 'cache':
        return { ...baseService, ...this.createCacheMethods(name) };
      case 'message_queue':
        return { ...baseService, ...this.createMessageQueueMethods(name) };
      default:
        return baseService;
    }
  }

  private createHTTPMethods(serviceName: string) {
    return {
      get: async (path: string, params?: unknown) => this.recordServiceCall(serviceName, 'GET', [path, params]),
      post: async (path: string, data?: unknown) => this.recordServiceCall(serviceName, 'POST', [path, data]),
      put: async (path: string, data?: unknown) => this.recordServiceCall(serviceName, 'PUT', [path, data]),
      delete: async (path: string) => this.recordServiceCall(serviceName, 'DELETE', [path]),
    };
  }

  private createCacheMethods(serviceName: string) {
    const cache = new Map();

    return {
      get: async (key: string) => {
        const value = cache.get(key);
        return this.createServiceResponse(serviceName, 'get', { key, value });
      },
      set: async (key: string, value: unknown, ttl?: number) => {
        cache.set(key, value);
        if (ttl) {
          setTimeout(() => cache.delete(key), ttl * 1000);
        }
        return this.createServiceResponse(serviceName, 'set', { success: true });
      },
      delete: async (key: string) => {
        const existed = cache.delete(key);
        return this.createServiceResponse(serviceName, 'delete', { existed });
      },
    };
  }

  private createMessageQueueMethods(serviceName: string) {
    const queues = new Map();

    return {
      publish: async (_topic: string, message: unknown) => {
        if (!queues.has(topic)) {
          queues.set(topic, []);
        }
        queues.get(topic).push({ message, timestamp: new Date() });
        return this.createServiceResponse(serviceName, 'publish', { messageId: this.generateId() });
      },
      subscribe: async (_topic: string, _handler: () => void) => {
        // Mock subscription
        return this.createServiceResponse(serviceName, 'subscribe', { subscribed: true });
      },
    };
  }

  private initializeDefaultServices(): void {
    // Create commonly needed services
    this.createAuthenticationService();
    this.createFileStorageService();
    this.createEmailService();
    this.createAnalyticsService();
    this.createWebSocketService();
    this.createNotificationService();
  }

  private async recordServiceCall(serviceName: string, method: string, args: unknown[]): Promise<MockResponse> {
    const callId = this.generateId();
    const startTime = Date.now();

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker && circuitBreaker.isOpen()) {
      return this.createServiceResponse(
        serviceName,
        method,
        {
          error: 'Service temporarily unavailable (circuit breaker open)',
        },
        503
      );
    }

    try {
      await this.simulateLatency(serviceName);

      const response = this.createServiceResponse(serviceName, method, {
        success: true,
        data: `Mock response for ${method}`,
        args,
      });

      const duration = Date.now() - startTime;

      const serviceCall: ServiceCall = {
        id: callId,
        service: serviceName,
        method,
        args,
        timestamp: new Date(),
        response,
        duration,
      };

      this.callHistory.push(serviceCall);
      this.emit('serviceCall', serviceCall);

      // Record success in circuit breaker
      circuitBreaker?.recordSuccess();

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResponse = this.createServiceResponse(
        serviceName,
        method,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );

      const serviceCall: ServiceCall = {
        id: callId,
        service: serviceName,
        method,
        args,
        timestamp: new Date(),
        response: errorResponse,
        duration,
      };

      this.callHistory.push(serviceCall);
      this.emit('serviceError', serviceCall);

      // Record failure in circuit breaker
      circuitBreaker?.recordFailure();

      return errorResponse;
    }
  }

  private createServiceResponse(
    serviceName: string,
    method: string,
    data: unknown,
    statusCode: number = 200
  ): MockResponse {
    return {
      success: statusCode < 400,
      data: statusCode < 400 ? data : undefined,
      error: statusCode >= 400 ? data.error || 'Service error' : undefined,
      statusCode,
      latency: Math.floor(this.rng() * 100) + 10, // 10-110ms
    };
  }

  private async simulateLatency(serviceName: string, baseLatency: number = 100): Promise<void> {
    const latency = Math.floor(this.rng() * baseLatency) + 10;
    await new Promise(resolve => setTimeout(resolve, latency));
  }

  private simulateOAuthFlow(provider: string, code: string): MockResponse {
    // Simulate OAuth exchange
    const userData = {
      id: this.generateId(),
      email: `user@${provider}.example`,
      name: `${provider} User`,
      provider,
      providerData: {
        code,
        exchangedAt: new Date(),
      },
    };

    return this.createServiceResponse('auth', `oauth.${provider}`, {
      success: true,
      user: userData,
      accessToken: this.generateJWT(userData, 'oauth_session'),
    });
  }

  private generateEmailEvents(email: unknown): unknown[] {
    const events = [{ type: 'sent', timestamp: email.sentAt }];

    if (this.rng() > 0.2) {
      // 80% delivery rate
      events.push({ type: 'delivered', timestamp: new Date(email.sentAt.getTime() + 30000) });

      if (this.rng() > 0.4) {
        // 60% open rate
        events.push({ type: 'opened', timestamp: new Date(email.sentAt.getTime() + 120000) });

        if (this.rng() > 0.7) {
          // 30% click rate
          events.push({ type: 'clicked', timestamp: new Date(email.sentAt.getTime() + 180000) });
        }
      }
    }

    return events;
  }

  private generateDeviceInfo(): string {
    const devices = [
      'iPhone 14 Pro - iOS 16.0',
      'Samsung Galaxy S23 - Android 13',
      'MacBook Pro M2 - macOS Ventura',
      'Windows 11 Desktop - Chrome 118',
    ];
    return devices[Math.floor(this.rng() * devices.length)];
  }

  private generateJWT(user: unknown, sessionId: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    return `mock_jwt_${btoa(JSON.stringify(payload))}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.floor(this.rng() * 10000)}`;
  }

  private generateChecksum(_content: unknown): string {
    return `md5_${Math.floor(this.rng() * 1000000)}`;
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.floor(this.rng() * 10000)}`;
  }

  /**
   * Get service call history
   */
  getCallHistory(serviceName?: string): ServiceCall[] {
    return serviceName ? this.callHistory.filter(call => call.service === serviceName) : this.callHistory;
  }

  /**
   * Clear call history
   */
  clearCallHistory(): void {
    this.callHistory = [];
  }

  /**
   * Get all registered services
   */
  getServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Cleanup all services
   */
  cleanup(): void {
    this.services.clear();
    this.circuitBreakers.clear();
    this.callHistory = [];
    this.removeAllListeners();
    this.factory.cleanup();
    console.log('🧹 Service mock manager cleanup completed');
  }
}

/**
 * Simple circuit breaker implementation
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: { failureThreshold: number; resetTimeout: number }) {}

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }
}

export default ServiceMockManager;
