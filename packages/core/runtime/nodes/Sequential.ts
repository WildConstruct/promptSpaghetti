// packages/core/runtime/nodes/Sequential.ts
// Advanced sequential node with stateful sequence processing
import { 
  AdvancedRuntimeNode, 
  AdvancedExecutionContext, 
  AdvancedNodeConfig,
  AdvancedNodeData,
  ValidationResult,
  ValidationHelpers 
} from '../advanced';
import { 
  AdvancedIOHandler,
  IOSpecBuilder,
  TypedInputs 
} from '../io-system';
import seedrandom from 'seedrandom';
/**
 * Configuration for different sequence patterns
 */
export interface SequencePatternConfig {
  /** For weighted pattern: weights corresponding to sequence items */
  weights?: number[];
  /** For random pattern: whether to allow repeats */
  allowRepeats?: boolean;
  /** Custom configuration for extensibility */
  custom?: Record<string, unknown>;
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
  patternData?: Record<string, unknown>;
}
/**
 * Linear sequence pattern - goes through items in order, then stops
 */
export class LinearPattern implements SequencePattern {
  type: 'linear' = 'linear';
  getNext(sequence: string[], state: SequenceState, _ctx: AdvancedExecutionContext): string {
    if (state.index >= sequence.length) {
      // Return last item when sequence is exhausted
      return sequence[sequence.length - 1] || '';
    }
    return sequence[state.index];
  }
}
/**
 * Cyclical sequence pattern - cycles through items infinitely
 */
export class CyclicalPattern implements SequencePattern {
  type: 'cyclical' = 'cyclical';
  getNext(sequence: string[], state: SequenceState, _ctx: AdvancedExecutionContext): string {
    if (sequence.length === 0) return '';
    const index = state.index % sequence.length;
    return sequence[index];
  }
}
/**
 * Random sequence pattern - selects items randomly
 */
export class RandomPattern implements SequencePattern {
  type: 'random' = 'random';
  constructor(private config: SequencePatternConfig = {}) {}
  getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string {
    if (sequence.length === 0) return '';
    // Create seeded RNG for deterministic randomness
    const rng = seedrandom(`${ctx.seed}-${state.index}`);}
    if (this.config.allowRepeats === false) {
      // Without repeats: select from unused items
      const used = new Set(state.history);
      const available = sequence.filter(item => !used.has(item));
      if (available.length === 0) {
        // All items used, reset or return last
        return sequence[Math.floor(rng() * sequence.length)];
      }
      return available[Math.floor(rng() * available.length)];
    } else {
      // With repeats: select any item randomly
      return sequence[Math.floor(rng() * sequence.length)];
    }
  }
}
/**
 * Weighted sequence pattern - selects items based on weights
 */
export class WeightedPattern implements SequencePattern {
  type: 'weighted' = 'weighted';
  constructor(private config: SequencePatternConfig) {
    if (!config.weights) {
      throw new Error('WeightedPattern requires weights configuration');
    }
  }
  getNext(sequence: string[], state: SequenceState, ctx: AdvancedExecutionContext): string {
    if (sequence.length === 0) return '';
    const weights = this.config.weights!;
    if (weights.length !== sequence.length) {
      throw new Error(`Weights length (${weights.length}) must match sequence length (${sequence.length})`);}
    }
    // Create seeded RNG for deterministic selection
    const rng = seedrandom(`${ctx.seed}-${state.index}`);}
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
    if (totalWeight === 0) {
      // All weights are zero, fallback to uniform random
      return sequence[Math.floor(rng() * sequence.length)];
    }
    // Weighted selection
    let randomValue = rng() * totalWeight;
    for (let i = 0; i < sequence.length; i++) {
      randomValue -= Math.max(0, weights[i]);
      if (randomValue <= 0) {
        return sequence[i];
      }
    }
    // Fallback to last item
    return sequence[sequence.length - 1];
  }
}
/**
 * Factory function to create sequence patterns
 */
export function createSequencePattern()
  type: SequencePattern['type'], 
  config: SequencePatternConfig = {}
): SequencePattern {
  switch (type) {
  case 'linear':
    return new LinearPattern();
  case 'cyclical':
    return new CyclicalPattern();
  case 'random':
    return new RandomPattern(config);
  case 'weighted':
    return new WeightedPattern(config);
  default:
        throw new Error(`Unknown sequence pattern type: ${type}`);}
  }
}
/**
 * Advanced sequential node with stateful sequence processing
 * Supports multiple traversal patterns: linear, cyclical, random, weighted
 */
