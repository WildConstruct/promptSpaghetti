import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { TutorialsModal } from '../TutorialsModal';

describe('TutorialsModal', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('lists tutorial sequences with stored progress', () => {
    localStorage.setItem(
      'onboardingState',
      JSON.stringify({
        completedSequences: ['basic'],
        sequenceProgress: { basic: 100, advanced: 25 }
      })
    );

    render(<TutorialsModal isOpen onClose={jest.fn()} />);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Phrase Grammar & Branching')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('25% complete')).toBeInTheDocument();
  });

  it('starts the chosen tutorial sequence and closes the modal', () => {
    const onClose = jest.fn();
    const listener = jest.fn();
    window.addEventListener('epic1:startTutorial', listener);

    render(<TutorialsModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getAllByText('Start tutorial')[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { sequenceId: 'advanced' }
    });

    window.removeEventListener('epic1:startTutorial', listener);
  });
});
