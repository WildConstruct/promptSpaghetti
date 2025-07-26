import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
/**
 * Configuration for different sequence patterns
 */
export interface SequencePatternConfig {
    /** For weighted pattern: weights corresponding to sequence items */
    weights?: number[];
    /** For random pattern: whether to allow repeats */
    allowRepeats?: boolean;
    /** Custom configuration for extensibility */
    custom?: Record<string, any>;
}
/**
 * Sequence pattern interface for different traversal strategies
 */
export interface SequencePattern {
    type: 'linear' | 'cyclical' | 'random' | 'weighted';
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
/**
 * State tracking for sequential processing
 */
export interface SequenceState {
    /** Current index in the sequence */
    index: number;
    /** History of returned values */
    history: string[];
    /** Pattern-specific state data */
    patternData?: Record<string, any>;
}
/**
 * Linear sequence pattern - goes through items in order, then stops
 */
export declare class LinearPattern implements SequencePattern {
    type: 'linear';
    getNext(sequence: string[], state: SequenceState, _ctx: AdvancedExecutionContext): string;
}
/**
 * Cyclical sequence pattern - cycles through items infinitely
 */
export declare class CyclicalPattern implements SequencePattern {
    type: 'cyclical';
    getNext(sequence: string[], state: SequenceState, _ctx: AdvancedExecutionContext): string;
}
/**
 * Random sequence pattern - selects items randomly
 */
export declare class RandomPattern implements SequencePattern {
    private config;
    type: 'random';
    constructor(config?: SequencePatternConfig);
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
/**
 * Weighted sequence pattern - selects items based on weights
 */
export declare class WeightedPattern implements SequencePattern {
    private config;
    type: 'weighted';
    constructor(config: SequencePatternConfig);
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
/**
 * Factory function to create sequence patterns
 */
export declare function createSequencePattern(
  type: SequencePattern['type'],
  config?: SequencePatternConfig
): SequencePattern;
/**
 * Advanced sequential node with stateful sequence processing
 * Supports multiple traversal patterns: linear, cyclical, random, weighted
 */
export declare class SequentialNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private sequence;
    private pattern;
    constructor(id: string, sequence?: string[], pattern?: SequencePattern);
    /**
     * Execute sequential logic using the configured pattern
     */
    run(ctx: AdvancedExecutionContext): string;
    /**
     * Comprehensive validation of sequential configuration
     */
    validate(): ValidationResult;
    /**
     * Serialize node data for persistence
     */
    serialize(): AdvancedNodeData;
    /**
     * Get current state for debugging/inspection
     */
    getCurrentState(ctx: AdvancedExecutionContext): SequenceState | null;
    /**
     * Reset state (for testing or manual control)
     */
    resetState(ctx: AdvancedExecutionContext): void;
    /**
     * Get effective sequence from constructor data or dynamic inputs
     */
    private getEffectiveSequence;
}
/**
 * Factory function for creating Sequential nodes
 */
export declare function createSequentialNode(
  id: string,
  sequence: string[],
  patternType?: SequencePattern['type'],
  patternConfig?: SequencePatternConfig
): SequentialNode;
/**
 * Utility functions for common sequential patterns
 */
export declare     /** Infinite cycling sequence */
    readonly cycle: (_sequence: string[]) => SequencePattern;
    /** Random selection with repeats */
    readonly random: (allowRepeats?: boolean) => SequencePattern;
    /** Random selection without repeats until exhausted */
    readonly shuffle: () => SequencePattern;
    /** Weighted selection */
    readonly weighted: (weights: number[]) => SequencePattern;
    /** Equal probability weighted selection */
    readonly uniform: (length: number) => SequencePattern;
};
//# sourceMappingURL=Sequential.d.ts.map