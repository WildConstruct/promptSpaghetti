/**
 * Keyboard shortcut manager integration tests aligned with provider behaviour.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TutorialProvider } from '../TutorialContext';
import {
  KeyboardShortcutProvider,
  useKeyboardShortcutManager,
  ShortcutHint,
} from '../KeyboardShortcutManager';
import { KeyboardShortcutReference } from '../KeyboardShortcutReference';

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <TutorialProvider>
      <KeyboardShortcutProvider>{ui}</KeyboardShortcutProvider>
    </TutorialProvider>
  );

describe('KeyboardShortcutProvider', () => {
  it('registers and triggers shortcuts', async () => {
    const handler = jest.fn();

    const TestComponent = () => {
      const { registerShortcut, unregisterShortcut, isShortcutActive } =
        useKeyboardShortcutManager();
      const initialized = React.useRef(false);
      const [ready, setReady] = React.useState(false);

      React.useEffect(() => {
        if (initialized.current) {return;}
        initialized.current = true;
        registerShortcut({
          id: 'test-save',
          keys: ['Ctrl', 'S'],
          handler,
          description: 'Test save',
          category: 'test',
          preventDefault: true,
        });
        setReady(true);
        return () => unregisterShortcut('test-save');
      }, [registerShortcut, unregisterShortcut]);

      const active = isShortcutActive('test-save');
      return ready ? (
        <div data-testid="shortcut-ready" data-active={active} />
      ) : null;
    };

    renderWithProviders(<TestComponent />);

    const status = await screen.findByTestId('shortcut-ready');
    expect(status.dataset.active).toBe('true');

    await waitFor(() => {
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
      expect(handler).toHaveBeenCalled();
    });
  });

  it('allows enabling and disabling shortcuts', async () => {
    const handler = jest.fn();

    const TestComponent = () => {
      const { registerShortcut, unregisterShortcut, enableShortcut, disableShortcut } =
        useKeyboardShortcutManager();
      const initialized = React.useRef(false);
      const [ready, setReady] = React.useState(false);

      React.useEffect(() => {
        if (initialized.current) {return;}
        initialized.current = true;
        registerShortcut({
          id: 'toggle-shortcut',
          keys: ['T'],
          handler,
          description: 'Toggle',
          category: 'test',
          enabled: false,
        });
        setReady(true);
        return () => unregisterShortcut('toggle-shortcut');
      }, [registerShortcut, unregisterShortcut]);

      return (
        <div>
          <button onClick={() => enableShortcut('toggle-shortcut')}>Enable</button>
          <button onClick={() => disableShortcut('toggle-shortcut')}>Disable</button>
          {ready && <span data-testid="toggle-ready" />}
        </div>
      );
    };

    renderWithProviders(<TestComponent />);

    await screen.findByTestId('toggle-ready');

    fireEvent.keyDown(document, { key: 't' });
    expect(handler).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Enable'));
    await waitFor(() => {
      fireEvent.keyDown(document, { key: 't' });
      expect(handler).toHaveBeenCalled();
    });

    handler.mockClear();
    fireEvent.click(screen.getByText('Disable'));
    fireEvent.keyDown(document, { key: 't' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores shortcuts while typing in inputs', () => {
    const handler = jest.fn();

    const TestComponent = () => {
      const { registerShortcut, unregisterShortcut } = useKeyboardShortcutManager();
      const initialized = React.useRef(false);

      React.useEffect(() => {
        if (initialized.current) {return;}
        initialized.current = true;
        registerShortcut({
          id: 'input-test',
          keys: ['A'],
          handler,
          description: 'Input test',
          category: 'test',
        });
        return () => unregisterShortcut('input-test');
      }, [registerShortcut, unregisterShortcut]);

      return <input placeholder="Type here" />;
    };

    renderWithProviders(<TestComponent />);

    const input = screen.getByPlaceholderText('Type here');
    input.focus();
    fireEvent.keyDown(input, { key: 'a' });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('KeyboardShortcutReference', () => {
  it('displays expected categories when opened', () => {
    renderWithProviders(
      <KeyboardShortcutReference isOpen={true} onClose={() => undefined} />
    );

    expect(screen.getAllByText(/Editing/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Navigation/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Selection/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Creation/).length).toBeGreaterThan(0);
  });

  it('filters by search term', () => {
    renderWithProviders(
      <KeyboardShortcutReference isOpen={true} onClose={() => undefined} />
    );

    const search = screen.getAllByPlaceholderText('Search shortcuts...')[0];
    fireEvent.change(search, { target: { value: 'save' } });

    expect(screen.getByText('Save current edit')).toBeInTheDocument();
  });
});

describe('ShortcutHint', () => {
  it('renders shortcut keys and description', () => {
    render(<ShortcutHint shortcut={['Ctrl', 'S']} description="Save file" />);

    expect(screen.getByText('Save file')).toBeInTheDocument();
    expect(document.querySelectorAll('kbd')).toHaveLength(2);
  });
});
