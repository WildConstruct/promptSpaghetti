"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentialPresets = exports.SequentialNode = exports.WeightedPattern = exports.RandomPattern = exports.CyclicalPattern = exports.LinearPattern = void 0;
exports.createSequencePattern = createSequencePattern;
exports.createSequentialNode = createSequentialNode;
const advanced_1 = require("../advanced");
const io_system_1 = require("../io-system");
const seedrandom_1 = __importDefault(require("seedrandom"));
class LinearPattern {
    constructor() {
        this.type = 'linear';
    }
    getNext(sequence, state, ctx) {
        if (state.index >= sequence.length) {
            return sequence[sequence.length - 1] || '';
        }
        return sequence[state.index];
    }
}
exports.LinearPattern = LinearPattern;
class CyclicalPattern {
    constructor() {
        this.type = 'cyclical';
    }
    getNext(sequence, state, ctx) {
        if (sequence.length === 0)
            return '';
        const index = state.index % sequence.length;
        return sequence[index];
    }
}
exports.CyclicalPattern = CyclicalPattern;
class RandomPattern {
    constructor(config = {}) {
        this.config = config;
        this.type = 'random';
    }
    getNext(sequence, state, ctx) {
        if (sequence.length === 0)
            return '';
        const rng = (0, seedrandom_1.default)(`${ctx.seed}-${state.index}`);
        if (this.config.allowRepeats === false) {
            const used = new Set(state.history);
            const available = sequence.filter(item => !used.has(item));
            if (available.length === 0) {
                return sequence[Math.floor(rng() * sequence.length)];
            }
            return available[Math.floor(rng() * available.length)];
        }
        else {
            return sequence[Math.floor(rng() * sequence.length)];
        }
    }
}
exports.RandomPattern = RandomPattern;
class WeightedPattern {
    constructor(config) {
        this.config = config;
        this.type = 'weighted';
        if (!config.weights) {
            throw new Error('WeightedPattern requires weights configuration');
        }
    }
    getNext(sequence, state, ctx) {
        if (sequence.length === 0)
            return '';
        const weights = this.config.weights;
        if (weights.length !== sequence.length) {
            throw new Error(`Weights length (${weights.length}) must match sequence length (${sequence.length})`);
        }
        const rng = (0, seedrandom_1.default)(`${ctx.seed}-${state.index}`);
        const totalWeight = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
        if (totalWeight === 0) {
            return sequence[Math.floor(rng() * sequence.length)];
        }
        let randomValue = rng() * totalWeight;
        for (let i = 0; i < sequence.length; i++) {
            randomValue -= Math.max(0, weights[i]);
            if (randomValue <= 0) {
                return sequence[i];
            }
        }
        return sequence[sequence.length - 1];
    }
}
exports.WeightedPattern = WeightedPattern;
function createSequencePattern(type, config = {}) {
    switch (type) {
        case 'linear':
            return new LinearPattern();
        case 'cyclical':
            return new CyclicalPattern();
        case 'random':
            return new RandomPattern(config);
        case 'weighted':
            return new WeightedPattern(config);
        default:
            const _exhaustive = type;
            throw new Error(`Unknown sequence pattern type: ${type}`);
    }
}
class SequentialNode extends advanced_1.AdvancedRuntimeNode {
    constructor(id, sequence = [], pattern = new LinearPattern()) {
        const nodeConfig = {
            deterministic: true,
            cacheable: false,
            stateful: true,
            performanceHints: {
                expectedExecutionTime: 'fast',
                memoryUsage: 'low'
            }
        };
        super(id, nodeConfig);
        this.sequence = sequence;
        this.pattern = pattern;
        const ioSpec = new io_system_1.IOSpecBuilder()
            .addInput({
            id: 'items',
            label: 'Sequence Items',
            dataType: 'stringArray',
            required: false,
            defaultValue: [],
            description: 'Array of items to sequence through'
        })
            .addInput({
            id: 'pattern',
            label: 'Sequence Pattern',
            dataType: 'string',
            required: false,
            defaultValue: 'linear',
            description: 'Pattern type: linear, cyclical, random, weighted'
        })
            .addInput({
            id: 'config',
            label: 'Pattern Configuration',
            dataType: 'object',
            required: false,
            defaultValue: {},
            description: 'Configuration object for the selected pattern'
        })
            .addTextOutput('result', 'Sequential Result')
            .build();
        this.ioHandler = new io_system_1.AdvancedIOHandler(ioSpec);
    }
    run(ctx) {
        ctx.executionMeta.nodeExecutionOrder.push(this.id);
        return this.measureExecution(ctx, 'sequential-processing', () => {
            const currentState = this.getState(ctx) || {
                index: 0,
                history: [],
                patternData: {}
            };
            const effectiveSequence = this.getEffectiveSequence(ctx);
            if (effectiveSequence.length === 0) {
                return '';
            }
            const result = this.pattern.getNext(effectiveSequence, currentState, ctx);
            const newState = {
                index: currentState.index + 1,
                history: [...currentState.history, result],
                patternData: currentState.patternData
            };
            this.setState(ctx, newState);
            return result;
        });
    }
    validate() {
        const errors = [];
        const warnings = [];
        if (this.sequence.length === 0) {
            warnings.push('No sequence items configured - will return empty string');
        }
        if (this.pattern.type === 'weighted' && this.sequence.length > 0) {
            const weightedPattern = this.pattern;
            try {
                const validationContext = {
                    variables: {},
                    seed: 123,
                    nodeStates: new Map(),
                    evaluationDepth: 0,
                    cache: new Map(),
                    executionMeta: {
                        startTime: Date.now(),
                        nodeExecutionOrder: [],
                        performanceMetrics: new Map()
                    }
                };
                weightedPattern.getNext(this.sequence, { index: 0, history: [] }, validationContext);
            }
            catch (error) {
                errors.push(`Invalid weighted pattern configuration: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        this.sequence.forEach((item, index) => {
            if (item === undefined || item === null) {
                warnings.push(`Sequence item ${index} is undefined or null`);
            }
            if (typeof item !== 'string') {
                warnings.push(`Sequence item ${index} is not a string: ${typeof item}`);
            }
        });
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    serialize() {
        return {
            id: this.id,
            type: 'Sequential',
            config: this.getConfig(),
            data: {
                sequence: this.sequence,
                pattern: {
                    type: this.pattern.type,
                    config: this.pattern instanceof WeightedPattern ?
                        { weights: this.pattern.config.weights } :
                        this.pattern instanceof RandomPattern ?
                            { allowRepeats: this.pattern.config.allowRepeats } :
                            {}
                }
            },
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    getCurrentState(ctx) {
        return this.getState(ctx) || null;
    }
    resetState(ctx) {
        this.setState(ctx, {
            index: 0,
            history: [],
            patternData: {}
        });
    }
    getEffectiveSequence(ctx) {
        return this.sequence;
    }
}
exports.SequentialNode = SequentialNode;
function createSequentialNode(id, sequence, patternType = 'linear', patternConfig = {}) {
    const pattern = createSequencePattern(patternType, patternConfig);
    return new SequentialNode(id, sequence, pattern);
}
exports.SequentialPresets = {
    linear: (sequence) => createSequencePattern('linear'),
    cycle: (sequence) => createSequencePattern('cyclical'),
    random: (allowRepeats = true) => createSequencePattern('random', { allowRepeats }),
    shuffle: () => createSequencePattern('random', { allowRepeats: false }),
    weighted: (weights) => createSequencePattern('weighted', { weights }),
    uniform: (length) => createSequencePattern('weighted', { weights: new Array(length).fill(1) })
};
//# sourceMappingURL=Sequential.js.map