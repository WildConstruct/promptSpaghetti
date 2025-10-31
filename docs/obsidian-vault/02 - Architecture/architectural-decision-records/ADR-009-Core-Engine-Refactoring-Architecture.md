# ADR-009: Core Engine Refactoring Architecture

## Status

**ACCEPTED** - _Date: 2025-07-22_

## Context

During Epic 18 (Technical Debt & Refactoring), we identified significant architectural complexity in the core runtime engine that was creating maintenance challenges and limiting extensibility. The original monolithic design had several critical issues:

### Problems Identified

1. **Monolithic Runtime Architecture**: Single large runtime class handling all node types and execution logic
2. **Limited Extensibility**: Adding new node types required extensive modifications to core engine
3. **Complex State Management**: Execution context and node state intermingled across components
4. **Performance Bottlenecks**: Single-threaded execution with no optimization capabilities
5. **Testing Difficulties**: Tightly coupled components made unit testing complex

### Technical Debt Items Addressed

- **DEBT-004**: Runtime engine complexity reduction (P1 - Critical)
- **DEBT-006**: Node type system simplification (P2 - High)
- **DEBT-015**: Performance optimization architecture (P2 - High)
- **DEBT-007**: Component modularity improvements (P3 - Medium)

### Requirements

- Maintain backward compatibility with existing graphs
- Support deterministic execution with seeded randomization
- Enable advanced node capabilities (Epic 7 integration)
- Improve performance for large graph processing
- Facilitate easier testing and maintenance

## Decision

We will implement a **modular dual-tier runtime architecture** with clear separation between basic and advanced node capabilities:

### Core Architecture Components

#### 1. **Base Runtime System** (`packages/core/runtime/index.ts`)

- **RuntimeNode**: Abstract base class for basic node implementations
- **ExecutionContext**: Manages variables, seeds, and deterministic PRNG
- **Basic Node Types**: WeightedChoice, Concat, Output, Include, SetVariable, GetVariable
- Optimized for performance and backward compatibility

#### 2. **Advanced Runtime System** (`packages/core/runtime/advanced.ts`)

- **AdvancedRuntimeNode**: Enhanced base class extending RuntimeNode
- **AdvancedExecutionContext**: Extended context with state management and performance metrics
- **Advanced Node Types**: WeightedAdvanced, Conditional, Sequential, Markov
- Features: state management, caching, performance tracking, serialization

#### 3. **I/O System** (`packages/core/runtime/io-system.ts`)

- **AdvancedIOHandler**: Type-safe input/output handling with validation
- **IOSpecBuilder**: Fluent API for defining node specifications
- **TypedInputs**: Type-safe access to resolved input values
- **Constraint System**: Comprehensive validation framework

#### 4. **Context Detection System**

- Automatic detection of required context type (basic vs advanced)
- Seamless interoperability between basic and advanced nodes
- Performance optimization through context-appropriate execution paths

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between basic runtime, advanced features, and I/O handling
2. **Progressive Enhancement**: Basic nodes use lightweight execution, advanced nodes get full features
3. **Type Safety**: Comprehensive TypeScript types with runtime validation
4. **Performance First**: Optimized execution paths with minimal overhead for basic operations
5. **Extensibility**: Plugin-like architecture for adding new node types

### Implementation Strategy

#### Phase 1: Foundation (Completed in Epic 7)

- ✅ Implement AdvancedRuntimeNode base class
- ✅ Create I/O system with type-safe handlers
- ✅ Build validation framework with security checks
- ✅ Add serialization system for complex node states

#### Phase 2: Integration & Migration (Epic 18)

- ✅ Integrate advanced nodes with existing runtime engine
- ✅ Implement automatic context detection
- ✅ Add performance monitoring and caching systems
- ✅ Create comprehensive test coverage (93%+ achieved)

#### Phase 3: Optimization (Future)

- Implement parallel execution for independent node chains
- Add sophisticated caching strategies
- Optimize memory usage for large graphs
- Enhanced debugging and profiling tools

## Consequences

### Positive

- **Improved Maintainability**: Modular architecture makes code easier to understand and modify
- **Enhanced Extensibility**: New node types can be added without touching core engine
- **Better Performance**: Context-appropriate execution paths reduce overhead
- **Type Safety**: Comprehensive TypeScript support reduces runtime errors
- **Testing Excellence**: Modular design enables thorough unit testing (90%+ coverage achieved)
- **Future-Proof**: Architecture supports advanced features like parallel execution

### Negative

- **Initial Complexity**: Two-tier system adds architectural complexity
- **Learning Curve**: Developers need to understand both basic and advanced patterns
- **Memory Overhead**: Advanced context tracking uses more memory
- **Migration Effort**: Existing code needs updates to leverage new capabilities

### Neutral

- **Backward Compatibility**: Existing graphs continue to work without modification
- **Performance Impact**: Basic operations maintain same speed, advanced features add capabilities
- **Bundle Size**: Modular loading means only required features are loaded

### Risk Mitigation

1. **Comprehensive Testing**: 93%+ test coverage ensures reliability
2. **Documentation**: Detailed architecture docs and migration guides
3. **Gradual Migration**: Phased approach allows incremental adoption
4. **Performance Monitoring**: Built-in metrics track system performance
5. **Rollback Capability**: Dual-tier design allows fallback to basic runtime

## Implementation Details

### Context Detection Algorithm

```typescript
export function detectRequiredContext(graph: Graph): 'basic' | 'advanced' {
  const advancedNodeTypes = [
    'WeightedAdvanced',
    'Conditional',
    'Sequential',
    'Markov'
  ];
  const hasAdvancedNodes = graph.nodes.some(node =>
    advancedNodeTypes.includes(node.type)
  );
  return hasAdvancedNodes ? 'advanced' : 'basic';
}
```

### Performance Benchmarks

- **Basic Node Execution**: No performance regression (maintained <1ms per node)
- **Advanced Node Execution**: 2-5ms per node with full feature set
- **Graph Compilation**: 40% improvement through optimized validation
- **Memory Usage**: 15% increase for advanced context, 0% increase for basic operations

### Integration Points

- **Server Engine** (`server/src/engine.ts`): Automatic context detection and routing
- **Schema Validation** (`packages/core/graphSchema.ts`): Unified validation for both tiers
- **Preview System**: Seamless preview generation for mixed node graphs
- **Export System**: Compatible with GeneratorBundle format

## Related ADRs

- **ADR-001**: Repository Pattern for Data Access - Ensures data layer compatibility
- **ADR-002**: TypeScript Strict Mode - Enforces type safety across architecture
- **ADR-010**: Security Validation Framework - Integrates security into node execution

## References

- Epic 7 Advanced Node Capabilities implementation
- Epic 18 Technical Debt & Refactoring plan
- Core engine performance analysis
- Node type system design documents
- Advanced runtime test suites (93% coverage)

---

_This ADR documents the foundational architecture changes that enable the Prompt Spaghetti system to scale efficiently while maintaining reliability and extensibility._
