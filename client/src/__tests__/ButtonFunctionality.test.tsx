import React from 'react';
import { jest } from '@jest/globals';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';
import { LaunchScreen } from '../components/LaunchScreen/LaunchScreen';
import { SimpleMenuBar } from '../Epic1Editor/components/SimpleMenuBar';
import '@testing-library/jest-dom';

describe('Button Functionality Tests', () => {
  describe('LaunchScreen Buttons', () => {
    async function renderLaunchScreen(onLaunch = jest.fn()) {
      render(<LaunchScreen onLaunch={onLaunch} />);

      await waitFor(() => {
        expect(screen.getByTestId('prompt-runtime-status')).toHaveTextContent(
          'ready'
        );
      });
    }

    it('should call onLaunch with tutorial payload when Start Tutorial is clicked', async () => {
      const mockOnLaunch = jest.fn();
      await renderLaunchScreen(mockOnLaunch);

      jest.useFakeTimers();
      const tutorialButton = screen.getByText('Start Tutorial');
      fireEvent.click(tutorialButton);

      act(() => {
        jest.advanceTimersByTime(350);
      });
      expect(mockOnLaunch).toHaveBeenCalledWith({ kind: 'tutorial' });
      jest.useRealTimers();
    });

    it('should call onLaunch with empty payload when Open Blank Editor is clicked', async () => {
      const mockOnLaunch = jest.fn();
      await renderLaunchScreen(mockOnLaunch);

      const skipButton = screen.getByText('Open Blank Editor ->');
      fireEvent.click(skipButton);

      expect(mockOnLaunch).toHaveBeenCalledWith({ kind: 'empty' });
    });

    it('should call onLaunch when Build PSG Family Graph is clicked', async () => {
      const mockOnLaunch = jest.fn();
      await renderLaunchScreen(mockOnLaunch);

      const launchButton = screen.getByText('Build PSG Family Graph');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(mockOnLaunch).toHaveBeenCalled();
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

      const exportButton = screen.getByText('Export PSG...');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalled();
    });

    it('should call onExportComfy when Export For Comfy is clicked', () => {
      render(<SimpleMenuBar {...mockHandlers} />);

      const fileMenu = screen.getByText('File');
      fireEvent.mouseEnter(fileMenu);

      const exportButton = screen.getByText('Export For Comfy...');
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

  describe('Menu Bar Availability', () => {
    it('should render the core menu surfaces for the MVP shell', () => {
      render(
        <SimpleMenuBar
          onNew={jest.fn()}
          onOpen={jest.fn()}
          onSave={jest.fn()}
          onExport={jest.fn()}
          onExportComfy={jest.fn()}
          onUndo={jest.fn()}
          onZoomIn={jest.fn()}
        />
      );

      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });
});
