"use strict";
/**
 * Core Utilities Index
 *
 * Central exports for all utility modules in the core package.
 * This includes compression services, performance monitoring,
 * and other shared utilities.
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.sanitizeInput = exports.generateSecureToken = exports.verifyPassword = exports.hashPassword = exports.SecurityRateLimiter = exports.authRateLimiter = exports.RequestRateLimiter = void 0;
// Note: CompressionService and PerformanceMonitor are intentionally not re-exported
// here due to incomplete implementations that can break consumers during type-checking.
// If/when stabilized, they can be re-added.
// Only export stable utils that don't have import issues - using explicit exports to avoid conflicts
__exportStar(require("./debug"), exports);
var rateLimiter_1 = require("./rateLimiter");
Object.defineProperty(exports, "RequestRateLimiter", { enumerable: true, get: function () { return rateLimiter_1.RateLimiter; } });
Object.defineProperty(exports, "authRateLimiter", { enumerable: true, get: function () { return rateLimiter_1.authRateLimiter; } });
var securityUtils_1 = require("./securityUtils");
Object.defineProperty(exports, "SecurityRateLimiter", { enumerable: true, get: function () { return securityUtils_1.RateLimiter; } });
Object.defineProperty(exports, "hashPassword", { enumerable: true, get: function () { return securityUtils_1.hashPassword; } });
Object.defineProperty(exports, "verifyPassword", { enumerable: true, get: function () { return securityUtils_1.verifyPassword; } });
Object.defineProperty(exports, "generateSecureToken", { enumerable: true, get: function () { return securityUtils_1.generateSecureToken; } });
Object.defineProperty(exports, "sanitizeInput", { enumerable: true, get: function () { return securityUtils_1.sanitizeInput; } });
Object.defineProperty(exports, "validateEmail", { enumerable: true, get: function () { return securityUtils_1.validateEmail; } });
__exportStar(require("./performanceUtils"), exports);
// Temporarily exclude stateRestoration due to duplicate export conflict
// export * from './stateRestoration.js';
