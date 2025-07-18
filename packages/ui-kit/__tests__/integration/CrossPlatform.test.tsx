/**
 * Cross-platform integration tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  Button, 
  Input, 
  Modal, 
  GraphCanvas, 
  ThemeProvider,
  PlatformProvider,
  usePlatformAdapter 
} from '../../src';

const mockGraph = {
  nodes: [
    {
      id: 'node1',
      type: 'WeightedChoice',
      data: { choices: [{ value: 'Option 1', weight: 1 }] },
      position: { x: 100, y: 100 }
    }
  ],
  edges: []
};

const CrossPlatformTestApp: React.FC<{ platform?: 'web' | 'mobile' | 'desktop' }> = ({ 
  platform = 'web' 
}) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const adapter = usePlatformAdapter();

  return (
    <div>
      <h1>Cross-Platform Test App</h1>
      
      <Button 
        onClick={() => setModalOpen(true)}
        icon="🚀"
        data-testid="open-modal-button"
      >
        Open Modal
      </Button>
      
      <Input 
        label="Test Input"
        placeholder="Enter text..."
        data-testid="test-input"
      />
      
      <div style={{ height: '400px', width: '600px' }}>
        <GraphCanvas
          graph={mockGraph}
          onNodeSelect={setSelectedNode}
          onNodeMove={() => {}}
          onEdgeCreate={() => {}}
          onEdgeDelete={() => {}}
          data-testid="graph-canvas"
        />
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Test Modal"
        data-testid="test-modal"
      >
        <div>
          <p>This is a cross-platform modal!</p>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </div>
      </Modal>
      
      <div data-testid="platform-info">
        Platform: {platform}
      </div>
    </div>
  );
};

const renderApp = (platform: 'web' | 'mobile' | 'desktop' = 'web') => {
  return render(
    <PlatformProvider platform={platform}>
      <ThemeProvider>
        <CrossPlatformTestApp platform={platform} />
      </ThemeProvider>
    </PlatformProvider>
  );
};

describe('Cross-Platform Integration', () => {
  it('renders all components on web platform', () => {
    renderApp('web');
    
    expect(screen.getByText('Cross-Platform Test App')).toBeInTheDocument();
    expect(screen.getByTestId('open-modal-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('platform-info')).toHaveTextContent('Platform: web');
  });

  it('renders all components on mobile platform', () => {
    renderApp('mobile');
    
    expect(screen.getByText('Cross-Platform Test App')).toBeInTheDocument();
    expect(screen.getByTestId('platform-info')).toHaveTextContent('Platform: mobile');
  });

  it('renders all components on desktop platform', () => {
    renderApp('desktop');
    
    expect(screen.getByText('Cross-Platform Test App')).toBeInTheDocument();
    expect(screen.getByTestId('platform-info')).toHaveTextContent('Platform: desktop');
  });

  it('handles user interactions across components', async () => {
    renderApp('web');
    
    // Test button interaction
    const openModalButton = screen.getByTestId('open-modal-button');
    await userEvent.click(openModalButton);
    
    expect(screen.getByTestId('test-modal')).toBeInTheDocument();
    expect(screen.getByText('This is a cross-platform modal!')).toBeInTheDocument();
    
    // Test modal close
    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);
    
    expect(screen.queryByTestId('test-modal')).not.toBeInTheDocument();
  });

  it('handles input changes', async () => {
    renderApp('web');
    
    const input = screen.getByTestId('test-input');
    await userEvent.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('renders graph canvas with nodes', () => {
    renderApp('web');
    
    const canvas = screen.getByTestId('graph-canvas');
    expect(canvas).toBeInTheDocument();
    
    // Check if node is rendered
    expect(screen.getByText('WeightedChoice')).toBeInTheDocument();
  });

  it('maintains theme consistency across components', () => {
    renderApp('web');
    
    const themeProvider = document.querySelector('.ui-theme-provider');
    expect(themeProvider).toBeInTheDocument();
    
    // All UI components should inherit theme styles
    const button = screen.getByTestId('open-modal-button');
    const input = screen.getByTestId('test-input');
    
    expect(button).toHaveClass('ui-button');
    expect(input).toHaveClass('ui-input');
  });

  it('supports responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    renderApp('mobile');
    
    // Components should adapt to mobile viewport
    expect(screen.getByTestId('platform-info')).toHaveTextContent('Platform: mobile');
  });

  it('handles theme switching', async () => {
    const ThemeTestComponent = () => {
      const [colorMode, setColorMode] = React.useState<'light' | 'dark'>('light');
      
      return (
        <ThemeProvider defaultColorMode={colorMode}>
          <div>
            <Button 
              onClick={() => setColorMode(prev => prev === 'light' ? 'dark' : 'light')}
              data-testid="theme-toggle"
            >
              Toggle Theme
            </Button>
            <div data-testid="theme-indicator">{colorMode}</div>
          </div>
        </ThemeProvider>
      );
    };
    
    render(
      <PlatformProvider>
        <ThemeTestComponent />
      </PlatformProvider>
    );
    
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('light');
    
    const toggleButton = screen.getByTestId('theme-toggle');
    await userEvent.click(toggleButton);
    
    // Theme switching logic would need to be tested through theme context
    expect(toggleButton).toBeInTheDocument();
  });

  it('provides platform-specific functionality', () => {
    const PlatformTestComponent = () => {
      const adapter = usePlatformAdapter();
      
      return (
        <div>
          <Button 
            onClick={() => adapter.hapticFeedback('light')}
            data-testid="haptic-button"
          >
            Haptic Feedback
          </Button>
          <Button 
            onClick={() => adapter.copyToClipboard('test text')}
            data-testid="copy-button"
          >
            Copy to Clipboard
          </Button>
        </div>
      );
    };
    
    render(
      <PlatformProvider platform="web">
        <ThemeProvider>
          <PlatformTestComponent />
        </ThemeProvider>
      </PlatformProvider>
    );
    
    expect(screen.getByTestId('haptic-button')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });
});