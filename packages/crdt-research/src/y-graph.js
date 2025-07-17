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
exports.YGraph = void 0;
exports.registerYGraphType = registerYGraphType;
const Y = __importStar(require("yjs"));
class YGraph extends Y.AbstractType {
    constructor() {
        super();
        this.nodes = new Y.Map();
        this.edges = new Y.Map();
    }
    get _name() {
        return 'Graph';
    }
    _copy() {
        const copy = new YGraph();
        this.nodes.forEach((node, id) => {
            copy.nodes.set(id, { ...node });
        });
        this.edges.forEach((edge, id) => {
            copy.edges.set(id, { ...edge });
        });
        return copy;
    }
    _write(encoder) {
        encoder.writeTypeRef(YGraph);
        encoder.writeVarUint(this.nodes.size);
        this.nodes.forEach((node, id) => {
            encoder.writeString(id);
            encoder.writeJSON(node);
        });
        encoder.writeVarUint(this.edges.size);
        this.edges.forEach((edge, id) => {
            encoder.writeString(id);
            encoder.writeJSON(edge);
        });
    }
    addNode(node) {
        this.doc?.transact(() => {
            this.nodes.set(node.id, node);
        });
    }
    updateNode(nodeId, updates) {
        this.doc?.transact(() => {
            const node = this.nodes.get(nodeId);
            if (node) {
                this.nodes.set(nodeId, { ...node, ...updates });
            }
        });
    }
    deleteNode(nodeId) {
        this.doc?.transact(() => {
            this.nodes.delete(nodeId);
            this.edges.forEach((edge, edgeId) => {
                if (edge.source === nodeId || edge.target === nodeId) {
                    this.edges.delete(edgeId);
                }
            });
        });
    }
    addEdge(edge) {
        this.doc?.transact(() => {
            if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
                this.edges.set(edge.id, edge);
            }
        });
    }
    updateEdge(edgeId, updates) {
        this.doc?.transact(() => {
            const edge = this.edges.get(edgeId);
            if (edge) {
                this.edges.set(edgeId, { ...edge, ...updates });
            }
        });
    }
    deleteEdge(edgeId) {
        this.doc?.transact(() => {
            this.edges.delete(edgeId);
        });
    }
    getNodes() {
        return Array.from(this.nodes.values());
    }
    getEdges() {
        return Array.from(this.edges.values());
    }
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }
    applyOperation(operation) {
        if (operation.type === 'node') {
            this._applyNodeOperation(operation);
        }
        else if (operation.type === 'edge') {
            this._applyEdgeOperation(operation);
        }
    }
    _applyNodeOperation(operation) {
        switch (operation.action) {
            case 'create':
                if (operation.data) {
                    this.addNode(operation.data);
                }
                break;
            case 'update':
                if (operation.data) {
                    this.updateNode(operation.targetId, operation.data);
                }
                break;
            case 'delete':
                this.deleteNode(operation.targetId);
                break;
        }
    }
    _applyEdgeOperation(operation) {
        switch (operation.action) {
            case 'create':
                if (operation.data) {
                    this.addEdge(operation.data);
                }
                break;
            case 'update':
                if (operation.data) {
                    this.updateEdge(operation.targetId, operation.data);
                }
                break;
            case 'delete':
                this.deleteEdge(operation.targetId);
                break;
        }
    }
    toJSON() {
        return {
            nodes: this.getNodes(),
            edges: this.getEdges()
        };
    }
    fromJSON(data) {
        this.doc?.transact(() => {
            this.nodes.clear();
            this.edges.clear();
            data.nodes.forEach(node => {
                this.nodes.set(node.id, node);
            });
            data.edges.forEach(edge => {
                this.edges.set(edge.id, edge);
            });
        });
    }
    observe(callback) {
        this.nodes.observe(callback);
        this.edges.observe(callback);
    }
    unobserve(callback) {
        this.nodes.unobserve(callback);
        this.edges.unobserve(callback);
    }
}
exports.YGraph = YGraph;
function registerYGraphType() {
    Y.registerType('Graph', YGraph);
}
//# sourceMappingURL=y-graph.js.map