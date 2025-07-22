import React, { useState } from 'react';
import { PreviewResultWithPath } from './types/ExecutionPath.js';
import { ExecutionPathVisualization } from './components/ExecutionPathVisualization.js';

// Legacy interface for backward compatibility
interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
}

interface PreviewModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: PreviewResult[] | PreviewResultWithPath[];
  onClose: () => void;
  onCancel?: () => void;
  onResultHover?: (index: number) => void;
  onNodeHighlight?: (nodeIds: string[]) => void;
}

export   
  // Check if results have execution path data
  const hasExecutionPaths = results.length > 0 && 
    results.some(r => 'executionPath' in r && r.executionPath);

  if (!open) return null;
  
  return (
    <div role="dialog" aria-modal="true" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: 'rgba(0,0,0,0.4)', 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 8, 
        padding: 24, 
        minWidth: 400, 
        maxWidth: hasExecutionPaths ? 800 : 600,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{ margin: 0 }}>Preview Results</h2>
          
          {hasExecutionPaths && (
            <button
              onClick={() => setShowExecutionPaths(!showExecutionPaths)}
              style={{
                background: showExecutionPaths ? '#4d7cff' : '#e2e8f0',
                color: showExecutionPaths ? '#fff' : '#2d3748',
                border: 'none',
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {showExecutionPaths ? '📊 Hide Paths' : '🔍 Show Paths'}
            </button>
          )}
        </div>

        {loading && <div style={{marginBottom:12}}>Loading...</div>}
        {error && <div style={{ color: '#c00' }}>Error: {error}</div>}
        
        {!loading && !error && (
          <div>
            {/* Execution Path Visualization */}
            {showExecutionPaths && hasExecutionPaths && (
              <div style={{ marginBottom: 20 }}>
                <ExecutionPathVisualization 
                  results={results as PreviewResultWithPath[]}
                  onNodeHighlight={onNodeHighlight}
                  config={{
                    showExecutionOrder: true,
                    showRandomChoices: true,
                    showPerformanceMetrics: true
                  }}
                />
              </div>
            )}
            
            {/* Results List */}
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {results.map((res, i) => {
                const hasPath = 'executionPath' in res && res.executionPath;
                return (
                  <li key={i} onMouseEnter={() => onResultHover?.(i)} style={{ 
                    marginBottom: 16, 
                    padding: 8, 
                    border: '1px solid #eee', 
                    borderRadius: 4, 
                    position:'relative', 
                    cursor:'pointer',
                    background: hasPath ? '#f8fafc' : '#fff'
                  }}>
                    <span style={{
                      position:'absolute',
                      top:-10,
                      left:-10,
                      background: res.error ? '#c00' : '#4d7cff',
                      color:'#fff',
                      fontSize:10,
                      padding:'2px 6px',
                      borderRadius:12,
                      fontWeight:600
                    }}>{res.seed}</span>
                    
                    {hasPath && (
                      <div style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        background: '#10b981',
                        color: '#fff',
                        fontSize: 9,
                        padding: '2px 4px',
                        borderRadius: 8,
                        fontWeight: 500
                      }}>
                        PATH
                      </div>
                    )}
                    
                    {res.error ? (
                      <div style={{ color: '#c00' }}>{res.error}</div>
                    ) : (
                      <div style={{ fontFamily: 'monospace', whiteSpace:'pre-wrap' }}>
                        {res.output || ('output' in res ? res.output : '')}
                      </div>
                    )}
                    
                    {/* Execution metadata */}
                    {hasPath && 'executionTimeMs' in res && (
                      <div style={{
                        marginTop: 8,
                        padding: 6,
                        background: '#e2e8f0',
                        borderRadius: 4,
                        fontSize: 11,
                        color: '#4a5568'
                      }}>
                        Execution: {res.executionTimeMs}ms
                        {res.executionPath && (
                          <span style={{ marginLeft: 8 }}>
                            • {res.executionPath.steps.length} steps
                            • {res.executionPath.randomizationPoints.length} random points
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
      </div>
    </div>
  );
};
