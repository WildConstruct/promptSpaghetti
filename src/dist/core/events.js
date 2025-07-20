"use strict";
// src/core/events.ts
// Event storage using SQLite for durability and performance
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.append = append;
exports.fetchSince = fetchSince;
exports.fetchByTypeSince = fetchByTypeSince;
exports.fetchLatest = fetchLatest;
exports.getEventCount = getEventCount;
exports.getLatestEventId = getLatestEventId;
exports.transaction = transaction;
exports.close = close;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure data directory exists
const dataDir = path_1.default.join(process.cwd(), "data");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path_1.default.join(dataDir, "events.db");
const db = new better_sqlite3_1.default(dbPath);
// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    type TEXT NOT NULL,
    actor TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_id ON events(id);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor);
`);
// Prepared statements for performance
const insertStmt = db.prepare("INSERT INTO events(ts, type, actor, payload, version) VALUES (?, ?, ?, ?, ?)");
const selectSinceStmt = db.prepare("SELECT id, ts, type, actor, payload, version FROM events WHERE id > ? ORDER BY id LIMIT ?");
const selectByTypeStmt = db.prepare("SELECT id, ts, type, actor, payload, version FROM events WHERE type = ? AND id > ? ORDER BY id LIMIT ?");
const selectLatestStmt = db.prepare("SELECT id, ts, type, actor, payload, version FROM events ORDER BY id DESC LIMIT ?");
const countStmt = db.prepare("SELECT COUNT(*) as count FROM events");
/**
 * Append an event to the event log
 */
function append(e) {
    const ts = new Date().toISOString();
    const info = insertStmt.run(ts, e.type, e.actor, JSON.stringify(e.payload), e.version);
    return {
        ...e,
        ts,
        id: info.lastInsertRowid
    };
}
/**
 * Fetch events since a given ID
 */
function fetchSince(lastId, limit = 100) {
    const rows = selectSinceStmt.all(lastId, limit);
    return rows.map(r => ({
        ...r,
        payload: JSON.parse(r.payload)
    }));
}
/**
 * Fetch events of a specific type since a given ID
 */
function fetchByTypeSince(type, lastId, limit = 100) {
    const rows = selectByTypeStmt.all(type, lastId, limit);
    return rows.map(r => ({
        ...r,
        payload: JSON.parse(r.payload)
    }));
}
/**
 * Fetch the latest N events
 */
function fetchLatest(limit = 100) {
    const rows = selectLatestStmt.all(limit);
    return rows.map(r => ({
        ...r,
        payload: JSON.parse(r.payload)
    })).reverse(); // Reverse to get chronological order
}
/**
 * Get total event count
 */
function getEventCount() {
    const result = countStmt.get();
    return result.count;
}
/**
 * Get the latest event ID (for cursor initialization)
 */
function getLatestEventId() {
    const rows = selectLatestStmt.all(1);
    return rows.length > 0 ? rows[0].id : 0;
}
/**
 * Transaction wrapper for batch operations
 */
function transaction(fn) {
    return db.transaction(fn)();
}
/**
 * Close database connection (for cleanup)
 */
function close() {
    db.close();
}
//# sourceMappingURL=events.js.map