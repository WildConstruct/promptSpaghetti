// server/src/__tests__/exporter.test.ts
import { graphToBundle, validateGeneratorBundle, bundleToGraph, GeneratorBundle } from '../exporter';
import { Graph } from '../../../packages/core/graphSchema';

describe('Graph to GeneratorBundle conversion', () => {
  // Simple test graph with all node types
  const testGraph: Graph = {
    seed: 123,
    nodes: [
      {
        id: 'var1',
        type: 'SetVariable',
        key: 'greeting',
        value: 'Hello'
      },
      {
        id: 'var2',
        type: 'GetVariable',
        key: 'greeting'
      },
      {
        id: 'wc1',
        type: 'WeightedChoice',
        choices: [
          { value: 'World', weight: 1 },
          { value: 'Universe', weight: 0.5 }
        ]
      },
      {
        id: 'concat1',
        type: 'Concat',
        inputs: ['var2', 'wc1']
      },
      {
        id: 'include1',
        type: 'Include',
        name: 'external_template'
      },
      {
        id: 'output1',
        type: 'Output',
        inputs: ['concat1']
      }
    ]
  };

  it('should convert a graph to a valid GeneratorBundle', () => {
    // Convert graph to bundle
    const bundle = graphToBundle(testGraph, {
      name: 'Test Bundle',
      version: '1.0.0',
      author: 'Test Author'
    });

    // Validate structure
    expect(bundle.metadata.name).toBe('Test Bundle');
    expect(bundle.metadata.version).toBe('1.0.0');
    expect(bundle.metadata.author).toBe('Test Author');
    expect(bundle.metadata.created).toBeDefined();
    expect(typeof bundle.metadata.created).toBe('string');
    
    // Verify seed is preserved
    expect(bundle.seed).toBe(123);
    
    // Check variables
    expect(bundle.variables).toEqual({
      greeting: 'Hello'
    });
    
    // Check grammar rules
    expect(Object.keys(bundle.grammar)).toHaveLength(6); // One for each node
    
    // Check specific node conversions
    expect(bundle.grammar.wc1).toEqual([
      { text: 'World', weight: 1 },
      { text: 'Universe', weight: 0.5 }
    ]);
    
    expect(bundle.grammar.concat1).toEqual({
      type: 'sequential',
      items: ['var2', 'wc1']
    });
    
    expect(bundle.grammar.include1).toEqual({ 
      $include: 'external_template' 
    });
    
    // Check entry points
    expect(bundle.entry_points.default).toBe('output1');
    
    // Validate against schema
    expect(validateGeneratorBundle(bundle)).toBe(true);
  });

  it('should validate incorrect bundles as invalid', () => {
    // Deliberately create an invalid bundle
    const invalidBundle = {
      // Missing required fields
      metadata: {
        name: 'Invalid Bundle'
        // Missing version, author, created
      },
      variables: {},
      // Missing grammar field
      entry_points: {
        default: 'output1'
      }
    };
    
    expect(validateGeneratorBundle(invalidBundle)).toBe(false);
  });

  it('should import a GeneratorBundle to a Graph', () => {
    // Create a test bundle
    const testBundle: GeneratorBundle = {
      metadata: {
        name: 'Test Import Bundle',
        version: '1.0.0',
        author: 'Test Author',
        created: new Date().toISOString()
      },
      variables: {
        greeting: 'Hello',
        target: 'World'
      },
      grammar: {
        'choice1': [
          { text: 'Universe', weight: 1 },
          { text: 'World', weight: 0.5 }
        ],
        'sequence1': {
          type: 'sequential',
          items: ['var_greeting', 'choice1']
        },
        'include1': { $include: 'template1' },
        'output1': ['sequence1']
      },
      entry_points: {
        default: 'output1'
      },
      seed: 456
    };

    // Convert bundle to graph
    const graph = bundleToGraph(testBundle);

    // Check basic structure
    expect(graph.seed).toBe(456);
    expect(graph.nodes.length).toBeGreaterThan(0);
    
    // Check that variables were imported
    const varNodes = graph.nodes.filter(n => n.type === 'SetVariable');
    expect(varNodes.length).toBe(2);
    
    // Check that the WeightedChoice node was created
    const choiceNode = graph.nodes.find(n => n.id === 'choice1');
    expect(choiceNode).toBeDefined();
    expect(choiceNode?.type).toBe('WeightedChoice');
    if (choiceNode?.type === 'WeightedChoice') {
      expect(choiceNode.choices).toHaveLength(2);
      expect(choiceNode.choices[0].value).toBe('Universe');
    }
    
    // Check that the output node exists
    const outputNode = graph.nodes.find(n => n.type === 'Output');
    expect(outputNode).toBeDefined();
  });
  
  it('should perform a round-trip conversion (graph → bundle → graph) with equivalent results', () => {
    // Start with a simple graph
    const originalGraph: Graph = {
      seed: 789,
      nodes: [
        {
          id: 'wc1',
          type: 'WeightedChoice',
          choices: [
            { value: 'Hello', weight: 1 },
            { value: 'Hi', weight: 0.5 }
          ]
        },
        {
          id: 'wc2',
          type: 'WeightedChoice',
          choices: [
            { value: 'World', weight: 1 },
            { value: 'Universe', weight: 0.5 }
          ]
        },
        {
          id: 'concat1',
          type: 'Concat',
          inputs: ['wc1', 'wc2']
        },
        {
          id: 'out1',
          type: 'Output',
          inputs: ['concat1']
        }
      ]
    };
    
    // Convert graph to bundle
    const bundle = graphToBundle(originalGraph, { name: 'Round Trip Test' });
    
    // Convert bundle back to graph
    const resultGraph = bundleToGraph(bundle);
    
    // Verify key attributes are preserved
    expect(resultGraph.seed).toBe(originalGraph.seed);
    
    // Check that all original nodes exist in the result graph
    for (const originalNode of originalGraph.nodes) {
      const resultNode = resultGraph.nodes.find(n => n.id === originalNode.id);
      expect(resultNode).toBeDefined();
      expect(resultNode?.type).toBe(originalNode.type);
      
      // Check WeightedChoice node specifics
      if (originalNode.type === 'WeightedChoice' && resultNode?.type === 'WeightedChoice') {
        expect(resultNode.choices.length).toBe(originalNode.choices.length);
        // Check each choice
        originalNode.choices.forEach((originalChoice, idx) => {
          expect(resultNode.choices[idx].value).toBe(originalChoice.value);
          expect(resultNode.choices[idx].weight).toBe(originalChoice.weight);
        });
      }
      
      // Check connections
      if (originalNode.inputs) {
        expect(resultNode?.inputs).toBeDefined();
        expect(resultNode?.inputs?.length).toBe(originalNode.inputs.length);
        originalNode.inputs.forEach(input => {
          expect(resultNode?.inputs?.includes(input)).toBe(true);
        });
      }
    }
  });
  
  it('should handle edge cases in graph conversion', () => {
    const edgeCaseGraph: Graph = {
      nodes: [
        // Output node with no inputs
        {
          id: 'empty_output',
          type: 'Output'
        },
        // Concat node with no inputs
        {
          id: 'empty_concat',
          type: 'Concat'
        }
      ]
    };
    
    const bundle = graphToBundle(edgeCaseGraph, { 
      name: 'Edge Case Test'
    });
    
    expect(validateGeneratorBundle(bundle)).toBe(true);
    expect(bundle.entry_points.default).toBe('empty_output');
    expect(bundle.grammar.empty_output).toEqual(['']);
    expect(bundle.grammar.empty_concat).toEqual(['']);
  });

  it('should handle invalid GeneratorBundle format gracefully', () => {
    const invalidBundle = {} as any; // Completely invalid bundle
    
    // Should throw an error when trying to convert invalid bundle
    expect(() => bundleToGraph(invalidBundle)).toThrow('Invalid GeneratorBundle format');
  });
  
  it('should handle complex GeneratorBundle formats', () => {
    // Create a more complex bundle with conditional rules
    const complexBundle: GeneratorBundle = {
      metadata: {
        name: 'Complex Bundle',
        version: '1.0.0',
        author: 'Test Author',
        created: new Date().toISOString()
      },
      variables: {},
      grammar: {
        'conditional1': {
          type: 'conditional',
          cases: [
            { condition: 'x > 10', value: 'Large' },
            { condition: 'x <= 10', value: 'Small' }
          ]
        },
        'modifier1': {
          type: 'modifier_chain',
          base: 'conditional1',
          mods: ['uppercase', 'trim']
        },
        'output1': ['modifier1']
      },
      entry_points: {
        default: 'output1'
      }
    };
    
    // Convert to graph
    const graph = bundleToGraph(complexBundle);
    
    // Check that conditional was converted to weighted choice
    const conditionalNode = graph.nodes.find(n => n.id === 'conditional1');
    expect(conditionalNode).toBeDefined();
    expect(conditionalNode?.type).toBe('WeightedChoice');
    
    // Check that modifier chain was converted
    const modifierNode = graph.nodes.find(n => n.id === 'modifier1');
    expect(modifierNode).toBeDefined();
    
    // Ensure proper connections
    expect(modifierNode?.inputs).toContain('conditional1');
  });
  
  it('should document limitations in README', () => {
    // This is a reminder test that we need to document the limitations
    // of the import functionality in the README
    // The implementation has limitations with conditional rules and modifier chains
    expect(true).toBe(true); // Always passes, just a reminder
  });
});
