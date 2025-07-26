/**
 * Tests for NodeFactory component and utility
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import NodeFactory, { NodeTemplateSelector, useNodeFactory } from '../NodeFactory';
import { panelArchetypeTemplate, NodeTemplate } from '../../data/nodeTemplates';

describe('NodeFactory', () => {
  let factory: NodeFactory;

  beforeEach(() => {
    factory = NodeFactory.getInstance();
  });

  describe('Singleton Pattern', () => {
    test('getInstance should return same instance', () => {
      const factory1 = NodeFactory.getInstance();
      const factory2 = NodeFactory.getInstance();
      expect(factory1).toBe(factory2);
    });
  });

  describe('Template Registration', () => {
    test('should register valid templates', () => {
      const testTemplate: NodeTemplate = {
        id: 'test-template',
        type: 'logic',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Template',
          description: 'Test description',
          category: 'logic',
          options: [
            { label: 'Option 1', value: 'option1', weight: 1 }
          ]
        }
      };

      const result = factory.registerTemplate(testTemplate);
      expect(result).toBe(true);
      expect(factory.getTemplate('test-template')).toEqual(testTemplate);
    });

    test('should reject invalid templates', () => {
      const invalidTemplate = {
        id: 'invalid',
        type: 'invalid-type'
      } as any;

      const result = factory.registerTemplate(invalidTemplate);
      expect(result).toBe(false);
      expect(factory.getTemplate('invalid')).toBeUndefined();
    });
  });

  describe('Node Creation', () => {
    test('should create nodes from templates', () => {
      const node = factory.createNode('archetype-2');
      
      expect(node).toBeDefined();
      expect(node!.id).toMatch(/^archetype-2-\d+$/);
      expect(node!.type).toBe('logic');
      expect(node!.data.label).toBe('Panel Archetype');
    });

    test('should create nodes with custom options', () => {
      const customPosition = { x: 100, y: 200 };
      const customId = 'custom-id';
      const customData = { label: 'Custom Label' };

      const node = factory.createNode('archetype-2', {
        position: customPosition,
        customId,
        overrides: customData
      });

      expect(node).toBeDefined();
      expect(node!.id).toBe(customId);
      expect(node!.position).toEqual(customPosition);
      expect(node!.data.label).toBe('Custom Label');
    });

    test('should return null for nonexistent templates', () => {
      const node = factory.createNode('nonexistent');
      expect(node).toBeNull();
    });
  });

  describe('Template Retrieval', () => {
    test('should get all templates', () => {
      const templates = factory.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.id === 'archetype-2')).toBe(true);
    });

    test('should filter templates by type', () => {
      const logicTemplates = factory.getTemplatesByType('logic');
      const transformTemplates = factory.getTemplatesByType('transform');

      expect(logicTemplates.length).toBeGreaterThan(0);
      expect(transformTemplates.length).toBeGreaterThan(0);
      
      logicTemplates.forEach(template => {
        expect(template.type).toBe('logic');
      });
      
      transformTemplates.forEach(template => {
        expect(template.type).toBe('transform');
      });
    });
  });

  describe('Template Cloning', () => {
    test('should clone templates with new ID', () => {
      const cloned = factory.cloneTemplate('archetype-2', 'cloned-archetype');
      
      expect(cloned).toBeDefined();
      expect(cloned!.id).toBe('cloned-archetype');
      expect(cloned!.data.label).toBe(panelArchetypeTemplate.data.label);
      expect(cloned!.data.options).toEqual(panelArchetypeTemplate.data.options);
      expect(cloned!.data.options).not.toBe(panelArchetypeTemplate.data.options); // Deep copy
    });

    test('should return null for nonexistent template', () => {
      const cloned = factory.cloneTemplate('nonexistent', 'new-id');
      expect(cloned).toBeNull();
    });
  });
});

describe('useNodeFactory Hook', () => {
  test('should provide factory methods', () => {
    const { result } = renderHook(() => useNodeFactory());

    expect(result.current.createNode).toBeInstanceOf(Function);
    expect(result.current.getTemplate).toBeInstanceOf(Function);
    expect(result.current.getAllTemplates).toBeInstanceOf(Function);
    expect(result.current.factory).toBeInstanceOf(NodeFactory);
  });

  test('should create nodes through hook', () => {
    const { result } = renderHook(() => useNodeFactory());

    act(() => {
      const node = result.current.createNode('archetype-2', {
        position: { x: 50, y: 50 }
      });

      expect(node).toBeDefined();
      expect(node!.position).toEqual({ x: 50, y: 50 });
    });
  });

  test('should get templates through hook', () => {
    const { result } = renderHook(() => useNodeFactory());

    act(() => {
      const template = result.current.getTemplate('archetype-2');
      expect(template).toEqual(panelArchetypeTemplate);

      const allTemplates = result.current.getAllTemplates();
      expect(allTemplates.length).toBeGreaterThan(0);
    });
  });
});

describe('NodeTemplateSelector Component', () => {
  test('should render template categories', () => {
    render(<NodeTemplateSelector />);

    expect(screen.getByText('Node Templates')).toBeInTheDocument();
    expect(screen.getByText('Logic Nodes')).toBeInTheDocument();
    expect(screen.getByText('Transform Nodes')).toBeInTheDocument();
  });

  test('should render template buttons', () => {
    render(<NodeTemplateSelector />);

    expect(screen.getByText('Panel Archetype')).toBeInTheDocument();
    expect(screen.getByText('Aesthetic Influence')).toBeInTheDocument();
    expect(screen.getByText('Wear Level')).toBeInTheDocument();
  });

  test('should call onTemplateSelect when template is clicked', () => {
    const onTemplateSelect = jest.fn();
    const onNodeCreate = jest.fn();

    render(
      <NodeTemplateSelector
        onTemplateSelect={onTemplateSelect}
        onNodeCreate={onNodeCreate}
      />
    );

    const templateButton = screen.getByText('Panel Archetype');
    fireEvent.click(templateButton);

    expect(onTemplateSelect).toHaveBeenCalledWith(panelArchetypeTemplate);
    expect(onNodeCreate).toHaveBeenCalled();
  });

  test('should display template information', () => {
    render(<NodeTemplateSelector />);

    expect(screen.getByText('Choose panel type: Cockpit, Bridge Console, Engineering Panel, etc.')).toBeInTheDocument();
    expect(screen.getByText('8 options')).toBeInTheDocument();
  });

  test('should filter templates by availability', () => {
    const limitedTemplates = [panelArchetypeTemplate];
    
    render(<NodeTemplateSelector availableTemplates={limitedTemplates} />);

    expect(screen.getByText('Panel Archetype')).toBeInTheDocument();
    expect(screen.queryByText('Aesthetic Influence')).not.toBeInTheDocument();
  });
});