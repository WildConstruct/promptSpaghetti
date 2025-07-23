// Epic 16 Marketplace - Preview Modal Component
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import './PreviewModal.css';

interface PreviewModalProps {
  templateId: string;
  template: Error;
  onClose: () => void;
  className?: string;
}

interface PreviewMetadata {
  template_id: string;
  version_id: string;
  claude_model: string;
  estimated_tokens: number;
  estimated_cost: number;
  safety_score: number;
  can_preview: boolean;
  preview_limitations: string[];
}

interface PreviewResponse {
  output: string;
  cost_estimate: number;
  quality_score: number;
  token_usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cached: boolean;
  redacted_sections: string[];
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  templateId,
  template,
  onClose,
  className = ''
}) => {
  const [metadata, setMetadata] = useState<PreviewMetadata | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [userInput, setUserInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadPreviewMetadata();
  }, [templateId]);

  const loadPreviewMetadata = async () => {
    try {
      const response = await fetch(`/api/marketplace/templates/${templateId}/preview-metadata`);
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
        setSelectedModel(data.claude_model);
      } else {
        setError('Failed to load preview information');
      }
    } catch (err) {
      setError('Failed to load preview information');
    }
  };

  const generatePreview = async () => {
    if (!metadata) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/marketplace/templates/${templateId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          version_id: metadata.version_id,
          user_input: Object.keys(userInput).length > 0 ? userInput : undefined,
          claude_model_override: selectedModel !== metadata.claude_model ? selectedModel : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setUserInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(cost);
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'warning';
    return 'default';
  };

  return (
    <div className={`preview-modal-overlay ${className}`} onClick={onClose} onKeyDown={handleKeyPress}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Preview Template</h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <div className="modal-content">
          {/* Template Info */}
          <div className="template-info">
            <h3>{template.title}</h3>
            <div className="template-badges">
              {template.featured_at && <Badge variant="featured">Featured</Badge>}
              {template.price_cents === 0 && <Badge variant="free">Free</Badge>}
              {template.is_ai_generated && <Badge variant="ai">AI Generated</Badge>}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {error}
            </div>
          )}

          {metadata && (
            <div className="preview-sections">
              {/* Input Section */}
              <section className="input-section">
                <h4>Input Parameters</h4>
                <div className="input-form">
                  <div className="input-group">
                    <label htmlFor="topic">Topic or Subject:</label>
                    <input
                      id="topic"
                      type="text"
                      value={userInput.topic || ''}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      placeholder="e.g., AI in healthcare, space exploration..."
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="style">Style or Tone:</label>
                    <input
                      id="style"
                      type="text"
                      value={userInput.style || ''}
                      onChange={(e) => handleInputChange('style', e.target.value)}
                      placeholder="e.g., professional, casual, technical..."
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="length">Length:</label>
                    <select
                      id="length"
                      value={userInput.length || ''}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                    >
                      <option value="">Select length...</option>
                      <option value="brief">Brief (1-2 paragraphs)</option>
                      <option value="medium">Medium (3-5 paragraphs)</option>
                      <option value="detailed">Detailed (6+ paragraphs)</option>
                    </select>
                  </div>

                  {/* Advanced Options */}
                  <div className="advanced-toggle">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="toggle-button"
                    >
                      Advanced Options
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`chevron ${showAdvanced ? 'expanded' : ''}`}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="advanced-options">
                      <div className="input-group">
                        <label htmlFor="model">Claude Model:</label>
                        <select
                          id="model"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          {template.claude_compat?.map((model: string) => (
                            <option key={model} value={model}>
                              {model.replace('claude-', 'Claude ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={generatePreview}
                  disabled={loading || !metadata.can_preview}
                  className="generate-button"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      Generating...
                    </>
                  ) : (
                    'Generate Preview'
                  )}
                </button>
              </section>

              {/* Output Section */}
              <section className="output-section">
                <h4>Preview Output</h4>
                
                {preview ? (
                  <div className="preview-result">
                    <div className="output-header">
                      <div className="output-meta">
                        <div className="meta-item">
                          <span className="meta-label">Quality:</span>
                          <Badge variant={getQualityBadgeVariant(preview.quality_score)}>
                            {preview.quality_score.toFixed(1)}/5
                          </Badge>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Cost:</span>
                          <span className="meta-value">{formatCost(preview.cost_estimate)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Tokens:</span>
                          <span className="meta-value">
                            {preview.token_usage.input_tokens + preview.token_usage.output_tokens}
                          </span>
                        </div>
                        {preview.cached && (
                          <Badge variant="default">Cached</Badge>
                        )}
                      </div>
                    </div>

                    <div className="output-content">
                      <pre>{preview.output}</pre>
                    </div>

                    {preview.redacted_sections.length > 0 && (
                      <div className="redaction-notice">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 1L10.5 6L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 6L8 1Z"
                            fill="currentColor"
                          />
                        </svg>
                        This preview has limited content. Purchase the template for full access.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-preview">
                    <p>Click "Generate Preview" to see how this template works.</p>
                  </div>
                )}
              </section>

              {/* Template Details */}
              <section className="details-section">
                <h4>Template Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Claude Model:</span>
                    <span className="detail-value">{metadata.claude_model.replace('claude-', 'Claude ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Tokens:</span>
                    <span className="detail-value">{metadata.estimated_tokens.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Cost:</span>
                    <span className="detail-value">{formatCost(metadata.estimated_cost)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Safety Score:</span>
                    <span className="detail-value">{metadata.safety_score.toFixed(2)}/1.00</span>
                  </div>
                </div>

                {metadata.preview_limitations.length > 0 && (
                  <div className="limitations">
                    <h5>Preview Limitations:</h5>
                    <ul>
                      {metadata.preview_limitations.map((limitation, index) => (
                        <li key={index}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
          )}

          {!metadata && !error && (
            <div className="loading-state">
              <LoadingSpinner size="large" message="Loading preview information..." />
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Close
          </button>
          <button 
            onClick={() => {
              // TODO: Integrate with purchase flow
              console.log('Purchase template:', templateId);
            }}
            className="purchase-button"
          >
            {template.price_cents === 0 ? 'Get Free Template' : `Purchase for ${(template.price_cents / 100).toFixed(2)}`}
          </button>
        </footer>
      </div>
    </div>
  );
};