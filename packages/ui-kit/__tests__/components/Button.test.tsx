/**
 * Button component tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src/components/ThemeProvider';

const renderButton = (props = {}) => {
  return render(
    <ThemeProvider>
      <Button {...props}>Test Button</Button>
    </ThemeProvider>
  );
};

describe('Button', () => {
  it('renders correctly', () => {
    renderButton();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    renderButton({ onClick: handleClick });

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports different variants', () => {
    const { rerender } = renderButton({ variant: 'primary' });
    expect(screen.getByRole('button')).toHaveClass('ui-button--primary');

    rerender(
      <ThemeProvider>
        <Button variant="secondary">Test Button</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('ui-button--secondary');
  });

  it('supports different sizes', () => {
    const { rerender } = renderButton({ size: 'sm' });
    expect(screen.getByRole('button')).toHaveClass('ui-button--sm');

    rerender(
      <ThemeProvider>
        <Button size="lg">Test Button</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('ui-button--lg');
  });

  it('shows loading state', () => {
    renderButton({ loading: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('ui-button--loading');
  });

  it('can be disabled', () => {
    renderButton({ disabled: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('ui-button--disabled');
  });

  it('supports icons', () => {
    renderButton({ icon: '🚀', iconPosition: 'left' });
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('supports full width', () => {
    renderButton({ fullWidth: true });
    expect(screen.getByRole('button')).toHaveClass('ui-button--full-width');
  });

  it('handles keyboard navigation', async () => {
    const handleClick = jest.fn();
    renderButton({ onClick: handleClick });

    const button = screen.getByRole('button');
    button.focus();

    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('supports accessibility attributes', () => {
    renderButton({
      'aria-label': 'Custom button label',
      'aria-describedby': 'button-description',
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom button label');
    expect(button).toHaveAttribute('aria-describedby', 'button-description');
  });

  it('prevents multiple clicks when loading', async () => {
    const handleClick = jest.fn();
    renderButton({ onClick: handleClick, loading: true });

    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className and styles', () => {
    renderButton({
      className: 'custom-button',
      style: { backgroundColor: 'red' },
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
    expect(button).toHaveStyle({ backgroundColor: 'red' });
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ThemeProvider>
        <Button ref={ref}>Test Button</Button>
      </ThemeProvider>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
