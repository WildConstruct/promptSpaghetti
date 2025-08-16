import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProAssetBrowser } from '../ProAssetBrowser';
import '@testing-library/jest-dom';

// Mock fetch for presets
global.fetch = jest.fn();

describe('ProAssetBrowser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock as any;
  });

  describe('Fragment drag and drop', () => {
    it('should load fragments from manifest', async () => {
      const mockManifest = {
        fragments: [
          {
            id: 'fragment-smile-simple',
            name: 'Simple Smile Variations',
            path: './facial-features/smile-variations-simple.psg',
            category: 'facial-features',
            tags: ['face', 'smile']
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      render(<ProAssetBrowser />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('asset-fragments-manifest.json'),
          expect.any(Object)
        );
      });
    });

    it('should make fragments draggable', async () => {
      const mockManifest = {
        fragments: [
          {
            id: 'fragment-test',
            name: 'Test Fragment',
            path: './test.psg',
            category: 'test'
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      render(<ProAssetBrowser />);

      await waitFor(() => {
        const items = screen.getAllByRole('button');
        const fragment = items.find(item => item.textContent?.includes('Test Fragment'));
        expect(fragment).toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('Scrollbar functionality', () => {
    it('should have scrollable containers', () => {
      render(<ProAssetBrowser />);
      
      // Check that keyword-buttons-section has overflow-y: auto
      const keywordSection = document.querySelector('.keyword-buttons-section');
      if (keywordSection) {
        const styles = window.getComputedStyle(keywordSection);
        expect(styles.overflowY).toBe('auto');
      }

      // Check that preset-list-container has overflow-y: auto
      const presetList = document.querySelector('.preset-list-container');
      if (presetList) {
        const styles = window.getComputedStyle(presetList);
        expect(styles.overflowY).toBe('auto');
      }
    });
  });

  describe('Panel resizing', () => {
    it('should persist panel width to localStorage', async () => {
      render(<ProAssetBrowser />);
      
      // Simulate resize
      const resizeHandle = document.querySelector('.resize-handle');
      if (resizeHandle) {
        fireEvent.mouseDown(resizeHandle, { clientX: 200 });
        fireEvent.mouseMove(document, { clientX: 300 });
        fireEvent.mouseUp(document);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          'assetBrowser.panelWidth',
          expect.any(String)
        );
      }
    });

    it('should load saved panel width from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('400');
      
      render(<ProAssetBrowser />);
      
      expect(localStorage.getItem).toHaveBeenCalledWith('assetBrowser.panelWidth');
    });
  });

  describe('Search and filtering', () => {
    it('should filter presets by search query', async () => {
      const mockPresets = [
        { id: '1', name: 'Smile Variation', category: 'face', tags: [] },
        { id: '2', name: 'Eye Color', category: 'face', tags: [] },
        { id: '3', name: 'Hair Style', category: 'hair', tags: [] }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ presets: mockPresets })
      });

      render(<ProAssetBrowser />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'smile');

      await waitFor(() => {
        expect(screen.getByText('Smile Variation')).toBeInTheDocument();
        expect(screen.queryByText('Eye Color')).not.toBeInTheDocument();
        expect(screen.queryByText('Hair Style')).not.toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      const mockPresets = [
        { id: '1', name: 'Face Item', category: 'face', tags: [] },
        { id: '2', name: 'Hair Item', category: 'hair', tags: [] }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ presets: mockPresets })
      });

      render(<ProAssetBrowser />);

      const faceButton = screen.getByRole('button', { name: /face/i });
      fireEvent.click(faceButton);

      await waitFor(() => {
        expect(screen.getByText('Face Item')).toBeInTheDocument();
        expect(screen.queryByText('Hair Item')).not.toBeInTheDocument();
      });
    });
  });
});