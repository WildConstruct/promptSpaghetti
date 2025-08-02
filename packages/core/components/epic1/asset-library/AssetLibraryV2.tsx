/**
 * Asset Library V2 Component for Epic 1
 * Enhanced multi-column browser for hundreds of presets
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { medievalPresetCategories } from './medievalPresets';
import { Preset, PresetCategory, DraggedPreset } from './types';
import './AssetLibraryV2.css';

export interface AssetLibraryV2Props {
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  position?: 'left' | 'right' | 'bottom';
  defaultExpanded?: boolean;
}

// Column navigation state
interface NavigationState {
  category: string | null;
  subcategory: string | null;
  genre: string | null;
  timbre: string | null;
}

// Preset list item component
const PresetListItem: React.FC<{
  preset: Preset;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ preset, onSelect, isSelected }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'preset',
    item: { preset } as DraggedPreset,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [preset]);

  return (
    <div
      ref={drag}
      className={`preset-list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
    >
      <div className="preset-rating">
        {'★'.repeat(preset.metadata.rating || 4)}
        <span className="preset-rating-empty">{'★'.repeat(5 - (preset.metadata.rating || 4))}</span>
      </div>
      <div className="preset-name">{preset.name}</div>
    </div>
  );
};

// Navigation column component
const NavigationColumn: React.FC<{
  title: string;
  items: Array<{ id: string; name: string; count?: number }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  highlightColor?: string;
}> = ({ title, items, selectedId, onSelect, highlightColor = '#2196F3' }) => {
  return (
    <div className="nav-column">
      <div className="nav-column-header">{title}</div>
      <div className="nav-column-items">
        {items.map(item => (
          <div
            key={item.id}
            className={`nav-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item.id)}
            style={selectedId === item.id ? { backgroundColor: highlightColor } : {}}
          >
            <span className="nav-item-name">{item.name}</span>
            {item.count !== undefined && (
              <span className="nav-item-count">{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Enhanced Asset Library with multi-column navigation
 */
export const AssetLibraryV2: React.FC<AssetLibraryV2Props> = ({
  onPresetDrag,
  onPresetSelect,
  position = 'bottom',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigation, setNavigation] = useState<NavigationState>({
    category: 'All',
    subcategory: null,
    genre: null,
    timbre: null
  });
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [userTags, setUserTags] = useState<string[]>([]);

  // Mock enhanced category structure for demonstration
  const categories = useMemo(() => [
    { id: 'All', name: 'All', count: 47 },
    { id: 'character-occupations', name: 'Characters', count: 12 },
    { id: 'environments', name: 'Environments', count: 8 },
    { id: 'clothing', name: 'Clothing', count: 10 },
    { id: 'actions', name: 'Actions', count: 7 },
    { id: 'traits', name: 'Traits', count: 5 },
    { id: 'items', name: 'Items', count: 5 }
  ], []);

  // Mock subcategories based on selected category
  const subcategories = useMemo(() => {
    if (navigation.category === 'Characters') {
      return [
        { id: 'All', name: 'All' },
        { id: 'medieval', name: 'Medieval' },
        { id: 'fantasy', name: 'Fantasy' },
        { id: 'modern', name: 'Modern' },
        { id: 'scifi', name: 'Sci-Fi' }
      ];
    }
    return [{ id: 'All', name: 'All' }];
  }, [navigation.category]);

  // Mock genres
  const genres = useMemo(() => [
    { id: 'All', name: 'All' },
    { id: 'hero', name: 'Hero' },
    { id: 'villain', name: 'Villain' },
    { id: 'neutral', name: 'Neutral' },
    { id: 'comic', name: 'Comic' }
  ], []);

  // Mock timbres
  const timbres = useMemo(() => [
    { id: 'All', name: 'All' },
    { id: 'simple', name: 'Simple' },
    { id: 'complex', name: 'Complex' },
    { id: 'detailed', name: 'Detailed' },
    { id: 'minimal', name: 'Minimal' }
  ], []);

  // Filter presets based on navigation and search
  const filteredPresets = useMemo(() => {
    let presets: Preset[] = [];
    
    // Collect all presets from categories
    medievalPresetCategories.forEach(cat => {
      if (navigation.category === 'All' || cat.id === navigation.category) {
        presets = presets.concat(cat.presets);
      }
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(preset =>
        preset.name.toLowerCase().includes(query) ||
        preset.tags.some(tag => tag.toLowerCase().includes(query)) ||
        preset.metadata.description?.toLowerCase().includes(query)
      );
    }

    return presets;
  }, [navigation, searchQuery]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setNavigation({
      category: categoryId,
      subcategory: 'All',
      genre: 'All',
      timbre: 'All'
    });
  }, []);

  const handlePresetSelect = useCallback((preset: Preset) => {
    setSelectedPreset(preset);
    onPresetSelect?.(preset);
  }, [onPresetSelect]);

  const toggleLibrary = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={`asset-library-v2 ${position} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header Bar */}
      <div className="library-header-v2" onClick={toggleLibrary}>
        <span className="library-icon">📚</span>
        <span className="library-title">Asset Browser</span>
        <span className="preset-count">{filteredPresets.length} Presets</span>
        <button className="library-toggle-btn">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="library-body-v2">
          {/* Navigation Columns - Reduced for vertical layout */}
          <div className="navigation-section">
            <NavigationColumn
              title="Category"
              items={categories}
              selectedId={navigation.category}
              onSelect={handleCategorySelect}
            />
            <NavigationColumn
              title="Subcategory"
              items={subcategories}
              selectedId={navigation.subcategory}
              onSelect={(id) => setNavigation({ ...navigation, subcategory: id })}
            />
          </div>

          {/* Results Section */}
          <div className="results-section">
            {/* Search Bar */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Search presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-v2"
              />
              <button className="search-btn">🔍</button>
            </div>

            {/* Preset List */}
            <div className="preset-list">
              <div className="preset-list-header">
                <span>Rating</span>
                <span>Preset</span>
              </div>
              <div className="preset-list-content">
                {filteredPresets.map((preset, index) => (
                  <PresetListItem
                    key={`${preset.id}-${index}`}
                    preset={preset}
                    onSelect={() => handlePresetSelect(preset)}
                    isSelected={selectedPreset?.id === preset.id}
                  />
                ))}
              </div>
            </div>

            {/* User Tags Section */}
            <div className="tags-section">
              <div className="tags-header">
                <span>User Tags</span>
                <button className="edit-tags-btn">Edit</button>
              </div>
              <div className="tags-content">
                {userTags.length === 0 ? (
                  <div className="no-tags">No tags added</div>
                ) : (
                  userTags.map(tag => (
                    <span key={tag} className="user-tag">{tag}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {selectedPreset && (
            <div className="preview-section">
              <h3>{selectedPreset.name}</h3>
              <div className="preview-type">{selectedPreset.nodeType}</div>
              <div className="preview-description">
                {selectedPreset.metadata.description || 'No description available'}
              </div>
              <div className="preview-tags">
                {selectedPreset.tags.map(tag => (
                  <span key={tag} className="preset-tag">{tag}</span>
                ))}
              </div>
              <div className="preview-actions">
                <button className="use-preset-btn" onClick={() => onPresetDrag?.(selectedPreset)}>
                  Use Preset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetLibraryV2;