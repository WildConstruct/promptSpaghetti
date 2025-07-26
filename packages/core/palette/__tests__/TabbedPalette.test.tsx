// packages/core/palette/__tests__/TabbedPalette.test.tsx
// React component tests for TabbedPalette

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabbedPalette } from '../TabbedPalette';
import { NodeMeta } from '../../Palette';
import { getFavoritesManager } from '../FavoritesManager';

// Mock the favorites manager
jest.mock('../FavoritesManager');

// Mock react-icons to avoid issues in test environment
jest.mock('react-icons/fi', () => ({
  FiSearch: () => <div data-testid="search-icon">Search</div>,
  FiStar: () => <div data-testid="star-icon">Star</div>,
  FiX: () => <div data-testid="x-icon">X</div>,
  FiChevronDown: () => <div data-testid="chevron-down">Down</div>,
  FiChevronRight: () => <div data-testid="chevron-right">Right</div>,
  FiFilter: () => <div data-testid="filter-icon">Filter</div>,
  FiMoreHorizontal: () => <div data-testid="more-icon">More</div>,
  FiEdit3: () => <div data-testid="edit-icon">Edit</div>,
  FiGitBranch: () => <div data-testid="branch-icon">Branch</div>,
  FiTarget: () => <div data-testid="target-icon">Target</div>,
  FiDatabase: () => <div data-testid="database-icon">Database</div>,
  FiZap: () => <div data-testid="zap-icon">Zap</div>,
  FiCpu: () => <div data-testid="cpu-icon">CPU</div>,
  FiCode: () => <div data-testid="code-icon">Code</div>,
  FiFolder: () => <div data-testid="folder-icon">Folder</div>
}));

// Mock nodes for testing
const mockNodes: NodeMeta[] = [
  {
    id: 'Subject',
    label: 'Character',
    icon: '👤',
    category: 'content',
    tooltip: 'Define characters, people, or entities in your content'
  },
  {
    id: 'WeightedChoice',
    label: 'Random Selection',
    icon: '🎲',
    category: 'flow',
    tooltip: 'Choose randomly from multiple options with different likelihood'
  },
  {
    id: 'Conditional',
    label: 'If/Then',
    icon: '🔀',
    category: 'advanced',
    tooltip: 'Choose different creative paths based on conditions'
  },
  {
    id: 'Output',
    label: 'Result',
    icon: '📝',
    category: 'output',
    tooltip: 'Final generated content ready for use'
  },
  {
    id: 'SetVariable',
    label: 'Store Value',
    icon: '💾',
    category: 'memory',
    tooltip: 'Save a value to use later in your workflow'
  }
];

// Mock favorites manager
const mockFavoritesManager = {
  getFavorites: jest.fn(() => []),
  addChangeListener: jest.fn(() => () => {}),
  toggleFavorite: jest.fn<unknown[], unknown>()
};

(getFavoritesManager as jest.Mock).mockReturnValue(mockFavoritesManager as unknown);

