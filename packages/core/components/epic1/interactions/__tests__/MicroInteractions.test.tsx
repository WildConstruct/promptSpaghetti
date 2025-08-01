/**
 * Tests for micro-interactions and haptic feedback
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { MicroInteraction, useMicroInteractions, triggerHaptic } from '../../animations/MicroInteractions';
import { MagneticSnapHandler, useMagneticSnap } from '../MagneticSnapHandler';
import { NodeInteractionEnhancer, useNodeInteractions } from '../NodeInteractionEnhancer';
import { ReactFlowProvider } from 'reactflow';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true
});

// Mock ReactFlow hooks
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useReactFlow: () => ({
    getNodes: () => [
      { id: '1', position: { x: 100, y: 100 }, width: 100, height: 50 },
      { id: '2', position: { x: 300, y: 100 }, width: 100, height: 50 }
    ],
    getNode: (id: string) => ({ 
      id, 
      position: { x: 100, y: 100 }, 
      width: 100, 
      height: 50 
    }),
    addNodes: jest.fn(),
    setNodes: jest.fn(),
  }),
  useStoreApi: () => ({
    getState: () => ({ connectionNodeId: null }),
    subscribe: jest.fn(() => () => {})
  })
}));

describe('MicroInteraction Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hover interaction', () => {
    const { container } = render(
      <MicroInteraction trigger="hover" x={100} y={100} />
    );

    expect(container.querySelector('.micro-hover-ring')).toBeInTheDocument();
    expect(container.querySelector('.micro-hover')).toBeInTheDocument();
  });

  it('renders snap interaction', () => {
    const { container } = render(
      <MicroInteraction trigger="snap" x={200} y={200} />
    );

    expect(container.querySelector('.micro-magnetic-snap')).toBeInTheDocument();
    expect(container.querySelector('.snap-ring')).toBeInTheDocument();
    expect(container.querySelector('.snap-pulse')).toBeInTheDocument();
  });

  it('renders bounce interaction', () => {
    const { container } = render(
      <MicroInteraction trigger="bounce" x={150} y={150} />
    );

    expect(container.querySelector('.micro-node-bounce')).toBeInTheDocument();
    expect(container.querySelector('.bounce-shadow')).toBeInTheDocument();
  });

  it('renders drag trail interaction', () => {
    const { container } = render(
      <MicroInteraction trigger="drag" x={100} y={100} />
    );

    expect(container.querySelector('.micro-drag-trail')).toBeInTheDocument();
    expect(container.querySelectorAll('.trail-dot')).toHaveLength(3);
  });

  it('renders connection pulse interaction', () => {
    const { container } = render(
      <MicroInteraction trigger="connect" x={100} y={100} targetX={200} targetY={200} />
    );

    expect(container.querySelector('.micro-connection-pulse')).toBeInTheDocument();
    expect(container.querySelector('.pulse-path')).toBeInTheDocument();
  });

  it('auto-hides after animation duration', async () => {
    const { container } = render(
      <MicroInteraction trigger="hover" x={100} y={100} />
    );

    expect(container.querySelector('.micro-hover')).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('.micro-hover')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

describe('useMicroInteractions Hook', () => {
  it('manages multiple interactions', () => {
    const { result } = renderHook(() => useMicroInteractions());

    expect(result.current.interactions).toHaveLength(0);

    act(() => {
      result.current.trigger('hover', 100, 100);
      result.current.trigger('click', 200, 200);
    });

    expect(result.current.interactions).toHaveLength(2);
    expect(result.current.interactions[0].type).toBe('hover');
    expect(result.current.interactions[1].type).toBe('click');
  });

  it('triggers haptic feedback when requested', () => {
    const { result } = renderHook(() => useMicroInteractions());

    act(() => {
      result.current.trigger('click', 100, 100, { haptic: 'light' });
    });

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('supports different haptic intensities', () => {
    const { result } = renderHook(() => useMicroInteractions());

    act(() => {
      result.current.trigger('snap', 100, 100, { haptic: 'medium' });
    });
    expect(mockVibrate).toHaveBeenCalledWith(20);

    act(() => {
      result.current.trigger('bounce', 100, 100, { haptic: 'heavy' });
    });
    expect(mockVibrate).toHaveBeenCalledWith([40, 20, 40]);

    act(() => {
      result.current.trigger('error', 100, 100, { haptic: 'error' });
    });
    expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('auto-removes interactions after timeout', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useMicroInteractions());

    act(() => {
      result.current.trigger('hover', 100, 100);
    });

    expect(result.current.interactions).toHaveLength(1);

    await waitFor(() => {
      expect(result.current.interactions).toHaveLength(0);
    }, { timeout: 2000 });

    jest.useFakeTimers();
  });
});

describe('triggerHaptic Function', () => {
  it('triggers light haptic feedback', () => {
    triggerHaptic('light');
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('triggers medium haptic feedback', () => {
    triggerHaptic('medium');
    expect(mockVibrate).toHaveBeenCalledWith(20);
  });

  it('triggers heavy haptic feedback', () => {
    triggerHaptic('heavy');
    expect(mockVibrate).toHaveBeenCalledWith([40, 20, 40]);
  });

  it('triggers error haptic feedback', () => {
    triggerHaptic('error');
    expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('handles missing vibration API gracefully', () => {
    const originalVibrate = navigator.vibrate;
    // @ts-ignore
    delete navigator.vibrate;

    expect(() => triggerHaptic('light')).not.toThrow();

    navigator.vibrate = originalVibrate;
  });
});

describe('useMagneticSnap Hook', () => {
  it('detects snap when within range', () => {
    const onSnap = jest.fn();
    const { result } = renderHook(() => useMagneticSnap({ 
      magnetDistance: 50, 
      onSnap 
    }));

    const nodes = [
      { id: '1', position: { x: 100, y: 100 }, width: 100, height: 50 },
      { id: '2', position: { x: 200, y: 100 }, width: 100, height: 50 }
    ] as any;

    act(() => {
      result.current.checkSnap(245, 125, nodes); // Close to node 2
    });

    expect(result.current.snappedNodeId).toBe('2');
    expect(onSnap).toHaveBeenCalledWith('2');
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('releases snap when out of range', () => {
    const onRelease = jest.fn();
    const { result } = renderHook(() => useMagneticSnap({ 
      magnetDistance: 30, 
      onRelease 
    }));

    const nodes = [
      { id: '1', position: { x: 100, y: 100 }, width: 100, height: 50 }
    ] as any;

    // First snap
    act(() => {
      result.current.checkSnap(145, 125, nodes);
    });
    expect(result.current.snappedNodeId).toBe('1');

    // Then move out of range
    act(() => {
      result.current.checkSnap(300, 300, nodes);
    });
    
    expect(result.current.snappedNodeId).toBeNull();
    expect(onRelease).toHaveBeenCalled();
  });
});

describe('NodeInteractionEnhancer', () => {
  it('triggers bounce animation on mount', async () => {
    const mockTrigger = jest.fn();
    jest.spyOn(require('../../animations/MicroInteractions'), 'useMicroInteractions')
      .mockReturnValue({ trigger: mockTrigger, interactions: [] });

    render(
      <ReactFlowProvider>
        <NodeInteractionEnhancer nodeId="test-node" enableBounce>
          <div>Test Node</div>
        </NodeInteractionEnhancer>
      </ReactFlowProvider>
    );

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        'bounce',
        150, // center x
        125, // center y
        { nodeId: 'test-node', haptic: 'medium' }
      );
    });
  });

  it('shows hover hint on mouse enter', () => {
    const mockTrigger = jest.fn();
    jest.spyOn(require('../../animations/MicroInteractions'), 'useMicroInteractions')
      .mockReturnValue({ trigger: mockTrigger, interactions: [] });

    const { container } = render(
      <ReactFlowProvider>
        <NodeInteractionEnhancer nodeId="test-node" enableHoverEffects>
          <div>Test Node</div>
        </NodeInteractionEnhancer>
      </ReactFlowProvider>
    );

    fireEvent.mouseEnter(container.firstChild as Element);

    expect(mockTrigger).toHaveBeenCalledWith(
      'hover',
      expect.any(Number),
      expect.any(Number),
      { nodeId: 'test-node', haptic: 'light' }
    );

    expect(screen.getByText('Double-click to edit')).toBeInTheDocument();
  });

  it('triggers click feedback', () => {
    const mockTrigger = jest.fn();
    jest.spyOn(require('../../animations/MicroInteractions'), 'useMicroInteractions')
      .mockReturnValue({ trigger: mockTrigger, interactions: [] });

    const { container } = render(
      <ReactFlowProvider>
        <NodeInteractionEnhancer nodeId="test-node" enableClickFeedback>
          <div>Test Node</div>
        </NodeInteractionEnhancer>
      </ReactFlowProvider>
    );

    fireEvent.click(container.firstChild as Element);

    expect(mockTrigger).toHaveBeenCalledWith(
      'click',
      expect.any(Number),
      expect.any(Number),
      { nodeId: 'test-node', haptic: 'light' }
    );
  });

  it('disables haptic when enableHaptic is false', () => {
    const mockTrigger = jest.fn();
    jest.spyOn(require('../../animations/MicroInteractions'), 'useMicroInteractions')
      .mockReturnValue({ trigger: mockTrigger, interactions: [] });

    const { container } = render(
      <ReactFlowProvider>
        <NodeInteractionEnhancer nodeId="test-node" enableClickFeedback enableHaptic={false}>
          <div>Test Node</div>
        </NodeInteractionEnhancer>
      </ReactFlowProvider>
    );

    fireEvent.click(container.firstChild as Element);

    expect(mockTrigger).toHaveBeenCalledWith(
      'click',
      expect.any(Number),
      expect.any(Number),
      { nodeId: 'test-node', haptic: undefined }
    );
  });
});

describe('useNodeInteractions Hook', () => {
  it('adds node with bounce effect', async () => {
    const mockAddNodes = jest.fn();
    const mockTrigger = jest.fn();
    
    jest.spyOn(require('reactflow'), 'useReactFlow').mockReturnValue({
      getNodes: jest.fn(),
      addNodes: mockAddNodes,
      setNodes: jest.fn()
    });
    
    jest.spyOn(require('../../animations/MicroInteractions'), 'useMicroInteractions')
      .mockReturnValue({ trigger: mockTrigger, interactions: [] });

    const { result } = renderHook(() => useNodeInteractions());

    const newNode = {
      id: 'new-node',
      position: { x: 100, y: 100 },
      data: { label: 'New Node' }
    } as any;

    act(() => {
      result.current.addNodeWithBounce(newNode);
    });

    expect(mockAddNodes).toHaveBeenCalledWith(newNode);

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        'bounce',
        150,
        125,
        { nodeId: 'new-node', haptic: 'medium' }
      );
    });
  });
});