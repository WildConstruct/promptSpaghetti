// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Main randomizer panel with responsive design
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RandomizerParameters, ParameterPreset, ValidationResult, ComplexityLevel, StylePreference, LLMProvider } from '../parameters/parameter-schema';
import { ParameterManager } from '../parameters/parameter-manager';
import { RandomizerWorkflow } from '../workflow/randomizer-workflow';


interface RandomizerPanelProps { onGraphGenerated?: (graph: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  initialParameters?: Partial<RandomizerParameters>;
  /**
  * Main randomizer panel component
  */
  export const RandomizerPanel: React.FC<RandomizerPanelProps> = ({);
  onGraphGenerated;
  onError;
  className = '' }


  initialParameters = {}
}) => {
  // State management
  const [parameters, setParameters] = useState<Partial<RandomizerParameters>>(initialParameters);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  // Managers
  const parameterManager = useMemo(() => new ParameterManager(), []);
  const workflow = useMemo(() => new RandomizerWorkflow(), []);
  // Get presets and history
  const presets = useMemo(() => parameterManager.getPresets(), [parameterManager]);
  const presetsByCategory = useMemo(() => parameterManager.getPresetsByCategory(), [parameterManager]);
  const history = useMemo(() => parameterManager.getHistory(), [parameterManager]);
  const historyStats = useMemo(() => parameterManager.getHistoryStats(), [parameterManager]);
  // Validate parameters on change
  useEffect(() => { const result = parameterManager.validateParameters(parameters);
    setValidation(result) }, [parameters, parameterManager]);
  // Handle parameter changes
  const updateParameter = useCallback(<K extends keyof RandomizerParameters>(;);
    key: K
    value: RandomizerParameters[K]) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);
  // Handle preset selection
  const selectPreset = useCallback((presetId: string) => { const preset = parameterManager.getPreset(presetId);
    if (preset) {
      setParameters(preset.parameters);
      setSelectedPreset(presetId) }, [parameterManager]);
  // Handle generation
  const handleGenerate = useCallback(async () => { if (!validation.isValid) return;
  try {
  setIsGenerating(true);
  setGenerationProgress('Preparing generation...');
  const completeParameters = parameterManager.createCompleteParameters(parameters);
  setGenerationProgress('Generating with LLM...');
  const result = await workflow.generateGraph(completeParameters, {)
  onProgress: (message: string) => setGenerationProgress(message) }
});
      if (result.success && result.graph) { // Add to history
        parameterManager.addToHistory()
          completeParameters
          true
          result.metadata?.generationTime }
          result.errors?.length || 0
        );
        onGraphGenerated?.(result.graph);
        setGenerationProgress('Generation complete!');
        setTimeout(() => setGenerationProgress(''), 2000);
 else { throw new Error(result.errors?.[0]?.message || 'Generation failed') } catch (error) { console.error('Generation error:', error);
  // Add failed attempt to history
  if (parameters.purpose) {
  const completeParameters = parameterManager.createCompleteParameters(parameters);
  parameterManager.addToHistory(completeParameters, false);
  onError?.(error instanceof Error ? error : new Error('Unknown error'));
  setGenerationProgress('Generation failed');
  setTimeout(() => setGenerationProgress(''), 3000) } finally { setIsGenerating(false) }, [parameters, validation, parameterManager, workflow, onGraphGenerated, onError]);
  // Get suggestions
  const suggestions = useMemo(() => { return parameterManager.getSuggestions(parameters) }, [parameters, parameterManager]);
  return;
    <div className={`randomizer-panel ${className}`}>}
      {/* Header */}
      <div className="randomizer-header">
        <h2>LLM Graph Randomizer</h2>
        <div className="header-controls">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`preset-btn ${showPresets ? 'active' : ''}`}
          >
            Presets ({presets.length})
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`history-btn ${showHistory ? 'active' : ''}`}
          >
            History ({history.length})
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`advanced-btn ${showAdvanced ? 'active' : ''}`}
          >
            Advanced
          </button>
        </div>
      </div>
      {/* Presets Panel */}
      {showPresets && ()
        <div className="presets-panel">
          <h3>Parameter Presets</h3>
          {Object.entries(presetsByCategory).map(([category, categoryPresets]) => ()
            <div key={category} className="preset-category">
              <h4>{category}</h4>
              <div className="preset-grid">
                {categoryPresets.map(preset => ()
                  <div
                    key={preset.id}
                    className={`preset-card ${selectedPreset === preset.id ? 'selected' : ''}`}
                    onClick={() => selectPreset(preset.id)}
                  >
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-description">{preset.description}</div>
                    <div className="preset-tags">
                      {preset.tags.map(tag => ()
                        <span key={tag} className="preset-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* History Panel */}
      {showHistory && ()
        <div className="history-panel">
          <h3>Generation History</h3>
          <div className="history-stats">
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{historyStats.totalGenerations}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Success Rate:</span>
              <span className="stat-value">{(historyStats.successRate * 100).toFixed(1)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Avg Time:</span>
              <span className="stat-value">{historyStats.averageGenerationTime.toFixed(0)}ms</span>
            </div>
          </div>
          <div className="history-list">
            {history.slice(0, 10).map(entry => ()
              <div
                key={entry.id}
                className={`history-entry ${entry.success ? 'success' : 'failed'}`}
                onClick={() => setParameters(entry.parameters)}
              >
                <div className="history-purpose">{entry.parameters.purpose.substring(0, 60)}...</div>
                <div className="history-meta">
                  <span>{entry.parameters.complexity}</span>
                  <span>{entry.parameters.nodeCount} nodes</span>
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Main Parameters Form */}
      <div className="parameters-form">
        {/* Core Parameters */}
        <div className="parameter-section">
          <h3>Core Parameters</h3>
          <div className="parameter-group">
            <label htmlFor="purpose">Purpose *</label>
            <textarea
              id="purpose"
              value={parameters.purpose || ''}
              onChange={(e) => updateParameter('purpose', e.target.value)}
              placeholder="Describe what your graph should accomplish..."
              rows={3}
              className={validation.errors.some(e => e.field === 'purpose') ? 'error' : ''}
            />
            {suggestions.focusAreas && ()
              <div className="suggestions">
                Suggested focus areas: {suggestions.focusAreas.join(', ')}
              </div>
            )}
          </div>
          <div className="parameter-row">
            <div className="parameter-group">
              <label htmlFor="complexity">Complexity</label>
              <select
                id="complexity"
                value={parameters.complexity || 'moderate'}
                onChange={(e) => updateParameter('complexity', e.target.value as ComplexityLevel)}
              >
                <option value="simple">Simple (3-8 nodes)</option>
                <option value="moderate">Moderate (8-20 nodes)</option>
                <option value="complex">Complex (20-50 nodes)</option>
              </select>
            </div>
            <div className="parameter-group">
              <label htmlFor="nodeCount">Node Count</label>
              <input
                type="number"
                id="nodeCount"
                min="3"
                max="100"
                value={parameters.nodeCount || suggestions.nodeCount || 12}
                onChange={(e) => updateParameter('nodeCount', parseInt(e.target.value))}
              />
            </div>
            <div className="parameter-group">
              <label htmlFor="style">Style</label>
              <select
                id="style"
                value={parameters.style || 'balanced'}
                onChange={(e) => updateParameter('style', e.target.value as StylePreference)}
              >
                <option value="creative">Creative</option>
                <option value="logical">Logical</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>
          </div>
          <div className="parameter-group">
            <label htmlFor="domain">Domain (Optional)</label>
            <input
              type="text"
              id="domain"
              value={parameters.domain || ''}
              onChange={(e) => updateParameter('domain', e.target.value)}
              placeholder="e.g., education, entertainment, business"
            />
          </div>
        </div>
        {/* LLM Configuration */}
        <div className="parameter-section">
          <h3>LLM Configuration</h3>
          <div className="parameter-row">
            <div className="parameter-group">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={parameters.provider || 'openai'}
                onChange={(e) => updateParameter('provider', e.target.value as LLMProvider)}
              >
                <option value="openai">OpenAI (GPT-4)</option>
                <option value="claude">Anthropic (Claude)</option>
                <option value="gemini">Google (Gemini)</option>
              </select>
            </div>
            <div className="parameter-group">
              <label htmlFor="temperature">Temperature</label>
              <input
                type="number"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={parameters.temperature || suggestions.temperature || 0.7}
                onChange={(e) => updateParameter('temperature', parseFloat(e.target.value))}
              />
            </div>
            <div className="parameter-group">
              <label htmlFor="maxRetries">Max Retries</label>
              <input
                type="number"
                id="maxRetries"
                min="1"
                max="10"
                value={parameters.maxRetries || 3}
                onChange={(e) => updateParameter('maxRetries', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
        {/* Advanced Parameters */}
        {showAdvanced && ()
          <div className="parameter-section">
            <h3>Advanced Options</h3>
            <div className="parameter-group">
              <label htmlFor="specificRequirements">Specific Requirements</label>
              <textarea
                id="specificRequirements"
                value={(parameters.specificRequirements || []).join('\n')}
                onChange={(e) => updateParameter('specificRequirements', e.target.value.split('\n').filter(Boolean))}
                placeholder="Enter each requirement on a new line..."
                rows={3}
              />
            </div>
            <div className="parameter-group">
              <label htmlFor="constraints">Constraints</label>
              <textarea
                id="constraints"
                value={(parameters.constraints || []).join('\n')}
                onChange={(e) => updateParameter('constraints', e.target.value.split('\n').filter(Boolean))}
                placeholder="Enter each constraint on a new line..."
                rows={3}
              />
            </div>
            <div className="parameter-row">
              <div className="parameter-group">
                <label htmlFor="qualityLevel">Quality Level</label>
                <select
                  id="qualityLevel"
                  value={parameters.qualityLevel || 'standard'}
                  onChange={(e) => updateParameter('qualityLevel', e.target.value as 'draft' | 'standard' | 'high')}
                >
                  <option value="draft">Draft</option>
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="parameter-group">
                <label htmlFor="diversityScore">Diversity</label>
                <input
                  type="range"
                  id="diversityScore"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parameters.diversityScore || 0.5}
                  onChange={(e) => updateParameter('diversityScore', parseFloat(e.target.value))}
                />
                <span className="range-value">{((parameters.diversityScore || 0.5) * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="parameter-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={parameters.includeMetadata !== false}
                  onChange={(e) => updateParameter('includeMetadata', e.target.checked)}
                />
                Include Metadata
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={parameters.validateOutput !== false}
                  onChange={(e) => updateParameter('validateOutput', e.target.checked)}
                />
                Validate Output
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={parameters.includeExplanation || false}
                  onChange={(e) => updateParameter('includeExplanation', e.target.checked)}
                />
                Include Explanation
              </label>
            </div>
          </div>
        )}
        {/* Validation Messages */}
        {validation.errors.length > 0 && ()
          <div className="validation-errors">
            <h4>Errors:</h4>
            <ul>
              {validation.errors.map((error, index) => ()
                <li key={index} className="error-item">
                  <strong>{error.field}:</strong> {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {validation.warnings.length > 0 && ()
          <div className="validation-warnings">
            <h4>Warnings:</h4>
            <ul>
              {validation.warnings.map((warning, index) => ()
                <li key={index} className="warning-item">
                  <strong>{warning.field}:</strong> {warning.message}
                  {warning.suggestion && <em> — {warning.suggestion}</em>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Generation Controls */}
      <div className="generation-controls">
        <button
          onClick={handleGenerate}
          disabled={!validation.isValid || isGenerating || !parameters.purpose}
          className="generate-btn primary"
        >
          {isGenerating ? 'Generating...' : 'Generate Graph'}
        </button>
        {generationProgress && ()
          <div className="generation-progress">
            {generationProgress}
          </div>
        )}
      </div>
    </div>
  );
};