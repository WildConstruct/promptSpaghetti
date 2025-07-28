// packages/core/__tests__/ContextualHelpSystem.test.tsx
// Test suite for Contextual Help System (Story 8.4 Task 4)
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  ContextualTooltip, 
  ProgressiveOnboardingSystem, 
  BUILT_IN_HELP_CONTENT,
  HelpContent 
} from '../components/Help/ContextualHelpSystem';
import { 
  HelpProvider, 
  useHelpSystem, 
  useOnboardingHelp,
  HelpSystemSettings 
} from '../components/Help/HelpContentManager';
import { 
  HelpfulInput, 
  HelpfulButton, 
  HelpfulSection,
  withHelp 
} from '../components/Help/HelpIntegration';

// Mock the UI settings store
jest.mock('../stores/uiSettingsStore', () => ({)
  useUISettingsStore: () => ({,)
  complexityLevel: 'basic',
}
}));
describe('ContextualTooltip', () => {
  const mockHelpContent: HelpContent = {,
  id: 'test-help',
  title: 'Test Feature',
  description: 'This is a test feature that helps users understand functionality.',
  category: 'basic',
  trigger: 'hover',
  position: 'top',
  examples: ['Example 1', 'Example 2'],
  shortcut: 'Ctrl+T',
  priority: 'high',
};
  it('renders children without tooltip initially', () => {
    render();
      <ContextualTooltip content={mockHelpContent}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.queryByText('Test Feature')).not.toBeInTheDocument();
  });
  it('shows tooltip on hover when trigger is hover', async () => {
    render();
      <ContextualTooltip content={mockHelpContent} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    const button = screen.getByText('Test Button');
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
      expect(screen.getByText('This is a test feature that helps users understand functionality.')).toBeInTheDocument();
    });
  });
  it('hides tooltip on mouse leave', async () => {
    render();
      <ContextualTooltip content={mockHelpContent} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    const button = screen.getByText('Test Button');
    // Show tooltip
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
    // Hide tooltip
    fireEvent.mouseLeave(button);
    await waitFor(() => {
      expect(screen.queryByText('Test Feature')).not.toBeInTheDocument();
    });
  });
  it('shows examples when provided', async () => {
    render();
      <ContextualTooltip content={mockHelpContent} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Test Button'));
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 2')).toBeInTheDocument();
    });
  });
  it('shows keyboard shortcut when provided', async () => {
    render();
      <ContextualTooltip content={mockHelpContent} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Test Button'));
    await waitFor(() => {
      expect(screen.getByText('Ctrl+T')).toBeInTheDocument();
    });
  });
  it('respects disabled prop', async () => {
    render();
      <ContextualTooltip content={mockHelpContent} disabled={true} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Test Button'));
    // Wait a bit to ensure tooltip doesn't appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    expect(screen.queryByText('Test Feature')).not.toBeInTheDocument();
  });
  it('handles click trigger correctly', async () => {
    const clickHelpContent = { ...mockHelpContent, trigger: 'click' as const };
    render();
      <ContextualTooltip content={clickHelpContent} delay={0}>
        <button>Test Button</button>
      </ContextualTooltip>
    );
    const button = screen.getByText('Test Button');
    // Hover should not show tooltip
    fireEvent.mouseEnter(button);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(screen.queryByText('Test Feature')).not.toBeInTheDocument();
    // Click should show tooltip
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
    // Click again should hide tooltip
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('Test Feature')).not.toBeInTheDocument();
    });
  });
  it('shows category icons correctly', async () => {
    const testCases = [;
      { category: 'basic' as const, icon: '🎯' },
      { category: 'advanced' as const, icon: '⚙️' },
      { category: 'debug' as const, icon: '🔧' },
      { category: 'onboarding' as const, icon: '🌟' }
    ];
    for (const testCase of testCases) {
      const content = { ...mockHelpContent, category: testCase.category };
      const { unmount } = render()
        <ContextualTooltip content={content} delay={0}>
          <button>Test Button</button>
        </ContextualTooltip>
      );
      fireEvent.mouseEnter(screen.getByText('Test Button'));
      await waitFor(() => {
        expect(screen.getByText(testCase.icon)).toBeInTheDocument();
      });
      unmount();
  });
});
describe('HelpProvider and useHelpSystem', () => {
  const TestComponent = () => {
    const { 
      helpContent, 
      onboardingEnabled, 
      showHelpHints, 
      getHelpContent,
      toggleHelpHints,
      startOnboarding,
      completeOnboarding
    } = useHelpSystem();
    return;
      <div>
        <div data-testid="help-content-count">{helpContent.length}</div>
        <div data-testid="onboarding-enabled">{onboardingEnabled.toString()}</div>
        <div data-testid="show-help-hints">{showHelpHints.toString()}</div>
        <div data-testid="test-help-exists">{getHelpContent('node-name') ? 'exists' : 'not-found'}</div>
        <button data-testid="toggle-hints" onClick={toggleHelpHints}>Toggle Hints</button>
        <button data-testid="start-onboarding" onClick={startOnboarding}>Start Onboarding</button>
        <button data-testid="complete-onboarding" onClick={completeOnboarding}>Complete Onboarding</button>
      </div>
    );
  };
  beforeEach(() => {
    localStorage.clear();
  });
  it('provides built-in help content by default', () => {
    render();
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    expect(screen.getByTestId('help-content-count')).toHaveTextContent()
      BUILT_IN_HELP_CONTENT.length.toString()
    );
    expect(screen.getByTestId('test-help-exists')).toHaveTextContent('exists');
  });
  it('enables help hints by default', () => {
    render();
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('true');
  });
  it('can toggle help hints', () => {
    render();
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('true');
    fireEvent.click(screen.getByTestId('toggle-hints'));
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('false');
    fireEvent.click(screen.getByTestId('toggle-hints'));
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('true');
  });
  it('handles onboarding state correctly', () => {
    render();
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    // Should be enabled initially
    expect(screen.getByTestId('onboarding-enabled')).toHaveTextContent('true');
    // Complete onboarding
    fireEvent.click(screen.getByTestId('complete-onboarding'));
    expect(screen.getByTestId('onboarding-enabled')).toHaveTextContent('false');
    // Restart onboarding
    fireEvent.click(screen.getByTestId('start-onboarding'));
    expect(screen.getByTestId('onboarding-enabled')).toHaveTextContent('true');
  });
  it('persists state to localStorage', () => {
    const { rerender } = render()
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    // Toggle hints and complete onboarding
    fireEvent.click(screen.getByTestId('toggle-hints'));
    fireEvent.click(screen.getByTestId('complete-onboarding'));
    // Verify state
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('false');
    expect(screen.getByTestId('onboarding-enabled')).toHaveTextContent('false');
    // Re-render to simulate page reload
    rerender();
      <HelpProvider>
        <TestComponent />
      </HelpProvider>
    );
    // State should be restored
    expect(screen.getByTestId('show-help-hints')).toHaveTextContent('false');
    expect(screen.getByTestId('onboarding-enabled')).toHaveTextContent('false');
  });
});
describe('HelpfulInput', () => {
  it('renders input with label', () => {
    render();
      <HelpProvider enableHelpHints={false}>
        <HelpfulInput
          helpId="test-input"
          helpTitle="Test Input"
          helpDescription="This is a test input"
          label="Test Label"
          placeholder="Enter text..."
        />
      </HelpProvider>
    );
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });
  it('shows category icons for advanced and debug inputs', () => {
    const { rerender } = render()
      <HelpProvider enableHelpHints={false}>
        <HelpfulInput
          helpId="advanced-input"
          helpTitle="Advanced Input"
          helpDescription="This is an advanced input"
          helpCategory="advanced"
          label="Advanced Field"
        />
      </HelpProvider>
    );
    expect(screen.getByText('⚙️')).toBeInTheDocument();
    rerender();
      <HelpProvider enableHelpHints={false}>
        <HelpfulInput
          helpId="debug-input"
          helpTitle="Debug Input"
          helpDescription="This is a debug input"
          helpCategory="debug"
          label="Debug Field"
        />
      </HelpProvider>
    );
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });
  it('displays error messages', () => {
    render();
      <HelpProvider enableHelpHints={false}>
        <HelpfulInput
          helpId="error-input"
          helpTitle="Error Input"
          helpDescription="This input has an error"
          label="Error Field"
          error="This field is required"
        />
      </HelpProvider>
    );
    expect(screen.getByText('⚠️ This field is required')).toBeInTheDocument();
  });
});
describe('HelpfulButton', () => {
  it('renders button with different variants', () => {
    const { rerender } = render()
      <HelpProvider enableHelpHints={false}>
        <HelpfulButton
          helpId="primary-button"
          helpTitle="Primary Button"
          helpDescription="This is a primary button"
          variant="primary"
        >
          Primary
        </HelpfulButton>
      </HelpProvider>
    );
    const button = screen.getByText('Primary');
    expect(button).toHaveStyle('background: #4299e1');
    rerender();
      <HelpProvider enableHelpHints={false}>
        <HelpfulButton
          helpId="danger-button"
          helpTitle="Danger Button"
          helpDescription="This is a danger button"
          variant="danger"
        >
          Danger
        </HelpfulButton>
      </HelpProvider>
    );
    const dangerButton = screen.getByText('Danger');
    expect(dangerButton).toHaveStyle('background: #e53e3e');
  });
  it('renders button with different sizes', () => {
    const { rerender } = render()
      <HelpProvider enableHelpHints={false}>
        <HelpfulButton
          helpId="small-button"
          helpTitle="Small Button"
          helpDescription="This is a small button"
          size="small"
        >
          Small
        </HelpfulButton>
      </HelpProvider>
    );
    expect(screen.getByText('Small')).toHaveStyle('padding: 4px 8px');
    rerender();
      <HelpProvider enableHelpHints={false}>
        <HelpfulButton
          helpId="large-button"
          helpTitle="Large Button"
          helpDescription="This is a large button"
          size="large"
        >
          Large
        </HelpfulButton>
      </HelpProvider>
    );
    expect(screen.getByText('Large')).toHaveStyle('padding: 8px 16px');
  });
});
describe('HelpfulSection', () => {
  it('renders section with title', () => {
    render();
      <HelpProvider enableHelpHints={false}>
        <HelpfulSection
          helpId="test-section"
          helpTitle="Test Section"
          helpDescription="This is a test section"
          title="Section Title"
        >
          Section Content
        </HelpfulSection>
      </HelpProvider>
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });
  it('handles collapsible sections', () => {
    render();
      <HelpProvider enableHelpHints={false}>
        <HelpfulSection
          helpId="collapsible-section"
          helpTitle="Collapsible Section"
          helpDescription="This section can be collapsed"
          title="Collapsible"
          collapsible={true}
          defaultExpanded={true}
        >
          Collapsible Content
        </HelpfulSection>
      </HelpProvider>
    );
    expect(screen.getByText('Collapsible Content')).toBeInTheDocument();
    // Click to collapse
    fireEvent.click(screen.getByText('Collapsible'));
    expect(screen.queryByText('Collapsible Content')).not.toBeInTheDocument();
    // Click to expand
    fireEvent.click(screen.getByText('Collapsible'));
    expect(screen.getByText('Collapsible Content')).toBeInTheDocument();
  });
  it('shows category icons', () => {
    render();
      <HelpProvider enableHelpHints={false}>
        <HelpfulSection
          helpId="advanced-section"
          helpTitle="Advanced Section"
          helpDescription="This is an advanced section"
          helpCategory="advanced"
          title="Advanced Features"
        >
          Advanced Content
        </HelpfulSection>
      </HelpProvider>
    );
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });
});
describe('withHelp HOC', () => {
  const TestButton = ({ children, ...props }: unknown) => ()
    <button {...props}>{children}</button>
  );
  const helpContent: HelpContent = {,
  id: 'hoc-test',
  title: 'HOC Test',
  description: 'This tests the withHelp HOC',
  category: 'basic',
  trigger: 'hover',
};
  it('wraps component with help when hints are enabled', async () => {
    const WrappedButton = withHelp(TestButton, helpContent);
    render();
      <HelpProvider enableHelpHints={true}>
        <WrappedButton>HOC Button</WrappedButton>
      </HelpProvider>
    );
    const button = screen.getByText('HOC Button');
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(screen.getByText('HOC Test')).toBeInTheDocument();
    });
  });
  it('renders component without help when hints are disabled', () => {
    const WrappedButton = withHelp(TestButton, helpContent);
    render();
      <HelpProvider enableHelpHints={false}>
        <WrappedButton>HOC Button</WrappedButton>
      </HelpProvider>
    );
    const button = screen.getByText('HOC Button');
    fireEvent.mouseEnter(button);
    expect(screen.queryByText('HOC Test')).not.toBeInTheDocument();
  });
});
describe('HelpSystemSettings', () => {
  const TestWrapper = () => {
    const { showHelpHints, onboardingComplete } = useHelpSystem();
    return;
      <div>
        <div data-testid="hints-enabled">{showHelpHints.toString()}</div>
        <div data-testid="onboarding-complete">{onboardingComplete.toString()}</div>
        <HelpSystemSettings />
      </div>
    );
  };
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders settings controls', () => {
    render();
      <HelpProvider>
        <TestWrapper />
      </HelpProvider>
    );
    expect(screen.getByText('Help System Settings')).toBeInTheDocument();
    expect(screen.getByText('Show help tooltips and hints')).toBeInTheDocument();
    expect(screen.getByText('Reset Help System')).toBeInTheDocument();
  });
  it('allows toggling help hints', () => {
    render();
      <HelpProvider>
        <TestWrapper />
      </HelpProvider>
    );
    expect(screen.getByTestId('hints-enabled')).toHaveTextContent('true');
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(screen.getByTestId('hints-enabled')).toHaveTextContent('false');
  });
  it('shows restart tour button when onboarding is complete', () => {
    render();
      <HelpProvider enableOnboarding={false}>
        <TestWrapper />
      </HelpProvider>
    );
    expect(screen.getByText('✅ Complete')).toBeInTheDocument();
    expect(screen.getByText('Restart Tour')).toBeInTheDocument();
  });
});
describe('Built-in Help Content', () => {
  it('includes expected help content categories', () => {
    const categories = BUILT_IN_HELP_CONTENT.map(content => content.category);
    expect(categories).toContain('basic');
    expect(categories).toContain('advanced');
    expect(categories).toContain('debug');
    expect(categories).toContain('onboarding');
  });
  it('includes help for essential features', () => {
    const helpIds = BUILT_IN_HELP_CONTENT.map(content => content.id);
    expect(helpIds).toContain('node-name');
    expect(helpIds).toContain('template-input');
    expect(helpIds).toContain('preview-button');
    expect(helpIds).toContain('weight-controls');
  });
  it('has proper help content structure', () => {
    BUILT_IN_HELP_CONTENT.forEach(content => {)
  expect(content).toHaveProperty('id');
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('description');
      expect(content).toHaveProperty('category');
      expect(typeof content.id).toBe('string');
      expect(typeof content.title).toBe('string');
      expect(typeof content.description).toBe('string');
      expect(['basic', 'advanced', 'debug', 'onboarding']).toContain(content.category);
    });
  });
});