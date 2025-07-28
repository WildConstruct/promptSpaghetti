// packages/core/components/DataSources/DataSourceConfigurationPanel.tsx
// Epic 8.8 Task 1: External Data Source Configuration Interface
import React, { useState, useCallback, useEffect } from 'react';
import { DataSource, DataTransform } from '../../external-data/DataSourceManager';

export interface DataSourceConfigurationPanelProps {
  visible: boolean;,
  onClose: () => void;
  onSave: (dataSources: DataSource) => void;
  initialDataSources?: DataSource;
  interface DataSourceFormData {
  id: string;,
  name: string;
  type: DataSource['type'];,
  enabled: boolean;
  endpoint?: string;
  authentication: {,
  type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer';,
  credentials: Record<string, string>;
  headers: Record<string, string>;
};
  caching: {,
  enabled: boolean;
  ttl: number;,
  strategy: 'memory' | 'disk' | 'hybrid';
  maxSize: number;
};
  transforms: DataTransform;
  rateLimit?: {
  requests: number;,
  window: number;
  burst?: number;
};
  reliability: {,
  timeout: number;
  retries: number;,
  backoff: 'linear' | 'exponential';
  healthCheck?: string;
};
  metadata: {,
  description: string;
  category: 'historical' | 'cultural' | 'artistic' | 'academic' | 'commercial';,
  tags: string;
  version: string;
};
const defaultDataSourceForm: DataSourceFormData = {,
  id: '',
  name: '',
  type: 'api',
  enabled: true,
  endpoint: '',
  authentication: {,
  type: 'none',
    credentials: {},
    headers: {}
  },
  caching: {,
  enabled: true,
  ttl: 3600,
  strategy: 'hybrid',
  maxSize: 50,
},
  transforms: [],
  rateLimit: {,
  requests: 100,
  window: 60,
  burst: 10,
},
  reliability: {,
  timeout: 10000,
  retries: 3,
  backoff: 'exponential',
},
  metadata: {,
  description: '',
  category: 'historical',
  tags: [],
  version: '1.0',
};
}
export const DataSourceConfigurationPanel: React.FC<DataSourceConfigurationPanelProps> = ({)
  visible,
  onClose,
  onSave,
  initialDataSources = []
}) => {
  const [dataSources, setDataSources] = useState<DataSource>(initialDataSources);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<DataSourceFormData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const selectedSource = dataSources.find(ds => ds.id === selectedSourceId);
  useEffect(() => {
    if (initialDataSources.length > 0) {
      setDataSources(initialDataSources);
  }, [initialDataSources]);
  const handleNewSource = useCallback(() => {
    const newId = `custom-source-${Date.now()}`;}
    setEditingSource({ ...defaultDataSourceForm, id: newId });
    setShowForm(true);
  }, []);
  const handleEditSource = useCallback((source: DataSource) => {
    setEditingSource({)
  ...source,
      authentication: {,
  type: source.authentication?.type || 'none',
        credentials: source.authentication?.credentials || {},
        headers: source.authentication?.headers || {}
    });
    setShowForm(true);
  }, []);
  const handleSaveSource = useCallback(() => {
  if (!editingSource) return;
  const updatedSources = dataSources.some(ds => ds.id === editingSource.id);
  ? dataSources.map(ds => ds.id === editingSource.id ? editingSource : ds),
  : [...dataSources, editingSource];
  setDataSources(updatedSources);
  setEditingSource(null);
  setShowForm(false);
  onSave(updatedSources);
}, [editingSource, dataSources, onSave]);
  const handleDeleteSource = useCallback((sourceId: string) => {
    const updatedSources = dataSources.filter(ds => ds.id !== sourceId);
    setDataSources(updatedSources);
    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    onSave(updatedSources);
  }, [dataSources, selectedSourceId, onSave]);
  const handleToggleSource = useCallback((sourceId: string) => {
    const updatedSources = dataSources.map(ds =>;);
      ds.id === sourceId ? { ...ds, enabled: !ds.enabled } : ds
    );
    setDataSources(updatedSources);
    onSave(updatedSources);
  }, [dataSources, onSave]);
  const updateEditingSource = useCallback((updates: Partial<DataSourceFormData>) => {
    if (!editingSource) return;
    setEditingSource({ ...editingSource, ...updates });
  }, [editingSource]);
  const addTag = useCallback((tag: string) => {
  if (!editingSource || editingSource.metadata.tags.includes(tag)) return;
  updateEditingSource({)
  metadata: {,
  ...editingSource.metadata,
  tags: [...editingSource.metadata.tags, tag],
});
  }, [editingSource, updateEditingSource]);
  const removeTag = useCallback((tag: string) => {
  if (!editingSource) return;
  updateEditingSource({)
  metadata: {,
  ...editingSource.metadata,
  tags: editingSource.metadata.tags.filter(t => t !== tag),
});
  }, [editingSource, updateEditingSource]);
  if (!visible) return null;
  return;
    <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
}}>
      <div style={{
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 8,
  width: '90vw',
  maxWidth: 1200,
  maxHeight: '90vh',
  display: 'flex',
  overflow: 'hidden',
}}>
        {/* Sidebar - Data Sources List */}
        <div style={{
  width: 320,
  background: '#1a202c',
  borderRight: '1px solid #4a5568',
  display: 'flex',
  flexDirection: 'column',
}}>
          <div style={{
  padding: 16,
  borderBottom: '1px solid #4a5568',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
            <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 16 }}>
              Data Sources
            </h3>
            <button
              onClick={handleNewSource}
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
              + Add New
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {dataSources.map(source => ()
              <div
                key={source.id}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  background: selectedSourceId === source.id ? '#2d3748' : 'transparent',
                  border: `1px solid ${selectedSourceId === source.id ? '#4299e1' : '#4a5568'}`}
},
  borderRadius: 6,
                  cursor: 'pointer';
  }}
                onClick={() => setSelectedSourceId(source.id)}
              >
                <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
}}>
                  <div>
                    <div style={{
  color: '#e2e8f0',
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 4,
}}>
                      {source.name}
                    </div>
                    <div style={{
  color: '#a0aec0',
  fontSize: 12,
  marginBottom: 4,
}}>
                      {source.type.toUpperCase()}
                    </div>
                  </div>
                  <div style={{
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: source.enabled ? '#48bb78' : '#f56565',
}} />
                </div>
                <div style={{
  color: '#a0aec0',
  fontSize: 11,
  marginBottom: 8,
  maxHeight: 36,
  overflow: 'hidden',
  lineHeight: 1.3,
}}>
                  {source.metadata.description}
                </div>
                <div style={{
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  marginBottom: 8,
}}>
                  {source.metadata.tags.slice(0, 3).map(tag => ()
                    <span
                      key={tag}
                      style={{
  background: '#4a5568',
  color: '#e2e8f0',
  padding: '2px 6px',
  borderRadius: 3,
  fontSize: 10,
}}
                    >
                      {tag}
                    </span>
                  ))}
                  {source.metadata.tags.length > 3 && ()
                    <span style={{ color: '#a0aec0', fontSize: 10 }}>
                      +{source.metadata.tags.length - 3}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSource(source.id);
                    }}
                    style={{
  padding: '2px 8px',
  background: source.enabled ? '#f56565' : '#48bb78',
  border: 'none',
  borderRadius: 3,
  color: 'white',
  fontSize: 10,
  cursor: 'pointer',
}}
                  >
                    {source.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSource(source);
                    }}
                    style={{
  padding: '2px 8px',
  background: '#9f7aea',
  border: 'none',
  borderRadius: 3,
  color: 'white',
  fontSize: 10,
  cursor: 'pointer',
}}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSource(source.id);
                    }}
                    style={{
  padding: '2px 8px',
  background: '#e53e3e',
  border: 'none',
  borderRadius: 3,
  color: 'white',
  fontSize: 10,
  cursor: 'pointer',
}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
  padding: 16,
  borderBottom: '1px solid #4a5568',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
            <h2 style={{ color: '#e2e8f0', margin: 0, fontSize: 20 }}>
              External Data Sources Configuration
            </h2>
            <button
              onClick={onClose}
              style={{
  padding: '8px 16px',
  background: '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: 'pointer',
}}
            >
              Close
            </button>
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {showForm && editingSource ? ()
              <DataSourceForm
                source={editingSource}
                onUpdate={updateEditingSource}
                onSave={handleSaveSource}
                onCancel={() => {
                  setShowForm(false);
                  setEditingSource(null);
                }}
                onAddTag={addTag}
                onRemoveTag={removeTag}
              />
            ) : selectedSource ? ()
              <DataSourceDetails
                source={selectedSource}
                onEdit={() => handleEditSource(selectedSource)}
              />
            ) : ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#a0aec0',
  fontSize: 16,
}}>
                Select a data source to view details or click "Add New" to create one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Source Form Component
