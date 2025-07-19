"use strict";
/**
 * TypeScript client for Python Executor Service
 * Epic 8 Story 8.1.4: Main application integration
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonExecutorClient = exports.PythonExecutorClient = exports.PythonExecutorClientError = void 0;
exports.createPythonExecutorClient = createPythonExecutorClient;
exports.isPythonExecutorAvailable = isPythonExecutorAvailable;
exports.executePythonCode = executePythonCode;
exports.validatePythonCode = validatePythonCode;
var PythonExecutorClientError = /** @class */ (function (_super) {
    __extends(PythonExecutorClientError, _super);
    function PythonExecutorClientError(message, code, statusCode, details) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.details = details;
        _this.name = 'PythonExecutorClientError';
        return _this;
    }
    return PythonExecutorClientError;
}(Error));
exports.PythonExecutorClientError = PythonExecutorClientError;
var PythonExecutorClient = /** @class */ (function () {
    function PythonExecutorClient(config) {
        if (config === void 0) { config = {}; }
        var _a, _b;
        this.requestId = 0;
        this.config = __assign({ baseUrl: config.baseUrl || 'http://localhost:8001', timeout: config.timeout || 30000, retryAttempts: config.retryAttempts || 3, retryDelay: config.retryDelay || 1000, apiKey: config.apiKey, enableMetrics: (_a = config.enableMetrics) !== null && _a !== void 0 ? _a : true, defaultMemoryLimit: config.defaultMemoryLimit || '128MB', defaultTimeout: config.defaultTimeout || 30, defaultStrictMode: (_b = config.defaultStrictMode) !== null && _b !== void 0 ? _b : true }, config);
    }
    /**
     * Execute Python code using the executor service
     */
    PythonExecutorClient.prototype.execute = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, executeRequest, response, result, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestId = this.generateRequestId();
                        executeRequest = __assign(__assign({}, request), { timeout: request.timeout || this.config.defaultTimeout, memory_limit: request.memory_limit || this.config.defaultMemoryLimit, strict_mode: (_a = request.strict_mode) !== null && _a !== void 0 ? _a : this.config.defaultStrictMode });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.makeRequest('/v1/execute', {
                                method: 'POST',
                                body: JSON.stringify(executeRequest),
                                headers: __assign({ 'Content-Type': 'application/json', 'X-Request-ID': requestId }, (this.config.apiKey && { 'Authorization': "Bearer ".concat(this.config.apiKey) })),
                            })];
                    case 2:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _b.sent();
                        // Log metrics if enabled
                        if (this.config.enableMetrics) {
                            this.logMetrics(requestId, 'execute', result);
                        }
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _b.sent();
                        this.handleError(error_1 instanceof Error ? error_1 : new Error(String(error_1)), 'execute', requestId);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate Python code without executing it
     */
    PythonExecutorClient.prototype.validate = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, validateRequest, response, result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestId = this.generateRequestId();
                        validateRequest = __assign(__assign({}, request), { strict_mode: (_a = request.strict_mode) !== null && _a !== void 0 ? _a : this.config.defaultStrictMode });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.makeRequest('/v1/validate', {
                                method: 'POST',
                                body: JSON.stringify(validateRequest),
                                headers: __assign({ 'Content-Type': 'application/json', 'X-Request-ID': requestId }, (this.config.apiKey && { 'Authorization': "Bearer ".concat(this.config.apiKey) })),
                            })];
                    case 2:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _b.sent();
                        // Log metrics if enabled
                        if (this.config.enableMetrics) {
                            this.logMetrics(requestId, 'validate', result);
                        }
                        return [2 /*return*/, result];
                    case 4:
                        error_2 = _b.sent();
                        this.handleError(error_2 instanceof Error ? error_2 : new Error(String(error_2)), 'validate', requestId);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if the Python executor service is healthy
     */
    PythonExecutorClient.prototype.health = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestId = this.generateRequestId();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.makeRequest('/health', {
                                method: 'GET',
                                headers: __assign({ 'X-Request-ID': requestId }, (this.config.apiKey && { 'Authorization': "Bearer ".concat(this.config.apiKey) })),
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_3 = _a.sent();
                        this.handleError(error_3 instanceof Error ? error_3 : new Error(String(error_3)), 'health', requestId);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get service metrics
     */
    PythonExecutorClient.prototype.metrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestId = this.generateRequestId();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.makeRequest('/metrics', {
                                method: 'GET',
                                headers: __assign({ 'X-Request-ID': requestId }, (this.config.apiKey && { 'Authorization': "Bearer ".concat(this.config.apiKey) })),
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_4 = _a.sent();
                        this.handleError(error_4 instanceof Error ? error_4 : new Error(String(error_4)), 'metrics', requestId);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update client configuration
     */
    PythonExecutorClient.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
    };
    /**
     * Get current configuration
     */
    PythonExecutorClient.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Make HTTP request with retry logic
     */
    PythonExecutorClient.prototype.makeRequest = function (endpoint, options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, lastError, _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.config.baseUrl).concat(endpoint);
                        lastError = null;
                        _loop_1 = function (attempt) {
                            var controller_1, timeoutId, response, errorText, errorData, error_5;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 4, , 6]);
                                        controller_1 = new AbortController();
                                        timeoutId = setTimeout(function () { return controller_1.abort(); }, this_1.config.timeout);
                                        return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { signal: controller_1.signal }))];
                                    case 1:
                                        response = _b.sent();
                                        clearTimeout(timeoutId);
                                        if (!!response.ok) return [3 /*break*/, 3];
                                        return [4 /*yield*/, response.text()];
                                    case 2:
                                        errorText = _b.sent();
                                        errorData = void 0;
                                        try {
                                            errorData = JSON.parse(errorText);
                                        }
                                        catch (_c) {
                                            errorData = { message: errorText };
                                        }
                                        throw new PythonExecutorClientError(errorData.message || "HTTP ".concat(response.status, ": ").concat(response.statusText), errorData.code || 'HTTP_ERROR', response.status, errorData);
                                    case 3: return [2 /*return*/, { value: response }];
                                    case 4:
                                        error_5 = _b.sent();
                                        lastError = error_5;
                                        // Don't retry on certain errors
                                        if (error_5 instanceof PythonExecutorClientError &&
                                            (error_5.statusCode === 400 || error_5.statusCode === 401 || error_5.statusCode === 403)) {
                                            throw error_5;
                                        }
                                        // Don't retry on the last attempt
                                        if (attempt === this_1.config.retryAttempts) {
                                            throw error_5;
                                        }
                                        // Wait before retrying
                                        return [4 /*yield*/, this_1.sleep(this_1.config.retryDelay * Math.pow(2, attempt))];
                                    case 5:
                                        // Wait before retrying
                                        _b.sent();
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= this.config.retryAttempts)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError;
                }
            });
        });
    };
    /**
     * Generate unique request ID
     */
    PythonExecutorClient.prototype.generateRequestId = function () {
        return "req_".concat(Date.now(), "_").concat(++this.requestId);
    };
    /**
     * Sleep for specified milliseconds
     */
    PythonExecutorClient.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /**
     * Log metrics for monitoring
     */
    PythonExecutorClient.prototype.logMetrics = function (requestId, operation, result) {
        var metrics = {
            requestId: requestId,
            operation: operation,
            timestamp: Date.now(),
            success: result.success !== false,
            executionTime: result.execution_time,
            memoryUsed: result.memory_used,
            cacheHit: result.cache_hit,
            securityViolations: result.sandbox_violations,
        };
        // In a real application, you would send these metrics to a monitoring service
        console.log('PythonExecutor Metrics:', metrics);
    };
    /**
     * Handle and log errors
     */
    PythonExecutorClient.prototype.handleError = function (error, operation, requestId) {
        var errorInfo = {
            requestId: requestId,
            operation: operation,
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack,
        };
        // In a real application, you would send these errors to a monitoring service
        console.error('PythonExecutor Error:', errorInfo);
    };
    return PythonExecutorClient;
}());
exports.PythonExecutorClient = PythonExecutorClient;
/**
 * Default instance with common configuration
 */
exports.pythonExecutorClient = new PythonExecutorClient({
    baseUrl: process.env.PYTHON_EXECUTOR_URL || 'http://localhost:8001',
    apiKey: process.env.PYTHON_EXECUTOR_API_KEY,
    enableMetrics: process.env.NODE_ENV !== 'production',
});
/**
 * Factory function for creating configured clients
 */
function createPythonExecutorClient(config) {
    return new PythonExecutorClient(config);
}
/**
 * Utility function to check if the service is available
 */
function isPythonExecutorAvailable(baseUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var client, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    client = new PythonExecutorClient({ baseUrl: baseUrl });
                    return [4 /*yield*/, client.health()];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Utility function to execute Python code with default settings
 */
function executePythonCode(code_1, inputData_1) {
    return __awaiter(this, arguments, void 0, function (code, inputData, options) {
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.pythonExecutorClient.execute(__assign({ code: code, input_data: inputData }, options))];
        });
    });
}
/**
 * Utility function to validate Python code
 */
function validatePythonCode(code_1) {
    return __awaiter(this, arguments, void 0, function (code, options) {
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.pythonExecutorClient.validate(__assign({ code: code }, options))];
        });
    });
}
