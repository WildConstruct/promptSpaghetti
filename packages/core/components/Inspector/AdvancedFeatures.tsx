// Advanced Features UI Components for Story 2.2b
// Provides text refinement, conflict detection, and analysis tools

import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import {
  TextRefinementService,
  RefinementMode,
  RefinementResult,
  DiffSegment
} from '../../services/llm/TextRefinementService';
import {
  GraphAnalyzer,
  Conflict,
  ComplexityReport,
  MergeSuggestion,
  SplitSuggestion,
  PreviewVariation
} from '../../services/llm/GraphAnalyzer';
import './AdvancedFeatures.css';

// Text Refinement Component
interface TextRefinementProps {
  text: string;
  onRefine: (refined: string) => void;
  refinementService: TextRefinementService;
}

export const TextRefinement: React.FC<TextRefinementProps> = ({
  text,
  onRefine,
  refinementService
}) => {
  const [mode, setMode] = useState<RefinementMode>('expand');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleRefine = useCallback(async () => {
    setLoading(true);
    try {
      const refined = await refinementService.refine(text, mode);
      setResult(refined);
      setShowDiff(true);
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setLoading(false);
    }
  }, [text, mode, refinementService]);

  const handleApply = useCallback(() => {
    if (result) {
      onRefine(result.refined);
      setResult(null);
      setShowDiff(false);
    }
  }, [result, onRefine]);

  const handleCancel = useCallback(() => {
    setResult(null);
    setShowDiff(false);
  }, []);

  return (
    <div className="text-refinement">
      <div className="refinement-controls">
        <select
          value={mode}
          onChange={e => setMode(e.target.value as RefinementMode)}
          disabled={loading}
        >
          <option value="expand">Expand</option>
          <option value="contract">Contract</option>
          <option value="correct">Correct</option>
        </select>
        <button
          onClick={handleRefine}
          disabled={loading || !text}
          className="refine-btn"
        >
          {loading ? 'Refining...' : 'Refine Text'}
        </button>
      </div>

      {result && showDiff && (
        <div className="refinement-diff">
          <div className="diff-header">
            <h4>Refinement Preview</h4>
            <span className={`confidence confidence-${result.confidence}`}>
              {result.confidence} confidence
            </span>
          </div>

          <div className="diff-content">
            <div className="original-text">
              <h5>Original:</h5>
              <p>{result.original}</p>
            </div>
            <div className="refined-text">
              <h5>Refined:</h5>
              <p>{result.refined}</p>
            </div>
          </div>

          {result.changes.length > 0 && (
            <div className="changes-list">
              <h5>Changes:</h5>
              <ul>
                {result.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="diff-actions">
            <button onClick={handleApply} className="apply-btn">
              Apply Changes
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Conflict Detection Component
interface ConflictDetectorProps {
  nodes: Node[];
  edges: Edge[];
  analyzer: GraphAnalyzer;
  onConflictSelect?: (nodeIds: string[]) => void;
}

export const ConflictDetector: React.FC<ConflictDetectorProps> = ({
  nodes,
  edges,
  analyzer,
  onConflictSelect
}) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);

  const detectConflicts = useCallback(async () => {
    setLoading(true);
    try {
      const detected = await analyzer.detectConflicts(nodes, edges);
      setConflicts(detected);
    } catch (error) {
      console.error('Conflict detection failed:', error);
    } finally {
      setLoading(false);
    }
  }, [nodes, edges, analyzer]);

  useEffect(() => {
    if (autoCheck) {
      const timer = setTimeout(detectConflicts, 2000);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, autoCheck, detectConflicts]);

  const handleConflictClick = useCallback(
    (conflict: Conflict) => {
      if (onConflictSelect) {
        onConflictSelect(conflict.nodeIds);
      }
    },
    [onConflictSelect]
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div className="conflict-detector">
      <div className="detector-header">
        <h3>Conflict Detection</h3>
        <label className="auto-check">
          <input
            type="checkbox"
            checked={autoCheck}
            onChange={e => setAutoCheck(e.target.checked)}
          />
          Auto-check
        </label>
        <button
          onClick={detectConflicts}
          disabled={loading}
          className="check-btn"
        >
          {loading ? 'Checking...' : 'Check Now'}
        </button>
      </div>

      {conflicts.length === 0 ? (
        <div className="no-conflicts">✅ No conflicts detected</div>
      ) : (
        <div className="conflicts-list">
          {conflicts.map((conflict, i) => (
            <div
              key={i}
              className={`conflict-item ${conflict.severity}`}
              onClick={() => handleConflictClick(conflict)}
            >
              <div className="conflict-header">
                <span className="severity-icon">
                  {getSeverityIcon(conflict.severity)}
                </span>
                <span className="conflict-type">{conflict.type}</span>
                {conflict.confidence && (
                  <span className="confidence">
                    {Math.round(conflict.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="conflict-description">{conflict.description}</p>
              {conflict.suggestion && (
                <p className="conflict-suggestion">💡 {conflict.suggestion}</p>
              )}
              <div className="affected-nodes">
                Affects: {conflict.nodeIds.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Graph Complexity Analysis Component
interface ComplexityAnalysisProps {
  nodes: Node[];
  edges: Edge[];
  analyzer: GraphAnalyzer;
}

export const ComplexityAnalysis: React.FC<ComplexityAnalysisProps> = ({
  nodes,
  edges,
  analyzer
}) => {
  const [report, setReport] = useState<ComplexityReport | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyzeComplexity = useCallback(() => {
    const analysis = analyzer.analyzeComplexity(nodes, edges);
    setReport(analysis);
    setExpanded(true);
  }, [nodes, edges, analyzer]);

  const getScoreColor = (score: number) => {
    if (score < 30) return 'good';
    if (score < 60) return 'moderate';
    return 'complex';
  };

  return (
    <div className="complexity-analysis">
      <button onClick={analyzeComplexity} className="analyze-btn">
        📊 Analyze Complexity
      </button>

      {report && expanded && (
        <div className="complexity-report">
          <div className="report-header">
            <h3>Complexity Report</h3>
            <button onClick={() => setExpanded(false)} className="close-btn">
              ×
            </button>
          </div>

          <div className={`complexity-score ${getScoreColor(report.score)}`}>
            <div className="score-value">{Math.round(report.score)}</div>
            <div className="score-label">Complexity Score</div>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Total Nodes</span>
              <span className="metric-value">{report.nodeCount}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max Depth</span>
              <span className="metric-value">{report.maxDepth}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Branching</span>
              <span className="metric-value">
                {report.averageBranchingFactor.toFixed(2)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Est. Variations</span>
              <span className="metric-value">
                {report.estimatedVariations.toLocaleString()}
              </span>
            </div>
          </div>

          {report.nodeTypeBreakdown.size > 0 && (
            <div className="node-breakdown">
              <h4>Node Types</h4>
              <div className="breakdown-list">
                {Array.from(report.nodeTypeBreakdown.entries()).map(
                  ([type, count]) => (
                    <div key={type} className="breakdown-item">
                      <span className="type-name">{type}</span>
                      <span className="type-count">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {report.optimizationSuggestions.length > 0 && (
            <div className="suggestions">
              <h4>Optimization Suggestions</h4>
              <ul>
                {report.optimizationSuggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Preview Variations Generator
interface PreviewGeneratorProps {
  nodes: Node[];
  edges: Edge[];
  analyzer: GraphAnalyzer;
  onPreviewGenerated?: (previews: PreviewVariation[]) => void;
}

export const PreviewGenerator: React.FC<PreviewGeneratorProps> = ({
  nodes,
  edges,
  analyzer,
  onPreviewGenerated
}) => {
  const [previews, setPreviews] = useState<PreviewVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(3);

  const generatePreviews = useCallback(async () => {
    setLoading(true);
    try {
      const generated = await analyzer.generatePreviews(nodes, edges, count);
      setPreviews(generated);
      if (onPreviewGenerated) {
        onPreviewGenerated(generated);
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [nodes, edges, count, analyzer, onPreviewGenerated]);

  return (
    <div className="preview-generator">
      <div className="generator-controls">
        <label>
          Generate
          <input
            type="number"
            min="1"
            max="10"
            value={count}
            onChange={e => setCount(parseInt(e.target.value) || 3)}
          />
          previews
        </label>
        <button
          onClick={generatePreviews}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating...' : '🎲 Generate Previews'}
        </button>
      </div>

      {previews.length > 0 && (
        <div className="preview-list">
          <h4>Generated Variations</h4>
          {previews.map((preview, i) => (
            <div key={i} className="preview-item">
              <div className="preview-header">
                <span className="preview-number">#{i + 1}</span>
                <span className="preview-seed">Seed: {preview.seed}</span>
              </div>
              <div className="preview-output">{preview.output}</div>
              <div className="preview-path">
                Path: {preview.pathTaken.join(' → ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Smart Split Suggestions
interface SmartSplitProps {
  selectedText: string;
  onSplit: (segments: string[]) => void;
  analyzer: GraphAnalyzer;
}

export const SmartSplit: React.FC<SmartSplitProps> = ({
  selectedText,
  onSplit,
  analyzer
}) => {
  const [suggestions, setSuggestions] = useState<SplitSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const getSplitSuggestions = useCallback(async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      const result = await analyzer.generateSplitSuggestions(selectedText);
      setSuggestions(result);
    } catch (error) {
      console.error('Split suggestion failed:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedText, analyzer]);

  const applySplit = useCallback(
    (segments: string[]) => {
      onSplit(segments);
      setSuggestions(null);
    },
    [onSplit]
  );

  if (!selectedText) return null;

  return (
    <div className="smart-split">
      <button
        onClick={getSplitSuggestions}
        disabled={loading}
        className="split-btn"
      >
        {loading ? 'Analyzing...' : '✂️ Smart Split'}
      </button>

      {suggestions && suggestions.strategies.length > 0 && (
        <div className="split-suggestions">
          <h4>Split Suggestions</h4>
          {suggestions.strategies.map((strategy, i) => (
            <div key={i} className="split-strategy">
              <div className="strategy-header">
                <span className="strategy-rationale">{strategy.rationale}</span>
                <span className="strategy-confidence">
                  {Math.round(strategy.confidence * 100)}%
                </span>
              </div>
              <div className="strategy-segments">
                {strategy.segments.map((segment, j) => (
                  <span key={j} className="segment">
                    {segment}
                  </span>
                ))}
              </div>
              <button
                onClick={() => applySplit(strategy.segments)}
                className="apply-split-btn"
              >
                Apply This Split
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
