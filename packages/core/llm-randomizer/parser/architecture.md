# Parser Architecture Design

## Overview

The parser converts LLM-generated serialized graph format back into executable Graph objects. It's designed for robustness, performance, and comprehensive error reporting.

## Architecture Components

### 1. Lexical Analysis (`lexer/`)

**Purpose**: Convert raw text into structured tokens
**Responsibilities**:

- Tokenize YAML-like input
- Handle section delimiters (`---NODES---`, `---EDGES---`, `---END---`)
- Track line/column positions for error reporting
- Normalize whitespace and indentation

**Key Classes**:

- `GraphLexer`: Main tokenization engine
- `Token`: Individual lexical units
- `LexerPosition`: Track location for error reporting

### 2. AST Construction (`ast/`)

**Purpose**: Build Abstract Syntax Tree from tokens
**Responsibilities**:

- Parse token stream into structured tree
- Handle nested YAML structures
- Build intermediate representation
- Maintain source position mapping

**Key Classes**:

- `ASTBuilder`: Constructs syntax tree
- `ASTNode`: Base node for syntax tree
- `GraphAST`: Root AST representation

### 3. Semantic Analysis (`semantic/`)

**Purpose**: Validate and transform AST into Graph objects
**Responsibilities**:

- Type checking and validation
- Reference resolution (node ID -> node object)
- Cycle detection
- Property validation by node type

**Key Classes**:

- `SemanticAnalyzer`: Main analysis engine
- `GraphBuilder`: Converts AST to Graph objects
- `ValidationContext`: Tracks validation state

### 4. Error Handling

**Purpose**: Comprehensive error reporting with recovery
**Responsibilities**:

- Collect and categorize errors
- Provide helpful error messages
- Support error recovery for partial parsing
- Generate suggestions for common mistakes

## Parser Pipeline

```
Raw Text → Lexer → Tokens → AST Builder → AST → Semantic Analyzer → Graph
                     ↓          ↓           ↓            ↓
                  Lex Errors  Parse Errors  AST        Semantic Errors
                                           Errors
```

## Error Handling Strategy

### Error Categories

1. **Lexical Errors**: Invalid characters, malformed tokens
2. **Syntax Errors**: Invalid structure, missing sections
3. **Semantic Errors**: Type mismatches, invalid references
4. **Validation Errors**: Business rule violations

### Error Recovery

- **Synchronization Points**: Section boundaries for recovery
- **Error Tolerance**: Continue parsing after recoverable errors
- **Partial Results**: Return partial graphs when possible
- **Suggestion Engine**: Provide fixes for common mistakes

## Performance Targets

- **Linear Complexity**: O(n) parsing for input size n
- **Memory Efficiency**: Streaming parsing for large inputs
- **Error Performance**: Fast error detection and reporting
- **Cache Friendly**: Minimize memory allocations

## Design Patterns

### Visitor Pattern

For AST traversal and transformation:

```typescript
interface ASTVisitor {
  visitNode(node: ASTNode): void;
  visitProperty(prop: PropertyNode): void;
  visitArray(array: ArrayNode): void;
}
```

### Strategy Pattern

For different validation strategies:

```typescript
interface ValidationStrategy {
  validate(node: ASTNode, context: ValidationContext): ValidationResult;
}
```

### Builder Pattern

For incremental graph construction:

```typescript
class GraphBuilder {
  addNode(node: NodeDefinition): GraphBuilder;
  addEdge(edge: EdgeDefinition): GraphBuilder;
  build(): Graph;
}
```

## Integration Points

### With Serialization System

- Share validation logic with validator
- Consistent error message format
- Round-trip compatibility testing

### With Graph Schema

- Leverage existing Zod schemas
- Type-safe node construction
- Schema evolution support

### With Runtime System

- Direct Graph object creation
- Validation for executable graphs
- Performance optimization hooks

## Security Considerations

### Input Sanitization

- Prevent code injection in property values
- Limit memory usage for large inputs
- Validate against malicious patterns

### Safe Property Handling

- Escape special characters
- Validate property types strictly
- Prevent prototype pollution

## Testing Strategy

### Unit Testing

- Individual component testing
- Mock input generation
- Error case coverage

### Integration Testing

- Round-trip serialization/parsing
- LLM output compatibility
- Performance benchmarking

### Fuzz Testing

- Random input generation
- Edge case discovery
- Robustness validation

This architecture provides a robust, performant, and maintainable parsing system for the LLM-generated graph format.
