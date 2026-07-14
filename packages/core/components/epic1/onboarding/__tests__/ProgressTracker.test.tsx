import React from 'react';
import { screen } from '@testing-library/react';
import { ProgressWidget } from '../ProgressTracker';
import { seedOnboardingState, resetOnboardingStorage, renderWithTutorial } from './testUtils';

describe('ProgressWidget', () => {
  beforeEach(() => {
    resetOnboardingStorage();
  });

  it('renders basic and advanced tutorial progress independently', () => {
    seedOnboardingState({
      activeSequenceId: 'advanced',
      tutorialProgress: 25,
      sequenceProgress: {
        basic: 100,
        advanced: 25,
      },
      completedSequences: ['basic'],
      completedSteps: [],
      achievementsUnlocked: [],
      helpViewed: {},
      preferences: {
        showTooltips: true,
        enableCelebrations: true,
        keyboardShortcutsOverlay: true,
      },
    });

    renderWithTutorial(<ProgressWidget />);

    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
