# Epic 7 Advanced Node Architecture Design

## Overview

This document outlines the architectural design for Epic 7's advanced node capabilities, building on the solid foundation provided by Epic 3's runtime engine and Epic 5's inspector system.

## Current Architecture Analysis

### ✅ Strengths of Current Foundation
- **RuntimeNode Base Class**: Clean abstract base with `run(ctx: ExecutionContext)` method
- **ExecutionContext**: Variables + seed management for deterministic execution  
- **Schema System**: Zod-based type safety and validation
- **Inspector System**: Modular `BaseNodeEditor` with schema-driven form generation
- **Engine Integration**: `createRuntime()` factory pattern ready for extension

### 🎯 Architecture Goals for Advanced Nodes
1. **Unified Interface**: All advanced nodes inherit from enhanced base classes
2. **Deterministic Execution**: Maintain seeded random behavior for complex algorithms
3. **Extensible UI**: Leverage existing inspector pattern for specialized editors
4. **Backward Compatibility**: Zero impact on existing node types
5. **Performance**: Efficient algorithms with caching where appropriate

## Proposed Advanced Node Architecture

### 1. Enhanced Runtime Base Classes

```typescript
// packages/core/runtime/advanced.ts

export interface AdvancedExecutionContext extends ExecutionContext {
  // Enhanced context for stateful nodes
  nodeStates: Map<string, any>;  // For Sequential, Markov state tracking
  evaluationDepth: number;       // For cycle detection
  cache: Map<string, any>;       // For performance optimization
}

export abstract class AdvancedRuntimeNode<TOutput = unknown> extends RuntimeNode<TOutput> {
  protected config: AdvancedNodeConfig;
  
  constructor(id: string, config: AdvancedNodeConfig) {
    super(id);
    this.config = config;
  }

  // Enhanced run method with advanced context
  abstract run(ctx: AdvancedExecutionContext): Promise<TOutput> | TOutput;
  
  // Validation method for complex node configurations
  abstract validate(): ValidationResult;
  
  // Serialization for complex state
  abstract serialize(): AdvancedNodeData;
  
  // State management for stateful nodes
  protected getState(ctx: AdvancedExecutionContext): any {
    return ctx.nodeStates.get(this.id);
  }
  
  protected setState(ctx: AdvancedExecutionContext, state: any): void {
    ctx.nodeStates.set(this.id, state);
  }
}

export interface AdvancedNodeConfig {
  deterministic: boolean;       // For seeded vs non-seeded behavior
  cacheable: boolean;          // For performance optimization
  stateful: boolean;           // For nodes that maintain state
}
```

### 2. Specific Advanced Node Types

#### A. WeightedAdvanced Node
```typescript
export class WeightedAdvancedNode extends AdvancedRuntimeNode<string> {
  constructor(
    id: string, 
    private distribution: WeightDistribution,
    private options: WeightedOptions
  ) {
    super(id, { deterministic: true, cacheable: true, stateful: false });
  }

  run(ctx: AdvancedExecutionContext): string {
    const rng = this.createSeededRNG(ctx.seed, this.id);
    return this.distribution.sample(rng, this.options);
  }
}

export interface WeightDistribution {
  type: 'linear' | 'exponential' | 'gaussian' | 'custom';
  values: Array<{ value: string; weight: number }>;
  parameters?: Record<string, number>; // For gaussian (mean, std), etc.
}
```

#### B. Conditional Node
```typescript
export class ConditionalNode extends AdvancedRuntimeNode<string> {
  constructor(
    id: string,
    private conditions: ConditionalBranch[],
    private defaultBranch?: string
  ) {
    super(id, { deterministic: true, cacheable: false, stateful: false });
  }

  run(ctx: AdvancedExecutionContext): string {
    for (const branch of this.conditions) {
      if (this.evaluateCondition(branch.condition, ctx)) {
        return branch.output;
      }
    }
    return this.defaultBranch || '';
  }

  private evaluateCondition(expr: string, ctx: AdvancedExecutionContext): boolean {
    // Expression evaluation engine (variables, comparisons, etc.)
    return ConditionEvaluator.evaluate(expr, ctx.variables);
  }
}

export interface ConditionalBranch {
  condition: string;    // "variable > 5", "hasFlag('debug')", etc.
  output: string;
}
```

