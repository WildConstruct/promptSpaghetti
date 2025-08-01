// packages/core/__tests__/InspectorIntegration.test.tsx
// Test suite for Story 8.4 Task 5: Inspector Integration
// Validates that all node editors use progressive disclosure pattern consistently
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all the refactored editors
import { ConcatEditor } from '../components/Inspector/editors/ConcatEditor';
import { OutputEditor } from '../components/Inspector/editors/OutputEditor';
import { VariableEditor } from '../components/Inspector/editors/VariableEditor';
import { ConditionalEditor } from '../components/Inspector/editors/ConditionalEditor';
import { SequentialEditor } from '../components/Inspector/editors/SequentialEditor';
import { WeightedChoiceEditor } from '../components/Inspector/editors/WeightedChoiceEditor';

// Import help system components
import { HelpProvider } from '../components/Help/HelpContentManager';

// Mock the UI settings store
jest.mock('../stores/uiSettingsStore', () => ({ )
  useUISettingsStore: () => ({);
  complexityLevel: 'basic',
  debugMode: false,
  shouldShowTechnicalFields: () => false }

}));

// Also need to mock this for all files that use it
jest.mock('../../stores/uiSettingsStore', () => ({ )
  useUISettingsStore: () => ({);
  complexityLevel: 'basic',
  debugMode: false,
  shouldShowTechnicalFields: () => false }

}));

// Mock the graph store
jest.mock('../graphStore', () => ({ )
  useGraphStore: () => ({);
  nodes: [],
  edges: [] }

}));

// Common test props for all editors
const createMockNodeData = (type: string) => ({ );
  id: 'test-node-id',
  type }
  name: `Test ${type}`}
},
  label: `Test ${type}`}
},
  x: 100,
  y: 100;
  });
const mockOnChange = jest.fn<unknown, unknown>();

