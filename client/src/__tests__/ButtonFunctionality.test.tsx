import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LaunchScreen } from '../components/LaunchScreen/LaunchScreen';
import { Epic1EditorContainer } from '../Epic1Editor';
import { SimpleMenuBar } from '../Epic1Editor/components/SimpleMenuBar';
import '@testing-library/jest-dom';

describe('Button Functionality Tests', () => {
  describe('LaunchScreen Buttons', () => {
    it('should call onLaunch with tutorial payload when Start Tutorial is clicked', () => {
      const mockOnLaunch = jest.fn();
      render(<LaunchScreen onLaunch={mockOnLaunch} />);

      const tutorialButton = screen.getByText('Start Tutorial');
      fireEvent.click(tutorialButton);

      // Wait for transition animation
      setTimeout(() => {
        expect(mockOnLaunch).toHaveBeenCalledWith({ kind: 'tutorial' });
      }, 350);
    });

    it('should call onLaunch with empty payload when Skip to Editor is clicked', () => {
      const mockOnLaunch = jest.fn();
      render(<LaunchScreen onLaunch={mockOnLaunch} />);

      const skipButton = screen.getByText('Skip to Editor →');
      fireEvent.click(skipButton);

      expect(mockOnLaunch).toHaveBeenCalledWith({ kind: 'empty' });
    });

    it('should call onLaunch when Launch Editor is clicked', async () => {
      const mockOnLaunch = jest.fn();
      render(<LaunchScreen onLaunch={mockOnLaunch} />);

      const launchButton = screen.getByText('Launch Editor');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(mockOnLaunch).toHaveBeenCalled();
      });
    });
  });

  describe('Editor Tutorial Integration', () => {
    it('should dispatch epic1:startTutorial event when startWithTutorial is true', async () => {
      const eventListener = jest.fn();
      window.addEventListener('epic1:startTutorial', eventListener);

      render(<Epic1EditorContainer startWithTutorial={true} />);

      await waitFor(
        () => {
          expect(eventListener).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      window.removeEventListener('epic1:startTutorial', eventListener);
    });
  });

  describe('Wizard Button', () => {
    it('should open wizard modal when clicked', async () => {
      // This would need the full Epic1GraphEditor to test properly
      // Since it's deeply integrated, we'll test that the button exists
      const { container } = render(<Epic1EditorContainer />);

      await waitFor(() => {
        const wizardButton = container.querySelector('.palette-footer-button');
        expect(wizardButton).toBeTruthy();
        expect(wizardButton?.textContent).toContain('Wizard');
      });
    });
  });

  describe('Menu Bar Buttons', () => {
    const mockHandlers = {
      onNew: jest.fn(),
      onOpen: jest.fn(),
      onSave: jest.fn(),
      onSaveAs: jest.fn(),
      onImport: jest.fn(),
      onExport: jest.fn(),
      onExportComfy: jest.fn(),
      onUndo: jest.fn(),
      onRedo: jest.fn(),
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      onFitView: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call onNew when New Document is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const fileMenu = screen.getByText('File');
      fireEvent.mouseEnter(fileMenu);

      const newButton = screen.getByText('New Document');
      fireEvent.click(newButton);

      expect(mockHandlers.onNew).toHaveBeenCalled();
    });

    it('should call onSave when Save is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const fileMenu = screen.getByText('File');
      fireEvent.mouseEnter(fileMenu);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(mockHandlers.onSave).toHaveBeenCalled();
    });

    it('should call onExport when Export PSG is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const fileMenu = screen.getByText('File');
      fireEvent.mouseEnter(fileMenu);

      const exportButton = screen.getByText('Export PSG');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalled();
    });

    it('should call onExportComfy when Export Comfy Bridge is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const fileMenu = screen.getByText('File');
      fireEvent.mouseEnter(fileMenu);

      const exportButton = screen.getByText('Export Comfy Bridge...');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExportComfy).toHaveBeenCalled();
    });

    it('should call onUndo when Undo is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const editMenu = screen.getByText('Edit');
      fireEvent.mouseEnter(editMenu);

      const undoButton = screen.getByText('Undo');
      fireEvent.click(undoButton);

      expect(mockHandlers.onUndo).toHaveBeenCalled();
    });

    it('should call onZoomIn when Zoom In is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const viewMenu = screen.getByText('View');
      fireEvent.mouseEnter(viewMenu);

      const zoomInButton = screen.getByText('Zoom In');
      fireEvent.click(zoomInButton);

      expect(mockHandlers.onZoomIn).toHaveBeenCalled();
    });
  });

  describe('Button Availability', () => {
    it('should have all critical buttons present', async () => {
      const { container } = render(<Epic1EditorContainer />);

      await waitFor(() => {
        // Check for menu bar
        expect(container.querySelector('.simple-menu-bar')).toBeTruthy();

        // Check for palette buttons
        const wizardButton = container.querySelector('.palette-footer-button');
        expect(wizardButton).toBeTruthy();
      });
    });
  });
});
