"use strict";
// packages/core/runtime/advanced.ts
// Advanced runtime node base classes and enhanced execution context for Epic 7
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var index_1 = require("./index");
var seedrandom_1 = __importDefault(require("seedrandom"));
/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
var AdvancedRuntimeNode = /** @class */ (function (_super) {
    __extends(AdvancedRuntimeNode, _super);
    function AdvancedRuntimeNode(id, config) {
        var _this = _super.call(this, id) || this;
        _this.config = config;
        return _this;
    }
    /**
     * Get the current state for this node from the execution context
     */
    AdvancedRuntimeNode.prototype.getState = function (ctx) {
        return ctx.nodeStates.get(this.id);
    };
    /**
     * Set the current state for this node in the execution context
     */
    AdvancedRuntimeNode.prototype.setState = function (ctx, state) {
        ctx.nodeStates.set(this.id, state);
    };
    /**
     * Create a seeded random number generator for this node
     * Uses node ID and execution context for deterministic behavior
     */
    AdvancedRuntimeNode.prototype.createSeededRNG = function (seed, nodeSpecificSeed) {
        var combinedSeed = nodeSpecificSeed
            ? "".concat(seed, "-").concat(this.id, "-").concat(nodeSpecificSeed)
            : "".concat(seed, "-").concat(this.id);
        return (0, seedrandom_1.default)(combinedSeed);
    };
    /**
     * Check if a result is cached and return it, or cache a new result
     */
    AdvancedRuntimeNode.prototype.withCache = function (ctx, key, computation) {
        if (!this.config.cacheable) {
            return computation();
        }
        var cacheKey = "".concat(this.id, "-").concat(key);
        if (ctx.cache.has(cacheKey)) {
            return ctx.cache.get(cacheKey);
        }
        var result = computation();
        ctx.cache.set(cacheKey, result);
        return result;
    };
    /**
     * Record performance metrics for this node execution
     */
    AdvancedRuntimeNode.prototype.recordPerformanceMetric = function (ctx, metric, value) {
        var key = "".concat(this.id, "-").concat(metric);
        ctx.executionMeta.performanceMetrics.set(key, value);
    };
    /**
     * Measure execution time of a function and record it
     */
    AdvancedRuntimeNode.prototype.measureExecution = function (ctx, operation, fn) {
        var start = performance.now();
        var result = fn();
        var duration = performance.now() - start;
        this.recordPerformanceMetric(ctx, "".concat(operation, "_duration_ms"), duration);
        return result;
    };
    /**
     * Get configuration for this node
     */
    AdvancedRuntimeNode.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Check if this node is compatible with basic execution context
     * Advanced nodes should gracefully degrade when possible
     */
    AdvancedRuntimeNode.prototype.isCompatibleWithBasicContext = function () {
        return !this.config.stateful;
    };
    return AdvancedRuntimeNode;
}(index_1.RuntimeNode));
exports.AdvancedRuntimeNode = AdvancedRuntimeNode;
/**
 * Utility functions for working with advanced execution contexts
 */
var AdvancedExecutionUtils = /** @class */ (function () {
    function AdvancedExecutionUtils() {
    }
    /**
     * Create an enhanced execution context from a basic one
     */
    AdvancedExecutionUtils.enhanceContext = function (basicCtx) {
        return __assign(__assign({}, basicCtx), { nodeStates: new Map(), evaluationDepth: 0, cache: new Map(), executionMeta: {
                startTime: performance.now(),
                nodeExecutionOrder: [],
                performanceMetrics: new Map()
            } });
    };
    /**
     * Clear stateful data from context (for cleanup between executions)
     */
    AdvancedExecutionUtils.clearExecutionState = function (ctx) {
        ctx.nodeStates.clear();
        ctx.cache.clear();
        ctx.evaluationDepth = 0;
        ctx.executionMeta.nodeExecutionOrder.length = 0;
        ctx.executionMeta.performanceMetrics.clear();
        ctx.executionMeta.startTime = performance.now();
    };
    /**
     * Check for potential infinite loops in stateful node execution
     */
    AdvancedExecutionUtils.detectInfiniteLoop = function (ctx, nodeId) {
        var MAX_DEPTH = 1000; // Configurable limit
        return ctx.evaluationDepth > MAX_DEPTH;
    };
    /**
     * Get execution statistics from the context
     */
    AdvancedExecutionUtils.getExecutionStats = function (ctx) {
        var totalDuration = performance.now() - ctx.executionMeta.startTime;
        var nodesExecuted = ctx.executionMeta.nodeExecutionOrder.length;
        var cacheHits = ctx.cache.size;
        var statefulness = ctx.nodeStates.size;
        return {
            totalDuration: totalDuration,
            nodesExecuted: nodesExecuted,
            cacheHits: cacheHits,
            statefulness: statefulness
        };
    };
    return AdvancedExecutionUtils;
}());
exports.AdvancedExecutionUtils = AdvancedExecutionUtils;
/**
 * Standard validation helpers for advanced nodes
 */
