/**
 * Asset Library Component for Epic 1
 * Provides a collapsible panel with categorized presets that can be dragged onto nodes
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { medievalPresetCategories } from './medievalPresets';
import { Preset, PresetCategory, DraggedPreset } from './types';
import './AssetLibrary.css';

export interface AssetLibraryProps {
  onPresetDrag?: (preset: Preset) => void;
  position?: 'left' | 'right';
  defaultExpanded?: boolean;
}

// Draggable preset item component
const PresetItem: React.FC<{ 
  preset: Preset; 
  category: string;
  onHover?: (preset: Preset | null) => void;
}> = ({ preset, category, onHover }) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'preset',
    item: { preset, sourceCategory: category } as DraggedPreset,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [preset, category]);

  const handleMouseEnter = useCallback(() => {
    onHover?.(preset);
  }, [preset, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  return (
    <div
      ref={drag}
      className={`preset-item ${isDragging ? 'dragging' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={preset.metadata.description}
    >
      <span className="preset-name">{preset.name}</span>
      <span className="preset-type">{preset.nodeType}</span>
      {preset.tags.length > 0 && (
        <div className="preset-tags">
          {preset.tags.slice(0, 2).map(tag => (
            <span key={tag} className="preset-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// Category section component
const CategorySection: React.FC<{ 
  category: PresetCategory; 
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  onPresetHover?: (preset: Preset | null) => void;
}> = ({ category, isExpanded, onToggle, searchQuery, onPresetHover }) => {
  // Filter presets based on search
  const filteredPresets = useMemo(() => {
    if (!searchQuery) return category.presets;
    
    const query = searchQuery.toLowerCase();
    return category.presets.filter(preset => 
      preset.name.toLowerCase().includes(query) ||
      preset.tags.some(tag => tag.toLowerCase().includes(query)) ||
      preset.metadata.description?.toLowerCase().includes(query)
    );
  }, [category.presets, searchQuery]);

  if (filteredPresets.length === 0 && searchQuery) {
    return null;
  }

  return (
    <div className="category-section">
      <div className="category-header" onClick={onToggle}>
        <span className="category-icon">{category.icon}</span>
        <span className="category-name">{category.name}</span>
        <span className="category-count">{filteredPresets.length}</span>
        <span className={`category-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
      </div>
      {isExpanded && (
        <div className="category-presets">
          {filteredPresets.map(preset => (
            <PresetItem 
              key={preset.id} 
              preset={preset} 
              category={category.id}
              onHover={onPresetHover}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Asset Library Component
 * Displays categorized presets that can be dragged onto graph nodes
 */
export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onPresetDrag,
  position = 'left',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['character-occupations']) // Default expand first category
  );
  const [hoveredPreset, setHoveredPreset] = useState<Preset | null>(null);

  const toggleLibrary = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePresetHover = useCallback((preset: Preset | null) => {
    setHoveredPreset(preset);
  }, []);

  // Count total visible presets
  const totalPresets = useMemo(() => {
    return medievalPresetCategories.reduce((sum, cat) => sum + cat.presets.length, 0);
  }, []);

  return (
    <div className={`asset-library ${position} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="library-header" onClick={toggleLibrary}>
        <span className="library-icon">📚</span>
        <span className="library-title">Asset Library</span>
        <span className="library-count">{totalPresets}</span>
        <span className={`library-toggle ${isExpanded ? 'expanded' : ''}`}>◀</span>
      </div>
      
      {isExpanded && (
        <>
          <div className="library-search">
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="library-content">
            {medievalPresetCategories.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                searchQuery={searchQuery}
                onPresetHover={handlePresetHover}
              />
            ))}
          </div>

          {hoveredPreset && (
            <div className="preset-preview">
              <div className="preview-header">
                <strong>{hoveredPreset.name}</strong>
                <span className="preview-type">{hoveredPreset.nodeType}</span>
              </div>
              {hoveredPreset.metadata.description && (
                <div className="preview-description">{hoveredPreset.metadata.description}</div>
              )}
              <div className="preview-value">
                <pre>{JSON.stringify(hoveredPreset.value, null, 2)}</pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};