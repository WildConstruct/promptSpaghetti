// packages/core/components/TemplateDialogs/TemplateBrowser.tsx
// Epic 8.7 Task 6: Template Library - Template Browser Component

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Template, 
  TemplateFilter, 
  TemplateCategory, 
  TemplateInstantiationOptions,
  TemplateBrowserState
} from '../../types/TemplateTypes';
import { templateService } from '../../services/TemplateService';

interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateId: string, options: TemplateInstantiationOptions) => Promise<void>;
  currentAuthor?: string; // For filtering "my templates"
}

const TEMPLATE_CATEGORIES: Array<{ value: TemplateCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'character', label: 'Character' },
  { value: 'setting', label: 'Setting' },
  { value: 'mood', label: 'Mood' },
  { value: 'action', label: 'Action' },
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'world-building', label: 'World Building' },
  { value: 'narrative', label: 'Narrative' },
  { value: 'technical', label: 'Technical' },
  { value: 'vfx', label: 'VFX' },
  { value: 'general', label: 'General' }
];

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentAuthor = 'current-user'
}) => {
  const [browserState, setBrowserState] = useState<TemplateBrowserState>({
    isOpen: false,
    viewMode: 'grid',
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'modified',
    showOnlyMyTemplates: false,
    previewTemplate: null
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instantiation options state
  const [instantiationOptions, setInstantiationOptions] = useState<TemplateInstantiationOptions>({
    preservePositions: false,
    mergeWithCurrent: false,
    offsetX: 100,
    offsetY: 100
  });

  // Load templates
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filter: TemplateFilter = {
        category: browserState.selectedCategory === 'all' ? undefined : browserState.selectedCategory,
        searchTerm: browserState.searchQuery || undefined,
        sortBy: browserState.sortBy,
        sortOrder: 'desc',
        author: browserState.showOnlyMyTemplates ? currentAuthor : undefined
      };

      const loadedTemplates = await templateService.searchTemplates(filter);
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [browserState, currentAuthor]);

  // Load templates when browser state changes
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  const handleStateChange = useCallback((updates: Partial<TemplateBrowserState>) => {
    setBrowserState(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePreviewTemplate = useCallback((template: Template) => {
    setBrowserState(prev => ({ ...prev, previewTemplate: template }));
  }, []);

  const handleApplyTemplate = useCallback(async (template: Template) => {
    try {
      await onApplyTemplate(template.id, instantiationOptions);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to apply template');
    }
  }, [instantiationOptions, onApplyTemplate, onClose]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setBrowserState(prev => ({ ...prev, previewTemplate: null }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete template');
    }
  }, []);

  // Filter templates by search query for client-side filtering
  const filteredTemplates = useMemo(() => {
    return templates; // Server-side filtering already applied
  }, [templates]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90vw',
        height: '90vh',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
            Template Library
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar - Filters */}
          <div style={{
            width: '250px',
            borderRight: '1px solid #e5e7eb',
            padding: '16px',
            overflow: 'auto'
          }}>
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search templates..."
                value={browserState.searchQuery}
                onChange={(e) => handleStateChange({ searchQuery: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Category
              </label>
              <select
                value={browserState.selectedCategory}
                onChange={(e) => handleStateChange({ selectedCategory: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Sort By
              </label>
              <select
                value={browserState.sortBy}
                onChange={(e) => handleStateChange({ sortBy: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="modified">Recently Modified</option>
                <option value="created">Recently Created</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
                <option value="usage">Most Used</option>
              </select>
            </div>

            {/* View Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={browserState.showOnlyMyTemplates}
                  onChange={(e) => handleStateChange({ showOnlyMyTemplates: e.target.checked })}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>
                  Show only my templates
                </span>
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleStateChange({ viewMode: 'grid' })}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: browserState.viewMode === 'grid' ? '#3b82f6' : 'white',
                    color: browserState.viewMode === 'grid' ? 'white' : '#374151',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => handleStateChange({ viewMode: 'list' })}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: browserState.viewMode === 'list' ? '#3b82f6' : 'white',
                    color: browserState.viewMode === 'list' ? 'white' : '#374151',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  List
                </button>
              </div>
            </div>

            {/* Instantiation Options */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500' }}>
                Apply Options
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={instantiationOptions.preservePositions}
                    onChange={(e) => setInstantiationOptions(prev => ({
                      ...prev,
                      preservePositions: e.target.checked
                    }))}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '12px' }}>Preserve positions</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={instantiationOptions.mergeWithCurrent}
                    onChange={(e) => setInstantiationOptions(prev => ({
                      ...prev,
                      mergeWithCurrent: e.target.checked
                    }))}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '12px' }}>Merge with current</span>
                </label>

                {!instantiationOptions.preservePositions && (
                  <div style={{ paddingLeft: '18px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Offset:</span>
                      <input
                        type="number"
                        value={instantiationOptions.offsetX}
                        onChange={(e) => setInstantiationOptions(prev => ({
                          ...prev,
                          offsetX: Number(e.target.value)
                        }))}
                        style={{
                          width: '50px',
                          padding: '2px 4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '2px',
                          fontSize: '11px'
                        }}
                      />
                      <input
                        type="number"
                        value={instantiationOptions.offsetY}
                        onChange={(e) => setInstantiationOptions(prev => ({
                          ...prev,
                          offsetY: Number(e.target.value)
                        }))}
                        style={{
                          width: '50px',
                          padding: '2px 4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '2px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {error && (
              <div style={{
                margin: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {isLoading ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>No templates found</div>
                <div style={{ fontSize: '12px' }}>
                  Try adjusting your search criteria or create a new template
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px'
              }}>
                {browserState.viewMode === 'grid' ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {filteredTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => handlePreviewTemplate(template)}
                        onApply={() => handleApplyTemplate(template)}
                        onDelete={() => handleDeleteTemplate(template.id)}
                        showDelete={template.author === currentAuthor}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredTemplates.map(template => (
                      <TemplateListItem
                        key={template.id}
                        template={template}
                        onPreview={() => handlePreviewTemplate(template)}
                        onApply={() => handleApplyTemplate(template)}
                        onDelete={() => handleDeleteTemplate(template.id)}
                        showDelete={template.author === currentAuthor}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {browserState.previewTemplate && (
        <TemplatePreview
          template={browserState.previewTemplate}
          onClose={() => setBrowserState(prev => ({ ...prev, previewTemplate: null }))}
          onApply={() => handleApplyTemplate(browserState.previewTemplate!)}
        />
      )}
    </div>
  );
};

// Template Card Component for Grid View
const TemplateCard: React.FC<{
  template: Template;
  onPreview: () => void;
  onApply: () => void;
  onDelete: () => void;
  showDelete: boolean;
}> = ({ template, onPreview, onApply, onDelete, showDelete }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
    }}
    onClick={onPreview}
    >
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px'
          }}
          title="Delete template"
        >
          🗑️
        </button>
      )}
      
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1f2937',
          lineHeight: '1.2'
        }}>
          {template.name}
        </h3>
        <p style={{ 
          margin: 0, 
          fontSize: '13px', 
          color: '#6b7280',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {template.description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{
          padding: '2px 6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#374151',
          textTransform: 'capitalize'
        }}>
          {template.category.replace('-', ' ')}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#f59e0b' }}>★</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {template.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{ 
        fontSize: '11px', 
        color: '#9ca3af',
        marginBottom: '12px'
      }}>
        by {template.author} • {template.metadata.nodeCount} nodes
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onApply();
        }}
        style={{
          width: '100%',
          padding: '6px 12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '13px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        Apply Template
      </button>
    </div>
  );
};

// Template List Item Component for List View
const TemplateListItem: React.FC<{
  template: Template;
  onPreview: () => void;
  onApply: () => void;
  onDelete: () => void;
  showDelete: boolean;
}> = ({ template, onPreview, onApply, onDelete, showDelete }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '12px 16px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#f9fafb';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'white';
    }}
    onClick={onPreview}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
            {template.name}
          </h4>
          <span style={{
            padding: '1px 4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '6px',
            fontSize: '10px',
            color: '#374151',
            textTransform: 'capitalize'
          }}>
            {template.category.replace('-', ' ')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: '#f59e0b' }}>★</span>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
              {template.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '12px', 
          color: '#6b7280',
          lineHeight: '1.3'
        }}>
          {template.description}
        </p>
        <div style={{ 
          fontSize: '10px', 
          color: '#9ca3af',
          marginTop: '4px'
        }}>
          by {template.author} • {template.metadata.nodeCount} nodes • {new Date(template.metadata.lastModified).toLocaleDateString()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          style={{
            padding: '4px 8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Apply
        </button>
        
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

// Template Preview Modal
const TemplatePreview: React.FC<{
  template: Template;
  onClose: () => void;
  onApply: () => void;
}> = ({ template, onClose, onApply }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90vw',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
            {template.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
            {template.description}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Category:</strong>
            <div style={{ fontSize: '14px', textTransform: 'capitalize' }}>
              {template.category.replace('-', ' ')}
            </div>
          </div>
          <div>
            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Author:</strong>
            <div style={{ fontSize: '14px' }}>{template.author}</div>
          </div>
          <div>
            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Nodes:</strong>
            <div style={{ fontSize: '14px' }}>{template.metadata.nodeCount}</div>
          </div>
          <div>
            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Rating:</strong>
            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#f59e0b' }}>★</span>
              {template.rating.toFixed(1)} ({template.reviews.length} reviews)
            </div>
          </div>
        </div>

        {template.metadata.tags.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Tags:
            </strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {template.metadata.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#374151'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};