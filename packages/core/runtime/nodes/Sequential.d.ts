import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
export interface SequencePatternConfig {
    weights?: number[];
    allowRepeats?: boolean;
    custom?: Record<string, any>;
}
export interface SequencePattern {
    type: 'linear' | 'cyclical' | 'random' | 'weighted';
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export interface SequenceState {
    index: number;
    history: string[];
    patternData?: Record<string, any>;
}
export declare class LinearPattern implements SequencePattern {
    type: 'linear';
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export declare class CyclicalPattern implements SequencePattern {
    type: 'cyclical';
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export declare class RandomPattern implements SequencePattern {
    private config;
    type: 'random';
    constructor(config?: SequencePatternConfig);
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export declare class WeightedPattern implements SequencePattern {
    private config;
    type: 'weighted';
    constructor(config: SequencePatternConfig);
    getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string;
}
export declare function createSequencePattern(type: SequencePattern['type'], config?: SequencePatternConfig): SequencePattern;
export declare class SequentialNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private sequence;
    private pattern;
    constructor(id: string, sequence?: string[], pattern?: SequencePattern);
    run(ctx: AdvancedExecutionContext): string;
    validate(): ValidationResult;
    serialize(): AdvancedNodeData;
    getCurrentState(ctx: AdvancedExecutionContext): SequenceState | null;
    resetState(ctx: AdvancedExecutionContext): void;
    private getEffectiveSequence;
}
export declare function createSequentialNode(id: string, sequence: string[], patternType?: SequencePattern['type'], patternConfig?: SequencePatternConfig): SequentialNode;
export declare const SequentialPresets: {
    readonly linear: (sequence: string[]) => SequencePattern;
    readonly cycle: (sequence: string[]) => SequencePattern;
    readonly random: (allowRepeats?: boolean) => SequencePattern;
    readonly shuffle: () => SequencePattern;
    readonly weighted: (weights: number[]) => SequencePattern;
    readonly uniform: (length: number) => SequencePattern;
};
//# sourceMappingURL=Sequential.d.ts.map