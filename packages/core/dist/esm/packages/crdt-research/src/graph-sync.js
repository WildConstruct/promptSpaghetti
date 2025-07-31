/**
 * Graph Synchronization Handler
 * Epic 9.1.1 - Manages CRDT synchronization for collaborative graph editing
 */
import * as Y from 'yjs';
import { YGraph } from './y-graph';
export class GraphSyncHandler {
    doc;
    graph;
    nodes;
    edges;
    awareness;
    syncState;
    onUpdate;
    onAwarenessUpdate;
    constructor(documentId, userId) {
        this.doc = new Y.Doc();
        // Get the maps from the document
        this.nodes = this.doc.getMap('nodes');
        this.edges = this.doc.getMap('edges');
        // Create YGraph and assign the document-integrated maps
        this.graph = new YGraph();
        this.graph.nodes = this.nodes;
        this.graph.edges = this.edges;
        // Set the document reference on the graph
        this.graph.doc = this.doc;
        this.awareness = new Map();
        this.syncState = {
            documentId,
            userId,
            lastSync: Date.now(),
            pendingOps: 0,
        };
        // Set up update observer
        this.doc.on('update', (update, origin) => {
            this.syncState.lastSync = Date.now();
            if (this.onUpdate) {
                this.onUpdate(update, origin);
            }
        });
    }
    /**
     * Get the graph instance
     */
    getGraph() {
        return this.graph;
    }
    /**
     * Get the Yjs document
     */
    getDoc() {
        return this.doc;
    }
    /**
     * Apply an update from a remote peer
     */
    applyUpdate(update, origin) {
        Y.applyUpdate(this.doc, update, origin);
    }
    /**
     * Get the current document state as an update
     */
    getStateAsUpdate() {
        return Y.encodeStateAsUpdate(this.doc);
    }
    /**
     * Get state vector for synchronization
     */
    getStateVector() {
        return Y.encodeStateVector(this.doc);
    }
    /**
     * Get diff update from a state vector
     */
    getDiffUpdate(stateVector) {
        return Y.encodeStateAsUpdate(this.doc, stateVector);
    }
    /**
     * Create a sync message
     */
    createSyncMessage(type, data) {
        const message = {
            type,
            documentId: this.syncState.documentId,
            userId: this.syncState.userId,
            timestamp: Date.now(),
        };
        switch (type) {
            case 'sync':
                message.stateVector = this.getStateVector();
                break;
            case 'update':
                message.update = data;
                break;
            case 'awareness':
                message.awareness = data;
                break;
        }
        return message;
    }
    /**
     * Handle incoming sync message
     */
    handleSyncMessage(message) {
        switch (message.type) {
            case 'sync':
                // Respond with diff update
                if (message.stateVector) {
                    const diffUpdate = this.getDiffUpdate(message.stateVector);
                    return this.createSyncMessage('update', diffUpdate);
                }
                break;
            case 'update':
                // Apply the update
                if (message.update) {
                    this.applyUpdate(message.update, message.userId);
                }
                break;
            case 'awareness':
                // Update awareness information
                if (message.awareness && message.userId) {
                    this.updateAwareness(message.userId, message.awareness);
                }
                break;
        }
        return null;
    }
    /**
     * Update user presence/awareness
     */
    updateAwareness(userId, presence) {
        this.awareness.set(userId, presence);
        // Clean up stale presence (older than 30 seconds)
        const now = Date.now();
        this.awareness.forEach((presence, id) => {
            if (now - presence.timestamp > 30000) {
                this.awareness.delete(id);
            }
        });
        if (this.onAwarenessUpdate) {
            this.onAwarenessUpdate(this.awareness);
        }
    }
    /**
     * Get current awareness state
     */
    getAwareness() {
        return new Map(this.awareness);
    }
    /**
     * Set local user presence
     */
    setLocalPresence(presence) {
        const fullPresence = {
            userId: this.syncState.userId,
            cursor: presence.cursor,
            selection: presence.selection,
            color: presence.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
            name: presence.name || 'Anonymous',
            timestamp: Date.now(),
        };
        this.updateAwareness(this.syncState.userId, fullPresence);
    }
    /**
     * Subscribe to document updates
     */
    onDocumentUpdate(callback) {
        this.onUpdate = callback;
    }
    /**
     * Subscribe to awareness updates
     */
    onAwarenessChange(callback) {
        this.onAwarenessUpdate = callback;
    }
    /**
     * Get sync state
     */
    getSyncState() {
        return { ...this.syncState };
    }
    /**
     * Create a snapshot of the current state
     */
    createSnapshot() {
        return Y.encodeSnapshot(this.doc);
    }
    /**
     * Restore from a snapshot
     */
    restoreFromSnapshot(snapshot) {
        const newDoc = Y.decodeSnapshot(snapshot);
        const update = Y.encodeStateAsUpdate(newDoc);
        Y.applyUpdate(this.doc, update);
    }
    /**
     * Get operation history
     */
    getHistory(limit = 100) {
        // This would integrate with Yjs history plugin
        // For now, return empty array
        return [];
    }
    /**
     * Calculate document size
     */
    getDocumentSize() {
        const update = this.getStateAsUpdate();
        return update.byteLength;
    }
    /**
     * Garbage collect deleted items
     */
    garbageCollect() {
        // Yjs automatically handles garbage collection
        // This method can be used to force GC if needed
        this.doc.gc = true;
    }
    /**
     * Destroy the sync handler
     */
    destroy() {
        this.doc.destroy();
        this.awareness.clear();
    }
}
