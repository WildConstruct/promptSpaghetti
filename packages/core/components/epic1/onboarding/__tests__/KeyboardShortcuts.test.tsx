/**
 * Tests for Keyboard Shortcut Reference System
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  KeyboardShortcutReference,
  useKeyboardShortcuts,
} from '../KeyboardShortcutReference';
import {
  KeyboardShortcutProvider,
  useKeyboardShortcutManager,
  useCommonShortcuts,
  ShortcutHint,
} from '../KeyboardShortcutManager';
import { TutorialProvider } from '../TutorialContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Keyboard Shortcut Reference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('KeyboardShortcutReference', () => {
    test('opens and closes with ? key', () => {
      const TestComponent = () => {
        const { isOpen, close } = useKeyboardShortcuts();
        return (
          <div>
            <KeyboardShortcutReference isOpen={isOpen} onClose={close} />
            <div>Test content</div>
          </div>
        );
      };

      render(<TestComponent />);

      // Initially closed
      expect(screen.queryByText('⌨️ Keyboard Shortcuts')).not.toBeInTheDocument();

      // Press ? to open
      fireEvent.keyDown(window, { key: '?', shiftKey: true });
      expect(screen.getByText('⌨️ Keyboard Shortcuts')).toBeInTheDocument();

      // Press Escape to close
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('⌨️ Keyboard Shortcuts')).not.toBeInTheDocument();
    });

    test('shows all shortcut categories', () => {
      render(
        <TutorialProvider>
          <KeyboardShortcutReference isOpen={true} onClose={() => {}} />
        </TutorialProvider>
      );

      expect(screen.getByText('✏️ Editing')).toBeInTheDocument();
      expect(screen.getByText('🧭 Navigation')).toBeInTheDocument();
      expect(screen.getByText('🎯 Selection')).toBeInTheDocument();
      expect(screen.getByText('✨ Creation')).toBeInTheDocument();
      expect(screen.getByText('👁️ Preview & Export')).toBeInTheDocument();
      expect(screen.getByText('❓ Help & UI')).toBeInTheDocument();
    });

    test('search functionality filters shortcuts', () => {
      render(
        <TutorialProvider>
          <KeyboardShortcutReference isOpen={true} onClose={() => {}} />
        </TutorialProvider>
      );

      const searchInput = screen.getByPlaceholderText('Search shortcuts...');
      
      // Search for "save"
      fireEvent.change(searchInput, { target: { value: 'save' } });
      
      expect(screen.getByText('Save current edit')).toBeInTheDocument();
      expect(screen.getByText('Save project')).toBeInTheDocument();
      expect(screen.queryByText('Delete selected nodes')).not.toBeInTheDocument();
    });

    test('category filter works', () => {
      render(
        <TutorialProvider>
          <KeyboardShortcutReference isOpen={true} onClose={() => {}} />
        </TutorialProvider>
      );

      const categorySelect = screen.getByRole('combobox');
      
      // Filter by Editing category
      fireEvent.change(categorySelect, { target: { value: 'editing' } });
      
      expect(screen.getByText('✏️ Editing')).toBeInTheDocument();
      expect(screen.queryByText('🧭 Navigation')).not.toBeInTheDocument();
    });

    test('shows platform-specific keys', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      render(
        <TutorialProvider>
          <KeyboardShortcutReference isOpen={true} onClose={() => {}} />
        </TutorialProvider>
      );

      // Should show ⌘ instead of Ctrl for Mac
      expect(screen.getByText(/⌘/)).toBeInTheDocument();
    });

    test('displays shortcut count', () => {
      render(
        <TutorialProvider>
          <KeyboardShortcutReference isOpen={true} onClose={() => {}} />
        </TutorialProvider>
      );

      expect(screen.getByText(/\d+ shortcuts available/)).toBeInTheDocument();
    });
  });

  describe('KeyboardShortcutManager', () => {
    test('registers and triggers shortcuts', () => {
      const mockHandler = jest.fn();
      
      const TestComponent = () => {
        const manager = useKeyboardShortcutManager();
        
        React.useEffect(() => {
          manager.registerShortcut({
            id: 'test-save',
            keys: ['Ctrl/Cmd', 'S'],
            handler: mockHandler,
            description: 'Test save',
            category: 'test',
            preventDefault: true,
          });
        }, [manager]);
        
        return <div>Test</div>;
      };

      render(
        <KeyboardShortcutProvider>
          <TestComponent />
        </KeyboardShortcutProvider>
      );

      // Trigger Ctrl+S
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(mockHandler).toHaveBeenCalled();
    });

    test('respects enabled/disabled state', () => {
      const mockHandler = jest.fn();
      
      const TestComponent = () => {
        const manager = useKeyboardShortcutManager();
        
        React.useEffect(() => {
          manager.registerShortcut({
            id: 'test-shortcut',
            keys: ['T'],
            handler: mockHandler,
            description: 'Test',
            category: 'test',
            enabled: false,
          });
        }, [manager]);
        
        return (
          <div>
            <button onClick={() => manager.enableShortcut('test-shortcut')}>
              Enable
            </button>
            <button onClick={() => manager.disableShortcut('test-shortcut')}>
              Disable
            </button>
          </div>
        );
      };

      render(
        <KeyboardShortcutProvider>
          <TestComponent />
        </KeyboardShortcutProvider>
      );

      // Should not trigger when disabled
      fireEvent.keyDown(window, { key: 't' });
      expect(mockHandler).not.toHaveBeenCalled();

      // Enable and trigger
      fireEvent.click(screen.getByText('Enable'));
      fireEvent.keyDown(window, { key: 't' });
      expect(mockHandler).toHaveBeenCalled();

      // Disable again
      mockHandler.mockClear();
      fireEvent.click(screen.getByText('Disable'));
      fireEvent.keyDown(window, { key: 't' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('ignores shortcuts in input fields', () => {
      const mockHandler = jest.fn();
      
      const TestComponent = () => {
        const manager = useKeyboardShortcutManager();
        
        React.useEffect(() => {
          manager.registerShortcut({
            id: 'test',
            keys: ['A'],
            handler: mockHandler,
            description: 'Test',
            category: 'test',
          });
        }, [manager]);
        
        return (
          <div>
            <input type="text" placeholder="Type here" />
          </div>
        );
      };

      render(
        <KeyboardShortcutProvider>
          <TestComponent />
        </KeyboardShortcutProvider>
      );

      const input = screen.getByPlaceholderText('Type here');
      input.focus();
      
      // Should not trigger when typing in input
      fireEvent.keyDown(input, { key: 'a' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('common shortcuts hook', () => {
      const handlers = {
        onSave: jest.fn(),
        onUndo: jest.fn(),
        onRedo: jest.fn(),
        onDuplicate: jest.fn(),
      };
      
      const TestComponent = () => {
        const { registerCommonShortcuts } = useCommonShortcuts();
        
        React.useEffect(() => {
          registerCommonShortcuts(handlers);
        }, [registerCommonShortcuts]);
        
        return <div>Test</div>;
      };

      render(
        <KeyboardShortcutProvider>
          <TestComponent />
        </KeyboardShortcutProvider>
      );

      // Test each common shortcut
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(handlers.onSave).toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
      expect(handlers.onUndo).toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
      expect(handlers.onRedo).toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'd', ctrlKey: true });
      expect(handlers.onDuplicate).toHaveBeenCalled();
    });

    test('unregister shortcut', () => {
      const mockHandler = jest.fn();
      
      const TestComponent = () => {
        const manager = useKeyboardShortcutManager();
        const [registered, setRegistered] = React.useState(true);
        
        React.useEffect(() => {
          if (registered) {
            manager.registerShortcut({
              id: 'test',
              keys: ['X'],
              handler: mockHandler,
              description: 'Test',
              category: 'test',
            });
          } else {
            manager.unregisterShortcut('test');
          }
        }, [manager, registered]);
        
        return (
          <button onClick={() => setRegistered(false)}>
            Unregister
          </button>
        );
      };

      render(
        <KeyboardShortcutProvider>
          <TestComponent />
        </KeyboardShortcutProvider>
      );

      // Should trigger initially
      fireEvent.keyDown(window, { key: 'x' });
      expect(mockHandler).toHaveBeenCalled();

      // Unregister
      mockHandler.mockClear();
      fireEvent.click(screen.getByText('Unregister'));
      
      // Should not trigger after unregister
      fireEvent.keyDown(window, { key: 'x' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('ShortcutHint', () => {
    test('renders shortcut keys', () => {
      render(
        <ShortcutHint 
          shortcut={['Ctrl/Cmd', 'S']} 
          description="Save file" 
        />
      );

      expect(screen.getByText('Save file')).toBeInTheDocument();
      // Should have two kbd elements
      const kbds = screen.getAllByRole('text').filter(el => 
        el.tagName.toLowerCase() === 'kbd'
      );
      expect(kbds).toHaveLength(2);
    });

    test('shows platform-specific keys', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      render(<ShortcutHint shortcut={['Ctrl/Cmd', 'S']} />);
      
      expect(screen.getByText('⌘')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('help overlay integrates with shortcut manager', () => {
      const TestComponent = () => {
        const manager = useKeyboardShortcutManager();
        
        return (
          <div>
            <button onClick={() => manager.showHelp()}>
              Show Help
            </button>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <KeyboardShortcutProvider>
            <TestComponent />
          </KeyboardShortcutProvider>
        </TutorialProvider>
      );

      // Click to show help
      fireEvent.click(screen.getByText('Show Help'));
      expect(screen.getByText('⌨️ Keyboard Shortcuts')).toBeInTheDocument();
    });
  });
});