// Intelligent Features UI Components for Node Inspector
// Story 2.2a Implementation

import React, { useState, useCallback } from 'react';
import {
  NodeIntelligenceService,
  Choice,
  WeightOptimizationResult,
  InspirationSuggestion
} from '../../services/llm';
import './IntelligentFeatures.css';

function inferChoiceStyleGuidance(currentChoices: Choice[]): string | null {
  const filledChoices = currentChoices
    .map(choice => choice.text?.trim())
    .filter((text): text is string => Boolean(text));

  if (filledChoices.length === 0) {
    return null;
  }

  const hasCommaFreeStyle = filledChoices.every(text => !text.includes(','));
  const averageWordCount =
    filledChoices.reduce((sum, text) => sum + text.split(/\s+/).filter(Boolean).length, 0) /
    filledChoices.length;
  const looksLikeShortLabels = averageWordCount <= 5;

  const guidance: string[] = ['Match the tone and formatting of the existing options.'];

  if (hasCommaFreeStyle) {
    guidance.push('Avoid commas and multi-clause descriptions.');
  }

  if (looksLikeShortLabels) {
    guidance.push('Prefer concise label-like options rather than long descriptive phrases.');
  }

  return guidance.join(' ');
}

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
  const [showPromptTuning, setShowPromptTuning] = useState(false);
  const [promptHint, setPromptHint] = useState('');

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
      const styleGuidance = inferChoiceStyleGuidance(currentChoices);
      const userGuidance =
        promptHint.trim().length > 0
          ? `Additional guidance: ${promptHint.trim()}.`
          : '';

      // Combine nodeText with existing filled options for better context
      const enrichedContext = existingText
        ? `${context}. Existing options: ${existingText}. Generate ${numToGenerate} additional complementary options. ${styleGuidance ?? ''} ${userGuidance}`.trim()
        : `${context}. Generate ${numToGenerate} options based on: ${nodeText}. ${styleGuidance ?? ''} ${userGuidance}`.trim();

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
      } catch (err) {
        setError((err as Error).message || 'Failed to generate choices');
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
      <div className="populate-choices-controls">
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
              <svg
                className="icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 0l1.9 5.8H16l-4.9 3.6 1.9 5.8L8 11.6l-4.9 3.6 1.9-5.8L0 5.8h6.1L8 0z" />
              </svg>
              Populate Choices
            </>
          )}
        </button>
        <button
          className={`populate-tune-btn ${showPromptTuning ? 'active' : ''}`}
          type="button"
          onClick={() => setShowPromptTuning(current => !current)}
          disabled={loading}
          title="Adjust populate guidance"
        >
          Tune
        </button>
      </div>
      {showPromptTuning && (
        <div className="populate-prompt-tuning">
          <label htmlFor="populate-prompt-hint">Populate guidance</label>
          <input
            id="populate-prompt-hint"
            className="populate-prompt-input"
            type="text"
            value={promptHint}
            onChange={event => setPromptHint(event.target.value)}
            placeholder="Keep them short and comma-free"
          />
          <div className="populate-prompt-help">
            Existing option style is matched automatically. Use this to add a small steer.
          </div>
        </div>
      )}
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
              <svg
                className="icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M2 3h12v2H2V3zm4 3h4v1h1V6h2l-3 4v4h2v1H4v-1h2v-4L3 6h2v1h1V6z" />
              </svg>
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
              <svg
                className="icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 1.5A3.5 3.5 0 1 1 4.5 5c0-.78.32-1.48.84-1.99L6 4.67V7h1V3H5v1h.66A2.5 2.5 0 1 0 10.5 5h1A3.5 3.5 0 0 1 8 1.5zM7 10h2v1H7v-1zm0 2h2v1H7v-1z" />
                <path d="M5 8.5A.5.5 0 0 1 5.5 8h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 9.5v-1z" />
              </svg>
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
