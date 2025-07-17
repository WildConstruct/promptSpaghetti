import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
export interface MarkovState {
    currentState: string;
    history: string[];
    transitionCount: number;
    metadata?: Record<string, any>;
}
export interface TransitionMatrix {
    states: string[];
    transitions: Record<string, Record<string, number>>;
    getInitialState(): string;
    transition(currentState: string, rng: () => number): string;
    validate(): ValidationResult;
}
export interface MarkovConfig {
    maxTransitions?: number;
    normalizeProbabilities?: boolean;
    terminationStates?: string[];
    detectLoops?: boolean;
    custom?: Record<string, any>;
}
export declare class StandardTransitionMatrix implements TransitionMatrix {
    states: string[];
    transitions: Record<string, Record<string, number>>;
    private initialState?;
    constructor(states: string[], transitions: Record<string, Record<string, number>>, initialState?: string);
    getInitialState(): string;
    transition(currentState: string, rng: () => number): string;
    validate(): ValidationResult;
}
export declare class MarkovNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private transitionMatrix;
    private markovConfig;
    constructor(id: string, transitionMatrix: TransitionMatrix, config?: MarkovConfig);
    run(ctx: AdvancedExecutionContext): string;
    validate(): ValidationResult;
    serialize(): AdvancedNodeData;
    getCurrentMarkovState(ctx: AdvancedExecutionContext): MarkovState | null;
    resetMarkovState(ctx: AdvancedExecutionContext): void;
    getTransitionHistory(ctx: AdvancedExecutionContext): string[];
    private shouldTerminate;
    private detectLoop;
}
export declare function createMarkovNode(id: string, states: string[], transitions: Record<string, Record<string, number>>, initialState?: string, config?: MarkovConfig): MarkovNode;
export declare function createTransitionMatrix(config: {
    states: string[];
    transitions: Record<string, Record<string, number>>;
    initialState?: string;
}): TransitionMatrix;
export declare const MarkovPresets: {
    readonly toggle: (state1: string, state2: string) => TransitionMatrix;
    readonly randomWalk: (states: string[]) => TransitionMatrix;
    readonly linear: (states: string[], cyclic?: boolean) => TransitionMatrix;
    readonly absorbing: (states: string[], absorbingStates: string[]) => TransitionMatrix;
};
//# sourceMappingURL=Markov.d.ts.map