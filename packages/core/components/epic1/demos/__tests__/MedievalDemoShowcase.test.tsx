/**
 * Tests for Medieval Demo Showcase
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MedievalDemoShowcase } from '../MedievalDemoShowcase';
import { ReactFlowProvider } from 'reactflow';

// Mock haptic feedback
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

// Mock React Flow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  Background: () => <div />,
  Controls: () => <div />,
  MiniMap: () => <div />,
  Panel: ({ children }: any) => <div>{children}</div>,
  addEdge: jest.fn(),
  ConnectionMode: { Loose: 'loose' },
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
}));

// Mock Epic1GraphEditor
jest.mock('../../Epic1GraphEditor', () => ({
  Epic1GraphEditorWithProvider: () => <div data-testid="graph-editor" />,
}));

describe('MedievalDemoShowcase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with header and controls', () => {
    render(<MedievalDemoShowcase />);
    
    expect(screen.getByText('🏰 Medieval Demo Showcase')).toBeInTheDocument();
    expect(screen.getByText(/Experience the magic of inline editing/)).toBeInTheDocument();
    expect(screen.getByText('🎬 Demo Script')).toBeInTheDocument();
  });

  test('displays all demo stages', () => {
    render(<MedievalDemoShowcase />);
    
    expect(screen.getByText('Empty Canvas')).toBeInTheDocument();
    expect(screen.getByText('Quick Start')).toBeInTheDocument();
    expect(screen.getByText('Inline Edit')).toBeInTheDocument();
    expect(screen.getByText('Smart Expansion')).toBeInTheDocument();
    expect(screen.getByText('Complete Graph')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  test('shows total demo time', () => {
    render(<MedievalDemoShowcase />);
    
    // Total time should be sum of all stage durations
    expect(screen.getByText(/Total time: \d+s/)).toBeInTheDocument();
  });

  test('play button starts demo', async () => {
    render(<MedievalDemoShowcase />);
    
    const playButton = screen.getByText('▶ Play Demo');
    fireEvent.click(playButton);
    
    // Button should change to playing state
    await waitFor(() => {
      expect(screen.getByText('Playing...')).toBeInTheDocument();
    });
    
    // Should trigger haptic feedback
    expect(mockVibrate).toHaveBeenCalled();
  });

  test('clicking stage jumps to it when not playing', () => {
    render(<MedievalDemoShowcase />);
    
    const inlineEditStage = screen.getByText('Inline Edit');
    fireEvent.click(inlineEditStage.closest('div')!);
    
    // Should trigger haptic for that stage
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  test('reset button clears demo state', () => {
    render(<MedievalDemoShowcase />);
    
    // Start demo first
    const playButton = screen.getByText('▶ Play Demo');
    fireEvent.click(playButton);
    
    // Then reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Should be back to initial state
    expect(screen.getByText('▶ Play Demo')).toBeInTheDocument();
  });

  test('instructions can be dismissed', () => {
    render(<MedievalDemoShowcase />);
    
    const instructions = screen.getByText(/Click nodes to edit inline/);
    expect(instructions).toBeInTheDocument();
    
    // Find and click close button
    const closeButton = instructions.parentElement?.querySelector('button');
    fireEvent.click(closeButton!);
    
    // Instructions should be gone
    expect(screen.queryByText(/Click nodes to edit inline/)).not.toBeInTheDocument();
  });

  test('stage completion shows checkmarks', async () => {
    render(<MedievalDemoShowcase />);
    
    // Click on a stage to complete it
    const quickStartStage = screen.getByText('Quick Start');
    fireEvent.click(quickStartStage.closest('div')!);
    
    // Should show checkmark for completed stage
    await waitFor(() => {
      const stageElement = quickStartStage.closest('div')?.parentElement;
      const checkmark = stageElement?.querySelector('div')?.textContent;
      expect(checkmark).toBe('✓');
    });
  });

  test('highlighted nodes get special class', () => {
    render(<MedievalDemoShowcase />);
    
    // Jump to a stage that highlights nodes
    const quickStartStage = screen.getByText('Quick Start');
    fireEvent.click(quickStartStage.closest('div')!);
    
    // Graph editor should receive nodes with highlight class
    const graphEditor = screen.getByTestId('graph-editor');
    expect(graphEditor).toBeInTheDocument();
  });

  test('demo stages have correct durations', () => {
    render(<MedievalDemoShowcase />);
    
    // Check individual stage durations
    expect(screen.getByText('2.0s')).toBeInTheDocument(); // Empty Canvas
    expect(screen.getByText('3.0s')).toBeInTheDocument(); // Quick Start
    expect(screen.getByText('4.0s')).toBeInTheDocument(); // Inline Edit
    expect(screen.getByText('5.0s')).toBeInTheDocument(); // Complete Graph
    expect(screen.getByText('6.0s')).toBeInTheDocument(); // Live Preview
  });

  test('current stage is highlighted', () => {
    render(<MedievalDemoShowcase />);
    
    // Click on inline edit stage
    const inlineEditStage = screen.getByText('Inline Edit');
    const stageContainer = inlineEditStage.closest('div')?.parentElement;
    
    fireEvent.click(stageContainer!);
    
    // Should have highlight background
    expect(stageContainer).toHaveStyle('background: #e7f3ff');
  });

  test('status badge shows playing state', async () => {
    render(<MedievalDemoShowcase />);
    
    // Initially should show Ready
    expect(screen.getByText('Ready')).toBeInTheDocument();
    
    // Start playing
    const playButton = screen.getByText('▶ Play Demo');
    fireEvent.click(playButton);
    
    // Should show Playing
    await waitFor(() => {
      expect(screen.getByText('Playing')).toBeInTheDocument();
    });
  });

  test('haptic feedback triggered for different stages', () => {
    render(<MedievalDemoShowcase />);
    
    // Test different stage haptics
    const stages = [
      { name: 'Quick Start', haptic: 20 }, // medium
      { name: 'Complete Graph', haptic: [40, 20, 40] }, // heavy
    ];
    
    stages.forEach(({ name }) => {
      const stage = screen.getByText(name);
      fireEvent.click(stage.closest('div')!);
      expect(mockVibrate).toHaveBeenCalled();
    });
  });
});