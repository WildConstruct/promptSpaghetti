import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { EasterEggManager } from '../EasterEggManager';
import { PlayfulLoadingStates, PlayfulProgressBar } from '../PlayfulLoadingStates';
import { DelightfulIntegration } from '../DelightfulIntegration';
import { useStore } from '@/stores/graphStore';

jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="reactflow-provider">{children}</div>
  )
}));

jest.mock('../UnexpectedAnimations', () => ({
  UnexpectedAnimations: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="unexpected-animations">{children}</div>
  ),
  celebrateNodeClick: jest.fn()
}));

jest.mock('@/stores/graphStore', () => ({
  useStore: jest.fn()
}));

const mockedUseStore = useStore as jest.MockedFunction<typeof useStore>;
const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

let originalVibrate: typeof navigator.vibrate | undefined;

beforeAll(() => {
  originalVibrate = navigator.vibrate;
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: jest.fn()
  });
});

afterAll(() => {
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: originalVibrate
  });
});

beforeEach(() => {
  mockedUseStore.mockReset();
  mockedUseStore.mockReturnValue({ nodes: [], edges: [] });
  localStorage.clear();
  document.body.className = '';
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('EasterEggManager', () => {
  it('activates weird mode on Konami sequence', async () => {
    const onWeirdModeToggle = jest.fn();
    render(<EasterEggManager onWeirdModeToggle={onWeirdModeToggle} />);

    KONAMI_SEQUENCE.forEach(key => {
      fireEvent.keyDown(window, { key });
    });

    await waitFor(() => {
      expect(onWeirdModeToggle).toHaveBeenLastCalledWith(true);
    });
    expect(document.body.classList.contains('weird-mode')).toBe(true);
  });

  it('enables debug mode after long press inside viewport', async () => {
    jest.useFakeTimers();
    const onDebugModeToggle = jest.fn();
    const viewport = document.createElement('div');
    viewport.className = 'react-flow__viewport';
    document.body.appendChild(viewport);

    render(<EasterEggManager onDebugModeToggle={onDebugModeToggle} />);

    fireEvent.mouseDown(viewport);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(onDebugModeToggle).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('🐛 Debug Info')).toBeInTheDocument();

    document.body.removeChild(viewport);
  });

  it('toggles precision mode with Shift key and persists discovery', async () => {
    jest.useFakeTimers();
    const onPrecisionModeToggle = jest.fn();
    const vibrateMock = navigator.vibrate as jest.Mock;
    vibrateMock.mockClear();
    render(<EasterEggManager onPrecisionModeToggle={onPrecisionModeToggle} />);

    fireEvent.keyDown(window, { key: 'Shift' });
    expect(onPrecisionModeToggle).toHaveBeenCalledWith(true);
    expect(document.body.classList.contains('precision-mode')).toBe(true);
    await waitFor(() => {
      expect(vibrateMock).toHaveBeenCalled();
    });

    fireEvent.keyUp(window, { key: 'Shift' });
    expect(onPrecisionModeToggle).toHaveBeenCalledWith(false);
    expect(document.body.classList.contains('precision-mode')).toBe(false);

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('discoveredEasterEggs') || '[]');
      expect(saved).toContain('shift');
    });
  });
});

describe('PlayfulLoadingStates', () => {
  it('renders animated loading message while active and hides when stopped', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    jest.useFakeTimers();

    const { rerender } = render(
      <PlayfulLoadingStates isLoading loadingType="general" />
    );

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(
      screen.getByText(/Doing something magical/i)
    ).toBeInTheDocument();

    rerender(<PlayfulLoadingStates isLoading={false} loadingType="general" />);
    expect(document.querySelector('.playful-loading-container')).toBeNull();

    randomSpy.mockRestore();
  });
});

describe('PlayfulProgressBar', () => {
  it('shows message, percentage and updates width', () => {
    const { rerender } = render(
      <PlayfulProgressBar progress={0} message="Loading magic..." />
    );

    expect(screen.getByText('Loading magic...')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    const initialFill = screen
      .getByText('Loading magic...')
      .parentElement?.nextElementSibling?.firstElementChild as HTMLElement;
    expect(initialFill.style.width).toBe('0%');

    rerender(<PlayfulProgressBar progress={75} message="Loading magic..." />);
    expect(screen.getByText('75%')).toBeInTheDocument();

    const updatedFill = screen
      .getByText('Loading magic...')
      .parentElement?.nextElementSibling?.firstElementChild as HTMLElement;
    expect(updatedFill.style.width).toBe('75%');
  });
});

describe('DelightfulIntegration', () => {
  it('renders children inside ReactFlow provider', () => {
    render(
      <DelightfulIntegration
        enableEasterEggs={false}
        enableAnimations={false}
        enablePlayfulLoading={false}
      >
        <div>Delightful App</div>
      </DelightfulIntegration>
    );

    expect(screen.getByText('Delightful App')).toBeInTheDocument();
    expect(screen.getByTestId('reactflow-provider')).toBeInTheDocument();
  });

  it('unlocks complex graph achievement when node threshold exceeded', async () => {
    mockedUseStore.mockReset();
    mockedUseStore
      .mockReturnValueOnce({ nodes: [], edges: [] })
      .mockReturnValueOnce({
        nodes: Array.from({ length: 11 }, (_, index) => ({ id: `node-${index}` })),
        edges: []
      })
      .mockReturnValue({
        nodes: Array.from({ length: 11 }, (_, index) => ({ id: `node-${index}` })),
        edges: []
      });

    const { rerender } = render(
      <DelightfulIntegration enableEasterEggs={false}>
        <div>App</div>
      </DelightfulIntegration>
    );

    rerender(
      <DelightfulIntegration enableEasterEggs={false}>
        <div>App</div>
      </DelightfulIntegration>
    );

    await waitFor(() => {
      expect(document.querySelector('.achievement-toast')).toBeTruthy();
    });

    const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    expect(unlocked).toContain('complex-graph');
  });
});
