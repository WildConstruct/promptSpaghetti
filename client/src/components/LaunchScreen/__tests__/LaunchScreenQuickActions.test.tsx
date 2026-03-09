import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LaunchScreen } from '../LaunchScreen';

jest.mock('@promptscape/core/utils/supabaseClient', () => ({
  getSupabase: jest.fn(() => null)
}));

describe('LaunchScreen quick actions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('launches an empty editor when Blank Canvas is selected', () => {
    const onLaunch = jest.fn();

    render(<LaunchScreen onLaunch={onLaunch} />);

    fireEvent.click(screen.getByText('Blank Canvas'));
    jest.advanceTimersByTime(350);

    expect(onLaunch).toHaveBeenCalledWith({ kind: 'empty' });
  });

  it('renders the demo-aligned quick-start templates', () => {
    render(<LaunchScreen onLaunch={jest.fn()} />);

    expect(screen.getByText('Character Archetype')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Family')).toBeInTheDocument();
    expect(screen.getByText('Building Family')).toBeInTheDocument();
    expect(screen.getByText('Archetype')).toBeInTheDocument();
  });
});
