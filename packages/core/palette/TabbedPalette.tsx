// packages/core/palette/TabbedPalette.tsx
// Enhanced tabbed palette for Epic 7.2 Palette Categorization

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NodeMeta } from '../Palette';
import { 
  NODE_CATEGORIES, 
  SPECIAL_CATEGORIES, 
  getAllCategories, 
  getNodeCategories, 
  getCategoryById, 
  getCategoryColor 
} from './NodeCategory';
import { getFavoritesManager, FavoritesManager } from './FavoritesManager';
import { PaletteSearch, SearchResult, createPaletteSearch } from './PaletteSearch';
import { 
  FiSearch, 
  FiStar, 
  FiX, 
  FiChevronDown, 
  FiChevronRight,
  FiFilter,
  FiMoreHorizontal
} from 'react-icons/fi';
import { professionalColors } from '../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {
  ...professionalColors,
  accent: {
    ...professionalColors.accent,
    primary: professionalColors.accent.orange,
    secondary: professionalColors.accent.blue
  },
  ui: {
    ...professionalColors.ui,
    selected: '#353535',
    disabled: '#6b7280'
  },
  text: {
    ...professionalColors.text,
    disabled: '#6b7280'
  }
};

export interface TabbedPaletteProps {
  nodes: NodeMeta[];
  collapsed: boolean;
  onToggle: () => void;
  onDragStart?: (nodeId: string) => void;
  defaultActiveTab?: string;
  showSearch?: boolean;
  showFavorites?: boolean;
  maxSearchResults?: number;
}

/**
 * Enhanced tabbed palette with search and favorites
 */
