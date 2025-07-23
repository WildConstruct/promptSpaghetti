/**
 * ExportBundleDialog - Dialog for exporting graphs as GeneratorBundle files
 */

import React, { useState } from 'react';
import { useGraphStore } from '../../graphStore';
import { Node, Edge } from 'reactflow';

interface ExportBundleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  onExport?: (result: { success: boolean; error?: string }) => void;
}

interface ExportOptions {
  name: string;
  version: string;
  author: string;
  description?: string;
  includeMetadata: boolean;
  minifyOutput: boolean;
  format: 'json' | 'compressed' | 'yaml' | 'xml' | 'graph' | 'csv';
  imageFormat?: 'png' | 'svg' | 'pdf';
  includePreview: boolean;
  exportQuality: 'draft' | 'standard' | 'high';
}

export const ExportBundleDialog: React.FC<ExportBundleDialogProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onExport
}) => {
  const { currentProject } = useGraphStore();
  
  const [formData, setFormData] = useState<ExportOptions>({
    name: currentProject?.name || 'Untitled_Graph',
    version: '1.0.0',
    author: currentProject?.author || 'PromptScape User',
    description: currentProject?.description || '',
    includeMetadata: true,
    minifyOutput: false,
    format: 'json',
    imageFormat: 'png',
    includePreview: false,
    exportQuality: 'standard'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const getFormatInfo = (format: string) => {
    const formatInfo = {
      json: {
        name: 'GeneratorBundle JSON',
        description: 'Standard JSON format compatible with randomizer engine',
        extension: '.bundle.json',
        mimeType: 'application/json'
      },
      compressed: {
        name: 'Compressed JSON',
        description: 'Minified JSON for smaller file size',
        extension: '.bundle.min.json',
        mimeType: 'application/json'
      },
      yaml: {
        name: 'YAML Format',
        description: 'Human-readable YAML format',
        extension: '.bundle.yaml',
        mimeType: 'application/yaml'
      },
      xml: {
        name: 'XML Format',
        description: 'Structured XML representation',
        extension: '.bundle.xml',
        mimeType: 'application/xml'
      },
      graph: {
        name: 'Graph Format',
        description: 'Native graph structure for re-importing',
        extension: '.psg',
        mimeType: 'application/json'
      },
      csv: {
        name: 'CSV Export',
        description: 'Node and edge data in tabular format',
        extension: '.csv',
        mimeType: 'text/csv'
      }
    };
    return formatInfo[format as keyof typeof formatInfo] || formatInfo.json;
  };

  const convertToFormat = (bundle: any, format: string) => {
    switch (format) {
    case 'yaml':
      // Convert to YAML (simplified)
      return convertToYAML(bundle);
    case 'xml':
      // Convert to XML (simplified)
      return convertToXML(bundle);
    case 'graph':
      // Export as native graph format
      return JSON.stringify({ nodes, edges, metadata: bundle.metadata }, null, 2);
    case 'csv':
      // Export as CSV
      return convertToCSV(nodes, edges);
    case 'compressed':
      return JSON.stringify(bundle);
    default:
      return JSON.stringify(bundle, null, formData.minifyOutput ? 0 : 2);
    }
  };

  const convertToYAML = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${convertToYAML(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
      }
    }
    return yaml;
  };

  const convertToXML = (obj: any, rootName = 'bundle'): string => {
    const xmlEscape = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    const objToXML = (obj: any, name: string): string => {
      if (obj === null || obj === undefined) {
        return `<${name}></${name}>`;
      }
      if (typeof obj !== 'object') {
        return `<${name}>${xmlEscape(String(obj))}</${name}>`;
      }
      if (Array.isArray(obj)) {
        return obj.map((item, i) => objToXML(item, `${name}_${i}`)).join('');
      }
      
      let xml = `<${name}>`;
      for (const [key, value] of Object.entries(obj)) {
        xml += objToXML(value, key);
      }
      xml += `</${name}>`;
      return xml;
    };
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n${objToXML(obj, rootName)}`;
  };

  const convertToCSV = (nodes: Node[], edges: Edge[]): string => {
    const nodeCSV = [
      'ID,Type,Label,Data',
      ...nodes.map(node => 
        `"${node.id}","${node.type}","${node.data?.label || ''}","${JSON.stringify(node.data || {}).replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    const edgeCSV = [
      '\n\nEDGES:',
      'ID,Source,Target,Type',
      ...edges.map(edge => 
        `"${edge.id}","${edge.source}","${edge.target}","${edge.type || 'default'}"`
      )
    ].join('\n');
    
    return `NODES:\n${nodeCSV}${edgeCSV}`;
  };

  const handleInputChange = (field: keyof ExportOptions) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const generatePreview = async () => {
    try {
      setError(null);
      const response = await fetch('/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graph: { nodes, edges },
          options: {
            name: formData.name,
            version: formData.version,
            author: formData.author
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { bundle } = await response.json();
      setPreviewData(bundle);
    } catch (err) {
      setError(`Preview failed: ${err instanceof Error ? err.message : String(err)}`);
      setPreviewData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Bundle name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graph: { nodes, edges },
          options: {
            name: formData.name.trim(),
            version: formData.version.trim(),
            author: formData.author.trim()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { bundle, filename } = await response.json();

      // Process bundle based on options and format
      const formatInfo = getFormatInfo(formData.format);
      let exportContent = convertToFormat(bundle, formData.format);
      const exportFilename = filename.replace('.bundle.json', formatInfo.extension);
      const mimeType = formatInfo.mimeType;

      // Add quality metadata for non-JSON formats
      if (formData.format !== 'json' && formData.format !== 'compressed') {
        const metadata = {
          exportedBy: 'PromptScape GraphEditor',
          exportDate: new Date().toISOString(),
          quality: formData.exportQuality,
          includesPreview: formData.includePreview,
          originalFormat: 'GeneratorBundle'
        };
        
        if (formData.format === 'graph') {
          const graphData = JSON.parse(exportContent);
          graphData.exportMetadata = metadata;
          exportContent = JSON.stringify(graphData, null, 2);
        }
      }

      // Download the bundle file
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);

      onExport?.({ success: true });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      onExport?.({ success: false, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#333'
          }}>
            📦 Export GeneratorBundle
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bundle Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Bundle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Enter bundle name..."
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Version and Author */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={handleInputChange('version')}
                placeholder="1.0.0"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={handleInputChange('author')}
                placeholder="Your name..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Optional bundle description..."
              disabled={isLoading}
              rows={2}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Export Format */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Export Format
            </label>
            
            <select
              value={formData.format}
              onChange={handleInputChange('format')}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '8px',
                boxSizing: 'border-box'
              }}
            >
              <option value="json">📦 GeneratorBundle JSON - Standard format</option>
              <option value="compressed">🗜️ Compressed JSON - Smaller file size</option>
              <option value="yaml">📋 YAML Format - Human readable</option>
              <option value="xml">🏷️ XML Format - Structured markup</option>
              <option value="graph">🌐 Graph Format - Native .psg format</option>
              <option value="csv">📊 CSV Export - Tabular data</option>
            </select>
            
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              padding: '6px',
              background: '#f9f9f9',
              borderRadius: '4px'
            }}>
              {getFormatInfo(formData.format).description}
            </div>
          </div>

          {/* Export Options */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Export Options
            </label>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.includeMetadata}
                  onChange={handleInputChange('includeMetadata')}
                  disabled={isLoading}
                  style={{ marginRight: '6px' }}
                />
                Include metadata
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.includePreview}
                  onChange={handleInputChange('includePreview')}
                  disabled={isLoading}
                  style={{ marginRight: '6px' }}
                />
                Include preview
              </label>
              
              {(formData.format === 'json' || formData.format === 'graph') && (
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.minifyOutput}
                    onChange={handleInputChange('minifyOutput')}
                    disabled={isLoading}
                    style={{ marginRight: '6px' }}
                  />
                  Minify output
                </label>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', color: '#666' }}>
                Export Quality:
              </label>
              <select
                value={formData.exportQuality}
                onChange={handleInputChange('exportQuality')}
                disabled={isLoading}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              >
                <option value="draft">📝 Draft - Basic export</option>
                <option value="standard">⭐ Standard - Full metadata</option>
                <option value="high">💎 High - Complete with validation</option>
              </select>
            </div>
          </div>

          {/* Preview Section */}
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={generatePreview}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                color: '#495057',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                marginBottom: '8px'
              }}
            >
              {isLoading ? 'Loading...' : '🔍 Preview Bundle'}
            </button>

            {previewData && (
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <strong>Bundle Preview:</strong>
                <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(previewData, null, 2).substring(0, 500)}
                  {JSON.stringify(previewData, null, 2).length > 500 ? '...' : ''}
                </pre>
              </div>
            )}
          </div>

          {/* Export Information */}
          <div style={{
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d9ff',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0066cc' }}>
              📋 Export Information
            </h4>
            <ul style={{
              margin: '0',
              paddingLeft: '16px',
              fontSize: '13px',
              color: '#0066cc',
              lineHeight: 1.4
            }}>
              <li>Contains {nodes.length} nodes and {edges.length} connections</li>
              <li>Format: {getFormatInfo(formData.format).name}</li>
              <li>Extension: {getFormatInfo(formData.format).extension}</li>
              {formData.format === 'json' && (
                <li>CLI usage: <code>promptgraph exec {formData.name}{getFormatInfo(formData.format).extension}</code></li>
              )}
              {formData.format === 'graph' && (
                <li>Re-importable graph format for GraphEditor</li>
              )}
              {(formData.format === 'yaml' || formData.format === 'xml') && (
                <li>Human-readable format for documentation and review</li>
              )}
              {formData.format === 'csv' && (
                <li>Tabular format suitable for analysis tools</li>
              )}
              <li>Quality level: {formData.exportQuality}</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#666',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: isLoading ? '#ccc' : '#4CAF50',
                color: 'white',
                borderRadius: '4px',
                cursor: isLoading || !formData.name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoading ? 'Exporting...' : '📦 Export Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportBundleDialog;