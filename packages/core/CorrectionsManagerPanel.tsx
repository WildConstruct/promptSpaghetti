import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useCorrectionsStore, CorrectionRule, DEFAULT_CORRECTION_RULES, useCorrectionsEnabled } from './correctionsStore';
import { WorkflowManager } from './components/WorkflowManager';
import { NotificationSystem } from './components/NotificationSystem';

interface CorrectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'active' | 'inactive' | 'regex' | 'text' | 'draft' | 'published' | 'deprecated';
type SortType = 'name' | 'priority' | 'created' | 'updated' | 'usage';
type ViewMode = 'list' | 'grid' | 'compact';

export const CorrectionsManagerPanel: React.FC<CorrectionsPanelProps> = ({ isOpen, onClose }) => {
  const isEnabled = useCorrectionsEnabled();
  const {
    rules,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    reorderRules,
    clearAllRules,
    applyCorrections,
    getDraftRules,
    getPublishedRules,
    approveRule,
    deprecateRule,
    notifications,
  } = useCorrectionsStore();

  // UI State
  const [editingRule, setEditingRule] = useState<CorrectionRule | null>(null);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('priority');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [testText, setTestText] = useState('');

  // New rule form state
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    findPattern: '',
    replaceWith: '',
    isRegex: false,
    isActive: true,
    priority: rules.length,
    category: '',
    tags: [] as string[],
  });

  // Import/Export state
  const [importContent, setImportContent] = useState('');
  const [importFilename, setImportFilename] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'csv'>('json');

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render if corrections are not enabled
  if (!isEnabled) return null;

  // Filter and sort rules
  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(query) ||
        rule.description?.toLowerCase().includes(query) ||
        rule.findPattern.toLowerCase().includes(query) ||
        rule.replaceWith.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(rule => rule.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(rule => !rule.isActive);
        break;
      case 'regex':
        filtered = filtered.filter(rule => rule.isRegex);
        break;
      case 'text':
        filtered = filtered.filter(rule => !rule.isRegex);
        break;
      case 'draft':
        filtered = filtered.filter(rule => rule.status === 'draft');
        break;
      case 'published':
        filtered = filtered.filter(rule => rule.status === 'published');
        break;
      case 'deprecated':
        filtered = filtered.filter(rule => rule.status === 'deprecated');
        break;
    }

    // Apply sorting
    switch (sortType) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'priority':
        filtered.sort((a, b) => a.priority - b.priority);
        break;
      case 'created':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'updated':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return filtered;
  }, [rules, searchQuery, filterType, sortType]);

  // Event handlers
  const handleAddRule = useCallback(() => {
    if (newRule.name.trim() && newRule.findPattern.trim()) {
      addRule(newRule);
      setNewRule({
        name: '',
        description: '',
        findPattern: '',
        replaceWith: '',
        isRegex: false,
        isActive: true,
        priority: rules.length,
      });
    }
  }, [newRule, addRule, rules.length]);

  const handleUpdateRule = useCallback((rule: CorrectionRule) => {
    updateRule(rule.id, rule);
    setEditingRule(null);
  }, [updateRule]);

  const handleDeleteRule = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this correction rule?')) {
      deleteRule(id);
    }
  }, [deleteRule]);

  const handleBulkAction = useCallback((action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedRules.size === 0) return;

    const confirmed = window.confirm(`Are you sure you want to ${action} ${selectedRules.size} rule(s)?`);
    if (!confirmed) return;

    selectedRules.forEach(ruleId => {
      switch (action) {
        case 'delete':
          deleteRule(ruleId);
          break;
        case 'activate':
          updateRule(ruleId, { isActive: true });
          break;
        case 'deactivate':
          updateRule(ruleId, { isActive: false });
          break;
      }
    });

    setSelectedRules(new Set());
  }, [selectedRules, deleteRule, updateRule]);

  const handleSelectAll = useCallback(() => {
    if (selectedRules.size === filteredAndSortedRules.length) {
      setSelectedRules(new Set());
    } else {
      setSelectedRules(new Set(filteredAndSortedRules.map(rule => rule.id)));
    }
  }, [selectedRules.size, filteredAndSortedRules]);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch(`/api/corrections/export?format=${exportFormat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corrections-${Date.now()}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportFormat]);

  const handleImport = useCallback(async () => {
    if (!importContent || !importFilename) return;

    try {
      const response = await fetch('/api/corrections/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: importFilename,
          content: importContent,
          skipDuplicates: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.importedCount} correction rules`);
        setImportContent('');
        setImportFilename('');
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  }, [importContent, importFilename]);

  const handleTestCorrections = useCallback(() => {
    return applyCorrections(testText);
  }, [testText, applyCorrections]);

  if (!isOpen) return null;

  const panelWidth = isMobile ? '100%' : isCollapsed ? '60px' : '500px';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: panelWidth,
        background: '#23272f',
        color: '#fff',
        borderLeft: '1px solid #444',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
      }}
      data-testid="corrections-manager-panel"
    >
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '48px',
      }}>
        {!isCollapsed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Corrections Manager
              </h2>
              <span style={{ 
                background: '#4a5568', 
                padding: '2px 6px', 
                borderRadius: '10px', 
                fontSize: '11px',
                fontWeight: 500
              }}>
                {filteredAndSortedRules.length}/{rules.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                title="Collapse panel"
              >
                ←
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
                title="Close panel"
              >
                ×
              </button>
            </div>
          </>
        )}
        
        {isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsCollapsed(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              title="Expand panel"
            >
              →
            </button>
            <div style={{
              writing: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '12px',
              color: '#a0aec0',
              transform: 'rotate(180deg)',
            }}>
              Corrections
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Controls */}
          <div style={{ padding: '16px', borderBottom: '1px solid #444' }}>
            {/* Search */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Filters and Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                style={{
                  padding: '6px 8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <option value="all">All Rules</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="regex">Regex</option>
                <option value="text">Text</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="deprecated">Deprecated</option>
              </select>

              {/* Sort */}
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                style={{
                  padding: '6px 8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <option value="priority">Priority</option>
                <option value="name">Name</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
              </select>

              {/* View Mode */}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                style={{
                  padding: '6px 8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSelectAll}
                style={{
                  padding: '6px 12px',
                  background: '#4a5568',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {selectedRules.size === filteredAndSortedRules.length ? 'Deselect All' : 'Select All'}
              </button>

              {selectedRules.size > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    style={{
                      padding: '6px 12px',
                      background: '#38a169',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Activate ({selectedRules.size})
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    style={{
                      padding: '6px 12px',
                      background: '#e53e3e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Deactivate ({selectedRules.size})
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    style={{
                      padding: '6px 12px',
                      background: '#e53e3e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete ({selectedRules.size})
                  </button>
                </>
              )}

              <button
                onClick={() => setShowImportExport(!showImportExport)}
                style={{
                  padding: '6px 12px',
                  background: '#63b3ed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Import/Export
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                style={{
                  padding: '6px 12px',
                  background: '#9f7aea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Stats
              </button>

              <button
                onClick={() => setShowWorkflow(!showWorkflow)}
                style={{
                  padding: '6px 12px',
                  background: '#63b3ed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                Workflow
                {getDraftRules().length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#fbb040',
                    color: '#1a202c',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getDraftRules().length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Import/Export Section */}
          {showImportExport && (
            <div style={{ 
              padding: '16px', 
              background: '#1e2228', 
              borderBottom: '1px solid #444',
              margin: '0 16px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', fontWeight: 600 }}>
                Import/Export
              </h3>
              
              {/* Export */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>
                  Export Format:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    style={{
                      padding: '6px 8px',
                      background: '#2a2e37',
                      color: '#fff',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="csv">CSV</option>
                  </select>
                  <button
                    onClick={handleExport}
                    style={{
                      padding: '6px 12px',
                      background: '#38a169',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Import */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>
                  Import File:
                </label>
                <input
                  type="file"
                  accept=".json,.yaml,.yml,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImportFilename(file.name);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setImportContent(e.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    background: '#2a2e37',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                />
                {importContent && (
                  <button
                    onClick={handleImport}
                    style={{
                      padding: '6px 12px',
                      background: '#63b3ed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Import
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Test Section */}
          <div style={{ padding: '16px', borderBottom: '1px solid #444' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
              Test Corrections
            </h3>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test corrections..."
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                resize: 'vertical',
                fontSize: '14px',
              }}
            />
            {testText && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#a0aec0' }}>Result:</strong>
                <div
                  style={{
                    padding: '8px',
                    background: '#1e2228',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    marginTop: '4px',
                    fontSize: '14px',
                    wordBreak: 'break-word',
                  }}
                >
                  {handleTestCorrections()}
                </div>
              </div>
            )}
          </div>

          {/* Rules List */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 600 }}>
                Rules ({filteredAndSortedRules.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (window.confirm('This will add default correction rules. Continue?')) {
                      DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#4a5568',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Load Defaults
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('This will delete all correction rules. Continue?')) {
                      clearAllRules();
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#e53e3e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredAndSortedRules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    background: selectedRules.has(rule.id) ? '#2d3748' : '#2a2e37',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    padding: '12px',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRules.has(rule.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRules);
                          if (e.target.checked) {
                            newSelected.add(rule.id);
                          } else {
                            newSelected.delete(rule.id);
                          }
                          setSelectedRules(newSelected);
                        }}
                        style={{ marginRight: '4px' }}
                      />
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={() => toggleRule(rule.id)}
                        style={{ marginRight: '4px' }}
                      />
                      <strong style={{ fontSize: '14px', fontWeight: 600 }}>
                        {rule.name}
                      </strong>
                      {rule.isRegex && (
                        <span style={{ 
                          background: '#4a5568', 
                          color: '#fff', 
                          padding: '2px 6px', 
                          borderRadius: '2px', 
                          fontSize: '10px',
                          fontWeight: 500
                        }}>
                          REGEX
                        </span>
                      )}
                      {rule.status && (
                        <span style={{ 
                          background: rule.status === 'draft' ? '#fbb040' : 
                                     rule.status === 'published' ? '#68d391' : 
                                     rule.status === 'deprecated' ? '#e53e3e' : '#a0aec0',
                          color: '#1a202c', 
                          padding: '2px 6px', 
                          borderRadius: '2px', 
                          fontSize: '10px',
                          fontWeight: 500,
                          marginLeft: '4px'
                        }}>
                          {rule.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setEditingRule(rule)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#63b3ed',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {rule.description && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#a0aec0', 
                      margin: '4px 0 8px 0' 
                    }}>
                      {rule.description}
                    </p>
                  )}
                  
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#68d391', fontWeight: 500 }}>Find:</span>
                    <code style={{ 
                      background: '#1e2228', 
                      padding: '2px 4px', 
                      borderRadius: '2px',
                      marginLeft: '4px'
                    }}>
                      {rule.findPattern}
                    </code>
                  </div>
                  
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#63b3ed', fontWeight: 500 }}>Replace:</span>
                    <code style={{ 
                      background: '#1e2228', 
                      padding: '2px 4px', 
                      borderRadius: '2px',
                      marginLeft: '4px'
                    }}>
                      {rule.replaceWith}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedRules.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#a0aec0' 
              }}>
                <p>No correction rules found.</p>
                {searchQuery && (
                  <p style={{ fontSize: '12px' }}>
                    Try adjusting your search or filter criteria.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Add New Rule Section */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #444',
            background: '#1e2228'
          }}>
            <h3 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
              Add New Rule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Rule name"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={newRule.findPattern}
                onChange={(e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value }))}
                placeholder="Find pattern"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={newRule.replaceWith}
                onChange={(e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value }))}
                placeholder="Replace with"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={newRule.isRegex}
                    onChange={(e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked }))}
                    style={{ marginRight: '4px' }}
                  />
                  Use regex
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ marginRight: '4px' }}
                  />
                  Active
                </label>
              </div>
              <button
                onClick={handleAddRule}
                disabled={!newRule.name.trim() || !newRule.findPattern.trim()}
                style={{
                  background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              background: '#23272f',
              padding: '24px',
              borderRadius: '8px',
              width: isMobile ? '90%' : '400px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
              Edit Rule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={editingRule.name}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                placeholder="Rule name"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={editingRule.description || ''}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                placeholder="Description (optional)"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={editingRule.findPattern}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null)}
                placeholder="Find pattern"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                value={editingRule.replaceWith}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null)}
                placeholder="Replace with"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={editingRule.isRegex}
                    onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null)}
                    style={{ marginRight: '4px' }}
                  />
                  Use regex
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={editingRule.isActive}
                    onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                    style={{ marginRight: '4px' }}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleUpdateRule(editingRule)}
                  style={{
                    background: '#38a169',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingRule(null)}
                  style={{
                    background: '#4a5568',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Manager */}
      <WorkflowManager
        isOpen={showWorkflow}
        onClose={() => setShowWorkflow(false)}
      />

      {/* Notification System */}
      <NotificationSystem
        position="top-right"
        maxVisible={3}
        autoHideDuration={5000}
      />
    </div>
  );
};