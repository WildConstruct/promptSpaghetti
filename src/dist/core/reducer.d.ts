import { State, Event } from './types';
/**
 * Apply an event to the state, returning a new state
 * This is a pure function - it does not modify the input state
 */
export declare function reduce(state: State, ev: Event): State;
/**
 * Replay a series of events to build state from scratch
 */
export declare function replayEvents(events: Event[], initialState?: State): State;
//# sourceMappingURL=reducer.d.ts.map
