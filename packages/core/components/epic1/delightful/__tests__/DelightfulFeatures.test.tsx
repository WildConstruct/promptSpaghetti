/**
 * Tests for Delightful Features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EasterEggManager } from '../EasterEggManager';
import { PlayfulLoadingStates, PlayfulProgressBar } from '../PlayfulLoadingStates';
import { DelightfulIntegration } from '../DelightfulIntegration';

// Mock React Flow
jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  useReactFlow: () => ({
    getNodes: () => [],
    setNodes: jest.fn(),
    getEdges: () => [],
    setEdges: jest.fn(),
    project: jest.fn(),
  }),
}));

// Mock store
jest.mock('@/stores/graphStore', () => ({
  useStore: () => ({
    nodes: [],
    edges: [],
  }),
}));

// Mock vibrate API
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

describe('EasterEggManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('konami code triggers weird mode', async () => {
    const onWeirdModeToggle = jest.fn();
    render(
      <EasterEggManager
        onWeirdModeToggle={onWeirdModeToggle}
      />
    );

    // Enter Konami code
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];

    for (const key of konamiSequence) {
      fireEvent.keyDown(window, { key });
    }

    await waitFor(() => {
      expect(onWeirdModeToggle).toHaveBeenCalledWith(true);
      expect(document.body.classList.contains('weird-mode')).toBe(true);
    });
  });

  test('long press shows debug mode', async () => {
    const onDebugModeToggle = jest.fn();
    render(
      <div className="react-flow__viewport">
        <EasterEggManager
          onDebugModeToggle={onDebugModeToggle}
        />
      </div>
    );

    const viewport = screen.getByClassName('react-flow__viewport');
    
    // Simulate long press
    fireEvent.mouseDown(viewport);

    // Wait for long press duration
    await waitFor(() => {
      expect(onDebugModeToggle).toHaveBeenCalledWith(true);
    }, { timeout: 1500 });

    // Should show debug info
    expect(screen.getByText('🐛 Debug Info')).toBeInTheDocument();
  });

  test('triple click activates expert mode', async () => {
    const onExpertModeToggle = jest.fn();
    render(
      <div className="react-flow__viewport">
        <EasterEggManager
          onExpertModeToggle={onExpertModeToggle}
        />
      </div>
    );

    const viewport = screen.getByClassName('react-flow__viewport');
    
    // Triple click
    fireEvent.click(viewport);
    fireEvent.click(viewport);
    fireEvent.click(viewport);

    await waitFor(() => {
      expect(onExpertModeToggle).toHaveBeenCalledWith(true);
    });
  });

  test('shift key toggles precision mode', () => {
    const onPrecisionModeToggle = jest.fn();
    render(
      <EasterEggManager
        onPrecisionModeToggle={onPrecisionModeToggle}
      />
    );

    // Press shift
    fireEvent.keyDown(window, { key: 'Shift' });
    expect(onPrecisionModeToggle).toHaveBeenCalledWith(true);
    expect(document.body.classList.contains('precision-mode')).toBe(true);

    // Release shift
    fireEvent.keyUp(window, { key: 'Shift' });
    expect(onPrecisionModeToggle).toHaveBeenCalledWith(false);
    expect(document.body.classList.contains('precision-mode')).toBe(false);
  });

  test('discovered eggs are saved to localStorage', async () => {
    render(<EasterEggManager />);

    // Trigger Konami code
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];

    for (const key of konamiSequence) {
      fireEvent.keyDown(window, { key });
    }

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('discoveredEasterEggs') || '[]');
      expect(saved).toContain('konami');
    });
  });
});

describe('PlayfulLoadingStates', () => {
  test('shows loading message with emoji', () => {
    render(
      <PlayfulLoadingStates
        isLoading={true}
        loadingType="graph"
      />
    );

    // Should show one of the graph loading messages
    const container = screen.getByClassName('playful-loading-container');
    expect(container).toBeInTheDocument();
    
    // Should have emoji and message
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  test('cycles through messages', async () => {
    const { rerender } = render(
      <PlayfulLoadingStates
        isLoading={true}
        loadingType="preview"
      />
    );

    const firstMessage = screen.getByClassName('playful-loading-container').textContent;

    // Wait for message to change
    await waitFor(() => {
      const currentMessage = screen.getByClassName('playful-loading-container').textContent;
      expect(currentMessage).not.toBe(firstMessage);
    }, { timeout: 4000 });
  });

  test('hides when not loading', () => {
    const { rerender } = render(
      <PlayfulLoadingStates
        isLoading={false}
        loadingType="save"
      />
    );

    expect(screen.queryByClassName('playful-loading-container')).not.toBeInTheDocument();
  });
});

describe('PlayfulProgressBar', () => {
  test('shows progress percentage', () => {
    render(
      <PlayfulProgressBar
        progress={45}
        message="Loading magic..."
      />
    );

    expect(screen.getByText('Loading magic...')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  test('progress bar fills correctly', () => {
    const { rerender } = render(
      <PlayfulProgressBar
        progress={0}
      />
    );

    const progressBar = screen.getByStyle({ width: '0%' });
    expect(progressBar).toBeInTheDocument();

    rerender(<PlayfulProgressBar progress={75} />);
    
    const updatedBar = screen.getByStyle({ width: '75%' });
    expect(updatedBar).toBeInTheDocument();
  });

  test('can hide percentage', () => {
    render(
      <PlayfulProgressBar
        progress={50}
        showPercentage={false}
      />
    );

    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});

describe('DelightfulIntegration', () => {
  test('integrates all delightful features', () => {
    render(
      <DelightfulIntegration>
        <div>Test App</div>
      </DelightfulIntegration>
    );

    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  test('can disable features individually', () => {
    render(
      <DelightfulIntegration
        enableEasterEggs={false}
        enableAnimations={false}
        enablePlayfulLoading={false}
      >
        <div>Test App</div>
      </DelightfulIntegration>
    );

    // Should still render children
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  test('unlocks achievements', async () => {
    const { rerender } = render(
      <DelightfulIntegration>
        <div>Test App</div>
      </DelightfulIntegration>
    );

    // Mock nodes and edges to trigger achievement
    jest.mocked(require('@/stores/graphStore').useStore).mockReturnValue({
      nodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
      edges: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }],
    });

    rerender(
      <DelightfulIntegration>
        <div>Test App</div>
      </DelightfulIntegration>
    );

    // Should unlock triangle achievement
    await waitFor(() => {
      const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
      expect(unlocked).toContain('triangle');
    });
  });

  test('shows achievement toast', async () => {
    render(
      <DelightfulIntegration>
        <div>Test App</div>
      </DelightfulIntegration>
    );

    // Trigger an achievement
    jest.mocked(require('@/stores/graphStore').useStore).mockReturnValue({
      nodes: Array(11).fill({}).map((_, i) => ({ id: `node-${i}` })),
      edges: [],
    });

    await waitFor(() => {
      const toast = document.querySelector('.achievement-toast');
      expect(toast).toBeInTheDocument();
      expect(toast?.textContent).toContain('Achievement Unlocked!');
    });
  });
});

// Helper to get element by partial style
function screen.getByStyle(styles: Record<string, string>) {
  const elements = document.querySelectorAll('*');
  for (const element of elements) {
    const elementStyles = (element as HTMLElement).style;
    let matches = true;
    
    for (const [prop, value] of Object.entries(styles)) {
      if (elementStyles.getPropertyValue(prop) !== value) {
        matches = false;
        break;
      }
    }
    
    if (matches) return element;
  }
  
  throw new Error(`No element found with styles: ${JSON.stringify(styles)}`);
}

// Helper to get by class name
function screen.getByClassName(className: string) {
  const element = document.querySelector(`.${className}`);
  if (!element) throw new Error(`No element found with class: ${className}`);
  return element;
}