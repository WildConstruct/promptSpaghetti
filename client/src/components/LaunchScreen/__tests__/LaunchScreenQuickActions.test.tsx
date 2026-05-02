import React from 'react';
import { jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LaunchScreen } from '../LaunchScreen';

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
    expect(screen.getByText('Vehicle Family')).toBeInTheDocument();
    expect(screen.getByText('Building Family')).toBeInTheDocument();
    expect(screen.getByText('Monster Truck Branching')).toBeInTheDocument();
    expect(screen.getAllByText('Primary Demo')).toHaveLength(3);
  });
});