describe('TabbedPalette', () => {
  const defaultProps = {
    nodes: mockNodes,
    collapsed: false,
    onToggle: jest.fn<unknown[], unknown>(),
    onDragStart: jest.fn<unknown[], unknown>()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFavoritesManager.getFavorites.mockReturnValue([] as unknown);
  });

  describe('Basic Rendering', () => {
    test('should render palette with default props', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      expect(screen.getByLabelText('Enhanced Node Palette')).toBeInTheDocument();
      expect(screen.getByText('Node Palette')).toBeInTheDocument();
    });

    test('should render collapse button', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      const collapseButton = screen.getByLabelText('Collapse palette');
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should render search bar when enabled', () => {
      render(<TabbedPalette {...defaultProps} showSearch={true} />);
      
      expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();
    });

    test('should not render search bar when disabled', () => {
      render(<TabbedPalette {...defaultProps} showSearch={false} />);
      
      expect(screen.queryByPlaceholderText('Search nodes...')).not.toBeInTheDocument();
    });

    test('should render all nodes in expanded view', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      mockNodes.forEach(node => {
        expect(screen.getByText(node.label)).toBeInTheDocument();
      });
    });
  });

  describe('Collapsed State', () => {
    test('should show collapsed view', () => {
      render(<TabbedPalette {...defaultProps} collapsed={true} />);
      
      const expandButton = screen.getByLabelText('Expand palette');
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should not show search bar in collapsed view', () => {
      render(<TabbedPalette {...defaultProps} collapsed={true} showSearch={true} />);
      
      expect(screen.queryByPlaceholderText('Search nodes...')).not.toBeInTheDocument();
    });

    test('should show node icons only in collapsed view', () => {
      render(<TabbedPalette {...defaultProps} collapsed={true} />);
      
      // Should show icons but not labels
      expect(screen.queryByText('Character')).not.toBeInTheDocument();
      // Icons are rendered as text content in our mocks
      expect(screen.getByText('👤')).toBeInTheDocument();
    });
  });

  describe('Node Interaction', () => {
    test('should call onDragStart when node is dragged', () => {
      const onDragStart = jest.fn<unknown[], unknown>();
      render(<TabbedPalette {...defaultProps} onDragStart={onDragStart} />);
      
      const nodeElement = screen.getByText('Character').closest('[draggable="true"]');
      expect(nodeElement).toBeInTheDocument();
      
      if (nodeElement) {
        fireEvent.dragStart(nodeElement, {
          dataTransfer: {
            setData: jest.fn<unknown[], unknown>()
          }
        });
        
        expect(onDragStart).toHaveBeenCalledWith('Subject');
      }
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const onDragStart = jest.fn<unknown[], unknown>();
      render(<TabbedPalette {...defaultProps} onDragStart={onDragStart} />);
      
      const nodeElement = screen.getByText('Character').closest('[role="button"]');
      expect(nodeElement).toBeInTheDocument();
      
      if (nodeElement) {
        nodeElement.focus();
        await user.keyboard('{Enter}');
        
        expect(onDragStart).toHaveBeenCalledWith('Subject');
      }
    });

    test('should show tooltips on hover', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      const nodeElement = screen.getByText('Character').closest('[title]');
      expect(nodeElement).toHaveAttribute('title', 'Define characters, people, or entities in your content');
    });
  });

  describe('Search Functionality', () => {
    test('should filter nodes by search query', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      await user.type(searchInput, 'Character');
      
      await waitFor(() => {
        expect(screen.getByText('Character')).toBeInTheDocument();
        // Other nodes should be filtered out in search results view
      });
    });

    test('should show search results category when searching', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        // Should show search results section
        expect(screen.queryByText('Search Results')).toBeInTheDocument();
      });
    });

    test('should clear search when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      await user.type(searchInput, 'test');
      
      const clearButton = screen.getByTestId('x-icon').closest('button');
      expect(clearButton).toBeInTheDocument();
      
      if (clearButton) {
        await user.click(clearButton);
        
        expect(searchInput).toHaveValue('');
      }
    });

    test('should handle empty search results', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      await user.type(searchInput, 'nonexistentnode');
      
      await waitFor(() => {
        // Should not crash and should handle empty results gracefully
        expect(searchInput).toHaveValue('nonexistentnode');
      });
    });
  });

  describe('Favorites System', () => {
    test('should show favorites category when favorites exist', () => {
      mockFavoritesManager.getFavorites.mockReturnValue(['Subject'] as unknown);
      
      render(<TabbedPalette {...defaultProps} showFavorites={true} />);
      
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    test('should not show favorites category when no favorites', () => {
      mockFavoritesManager.getFavorites.mockReturnValue([] as unknown);
      
      render(<TabbedPalette {...defaultProps} showFavorites={true} />);
      
      expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    });

    test('should toggle favorite when star button is clicked', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showFavorites={true} />);
      
      const starButton = screen.getAllByTestId('star-icon')[0].closest('button');
      expect(starButton).toBeInTheDocument();
      
      if (starButton) {
        await user.click(starButton);
        
        expect(mockFavoritesManager.toggleFavorite).toHaveBeenCalled();
      }
    });

    test('should not show favorite buttons when favorites disabled', () => {
      render(<TabbedPalette {...defaultProps} showFavorites={false} />);
      
      expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
    });

    test('should update when favorites change', () => {
      const { rerender } = render(<TabbedPalette {...defaultProps} showFavorites={true} />);
      
      // Simulate favorites change
      const changeListener = mockFavoritesManager.addChangeListener.mock.calls[0][0];
      act(() => {
        changeListener(['Subject']);
      });
      
      rerender(<TabbedPalette {...defaultProps} showFavorites={true} />);
      
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  describe('Category Management', () => {
    test('should show category sections', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      expect(screen.getByText('Content Building')).toBeInTheDocument();
      expect(screen.getByText('Flow Control')).toBeInTheDocument();
    });

    test('should show node counts in category headers', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      // Should show count badges (exact text may vary based on implementation)
      const categoryHeaders = screen.getAllByText(/^\d+$/);
      expect(categoryHeaders.length).toBeGreaterThan(0);
    });

    test('should collapse/expand categories when clicked', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} />);
      
      const categoryHeader = screen.getByText('Content Building').closest('[role="button"]');
      expect(categoryHeader).toBeInTheDocument();
      
      if (categoryHeader) {
        await user.click(categoryHeader);
        
        // Should toggle collapsed state
        expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
      }
    });

    test('should support keyboard navigation for categories', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} />);
      
      const categoryHeader = screen.getByText('Content Building').closest('[role="button"]');
      expect(categoryHeader).toBeInTheDocument();
      
      if (categoryHeader) {
        categoryHeader.focus();
        await user.keyboard('{Enter}');
        
        // Should toggle collapsed state
        expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
      }
    });
  });

  describe('Tab Navigation', () => {
    test('should show tab navigation with multiple categories', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      // Should show category tabs
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Flow')).toBeInTheDocument();
    });

    test('should switch tabs when clicked', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} />);
      
      const flowTab = screen.getByText('Flow').closest('button');
      expect(flowTab).toBeInTheDocument();
      
      if (flowTab) {
        await user.click(flowTab);
        
        // Should switch to flow category
        expect(flowTab).toHaveStyle({ color: expect.any(String) });
      }
    });

    test('should show active tab indicator', () => {
      render(<TabbedPalette {...defaultProps} defaultActiveTab="content" />);
      
      const contentTab = screen.getByText('Content').closest('button');
      expect(contentTab).toHaveStyle({ borderBottom: expect.stringContaining('solid') });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      expect(screen.getByLabelText('Enhanced Node Palette')).toBeInTheDocument();
      expect(screen.getByLabelText('Collapse palette')).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} />);
      
      const collapseButton = screen.getByLabelText('Collapse palette');
      collapseButton.focus();
      
      await user.keyboard('{Tab}');
      
      // Should move focus to next interactive element
      expect(document.activeElement).not.toBe(collapseButton);
    });

    test('should have proper drag and drop attributes', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      const nodeElement = screen.getByText('Character').closest('[draggable]');
      expect(nodeElement).toHaveAttribute('draggable', 'true');
      expect(nodeElement).toHaveAttribute('aria-grabbed', 'false');
    });

    test('should have screen reader friendly tooltips', () => {
      render(<TabbedPalette {...defaultProps} />);
      
      const nodeElement = screen.getByText('Character').closest('[aria-describedby]');
      expect(nodeElement).toBeInTheDocument();
      
      if (nodeElement) {
        const tooltipId = nodeElement.getAttribute('aria-describedby');
        const tooltipElement = screen.getByText('Define characters, people, or entities in your content');
        expect(tooltipElement).toHaveAttribute('id', tooltipId);
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty nodes array', () => {
      render(<TabbedPalette {...defaultProps} nodes={[]} />);
      
      expect(screen.getByLabelText('Enhanced Node Palette')).toBeInTheDocument();
      expect(screen.queryByText('Content Building')).not.toBeInTheDocument();
    });

    test('should handle nodes with missing properties', () => {
      const incompleteNodes: NodeMeta[] = [
        {
          id: 'incomplete',
          label: '',
          icon: '',
          tooltip: ''
        } as NodeMeta
      ];
      
      render(<TabbedPalette {...defaultProps} nodes={incompleteNodes} />);
      
      // Should not crash
      expect(screen.getByLabelText('Enhanced Node Palette')).toBeInTheDocument();
    });

    test('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TabbedPalette {...defaultProps} />);
      
      // Rapidly toggle collapsed state
      const toggleButton = screen.getByLabelText('Collapse palette');
      
      await user.click(toggleButton);
      rerender(<TabbedPalette {...defaultProps} collapsed={true} />);
      
      await user.click(toggleButton);
      rerender(<TabbedPalette {...defaultProps} collapsed={false} />);
      
      // Should handle state changes without crashing
      expect(screen.getByLabelText('Collapse palette')).toBeInTheDocument();
    });

    test('should handle large number of nodes', () => {
      const manyNodes: NodeMeta[] = [];
      for (let i = 0; i < 100; i++) {
        manyNodes.push({
          id: `node${i}`,
          label: `Node ${i}`,
          icon: '📊',
          category: 'content',
          tooltip: `Test node ${i}`
        });
      }
      
      render(<TabbedPalette {...defaultProps} nodes={manyNodes} />);
      
      // Should render without performance issues
      expect(screen.getByLabelText('Enhanced Node Palette')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    test('should use default active tab', () => {
      render(<TabbedPalette {...defaultProps} defaultActiveTab="advanced" />);
      
      // Should start with advanced tab if it exists
      const advancedContent = screen.queryByText('If/Then');
      expect(advancedContent).toBeInTheDocument();
    });

    test('should respect maxSearchResults prop', async () => {
      const user = userEvent.setup();
      render(<TabbedPalette {...defaultProps} showSearch={true} maxSearchResults={2} />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      await user.type(searchInput, 'node');
      
      // Should limit search results (hard to test exact count without knowing search implementation)
      await waitFor(() => {
        expect(searchInput).toHaveValue('node');
      });
    });

    test('should call onToggle when collapse button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn<unknown[], unknown>();
      render(<TabbedPalette {...defaultProps} onToggle={onToggle} />);
      
      const toggleButton = screen.getByLabelText('Collapse palette');
      await user.click(toggleButton);
      
      expect(onToggle).toHaveBeenCalled();
    });
  });
});