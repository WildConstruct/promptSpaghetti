/**
 * Real-Time State Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 *
 * WebSocket-based real-time state management with optimistic updates
 */
import { EventEmitter } from 'events';
import { StateSynchronizer } from '../orchestration/StateSynchronizer';
// Error types
export class StateConflictError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'StateConflictError';
    }
}
export class ConnectionError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ConnectionError';
    }
}
export class OptimisticUpdateError extends Error {
    updateId;
    constructor(message, updateId) {
        super(message);
        this.updateId = updateId;
        this.name = 'OptimisticUpdateError';
    }
}
// Main real-time state manager
export class RealTimeStateManager extends EventEmitter {
    connection;
    synchronizer;
    subscriptions = new Map();
    optimisticUpdates = new Map();
    messageQueue = [];
    connectionState;
    config;
    pingTimer;
    reconnectTimer;
    batchTimer;
    domains = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            wsUrl: 'ws://localhost:8080/realtime',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            pingInterval: 30000,
            pongTimeout: 10000,
            batchInterval: 50,
            maxBatchSize: 100,
            enableOptimistic: true,
            enableCompression: false,
            enableHeartbeat: true,
            debugMode: false,
            ...config
        };
        this.connectionState = {
            status: 'disconnected',
            reconnectAttempts: 0,
            latency: 0,
            messagesSent: 0,
            messagesReceived: 0,
            bytesTransferred: 0
        };
        this.synchronizer = new StateSynchronizer({
            enableOptimisticUpdates: this.config.enableOptimistic,
            batchInterval: this.config.batchInterval,
            maxBatchSize: this.config.maxBatchSize
        }, false // Client side
        );
        this.setupSynchronizerEvents();
    }
    // Connection management
    async connect(userId, sessionId) {
        if (this.connectionState.status === 'connected' || this.connectionState.status === 'connecting') {
            return;
        }
        this.connectionState.status = 'connecting';
        this.connectionState.reconnectAttempts++;
        try {
            const socket = new WebSocket(this.config.wsUrl);
            this.connection = {
                socket,
                id: this.generateConnectionId(),
                userId,
                domains: Array.from(this.domains.keys()),
                isReady: false,
                lastPing: Date.now(),
                latency: 0,
                reconnectAttempts: this.connectionState.reconnectAttempts,
                metadata: {
                    userAgent: navigator.userAgent,
                    sessionId: sessionId || this.generateSessionId(),
                    connectTime: Date.now()
                }
            };
            this.setupSocketEventHandlers();
            // Wait for connection to open
            await this.waitForConnection();
            // Send initial handshake
            await this.sendHandshake();
            this.connectionState.status = 'connected';
            this.connectionState.lastConnected = Date.now();
            this.connectionState.reconnectAttempts = 0;
            this.startHeartbeat();
            this.processQueuedMessages();
            this.emit('connected', this.connection);
        }
        catch (error) {
            this.connectionState.status = 'error';
            this.connectionState.error = error;
            this.emit('connectionError', error);
            // Schedule reconnect
            this.scheduleReconnect();
            throw error;
        }
    }
    async disconnect() {
        if (this.connection) {
            this.stopHeartbeat();
            this.connection.socket.close(1000, 'Client disconnect');
            this.connection = undefined;
        }
        this.connectionState.status = 'disconnected';
        this.emit('disconnected');
    }
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error('No connection available'));
                return;
            }
            const socket = this.connection.socket;
            const onOpen = () => {
                cleanup();
                resolve();
            };
            const onError = (error) => {
                cleanup();
                reject(new ConnectionError('WebSocket connection failed'));
            };
            const onClose = () => {
                cleanup();
                reject(new ConnectionError('WebSocket connection closed'));
            };
            const cleanup = () => {
                socket.removeEventListener('open', onOpen);
                socket.removeEventListener('error', onError);
                socket.removeEventListener('close', onClose);
            };
            socket.addEventListener('open', onOpen);
            socket.addEventListener('error', onError);
            socket.addEventListener('close', onClose);
        });
    }
    setupSocketEventHandlers() {
        if (!this.connection)
            return;
        const socket = this.connection.socket;
        socket.addEventListener('message', (event) => {
            this.handleWebSocketMessage(event);
        });
        socket.addEventListener('close', (event) => {
            this.handleWebSocketClose(event);
        });
        socket.addEventListener('error', (event) => {
            this.handleWebSocketError(event);
        });
    }
    async handleWebSocketMessage(event) {
        try {
            this.connectionState.messagesReceived++;
            this.connectionState.bytesTransferred += event.data.length;
            const message = JSON.parse(event.data);
            if (this.config.debugMode) {
                console.log('Received WebSocket message:', message);
            }
            switch (message.type) {
                case 'handshake_ack':
                    await this.handleHandshakeAck(message);
                    break;
                case 'state_change':
                    await this.handleStateChangeMessage(message);
                    break;
                case 'optimistic_confirm':
                    await this.handleOptimisticConfirm(message);
                    break;
                case 'optimistic_reject':
                    await this.handleOptimisticReject(message);
                    break;
                case 'sync_request':
                    await this.handleSyncRequest(message);
                    break;
                case 'ping':
                    await this.handlePing(message);
                    break;
                case 'pong':
                    await this.handlePong(message);
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        }
        catch (error) {
            console.error('Error handling WebSocket message:', error);
            this.emit('messageError', { error, message: event.data });
        }
    }
    handleWebSocketClose(event) {
        this.connectionState.status = 'disconnected';
        this.stopHeartbeat();
        if (event.code !== 1000) { // Not a normal closure
            this.emit('connectionLost', { code: event.code, reason: event.reason });
            this.scheduleReconnect();
        }
        else {
            this.emit('disconnected');
        }
    }
    handleWebSocketError(event) {
        console.error('WebSocket error:', event);
        this.connectionState.status = 'error';
        this.emit('connectionError', new ConnectionError('WebSocket error'));
    }
    // Message handling
    async handleHandshakeAck(message) {
        if (this.connection) {
            this.connection.isReady = true;
            this.emit('handshakeComplete', message);
        }
    }
    async handleStateChangeMessage(message) {
        const syncMessage = message.payload;
        await this.synchronizer.handleRemoteStateChange(syncMessage);
        // Notify subscribers
        this.notifySubscribers(syncMessage.domain, syncMessage.payload.change, {
            source: 'remote',
            optimistic: syncMessage.payload.optimistic || false,
            clientId: syncMessage.sessionId,
            timestamp: syncMessage.timestamp
        });
    }
    async handleOptimisticConfirm(message) {
        const { updateId } = message.payload;
        await this.synchronizer.confirmOptimisticUpdate(updateId);
        const update = this.optimisticUpdates.get(updateId);
        if (update) {
            this.optimisticUpdates.delete(updateId);
            this.emit('optimisticUpdateConfirmed', { updateId, domain: update.domain });
        }
    }
    async handleOptimisticReject(message) {
        const { updateId, reason } = message.payload;
        await this.synchronizer.rollbackOptimisticUpdate(updateId);
        const update = this.optimisticUpdates.get(updateId);
        if (update) {
            this.optimisticUpdates.delete(updateId);
            this.emit('optimisticUpdateRejected', { updateId, domain: update.domain, reason });
        }
    }
    async handleSyncRequest(message) {
        // Server is requesting a full sync
        await this.synchronizer.requestFullSync();
    }
    async handlePing(message) {
        await this.sendPong(message.id);
    }
    async handlePong(message) {
        if (this.connection) {
            const now = Date.now();
            this.connection.latency = now - this.connection.lastPing;
            this.connectionState.latency = this.connection.latency;
        }
    }
    // State subscription system
    subscribeToStateChanges(domain, callback, filters = [], options = {}) {
        const subscription = {
            id: this.generateSubscriptionId(),
            domain,
            filters,
            callback,
            options: {
                includeOptimistic: true,
                batchUpdates: false,
                throttleMs: 0,
                priority: 'normal',
                ...options
            }
        };
        this.subscriptions.set(subscription.id, subscription);
        // Send subscription request to server
        this.sendMessage({
            type: 'subscribe',
            payload: {
                domain,
                filters,
                options
            }
        });
        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscription.id);
            this.sendMessage({
                type: 'unsubscribe',
                payload: { subscriptionId: subscription.id }
            });
        };
    }
    notifySubscribers(domain, change, metadata) {
        for (const subscription of this.subscriptions.values()) {
            if (subscription.domain !== domain && subscription.domain !== '*') {
                continue;
            }
            // Apply filters
            if (!this.matchesFilters(change, subscription.filters)) {
                continue;
            }
            // Skip optimistic updates if not requested
            if (metadata.optimistic && !subscription.options.includeOptimistic) {
                continue;
            }
            try {
                subscription.callback(change, metadata);
            }
            catch (error) {
                console.error('Error in subscription callback:', error);
            }
        }
    }
    matchesFilters(change, filters) {
        if (filters.length === 0)
            return true;
        return filters.every(filter => {
            switch (filter.type) {
                case 'change_type':
                    return filter.value === change.type;
                case 'user':
                    return filter.value === change.userId;
                case 'path':
                    // This would check if the change affects a specific path
                    return true; // Simplified for now
                case 'custom':
                    return typeof filter.value === 'function'
                        ? filter.value(change)
                        : true;
                default:
                    return true;
            }
        });
    }
    // Optimistic updates
    async optimisticUpdate(domain, mutation) {
        if (!this.config.enableOptimistic) {
            throw new OptimisticUpdateError('Optimistic updates are disabled', '');
        }
        if (!this.isConnected()) {
            throw new OptimisticUpdateError('Not connected to server', '');
        }
        const updateId = this.generateUpdateId();
        try {
            // Create state change from mutation
            const change = {
                id: this.generateChangeId(),
                timestamp: Date.now(),
                type: `OPTIMISTIC_${mutation.operation.toUpperCase()}`,
                payload: {
                    path: mutation.path,
                    value: mutation.value,
                    operation: mutation.operation,
                    optimistic: true,
                    updateId
                },
                source: 'local'
            };
            // Apply optimistic update locally
            const rollbackId = await this.synchronizer.applyOptimisticUpdate(domain, change);
            // Track the update
            const optimisticUpdate = {
                id: updateId,
                domain,
                change,
                rollbackFn: () => this.synchronizer.rollbackOptimisticUpdate(rollbackId),
                timestamp: Date.now(),
                confirmed: false,
                clientId: this.connection?.id || ''
            };
            this.optimisticUpdates.set(updateId, optimisticUpdate);
            // Send to server for confirmation
            await this.sendMessage({
                type: 'optimistic_update',
                payload: {
                    updateId,
                    domain,
                    mutation,
                    change
                }
            });
            this.emit('optimisticUpdateApplied', { updateId, domain, mutation });
            return updateId;
        }
        catch (error) {
            throw new OptimisticUpdateError(`Failed to apply optimistic update: ${error.message}`, updateId);
        }
    }
    async syncWithServer(mutation) {
        if (!this.isConnected()) {
            throw new Error('Not connected to server');
        }
        await this.sendMessage({
            type: 'sync_mutation',
            payload: { mutation }
        });
    }
    // Domain management
    registerDomain(domain) {
        const domainName = domain.getDomainName();
        this.domains.set(domainName, domain);
        this.synchronizer.registerDomain(domain);
        // If connected, update server about new domain
        if (this.isConnected()) {
            this.sendMessage({
                type: 'register_domain',
                payload: { domain: domainName }
            });
        }
    }
    unregisterDomain(domainName) {
        this.domains.delete(domainName);
        this.synchronizer.unregisterDomain(domainName);
        if (this.isConnected()) {
            this.sendMessage({
                type: 'unregister_domain',
                payload: { domain: domainName }
            });
        }
    }
    // Message sending
    async sendMessage(message) {
        if (!this.isConnected() || !this.connection?.isReady) {
            this.messageQueue.push(message);
            return;
        }
        try {
            const payload = JSON.stringify(message);
            this.connection.socket.send(payload);
            this.connectionState.messagesSent++;
            this.connectionState.bytesTransferred += payload.length;
            if (this.config.debugMode) {
                console.log('Sent WebSocket message:', message);
            }
        }
        catch (error) {
            console.error('Failed to send message:', error);
            this.messageQueue.push(message); // Re-queue for retry
            throw error;
        }
    }
    async sendHandshake() {
        await this.sendMessage({
            type: 'handshake',
            payload: {
                clientId: this.connection?.id,
                userId: this.connection?.userId,
                domains: Array.from(this.domains.keys()),
                capabilities: {
                    optimisticUpdates: this.config.enableOptimistic,
                    compression: this.config.enableCompression,
                    heartbeat: this.config.enableHeartbeat
                },
                metadata: this.connection?.metadata
            }
        });
    }
    async sendPing() {
        if (this.connection) {
            this.connection.lastPing = Date.now();
            await this.sendMessage({
                type: 'ping',
                payload: { timestamp: this.connection.lastPing }
            });
        }
    }
    async sendPong(pingId) {
        await this.sendMessage({
            type: 'pong',
            payload: { pingId, timestamp: Date.now() }
        });
    }
    // Connection utilities
    processQueuedMessages() {
        const queue = [...this.messageQueue];
        this.messageQueue = [];
        queue.forEach(message => {
            this.sendMessage(message).catch(error => {
                console.error('Failed to send queued message:', error);
            });
        });
    }
    startHeartbeat() {
        if (!this.config.enableHeartbeat)
            return;
        this.pingTimer = setInterval(() => {
            this.sendPing().catch(error => {
                console.error('Ping failed:', error);
            });
        }, this.config.pingInterval);
    }
    stopHeartbeat() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = undefined;
        }
    }
    scheduleReconnect() {
        if (this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts) {
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        this.connectionState.status = 'reconnecting';
        this.reconnectTimer = setTimeout(() => {
            if (this.connection) {
                this.connect(this.connection.userId, this.connection.metadata.sessionId)
                    .catch(error => {
                    console.error('Reconnect failed:', error);
                });
            }
        }, this.config.reconnectInterval);
    }
    setupSynchronizerEvents() {
        this.synchronizer.on('broadcastMessage', (message) => {
            this.sendMessage({
                type: 'state_change',
                payload: message
            }).catch(error => {
                console.error('Failed to broadcast state change:', error);
            });
        });
        this.synchronizer.on('conflictResolved', (event) => {
            this.emit('conflictResolved', event);
        });
    }
    // Utility methods
    isConnected() {
        return this.connectionState.status === 'connected' &&
            this.connection?.socket.readyState === WebSocket.OPEN;
    }
    getConnectionState() {
        return { ...this.connectionState };
    }
    getLatency() {
        return this.connection?.latency || 0;
    }
    getPendingOptimisticUpdates() {
        return Array.from(this.optimisticUpdates.values());
    }
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateUpdateId() {
        return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateChangeId() {
        return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Cleanup
    destroy() {
        this.disconnect();
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }
        this.synchronizer.destroy();
        this.subscriptions.clear();
        this.optimisticUpdates.clear();
        this.domains.clear();
        this.removeAllListeners();
    }
}
// React hooks for real-time state management
export function useRealTimeState() {
    // This would be implemented with React hooks
    // Returns the global real-time state manager instance
    return null;
}
export function useOptimisticMutation(domain) {
    // This would be implemented with React hooks
    // Returns a function to perform optimistic mutations
    return null;
}
export function useStateSubscription(domain, filters, options) {
    // This would be implemented with React hooks
    // Returns current state and manages subscription lifecycle
    return null;
}
// Global real-time state manager instance
export const globalRealTimeManager = new RealTimeStateManager();
