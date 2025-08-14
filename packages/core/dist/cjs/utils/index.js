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
// Note: CompressionService and PerformanceMonitor are intentionally not re-exported
// here due to incomplete implementations that can break consumers during type-checking.
// If/when stabilized, they can be re-added.
__exportStar(require("./supabaseClient.js"), exports);
__exportStar(require("./psgStorage.js"), exports);
__exportStar(require("./supabaseFeature.js"), exports);
__exportStar(require("./psgCodec.js"), exports);
__exportStar(require("./persistenceUtils.js"), exports);
// Temporarily exclude stateRestoration due to duplicate export conflict
// export * from './stateRestoration.js';
