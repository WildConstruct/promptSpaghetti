/**
 * Integration tests for user interaction features - Story 6.1 (AC: 2-5)
 * Tests keyboard shortcuts, drag-and-drop, and unsaved changes workflows
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn<unknown[], unknown>(),
  setItem: jest.fn<unknown[], unknown>(),
  removeItem: jest.fn<unknown[], unknown>()
};
Object.defineProperty(window, 'localStorage', {)
  value: mockLocalStorage,
});

// Mock window event listeners
const mockAddEventListener = jest.fn<unknown[], unknown>();
const mockRemoveEventListener = jest.fn<unknown[], unknown>();
Object.defineProperty(window, 'addEventListener', {)
  value: mockAddEventListener,
});
Object.defineProperty(window, 'removeEventListener', {)
  value: mockRemoveEventListener,
});

// Mock FileReader for drag-and-drop tests
class MockFileReader {
  result: string | null = null;
  onload: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  readAsText(file: File) {
    setTimeout(() => {
      if (file.name.endsWith('.psg')) {
        this.result = JSON.stringify({)
          fileType: 'psg',
          formatVersion: '1.0.0',
          metadata: { name: 'Dropped Project', author: 'User' },
          settings: { autoSave: true },
          graph: { nodes: [], edges: [] },
          exportedAt: new Date().toISOString(),
        });
      } else {
        this.result = 'Invalid file content';
      }
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 10);
  }
}
global.FileReader = MockFileReader as any;
describe('User Interaction Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null as unknown);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Keyboard Shortcuts Integration', () => {
    test('Ctrl+S and Cmd+S keyboard shortcuts work correctly', () => {
      const mockSaveHandler = jest.fn<unknown[], unknown>();
      const mockLoadHandler = jest.fn<unknown[], unknown>();
      const mockSettingsHandler = jest.fn<unknown[], unknown>();
      // Simulate keyboard event handler setup (as in GraphEditor)
      const handleKeyDown = (event: KeyboardEvent) => {
        // Alt+S opens settings modal
        if (event.altKey && event.key === 's') {
          event.preventDefault();
          mockSettingsHandler();
          return;
        }
        // Ctrl+S/Cmd+S saves project
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          mockSaveHandler();
          return;
        }
        // Ctrl+O/Cmd+O opens project
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
          event.preventDefault();
          mockLoadHandler();
          return;
        }
      };
      // Test Ctrl+S
      const ctrlSEvent = new KeyboardEvent('keydown', { )
        key: 's', 
        ctrlKey: true ,
      });
      Object.defineProperty(ctrlSEvent, 'preventDefault', { )
        value: jest.fn<unknown[], unknown>() 
      });
      handleKeyDown(ctrlSEvent);
      expect(mockSaveHandler).toHaveBeenCalledTimes(1);
      expect(ctrlSEvent.preventDefault).toHaveBeenCalled();
      // Test Cmd+S (Meta key)
      mockSaveHandler.mockClear();
      const cmdSEvent = new KeyboardEvent('keydown', { )
        key: 's', 
        metaKey: true ,
      });
      Object.defineProperty(cmdSEvent, 'preventDefault', { )
        value: jest.fn<unknown[], unknown>() 
      });
      handleKeyDown(cmdSEvent);
      expect(mockSaveHandler).toHaveBeenCalledTimes(1);
      expect(cmdSEvent.preventDefault).toHaveBeenCalled();
      // Test Alt+S (should not trigger save)
      mockSaveHandler.mockClear();
      const altSEvent = new KeyboardEvent('keydown', { )
        key: 's', 
        altKey: true ,
      });
      Object.defineProperty(altSEvent, 'preventDefault', { )
        value: jest.fn<unknown[], unknown>() 
      });
      handleKeyDown(altSEvent);
      expect(mockSaveHandler).not.toHaveBeenCalled();
      expect(mockSettingsHandler).toHaveBeenCalledTimes(1);
    });
    test('keyboard shortcuts are prevented from browser default behavior', () => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
        }
      };
      // Create event with preventDefault mock
      const event = new KeyboardEvent('keydown', { )
        key: 's', 
        ctrlKey: true ,
      });
      const preventDefault = jest.fn<unknown[], unknown>();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      handleKeyDown(event);
      expect(preventDefault).toHaveBeenCalled();
    });
    test('keyboard shortcuts work with modifier key combinations', () => {
      let saveTriggered = false;
      let settingsTriggered = false;
      const handleKeyDown = (event: KeyboardEvent) => {
        // Alt+S has priority over Ctrl+Alt+S
        if (event.altKey && event.key === 's') {
          event.preventDefault();
          settingsTriggered = true;
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          saveTriggered = true;
          return;
        }
      };
      // Test Ctrl+Alt+S (Alt should take priority)
      const ctrlAltSEvent = new KeyboardEvent('keydown', { )
        key: 's', 
        ctrlKey: true,
        altKey: true ,
      });
      Object.defineProperty(ctrlAltSEvent, 'preventDefault', { )
        value: jest.fn<unknown[], unknown>() 
      });
      handleKeyDown(ctrlAltSEvent);
      expect(settingsTriggered).toBe(true);
      expect(saveTriggered).toBe(false);
    });
  });
  describe('Drag-and-Drop Integration', () => {
    test('drag-and-drop of .psg files works correctly', async () => {
      let droppedProject: unknown = null;
      let statusMessage = '';
      // Simulate drag-and-drop handler (as in GraphEditor)
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psg')) {
            try {
              const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsText(file);
              });
              const projectData = JSON.parse(content);
              droppedProject = projectData;
              statusMessage = `Project "${projectData.metadata.name}" loaded successfully!`;}
            } catch (error) {
              statusMessage = `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`;}
            }
          } else {
            statusMessage = 'Only .psg files are supported for drag and drop';
          }
        }
      };
      // Create mock file and drag event
      const mockFile = new File([''], 'test-project.psg', { type: 'application/json' });
      const dragEvent = {
        preventDefault: jest.fn<unknown[], unknown>(),
        dataTransfer: {,
          files: [mockFile],
        }
      } as any;
      await handleDrop(dragEvent);
      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(droppedProject).toBeDefined();
      expect(droppedProject.metadata.name).toBe('Dropped Project');
      expect(statusMessage).toContain('loaded successfully');
    });
    test('drag-and-drop rejects non-.psg files', async () => {
      let statusMessage = '';
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psg')) {
            statusMessage = 'PSG file accepted';
          } else {
            statusMessage = 'Only .psg files are supported for drag and drop';
          }
        }
      };
      // Test with .txt file
      const txtFile = new File([''], 'document.txt', { type: 'text/plain' });
      const dragEvent = {
        preventDefault: jest.fn<unknown[], unknown>(),
        dataTransfer: {,
          files: [txtFile],
        }
      } as any;
      await handleDrop(dragEvent);
      expect(statusMessage).toBe('Only .psg files are supported for drag and drop');
    });
    test('drag-and-drop handles case-insensitive file extensions', async () => {
      let projectLoaded = false;
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psg')) {
            projectLoaded = true;
          }
        }
      };
      // Test various case combinations
      const testFiles = [;
        new File([''], 'project.PSG', { type: 'application/json' }),
        new File([''], 'project.Psg', { type: 'application/json' }),
        new File([''], 'project.pSG', { type: 'application/json' })
      ];
      for (const file of testFiles) {
        projectLoaded = false;
        const dragEvent = {
          preventDefault: jest.fn<unknown[], unknown>(),
          dataTransfer: { files: [file] }
        } as any;
        await handleDrop(dragEvent);
        expect(projectLoaded).toBe(true);
      }
    });
    test('drag-and-drop handles file reading errors', async () => {
      let errorMessage = '';
      // Mock FileReader to throw error
      class ErrorFileReader {
        onerror: ((event: unknown) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({ target: this, error: new Error('Read error') });
            }
          }, 10);
        }
      }
      const originalFileReader = global.FileReader;
      global.FileReader = ErrorFileReader as any;
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psg')) {
            try {
              await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsText(file);
              });
            } catch (error) {
              errorMessage = `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`;}
            }
          }
        }
      };
      const mockFile = new File([''], 'error-project.psg', { type: 'application/json' });
      const dragEvent = {
        preventDefault: jest.fn<unknown[], unknown>(),
        dataTransfer: { files: [mockFile] }
      } as any;
      await handleDrop(dragEvent);
      expect(errorMessage).toContain('Failed to load project');
      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });
  describe('Unsaved Changes Workflow Integration', () => {
    test('unsaved changes workflow with save confirmation', async () => {
      let saveDialogOpened = false;
      let actionCompleted = false;
      const mockOnSave = jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown);
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Test Project',
        onSave: async () => {,
          saveDialogOpened = true;
          return mockOnSave();
        }
      }));
      // Trigger a navigation that requires confirmation
      act(() => {
        result.current.confirmNavigation('creating a new project', () => {
          actionCompleted = true;
        });
      });
      expect(result.current.showUnsavedDialog).toBe(true);
      expect(result.current.dialogAction).toBe('creating a new project');
      // User chooses to save
      await act(async () => {
        await result.current.handleSave();
      });
      expect(saveDialogOpened).toBe(true);
      expect(mockOnSave).toHaveBeenCalled();
      expect(actionCompleted).toBe(true);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
    test('unsaved changes workflow with don\'t save confirmation', () => {
      let actionCompleted = false;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Test Project',
      }));
      // Trigger navigation
      act(() => {
        result.current.confirmNavigation('loading a project', () => {
          actionCompleted = true;
        });
      });
      expect(result.current.showUnsavedDialog).toBe(true);
      // User chooses don't save
      act(() => {
        result.current.handleDontSave();
      });
      expect(actionCompleted).toBe(true);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
    test('unsaved changes workflow with cancel', () => {
      let actionCompleted = false;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Test Project',
      }));
      // Trigger navigation
      act(() => {
        result.current.confirmNavigation('closing the application', () => {
          actionCompleted = true;
        });
      });
      expect(result.current.showUnsavedDialog).toBe(true);
      // User cancels
      act(() => {
        result.current.handleCancel();
      });
      expect(actionCompleted).toBe(false);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
    test('browser beforeunload protection works correctly', () => {
      renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Test Project',
      }));
      // Verify beforeunload listener was added
      expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      // Get the beforeunload handler
      const beforeUnloadHandler = mockAddEventListener.mock.calls;
        .find(call => call[0] === 'beforeunload')?.[1];
      expect(beforeUnloadHandler).toBeDefined();
      // Test the handler
      const mockEvent = {
        preventDefault: jest.fn<unknown[], unknown>(),
        returnValue: undefined,
      };
      const result = beforeUnloadHandler(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?');
      expect(result).toBe('You have unsaved changes. Are you sure you want to leave?');
    });
    test('no unsaved changes allows immediate navigation', () => {
      let actionCompleted = false;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: false,
        projectName: 'Test Project',
      }));
      // Trigger navigation
      act(() => {
        result.current.confirmNavigation('any action', () => {
          actionCompleted = true;
        });
      });
      // Should complete immediately without showing dialog
      expect(actionCompleted).toBe(true);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
  });
  describe('Combined User Interactions', () => {
    test('keyboard shortcut with unsaved changes workflow', async () => {
      let loadDialogOpened = false;
      const confirmationShown = false;
      const projectLoaded = false;
      // Simulate the combined workflow
      const hasUnsavedChanges = true;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges,
        projectName: 'Current Project',
      }));
      // Simulate Ctrl+O keyboard shortcut handler
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
          event.preventDefault();
          // Use unsaved changes confirmation
          result.current.confirmNavigation('loading a project', () => {
            loadDialogOpened = true;
          });
        }
      };
      // User presses Ctrl+O
      const ctrlOEvent = new KeyboardEvent('keydown', { )
        key: 'o', 
        ctrlKey: true ,
      });
      Object.defineProperty(ctrlOEvent, 'preventDefault', { )
        value: jest.fn<unknown[], unknown>() 
      });
      act(() => {
        handleKeyDown(ctrlOEvent);
      });
      // Should show unsaved changes dialog
      expect(result.current.showUnsavedDialog).toBe(true);
      expect(loadDialogOpened).toBe(false);
      // User chooses don't save
      act(() => {
        result.current.handleDontSave();
      });
      expect(loadDialogOpened).toBe(true);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
    test('drag-and-drop with unsaved changes workflow', async () => {
      const confirmationShown = false;
      let projectLoaded = false;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Current Project',
      }));
      // Simulate drag-and-drop handler with unsaved changes check
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psg')) {
            // Check for unsaved changes before loading
            result.current.confirmNavigation('loading a dropped project', async () => {
              // Simulate file loading
              const content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsText(file);
              });
              projectLoaded = true;
            });
          }
        }
      };
      const mockFile = new File([''], 'dropped-project.psg', { type: 'application/json' });
      const dragEvent = {
        preventDefault: jest.fn<unknown[], unknown>(),
        dataTransfer: { files: [mockFile] }
      } as any;
      await act(async () => {
        await handleDrop(dragEvent);
      });
      // Should show confirmation dialog
      expect(result.current.showUnsavedDialog).toBe(true);
      expect(projectLoaded).toBe(false);
      // User confirms don't save
      await act(async () => {
        result.current.handleDontSave();
      });
      // Wait for file loading
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(projectLoaded).toBe(true);
      expect(result.current.showUnsavedDialog).toBe(false);
    });
    test('multiple rapid user interactions are handled correctly', () => {
      let actionCount = 0;
      const { result } = renderHook(() => useUnsavedChanges({)
        hasUnsavedChanges: true,
        projectName: 'Test Project',
      }));
      // Simulate rapid user actions
      const actions = [;
        'creating a new project',
        'loading a project', 
        'opening recent project',
        'closing application'
      ];
      actions.forEach((action, index) => {
        act(() => {
          result.current.confirmNavigation(action, () => {
            actionCount++;
          });
        });
      });
      // Should only show dialog for the last action
      expect(result.current.showUnsavedDialog).toBe(true);
      expect(result.current.dialogAction).toBe('closing application');
      expect(actionCount).toBe(0);
      // Handle the final confirmation
      act(() => {
        result.current.handleDontSave();
      });
      expect(actionCount).toBe(1); // Only the last action should execute
    });
  });
});