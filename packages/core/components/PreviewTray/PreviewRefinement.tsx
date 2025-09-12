import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  TextRefinementService,
  RefinementMode
} from '../../services/llm/TextRefinementService';
import './PreviewRefinement.css';

export interface RefinementStyle {
  id: string;
  label: string;
  description: string;
  mode: RefinementMode;
  prompt?: string;
}

export const REFINEMENT_STYLES: RefinementStyle[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Clear, concise, business-appropriate',
    mode: 'correct',
    prompt: 'professional and business-appropriate'
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Imaginative, engaging, vivid',
    mode: 'expand',
    prompt: 'creative and engaging'
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Friendly, conversational, relaxed',
    mode: 'correct',
    prompt: 'casual and conversational'
  },
  {
    id: 'concise',
    label: 'Concise',
    description: 'Brief, to the point, minimal',
    mode: 'contract',
    prompt: 'brief and concise'
  },
  {
    id: 'elaborate',
    label: 'Elaborate',
    description: 'Detailed, comprehensive, thorough',
    mode: 'expand',
    prompt: 'detailed and comprehensive'
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Precise, accurate, specialized',
    mode: 'correct',
    prompt: 'technical and precise'
  }
];

interface PreviewRefinementProps {
  originalText: string;
  refinementService: TextRefinementService | null;
  onRefined?: (refinedText: string) => void;
  isActive: boolean;
  selectedStyle?: string;
  onStyleChange?: (styleId: string) => void;
}

interface RefinedResult {
  original: string;
  refined: string;
  styleId: string;
  timestamp: number;
}

export const PreviewRefinement: React.FC<PreviewRefinementProps> = ({
  originalText,
  refinementService,
  onRefined,
  isActive,
  selectedStyle = 'professional',
  onStyleChange
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refinedText, setRefinedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Cache refined results
  const refinedCache = useRef<Map<string, RefinedResult>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  // Get current style
  const currentStyle =
    REFINEMENT_STYLES.find(s => s.id === selectedStyle) || REFINEMENT_STYLES[0];

  // Generate cache key
  const getCacheKey = (text: string, styleId: string) => {
    return `${styleId}:${text.substring(0, 100)}`;
  };

  // Refine text with selected style
  const refineText = useCallback(async () => {
    if (!refinementService || !originalText || !isActive) {
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(originalText, selectedStyle);
    const cached = refinedCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      // 5 min cache
      setRefinedText(cached.refined);
      onRefined?.(cached.refined);
      return;
    }

    // Cancel any pending refinement
    if (abortController.current) {
      abortController.current.abort();
    }

    setIsRefining(true);
    setError(null);
    abortController.current = new AbortController();

    try {
      const style = REFINEMENT_STYLES.find(s => s.id === selectedStyle);
      if (!style) {
        throw new Error('Invalid refinement style');
      }

      const result = await refinementService.refine(
        originalText,
        style.mode,
        style.prompt
      );

      if (result && !abortController.current.signal.aborted) {
        setRefinedText(result.refined);
        onRefined?.(result.refined);

        // Cache the result
        refinedCache.current.set(cacheKey, {
          original: originalText,
          refined: result.refined,
          styleId: selectedStyle,
          timestamp: Date.now()
        });
      }
    } catch (err: unknown) {
      if (err.name !== 'AbortError') {
        console.error('Refinement error:', err);
        setError(err.message || 'Failed to refine text');
        // Fall back to original
        setRefinedText(originalText);
      }
    } finally {
      setIsRefining(false);
      abortController.current = null;
    }
  }, [originalText, refinementService, isActive, selectedStyle, onRefined]);

  // Refine when text or style changes
  useEffect(() => {
    if (isActive && originalText) {
      refineText();
    } else if (!isActive) {
      setRefinedText(null);
      setError(null);
    }
  }, [isActive, originalText, selectedStyle, refineText]);

  // Handle style selection
  const handleStyleSelect = useCallback(
    (styleId: string) => {
      onStyleChange?.(styleId);
      setShowStyleMenu(false);
    },
    [onStyleChange]
  );

  // Copy refined text
  const handleCopyRefined = useCallback(() => {
    if (refinedText) {
      navigator.clipboard.writeText(refinedText);
    }
  }, [refinedText]);

  // Toggle comparison view
  const handleToggleComparison = useCallback(() => {
    setShowComparison(!showComparison);
  }, [showComparison]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="preview-refinement">
      <div className="refinement-header">
        <div className="refinement-status">
          {isRefining ? (
            <>
              <span className="refinement-spinner" />
              <span>Refining with AI...</span>
            </>
          ) : refinedText ? (
            <>
              <span className="refinement-check">✓</span>
              <span>Refined</span>
            </>
          ) : (
            <>
              <span className="refinement-dot" />
              <span>Ready</span>
            </>
          )}
        </div>

        <div className="refinement-controls">
          {/* Style selector */}
          <div className="style-selector-wrapper">
            <button
              className="style-selector-button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              disabled={isRefining}
            >
              <span className="style-icon">✨</span>
              <span className="style-label">{currentStyle.label}</span>
              <span className="style-chevron">▼</span>
            </button>

            {showStyleMenu && (
              <div className="style-menu">
                {REFINEMENT_STYLES.map(style => (
                  <button
                    key={style.id}
                    className={`style-option ${style.id === selectedStyle ? 'selected' : ''}`}
                    onClick={() => handleStyleSelect(style.id)}
                  >
                    <div className="style-option-header">
                      <span className="style-option-label">{style.label}</span>
                      {style.id === selectedStyle && (
                        <span className="style-option-check">✓</span>
                      )}
                    </div>
                    <span className="style-option-description">
                      {style.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {refinedText && (
            <>
              <button
                className="refinement-action-btn"
                onClick={handleToggleComparison}
                title={showComparison ? 'Hide comparison' : 'Show comparison'}
              >
                <span className="action-icon">⟷</span>
              </button>
              <button
                className="refinement-action-btn"
                onClick={handleCopyRefined}
                title="Copy refined text"
              >
                <span className="action-icon">📋</span>
              </button>
              <button
                className="refinement-action-btn"
                onClick={refineText}
                disabled={isRefining}
                title="Re-refine"
              >
                <span className="action-icon">🔄</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="refinement-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {showComparison && refinedText && (
        <div className="refinement-comparison">
          <div className="comparison-pane">
            <h4>Original</h4>
            <div className="comparison-text original">{originalText}</div>
          </div>
          <div className="comparison-divider" />
          <div className="comparison-pane">
            <h4>Refined ({currentStyle.label})</h4>
            <div className="comparison-text refined">{refinedText}</div>
          </div>
        </div>
      )}
    </div>
  );
};
