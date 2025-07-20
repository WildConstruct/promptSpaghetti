"use strict";
// src/core/state.ts
// State persistence and initialization
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyState = emptyState;
exports.saveState = saveState;
exports.loadState = loadState;
exports.hashState = hashState;
exports.backupState = backupState;
exports.getStateStats = getStateStats;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const dataDir = path_1.default.join(process.cwd(), "data");
const statePath = path_1.default.join(dataDir, "state.json");
/**
 * Create an empty initial state
 */
function emptyState() {
    return {
        meta: {
            cycle: 1,
            phase: "PLAN",
            updated: new Date().toISOString()
        },
        product_goals: [],
        stories: [],
        tasks: {},
        assignments: {},
        metrics: {
            cycle_history: []
        },
        config: {
            wip_limit_per_dev: 2,
            timeout_sec: 600
        }
    };
}
/**
 * Save state to disk
 */
function saveState(s) {
    // Ensure data directory exists
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    // Update timestamp
    s.meta.updated = new Date().toISOString();
    // Write atomically using a temp file
    const tempPath = `${statePath}.tmp`;
    fs_1.default.writeFileSync(tempPath, JSON.stringify(s, null, 2));
    fs_1.default.renameSync(tempPath, statePath);
}
/**
 * Load state from disk
 */
function loadState() {
    if (!fs_1.default.existsSync(statePath)) {
        return emptyState();
    }
    try {
        const content = fs_1.default.readFileSync(statePath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        console.error("Error loading state, returning empty state:", error);
        return emptyState();
    }
}
/**
 * Create a hash of the state for integrity checking
 */
function hashState(s) {
    // Sort keys to ensure consistent hashing
    const sorted = JSON.stringify(s, Object.keys(s).sort());
    return crypto_1.default.createHash("sha256").update(sorted).digest("hex");
}
/**
 * Create a backup of the current state
 */
function backupState() {
    if (!fs_1.default.existsSync(statePath)) {
        return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path_1.default.join(dataDir, "backups");
    if (!fs_1.default.existsSync(backupDir)) {
        fs_1.default.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path_1.default.join(backupDir, `state-${timestamp}.json`);
    fs_1.default.copyFileSync(statePath, backupPath);
}
/**
 * Get state statistics
 */
function getStateStats(s) {
    const tasksByState = {};
    const assignmentsByDev = {};
    const storiesByStatus = {};
    // Count tasks by state
    Object.values(s.tasks).forEach(task => {
        tasksByState[task.state] = (tasksByState[task.state] || 0) + 1;
    });
    // Count assignments by developer
    Object.entries(s.assignments).forEach(([dev, taskIds]) => {
        assignmentsByDev[dev] = taskIds.length;
    });
    // Count stories by status
    s.stories.forEach(story => {
        storiesByStatus[story.status] = (storiesByStatus[story.status] || 0) + 1;
    });
    return {
        totalTasks: Object.keys(s.tasks).length,
        tasksByState,
        assignmentsByDev,
        storiesByStatus
    };
}
//# sourceMappingURL=state.js.map