import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';

import { AutosaveIndicator } from '../../components/AutosaveIndicator';
import { useAutosave } from '../../hooks/useAutosave';

jest.mock('../../hooks/useAutosave', () => ({
  useAutosave: jest.fn()
}));

const mockUseAutosave = useAutosave as jest.MockedFunction<typeof useAutosave>;

const createAutosaveState = (
  overrides: Partial<ReturnType<typeof useAutosave>> = {}
) => ({
  status: 'saved' as const,
  lastSaved: new Date('2024-01-01T00:00:00.000Z'),
  error: null,
  conflictDetected: false,
  remoteVersion: null,
  saveNow: jest.fn(),
  acceptRemoteChanges: jest.fn(),
  keepLocalChanges: jest.fn(),
  isEnabled: true,
  ...overrides
});

describe('AutosaveIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:03.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not render when autosave is disabled', () => {
    mockUseAutosave.mockReturnValue(
      createAutosaveState({ isEnabled: false })
    );
    const { container } = render(<AutosaveIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows saved status and updates relative timestamp', () => {
    mockUseAutosave.mockReturnValue(createAutosaveState());
    render(<AutosaveIndicator />);

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByText('(Just now)')).toBeInTheDocument();

    jest.setSystemTime(new Date('2024-01-01T00:02:03.000Z'));
    act(() => {
      jest.advanceTimersByTime(120000);
    });

    expect(
      screen.getByText(/\(\d+ minutes ago\)/)
    ).toBeInTheDocument();
  });

  it('renders error state without timestamp', () => {
    mockUseAutosave.mockReturnValue(
      createAutosaveState({
        status: 'error',
        error: 'Save failed'
      })
    );
    render(<AutosaveIndicator />);

    expect(screen.getByRole('status')).toHaveTextContent('Save failed');
    expect(screen.queryByText(/\)/)).not.toBeInTheDocument();
  });

  it('shows saving and unsaved statuses appropriately', () => {
    mockUseAutosave.mockReturnValue(
      createAutosaveState({
        status: 'saving',
        lastSaved: null
      })
    );
    const { rerender } = render(<AutosaveIndicator />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    mockUseAutosave.mockReturnValue(
      createAutosaveState({
        status: 'unsaved',
        lastSaved: null
      })
    );
    rerender(<AutosaveIndicator />);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('hides timestamp when showTimestamp is false', () => {
    mockUseAutosave.mockReturnValue(createAutosaveState());
    render(<AutosaveIndicator showTimestamp={false} />);
    expect(screen.queryByText('(Just now)')).not.toBeInTheDocument();
  });

  it('renders conflict dialog and wires action handlers', () => {
    const acceptRemoteChanges = jest.fn();
    const keepLocalChanges = jest.fn();
    mockUseAutosave.mockReturnValue(
      createAutosaveState({
        conflictDetected: true,
        remoteVersion: 7,
        acceptRemoteChanges,
        keepLocalChanges
      })
    );

    render(<AutosaveIndicator />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Version conflict: Local v0 vs Remote v7');

    fireEvent.click(screen.getByText('Use Their Changes'));
    fireEvent.click(screen.getByText('Keep My Changes'));

    expect(acceptRemoteChanges).toHaveBeenCalledTimes(1);
    expect(keepLocalChanges).toHaveBeenCalledTimes(1);
  });
});
