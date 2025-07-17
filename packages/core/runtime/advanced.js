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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializationHelpers = exports.AdvancedRuntimeNodeWithIO = exports.ValidationHelpers = exports.AdvancedExecutionUtils = exports.AdvancedRuntimeNode = void 0;
const index_1 = require("./index");
const seedrandom_1 = __importDefault(require("seedrandom"));
class AdvancedRuntimeNode extends index_1.RuntimeNode {
    constructor(id, config) {
        super(id);
        this.config = config;
    }
    getState(ctx) {
        return ctx.nodeStates.get(this.id);
    }
    setState(ctx, state) {
        ctx.nodeStates.set(this.id, state);
    }
    createSeededRNG(seed, nodeSpecificSeed) {
        const combinedSeed = nodeSpecificSeed
            ? `${seed}-${this.id}-${nodeSpecificSeed}`
            : `${seed}-${this.id}`;
        return (0, seedrandom_1.default)(combinedSeed);
    }
    withCache(ctx, key, computation) {
        if (!this.config.cacheable) {
            return computation();
        }
        const cacheKey = `${this.id}-${key}`;
        if (ctx.cache.has(cacheKey)) {
            return ctx.cache.get(cacheKey);
        }
        const result = computation();
        ctx.cache.set(cacheKey, result);
        return result;
    }
    recordPerformanceMetric(ctx, metric, value) {
        const key = `${this.id}-${metric}`;
        ctx.executionMeta.performanceMetrics.set(key, value);
    }
    measureExecution(ctx, operation, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        this.recordPerformanceMetric(ctx, `${operation}_duration_ms`, duration);
        return result;
    }
    getConfig() {
        return { ...this.config };
    }
    isCompatibleWithBasicContext() {
        return !this.config.stateful;
    }
}
exports.AdvancedRuntimeNode = AdvancedRuntimeNode;
class AdvancedExecutionUtils {
    static enhanceContext(basicCtx) {
        return {
            ...basicCtx,
            nodeStates: new Map(),
            evaluationDepth: 0,
            cache: new Map(),
            executionMeta: {
                startTime: performance.now(),
                nodeExecutionOrder: [],
                performanceMetrics: new Map()
            }
        };
    }
    static clearExecutionState(ctx) {
        ctx.nodeStates.clear();
        ctx.cache.clear();
        ctx.evaluationDepth = 0;
        ctx.executionMeta.nodeExecutionOrder.length = 0;
        ctx.executionMeta.performanceMetrics.clear();
        ctx.executionMeta.startTime = performance.now();
    }
    static detectInfiniteLoop(ctx, nodeId) {
        const MAX_DEPTH = 1000;
        return ctx.evaluationDepth > MAX_DEPTH;
    }
    static getExecutionStats(ctx) {
        const totalDuration = performance.now() - ctx.executionMeta.startTime;
        const nodesExecuted = ctx.executionMeta.nodeExecutionOrder.length;
        const cacheHits = ctx.cache.size;
        const statefulness = ctx.nodeStates.size;
        return {
            totalDuration,
            nodesExecuted,
            cacheHits,
            statefulness
        };
    }
}
exports.AdvancedExecutionUtils = AdvancedExecutionUtils;
class ValidationHelpers {
    static createValidResult() {
        return { valid: true, errors: [], warnings: [] };
    }
    static createInvalidResult(errors, warnings = []) {
        return { valid: false, errors, warnings };
    }
    static validateRequired(value, fieldName) {
        return value === undefined || value === null || value === ''
            ? [`${fieldName} is required`]
            : [];
    }
    static validateArray(value, fieldName, minLength = 0) {
        const errors = [];
        if (!Array.isArray(value)) {
            errors.push(`${fieldName} must be an array`);
        }
        else if (value.length < minLength) {
            errors.push(`${fieldName} must have at least ${minLength} items`);
        }
        return errors;
    }
    static validateNumericRange(value, fieldName, min, max) {
        const errors = [];
        if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${fieldName} must be a valid number`);
        }
        else {
            if (min !== undefined && value < min) {
                errors.push(`${fieldName} must be at least ${min}`);
            }
            if (max !== undefined && value > max) {
                errors.push(`${fieldName} must be at most ${max}`);
            }
        }
        return errors;
    }
}
exports.ValidationHelpers = ValidationHelpers;
class AdvancedRuntimeNodeWithIO extends AdvancedRuntimeNode {
    constructor(id, config, ioSpec) {
        super(id, config);
        if (ioSpec) {
            Promise.resolve().then(() => __importStar(require('./io-system'))).then(({ AdvancedIOHandler }) => {
                this.ioHandler = new AdvancedIOHandler(ioSpec);
            });
        }
    }
    validate() {
        const baseValidation = this.validateNodeConfig();
        if (!this.ioHandler) {
            return baseValidation;
        }
        return baseValidation;
    }
    validateNodeConfig() {
        return ValidationHelpers.createValidResult();
    }
}
exports.AdvancedRuntimeNodeWithIO = AdvancedRuntimeNodeWithIO;
class SerializationHelpers {
    static createAdvancedNodeData(id, type, config, data) {
        return {
            id,
            type,
            config,
            data,
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    static validateSerializedData(data) {
        const errors = [];
        if (!data.id)
            errors.push('Node ID is required');
        if (!data.type)
            errors.push('Node type is required');
        if (!data.config)
            errors.push('Node config is required');
        if (!data.data)
            errors.push('Node data is required');
        if (data.config) {
            if (typeof data.config.deterministic !== 'boolean') {
                errors.push('Config.deterministic must be a boolean');
            }
            if (typeof data.config.cacheable !== 'boolean') {
                errors.push('Config.cacheable must be a boolean');
            }
            if (typeof data.config.stateful !== 'boolean') {
                errors.push('Config.stateful must be a boolean');
            }
        }
        return errors.length > 0
            ? ValidationHelpers.createInvalidResult(errors)
            : ValidationHelpers.createValidResult();
    }
}
exports.SerializationHelpers = SerializationHelpers;
//# sourceMappingURL=advanced.js.map