#### C. Sequential Node
```typescript
export class SequentialNode extends AdvancedRuntimeNode<string> {
  constructor(
    id: string,
    private sequence: string[],
    private pattern: SequencePattern
  ) {
    super(id, { deterministic: true, cacheable: false, stateful: true });
  }

  run(ctx: AdvancedExecutionContext): string {
    const state = this.getState(ctx) || { index: 0, history: [] };
    
    const result = this.pattern.getNext(this.sequence, state, ctx);
    
    this.setState(ctx, {
      index: state.index + 1,
      history: [...state.history, result]
    });
    
    return result;
  }
}

export interface SequencePattern {
  type: 'linear' | 'cyclical' | 'random' | 'weighted';
  getNext(sequence: string[], state: any, ctx: AdvancedExecutionContext): string;
}
```

#### D. Markov Node
```typescript
export class MarkovNode extends AdvancedRuntimeNode<string> {
  constructor(
    id: string,
    private transitionMatrix: TransitionMatrix,
    private initialState?: string
  ) {
    super(id, { deterministic: true, cacheable: false, stateful: true });
  }

  run(ctx: AdvancedExecutionContext): string {
    let state = this.getState(ctx);
    
    if (!state) {
      state = {
        currentState: this.initialState || this.transitionMatrix.getInitialState(),
        history: []
      };
    }

    const nextState = this.transitionMatrix.transition(
      state.currentState, 
      this.createSeededRNG(ctx.seed, this.id + state.history.length)
    );

    this.setState(ctx, {
      currentState: nextState,
      history: [...state.history, nextState]
    });

    return nextState;
  }
}

export interface TransitionMatrix {
  states: string[];
  transitions: Record<string, Record<string, number>>; // state -> {nextState: probability}
  getInitialState(): string;
  transition(currentState: string, rng: () => number): string;
}
```

### 3. Schema Extensions

```typescript
// packages/core/graphSchema.ts - Extensions

export const NodeTypeEnum = z.enum([
  // Existing types
  'WeightedChoice', 'Concat', 'Output', 'Include', 'SetVariable', 'GetVariable',
  // New advanced types
  'WeightedAdvanced', 'Conditional', 'Sequential', 'Markov'
]);

export const WeightedAdvancedNodeSchema = BaseNode.extend({
  type: z.literal('WeightedAdvanced'),
  distribution: z.object({
    type: z.enum(['linear', 'exponential', 'gaussian', 'custom']),
    values: z.array(z.object({ value: z.string(), weight: z.number() })),
    parameters: z.record(z.number()).optional()
  })
});

export const ConditionalNodeSchema = BaseNode.extend({
  type: z.literal('Conditional'),
  conditions: z.array(z.object({
    condition: z.string(),
    output: z.string()
  })),
  defaultBranch: z.string().optional()
});

export const SequentialNodeSchema = BaseNode.extend({
  type: z.literal('Sequential'),
  sequence: z.array(z.string()),
  pattern: z.object({
    type: z.enum(['linear', 'cyclical', 'random', 'weighted']),
    config: z.record(z.any()).optional()
  })
});

export const MarkovNodeSchema = BaseNode.extend({
  type: z.literal('Markov'),
  states: z.array(z.string()),
  transitions: z.record(z.record(z.number())),
  initialState: z.string().optional()
});
```

### 4. Engine Integration Strategy

