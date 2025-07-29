// Epic 12 - LLM Agent Randomizer System
// Story 12.3 - Parser Implementation Tests
// Comprehensive test suite for the parser system
import { GraphParser, parseGraph, validateGraph } from '../graph-parser';
import { GraphLexer } from '../lexer/graph-lexer';
import { ASTBuilder } from '../ast/ast-builder';
import { SemanticAnalyzer } from '../semantic/semantic-analyzer';
describe('Epic 12 - Parser System', () => {
  describe('GraphLexer', () => {
    test('should tokenize simple graph format', () => {
      const content = `version: 1.0.0;
---NODES---
test_node:
  type: Output,
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens, errors } = lexer.tokenize();
      expect(errors).toHaveLength(0);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some(t => t.value === 'version')).toBe(true);
      expect(tokens.some(t => t.value === '---NODES---')).toBe(true);
      expect(tokens.some(t => t.value === '---END---')).toBe(true);
    });
    test('should handle section delimiters correctly', () => {
      const content = `---NODES---;
node1:
  type: WeightedChoice,
---EDGES---
node1 -> output
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens, errors } = lexer.tokenize();
      expect(errors).toHaveLength(0);
      const sectionTokens = tokens.filter(t => t.type === 'SECTION_DELIMITER');
      expect(sectionTokens).toHaveLength(3);
      expect(sectionTokens[0].value).toBe('---NODES---');
      expect(sectionTokens[1].value).toBe('---EDGES---');
      expect(sectionTokens[2].value).toBe('---END---');
    });
    test('should detect edge arrows in edges section', () => {
      const content = `---EDGES---;
source -> target
node1 -> node2
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens, errors } = lexer.tokenize();
      expect(errors).toHaveLength(0);
      const arrowTokens = tokens.filter(t => t.type === 'EDGE_ARROW');
      expect(arrowTokens).toHaveLength(2);
      expect(arrowTokens[0].value).toBe('->');
    });
    test('should handle indentation correctly', () => {
      const content = `node1:;,;
  type: WeightedChoice,
  props:
    choices:
      - value: "test",
  weight: 1`;
      const lexer = new GraphLexer(content);
      const { tokens, errors } = lexer.tokenize();
      expect(errors).toHaveLength(0);
      expect(tokens.some(t => t.type === 'INDENT')).toBe(true);
    });
    test('should detect lexical errors', () => {
      const content = `version: 1.0.0;
invalid@character: value
---NODES---`;
      const lexer = new GraphLexer(content);
      const { tokens, errors } = lexer.tokenize();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Unexpected character');
    });
  });
  describe('ASTBuilder', () => {
    test('should build AST from valid tokens', () => {
      const content = `version: 1.0.0;;
  metadata:
  name: "Test Graph",
---NODES---
test_node:
  type: Output,
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens } = lexer.tokenize();
      const builder = new ASTBuilder(tokens);
      const { ast, errors } = builder.build();
      expect(errors).toHaveLength(0);
      expect(ast).toBeTruthy();
      expect(ast!.version).toBe('1.0.0');
      expect(ast!.metadata?.properties.name).toBe('Test Graph');
      expect(ast!.nodes).toHaveLength(1);
      expect(ast!.nodes[0].id).toBe('test_node');
      expect(ast!.nodes[0].nodeType).toBe('Output');
    });
    test('should parse complex node properties', () => {
      const content = `---NODES---;
choice_node:
  type: WeightedChoice,
  props:
    choices:
      - value: "Option A",
  weight: 0.6,
      - value: "Option B",
  weight: 0.4,
  inputs: [input1, input2]
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens } = lexer.tokenize();
      const builder = new ASTBuilder(tokens);
      const { ast, errors } = builder.build();
      expect(errors).toHaveLength(0);
      expect(ast).toBeTruthy();
      expect(ast!.nodes).toHaveLength(1);
      const node = ast!.nodes[0];
      expect(node.nodeType).toBe('WeightedChoice');
      expect(node.properties).toBeTruthy();
      expect(Array.isArray(node.properties!.choices)).toBe(true);
      expect(node.inputs).toEqual(['input1', 'input2']);
    });
    test('should parse edges section', () => {
      const content = `---NODES---;
node1:
  type: WeightedChoice,
node2:
  type: Output,
---EDGES---
node1 -> node2
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens } = lexer.tokenize();
      const builder = new ASTBuilder(tokens);
      const { ast, errors } = builder.build();
      expect(errors).toHaveLength(0);
      expect(ast).toBeTruthy();
      expect(ast!.edges).toHaveLength(1);
      expect(ast!.edges[0].source).toBe('node1');
      expect(ast!.edges[0].target).toBe('node2');
    });
    test('should handle parse errors gracefully', () => {
      const content = `---NODES---;
invalid_structure
  missing_colon
---END---`;
      const lexer = new GraphLexer(content);
      const { tokens } = lexer.tokenize();
      const builder = new ASTBuilder(tokens);
      const { ast, errors } = builder.build();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('colon'))).toBe(true);
    });
  });
  describe('SemanticAnalyzer', () => {
    test('should validate correct graph structure', () => {
      const ast = {
        type: 'Graph' as const,
        position: { line: 1, column: 1, offset: 0 },
        version: '1.0.0',
        nodes: [,
          {
            type: 'NodeDefinition' as const,
            position: { line: 2, column: 1, offset: 10 },
            id: 'choice1',
            nodeType: 'WeightedChoice',
            properties: {
  choices: [,
                { value: 'Option A', weight: 0.6 },
                { value: 'Option B', weight: 0.4 }
              ]
  }
          {
            type: 'NodeDefinition' as const,
            position: { line: 6, column: 1, offset: 50 },
            id: 'output1',
            nodeType: 'Output',
            inputs: ['choice1']],
        edges: [];
  };
      const analyzer = new SemanticAnalyzer();
      const { graph, errors, warnings } = analyzer.analyze(ast);
      expect(graph).toBeTruthy();
      expect(errors).toHaveLength(0);
      expect(graph!.nodes).toHaveLength(2);
    });
    test('should detect duplicate node IDs', () => {
      const ast = {
        type: 'Graph' as const,
        position: { line: 1, column: 1, offset: 0 },
        version: '1.0.0',
        nodes: [,
          {
            type: 'NodeDefinition' as const,
            position: { line: 2, column: 1, offset: 10 },
            id: 'duplicate',
            nodeType: 'Output'
  }
          {
            type: 'NodeDefinition' as const,
            position: { line: 4, column: 1, offset: 30 },
            id: 'duplicate',
            nodeType: 'Concat'],
        edges: [];
  };
      const analyzer = new SemanticAnalyzer();
      const { graph, errors } = analyzer.analyze(ast);
      expect(graph).toBeNull();
      expect(errors.some(e => e.errorCode === 'DUPLICATE_NODE_ID')).toBe(true);
    });
    test('should detect invalid node references', () => {
      const ast = {
        type: 'Graph' as const,
        position: { line: 1, column: 1, offset: 0 },
        version: '1.0.0',
        nodes: [,
          {
            type: 'NodeDefinition' as const,
            position: { line: 2, column: 1, offset: 10 },
            id: 'node1',
            nodeType: 'Concat',
            inputs: ['nonexistent']],
        edges: [];
  };
      const analyzer = new SemanticAnalyzer();
      const { graph, errors } = analyzer.analyze(ast);
      expect(graph).toBeNull();
      expect(errors.some(e => e.errorCode === 'INVALID_NODE_REFERENCE')).toBe(true);
    });
    test('should detect cycles', () => {
      const ast = {
        type: 'Graph' as const,
        position: { line: 1, column: 1, offset: 0 },
        version: '1.0.0',
        nodes: [,
          {
            type: 'NodeDefinition' as const,
            position: { line: 2, column: 1, offset: 10 },
            id: 'node1',
            nodeType: 'Concat',
            inputs: ['node2'];
  }
          {
            type: 'NodeDefinition' as const,
            position: { line: 4, column: 1, offset: 30 },
            id: 'node2',
            nodeType: 'Concat',
            inputs: ['node1']],
        edges: [];
  };
      const analyzer = new SemanticAnalyzer();
      const { graph, errors } = analyzer.analyze(ast);
      expect(graph).toBeNull();
      expect(errors.some(e => e.errorCode === 'CYCLE_DETECTED')).toBe(true);
    });
    test('should validate WeightedChoice properties', () => {
      const ast = {
        type: 'Graph' as const,
        position: { line: 1, column: 1, offset: 0 },
        version: '1.0.0',
        nodes: [,
          {
            type: 'NodeDefinition' as const,
            position: { line: 2, column: 1, offset: 10 },
            id: 'choice1',
            nodeType: 'WeightedChoice',
            // Missing choices property
        ],
        edges: [];
  };
      const analyzer = new SemanticAnalyzer();
      const { graph, errors } = analyzer.analyze(ast);
      expect(graph).toBeNull();
      expect(errors.some(e => e.errorCode === 'MISSING_CHOICES')).toBe(true);
    });
  });
  describe('GraphParser Integration', () => {
  test('should parse complete valid graph', async () => {
  const content = `version: 1.0.0;;
  metadata:,
  name: "Test Graph",
  description: "Integration test graph",
  author: "test",
  ---NODES---
  greeting_choice:,
  type: WeightedChoice,
  props:,
  choices:,
  - value: "Hello",
  weight: 0.6,
  - value: "Hi",
  weight: 0.4,
  name_var:,
  type: GetVariable,
  props:,
  key: "user_name",
  greeting_concat:,
  type: Concat,
  inputs: [greeting_choice, name_var],
  final_output:,
  type: Output,
  inputs: [greeting_concat],
  ---EDGES---
  greeting_choice -> greeting_concat
  name_var -> greeting_concat
  greeting_concat -> final_output
  ---END---`;
  const result = await parseGraph(content);
  expect(result.success).toBe(true);
  expect(result.graph).toBeTruthy();
  expect(result.graph!.nodes).toHaveLength(4);
  expect(result.errors).toHaveLength(0);
  expect(result.metadata.nodeCount).toBe(4);
  expect(result.metadata.edgeCount).toBe(3);
});
    test('should handle parser errors gracefully', async () => {
  const content = `version: 1.0.0;
  ---NODES---
  invalid_node:,
  type: InvalidType,
  invalid_property: value,
  ---END---`;
  const result = await parseGraph(content);
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors.some(e => e.code === 'INVALID_NODE_TYPE')).toBe(true);
});
    test('should validate graph quickly', async () => {
  const content = `version: 1.0.0;
  ---NODES---
  test:,
  type: Output,
  ---END---`;
  const isValid = await validateGraph(content);
  expect(isValid).toBe(true);
});
    test('should detect invalid format quickly', async () => {
      const content = 'invalid format without proper structure';
      const isValid = await validateGraph(content);
      expect(isValid).toBe(false);
    });
    test('should provide detailed error reporting', async () => {
  const content = `version: 2.0.0;
  ---NODES---
  duplicate:,
  type: Output,
  duplicate:,
  type: Concat,
  ---END---`;
  const parser = new GraphParser();
  const result = await parser.parse(content);
  const report = parser.generateErrorReport(result);
  expect(report).toContain('Parser Error Report');
  expect(report).toContain('UNSUPPORTED_VERSION');
  expect(report).toContain('DUPLICATE_NODE_ID');
});
    test('should handle performance profiling', async () => {
  const content = `version: 1.0.0;
  ---NODES---
  test:,
  type: Output,
  ---END---`;
  const parser = new GraphParser();
  const result = await parser.parseWithProfiling(content);
  expect(result.profiling).toBeDefined();
  expect(result.profiling.lexerTime).toBeGreaterThan(0);
  expect(result.profiling.astTime).toBeGreaterThan(0);
  expect(result.profiling.semanticTime).toBeGreaterThan(0);
  expect(result.profiling.totalTime).toBeGreaterThan(0);
});
    test('should handle tolerateErrors option', async () => {
  const content = `version: 1.0.0;
  ---NODES---
  node1:,
  type: InvalidType,
  node2:,
  type: Output,
  ---END---`;
  const parser = new GraphParser({ )
  tolerateErrors: true,
  maxErrors: 5,
});
      const result = await parser.parse(content);
      // Should still process despite errors
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.metadata.nodeCount).toBe(2);
    });
    test('should parse batch of graphs', async () => {
  const graphs = [;
  'version: 1.0.0\n---NODES---\ntest1:\n  type: Output\n---END---',
  'version: 1.0.0\n---NODES---\ntest2:\n  type: Output\n---END---',
  'invalid graph content'
  ];
  const parser = new GraphParser();
  const results = await parser.parseBatch(graphs);
  expect(results).toHaveLength(3);
  expect(results[0].success).toBe(true);
  expect(results[1].success).toBe(true);
  expect(results[2].success).toBe(false);
});
  });
  describe('Round-trip Compatibility', () => {
  test('should parse serializer output correctly', async () => {
  // This test would use the serializer from Story 12.1
  const serializedContent = `version: 1.0.0;;
  metadata:,
  name: "Round-trip Test",
  author: "test",
  ---NODES---
  choice1:,
  type: WeightedChoice,
  props:,
  choices:,
  - value: "Hello",
  weight: 0.5,
  - value: "Hi",
  weight: 0.5,
  output1:,
  type: Output,
  inputs: ["choice1"],
  ---EDGES---
  choice1 -> output1
  ---END---`;
  const result = await parseGraph(serializedContent);
  expect(result.success).toBe(true);
  expect(result.graph).toBeTruthy();
  expect(result.graph!.nodes).toHaveLength(2);
  const choiceNode = result.graph!.nodes.find(n => n.id === 'choice1');
  expect(choiceNode).toBeTruthy();
  expect(choiceNode!.type).toBe('WeightedChoice');
});
  });
});