export const TabbedPalette: React.FC<TabbedPaletteProps> = ({
  nodes,
  collapsed,
  onToggle,
  onDragStart,
  defaultActiveTab = 'content',
  showSearch = true,
  showFavorites = true,
  maxSearchResults = 20
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Managers
  const [favoritesManager] = useState<FavoritesManager>(() => getFavoritesManager());
  const [searchEngine] = useState<PaletteSearch>(() => createPaletteSearch(nodes));

  // Update search engine when nodes change
  useEffect(() => {
    searchEngine.updateNodes(nodes);
  }, [nodes, searchEngine]);

  // Load favorites
  useEffect(() => {
    setFavorites(favoritesManager.getFavorites());
    
    const unsubscribe = favoritesManager.addChangeListener((newFavorites) => {
      setFavorites(newFavorites);
    });
    
    return unsubscribe;
  }, [favoritesManager]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchEngine.search(searchQuery, {
        maxResults: maxSearchResults,
        fuzzyThreshold: 0.5,
        sortByRelevance: true
      });
      setSearchResults(results);
      setActiveTab(SPECIAL_CATEGORIES.SEARCH_RESULTS);
    } else {
      setSearchResults([]);
      if (activeTab === SPECIAL_CATEGORIES.SEARCH_RESULTS) {
        setActiveTab('content');
      }
    }
  }, [searchQuery, searchEngine, maxSearchResults, activeTab]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = getAllCategories();
    
    // Add special categories if enabled
    const specialCats = [];
    
    if (showFavorites && favorites.length > 0) {
      specialCats.push(NODE_CATEGORIES[SPECIAL_CATEGORIES.FAVORITES]);
    }
    
    if (searchQuery.trim() && searchResults.length > 0) {
      specialCats.push(NODE_CATEGORIES[SPECIAL_CATEGORIES.SEARCH_RESULTS]);
    }
    
    return [...specialCats, ...categories];
  }, [favorites, searchResults, searchQuery, showFavorites]);

  // Get nodes for active category
  const getNodesForCategory = useCallback((categoryId: string): NodeMeta[] => {
    if (categoryId === SPECIAL_CATEGORIES.FAVORITES) {
      return nodes.filter(node => favorites.includes(node.id));
    }
    
    if (categoryId === SPECIAL_CATEGORIES.SEARCH_RESULTS) {
      return searchResults.map(result => result.node);
    }
    
    if (categoryId === SPECIAL_CATEGORIES.ALL) {
      return nodes;
    }
    
    return nodes.filter(node => {
      const nodeCategories = getNodeCategories(node.id);
      return nodeCategories.includes(categoryId);
    });
  }, [nodes, favorites, searchResults]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    favoritesManager.toggleFavorite(nodeId);
  }, [favoritesManager]);

  // Handle category collapse toggle
  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  }, [collapsedCategories]);

  // Render node item
  const renderNodeItem = useCallback((node: NodeMeta, showCategory: boolean = false) => {
    const isFavorited = favorites.includes(node.id);
    const nodeCategories = getNodeCategories(node.id);
    const primaryCategory = nodeCategories[0];
    const categoryColor = getCategoryColor(primaryCategory, 0.6);

    return (
      <div
        key={node.id}
        role="button"
        tabIndex={0}
        draggable
        aria-label={`${node.label} - ${node.tooltip}`.trim()}
        aria-describedby={`tooltip-${node.id}`}
        aria-grabbed="false"
        onDragStart={(e) => {
          e.dataTransfer?.setData?.('application/node-type', node.id);
          onDragStart?.(node.id);
        }}
        title={node.tooltip}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 8,
          padding: collapsed ? '8px 4px' : '8px 12px',
          marginBottom: 2,
          borderRadius: 4,
          background: 'none',
          cursor: 'grab',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = uiColors.ui.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'none';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onDragStart?.(node.id);
          }
        }}
      >
        {/* Hidden tooltip for accessibility */}
        <span 
          id={`tooltip-${node.id}`} 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            width: 1, 
            height: 1, 
            overflow: 'hidden' 
          }}
        >
          {node.tooltip}
        </span>
        
        {/* Node icon */}
        <span 
          style={{ 
            fontSize: collapsed ? 18 : 20, 
            width: collapsed ? 20 : 24, 
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          {node.icon}
        </span>
        
        {/* Node details (expanded view only) */}
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: 12, 
              fontWeight: 500,
              color: uiColors.text.primary,
              marginBottom: 2
            }}>
              {node.label}
            </div>
            <div style={{ 
              fontSize: 10, 
              color: uiColors.text.secondary,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {node.tooltip}
            </div>
          </div>
        )}
        
        {/* Category badge (when showing search results) */}
        {!collapsed && showCategory && primaryCategory && (
          <div style={{
            padding: '2px 6px',
            borderRadius: 3,
            backgroundColor: categoryColor,
            fontSize: 9,
            fontWeight: 500,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            {getCategoryById(primaryCategory)?.name.split(' ')[0]}
          </div>
        )}
        
        {/* Favorite button (expanded view only) */}
        {!collapsed && showFavorites && (
          <button
            onClick={(e) => handleFavoriteToggle(node.id, e)}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: isFavorited ? '#fbbf24' : uiColors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = uiColors.ui.selected;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiStar size={12} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    );
  }, [collapsed, favorites, showFavorites, onDragStart, handleFavoriteToggle]);

  // Render category section
  const renderCategorySection = useCallback((category: typeof NODE_CATEGORIES[keyof typeof NODE_CATEGORIES]) => {
    const categoryNodes = getNodesForCategory(category.id);
    const isCollapsed = collapsedCategories.has(category.id);
    const isSearchResults = category.id === SPECIAL_CATEGORIES.SEARCH_RESULTS;
    const CategoryIcon = category.icon;

    if (categoryNodes.length === 0) return null;

    return (
      <div key={category.id} style={{ marginBottom: 12 }}>
        {/* Category header */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => category.collapsible && handleCategoryToggle(category.id)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && category.collapsible) {
              handleCategoryToggle(category.id);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            marginBottom: isCollapsed ? 0 : 8,
            cursor: category.collapsible ? 'pointer' : 'default',
            borderRadius: 4,
            transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            if (category.collapsible) {
              e.currentTarget.style.backgroundColor = uiColors.ui.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Collapse indicator */}
          {category.collapsible && (
            <div style={{ width: 12, display: 'flex', justifyContent: 'center' }}>
              {isCollapsed ? (
                <FiChevronRight size={10} color={uiColors.text.secondary} />
              ) : (
                <FiChevronDown size={10} color={uiColors.text.secondary} />
              )}
            </div>
          )}
          
          {/* Category icon */}
          <CategoryIcon size={12} color={category.color} />
          
          {/* Category name and count */}
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: uiColors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flex: 1
          }}>
            {category.name}
          </div>
          
          <div style={{
            fontSize: 9,
            color: uiColors.text.secondary,
            backgroundColor: uiColors.ui.selected,
            padding: '2px 5px',
            borderRadius: 3,
            minWidth: 16,
            textAlign: 'center'
          }}>
            {categoryNodes.length}
          </div>
        </div>
        
        {/* Category nodes */}
        {!isCollapsed && (
          <div style={{ marginLeft: category.collapsible ? 18 : 0 }}>
            {categoryNodes.map(node => renderNodeItem(node, isSearchResults))}
          </div>
        )}
      </div>
    );
  }, [getNodesForCategory, collapsedCategories, handleCategoryToggle, renderNodeItem]);

  return (
    <aside
      aria-label="Enhanced Node Palette"
      style={{
        width: collapsed ? 56 : 240,
        background: uiColors.background.primary,
        color: uiColors.text.primary,
        borderRight: `1px solid ${uiColors.ui.border}`,
        padding: 0,
        height: '100%',
        transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with collapse button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderBottom: `1px solid ${uiColors.ui.border}`,
        background: uiColors.background.secondary
      }}>
        <button
          aria-label={collapsed ? 'Expand palette' : 'Collapse palette'}
          aria-expanded={!collapsed}
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: uiColors.text.primary,
            fontSize: 16,
            padding: 6,
            cursor: 'pointer',
            outline: 'none',
            borderRadius: 4,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = uiColors.ui.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {collapsed ? '»' : '«'}
        </button>
        
        {!collapsed && (
          <div style={{
            flex: 1,
            marginLeft: 8,
            fontSize: 12,
            fontWeight: 600,
            color: uiColors.text.primary
          }}>
            Node Palette
          </div>
        )}
      </div>

      {/* Search bar (expanded view only) */}
      {!collapsed && showSearch && (
        <div style={{
          padding: '8px',
          borderBottom: `1px solid ${uiColors.ui.border}`,
          background: uiColors.background.secondary
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiSearch 
              size={14} 
              color={uiColors.text.secondary}
              style={{
                position: 'absolute',
                left: 8,
                zIndex: 1
              }}
            />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 28px 6px 28px',
                border: `1px solid ${uiColors.ui.border}`,
                borderRadius: 4,
                backgroundColor: uiColors.background.primary,
                color: uiColors.text.primary,
                fontSize: 11,
                outline: 'none',
                transition: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = uiColors.accent.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = uiColors.ui.border;
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  background: 'none',
                  border: 'none',
                  color: uiColors.text.secondary,
                  cursor: 'pointer',
                  padding: 2,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab navigation (expanded view only) */}
      {!collapsed && availableCategories.length > 1 && (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          borderBottom: `1px solid ${uiColors.ui.border}`,
          background: uiColors.background.secondary,
          scrollbarWidth: 'thin'
        }}>
          {availableCategories.slice(0, 4).map((category) => {
            const isActive = activeTab === category.id;
            const CategoryIcon = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 8px',
                  border: 'none',
                  background: 'none',
                  color: isActive ? category.color : uiColors.text.secondary,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: isActive ? `2px solid ${category.color}` : '2px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap'
                }}
                title={category.description}
              >
                <CategoryIcon size={12} />
                <span>{category.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: collapsed ? '4px 2px' : '8px'
      }}>
        {collapsed ? (
          // Collapsed view - show all nodes as icons
          nodes.map(node => renderNodeItem(node))
        ) : (
          // Expanded view - show categories
          availableCategories
            .filter(category => activeTab === category.id || availableCategories.length === 1)
            .map(category => renderCategorySection(category))
        )}
      </div>
    </aside>
  );
};