```typescript
// server/src/engine.ts - Extensions

function createRuntime(node: Node, resolvedInputs: any[]): RuntimeNode<any> {
  switch (node.type) {
    // Existing cases...
    
    case 'WeightedAdvanced':
      return new WeightedAdvancedNode(node.id, node.distribution, {});
    case 'Conditional':
      return new ConditionalNode(node.id, node.conditions, node.defaultBranch);
    case 'Sequential':
      return new SequentialNode(node.id, node.sequence, createSequencePattern(node.pattern));
    case 'Markov':
      return new MarkovNode(node.id, createTransitionMatrix(node), node.initialState);
    
    default:
      const _exhaustive: never = node;
      throw new Error(`Unsupported node type ${(node as any).type}`);
  }
}

// Enhanced execution context for advanced nodes
export async function executeGraphAdvanced(graph: Graph): Promise<string[]> {
  const ctx: AdvancedExecutionContext = {
    variables: {},
    seed: graph.seed ?? Date.now(),
    nodeStates: new Map(),
    evaluationDepth: 0,
    cache: new Map()
  };
  // ... rest of execution logic
}
```

### 5. UI Component Strategy

```typescript
// packages/core/components/Inspector/editors/WeightedAdvancedEditor.tsx

export const WeightedAdvancedEditor: React.FC<BaseNodeEditorProps> = ({
  nodeId, nodeData, onChange
}) => {
  return (
    <BaseNodeEditor nodeId={nodeId} nodeData={nodeData} onChange={onChange}>
      <CollapsibleSection title="Distribution Type">
        <SelectEditor
          label="Type"
          value={nodeData.distribution?.type}
          options={[
            { value: 'linear', label: 'Linear' },
            { value: 'exponential', label: 'Exponential' },
            { value: 'gaussian', label: 'Gaussian' },
            { value: 'custom', label: 'Custom' }
          ]}
          onChange={(type) => onChange({ distribution: { ...nodeData.distribution, type }})}
        />
      </CollapsibleSection>
      
      <CollapsibleSection title="Weight Distribution Graph">
        <WeightDistributionGraph distribution={nodeData.distribution} />
      </CollapsibleSection>
      
      <CollapsibleSection title="Values & Weights">
        <VariationList
          variations={nodeData.distribution?.values || []}
          onChange={(values) => onChange({ distribution: { ...nodeData.distribution, values }})}
          showWeights={true}
        />
      </CollapsibleSection>
    </BaseNodeEditor>
  );
};
```

## Implementation Plan

### Phase 1: Foundation (2 days)
1. ✅ **Architecture Design** (this document)
2. **Create AdvancedRuntimeNode base class**
3. **Extend ExecutionContext for advanced features**
4. **Update engine.ts with extension points**

### Phase 2: Core Nodes (6 days)
1. **WeightedAdvanced Node** (2 days)
2. **Conditional Node** (2 days)  
3. **Sequential Node** (1 day)
4. **Markov Node** (1 day)

### Phase 3: UI Integration (4 days)
1. **Advanced node editors** (2 days)
2. **Specialized visualizations** (1 day)
3. **Integration testing** (1 day)

## Risk Mitigation

### Performance Concerns
- **Caching Strategy**: Implement smart caching for expensive operations
- **Lazy Evaluation**: Only compute when needed
- **Memory Management**: Clear state for completed executions

### Complexity Management
- **Progressive Disclosure**: Start with basic configurations, expand as needed
- **Sensible Defaults**: Provide working defaults for all advanced features
- **Validation**: Comprehensive validation at both schema and runtime levels

### Backward Compatibility
- **Zero Impact**: Existing nodes continue to work unchanged
- **Gradual Migration**: Optional migration path for enhanced features
- **Feature Flags**: Enable advanced nodes incrementally

## Success Metrics

1. **Performance**: Advanced nodes execute within 10% of basic node performance
2. **Usability**: Users can configure advanced nodes in <5 minutes
3. **Reliability**: 100% deterministic output for same seed + configuration
4. **Extensibility**: New node types can be added without core changes

This architecture provides a solid foundation for Epic 7's advanced capabilities while maintaining the simplicity and performance of the existing system.