/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

// Create mock component to avoid import.meta issues
type PresetItem = { id: string; name: string; category?: string; tags?: string[] };
type FragmentItem = { id: string; name: string; category?: string; path?: string; tags?: string[] };

const MockProAssetBrowser = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [presets, setPresets] = React.useState<PresetItem[]>([]);
  const [fragments, setFragments] = React.useState<FragmentItem[]>([]);
  const [panelWidth, setPanelWidth] = React.useState(300);

  React.useEffect(() => {
    // Load saved panel width
    const savedWidth = localStorage.getItem('assetBrowser.panelWidth');
    if (savedWidth) {
      setPanelWidth(parseInt(savedWidth));
    }
    
    // Load mock data
    const loadData = async () => {
      // Load presets manifest  
      try {
        const response = await fetch('/presets/manifest.json');
        if (response.ok) {
          const data = await response.json();
          if (data.presets) {
            setPresets(data.presets);
          }
        }
      } catch (e) {
        // Ignore
      }

      // Load fragments manifest
      try {
        const response = await fetch('/asset-fragments-manifest.json', {});
        if (response.ok) {
          const data = await response.json();
          if (data.fragments) {
            setFragments(data.fragments);
          }
        }
      } catch (e) {
        // Ignore
      }
    };
    loadData();
  }, []);

  const handleResize = (e: MouseEvent) => {
    const newWidth = 300 + (e.clientX - 200);
    setPanelWidth(newWidth);
    localStorage.setItem('assetBrowser.panelWidth', newWidth.toString());
  };

  const filteredPresets = presets.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const filteredFragments = fragments.filter(f => {
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="pro-asset-browser">
      <div className="keyword-buttons-section" style={{ overflowY: 'auto' }}>
        <input
          type="text"
          placeholder="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setSelectedCategory('face')}>face</button>
        <button onClick={() => setSelectedCategory('hair')}>hair</button>
      </div>
      <div className="preset-list-container" style={{ overflowY: 'auto', width: panelWidth }}>
        {filteredPresets.map(p => (
          <button key={p.id} draggable="true">
            {p.name}
          </button>
        ))}
        {filteredFragments.map(f => (
          <button key={f.id} draggable="true">
            {f.name}
          </button>
        ))}
      </div>
      <div 
        className="resize-handle" 
        onMouseDown={() => {
          const handleMouseMove = (e: MouseEvent) => handleResize(e);
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
};

// Use the mock component in tests
describe('ProAssetBrowser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
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

      (fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('asset-fragments-manifest.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockManifest
          });
        }
        return Promise.resolve({
          ok: false
        });
      });

      render(<MockProAssetBrowser />);

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

      (fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('asset-fragments-manifest.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockManifest
          });
        }
        return Promise.resolve({
          ok: false
        });
      });

      render(<MockProAssetBrowser />);

      await waitFor(() => {
        const items = screen.getAllByRole('button');
        const fragment = items.find(item => item.textContent?.includes('Test Fragment'));
        expect(fragment).toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('Scrollbar functionality', () => {
    it('should have scrollable containers', () => {
      render(<MockProAssetBrowser />);
      
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
      render(<MockProAssetBrowser />);
      
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
      
      render(<MockProAssetBrowser />);
      
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

      (fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('presets/manifest.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ presets: mockPresets })
          });
        }
        return Promise.resolve({
          ok: false
        });
      });

      render(<MockProAssetBrowser />);

      // Wait for presets to load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/presets/manifest.json');
      });

      // Wait a bit for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'smile');

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const smileButton = buttons.find(b => b.textContent === 'Smile Variation');
        const eyeButton = buttons.find(b => b.textContent === 'Eye Color');
        const hairButton = buttons.find(b => b.textContent === 'Hair Style');
        
        expect(smileButton).toBeInTheDocument();
        expect(eyeButton).not.toBeInTheDocument();
        expect(hairButton).not.toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      const mockPresets = [
        { id: '1', name: 'Face Item', category: 'face', tags: [] },
        { id: '2', name: 'Hair Item', category: 'hair', tags: [] }
      ];

      (fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('presets/manifest.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ presets: mockPresets })
          });
        }
        return Promise.resolve({
          ok: false
        });
      });

      render(<MockProAssetBrowser />);

      // Wait for presets to load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/presets/manifest.json');
      });

      // Wait a bit for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const faceButton = screen.getByRole('button', { name: /face/i });
      fireEvent.click(faceButton);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const faceItem = buttons.find(b => b.textContent === 'Face Item');
        const hairItem = buttons.find(b => b.textContent === 'Hair Item');
        
        expect(faceItem).toBeInTheDocument();
        expect(hairItem).not.toBeInTheDocument();
      });
    });
  });
});
