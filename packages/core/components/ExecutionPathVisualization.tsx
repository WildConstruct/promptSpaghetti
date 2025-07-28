/**
 * Execution Path Visualization Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 */
import React, { useState } from 'react';
import { 
  ExecutionPath, 
  PreviewResultWithPath, 
  NodeExecutionStep, 
  RandomChoiceInfo,
  EXECUTION_PATH_COLORS,
  ExecutionVisualizationConfig,
  DEFAULT_VISUALIZATION_CONFIG 
} from '../types/ExecutionPath';
interface ExecutionPathVisualizationProps {
  results: PreviewResultWithPath[];
  onNodeHighlight?: (nodeIds: string[]) => void;
  config?: Partial<ExecutionVisualizationConfig>;
  className?: string;
}

export const ExecutionPathVisualization: React.FC<ExecutionPathVisualizationProps> = ({)
  results,
  onNodeHighlight,
  config = {},
  className = ''
}) => {
  const vizConfig = { ...DEFAULT_VISUALIZATION_CONFIG, ...config };
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const toggleResultExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };
  const handlePathSelect = (pathId: string, nodeIds: string[]) => {
    setSelectedPath(selectedPath === pathId ? null : pathId);
    if (onNodeHighlight) {
      onNodeHighlight(selectedPath === pathId ? [] : nodeIds);
    }
  };
  // Calculate aggregate stats
  const validResults = results.filter(r => r.executionPath);
  const totalExecution = validResults.reduce((sum, r) => sum + r.executionTimeMs, 0);
  const averageTime = validResults.length > 0 ? totalExecution / validResults.length : 0;
  return ()
    <div className={`execution-path-visualization ${className}`} style={{ }
      background: '#1a202c', 
      borderRadius: 8, 
      padding: 16,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        borderBottom: '1px solid #4a5568',
        paddingBottom: 12,
      }}>
        <h3 style={{ 
          color: '#e2e8f0', 
          margin: 0, 
          fontSize: 16,
          fontWeight: 600 ,
        }}>
          Execution Path Analysis
        </h3>
        {validResults.length > 0 && ()
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            fontSize: 12, 
            color: '#a0aec0' ,
          }}>
            <span>Avg: {averageTime.toFixed(0)}ms</span>
            <span>Paths: {validResults.length}</span>
          </div>
        )}
      </div>
      {validResults.length === 0 ? ()
        <div style={{ 
          color: '#a0aec0', 
          fontStyle: 'italic', 
          textAlign: 'center',
          padding: 24,
        }}>
          No execution path data available
        </div>
      ) : ()
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map((result, index) => {
            if (!result.executionPath) return null;
            const path = result.executionPath;
            const isExpanded = expandedResults.has(index);
            const isSelected = selectedPath === path.id;
            const pathColor = EXECUTION_PATH_COLORS[index % EXECUTION_PATH_COLORS.length];
            return ()
              <div
                key={index}
                style={{
                  border: `1px solid ${isSelected ? pathColor : '#4a5568'}`,}
                  borderRadius: 6,
                  background: isSelected ? 'rgba(66, 153, 225, 0.1)' : '#2d3748',
                  overflow: 'hidden',
                }}
              >
                {/* Path Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(66, 153, 225, 0.05)' : 'transparent'
                  }}
                  onClick={() => handlePathSelect(path.id, path.nodeExecutionOrder)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: pathColor,
                      }}
                    />
                    <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>
                      Seed {result.seed}
                    </span>
                    {path.randomizationPoints.length > 0 && ()
                      <span style={{
                        background: '#805ad5',
                        color: '#fff',
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontWeight: 500,
                      }}>
                        {path.randomizationPoints.length} random
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#a0aec0', fontSize: 12 }}>
                      {path.totalExecutionTime}ms • {path.steps.length} steps
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleResultExpanded(index);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a0aec0',
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                {/* Path Details */}
                {isExpanded && ()
                  <div style={{ 
                    borderTop: '1px solid #4a5568',
                    padding: 12,
                    background: '#1a202c',
                  }}>
                    {/* Execution Steps */}
                    {vizConfig.showExecutionOrder && ()
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ 
                          color: '#e2e8f0', 
                          fontSize: 12, 
                          fontWeight: 600, 
                          marginBottom: 8 ,
                        }}>
                          Execution Order
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {path.nodeExecutionOrder.map((nodeId, stepIndex) => ()
                            <div
                              key={`${nodeId}-${stepIndex}`}
                              style={{
                                background: '#4a5568',
                                color: '#e2e8f0',
                                fontSize: 10,
                                padding: '3px 6px',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                              }}
                            >
                              {stepIndex + 1}. {nodeId.slice(0, 8)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Random Choices */}
                    {vizConfig.showRandomChoices && path.randomizationPoints.length > 0 && ()
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ 
                          color: '#e2e8f0', 
                          fontSize: 12, 
                          fontWeight: 600, 
                          marginBottom: 8 ,
                        }}>
                          Randomization Points
                        </div>
                        {path.randomizationPoints.map((choice, choiceIndex) => ()
                          <div
                            key={choiceIndex}
                            style={{
                              background: '#805ad5',
                              color: '#fff',
                              fontSize: 11,
                              padding: 8,
                              borderRadius: 4,
                              marginBottom: 4,
                              fontFamily: 'monospace',
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>
                              {choice.choiceType.toUpperCase()}: {choice.selectedOption}
                            </div>
                            <div style={{ opacity: 0.9, marginTop: 2 }}>
                              {choice.selectionReason}
                            </div>
                            {choice.probability && ()
                              <div style={{ opacity: 0.8, marginTop: 2 }}>
                                Probability: {(choice.probability * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Performance Breakdown */}
                    {vizConfig.showPerformanceMetrics && result.debugInfo && ()
                      <div>
                        <div style={{ 
                          color: '#e2e8f0', 
                          fontSize: 12, 
                          fontWeight: 600, 
                          marginBottom: 8 ,
                        }}>
                          Performance Breakdown
                        </div>
                        <div style={{
                          background: '#2d3748',
                          padding: 8,
                          borderRadius: 4,
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#a0aec0',
                        }}>
                          {Object.entries(result.debugInfo.performanceBreakdown).map(([nodeType, time]) => ()
                            <div key={nodeType} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              marginBottom: 2,
                            }}>
                              <span>{nodeType}:</span>
                              <span>{typeof time === 'number' ? time.toFixed(1) : time}ms</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExecutionPathVisualization;