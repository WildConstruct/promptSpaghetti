import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

    const { container } = render(<TutorialsModal isOpen onClose={onClose} />);

    // Click the Start button inside the advanced sequence's card specifically,
    // so the assertion is independent of how many tutorials are listed.
    const advancedCard = container.querySelector(
      '[data-sequence-id="advanced"]'
    ) as HTMLElement;
    fireEvent.click(within(advancedCard).getByRole('button'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { sequenceId: 'advanced' }
    });

    window.removeEventListener('epic1:startTutorial', listener);
  });
});
