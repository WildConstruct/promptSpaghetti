import { Event, State } from './types';
/**
 * Validate an event against the current state
 * Returns an array of error messages (empty if valid)
 */
export declare function validate(ev: Event, state: State): string[];
/**
 * Validate that required fields are present in event payload
 */
export declare function validatePayload(ev: Event): string[];
//# sourceMappingURL=validator.d.ts.map