export class SequentialNode extends AdvancedRuntimeNode<string> {
  private ioHandler: AdvancedIOHandler;
  private sequence: string[];
  private pattern: SequencePattern;
  constructor()
    id: string, 
    sequence: string[] = [],
    pattern: SequencePattern = new LinearPattern()
  ) {
    // Configure as deterministic, non-cacheable (stateful), stateful
    const nodeConfig: AdvancedNodeConfig = {
      deterministic: true,
      cacheable: false, // Don't cache since output depends on state
      stateful: true,   // Maintains state between executions
      performanceHints: {,
        expectedExecutionTime: 'fast',
        memoryUsage: 'low',
      }
    };
    super(id, nodeConfig);
    this.sequence = sequence;
    this.pattern = pattern;
    // Set up I/O specification
    const ioSpec = new IOSpecBuilder();
      .addInput({)
        id: 'items',
        label: 'Sequence Items',
        dataType: 'stringArray',
        required: false,
        defaultValue: [],
        description: 'Array of items to sequence through'
      })
      .addInput({)
        id: 'pattern',
        label: 'Sequence Pattern',
        dataType: 'string',
        required: false,
        defaultValue: 'linear',
        description: 'Pattern type: linear, cyclical, random, weighted'
      })
      .addInput({)
        id: 'config',
        label: 'Pattern Configuration',
        dataType: 'object',
        required: false,
        defaultValue: {},
        description: 'Configuration object for the selected pattern'
      })
      .addTextOutput('result', 'Sequential Result')
      .build();
    this.ioHandler = new AdvancedIOHandler(ioSpec);
  }
  /**
   * Execute sequential logic using the configured pattern
   */
  run(ctx: AdvancedExecutionContext): string {
    // Record this node's execution
    ctx.executionMeta.nodeExecutionOrder.push(this.id);
    // Use performance tracking for sequential processing
    return this.measureExecution(ctx, 'sequential-processing', () => {
      // Get current state or initialize
      const currentState = this.getState(ctx) as SequenceState || {
        index: 0,
        history: [],
        patternData: {}
      };
      // Get effective sequence (from constructor or dynamic inputs)
      const effectiveSequence = this.getEffectiveSequence(ctx);
      if (effectiveSequence.length === 0) {
        // No items to sequence through
        return '';
      }
      // Get next item using pattern
      const result = this.pattern.getNext(effectiveSequence, currentState, ctx);
      // Update state
      const newState: SequenceState = {
        index: currentState.index + 1,
        history: [...currentState.history, result],
        patternData: currentState.patternData,
      };
      this.setState(ctx, newState);
      return result;
    });
  }
  /**
   * Comprehensive validation of sequential configuration
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Validate sequence
    if (this.sequence.length === 0) {
      warnings.push('No sequence items configured - will return empty string');
    }
    // Validate pattern-specific configuration
    if (this.pattern.type === 'weighted' && this.sequence.length > 0) {
      const weightedPattern = this.pattern as WeightedPattern;
      try {
        // This will throw if weights are invalid - use actual sequence for validation
        const validationContext: AdvancedExecutionContext = {
          variables: {},
          seed: 123,
          nodeStates: new Map(),
          evaluationDepth: 0,
          cache: new Map(),
          prng: () => Math.random(),
          executionMeta: {,
            startTime: Date.now(),
            executionId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,}
            nodeExecutionOrder: [],
            performanceMetrics: new Map()
          }
        };
        weightedPattern.getNext(this.sequence, { index: 0, history: [] }, validationContext);
      } catch (error) {
        errors.push(`Invalid weighted pattern configuration: ${error instanceof Error ? error.message : String(error)}`);}
      }
    }
    // Validate sequence items
    this.sequence.forEach((item, index) => {
      if (item === undefined || item === null) {
        warnings.push(`Sequence item ${index} is undefined or null`);}
      }
      if (typeof item !== 'string') {
        warnings.push(`Sequence item ${index} is not a string: ${typeof item}`);}
      }
    });
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Serialize node data for persistence
   */
  serialize(): AdvancedNodeData {
    return {
      id: this.id,
      type: 'Sequential',
      config: this.getConfig(),
      data: {,
        sequence: this.sequence,
        pattern: {,
          type: this.pattern.type,
          config: this.pattern instanceof WeightedPattern ? 
            { weights: (this.pattern as any).config.weights } :
            this.pattern instanceof RandomPattern ?
              { allowRepeats: (this.pattern as any).config.allowRepeats } :
              {}
        }
      },
      metadata: {,
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };
  }
  /**
   * Get current state for debugging/inspection
   */
  getCurrentState(ctx: AdvancedExecutionContext): SequenceState | null {
    return this.getState(ctx) as SequenceState || null;
  }
  /**
   * Reset state (for testing or manual control)
   */
  resetState(ctx: AdvancedExecutionContext): void {
    this.setState(ctx, {)
      index: 0,
      history: [],
      patternData: {}
    });
  }
  /**
   * Get effective sequence from constructor data or dynamic inputs
   */
  private getEffectiveSequence(_ctx: AdvancedExecutionContext): string[] {
    // For now, use constructor sequence
    // In full implementation, would merge with dynamic inputs from I/O system
    return this.sequence;
  }
}
/**
 * Factory function for creating Sequential nodes
 */
export function createSequentialNode()
  id: string,
  sequence: string[],
  patternType: SequencePattern['type'] = 'linear',
  patternConfig: SequencePatternConfig = {}
): SequentialNode {
  const pattern = createSequencePattern(patternType, patternConfig);
  return new SequentialNode(id, sequence, pattern);
}
/**
 * Utility functions for common sequential patterns
 */
export }
} as const;