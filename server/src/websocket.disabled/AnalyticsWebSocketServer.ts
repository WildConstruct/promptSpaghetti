import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { CostTracker } from '../analytics/CostTracker';

/**
 * WebSocket message types (matching client)
 */
export enum WebSocketMessageType {
  ANALYTICS_UPDATE = 'analytics_update',
  COST_ALERT = 'cost_alert',
  BUDGET_ALERT = 'budget_alert',
  PERFORMANCE_METRIC = 'performance_metric',
  USER_ACTIVITY = 'user_activity',
  SYSTEM_STATUS = 'system_status',
  RECOMMENDATION = 'recommendation',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  SUBSCRIPTION = 'subscription',
  UNSUBSCRIPTION = 'unsubscription'
}

/**
 * WebSocket message structure
 */
}
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: number;
  id?: string;
}
}

/**
 * Client connection info
 */
}
export interface ClientConnection {
  id: string;
  socket: WebSocket;
  userId?: number;
  organizationId?: number;
  subscriptions: Set<string>;
  lastActivity: number;
  isAuthenticated: boolean;
}
}

/**
 * Subscription configuration
 */
}
export interface SubscriptionConfig {
  topic: string;
  filters?: {
    userId?: number;
    organizationId?: number;
    eventTypes?: string[];
    minSeverity?: 'info' | 'warning' | 'critical';
}
  };
  throttle?: number;
}

/**
 * Analytics WebSocket server
 */
