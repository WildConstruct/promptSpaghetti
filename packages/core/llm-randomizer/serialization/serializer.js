"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSerializer = void 0;
exports.serializeGraph = serializeGraph;
exports.createDefaultMetadata = createDefaultMetadata;
let createHash;
try {
    createHash = require('crypto').createHash;
}
catch {
    createHash = (algorithm) => ({
        update: (data) => ({
            digest: (format) => {
                let hash = 0;
                for (let i = 0; i < data.length; i++) {
                    const char = data.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return Math.abs(hash).toString(16).padStart(16, '0');
            }
        })
    });
}
class GraphSerializer {
    static serialize(graph, metadata, options = {}) {
        const { includeChecksum = true, includeMetadata = true, compactFormat = false, validateOnSerialize = true } = options;
        if (validateOnSerialize) {
            this.validateGraph(graph);
        }
        const lines = [];
        const indent = compactFormat ? '' : '  ';
        lines.push(`version: ${this.FORMAT_VERSION}`);
        if (includeMetadata && metadata) {
            lines.push('metadata:');
            if (metadata.name)
                lines.push(`${indent}name: "${metadata.name}"`);
            if (metadata.description)
                lines.push(`${indent}description: "${metadata.description}"`);
            if (metadata.author)
                lines.push(`${indent}author: "${metadata.author}"`);
            if (metadata.created)
                lines.push(`${indent}created: ${metadata.created}`);
            if (metadata.tags && metadata.tags.length > 0) {
                lines.push(`${indent}tags: [${metadata.tags.map(t => `"${t}"`).join(', ')}]`);
            }
        }
        lines.push('');
        lines.push(this.SECTION_DELIMITERS.NODES);
        graph.nodes.forEach(node => {
            lines.push(...this.serializeNode(node, compactFormat));
            lines.push('');
        });
        lines.push(this.SECTION_DELIMITERS.EDGES);
        const edges = this.extractEdges(graph);
        edges.forEach(edge => {
            lines.push(`${edge.source} -> ${edge.target}`);
        });
        lines.push('');
        lines.push(this.SECTION_DELIMITERS.END);
        let serialized = lines.join('\n');
        if (includeChecksum) {
            const checksum = this.calculateChecksum(serialized);
            serialized = serialized.replace(`version: ${this.FORMAT_VERSION}`, `version: ${this.FORMAT_VERSION}\nchecksum: ${checksum}`);
        }
        return serialized;
    }
    static serializeNode(node, compact = false) {
        const lines = [];
        const indent = compact ? '' : '  ';
        lines.push(`${node.id}:`);
        lines.push(`${indent}type: ${node.type}`);
        const props = this.extractNodeProperties(node);
        if (Object.keys(props).length > 0) {
            lines.push(`${indent}props:`);
            Object.entries(props).forEach(([key, value]) => {
                lines.push(`${indent}${indent}${key}: ${this.serializeValue(value)}`);
            });
        }
        if (node.inputs && node.inputs.length > 0) {
            const inputsStr = node.inputs.map(id => `"${id}"`).join(', ');
            lines.push(`${indent}inputs: [${inputsStr}]`);
        }
        return lines;
    }
    static extractNodeProperties(node) {
        const props = {};
        switch (node.type) {
            case 'WeightedChoice':
                if ('choices' in node) {
                    props.choices = node.choices;
                }
                break;
            case 'WeightedAdvanced':
                if ('choices' in node)
                    props.choices = node.choices;
                if ('distributionConfig' in node)
                    props.distribution = node.distributionConfig;
                break;
            case 'Conditional':
                if ('branches' in node)
                    props.branches = node.branches;
                if ('defaultOutput' in node)
                    props.default = node.defaultOutput;
                if ('conditionalConfig' in node)
                    props.config = node.conditionalConfig;
                break;
            case 'Sequential':
                if ('sequence' in node)
                    props.sequence = node.sequence;
                if ('pattern' in node)
                    props.pattern = node.pattern;
                break;
            case 'Markov':
                if ('states' in node)
                    props.states = node.states;
                if ('initialState' in node)
                    props.initial = node.initialState;
                if ('terminationConditions' in node)
                    props.termination = node.terminationConditions;
                break;
            case 'SetVariable':
                if ('key' in node)
                    props.key = node.key;
                if ('value' in node)
                    props.value = node.value;
                break;
            case 'GetVariable':
                if ('key' in node)
                    props.key = node.key;
                break;
            case 'Include':
                if ('name' in node)
                    props.name = node.name;
                break;
            case 'PythonTransform':
                if ('code' in node)
                    props.code = node.code;
                if ('timeout' in node)
                    props.timeout = node.timeout;
                if ('memoryLimit' in node)
                    props.memory_limit = node.memoryLimit;
                if ('allowedModules' in node)
                    props.allowed_modules = node.allowedModules;
                break;
        }
        return props;
    }
    static serializeValue(value) {
        if (typeof value === 'string') {
            if (value.includes('\n') || value.includes(':') || value.includes('"')) {
                return `|\n      ${value.split('\n').join('\n      ')}`;
            }
            return `"${value}"`;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        if (Array.isArray(value)) {
            if (value.length === 0)
                return '[]';
            if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
                return `[${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]`;
            }
            const items = value.map(v => `      - ${this.serializeValue(v)}`).join('\n');
            return `\n${items}`;
        }
        if (typeof value === 'object' && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0)
                return '{}';
            const items = entries.map(([k, v]) => `      ${k}: ${this.serializeValue(v)}`).join('\n');
            return `\n${items}`;
        }
        return String(value);
    }
    static extractEdges(graph) {
        const edges = [];
        graph.nodes.forEach(node => {
            if (node.inputs) {
                node.inputs.forEach(inputId => {
                    edges.push({
                        source: inputId,
                        target: node.id
                    });
                });
            }
        });
        return edges;
    }
    static calculateChecksum(content) {
        return createHash('sha256').update(content).digest('hex').substring(0, 16);
    }
    static validateGraph(graph) {
        if (!graph.nodes || graph.nodes.length === 0) {
            throw new Error('Graph must contain at least one node');
        }
        const nodeIds = new Set(graph.nodes.map(n => n.id));
        if (nodeIds.size !== graph.nodes.length) {
            throw new Error('Graph contains duplicate node IDs');
        }
        graph.nodes.forEach(node => {
            if (node.inputs) {
                node.inputs.forEach(inputId => {
                    if (!nodeIds.has(inputId)) {
                        throw new Error(`Node ${node.id} references non-existent input ${inputId}`);
                    }
                });
            }
        });
        this.detectCycles(graph);
    }
    static detectCycles(graph) {
        const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (nodeId) => {
            if (recursionStack.has(nodeId)) {
                throw new Error(`Cycle detected involving node ${nodeId}`);
            }
            if (visited.has(nodeId)) {
                return false;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            const node = nodeMap.get(nodeId);
            if (node?.inputs) {
                for (const inputId of node.inputs) {
                    if (dfs(inputId)) {
                        return true;
                    }
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }
    }
}
exports.GraphSerializer = GraphSerializer;
GraphSerializer.FORMAT_VERSION = '1.0.0';
GraphSerializer.SECTION_DELIMITERS = {
    NODES: '---NODES---',
    EDGES: '---EDGES---',
    END: '---END---'
};
function serializeGraph(graph, metadata, options) {
    return GraphSerializer.serialize(graph, metadata, options);
}
function createDefaultMetadata() {
    return {
        author: 'llm-agent',
        created: new Date().toISOString(),
        description: 'LLM-generated graph'
    };
}
//# sourceMappingURL=serializer.js.map