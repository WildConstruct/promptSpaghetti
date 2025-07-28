import { AdvancedExecutionContext } from '../advanced';
/**
 * Configuration for different sequence patterns
 */
export interface SequencePatternConfig {
    weights?: number;
    allowRepeats?: boolean;
    /** Custom configuration for extensibility */
    custom?: Record<string, unknown>;
}
export interface SequencePattern {
    type: 'linear' | 'cyclical' | 'random' | 'weighted';
    getNext(sequence: string, state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export interface SequenceState {
    /** Current index in the sequence */
    index: number;
    /** History of returned values */
    history: string;
    /** Pattern-specific state data */
    patternData?: Record<string, unknown>;
}
export declare class LinearPattern implements SequencePattern {
    type: 'linear';
    getNext(sequence: string, state: SequenceState, _ctx: AdvancedExecutionContext): string;
}
//# sourceMappingURL=Sequential.d.ts.map