export class AnalyticsWebSocketServer extends EventEmitter {
  private clients: Map<string, ClientConnection> = new Map();
  private topicSubscriptions: Map<string, Set<string>> = new Map();
  private analyticsCollector: AnalyticsCollector;
  private analyticsDashboard: AnalyticsDashboard;
  private costTracker: CostTracker;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    analyticsCollector: AnalyticsCollector,
    analyticsDashboard: AnalyticsDashboard,
    costTracker: CostTracker
  ) {
    super();
    this.analyticsCollector = analyticsCollector;
    this.analyticsDashboard = analyticsDashboard;
    this.costTracker = costTracker;

    this.setupEventListeners();
    this.startHeartbeat();
    this.startCleanup();
  }

  /**
   * Setup WebSocket server with Fastify
   */
  setupWebSocketServer(fastify: FastifyInstance): void {
    // Register websocket support
    fastify.register(require('@fastify/websocket'));

    // WebSocket route
    fastify.register(async function (fastify) {
      fastify.get('/ws/analytics', { websocket: true }, (connection, req) => {
        const clientId = uuidv4();
        const client: ClientConnection = {
          id: clientId,
          socket: connection.socket,
          subscriptions: new Set(),
          lastActivity: Date.now(),
          isAuthenticated: false
        };

        this.clients.set(clientId, client);
        this.handleConnection(client);

        // Handle client disconnect
        connection.socket.on('close', () => {
          this.handleDisconnection(clientId);
        });

        // Handle client messages
        connection.socket.on('message', (data) => {
          this.handleMessage(clientId, data);
        });

        // Handle client errors
        connection.socket.on('error', (error) => {
          this.handleError(clientId, error);
        });
      });
    });
  }

  /**
   * Handle new client connection
   */
  private handleConnection(client: ClientConnection): void {
    console.log(`Analytics WebSocket client connected: ${client.id}`);
    
    // Send welcome message
    this.sendMessage(client, {
      type: WebSocketMessageType.SYSTEM_STATUS,
      data: {
        status: 'connected',
        clientId: client.id,
        timestamp: Date.now()
  }
      timestamp: Date.now(),
      id: uuidv4()
    });

    this.emit('client_connected', client);
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`Analytics WebSocket client disconnected: ${clientId}`);
      
      // Remove from all topic subscriptions
      client.subscriptions.forEach(topic => {
        this.unsubscribeFromTopic(clientId, topic);
      });

      this.clients.delete(clientId);
      this.emit('client_disconnected', client);
    }
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, data: Buffer): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
      case WebSocketMessageType.SUBSCRIPTION:
        this.handleSubscription(clientId, message.data);
        break;
        
      case WebSocketMessageType.UNSUBSCRIPTION:
        this.handleUnsubscription(clientId, message.data);
        break;
        
      case WebSocketMessageType.HEARTBEAT:
        this.handleHeartbeat(clientId);
        break;
        
      default:
        console.warn(`Unknown message type from client ${clientId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`Failed to parse message from client ${clientId}:`, error);
      this.sendError(client, 'Invalid message format');
    }
  }

  /**
   * Handle client error
   */
  private handleError(clientId: string, error: Error): void {
    console.error(`WebSocket error for client ${clientId}:`, error);
    this.emit('client_error', { clientId, error });
  }

  /**
   * Handle subscription request
   */
  private handleSubscription(clientId: string, subscriptionData: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { topic, filters, auth } = subscriptionData;

    // Handle authentication
    if (auth) {
      if (this.authenticateClient(client, auth)) {
        client.isAuthenticated = true;
        client.userId = auth.userId;
        client.organizationId = auth.organizationId;
        
        this.sendMessage(client, {
          type: WebSocketMessageType.SYSTEM_STATUS,
          data: { status: 'authenticated' },
          timestamp: Date.now(),
          id: uuidv4()
        });
      } else {
        this.sendError(client, 'Authentication failed');
      }
      return;
    }

    if (!topic) {
      this.sendError(client, 'Topic is required for subscription');
      return;
    }

    // Add client to topic subscription
    this.subscribeToTopic(clientId, topic, filters);
    
    console.log(`Client ${clientId} subscribed to topic: ${topic}`);
  }

  /**
   * Handle unsubscription request
   */
  private handleUnsubscription(clientId: string, data: any): void {
    const { topic } = data;
    if (topic) {
      this.unsubscribeFromTopic(clientId, topic);
      console.log(`Client ${clientId} unsubscribed from topic: ${topic}`);
    }
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.sendMessage(client, {
        type: WebSocketMessageType.HEARTBEAT,
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        id: uuidv4()
      });
    }
  }

  /**
   * Subscribe client to topic
   */
  private subscribeToTopic(clientId: string, topic: string, filters?: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.add(topic);

    if (!this.topicSubscriptions.has(topic)) {
      this.topicSubscriptions.set(topic, new Set());
    }
    
    this.topicSubscriptions.get(topic)!.add(clientId);

    // Send initial data for the topic
    this.sendTopicData(clientId, topic, filters);
  }

  /**
   * Unsubscribe client from topic
   */
  private unsubscribeFromTopic(clientId: string, topic: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(topic);
    }

    const topicClients = this.topicSubscriptions.get(topic);
    if (topicClients) {
      topicClients.delete(clientId);
      if (topicClients.size === 0) {
        this.topicSubscriptions.delete(topic);
      }
    }
  }

  /**
   * Send initial data for a topic
   */
  private async sendTopicData(clientId: string, topic: string, filters?: any): Promise<void> {

    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      let data: any = null;

      switch (topic) {
      case 'dashboard':
        data = this.analyticsDashboard.getAnalyticsDashboardData();
        break;
        
      case 'cost_alerts':
        data = this.costTracker.getActiveAlerts();
        break;
        
      case 'recommendations':
        data = this.costTracker.getEfficiencyRecommendations(
          client.userId, 
          client.organizationId
        );
        break;
        
      case 'user_activity':
        data = this.analyticsCollector.getCurrentSummary();
        break;
        
      default:
        console.warn(`Unknown topic: ${topic}`);
        return;
      }

      if (data) {
        this.sendMessage(client, {
          type: WebSocketMessageType.ANALYTICS_UPDATE,
          data: { topic, data },
          timestamp: Date.now(),
          id: uuidv4()
        });
      }
    } catch (error) {
      console.error(`Failed to send topic data for ${topic}:`, error);
      this.sendError(client, `Failed to load data for topic: ${topic}`);
    }
  }

  /**
   * Broadcast message to all clients subscribed to a topic
   */
  private broadcastToTopic(topic: string, message: WebSocketMessage): void {
    const topicClients = this.topicSubscriptions.get(topic);
    if (!topicClients) return;

    topicClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        this.sendMessage(client, message);
      }
    });
  }

  /**
   * Send message to specific client
   */
  private sendMessage(client: ClientConnection, message: WebSocketMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to client ${client.id}:`, error);
      }
    }
  }

  /**
   * Send error message to client
   */
  private sendError(client: ClientConnection, errorMessage: string): void {
    this.sendMessage(client, {
      type: WebSocketMessageType.ERROR,
      data: { error: errorMessage },
      timestamp: Date.now(),
      id: uuidv4()
    });
  }

  /**
   * Authenticate client
   */
  private authenticateClient(client: ClientConnection, auth: any): boolean {
    // Simple authentication check
    // In production, this would validate against a proper auth system
    return auth.apiKey && auth.apiKey.length > 0;
  }

  /**
   * Setup event listeners for analytics events
   */
  private setupEventListeners(): void {
    // Analytics collector events
    this.analyticsCollector.on('event_recorded', (event) => {
      this.broadcastToTopic('user_activity', {
        type: WebSocketMessageType.USER_ACTIVITY,
        data: event,
        timestamp: Date.now(),
        id: uuidv4()
      });
    });

    // Analytics dashboard events
    this.analyticsDashboard.on('dashboard_updated', (data) => {
      this.broadcastToTopic('dashboard', {
        type: WebSocketMessageType.ANALYTICS_UPDATE,
        data: { topic: 'dashboard', data },
        timestamp: Date.now(),
        id: uuidv4()
      });
    });

    // Cost tracker events
    this.costTracker.on('budget_alert', (alert) => {
      this.broadcastToTopic('cost_alerts', {
        type: WebSocketMessageType.BUDGET_ALERT,
        data: alert,
        timestamp: Date.now(),
        id: uuidv4()
      });
    });

    this.costTracker.on('cost_calculated', (costData) => {
      this.broadcastToTopic('dashboard', {
        type: WebSocketMessageType.PERFORMANCE_METRIC,
        data: { metric: 'cost', value: costData.totalCost },
        timestamp: Date.now(),
        id: uuidv4()
      });
    });
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach(client => {
        if (client.socket.readyState === WebSocket.OPEN) {
          this.sendMessage(client, {
            type: WebSocketMessageType.HEARTBEAT,
            data: { timestamp: Date.now() },
            timestamp: Date.now(),
            id: uuidv4()
          });
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Start cleanup routine for dead connections
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes

      this.clients.forEach((client, clientId) => {
        if (now - client.lastActivity > timeout || client.socket.readyState !== WebSocket.OPEN) {
          console.log(`Cleaning up inactive client: ${clientId}`);
          this.handleDisconnection(clientId);
        }
      });
    }, 60000); // Every minute
  }

  /**
   * Stop the WebSocket server
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all client connections
    this.clients.forEach(client => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.close();
      }
    });

    this.clients.clear();
    this.topicSubscriptions.clear();
  }

  /**
   * Get server statistics
   */
  getStats(): {
    totalClients: number;
    authenticatedClients: number;
    totalSubscriptions: number;
    topicCounts: { [topic: string]: number };
    } {
    const authenticatedClients = Array.from(this.clients.values()).filter(c => c.isAuthenticated).length;
    const totalSubscriptions = Array.from(this.clients.values()).reduce((sum, client) => sum + client.subscriptions.size, 0);
    
    const topicCounts: { [topic: string]: number } = {};
    this.topicSubscriptions.forEach((clients, topic) => {
      topicCounts[topic] = clients.size;
    });

    return {
      totalClients: this.clients.size,
      authenticatedClients,
      totalSubscriptions,
      topicCounts
    };
  }
}