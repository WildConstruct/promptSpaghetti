/**
 * Suggestion Selector Component
 * Epic 36.3: Node Generation and Canvas Integration
 * 
 * UI component for selecting which analyzed suggestions to implement as nodes
 * with enhanced accessibility, security validation, and modern design
 */
import React, { useState, useCallback, useMemo } from 'react';
import { NodeSuggestion,
  GenerationOptions,
  LayoutType,
  ConnectionPattern }
  GENERATION_DEFAULTS
 from '../../types/NodeGenerationTypes';


export interface SuggestionSelectorProps { suggestions: NodeSuggestion;
  onGenerate: (selectedSuggestions: NodeSuggestion, options: GenerationOptions) => void }
  onCancel: () => void;
  isGenerating?: boolean;
  theme?: 'light' | 'dark' | 'cinema';
  /**
  * Component for selecting suggestions and configuring generation options
  */


export const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({ )
  layout: GENERATION_DEFAULTS.DEFAULT_LAYOUT
  spacing: GENERATION_DEFAULTS.DEFAULT_SPACING
  connectionPattern: GENERATION_DEFAULTS.DEFAULT_CONNECTION_PATTERN
  nodeConfiguration: {
  autoConnect: true
  useSmartPositioning: true
  preserveUserNodes: true }

  validation: { 
  enableStrictValidation: true
  allowDuplicateConnections: false
  maxNodesPerGeneration: GENERATION_DEFAULTS.MAX_NODES_GENERATED }

  performance: { 
  batchSize: GENERATION_DEFAULTS.BATCH_SIZE
  useProgressiveGeneration: false
  enablePerformanceTracking: true }
});
  // Theme styles
  const getThemeStyles = () => { const themes = {
  light: {
  background: '#ffffff'
  secondary: '#f8fafc'
  border: '#e5e7eb'
  text: '#374151'
  textSecondary: '#6b7280'
  accent: '#3b82f6'
  success: '#10b981'
  warning: '#f59e0b'
  error: '#ef4444'
  hover: '#f3f4f6' }

  dark: { 
  background: '#1f2937'
  secondary: '#111827'
  border: '#4b5563'
  text: '#f9fafb'
  textSecondary: '#9ca3af'
  accent: '#60a5fa'
  success: '#34d399'
  warning: '#fbbf24'
  error: '#f87171'
  hover: '#374151' }

  cinema: { 
  background: '#1a1a1a'
  secondary: '#0d1117'
  border: '#ff7c00'
  text: '#ffffff'
  textSecondary: '#a0a0a0'
  accent: '#ff7c00'
  success: '#00ff88'
  warning: '#ffaa00'
  error: '#ff4444'
  hover: '#2d2d2d' }
};
    return themes[theme];
  };
  const styles = getThemeStyles();
  // Toggle suggestion selection
  const toggleSuggestion = useCallback((suggestionId: string) => { setSelectedSuggestions(prev => {)
  const newSelected = new Set(prev);
      if (newSelected.has(suggestionId)) {
        newSelected.delete(suggestionId) } else { newSelected.add(suggestionId);
      return newSelected });
  }, []);
  // Select all suggestions
  const selectAll = useCallback(() => { setSelectedSuggestions(new Set(suggestions.map(s => s.id))) }, [suggestions]);
  // Clear all selections
  const clearAll = useCallback(() => { setSelectedSuggestions(new Set()) }, []);
  // Handle generation with security validation
  const handleGenerate = () => {
    const selected = suggestions.filter(s => selectedSuggestions.has(s.id));
    // Security hardening: Enforce limits
    if (selected.length > GENERATION_DEFAULTS.MAX_NODES_GENERATED) {
      alert(`Cannot generate more than ${GENERATION_DEFAULTS.MAX_NODES_GENERATED} nodes for security and performance reasons. Please reduce your selection to ${GENERATION_DEFAULTS.MAX_NODES_GENERATED} or fewer nodes.`);}
      return;
    if (selected.length === 0) { alert('Please select at least one suggestion to generate.');
      return;
    onGenerate(selected, generationOptions) };
  // Calculate statistics
  const stats = useMemo(() => { const selected = suggestions.filter(s => selectedSuggestions.has(s.id));
  const averageConfidence = selected.length > 0 ;
  ? selected.reduce((sum, s) => sum + s.confidence, 0) / selected.length
  : 0;
  return {
  totalSuggestions: suggestions.length
  selectedCount: selected.length
  averageConfidence
  highConfidenceCount: selected.filter(s => s.confidence >= 80).length
  estimatedGenerationTime: Math.ceil(selected.length / 10) // Rough estimate }
};
  }, [suggestions, selectedSuggestions]);
  // Confidence color helper
  const getConfidenceColor = (confidence: number): string => { if (confidence >= 80) return styles.success;
    if (confidence >= 60) return styles.warning;
    return styles.error };
  // Category icon helper
  const getCategoryIcon = (category: string): string => { const icons = {
  content: '📝'
  logic: '⚙️'
  output: '📤'
  variable: '🔢' }
};
    return icons[category as keyof typeof icons] || '📋';
  };
  return;
    <div
      style={ {
        width: '800px'
        maxHeight: '700px'
        background: styles.background }
        border: `1px solid ${styles.border}`}

  borderRadius: '16px'
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        overflow: 'hidden'
        fontFamily: 'Inter, system-ui, sans-serif'

      role="dialog"
      aria-labelledby="suggestion-selector-title"
      aria-describedby="suggestion-selector-description"
    >
      {/* Header */}
      <div style={ {
        padding: '24px' }
        borderBottom: `1px solid ${styles.border}`}

  background: styles.secondary;
}>
        <h2 
          id="suggestion-selector-title"
          style={ {
  margin: '0 0 8px 0'
  fontSize: '24px'
  fontWeight: 600
  color: styles.text }

        >
          🎯 Select Suggestions to Generate
        </h2>
        <p 
          id="suggestion-selector-description"
          style={ {
  margin: 0
  color: styles.textSecondary
  lineHeight: 1.5 }
}
        >
          Choose which analyzed suggestions you'd like to convert into nodes on your canvas
        </p>
        {/* Statistics */}
        <div style={ {
  marginTop: '16px'
  padding: '12px'
  background: styles.hover
  borderRadius: '8px'
  display: 'grid'
  gridTemplateColumns: 'repeat(4, 1fr)'
  gap: '16px'
  fontSize: '14px' }
}>
          <div>
            <div style={{ color: styles.textSecondary }}>Selected</div>
            <div style={{ color: styles.accent, fontWeight: 600, fontSize: '18px' }}>
              {stats.selectedCount}/{stats.totalSuggestions}
            </div>
          </div>
          <div>
            <div style={{ color: styles.textSecondary }}>Avg Confidence</div>
            <div style={ {
  color: getConfidenceColor(stats.averageConfidence)
  fontWeight: 600
  fontSize: '18px' }
}>
              {stats.averageConfidence.toFixed(0)}%
            </div>
          </div>
          <div>
            <div style={{ color: styles.textSecondary }}>High Quality</div>
            <div style={{ color: styles.success, fontWeight: 600, fontSize: '18px' }}>
              {stats.highConfidenceCount}
            </div>
          </div>
          <div>
            <div style={{ color: styles.textSecondary }}>Est. Time</div>
            <div style={{ color: styles.text, fontWeight: 600, fontSize: '18px' }}>
              ~{stats.estimatedGenerationTime}s
            </div>
          </div>
        </div>
      </div>
      {/* Suggestions List */}
      <div style={ {
  maxHeight: '400px'
  overflow: 'auto'
  padding: '16px' }
}>
        {/* Selection Controls */}
        <div style={ {
  display: 'flex'
  gap: '12px'
  marginBottom: '16px'
  alignItems: 'center' }
}>
          <button
            onClick={selectAll}
            disabled={isGenerating}
            style={ {
              padding: '8px 16px'
              background: 'transparent' }
              border: `1px solid ${styles.accent}`}

  borderRadius: '6px'
              color: styles.accent
              fontSize: '14px'
              cursor: isGenerating ? 'not-allowed' : 'pointer'
              opacity: isGenerating ? 0.5 : 1;

            aria-label="Select all suggestions"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            disabled={isGenerating}
            style={ {
              padding: '8px 16px'
              background: 'transparent' }
              border: `1px solid ${styles.textSecondary}`}

  borderRadius: '6px'
              color: styles.textSecondary
              fontSize: '14px'
              cursor: isGenerating ? 'not-allowed' : 'pointer'
              opacity: isGenerating ? 0.5 : 1;

            aria-label="Clear all selections"
          >
            Clear All
          </button>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: styles.textSecondary }}>
            Max {GENERATION_DEFAULTS.MAX_NODES_GENERATED} nodes allowed
          </div>
        </div>
        {/* Suggestions Grid */}
        <div style={ {
  display: 'grid'
  gap: '12px' }
}>
          {suggestions.map(suggestion => {)
  const isSelected = selectedSuggestions.has(suggestion.id);
            return;
              <div
                key={suggestion.id}
                onClick={() => !isGenerating && toggleSuggestion(suggestion.id)}
                style={ {
                  padding: '16px' }
                  border: `1px solid ${isSelected ? styles.accent : styles.border}`}

  borderRadius: '8px'
                  background: isSelected ? styles.accent + '10' : styles.secondary
                  cursor: isGenerating ? 'not-allowed' : 'pointer'
                  opacity: isGenerating ? 0.7 : 1
                  transition: 'all 0.2s ease'
                  display: 'flex'
                  alignItems: 'flex-start'
                  gap: '12px';

                role="checkbox"
                aria-checked={isSelected}
                aria-labelledby={`suggestion-${suggestion.id}-title`}
                aria-describedby={`suggestion-${suggestion.id}-description`}
                tabIndex={0}
                onKeyDown={ (e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isGenerating) {
                    e.preventDefault();
                    toggleSuggestion(suggestion.id) }}
              >
                {/* Checkbox */}
                <div style={ {
                  width: '20px'
                  height: '20px' }
                  border: `2px solid ${isSelected ? styles.accent : styles.border}`}

  borderRadius: '4px'
                  background: isSelected ? styles.accent : 'transparent'
                  display: 'flex'
                  alignItems: 'center'
                  justifyContent: 'center'
                  flexShrink: 0
                  marginTop: '2px';
}>
                  { isSelected && ()
                    <div style={{
  color: styles.background
  fontSize: '12px'
  fontWeight: 'bold' }
}>
                      ✓
                    </div>
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {getCategoryIcon(suggestion.metadata.category)}
                    </span>
                    <h3 
                      id={`suggestion-${suggestion.id}-title`}
                      style={ {
  margin: 0
  fontSize: '16px'
  fontWeight: 600
  color: styles.text }
}
                    >
                      {suggestion.title}
                    </h3>
                    <div style={ {
  padding: '2px 6px'
  background: getConfidenceColor(suggestion.confidence) + '20'
  color: getConfidenceColor(suggestion.confidence)
  fontSize: '11px'
  borderRadius: '4px'
  fontWeight: 500 }
}>
                      {suggestion.confidence}%
                    </div>
                  </div>
                  <p 
                    id={`suggestion-${suggestion.id}-description`}
                    style={ {
  margin: '0 0 8px 0'
  fontSize: '14px'
  color: styles.textSecondary
  lineHeight: 1.4 }
}
                  >
                    {suggestion.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: styles.textSecondary }}>
                    <span>Type: {suggestion.nodeType}</span>
                    <span>Category: {suggestion.metadata.category}</span>
                    <span>Priority: {suggestion.metadata.priority}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Generation Options */}
      <div style={ {
        padding: '16px' }
        borderTop: `1px solid ${styles.border}`}

  borderBottom: `1px solid ${styles.border}`}

  background: styles.secondary;
}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: styles.text }}>
          Generation Options
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Layout Type */}
          <div>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '12px'
  fontWeight: 500
  color: styles.text }
}>
              Layout
            </label>
            <select
              value={generationOptions.layout}
              onChange={ (e) => setGenerationOptions(prev => ({ )
                ...prev }
                layout: e.target.value as LayoutType ;
  }))}
              disabled={isGenerating}
              style={ {
                width: '100%'
                padding: '6px 8px' }
                border: `1px solid ${styles.border}`}

  borderRadius: '4px'
                background: styles.background
                color: styles.text
                fontSize: '12px';

            >
              <option value="linear">Linear</option>
              <option value="hierarchical">Hierarchical</option>
              <option value="radial">Radial</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          {/* Connection Pattern */}
          <div>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '12px'
  fontWeight: 500
  color: styles.text }
}>
              Connections
            </label>
            <select
              value={generationOptions.connectionPattern}
              onChange={ (e) => setGenerationOptions(prev => ({ )
                ...prev }
                connectionPattern: e.target.value as ConnectionPattern ;
  }))}
              disabled={isGenerating}
              style={ {
                width: '100%'
                padding: '6px 8px' }
                border: `1px solid ${styles.border}`}

  borderRadius: '4px'
                background: styles.background
                color: styles.text
                fontSize: '12px';

            >
              <option value="sequential">Sequential</option>
              <option value="branching">Branching</option>
              <option value="hub-and-spoke">Hub & Spoke</option>
              <option value="workflow">Workflow</option>
              <option value="mesh">Mesh</option>
            </select>
          </div>
          {/* Spacing */}
          <div>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '12px'
  fontWeight: 500
  color: styles.text }
}>
              Spacing
            </label>
            <select
              value={generationOptions.spacing.horizontal}
              onChange={ (e) => {
                const spacing = parseInt(e.target.value);
                setGenerationOptions(prev => ({ )
                  ...prev }
                  spacing: { horizontal: spacing, vertical: spacing * 0.75 }
                }));

              disabled={isGenerating}
              style={ {
                width: '100%'
                padding: '6px 8px' }
                border: `1px solid ${styles.border}`}

  borderRadius: '4px'
                background: styles.background
                color: styles.text
                fontSize: '12px';

            >
              <option value="150">Tight</option>
              <option value="200">Normal</option>
              <option value="250">Spacious</option>
              <option value="300">Wide</option>
            </select>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={ {
  padding: '20px 24px'
  background: styles.secondary
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center' }
}>
        <button
          onClick={onCancel}
          disabled={isGenerating}
          style={ {
            padding: '12px 20px'
            background: 'transparent' }
            border: `1px solid ${styles.border}`}

  borderRadius: '8px'
            color: styles.text
            fontSize: '14px'
            cursor: isGenerating ? 'not-allowed' : 'pointer'
            opacity: isGenerating ? 0.5 : 1;

        >
          Cancel
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          { isGenerating && ()
            <div style={{
  display: 'flex'
  alignItems: 'center'
  gap: '8px'
  color: styles.accent
  fontSize: '14px' }
}>
              <div style={ {
                width: '16px'
                height: '16px' }
                border: `2px solid ${styles.accent}`}

  borderTop: '2px solid transparent'
                borderRadius: '50%'
                animation: 'spin 1s linear infinite';
} />
              Generating...
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || stats.selectedCount === 0}
            style={ {
  padding: '12px 24px'
  background: styles.accent
  border: 'none'
  borderRadius: '8px'
  color: styles.background
  fontSize: '14px'
  fontWeight: 600
  cursor: (isGenerating || stats.selectedCount === 0) ? 'not-allowed' : 'pointer'
  opacity: (isGenerating || stats.selectedCount === 0) ? 0.5 : 1
  display: 'flex'
  alignItems: 'center'
  gap: '8px' }

          >
            ✨ Generate {stats.selectedCount} Node{stats.selectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
      {/* CSS for spinner animation */}
      <style>
        { `
          @keyframes spin {
            0% { transform: rotate(0deg) }
            100% { transform: rotate(360deg) }
        `}
      </style>
    </div>
  );
};