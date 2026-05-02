import React from 'react';
import { jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LaunchScreen } from '../LaunchScreen';
import { quickStartTemplates } from '../../../templates/quickStartTemplates';

jest.mock('@promptscape/core/utils/supabaseClient', () => ({
  getSupabase: jest.fn(() => null)
}));

describe('LaunchScreen quick actions', () => {
  async function renderLaunchScreen() {
    render(<LaunchScreen onLaunch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('prompt-runtime-status')).toHaveTextContent(
        'ready'
      );
    });
  }

  it('launches an empty editor when Blank Canvas is selected', async () => {
    const onLaunch = jest.fn();

    render(<LaunchScreen onLaunch={onLaunch} />);
    await waitFor(() => {
      expect(screen.getByTestId('prompt-runtime-status')).toHaveTextContent(
        'ready'
      );
    });

    jest.useFakeTimers();
    fireEvent.click(screen.getByText('Blank Canvas'));
    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(onLaunch).toHaveBeenCalledWith({ kind: 'empty' });
    jest.useRealTimers();
  });

  it('renders the demo-aligned quick-start templates', async () => {
    await renderLaunchScreen();

    expect(screen.getByText('Character Archetype')).toBeInTheDocument();
    expect(screen.getByText('Indy 500 Crowd Card')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Family')).toBeInTheDocument();
    expect(screen.getByText('Building Family')).toBeInTheDocument();
    expect(screen.getByText('Monster Truck Branching')).toBeInTheDocument();
    expect(screen.getAllByText('Primary Demo')).toHaveLength(3);
    expect(screen.getAllByText('Active Test')).toHaveLength(1);
  });

  it('launches every visible quick action as a template or empty editor', async () => {
    const onLaunch = jest.fn();
    jest.useFakeTimers();

    render(<LaunchScreen onLaunch={onLaunch} />);
    await waitFor(() => {
      expect(screen.getByTestId('prompt-runtime-status')).toHaveTextContent(
        'ready'
      );
    });

    const expectedQuickActions = [
      'character_variation',
      'indy_500_crowd_card',
      'vehicle_family',
      'building_family',
      'branching_family',
      'empty'
    ];

    for (const templateId of expectedQuickActions) {
      fireEvent.click(screen.getByTestId(`quick-action-${templateId}`));
      act(() => {
        jest.advanceTimersByTime(350);
      });

      const lastLaunch = onLaunch.mock.calls.at(-1)?.[0];
      if (templateId === 'empty') {
        expect(lastLaunch).toEqual({ kind: 'empty' });
      } else {
        expect(quickStartTemplates[templateId]).toBeDefined();
        expect(lastLaunch).toEqual({
          kind: 'template',
          graph: {
            nodes: quickStartTemplates[templateId].nodes,
            edges: quickStartTemplates[templateId].edges
          }
        });
      }
    }

    expect(onLaunch).toHaveBeenCalledTimes(expectedQuickActions.length);
    jest.useRealTimers();
  });
});
