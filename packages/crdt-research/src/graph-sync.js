"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSyncHandler = void 0;
const Y = __importStar(require("yjs"));
const y_graph_1 = require("./y-graph");
class GraphSyncHandler {
    constructor(documentId, userId) {
        this.doc = new Y.Doc();
        this.graph = new y_graph_1.YGraph();
        this.doc.getMap('graph').set('root', this.graph);
        this.awareness = new Map();
        this.syncState = {
            documentId,
            userId,
            lastSync: Date.now(),
            pendingOps: 0
        };
        this.doc.on('update', (update, origin) => {
            this.syncState.lastSync = Date.now();
            if (this.onUpdate) {
                this.onUpdate(update, origin);
            }
        });
    }
    getGraph() {
        return this.graph;
    }
    getDoc() {
        return this.doc;
    }
    applyUpdate(update, origin) {
        Y.applyUpdate(this.doc, update, origin);
    }
    getStateAsUpdate() {
        return Y.encodeStateAsUpdate(this.doc);
    }
    getStateVector() {
        return Y.encodeStateVector(this.doc);
    }
    getDiffUpdate(stateVector) {
        return Y.encodeStateAsUpdate(this.doc, stateVector);
    }
    createSyncMessage(type, data) {
        const message = {
            type,
            documentId: this.syncState.documentId,
            userId: this.syncState.userId,
            timestamp: Date.now()
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
    handleSyncMessage(message) {
        switch (message.type) {
            case 'sync':
                if (message.stateVector) {
                    const diffUpdate = this.getDiffUpdate(message.stateVector);
                    return this.createSyncMessage('update', diffUpdate);
                }
                break;
            case 'update':
                if (message.update) {
                    this.applyUpdate(message.update, message.userId);
                }
                break;
            case 'awareness':
                if (message.awareness && message.userId) {
                    this.updateAwareness(message.userId, message.awareness);
                }
                break;
        }
        return null;
    }
    updateAwareness(userId, presence) {
        this.awareness.set(userId, presence);
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
    getAwareness() {
        return new Map(this.awareness);
    }
    setLocalPresence(presence) {
        const fullPresence = {
            userId: this.syncState.userId,
            cursor: presence.cursor,
            selection: presence.selection,
            color: presence.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
            name: presence.name || 'Anonymous',
            timestamp: Date.now()
        };
        this.updateAwareness(this.syncState.userId, fullPresence);
    }
    onDocumentUpdate(callback) {
        this.onUpdate = callback;
    }
    onAwarenessChange(callback) {
        this.onAwarenessUpdate = callback;
    }
    getSyncState() {
        return { ...this.syncState };
    }
    createSnapshot() {
        return Y.encodeSnapshot(this.doc);
    }
    restoreFromSnapshot(snapshot) {
        const newDoc = Y.decodeSnapshot(snapshot);
        const update = Y.encodeStateAsUpdate(newDoc);
        Y.applyUpdate(this.doc, update);
    }
    getHistory(limit = 100) {
        return [];
    }
    getDocumentSize() {
        const update = this.getStateAsUpdate();
        return update.byteLength;
    }
    garbageCollect() {
        this.doc.gc = true;
    }
    destroy() {
        this.doc.destroy();
        this.awareness.clear();
    }
}
exports.GraphSyncHandler = GraphSyncHandler;
//# sourceMappingURL=graph-sync.js.map