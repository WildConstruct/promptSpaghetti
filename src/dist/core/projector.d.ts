import { Event, DiscordMessage } from './types';
/**
 * Project an event into Discord message(s)
 * Returns null if no Discord message should be sent
 */
export declare function projectEvent(ev: Event): DiscordMessage | null;
/**
 * Batch multiple events into a single Discord message
 * Useful for reducing spam when many events happen quickly
 */
export declare function batchProject(events: Event[]): DiscordMessage | null;
/**
 * Determine if an event should be projected immediately or batched
 */
export declare function shouldBatch(ev: Event): boolean;
/**
 * Get the appropriate Discord channel for an event type
 */
export declare function getChannelForEvent(ev: Event): string;
//# sourceMappingURL=projector.d.ts.map
