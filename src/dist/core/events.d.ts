import { Event } from "./types";
/**
 * Append an event to the event log
 */
export declare function append(e: Omit<Event, "id" | "ts">): Event;
/**
 * Fetch events since a given ID
 */
export declare function fetchSince(lastId: number, limit?: number): Event[];
/**
 * Fetch events of a specific type since a given ID
 */
export declare function fetchByTypeSince(type: string, lastId: number, limit?: number): Event[];
/**
 * Fetch the latest N events
 */
export declare function fetchLatest(limit?: number): Event[];
/**
 * Get total event count
 */
export declare function getEventCount(): number;
/**
 * Get the latest event ID (for cursor initialization)
 */
export declare function getLatestEventId(): number;
/**
 * Transaction wrapper for batch operations
 */
export declare function transaction<T>(fn: () => T): T;
/**
 * Close database connection (for cleanup)
 */
export declare function close(): void;
//# sourceMappingURL=events.d.ts.map