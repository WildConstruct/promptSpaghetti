// packages/core/components/DataSources/HistoricalDataImportPanel.tsx
// Epic 8.8 Task 1: Historical Data Import Interface
import React, { useState, useCallback, useEffect } from 'react';
import { 
  useExternalDataImport, 
  useHistoricalQueryBuilder, 
  useDataSourceCache 
} from '../../hooks/useExternalDataImport';
import { QueryResult } from '../../external-data/DataSourceManager';

export interface HistoricalDataImportPanelProps {
  visible: boolean;
  onClose: () => void;
  onDataImported?: (results: QueryResult) => void;
  onError?: (error: Error) => void;
const ERA_OPTIONS = [;
  { value: 'ancient', label: 'Ancient (3000 BC - 500 AD)' },
  { value: 'early-medieval', label: 'Early Medieval (500-1000)' },
  { value: 'high-medieval', label: 'High Medieval (1000-1300)' },
  { value: 'late-medieval', label: 'Late Medieval (1300-1500)' },
  { value: 'renaissance', label: 'Renaissance (1300-1600)' },
  { value: 'early-modern', label: 'Early Modern (1450-1800)' },
  { value: 'modern', label: 'Modern (1800-1950)' },
  { value: 'contemporary', label: 'Contemporary (1950+)' }
];
const CATEGORY_OPTIONS = [;
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'art', label: 'Art & Sculpture' },
  { value: 'literature', label: 'Literature & Texts' },
  { value: 'warfare', label: 'Warfare & Military' },
  { value: 'trade', label: 'Trade & Commerce' },
  { value: 'religion', label: 'Religion & Spirituality' },
  { value: 'daily-life', label: 'Daily Life & Culture' },
  { value: 'technology', label: 'Technology & Tools' },
  { value: 'materials', label: 'Materials & Crafts' }
];
const REGION_OPTIONS = [;
  { value: 'europe', label: 'Europe' },
  { value: 'england', label: 'England' },
  { value: 'france', label: 'France' },
  { value: 'germany', label: 'Germany' },
  { value: 'italy', label: 'Italy' },
  { value: 'spain', label: 'Spain' },
  { value: 'asia', label: 'Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'africa', label: 'Africa' },
  { value: 'americas', label: 'Americas' }
];
}
export const HistoricalDataImportPanel: React.FC<HistoricalDataImportPanelProps> = ({)
  visible,
  onClose,
  onDataImported,
  onError
}) => {
  const [selectedSources, setSelectedSources] = useState<string>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importResults, setImportResults] = useState<QueryResult | null>(null);
  const {
  state: dataState,
  queryData,
  refreshData,
  clearCache,
  validateQuery,
  getQuerySuggestions,
  exportResults
} = useExternalDataImport({)
  autoRefresh: false,
  cacheStrategy: 'conservative',
  onSuccess: (results) => {,
  setImportResults(results);
  if (onDataImported) {
  onDataImported(results);
}
    onError
  });
  const {
    query,
    isValid,
    validationErrors,
    updateQuery,
    resetQuery,
    buildQuery
  } = useHistoricalQueryBuilder();
  const { _____cacheStats, clearCache: clearCacheStats } = useDataSourceCache();
  const suggestions = getQuerySuggestions(query);
  const availableSources = dataState.availableDataSources.filter(s => s.enabled);
  useEffect(() => {
    // Auto-select all enabled sources by default
    if (availableSources.length > 0 && selectedSources.length === 0) {
      setSelectedSources(availableSources.map(s => s.id));
  }, [availableSources.length, selectedSources.length]);
  const handleImportData = useCallback(async () => {
  const finalQuery = buildQuery();
  if (!finalQuery) return;
  const sourcesToUse = selectedSources.length > 0 ? selectedSources : undefined;
  await queryData(finalQuery, sourcesToUse);
}, [buildQuery, queryData, selectedSources]);
  const handleClearAll = useCallback(() => {
    resetQuery();
    setImportResults(null);
    clearCache();
    clearCacheStats();
  }, [resetQuery, clearCache, clearCacheStats]);
  const handleSourceToggle = useCallback((sourceId: string) => {
  setSelectedSources(prev => )
  prev.includes(sourceId)
  ? prev.filter(id => id !== sourceId)
  : [...prev, sourceId]);
}, []);
  const handleExport = useCallback((format: 'json' | 'csv') => {
  const data = exportResults(format);
  const blob = new Blob([data], { )
  type: format === 'json' ? 'application/json' : 'text/csv',
});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historical-data-${Date.now()}.${format}`;}
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportResults]);
  if (!visible) return null;
  return;
    <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2001,
}}>
      <div style={{
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 8,
  width: '90vw',
  maxWidth: 1400,
  maxHeight: '90vh',
  display: 'flex',
  overflow: 'hidden',
}}>
        {/* Query Builder Panel */}
        <div style={{
  width: 400,
  background: '#1a202c',
  borderRight: '1px solid #4a5568',
  display: 'flex',
  flexDirection: 'column',
}}>
          {/* Header */}
          <div style={{
  padding: 16,
  borderBottom: '1px solid #4a5568',
}}>
            <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 16 }}>
              Historical Data Import
            </h3>
            <div style={{ color: '#a0aec0', fontSize: 12, marginTop: 4 }}>
              Query historical databases for UTDG content
            </div>
          </div>
          {/* Query Form */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {/* Era Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
  display: 'block',
  color: '#e2e8f0',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 500,
}}>
                Historical Era *
              </label>
              <select
                value={Array.isArray(query.era) ? query.era[0] : query.era || ''}
                onChange={(e) => updateQuery({ era: e.target.value })}
                style={{
  width: '100%',
  padding: 8,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
              >
                <option value="">Select era...</option>
                {ERA_OPTIONS.map(era => ()
                  <option key={era.value} value={era.value}>
                    {era.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Category Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
  display: 'block',
  color: '#e2e8f0',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 500,
}}>
                Category *
              </label>
              <select
                value={query.category || ''}
                onChange={(e) => updateQuery({ category: e.target.value })}
                style={{
  width: '100%',
  padding: 8,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
              >
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map(category => ()
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Region Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
  display: 'block',
  color: '#e2e8f0',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 500,
}}>
                Region
              </label>
              <select
                value={Array.isArray(query.region) ? query.region[0] : query.region || ''}
                onChange={(e) => updateQuery({ region: e.target.value || undefined })}
                style={{
  width: '100%',
  padding: 8,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
              >
                <option value="">Any region...</option>
                {REGION_OPTIONS.map(region => ()
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Keywords */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
  display: 'block',
  color: '#e2e8f0',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 500,
}}>
                Keywords (optional)
              </label>
              <input
                type="text"
                value={query.keywords?.join(', ') || ''}
                onChange={(e) => updateQuery({ )
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                })}
                placeholder="wool, silk, embroidery..."
                style={{
  width: '100%',
  padding: 8,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
              />
            </div>
            {/* Advanced Options */}
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
  background: 'none',
  border: 'none',
  color: '#4299e1',
  fontSize: 12,
  cursor: 'pointer',
  padding: 0,
  marginBottom: 8,
}}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </button>
              {showAdvanced && ()
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div>
                      <label style={{
  display: 'block',
  color: '#a0aec0',
  fontSize: 11,
  marginBottom: 4,
}}>
                        Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={query.limit || 50}
                        onChange={(e) => updateQuery({ limit: parseInt(e.target.value) })}
                        style={{
  width: '100%',
  padding: 6,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
                      />
                    </div>
                    <div>
                      <label style={{
  display: 'block',
  color: '#a0aec0',
  fontSize: 11,
  marginBottom: 4,
}}>
                        Offset
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={query.offset || 0}
                        onChange={(e) => updateQuery({ offset: parseInt(e.target.value) })}
                        style={{
  width: '100%',
  padding: 6,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{
  display: 'block',
  color: '#a0aec0',
  fontSize: 11,
  marginBottom: 4,
}}>
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={query.subcategory || ''}
                      onChange={(e) => updateQuery({ subcategory: e.target.value || undefined })}
                      placeholder="nobility, peasant, clergy..."
                      style={{
  width: '100%',
  padding: 6,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Validation Errors */}
            {validationErrors.length > 0 && ()
              <div style={{
  background: 'rgba(245, 101, 101, 0.1)',
  border: '1px solid #f56565',
  borderRadius: 4,
  padding: 8,
  marginBottom: 16,
}}>
                {validationErrors.map((error, index) => ()
                  <div key={index} style={{ color: '#f56565', fontSize: 12 }}>
                    • {error}
                  </div>
                ))}
              </div>
            )}
            {/* Query Suggestions */}
            {suggestions.length > 0 && ()
              <div style={{
  background: 'rgba(66, 153, 225, 0.1)',
  border: '1px solid #4299e1',
  borderRadius: 4,
  padding: 8,
  marginBottom: 16,
}}>
                <div style={{ color: '#4299e1', fontSize: 11, marginBottom: 4, fontWeight: 500 }}>
                  💡 Suggestions:
                </div>
                {suggestions.map((suggestion, index) => ()
                  <div key={index} style={{ color: '#4299e1', fontSize: 11, marginBottom: 2 }}>
                    • {suggestion}
                  </div>
                ))}
              </div>
            )}
            {/* Data Sources */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
  display: 'block',
  color: '#e2e8f0',
  fontSize: 12,
  marginBottom: 8,
  fontWeight: 500,
}}>
                Data Sources ({selectedSources.length}/{availableSources.length} selected)
              </label>
              <div style={{ maxHeight: 120, overflowY: 'auto', background: '#2d3748', borderRadius: 4, padding: 8 }}>
                {availableSources.map(source => ()
                  <label key={source.id} style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
  color: '#e2e8f0',
  fontSize: 12,
  cursor: 'pointer',
}}>
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => handleSourceToggle(source.id)}
                      style={{ margin: 0 }}
                    />
                    <div>
                      <div>{source.name}</div>
                      <div style={{ color: '#a0aec0', fontSize: 10 }}>
                        {source.metadata.category} • {source.metadata.tags.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleImportData}
                disabled={!isValid || dataState.isLoading}
                style={{
  flex: 1,
  padding: '10px 16px',
  background: isValid && !dataState.isLoading ? '#48bb78' : '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: isValid && !dataState.isLoading ? 'pointer' : 'not-allowed',
}}
              >
                {dataState.isLoading ? 'Importing...' : 'Import Data'}
              </button>
              <button
                onClick={handleClearAll}
                style={{
  padding: '10px 12px',
  background: '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: 'pointer',
}}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {/* Results Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Results Header */}
          <div style={{
  padding: 16,
  borderBottom: '1px solid #4a5568',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
            <div>
              <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 16 }}>
                Import Results
              </h3>
              {importResults && ()
                <div style={{ color: '#a0aec0', fontSize: 12, marginTop: 4 }}>
                  {importResults.reduce((total, result) => total + result.data.length, 0)} items 
                  from {importResults.length} sources • Cache hit rate: {dataState.cacheHitRate}%
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {importResults && importResults.some(r => r.data.length > 0) && ()
                <>
                  <button
                    onClick={() => handleExport('json')}
                    style={{
  padding: '6px 12px',
  background: '#4299e1',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 12,
  cursor: 'pointer',
}}
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    style={{
  padding: '6px 12px',
  background: '#9f7aea',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 12,
  cursor: 'pointer',
}}
                  >
                    Export CSV
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                style={{
  padding: '6px 12px',
  background: '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 12,
  cursor: 'pointer',
}}
              >
                Close
              </button>
            </div>
          </div>
          {/* Results Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {dataState.isLoading ? ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column',
  gap: 16,
}}>
                <div style={{ color: '#4299e1', fontSize: 16 }}>Importing historical data...</div>
                <div style={{ color: '#a0aec0', fontSize: 14 }}>
                  Querying {selectedSources.length} data sources
                </div>
              </div>
            ) : dataState.hasError ? ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column',
  gap: 16,
}}>
                <div style={{ color: '#f56565', fontSize: 16 }}>Import Error</div>
                <div style={{ color: '#a0aec0', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
                  {dataState.error?.message || 'An unexpected error occurred while importing data'}
                </div>
              </div>
            ) : importResults ? ()
              <HistoricalDataResults results={importResults} />
            ) : ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column',
  gap: 16,
  color: '#a0aec0',
}}>
                <div style={{ fontSize: 48 }}>📚</div>
                <div style={{ fontSize: 16 }}>Configure your query and click "Import Data"</div>
                <div style={{ fontSize: 14 }}>
                  {availableSources.length} data sources available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Results display component
const HistoricalDataResults: React.FC<{ results: QueryResult }> = ({ results }) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const toggleExpanded = useCallback((itemId: string) => {,
  setExpandedItems(prev => {)
  const next = new Set(prev);
  if (next.has(itemId)) {
  next.delete(itemId);
} else {
        next.add(itemId);
      return next;
    });
  }, []);
  const filteredResults = selectedSource ;
    ? results.filter(r => r.metadata.source === selectedSource)
    : results;
  const allItems = filteredResults.flatMap(result => ;);
    result.data.map(item => ({ ...item, _source: result.metadata.source }))
  );
  return;
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Source Filter Sidebar */}
      <div style={{
  width: 200,
  background: '#1a202c',
  borderRight: '1px solid #4a5568',
  overflowY: 'auto',
}}>
        <div style={{ padding: 12 }}>
          <div style={{ color: '#e2e8f0', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
            Sources
          </div>
          <div
            style={{
  padding: '6px 8px',
  background: !selectedSource ? '#2d3748' : 'transparent',
  borderRadius: 4,
  cursor: 'pointer',
  marginBottom: 4,
}}
            onClick={() => setSelectedSource(null)}
          >
            <div style={{ color: '#e2e8f0', fontSize: 12 }}>All Sources</div>
            <div style={{ color: '#a0aec0', fontSize: 10 }}>
              {allItems.length} items
            </div>
          </div>
          {results.map(result => ()
            <div
              key={result.metadata.source}
              style={{
  padding: '6px 8px',
  background: selectedSource === result.metadata.source ? '#2d3748' : 'transparent',
  borderRadius: 4,
  cursor: 'pointer',
  marginBottom: 4,
}}
              onClick={() => setSelectedSource(result.metadata.source)}
            >
              <div style={{ color: '#e2e8f0', fontSize: 12 }}>
                {result.metadata.source.replace('-', ' ').split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
              <div style={{ color: '#a0aec0', fontSize: 10 }}>
                {result.data.length} items • {Math.round(result.metadata.executionTime)}ms
              </div>
              {result.metadata.cached && ()
                <div style={{ color: '#4299e1', fontSize: 9 }}>• Cached</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {allItems.length === 0 ? ()
          <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: 48 }}>
            No data found for the current query
          </div>
        ) : ()
          <div style={{ display: 'grid', gap: 12 }}>
            {allItems.map((item, index) => ()
              <div
                key={`${item._source}-${index}`}
                style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 6,
  padding: 16,
  cursor: 'pointer',
}}
                onClick={() => toggleExpanded(`${item._source}-${index}`)}
              >
                <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
}}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {item.name || item.title || 'Unnamed Item'}
                    </div>
                    {item.description && ()
                      <div style={{ color: '#a0aec0', fontSize: 12, marginBottom: 4 }}>
                        {item.description.length > 100 && !expandedItems.has(`${item._source}-${index}`)}
                          ? `${item.description.substring(0, 100)}...`}
                          : item.description}
                      </div>
                    )}
                  </div>
                  <div style={{ color: '#4299e1', fontSize: 12 }}>
                    {expandedItems.has(`${item._source}-${index}`) ? '▼' : '▶'}
                  </div>
                </div>
                {expandedItems.has(`${item._source}-${index}`) && ()}
                  <div style={{ borderTop: '1px solid #4a5568', paddingTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                      {Object.entries(item).filter(([key]) => !key.startsWith('_') && key !== 'description').map(([key, value]) => ()
                        <div key={key}>
                          <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 2 }}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: 12 }}>
                            {Array.isArray(value) 
                              ? value.join(', ') 
                              : typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{
  marginTop: 8,
  paddingTop: 8,
  borderTop: '1px solid #4a5568',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
                  <div style={{ color: '#a0aec0', fontSize: 10 }}>
                    Source: {item._source}
                  </div>
                  {item.authenticity && ()
                    <div style={{ color: '#48bb78', fontSize: 10 }}>
                      Authenticity: {Math.round(item.authenticity * 100)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};