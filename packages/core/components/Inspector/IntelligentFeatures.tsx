// Intelligent Features UI Components for Node Inspector
// Story 2.2a Implementation

import React, { useState, useCallback } from 'react';
import {
  NodeIntelligenceService,
  Choice,
  WeightOptimizationResult,
  InspirationSuggestion
} from '../../services/llm/NodeIntelligence';
import './IntelligentFeatures.css';

interface PopulateChoicesButtonProps {
  nodeText: string;
  context: string;
  currentChoices: Choice[];
  onChoicesGenerated: (choices: Choice[]) => void;
  intelligenceService: NodeIntelligenceService;
  requestedCount?: number; // Optional: specific count to generate
}

export const PopulateChoicesButton: React.FC<PopulateChoicesButtonProps> = ({
  nodeText,
  context,
  currentChoices,
  onChoicesGenerated,
  intelligenceService,
  requestedCount
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCountPrompt, setShowCountPrompt] = useState(false);
  const [choiceCount, setChoiceCount] = useState(3);

  const handlePopulate = useCallback(
    async (count?: number) => {
      setLoading(true);
      setError(null);

      // Determine how many choices to generate
      let numToGenerate = count || requestedCount || 5;

      // Count blank options to determine how many we need
      const blankCount = currentChoices.filter(
        c => !c.text || c.text.trim() === ''
      ).length;
      const filledCount = currentChoices.filter(
        c => c.text && c.text.trim() !== ''
      ).length;

      // If we have blank options, generate that many
      if (blankCount > 0) {
        numToGenerate = blankCount;
      } else if (
        currentChoices.length > 0 &&
        currentChoices.length < 3 &&
        blankCount === 0 &&
        !count &&
        !requestedCount
      ) {
        // If we have 1-2 filled options and no count specified, ask how many more
        setShowCountPrompt(true);
        setLoading(false);
        return;
      } else if (
        currentChoices.length > 0 &&
        currentChoices.length < 3 &&
        blankCount === 0
      ) {
        // If we have 1-2 filled options, generate based on count or default
        numToGenerate = count || requestedCount || 3 - currentChoices.length;
      } else if (currentChoices.length === 0 && !count && !requestedCount) {
        // If no options exist and no count specified, show prompt
        setShowCountPrompt(true);
        setLoading(false);
        return;
      }

      // Build context from existing filled options
      const existingText = currentChoices
        .filter(c => c.text && c.text.trim() !== '')
        .map(c => c.text)
        .join(', ');

      // Combine nodeText with existing filled options for better context
      const enrichedContext = existingText
        ? `${context}. Existing options: ${existingText}. Generate ${numToGenerate} additional complementary options.`
        : `${context}. Generate ${numToGenerate} options based on: ${nodeText}`;

      try {
        const choices = await intelligenceService.populateChoices(
          nodeText,
          enrichedContext,
          numToGenerate
        );

        if (choices && choices.length > 0) {
          onChoicesGenerated(choices);
          setShowCountPrompt(false);
        } else {
          setError('No suggestions available');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate choices');
      } finally {
        setLoading(false);
      }
    },
    [
      nodeText,
      context,
      currentChoices,
      requestedCount,
      intelligenceService,
      onChoicesGenerated
    ]
  );

  const handleCountSubmit = useCallback(() => {
    setShowCountPrompt(false);
    handlePopulate(choiceCount);
  }, [choiceCount, handlePopulate]);

  // Show count prompt if needed
  if (showCountPrompt) {
    return (
      <div className="intelligent-feature count-prompt">
        <div className="count-prompt-content">
          <label>How many options would you like?</label>
          <div className="count-input-group">
            <input
              type="number"
              min="2"
              max="10"
              value={choiceCount}
              onChange={e => setChoiceCount(parseInt(e.target.value) || 3)}
              className="count-input"
            />
            <button className="count-submit-btn" onClick={handleCountSubmit}>
              Generate
            </button>
            <button
              className="count-cancel-btn"
              onClick={() => setShowCountPrompt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't hide the button - always show it when relevant
  return (
    <div className="intelligent-feature">
      <button
        className="populate-choices-btn"
        onClick={() => handlePopulate()}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Generating...
          </>
        ) : (
          <>
            <span className="icon">✨</span>
            Populate Choices
          </>
        )}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

interface OptimizeWeightsButtonProps {
  choices: Choice[];
  context: string;
  onWeightsOptimized: (result: WeightOptimizationResult) => void;
  intelligenceService: NodeIntelligenceService;
}

export const OptimizeWeightsButton: React.FC<OptimizeWeightsButtonProps> = ({
  choices,
  context,
  onWeightsOptimized,
  intelligenceService
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<WeightOptimizationResult | null>(null);

  const handleOptimize = useCallback(async () => {
    setLoading(true);
    setPreview(null);

    try {
      const result = await intelligenceService.optimizeWeights(
        choices,
        context
      );
      setPreview(result);
    } catch (err) {
      console.error('Failed to optimize weights:', err);
    } finally {
      setLoading(false);
    }
  }, [choices, context, intelligenceService]);

  const handleApply = useCallback(() => {
    if (preview) {
      onWeightsOptimized(preview);
      setPreview(null);
    }
  }, [preview, onWeightsOptimized]);

  const handleCancel = useCallback(() => {
    setPreview(null);
  }, []);

  // Don't show if no choices
  if (choices.length === 0) {
    return null;
  }

  return (
    <div className="intelligent-feature">
      {!preview ? (
        <button
          className="optimize-weights-btn"
          onClick={handleOptimize}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <span className="icon">⚖️</span>
              Optimize Weights
            </>
          )}
        </button>
      ) : (
        <div className="optimization-preview">
          <div className="preview-header">
            <h4>Weight Optimization</h4>
            <span className={`confidence confidence-${preview.confidence}`}>
              {preview.confidence} confidence
            </span>
          </div>
          <div className="weight-comparison">
            {preview.optimized.map((choice, index) => {
              const original = preview.original[index];
              const changed = original.weight !== choice.weight;
              return (
                <div key={index} className="weight-item">
                  <span className="choice-text">{choice.text}</span>
                  <div className="weight-values">
                    <span className="original">{original.weight}</span>
                    {changed && (
                      <>
                        <span className="arrow">→</span>
                        <span className="optimized">{choice.weight}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="preview-actions">
            <button className="apply-btn" onClick={handleApply}>
              Apply Changes
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface InspirationModeProps {
  upstreamContext: string;
  onInspirationSelected: (choices: Choice[]) => void;
  intelligenceService: NodeIntelligenceService;
}

export const InspirationMode: React.FC<InspirationModeProps> = ({
  upstreamContext,
  onInspirationSelected,
  intelligenceService
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<InspirationSuggestion[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleGetInspiration = useCallback(async () => {
    setLoading(true);
    setExpanded(true);

    try {
      const inspirations =
        await intelligenceService.getInspiration(upstreamContext);
      setSuggestions(inspirations);
    } catch (err) {
      console.error('Failed to get inspiration:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [upstreamContext, intelligenceService]);

  const handleSelectTheme = useCallback(
    (suggestion: InspirationSuggestion) => {
      onInspirationSelected(suggestion.choices);
      setExpanded(false);
      setSuggestions([]);
    },
    [onInspirationSelected]
  );

  if (!expanded) {
    return (
      <div className="inspiration-prompt">
        <button
          className="inspiration-btn"
          onClick={handleGetInspiration}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Getting ideas...
            </>
          ) : (
            <>
              <span className="icon">💡</span>
              Need inspiration?
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="inspiration-mode">
      <h4>Choose a theme:</h4>
      {loading ? (
        <div className="loading-state">
          <span className="spinner large" />
          <p>Generating creative suggestions...</p>
        </div>
      ) : (
        <div className="inspiration-themes">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="theme-card"
              onClick={() => handleSelectTheme(suggestion)}
            >
              <h5>{suggestion.theme}</h5>
              <div className="theme-preview">
                {suggestion.choices.slice(0, 3).map((choice, i) => (
                  <span key={i} className="preview-choice">
                    {choice.text}
                  </span>
                ))}
              </div>
              <div className="theme-action">
                <button className="select-theme-btn">Use This Theme</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="close-inspiration-btn"
        onClick={() => setExpanded(false)}
      >
        Cancel
      </button>
    </div>
  );
};

interface IntelligentAssistanceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isOffline?: boolean;
}

export const IntelligentAssistanceToggle: React.FC<
  IntelligentAssistanceToggleProps
> = ({ enabled, onToggle, isOffline = false }) => {
  return (
    <div className="intelligent-assistance-toggle">
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
      <span className="toggle-label">
        Intelligent Assistance
        {isOffline && (
          <span className="offline-badge" title="Using offline suggestions">
            Offline
          </span>
        )}
      </span>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message
}) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner-circle" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level
}) => {
  const icons = {
    high: '🟢',
    medium: '🟡',
    low: '🔴'
  };

  const labels = {
    high: 'High confidence',
    medium: 'Medium confidence',
    low: 'Low confidence'
  };

  return (
    <span className={`confidence-indicator ${level}`} title={labels[level]}>
      {icons[level]}
    </span>
  );
};
