/**
 * Epic 16 - Case Study Modal Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 * 
 * Modal component for displaying full case study details with rich media,
 * metrics, and template integration.
 */
import React, { useState, useEffect } from 'react';
import { CaseStudy, CaseStudyMedia } from '../../models/CaseStudyDataModel';

export interface CaseStudyModalProps {
  caseStudy: CaseStudy;
  isOpen: boolean;
  onClose: () => void;
  onTemplateClick?: (templateId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onShare?: (caseStudy: CaseStudy) => void;
  className?: string;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({)
  caseStudy,
  isOpen,
  onClose,
  onTemplateClick,
  onAuthorClick,
  onShare,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'implementation' | 'results' | 'media'>('overview');
  const [selectedMedia, setSelectedMedia] = useState<CaseStudyMedia | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  // Get ROI display value
  const getROIDisplay = () => {
    if (!caseStudy.roiMetrics.costSavings.amount) return null;
    const amount = caseStudy.roiMetrics.costSavings.amount;
    const currency = caseStudy.roiMetrics.costSavings.currency;
    if (amount >= 1000000) {
      return `${currency}${(amount / 1000000).toFixed(1)}M`;}
    } else if (amount >= 1000) {
      return `${currency}${(amount / 1000).toFixed(1)}K`;}
    } else {
      return `${currency}${amount.toFixed(0)}`;}
    }
  };
  if (!isOpen) return null;
  const roiDisplay = getROIDisplay();
  return ();
    <div className={`case-study-modal-overlay ${className}`} onClick={handleBackdropClick}>}
      <div className="case-study-modal">
        {/* Header */}
        <header className="modal-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="case-study-title">{caseStudy.title}</h1>
              {caseStudy.subtitle && ()
                <p className="case-study-subtitle">{caseStudy.subtitle}</p>
              )}
            </div>
            <div className="header-actions">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`action-btn bookmark ${isBookmarked ? 'active' : ''}`}
                title="Bookmark case study"
              >
                {isBookmarked ? '💙' : '🤍'}
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`action-btn like ${isLiked ? 'active' : ''}`}
                title="Like case study"
              >
                {isLiked ? '❤️' : '🤍'}
              </button>
              <button
                onClick={() => onShare?.(caseStudy)}
                className="action-btn share"
                title="Share case study"
              >
                📤
              </button>
              <button
                onClick={onClose}
                className="close-btn"
                title="Close modal"
              >
                ×
              </button>
            </div>
          </div>
          {/* Navigation */}
          <nav className="modal-nav">
            <button
              onClick={() => setActiveSection('overview')}
              className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('implementation')}
              className={`nav-btn ${activeSection === 'implementation' ? 'active' : ''}`}
            >
              Implementation
            </button>
            <button
              onClick={() => setActiveSection('results')}
              className={`nav-btn ${activeSection === 'results' ? 'active' : ''}`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveSection('media')}
              className={`nav-btn ${activeSection === 'media' ? 'active' : ''}`}
            >
              Media ({Object.values(caseStudy.media).flat().length})
            </button>
          </nav>
        </header>
        {/* Content */}
        <div className="modal-content">
          {activeSection === 'overview' && ()
            <div className="overview-section">
              <div className="main-content">
                {/* Featured Image */}
                {caseStudy.featuredImage && ()
                  <div className="featured-image">
                    <img
                      src={caseStudy.featuredImage.url}
                      alt={caseStudy.featuredImage.altText || caseStudy.title}
                    />
                  </div>
                )}
                {/* Description */}
                <section className="description">
                  <h2>Challenge</h2>
                  <p>{caseStudy.content.challenge}</p>
                </section>
                <section className="solution">
                  <h2>Solution</h2>
                  <p>{caseStudy.content.solution}</p>
                </section>
                {/* Key Metrics */}
                <section className="key-metrics">
                  <h2>Key Results</h2>
                  <div className="metrics-grid">
                    {roiDisplay && ()
                      <div className="metric-card">
                        <div className="metric-icon">💰</div>
                        <div className="metric-value">{roiDisplay}</div>
                        <div className="metric-label">Cost Savings</div>
                      </div>
                    )}
                    {caseStudy.roiMetrics.timeSaved.hours > 0 && ()
                      <div className="metric-card">
                        <div className="metric-icon">⏰</div>
                        <div className="metric-value">{caseStudy.roiMetrics.timeSaved.hours}h</div>
                        <div className="metric-label">Time Saved</div>
                      </div>
                    )}
                    {caseStudy.performanceMetrics.efficiency > 0 && ()
                      <div className="metric-card">
                        <div className="metric-icon">⚡</div>
                        <div className="metric-value">+{caseStudy.performanceMetrics.efficiency}%</div>
                        <div className="metric-label">Efficiency</div>
                      </div>
                    )}
                    {caseStudy.performanceMetrics.outputQuality > 0 && ()
                      <div className="metric-card">
                        <div className="metric-icon">⭐</div>
                        <div className="metric-value">{caseStudy.performanceMetrics.outputQuality}/10</div>
                        <div className="metric-label">Quality Rating</div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
              <aside className="sidebar-content">
                {/* Author Info */}
                <section className="author-section">
                  <h3>Created by</h3>
                  <div 
                    className="author-card"
                    onClick={() => onAuthorClick?.(caseStudy.author.userId)}
                  >
                    {caseStudy.author.avatar ? ()
                      <img
                        src={caseStudy.author.avatar}
                        alt={caseStudy.author.name}
                        className="author-avatar"
                      />
                    ) : ()
                      <div className="author-avatar-placeholder">
                        {caseStudy.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="author-info">
                      <div className="author-name">
                        {caseStudy.author.name}
                        {caseStudy.author.verified && ()
                          <span className="verified-badge">✓</span>
                        )}
                      </div>
                      {caseStudy.author.title && ()
                        <div className="author-title">{caseStudy.author.title}</div>
                      )}
                      {caseStudy.author.company && ()
                        <div className="author-company">{caseStudy.author.company}</div>
                      )}
                    </div>
                  </div>
                </section>
                {/* Tags */}
                {caseStudy.tags.length > 0 && ()
                  <section className="tags-section">
                    <h3>Tags</h3>
                    <div className="tags">
                      {caseStudy.tags.map((tag, index) => ()
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </section>
                )}
                {/* Industry */}
                <section className="industry-section">
                  <h3>Industry</h3>
                  <div className="industry-badge">
                    {caseStudy.industry.replace('-', ' ')}
                  </div>
                </section>
                {/* Difficulty */}
                <section className="difficulty-section">
                  <h3>Difficulty Level</h3>
                  <div className={`difficulty-badge difficulty-${caseStudy.difficulty}`}>}
                    {caseStudy.difficulty}
                  </div>
                </section>
              </aside>
            </div>
          )}
          {activeSection === 'implementation' && ()
            <div className="implementation-section">
              <section className="implementation-details">
                <h2>Implementation Process</h2>
                <p>{caseStudy.content.implementation}</p>
              </section>
              {/* Templates Used */}
              {caseStudy.templatesUsed.length > 0 && ()
                <section className="templates-section">
                  <h2>Templates Used</h2>
                  <div className="templates-grid">
                    {caseStudy.templatesUsed.map((template) => ()
                      <div
                        key={template.templateId}
                        className="template-card"
                        onClick={() => onTemplateClick?.(template.templateId)}
                      >
                        <h4>{template.templateName}</h4>
                        <p className="template-usage">{template.usageDescription}</p>
                        <div className="template-results">
                          <strong>Results:</strong> {template.resultsWithTemplate}
                        </div>
                        {template.customizations.length > 0 && ()
                          <div className="template-customizations">
                            <strong>Customizations:</strong>
                            <ul>
                              {template.customizations.slice(0, 3).map((customization, index) => ()
                                <li key={index}>{customization}</li>
                              ))}
                              {template.customizations.length > 3 && ()
                                <li>+{template.customizations.length - 3} more...</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* Learnings */}
              <section className="learnings-section">
                <h2>Key Learnings</h2>
                <p>{caseStudy.content.learnings}</p>
              </section>
            </div>
          )}
          {activeSection === 'results' && ()
            <div className="results-section">
              <section className="results-details">
                <h2>Results Achieved</h2>
                <p>{caseStudy.content.results}</p>
              </section>
              {/* Detailed Metrics */}
              <section className="detailed-metrics">
                <h2>Performance Metrics</h2>
                <div className="metrics-table">
                  <div className="metric-row">
                    <span className="metric-name">Implementation Time</span>
                    <span className="metric-value">{caseStudy.performanceMetrics.implementationTime} hours</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Project Duration</span>
                    <span className="metric-value">{caseStudy.performanceMetrics.projectDuration} days</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Team Size</span>
                    <span className="metric-value">{caseStudy.performanceMetrics.teamSize} people</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Error Reduction</span>
                    <span className="metric-value">{caseStudy.performanceMetrics.errorReduction}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Stakeholder Satisfaction</span>
                    <span className="metric-value">{caseStudy.performanceMetrics.stakeholderSatisfaction}/10</span>
                  </div>
                </div>
              </section>
              {/* Quality Metrics */}
              {caseStudy.roiMetrics.qualityMetrics.length > 0 && ()
                <section className="quality-metrics">
                  <h2>Quality Improvements</h2>
                  <div className="quality-grid">
                    {caseStudy.roiMetrics.qualityMetrics.map((metric, index) => ()
                      <div key={index} className="quality-card">
                        <h4>{metric.metric}</h4>
                        <div className="before-after">
                          <div className="before">
                            <span className="label">Before:</span>
                            <span className="value">{metric.before} {metric.unit || ''}</span>
                          </div>
                          <div className="after">
                            <span className="label">After:</span>
                            <span className="value">{metric.after} {metric.unit || ''}</span>
                          </div>
                          <div className="improvement">
                            <span className="improvement-value">+{metric.improvement}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* Next Steps */}
              {caseStudy.content.nextSteps && ()
                <section className="next-steps">
                  <h2>Next Steps</h2>
                  <p>{caseStudy.content.nextSteps}</p>
                </section>
              )}
            </div>
          )}
          {activeSection === 'media' && ()
            <div className="media-section">
              {/* Media Gallery */}
              <div className="media-gallery">
                {Object.entries(caseStudy.media).map(([category, mediaItems]) => {
                  if (mediaItems.length === 0) return null;
                  return ();
                    <section key={category} className="media-category">
                      <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                      <div className="media-grid">
                        {mediaItems.map((media) => ()
                          <div
                            key={media.id}
                            className="media-item"
                            onClick={() => setSelectedMedia(media)}
                          >
                            {media.type === 'image' || media.type === 'screenshot' ? ()
                              <img
                                src={media.thumbnailUrl || media.url}
                                alt={media.altText || media.title}
                                className="media-thumbnail"
                              />
                            ) : media.type === 'video' ? ()
                              <div className="video-thumbnail">
                                <div className="play-icon">▶</div>
                                {media.thumbnailUrl && ()
                                  <img
                                    src={media.thumbnailUrl}
                                    alt={media.altText || media.title}
                                  />
                                )}
                              </div>
                            ) : ()
                              <div className="document-thumbnail">
                                <div className="doc-icon">📄</div>
                                <span className="doc-title">{media.title}</span>
                              </div>
                            )}
                            <div className="media-info">
                              <h4>{media.title}</h4>
                              {media.description && ()
                                <p>{media.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Media Viewer Modal */}
        {selectedMedia && ()
          <div className="media-viewer-overlay" onClick={() => setSelectedMedia(null)}>
            <div className="media-viewer" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedMedia(null)}
                className="media-close"
              >
                ×
              </button>
              {selectedMedia.type === 'image' || selectedMedia.type === 'screenshot' ? ()
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || selectedMedia.title}
                  className="media-full"
                />
              ) : selectedMedia.type === 'video' ? ()
                <video
                  src={selectedMedia.url}
                  controls
                  className="media-full"
                  autoPlay
                />
              ) : ()
                <iframe
                  src={selectedMedia.url}
                  className="media-full"
                  title={selectedMedia.title}
                />
              )}
              <div className="media-caption">
                <h4>{selectedMedia.title}</h4>
                {selectedMedia.description && ()
                  <p>{selectedMedia.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .case-study-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .case-study-modal {
          background: #ffffff;
          border-radius: 12px;
          max-width: 1200px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 24px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .case-study-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        .case-study-subtitle {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }
        .header-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }
        .action-btn:hover {
          background: #f3f4f6;
        }
        .action-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }
        .close-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        .close-btn:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        .modal-nav {
          display: flex;
          gap: 4px;
        }
        .nav-btn {
          background: none;
          border: none;
          padding: 12px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          background: #f9fafb;
          color: #1f2937;
        }
        .nav-btn.active {
          background: #3b82f6;
          color: #ffffff;
        }
        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .overview-section {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
        }
        .featured-image {
          margin-bottom: 24px;
          border-radius: 8px;
          overflow: hidden;
        }
        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        .description, .solution {
          margin-bottom: 24px;
        }
        .description h2, .solution h2 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        .description p, .solution p {
          margin: 0;
          line-height: 1.6;
          color: #4b5563;
        }
        .key-metrics h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .metric-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .metric-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sidebar-content {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          height: fit-content;
        }
        .sidebar-content section {
          margin-bottom: 24px;
        }
        .sidebar-content section:last-child {
          margin-bottom: 0;
        }
        .sidebar-content h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .author-card {
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .author-card:hover {
          opacity: 0.8;
        }
        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        .author-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #6b7280;
        }
        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .verified-badge {
          color: #10b981;
          font-size: 12px;
        }
        .author-title, .author-company {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          background: #e5e7eb;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .industry-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .difficulty-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .difficulty-beginner {
          background: #dcfce7;
          color: #166534;
        }
        .difficulty-intermediate {
          background: #fef3c7;
          color: #92400e;
        }
        .difficulty-advanced {
          background: #fecaca;
          color: #991b1b;
        }
        .difficulty-expert {
          background: #e0e7ff;
          color: #3730a3;
        }
        .implementation-section, .results-section {
          max-width: 800px;
        }
        .implementation-section section, .results-section section {
          margin-bottom: 32px;
        }
        .implementation-section h2, .results-section h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .template-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .template-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .template-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .template-usage {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .template-results, .template-customizations {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 8px;
        }
        .template-customizations ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }
        .metrics-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .metric-row:last-child {
          border-bottom: none;
        }
        .metric-name {
          font-weight: 500;
          color: #4b5563;
        }
        .metric-value {
          font-weight: 600;
          color: #1f2937;
        }
        .quality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        .quality-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .quality-card h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .before-after {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .before, .after {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .label {
          color: #6b7280;
        }
        .value {
          font-weight: 600;
          color: #1f2937;
        }
        .improvement {
          text-align: center;
          margin-top: 8px;
        }
        .improvement-value {
          background: #dcfce7;
          color: #166534;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .media-gallery {
          max-width: 1000px;
        }
        .media-category {
          margin-bottom: 32px;
        }
        .media-category h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .media-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .media-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .media-thumbnail {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        .video-thumbnail, .document-thumbnail {
          width: 100%;
          height: 120px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .play-icon {
          position: absolute;
          z-index: 2;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .doc-icon {
          font-size: 32px;
        }
        .doc-title {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
        }
        .media-info {
          padding: 12px;
        }
        .media-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .media-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }
        .media-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .media-viewer {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
        }
        .media-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 3;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border: none;
          border-radius: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
        }
        .media-full {
          max-width: 100%;
          max-height: 80vh;
          display: block;
        }
        .media-caption {
          padding: 16px;
          background: #ffffff;
        }
        .media-caption h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .media-caption p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
        @media (max-width: 768px) {
          .case-study-modal {
            max-height: 95vh;
            margin: 10px;
          }
          .modal-header {
            padding: 16px;
          }
          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .case-study-title {
            font-size: 20px;
          }
          .modal-nav {
            flex-wrap: wrap;
          }
          .modal-content {
            padding: 16px;
          }
          .overview-section {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          .templates-grid {
            grid-template-columns: 1fr;
          }
          .quality-grid {
            grid-template-columns: 1fr;
          }
          .media-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          .media-viewer-overlay {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CaseStudyModal;