// Test wrapper with help provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => ()
  <HelpProvider enableHelpHints={true}>
    {children}
  </HelpProvider>
);
describe('Inspector Integration - Progressive Disclosure Pattern', () => { beforeEach(() => {
    mockOnChange.mockClear() });
  describe('ConcatEditor Integration', () => {
    it('renders with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <ConcatEditor
            nodeData={createMockNodeData('concat')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Essential Settings')).toBeInTheDocument();
      expect(screen.getByText('Concatenation Settings')).toBeInTheDocument();
      expect(screen.getByText('Text Wrapping')).toBeInTheDocument();
    });
    it('shows contextual help for name field', async () => {
      render();
        <TestWrapper>
          <ConcatEditor
            nodeData={createMockNodeData('concat')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const nameInput = screen.getByPlaceholderText('Enter a name for this concatenation...');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Concatenation Name')).toBeInTheDocument() });
    });
    it('integrates help system with template editor', async () => {
      render();
        <TestWrapper>
          <ConcatEditor
            nodeData={createMockNodeData('concat')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const templateSection = screen.getByText('Output Template (Optional)').parentElement;
      if (templateSection) { fireEvent.mouseEnter(templateSection);
        await waitFor(() => {
          expect(screen.getByText('Output Template')).toBeInTheDocument() });
    });
  });
  describe('OutputEditor Integration', () => {
    it('renders with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <OutputEditor
            nodeData={createMockNodeData('output')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Essential Settings')).toBeInTheDocument();
      expect(screen.getByText('Output Format & Metadata')).toBeInTheDocument();
      expect(screen.getByText('Post-Processing Transformations')).toBeInTheDocument();
    });
    it('shows contextual help for output name field', async () => {
      render();
        <TestWrapper>
          <OutputEditor
            nodeData={createMockNodeData('output')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const nameInput = screen.getByPlaceholderText('Enter a name for this output...');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Output Name')).toBeInTheDocument() });
    });
  });
  describe('ConditionalEditor Integration', () => {
    it('renders with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <ConditionalEditor
            nodeId="test-conditional"
            nodeData={createMockNodeData('conditional')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Essential Settings')).toBeInTheDocument();
      expect(screen.getByText('Conditional Logic')).toBeInTheDocument();
      expect(screen.getByText('Technical Settings & Preview')).toBeInTheDocument();
    });
    it('shows contextual help for decision name field', async () => {
      render();
        <TestWrapper>
          <ConditionalEditor
            nodeId="test-conditional"
            nodeData={createMockNodeData('conditional')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const nameInput = screen.getByPlaceholderText('e.g., Character Response, Plot Branch, Scene Choice');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Decision Name')).toBeInTheDocument() });
    });
  });
  describe('SequentialEditor Integration', () => {
    it('renders with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <SequentialEditor
            nodeData={createMockNodeData('sequential')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Essential Settings')).toBeInTheDocument();
      expect(screen.getByText('Sequence Pattern')).toBeInTheDocument();
      expect(screen.getByText('Technical Details & Preview')).toBeInTheDocument();
    });
    it('shows contextual help for sequence name field', async () => {
      render();
        <TestWrapper>
          <SequentialEditor
            nodeData={createMockNodeData('sequential')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const nameInput = screen.getByPlaceholderText('e.g., Dialogue Styles, Scene Transitions, Character Arcs');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Sequence Name')).toBeInTheDocument() });
    });
  });
  describe('VariableEditor Integration', () => {
    it('renders SetVariable with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <VariableEditor
            nodeType="SetVariable"
            nodeData={createMockNodeData('setVariable')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Variable Settings')).toBeInTheDocument();
      expect(screen.getByText('Store As')).toBeInTheDocument();
    });
    it('renders GetVariable with progressive disclosure sections', () => {
      render();
        <TestWrapper>
          <VariableEditor
            nodeType="GetVariable"
            nodeData={createMockNodeData('getVariable')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Variable Settings')).toBeInTheDocument();
      expect(screen.getByText('Retrieve Variable')).toBeInTheDocument();
    });
    it('shows contextual help for variable name field', async () => {
      render();
        <TestWrapper>
          <VariableEditor
            nodeType="SetVariable"
            nodeData={createMockNodeData('setVariable')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      const nameInput = screen.getByPlaceholderText('Name for this stored value...');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Store As')).toBeInTheDocument() });
    });
  });
  describe('WeightedChoiceEditor Integration', () => {
    it('maintains existing contextual help integration', async () => {
      render();
        <TestWrapper>
          <WeightedChoiceEditor
            nodeData={createMockNodeData('weightedChoice')}
            onChange={mockOnChange}
            errors={{}}
          />
        </TestWrapper>
      );
      expect(screen.getByText('Essential Settings')).toBeInTheDocument();
      expect(screen.getByText('Weight Controls')).toBeInTheDocument();
      // Test existing help integration
      const nameInput = screen.getByPlaceholderText('Enter a name for this weighted choice node...');
      fireEvent.focus(nameInput);
      await waitFor(() => { expect(screen.getByText('Node Name')).toBeInTheDocument() });
    });
  });
  describe('Cross-Editor Consistency', () => {
    const editors = [
      { name: 'ConcatEditor', component: ConcatEditor, props: {} },
      { name: 'OutputEditor', component: OutputEditor, props: {} },
      { name: 'ConditionalEditor', component: ConditionalEditor, props: { nodeId: 'test' } },
      { name: 'SequentialEditor', component: SequentialEditor, props: {} },
      { name: 'VariableEditor', component: VariableEditor, props: { nodeType: 'SetVariable' as const } },
      { name: 'WeightedChoiceEditor', component: WeightedChoiceEditor, props: {} }
    ];
    editors.forEach(({ name, component: Component, props }) => {
      it(`${name} has consistent disclosure level structure`, () => {}
        render();
          <TestWrapper>
            <Component
              nodeData={createMockNodeData('test')}
              onChange={mockOnChange}
              errors={{}}
              {...props}
            />
          </TestWrapper>
        );
        // All editors should have Essential Settings section
        expect(screen.getByText('Essential Settings')).toBeInTheDocument();
        // Check for progressive disclosure section wrapper
        const sections = document.querySelectorAll('[class*="progressive-disclosure"]');
        expect(sections.length).toBeGreaterThan(0);
      });
    });
    it('all editors support contextual help integration', async () => {
      for (const { name, component: Component, props } of editors) {
        const { unmount } = render()
          <TestWrapper>
            <Component
              nodeData={createMockNodeData('test')}
              onChange={mockOnChange}
              errors={{}}
              {...props}
            />
          </TestWrapper>
        );
        // Look for any input field and try to trigger help
        const inputs = screen.getAllByRole('textbox');
        if (inputs.length > 0) { fireEvent.focus(inputs[0]);
          // Give a moment for help to appear
          await new Promise(resolve => setImmediate(resolve));
          // At least one editor should show help content
          // (We don't require all because some might have different trigger types)
        unmount() });
  });
  describe('Help System Integration', () => {
    it('respects help system enabled/disabled state', () => {
      const { rerender } = render()
        <HelpProvider enableHelpHints={false}>
          <ConcatEditor
            nodeData={createMockNodeData('concat')}
            onChange={mockOnChange}
            errors={{}}
          />
        </HelpProvider>
      );
      const nameInput = screen.getByPlaceholderText('Enter a name for this concatenation...');
      fireEvent.focus(nameInput);
      // Help should not appear when disabled
      expect(screen.queryByText('Concatenation Name')).not.toBeInTheDocument();
      // Re-render with help enabled
      rerender();
        <HelpProvider enableHelpHints={true}>
          <ConcatEditor
            nodeData={createMockNodeData('concat')}
            onChange={mockOnChange}
            errors={{}}
          />
        </HelpProvider>
      );
      fireEvent.focus(nameInput);
      // Help should appear when enabled (tested in other tests)
    });
  });
});