var ValidationHelpers = /** @class */ (function () {
    function ValidationHelpers() {
    }
    ValidationHelpers.createValidResult = function () {
        return { valid: true, errors: [], warnings: [] };
    };
    ValidationHelpers.createInvalidResult = function (errors, warnings) {
        if (warnings === void 0) { warnings = []; }
        return { valid: false, errors: errors, warnings: warnings };
    };
    ValidationHelpers.validateRequired = function (value, fieldName) {
        return value === undefined || value === null || value === ''
            ? ["".concat(fieldName, " is required")]
            : [];
    };
    ValidationHelpers.validateArray = function (value, fieldName, minLength) {
        if (minLength === void 0) { minLength = 0; }
        var errors = [];
        if (!Array.isArray(value)) {
            errors.push("".concat(fieldName, " must be an array"));
        }
        else if (value.length < minLength) {
            errors.push("".concat(fieldName, " must have at least ").concat(minLength, " items"));
        }
        return errors;
    };
    ValidationHelpers.validateNumericRange = function (value, fieldName, min, max) {
        var errors = [];
        if (typeof value !== 'number' || isNaN(value)) {
            errors.push("".concat(fieldName, " must be a valid number"));
        }
        else {
            if (min !== undefined && value < min) {
                errors.push("".concat(fieldName, " must be at least ").concat(min));
            }
            if (max !== undefined && value > max) {
                errors.push("".concat(fieldName, " must be at most ").concat(max));
            }
        }
        return errors;
    };
    return ValidationHelpers;
}());
exports.ValidationHelpers = ValidationHelpers;
/**
 * Enhanced AdvancedRuntimeNode with I/O system integration
 */
var AdvancedRuntimeNodeWithIO = /** @class */ (function (_super) {
    __extends(AdvancedRuntimeNodeWithIO, _super);
    function AdvancedRuntimeNodeWithIO(id, config, ioSpec) {
        var _this = _super.call(this, id, config) || this;
        if (ioSpec) {
            // Dynamic import to avoid circular dependency
            Promise.resolve().then(function () { return __importStar(require('./io-system')); }).then(function (_a) {
                var AdvancedIOHandler = _a.AdvancedIOHandler;
                _this.ioHandler = new AdvancedIOHandler(ioSpec);
            });
        }
        return _this;
    }
    /**
     * Validate node configuration including I/O specification
     */
    AdvancedRuntimeNodeWithIO.prototype.validate = function () {
        var baseValidation = this.validateNodeConfig();
        if (!this.ioHandler) {
            return baseValidation;
        }
        // Additional I/O validation would go here
        return baseValidation;
    };
    /**
     * Base node configuration validation
     */
    AdvancedRuntimeNodeWithIO.prototype.validateNodeConfig = function () {
        // Override in subclasses for node-specific validation
        return ValidationHelpers.createValidResult();
    };
    return AdvancedRuntimeNodeWithIO;
}(AdvancedRuntimeNode));
exports.AdvancedRuntimeNodeWithIO = AdvancedRuntimeNodeWithIO;
/**
 * Standard node data serialization helpers
 */
var SerializationHelpers = /** @class */ (function () {
    function SerializationHelpers() {
    }
    SerializationHelpers.createAdvancedNodeData = function (id, type, config, data) {
        return {
            id: id,
            type: type,
            config: config,
            data: data,
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    };
    SerializationHelpers.validateSerializedData = function (data) {
        var errors = [];
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
    };
    return SerializationHelpers;
}());
exports.SerializationHelpers = SerializationHelpers;
