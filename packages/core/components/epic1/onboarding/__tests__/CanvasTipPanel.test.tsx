import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CanvasTipPanel, getCanvasTipByIndex } from '../CanvasTipPanel';

describe('CanvasTipPanel', () => {
  beforeEach(() => {
    document.cookie = 'psg_canvas_tips_dismissed=; Max-Age=0; path=/';
  });

  it('renders a tip with tutorial and command actions', () => {
    render(
      <CanvasTipPanel
        tip={getCanvasTipByIndex(0)}
        onOpenCommander={jest.fn()}
        onStartTutorial={jest.fn()}
      />
    );

    expect(screen.getByText('Canvas tip')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Basic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advanced' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Commands' })).toBeInTheDocument();
  });

  it('dismisses itself and remembers dismissal in a cookie', () => {
    render(
      <CanvasTipPanel
        tip={getCanvasTipByIndex(0)}
        onOpenCommander={jest.fn()}
        onStartTutorial={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss tip' }));

    expect(screen.queryByText('Canvas tip')).not.toBeInTheDocument();
    expect(document.cookie).toContain('psg_canvas_tips_dismissed=true');
  });
});
