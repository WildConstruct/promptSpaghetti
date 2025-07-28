// packages/core/__tests__/InspectorIntegrationSimple.test.tsx
// Simple validation test for Story 8.4 Task 5: Inspector Integration
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all external dependencies upfront
jest.mock('../stores/uiSettingsStore', () => ({)
  useUISettingsStore: () => ({ complexityLevel: 'basic', debugMode: false, shouldShowTechnicalFields: () => false })
}));
jest.mock('../../stores/uiSettingsStore', () => ({)
  useUISettingsStore: () => ({ complexityLevel: 'basic', debugMode: false, shouldShowTechnicalFields: () => false })
}));
jest.mock('../graphStore', () => ({)
  useGraphStore: () => ({ nodes: [], edges: [] })
}));
jest.mock('../hooks/useRealTimePreview', () => ({)
  useRealTimePreview: () => ({,)
  variants: [],
    isGenerating: false,
    performance: { averageExecutionTime: 0, totalGenerations: 0, successRate: 100 },
    error: null,
    requestPreview: jest.fn<unknown, unknown>(),
    forcePreview: jest.fn<unknown, unknown>(),
    refreshVariant: jest.fn<unknown, unknown>(),
    clearVariants: jest.fn<unknown, unknown>(),
    getPerformanceInsights: () => [];
  }
}));
jest.mock('../components/Inspector/WeightControlSlider', () => ({)
  WeightControlSlider: () => <div data-testid="weight-control-slider">Weight Control</div>,
  useWeightControlIntegration: () => ({ handleOptionsChange: jest.fn<unknown, unknown>() })
}));
describe('Inspector Integration - Basic Validation', () => {
  it('can import help system components', () => {
    const { useContextualHelp } = require('../components/Help/HelpIntegration');
    expect(typeof useContextualHelp).toBe('function');
  });
  it('editors export correctly', () => {
    const { ConcatEditor } = require('../components/Inspector/editors/ConcatEditor');
    const { OutputEditor } = require('../components/Inspector/editors/OutputEditor');
    const { ConditionalEditor } = require('../components/Inspector/editors/ConditionalEditor');
    const { SequentialEditor } = require('../components/Inspector/editors/SequentialEditor');
    const { VariableEditor } = require('../components/Inspector/editors/VariableEditor');
    expect(ConcatEditor).toBeDefined();
    expect(OutputEditor).toBeDefined();
    expect(ConditionalEditor).toBeDefined();
    expect(SequentialEditor).toBeDefined();
    expect(VariableEditor).toBeDefined();
  });
  it('help integration is properly imported in editors', () => {
    // Test that the import statements work
    const concatEditorSource = require('fs').readFileSync(;);
      require.resolve('../components/Inspector/editors/ConcatEditor'), 
      'utf8'
    );
    const outputEditorSource = require('fs').readFileSync(;);
      require.resolve('../components/Inspector/editors/OutputEditor'), 
      'utf8'
    );
    expect(concatEditorSource).toMatch(/useContextualHelp/);
    expect(outputEditorSource).toMatch(/useContextualHelp/);
  });
  it('validates basic help hook usage pattern', () => {
    // Mock help provider context for testing hooks
    const { HelpProvider } = require('../components/Help/HelpContentManager');
    const TestComponent = () => {
      const { useContextualHelp } = require('../components/Help/HelpIntegration');
      const { wrapWithHelp } = useContextualHelp({)
  id: 'test-help',
  title: 'Test Help',
  description: 'Test description',
  category: 'basic',
  trigger: 'hover',
});
      return wrapWithHelp(<div>Test Content</div>);
    };
    expect(() => {
      render();
        <HelpProvider>
          <TestComponent />
        </HelpProvider>
      );
    }).not.toThrow();
  });
});