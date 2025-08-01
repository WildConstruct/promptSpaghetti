/**
 * Advanced Export Template Manager Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 * 
 * Professional template management system for advanced export workflows with
 * template creation, customization, sharing, and collaboration features.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ExportTemplate, 
  CreateExportTemplate, 
  UpdateExportTemplate, 
  ExportFormat,
  TemplateType,
  ExportFormatDefinition }
  validateExportOptions
 from '../../types/export';
import { useExport } from '../../hooks/useExport';


interface AdvancedExportTemplateManagerProps { visible?: boolean;
  onClose?: () => void;
  projectId?: string;
  onTemplateSelect?: (template: ExportTemplate) => void;
  enableSharing?: boolean;
  enableCollaboration?: boolean;
  className?: string;
  interface TemplateFilter {
  format?: ExportFormat;
  type?: TemplateType;
  author?: string;
  isPublic?: boolean;
  search?: string;
  tags?: string;
  interface TemplateStats {
  id: string;
  usageCount: number;
  lastUsed: string | null;
  averageRating: number;
  totalRatings: number;
  successRate: number;
  interface TemplateCustomization {
  templateId: string;
  parameters: Record<string, unknown>;
  customFields: Record<string, unknown>;
  previewData?: unknown;
  export const AdvancedExportTemplateManager: React.FC<AdvancedExportTemplateManagerProps> = ({);
  visible = true;
  onClose;
  projectId = '';
  onTemplateSelect;
  enableSharing = true;
  enableCollaboration = true }
  className = ''


}) => {
  // State management
  const [templates, setTemplates] = useState<ExportTemplate>([]);
  const [templateStats, setTemplateStats] = useState<Map<string, TemplateStats>>(new Map());
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'usage' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Template management state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null);
  const [customization, setCustomization] = useState<TemplateCustomization | null>(null);
  // UI state
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'shared' | 'collaborate'>('browse');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Hooks
  const { getTemplates
    createTemplate
    updateTemplate
    deleteTemplate
    shareTemplate }
    getTemplateStats
 = useExport(projectId);
  // Load templates and stats
  useEffect(() => { loadTemplates() }, [filter, sortBy, sortOrder]);
  const loadTemplates = useCallback(async () => { setLoading(true);
    setError(null);
    try {
      const templatesData = await getTemplates({)
  ...filter
        sortBy }
        sortOrder
      });
      setTemplates(templatesData);
      // Load stats for each template
      const statsMap = new Map<string, TemplateStats>();
      for (const template of templatesData) { try {
          const stats = await getTemplateStats(template.id);
          statsMap.set(template.id, stats) } catch (err) {
          console.warn(`Failed to load stats for template ${template.id}:`, err);}
      setTemplateStats(statsMap);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to load templates') } finally { setLoading(false) }, [filter, sortBy, sortOrder, getTemplates, getTemplateStats]);
  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => { let filtered = templates;
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(template => )
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower)
      );
    // Apply format filter
    if (filter.format) {
      filtered = filtered.filter(template => template.export_format === filter.format);
    // Apply type filter
    if (filter.type) {
      filtered = filtered.filter(template => template.template_type === filter.type);
    // Apply public/private filter
    if (filter.isPublic !== undefined) {
      filtered = filtered.filter(template => template.is_public === filter.isPublic);
    return filtered }, [templates, filter]);
  // Template creation handler
        setTemplates(prev => [...prev, newTemplate]);
      setIsCreating(false);
      setError(null);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to create template') } finally { setLoading(false) }, [createTemplate]);
  // Template update handler
        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
      setIsEditing(false);
      setEditingTemplate(null);
      setError(null);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to update template') } finally { setLoading(false) }, [updateTemplate]);
  // Template deletion handler
  const handleDeleteTemplate = useCallback(async (templateId: string) => { if (!confirm('Are you sure you want to delete this template?')) return;
    setLoading(true);
    try {
      await deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      setError(null) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete template') } finally { setLoading(false) }, [deleteTemplate, selectedTemplate]);
  // Template selection handler
  const handleSelectTemplate = useCallback((template: ExportTemplate) => { setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template) }, [onTemplateSelect]);
  // Template customization handler
  const handleCustomizeTemplate = useCallback((template: ExportTemplate) => { setCustomization({)
  templateId: template.id }
      parameters: template.format_options || {}
      customFields: {}
    });
    setShowPreview(true);
  }, []);
  // Template sharing handler
  const handleShareTemplate = useCallback(async (templateId: string, isPublic: boolean) => {
    if (!enableSharing) return;
    setLoading(true);
    try {
      await shareTemplate(templateId, { is_public: isPublic });
      setTemplates(prev => prev.map(t => )
        t.id === templateId ? { ...t, is_public: isPublic } : t
      ));
      setError(null);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to share template') } finally { setLoading(false) }, [enableSharing, shareTemplate]);
  // Get template rating display
  const getTemplateRating = useCallback((templateId: string) => { const stats = templateStats.get(templateId);
  if (!stats || stats.totalRatings === 0) return null;
  return {
  average: Math.round(stats.averageRating * 10) / 10
  count: stats.totalRatings }
};
  }, [templateStats]);
  // Format display helpers
  const formatUsageCount = useCallback((count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${Math.round(count / 100) / 10}K`;}
    return `${Math.round(count / 100000) / 10}M`;}
  }, []);
  const formatDate = useCallback((dateString: string) => { return new Date(dateString).toLocaleDateString() }, []);
  if (!visible) return null;
  return;
    <div
      className={`advanced-export-template-manager ${className}`}
      style={ {
  position: 'fixed'
  inset: '20px'
  background: 'white'
  border: '1px solid #e2e8f0'
  borderRadius: '12px'
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  zIndex: 1000
  overflow: 'hidden'
  display: 'flex'
  flexDirection: 'column'
  fontFamily: 'system-ui, -apple-system, sans-serif' }

    >
      {/* Header */}
      <div
        style={ {
  padding: '20px 24px'
  borderBottom: '1px solid #e2e8f0'
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  color: 'white' }
}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              📋 Advanced Export Templates
            </h2>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {templates.length} templates • {filteredTemplates.length} filtered
            </div>
          </div>
          {onClose && ()
            <button
              onClick={onClose}
              style={ {
  background: 'rgba(255, 255, 255, 0.2)'
  border: 'none'
  borderRadius: '6px'
  color: 'white'
  width: '32px'
  height: '32px'
  cursor: 'pointer'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  fontSize: '18px' }

            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Navigation Tabs */}
      <div
        style={ {
  padding: '16px 24px'
  borderBottom: '1px solid #e2e8f0'
  background: '#f8fafc' }

      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'browse', label: '🔍 Browse Templates', desc: 'Explore available templates' }
            { key: 'create', label: '➕ Create Template', desc: 'Build new templates' }
            ...(enableSharing ? [{ key: 'shared', label: '🌐 Shared Templates', desc: 'Community templates' }] : [])
            ...(enableCollaboration ? [{ key: 'collaborate', label: '👥 Collaborate', desc: 'Team templates' }] : [])
          ].map(tab => ()
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'browse' | 'create' | 'shared' | 'collaborate')}
              style={ {
  padding: '8px 16px'
  background: activeTab === tab.key ? '#3b82f6' : 'transparent'
  color: activeTab === tab.key ? 'white' : '#6b7280'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  cursor: 'pointer'
  fontSize: '14px'
  fontWeight: activeTab === tab.key ? '600' : 'normal'
  transition: 'all 0.2s ease' }

              title={tab.desc}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Filter Controls */}
        {activeTab === 'browse' && ()
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search templates..."
              value={filter.search || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              style={ {
  padding: '8px 12px'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  fontSize: '14px'
  minWidth: '200px' }

            />
            <select
              value={filter.format || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, format: e.target.value as ExportFormat || undefined }))}
              style={ {
  padding: '8px 12px'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  fontSize: '14px' }

            >
              <option value="">All Formats</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
              <option value="markdown">Markdown</option>
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="zip">ZIP</option>
              <option value="vfx">VFX Pipeline</option>
            </select>
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as TemplateType || undefined }))}
              style={ {
  padding: '8px 12px'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  fontSize: '14px' }

            >
              <option value="">All Types</option>
              <option value="full">Full Export</option>
              <option value="summary">Summary</option>
              <option value="diff">Differential</option>
              <option value="custom">Custom</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', color: '#6b7280' }}>View:</label>
              {['grid', 'list', 'table'].map(mode => ()
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as 'grid' | 'list' | 'table')}
                  style={ {
  padding: '6px 10px'
  background: viewMode === mode ? '#e2e8f0' : 'transparent'
  border: '1px solid #e2e8f0'
  borderRadius: '4px'
  cursor: 'pointer'
  fontSize: '12px'
  textTransform: 'capitalize' }

                >
                  {mode}
                </button>
              ))}
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={ (e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as 'name' | 'created' | 'usage' | 'rating');
                setSortOrder(order as 'asc' | 'desc') }}
              style={ {
  padding: '8px 12px'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  fontSize: '14px' }

            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="usage-desc">Most Used</option>
              <option value="usage-asc">Least Used</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        )}
      </div>
      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          { error && ()
            <div
              style={{
  padding: '12px 16px'
  background: '#fee2e2'
  border: '1px solid #fecaca'
  borderRadius: '8px'
  color: '#dc2626'
  marginBottom: '20px'
  fontSize: '14px' }
}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
          { loading && ()
            <div
              style={{
  padding: '40px'
  textAlign: 'center'
  color: '#6b7280' }
}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              <div>Loading templates...</div>
            </div>
          )}
          {/* Browse Templates Tab */}
          { activeTab === 'browse' && !loading && ()
            <div>
              {filteredTemplates.length === 0 ? ()
                <div
                  style={{
  padding: '60px 20px'
  textAlign: 'center'
  color: '#9ca3af' }
}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>No templates found</div>
                  <div style={{ fontSize: '14px' }}>
                    { filter.search || filter.format || filter.type 
                      ? 'Try adjusting your filters or create a new template'
                      : 'Create your first export template to get started'
                  </div>
                </div>
              ) : ()
                <div
                  style={{
  display: viewMode === 'grid' ? 'grid' : 'flex'
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
  flexDirection: viewMode === 'list' ? 'column' : undefined
  gap: '16px' }
}
                >
                  {filteredTemplates.map(template => {)
  const stats = templateStats.get(template.id);
                    const rating = getTemplateRating(template.id);
                    return;
                      <div
                        key={template.id}
                        style={ {
                          background: selectedTemplate?.id === template.id ? '#f0f9ff' : 'white' }
                          border: `2px solid ${selectedTemplate?.id === template.id ? '#0ea5e9' : '#e2e8f0'}`}

  borderRadius: '8px'
                          padding: '16px'
                          cursor: 'pointer'
                          transition: 'all 0.2s ease'
                          position: 'relative';

                        onClick={() => handleSelectTemplate(template)}
                      >
                        {/* Template Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                              {template.name}
                            </h4>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                              {template.export_format.toUpperCase()} • {template.template_type}
                              {template.is_public && <span> • Public</span>}
                            </div>
                          </div>
                          { template.is_system_template && ()
                            <span
                              style={{
  background: '#dbeafe'
  color: '#1e40af'
  padding: '2px 6px'
  borderRadius: '4px'
  fontSize: '10px'
  fontWeight: '600' }
}
                            >
                              SYSTEM
                            </span>
                          )}
                        </div>
                        {/* Template Description */}
                        { template.description && ()
                          <p style={{
  margin: '0 0 12px'
  fontSize: '14px'
  color: '#6b7280'
  lineHeight: '1.4'
  display: '-webkit-box'
  WebkitLineClamp: 2
  WebkitBoxOrient: 'vertical'
  overflow: 'hidden' }
}>
                            {template.description}
                          </p>
                        )}
                        {/* Template Stats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#6b7280' }}>
                          {stats && ()
                            <>
                              <span>📊 {formatUsageCount(stats.usageCount)} uses</span>
                              {rating && ()
                                <span>⭐ {rating.average} ({rating.count})</span>
                              )}
                              <span>✅ {Math.round(stats.successRate * 100)}% success</span>
                            </>
                          )}
                          <span>📅 {formatDate(template.created_at)}</span>
                        </div>
                        {/* Template Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={ (e) => {
                              e.stopPropagation();
                              handleCustomizeTemplate(template) }}
                            style={ {
  padding: '6px 12px'
  background: '#f3f4f6'
  border: '1px solid #e2e8f0'
  borderRadius: '4px'
  cursor: 'pointer'
  fontSize: '12px'
  color: '#374151' }

                          >
                            🔧 Customize
                          </button>
                          { enableSharing && ()
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareTemplate(template.id, !template.is_public) }}
                              style={ {
  padding: '6px 12px'
  background: template.is_public ? '#fee2e2' : '#f0fdf4'
  border: '1px solid #e2e8f0'
  borderRadius: '4px'
  cursor: 'pointer'
  fontSize: '12px'
  color: template.is_public ? '#dc2626' : '#16a34a' }

                            >
                              {template.is_public ? '🔒 Make Private' : '🌐 Make Public'}
                            </button>
                          )}
                          { !template.is_system_template && ()
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id) }}
                              style={ {
  padding: '6px 12px'
  background: '#fee2e2'
  border: '1px solid #fecaca'
  borderRadius: '4px'
  cursor: 'pointer'
  fontSize: '12px'
  color: '#dc2626' }

                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* Create Template Tab */}
          { activeTab === 'create' && ()
            <div>
              <div
                style={{
  padding: '40px'
  textAlign: 'center'
  color: '#6b7280' }
}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛠️</div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>Template Creation</div>
                <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                  Create custom export templates with advanced options and parameterization
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  style={ {
  padding: '12px 24px'
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  color: 'white'
  border: 'none'
  borderRadius: '8px'
  cursor: 'pointer'
  fontSize: '16px'
  fontWeight: '600' }

                >
                  ➕ Create New Template
                </button>
              </div>
            </div>
          )}
          {/* Shared Templates Tab */}
          { activeTab === 'shared' && ()
            <div
              style={{
  padding: '40px'
  textAlign: 'center'
  color: '#6b7280' }
}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>Community Templates</div>
              <div style={{ fontSize: '14px' }}>
                Discover and share templates with the community
              </div>
            </div>
          )}
          {/* Collaborate Tab */}
          { activeTab === 'collaborate' && ()
            <div
              style={{
  padding: '40px'
  textAlign: 'center'
  color: '#6b7280' }
}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>Team Collaboration</div>
              <div style={{ fontSize: '14px' }}>
                Collaborate on templates with your team members
              </div>
            </div>
          )}
        </div>
        {/* Side Panel */}
        { selectedTemplate && ()
          <div
            style={{
  width: '350px'
  borderLeft: '1px solid #e2e8f0'
  background: '#f8fafc'
  overflow: 'auto' }
}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
                Template Details
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: '#374151' }}>
                  {selectedTemplate.name}
                </h4>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  {selectedTemplate.export_format.toUpperCase()} • {selectedTemplate.template_type}
                  {selectedTemplate.is_public && <span> • Public</span>}
                </div>
                {selectedTemplate.description && ()
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                    {selectedTemplate.description}
                  </p>
                )}
              </div>
              {/* Template Statistics */}
              {templateStats.has(selectedTemplate.id) && ()
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Usage Statistics
                  </h5>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                    {(() => {
                      const stats = templateStats.get(selectedTemplate.id)!;
                      const rating = getTemplateRating(selectedTemplate.id);
                      return;
                        <>
                          <div>📊 {formatUsageCount(stats.usageCount)} total uses</div>
                          {rating && <div>⭐ {rating.average}/5.0 ({rating.count} ratings)</div>}
                          <div>✅ {Math.round(stats.successRate * 100)}% success rate</div>
                          {stats.lastUsed && <div>🕒 Last used: {formatDate(stats.lastUsed)}</div>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {/* Template Metadata */}
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Metadata
                </h5>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                  <div>📅 Created: {formatDate(selectedTemplate.created_at)}</div>
                  <div>🔄 Updated: {formatDate(selectedTemplate.updated_at)}</div>
                  <div>👤 Author: {selectedTemplate.created_by}</div>
                  {selectedTemplate.is_system_template && <div>🔧 System Template</div>}
                </div>
              </div>
              {/* Template Options Preview */}
              {Object.keys(selectedTemplate.format_options || {}).length > 0 && ()
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Format Options
                  </h5>
                  <div
                    style={ {
  background: 'white'
  border: '1px solid #e2e8f0'
  borderRadius: '4px'
  padding: '8px'
  fontSize: '11px'
  color: '#374151'
  fontFamily: 'monospace'
  overflow: 'auto'
  maxHeight: '150px' }

                  >
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(selectedTemplate.format_options, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleSelectTemplate(selectedTemplate)}
                  style={ {
  padding: '10px 16px'
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  color: 'white'
  border: 'none'
  borderRadius: '6px'
  cursor: 'pointer'
  fontSize: '14px'
  fontWeight: '600' }

                >
                  📤 Use This Template
                </button>
                <button
                  onClick={() => handleCustomizeTemplate(selectedTemplate)}
                  style={ {
  padding: '10px 16px'
  background: '#f3f4f6'
  color: '#374151'
  border: '1px solid #e2e8f0'
  borderRadius: '6px'
  cursor: 'pointer'
  fontSize: '14px' }

                >
                  🔧 Customize Template
                </button>
                { !selectedTemplate.is_system_template && ()
                  <button
                    onClick={() => {
                      setEditingTemplate(selectedTemplate);
                      setIsEditing(true) }}
                    style={ {
  padding: '10px 16px'
  background: '#fffbeb'
  color: '#d97706'
  border: '1px solid #fed7aa'
  borderRadius: '6px'
  cursor: 'pointer'
  fontSize: '14px' }

                  >
                    ✏️ Edit Template
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedExportTemplateManager;