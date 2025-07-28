import { ValidationResult } from '../advanced';
/**
 * State tracking for Markov chain processing
 */
export interface MarkovState {
    /** Current state in the chain */
    currentState: string;
    /** History of state transitions */
    history: string;
    /** Number of transitions performed */
    transitionCount: number;
    /** Metadata for pattern analysis */
    metadata?: Record<string, any>;
}
export interface TransitionMatrix {
    /** Available states in the chain */
    states: string;
    /** Transition probabilities: state -> {nextState: probability} */
    transitions: Record<string, Record<string, number>>;
    /** Get the initial state for new chains */
    getInitialState(): string;
    /** Perform a transition from current state using RNG */
    transition(currentState: string, rng: () => number): string;
    /** Validate the matrix configuration */
    validate(): ValidationResult;
}
export interface MarkovConfig {
    /** Maximum number of transitions before forcing termination */
    maxTransitions?: number;
    /** Whether to normalize probabilities automatically */
    normalizeProbabilities?: boolean;
    /** Custom termination conditions */
    terminationStates?: string;
    /** Loop detection settings */
    detectLoops?: boolean;
    /** Custom configuration for extensibility */
    custom?: Record<string, any>;
}
export declare class StandardTransitionMatrix implements TransitionMatrix {
    states: string;
    transitions: Record<string, Record<string, number>>;
    private initialState?;
    constructor();
    states: string;
    transitions: Record<string, Record<string, number>>;
    initialState?: string;
}
//# sourceMappingURL=Markov.d.ts.map