const DataSourceForm: React.FC<{,
  source: DataSourceFormData;
  onUpdate: (updates: Partial<DataSourceFormData>) => void;,
  onSave: () => void;
  onCancel: () => void;,
  onAddTag: (tag: string) => void;,
  onRemoveTag: (tag: string) => void;
}> = ({ source, onUpdate, onSave, onCancel, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState('');
  const handleTagAdd = useCallback(() => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
  }, [newTag, onAddTag]);
  return;
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 800 }}>
        {/* Basic Information */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 16 }}>
            Basic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }}>
                Name *
              </label>
              <input
                type="text"
                value={source.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                style={{
  width: '100%',
  padding: 8,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
                placeholder="Enter source name"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }}>
                Type *
              </label>
              <select
                value={source.type}
                onChange={(e) => onUpdate({ type: e.target.value as DataSource['type'] })}
                style={{
  width: '100%',
  padding: 8,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
              >
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="file">File</option>
                <option value="static">Static Data</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={source.metadata.description}
              onChange={(e) => onUpdate({)
  metadata: { ...source.metadata, description: e.target.value }
              })}
              rows={3}
              style={{
  width: '100%',
  padding: 8,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
  resize: 'vertical',
}}
              placeholder="Describe this data source..."
            />
          </div>
          {source.type === 'api' && ()
            <div>
              <label style={{ display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }}>
                API Endpoint *
              </label>
              <input
                type="url"
                value={source.endpoint || ''}
                onChange={(e) => onUpdate({ endpoint: e.target.value })}
                style={{
  width: '100%',
  padding: 8,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 14,
}}
                placeholder="https://api.example.com/v1"
              />
            </div>
          )}
        </div>
        {/* Tags */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 16 }}>
            Tags
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {source.metadata.tags.map(tag => ()
              <span
                key={tag}
                style={{
  background: '#4a5568',
  color: '#e2e8f0',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  style={{
  background: 'none',
  border: 'none',
  color: '#f56565',
  cursor: 'pointer',
  fontSize: 12,
  padding: 0,
}}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
              placeholder="Add tag..."
              style={{
  flex: 1,
  padding: 6,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
            />
            <button
              onClick={handleTagAdd}
              disabled={!newTag.trim()}
              style={{
  padding: '6px 12px',
  background: newTag.trim() ? '#4299e1' : '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 12,
  cursor: newTag.trim() ? 'pointer' : 'not-allowed',
}}
            >
              Add
            </button>
          </div>
        </div>
        {/* Save/Cancel Buttons */}
        <div style={{
  display: 'flex',
  gap: 12,
  paddingTop: 16,
  borderTop: '1px solid #4a5568',
}}>
          <button
            onClick={onSave}
            disabled={!source.name.trim()}
            style={{
  padding: '10px 20px',
  background: source.name.trim() ? '#48bb78' : '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: source.name.trim() ? 'pointer' : 'not-allowed',
}}
          >
            Save Data Source
          </button>
          <button
            onClick={onCancel}
            style={{
  padding: '10px 20px',
  background: '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: 'pointer',
}}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Data Source Details Component
const DataSourceDetails: React.FC<{,
  source: DataSource;
  onEdit: () => void;
}> = ({ source, onEdit }) => {
  return;
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 800 }}>
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 24,
}}>
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 20, margin: '0 0 8px 0' }}>
              {source.name}
            </h3>
            <div style={{ color: '#a0aec0', fontSize: 14, marginBottom: 8 }}>
              {source.type.toUpperCase()} • {source.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div style={{ color: '#a0aec0', fontSize: 14 }}>
              {source.metadata.description}
            </div>
          </div>
          <button
            onClick={onEdit}
            style={{
  padding: '8px 16px',
  background: '#4299e1',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  fontSize: 14,
  cursor: 'pointer',
}}
          >
            Edit
          </button>
        </div>
        {/* Configuration Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h4 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 12 }}>
              Connection
            </h4>
            {source.endpoint && ()
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#a0aec0', fontSize: 12 }}>Endpoint: </span>
                <span style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' }}>
                  {source.endpoint}
                </span>
              </div>
            )}
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#a0aec0', fontSize: 12 }}>Auth: </span>
              <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                {source.authentication?.type || 'None'}
              </span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 12 }}>
              Caching
            </h4>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#a0aec0', fontSize: 12 }}>Strategy: </span>
              <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                {source.caching.strategy}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#a0aec0', fontSize: 12 }}>TTL: </span>
              <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                {source.caching.ttl}s
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#a0aec0', fontSize: 12 }}>Max Size: </span>
              <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                {source.caching.maxSize}MB
              </span>
            </div>
          </div>
        </div>
        {/* Tags */}
        <div style={{ marginTop: 24 }}>
          <h4 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 12 }}>
            Tags
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {source.metadata.tags.map(tag => ()
              <span
                key={tag}
                style={{
  background: '#4a5568',
  color: '#e2e8f0',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
}}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Transforms */}
        {source.transforms.length > 0 && ()
          <div style={{ marginTop: 24 }}>
            <h4 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 12 }}>
              Data Transforms ({source.transforms.length})
            </h4>
            <div style={{ background: '#1a202c', padding: 16, borderRadius: 6 }}>
              {source.transforms.map((transform, index) => ()
                <div key={transform.id} style={{ marginBottom: index < source.transforms.length - 1 ? 12 : 0 }}>
                  <div style={{ color: '#e2e8f0', fontSize: 14, marginBottom: 4 }}>
                    {transform.name} ({transform.type})
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: 12 }}>
                    {transform.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};