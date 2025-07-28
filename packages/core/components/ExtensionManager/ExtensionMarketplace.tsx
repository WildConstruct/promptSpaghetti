/**
 * Extension Marketplace - Epic 8.4 Story 8.4.5
 * Marketplace view for discovering and installing extensions
 */
import React, { useState } from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';

export interface ExtensionMarketplaceProps {
  extensions: ExtensionManifest[];
  selectedExtension: ExtensionManifest | null;
  onExtensionSelect: (extension: ExtensionManifest) => void;
  onInstallExtension: (extension: ExtensionManifest) => void;
}
interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export const ExtensionMarketplace: React.FC<ExtensionMarketplaceProps> = ({)
  extensions,
  selectedExtension,
  onExtensionSelect,
  onInstallExtension
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories: MarketplaceCategory[] = [
    {
      id: 'all',
      name: 'All Extensions',
      icon: '📦',
      description: 'Browse all available extensions',
      count: extensions.length,
    },
    {
      id: 'featured',
      name: 'Featured',
      icon: '⭐',
      description: 'Editor\'s choice and popular extensions',
      count: Math.floor(extensions.length * 0.3)
    },
    {
      id: 'node',
      name: 'Node Extensions',
      icon: '🔧',
      description: 'Add new node types and functionality',
      count: extensions.filter(ext => ext.extension_type === 'node').length
    },
    {
      id: 'ui',
      name: 'UI & Themes',
      icon: '🎨',
      description: 'Customize the interface and appearance',
      count: extensions.filter(ext => ext.extension_type === 'ui').length
    },
    {
      id: 'transform',
      name: 'Data Transforms',
      icon: '⚡',
      description: 'Process and transform your data',
      count: extensions.filter(ext => ext.extension_type === 'transform').length
    },
    {
      id: 'storage',
      name: 'Storage & Sync',
      icon: '💾',
      description: 'Connect to external storage and services',
      count: extensions.filter(ext => ext.extension_type === 'storage').length
    }
  ];
  const filteredExtensions = selectedCategory === 'all' ;
    ? extensions 
    : selectedCategory === 'featured'
      ? extensions.slice(0, Math.floor(extensions.length * 0.3))
      : extensions.filter(ext => ext.extension_type === selectedCategory);
  const getExtensionIcon = (type: string): string => {
    switch (type) {
    case 'node': return '🔧';
    case 'ui': return '🎨';
    case 'transform': return '⚡';
    case 'storage': return '💾';
    default: return '📦';
    }
  };
  const formatDownloads = (downloads: number): string => {
    if (downloads < 1000) return downloads.toString();
    if (downloads < 1000000) return `${(downloads / 1000).toFixed(1)}K`;}
    return `${(downloads / 1000000).toFixed(1)}M`;}
  };
  const renderExtensionGrid = () => (;)
    <div className="extension-grid">
      {filteredExtensions.map((extension) => {
        const downloads = Math.floor(Math.random() * 50000);
        const rating = (4 + Math.random()).toFixed(1);
        const isSelected = selectedExtension?.id === extension.id;
        return ()
          <div
            key={extension.id}
            className={`extension-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onExtensionSelect(extension)}
          >
            <div className="card-header">
              <div className="extension-icon">
                {getExtensionIcon(extension.extension_type)}
              </div>
              <div className="card-actions">
                <button
                  className="install-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInstallExtension(extension);
                  }}
                >
                  Install
                </button>
              </div>
            </div>
            <div className="card-content">
              <h3 className="extension-name">{extension.name}</h3>
              <p className="extension-author">by {extension.author}</p>
              <p className="extension-description">{extension.description}</p>
              <div className="extension-tags">
                <span className="tag type-tag">{extension.extension_type}</span>
                {extension.capabilities?.provides?.slice(0, 2).map((capability, index) => ()
                  <span key={index} className="tag capability-tag">
                    {capability}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <div className="extension-stats">
                <span className="stat">
                  <span className="stat-icon">⬇️</span>
                  <span className="stat-value">{formatDownloads(downloads)}</span>
                </span>
                <span className="stat">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">{rating}</span>
                </span>
                <span className="stat">
                  <span className="stat-icon">📅</span>
                  <span className="stat-value">v{extension.version}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  const renderExtensionList = () => (;)
    <div className="extension-list">
      {filteredExtensions.map((extension) => {
        const downloads = Math.floor(Math.random() * 50000);
        const rating = (4 + Math.random()).toFixed(1);
        const isSelected = selectedExtension?.id === extension.id;
        return ()
          <div
            key={extension.id}
            className={`extension-list-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onExtensionSelect(extension)}
          >
            <div className="item-icon">
              {getExtensionIcon(extension.extension_type)}
            </div>
            <div className="item-content">
              <div className="item-header">
                <h3 className="extension-name">{extension.name}</h3>
                <span className="extension-version">v{extension.version}</span>
              </div>
              <p className="extension-author">by {extension.author}</p>
              <p className="extension-description">{extension.description}</p>
              <div className="item-stats">
                <span className="stat">⬇️ {formatDownloads(downloads)}</span>
                <span className="stat">⭐ {rating}</span>
                <span className="stat">{extension.extension_type}</span>
              </div>
            </div>
            <div className="item-actions">
              <button
                className="install-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onInstallExtension(extension);
                }}
              >
                Install
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (filteredExtensions.length === 0) {
    return ()
      <div className="marketplace-empty">
        <div className="empty-icon">🏪</div>
        <h3>No Extensions Found</h3>
        <p>No extensions available in the selected category.</p>
      </div>
    );
  }
  return ()
    <div className="extension-marketplace">
      {/* Featured Banner */}
      {selectedCategory === 'all' && ()
        <div className="featured-banner">
          <div className="banner-content">
            <h2>Welcome to the Extension Marketplace</h2>
            <p>Discover powerful extensions to enhance your workflow</p>
          </div>
          <div className="banner-stats">
            <div className="stat-item">
              <span className="stat-number">{extensions.length}</span>
              <span className="stat-label">Extensions</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{categories.length - 2}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free</span>
            </div>
          </div>
        </div>
      )}
      {/* Categories */}
      <div className="marketplace-categories">
        {categories.map((category) => ()
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <div className="category-info">
              <span className="category-name">{category.name}</span>
              <span className="category-count">({category.count})</span>
            </div>
          </button>
        ))}
      </div>
      {/* View Controls */}
      <div className="marketplace-controls">
        <div className="category-description">
          {selectedCategory !== 'all' && ()
            <div className="active-category">
              <span className="category-icon">
                {categories.find(c => c.id === selectedCategory)?.icon}
              </span>
              <div className="category-text">
                <h3>{categories.find(c => c.id === selectedCategory)?.name}</h3>
                <p>{categories.find(c => c.id === selectedCategory)?.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="view-controls">
          <span className="view-label">View:</span>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            ⊞
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            ☰
          </button>
        </div>
      </div>
      {/* Extension Display */}
      <div className="marketplace-content">
        {viewMode === 'grid' ? renderExtensionGrid() : renderExtensionList()}
      </div>
      {/* Load More */}
      {filteredExtensions.length > 20 && ()
        <div className="load-more-section">
          <button className="load-more-btn">
            Load More Extensions
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtensionMarketplace;