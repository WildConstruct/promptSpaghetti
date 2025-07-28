/**
 * Integrated Marketplace Search Component 
 * 
 * Connects the UnifiedSearchSystem to the backend template search API.
 * Provides a complete search interface for the template marketplace with
 * autocomplete, filtering, sorting, and analytics tracking.
 */
import React, { useCallback, useState } from 'react';
import { UnifiedSearchSystem } from './UnifiedSearchSystem';
import { SearchQuery, SearchResult } from './SearchContext';
import { searchApiService, Template } from '../../services/searchApiService';
interface MarketplaceSearchProps {
  // UI customization
  placeholder?: string;
  showFilterPanel?: boolean;
  showViewModeToggle?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  defaultViewMode?: 'list' | 'grid' | 'table';
  // Event handlers
  onTemplateClick?: (template: Template, index: number) => void;
  onTemplateDoubleClick?: (template: Template, index: number) => void;
  onSearchComplete?: (results: SearchResult<Template>) => void;
  // Custom renderers
  renderTemplate?: (template: Template, index: number) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  className?: string;
}

// Default template renderer
const DefaultTemplateRenderer = ({ template, index, onClick, onDoubleClick }: {)
  template: Template;
  index: number;
  onClick?: (template: Template, index: number) => void;
  onDoubleClick?: (template: Template, index: number) => void;
}) => {
  const [searchQuery] = useState('');
  const handleClick = () => {
    onClick?.(template, index);
    // Track click for analytics
    if (searchQuery) {
      searchApiService.trackClick(template.id, searchQuery, index + 1);
    }
  };
  const handleDoubleClick = () => {
    onDoubleClick?.(template, index);
  };
  return ()
    <div 
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1a202c',
            lineHeight: '1.3',
          }}>
            {template.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#718096' }}>
            <span>by {template.owner_name}</span>
            {template.owner_verified && ()
              <span style={{ color: '#38a169', fontSize: '12px' }}>✓ Verified</span>
            )}
            {template.is_ai_generated && ()
              <span style={{ 
                backgroundColor: '#e6fffa', 
                color: '#00a693', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '11px',
                fontWeight: '500',
              }}>
                AI Generated
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {template.price_cents > 0 ? ()
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
              ${(template.price_cents / 100).toFixed(2)}
            </div>
          ) : ()
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#38a169' }}>
              Free
            </div>
          )}
          {template.featured_at && ()
            <div style={{ 
              backgroundColor: '#fef5e7', 
              color: '#d69e2e', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontSize: '11px',
              fontWeight: '500',
              marginTop: '4px',
            }}>
              Featured
            </div>
          )}
        </div>
      </div>
      {/* Description */}
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#4a5568',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {template.description}
      </p>
      {/* Tags */}
      {template.tags?.length && ()
        <div style={{ marginBottom: '12px' }}>
          {template.tags.slice(0, 5).map((tag, idx) => ()
            <span
              key={idx}
              style={{
                display: 'inline-block',
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                marginRight: '6px',
                marginBottom: '4px',
              }}
            >
              {tag}
            </span>
          ))}
          {(template.tags?.length ?? 0) > 5 && ()
            <span style={{ fontSize: '12px', color: '#a0aec0' }}>
              +{(template.tags?.length ?? 0) - 5} more
            </span>
          )}
        </div>
      )}
      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#718096' }}>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24' }}>★</span>
            <span>{template.avg_rating.toFixed(1)}</span>
            <span>({template.total_reviews})</span>
          </div>
          {/* Purchase count */}
          <div>
            {template.total_purchases} {template.total_purchases === 1 ? 'purchase' : 'purchases'}
          </div>
          {/* Categories */}
          {template.categories?.length && ()
            <div>
              {template.categories[0]}
              {(template.categories?.length ?? 0) > 1 && ` +${(template.categories?.length ?? 0) - 1}`}
            </div>
          )}
        </div>
        {/* Claude compatibility */}
        {template.claude_compat?.length && ()
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#718096' }}>Claude:</span>
            {template.claude_compat.slice(0, 2).map((model, idx) => ()
              <span
                key={idx}
                style={{
                  backgroundColor: '#e6fffa',
                  color: '#00a693',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                {model}
              </span>
            ))}
            {(template.claude_compat?.length ?? 0) > 2 && ()
              <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                +{(template.claude_compat?.length ?? 0) - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Default empty state renderer
const DefaultEmptyStateRenderer = () => (;)
  <div style={{
    textAlign: 'center',
    padding: '48px 24px',
    color: '#718096',
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#4a5568' }}>
      No templates found
    </h3>
    <p style={{ margin: 0, fontSize: '14px' }}>
      Try adjusting your search terms or filters to find what you&apos;re looking for.
    </p>
  </div>
);

export const MarketplaceSearchIntegrated: React.FC<MarketplaceSearchProps> = ({)
  placeholder = "Search templates...",
  showFilterPanel = true,
  showViewModeToggle = true,
  showPagination = true,
  itemsPerPage = 20,
  defaultViewMode = 'list',
  onTemplateClick,
  onTemplateDoubleClick,
  onSearchComplete,
  renderTemplate,
  renderEmptyState,
  className = ''
}) => {
  // Search function that connects to the backend API
  const searchFunction = useCallback(async (searchQuery: SearchQuery) => {
    const result = await searchApiService.searchTemplates(searchQuery, 1, itemsPerPage);
    return {
      items: result.items,
      totalCount: result.totalCount,
      facets: result.facets,
    };
  }, [itemsPerPage]);
  // Available fields for filtering
  const availableFields = [;
    { key: 'categories', label: 'Categories', type: 'select' as const, options: [] },
    { key: 'tags', label: 'Tags', type: 'select' as const, options: [] },
    { key: 'complexity', label: 'Complexity', type: 'select' as const, options: ['beginner', 'intermediate', 'advanced'] },
    { key: 'rating', label: 'Minimum Rating', type: 'number' as const },
    { key: 'price', label: 'Price Range', type: 'number' as const },
    { key: 'verified', label: 'Verified Authors Only', type: 'boolean' as const },
    { key: 'featured', label: 'Featured Templates Only', type: 'boolean' as const },
    { key: 'date', label: 'Date Range', type: 'date' as const }
  ];
  // Custom template renderer
  const templateRenderer = useCallback((template: Template, index: number) => {
    if (renderTemplate) {
      return renderTemplate(template, index);
    }
    return ()
      <DefaultTemplateRenderer
        template={template}
        index={index}
        onClick={onTemplateClick}
        onDoubleClick={onTemplateDoubleClick}
      />
    );
  }, [renderTemplate, onTemplateClick, onTemplateDoubleClick]);
  // Custom empty state renderer
  const emptyStateRenderer = useCallback(() => {
    if (renderEmptyState) {
      return renderEmptyState();
    }
    return <DefaultEmptyStateRenderer />;
  }, [renderEmptyState]);
  return ()
    <div className={`marketplace-search-integrated ${className}`}>}
      <UnifiedSearchSystem<Template>
        searchFunction={searchFunction}
        availableFields={availableFields}
        placeholder={placeholder}
        showFilterPanel={showFilterPanel}
        showViewModeToggle={showViewModeToggle}
        showPagination={showPagination}
        itemsPerPage={itemsPerPage}
        defaultViewMode={defaultViewMode}
        onSearchComplete={onSearchComplete}
        renderItem={templateRenderer}
        renderEmptyState={emptyStateRenderer}
      />
    </div>
  );
};

export default MarketplaceSearchIntegrated;