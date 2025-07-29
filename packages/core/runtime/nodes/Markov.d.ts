import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
/**
 * State tracking for Markov chain processing
 */

export interface MarkovState {
    /** Current state in the chain */
    currentState: string;
    /** History of state transitions */
    history: string[];
    /** Number of transitions performed */
    transitionCount: number;
    /** Metadata for pattern analysis */
    metadata?: Record<string, any>;
/**
 * Transition matrix interface for Markov chains
 */

export interface TransitionMatrix {
    /** Available states in the chain */
    states: string[];
    /** Transition probabilities: state -> {nextState: probability} */
    transitions: Record<string, Record<string, number>>;
    /** Get the initial state for new chains */
    getInitialState(): string;
    /** Perform a transition from current state using RNG */
    transition(currentState: string, rng: () => number): string;
    /** Validate the matrix configuration */
    validate(): ValidationResult;
/**
 * Configuration for Markov chain behavior
 */

export interface MarkovConfig {
    /** Maximum number of transitions before forcing termination */
    maxTransitions?: number;
    /** Whether to normalize probabilities automatically */
    normalizeProbabilities?: boolean;
    /** Custom termination conditions */
    terminationStates?: string[];
    /** Loop detection settings */
    detectLoops?: boolean;
    /** Custom configuration for extensibility */
    custom?: Record<string, any>;
/**
 * Standard transition matrix implementation
 */
export declare class StandardTransitionMatrix implements TransitionMatrix {
    states: string[];
    transitions: Record<string, Record<string, number>>;
    private initialState?;
    constructor(states: string[], transitions: Record<string, Record<string, number>>, initialState?: string);
    getInitialState(): string;
    transition(currentState: string, rng: () => number): string;
    validate(): ValidationResult;
/**
 * Advanced Markov node with state transition matrices
 * Supports probabilistic state transitions with full determinism
 */
export declare class MarkovNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private transitionMatrix;
    private markovConfig;
    constructor(id: string, transitionMatrix: TransitionMatrix, config?: MarkovConfig);
    /**
     * Execute Markov chain transition
     */
    run(ctx: AdvancedExecutionContext): string;
    /**
     * Comprehensive validation of Markov configuration
     */
    validate(): ValidationResult;
    /**
     * Serialize node data for persistence
     */
    serialize(): AdvancedNodeData;
    /**
     * Get current Markov state for debugging/inspection
     */
    getCurrentMarkovState(ctx: AdvancedExecutionContext): MarkovState | null;
    /**
     * Reset Markov chain state (for testing or manual control)
     */
    resetMarkovState(ctx: AdvancedExecutionContext): void;
    /**
     * Get transition history
     */
    getTransitionHistory(ctx: AdvancedExecutionContext): string[];
    /**
     * Check if chain should terminate
     */
    private shouldTerminate;
    /**
     * Simple loop detection
     */
    private detectLoop;
/**
 * Factory function for creating Markov nodes
 */
export declare function createMarkovNode(id: string)
  states: string[],
  transitions: Record<string,
  Record<string,
  number>>,
  initialState?: string,
  config?: MarkovConfig
): MarkovNode;
/**
 * Helper function to create transition matrix from simple configuration
 */
export declare function createTransitionMatrix(config: {)
    states: string[];
    transitions: Record<string, Record<string, number>>;
    initialState?: string;
}): TransitionMatrix;
/**
 * Common Markov chain presets
 */
export declare     /** Random walk with equal probabilities */
    readonly randomWalk: (states: string[]) => TransitionMatrix;
    /** Linear progression through states */
    readonly linear: (states: string[], cyclic?: boolean) => TransitionMatrix;
    /** Absorbing states (traps that never transition out) */
    readonly absorbing: (states: string[], absorbingStates: string[]) => TransitionMatrix;
};
//# sourceMappingURL=Markov.d.ts.map