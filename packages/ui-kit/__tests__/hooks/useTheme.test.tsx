/**
 * useTheme hook tests
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from '../../src/hooks/useTheme';
import { ThemeProvider } from '../../src/components/ThemeProvider';

const TestComponent: React.FC = () => {
  const { theme, setTheme, toggleColorMode, colorMode } = useTheme();

  return (
    <div>
      <div data-testid="color-mode">{colorMode}</div>
      <div data-testid="primary-color">{theme.colors.primary}</div>
      <button onClick={toggleColorMode}>Toggle Color Mode</button>
      <button onClick={() => setTheme({ colors: { ...theme.colors, primary: '#ff0000' } })}>
        Change Primary Color
      </button>
    </div>
  );
};

const renderWithTheme = (defaultColorMode?: 'light' | 'dark' | 'system') => {
  return render(
    <ThemeProvider defaultColorMode={defaultColorMode}>
      <TestComponent />
    </ThemeProvider>
  );
};

describe('useTheme', () => {
  beforeEach(() => {
    // Mock matchMedia for system color scheme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('provides theme context', () => {
    renderWithTheme();

    expect(screen.getByTestId('color-mode')).toBeInTheDocument();
    expect(screen.getByTestId('primary-color')).toBeInTheDocument();
  });

  it('defaults to light mode', () => {
    renderWithTheme('light');
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
  });

  it('supports dark mode', () => {
    renderWithTheme('dark');
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
  });

  it('detects system color scheme', () => {
    // Mock dark color scheme preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    renderWithTheme('system');
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
  });

  it('toggles color mode', async () => {
    renderWithTheme('light');

    const toggleButton = screen.getByText('Toggle Color Mode');
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');

    await userEvent.click(toggleButton);
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');

    await userEvent.click(toggleButton);
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
  });

  it('allows theme customization', async () => {
    renderWithTheme();

    const changeColorButton = screen.getByText('Change Primary Color');
    await userEvent.click(changeColorButton);

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#ff0000');
  });

  it('applies CSS variables', () => {
    renderWithTheme();

    const themeProvider = document.querySelector('.ui-theme-provider');
    expect(themeProvider).toBeInTheDocument();

    // Check if CSS variables are applied (this would need to be tested differently in real DOM)
    const style = themeProvider?.querySelector('style');
    expect(style).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const TestComponentWithoutProvider = () => {
      try {
        useTheme();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>Error caught</div>;
      }
    };

    render(<TestComponentWithoutProvider />);
    expect(screen.getByText('Error caught')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('listens to system color scheme changes', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
      })),
    });

    const { unmount } = renderWithTheme('system');

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
