/**
 * Epic 16 - Quality Assessment Dashboard Component
 * Task: E16-1753114247130-02122C - Create quality assessment
 * 
 * React component for managing content quality assessment workflows,
 * displaying quality metrics, and coordinating editorial reviews.
 */

import React, { useState, useEffect } from 'react';
import {
  CommunityContentQualityMetrics,
  QualityAssessmentWorkflow,
  EditorialReview,
  QualityRecommendation,
  QualityFlag,
  ContentQualityAssessmentService,
  QUALITY_ASSESSMENT_CONFIG
} from '../../community/ContentQualityAssessment';

export interface QualityAssessmentDashboardProps {
  contentId: string;
  versionId: string;
  userRole?: 'author' | 'editor' | 'reviewer' | 'admin';
  onQualityImproved?: (newScore: number) => void;
  onWorkflowUpdate?: (workflow: QualityAssessmentWorkflow) => void;
  showReviewInterface?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const QualityAssessmentDashboard: React.FC<QualityAssessmentDashboardProps> = ({
  contentId,
  versionId,
  userRole = 'author',
  onQualityImproved,
  onWorkflowUpdate,
  showReviewInterface = false,
  readOnly = false,
  className = ''
}) => {
  const [qualityMetrics, setQualityMetrics] = useState<CommunityContentQualityMetrics | null>(null);
  const [workflow, setWorkflow] = useState<QualityAssessmentWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations' | 'workflow' | 'review'>('overview');
  const [runningAssessment, setRunningAssessment] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);

  const qualityService = new ContentQualityAssessmentService(null); // API client would be injected

  useEffect(() => {
    loadQualityData();
  }, [contentId, versionId]);

  const loadQualityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load quality metrics and workflow in parallel
      const [metricsResult, workflowResult] = await Promise.allSettled([
        qualityService.runComprehensiveAssessment(contentId, versionId, { include_automated: true }),
        qualityService.getReviewWorkflow(contentId, versionId)
      ]);

      if (metricsResult.status === 'fulfilled') {
        setQualityMetrics(metricsResult.value);
      } else {
        console.warn('Failed to load quality metrics:', metricsResult.reason);
      }

      if (workflowResult.status === 'fulfilled') {
        setWorkflow(workflowResult.value);
      } else {
        console.warn('Failed to load workflow:', workflowResult.reason);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quality data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async (type: 'automated' | 'comprehensive') => {
    setRunningAssessment(true);
    setError(null);
    
    try {
      const newMetrics = await qualityService.runComprehensiveAssessment(contentId, versionId, {
        include_automated: true,
        include_editorial: type === 'comprehensive',
        include_community: type === 'comprehensive'
      });
      
      setQualityMetrics(newMetrics);
      onQualityImproved?.(newMetrics.overallQualityScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run assessment');
    } finally {
      setRunningAssessment(false);
    }
  };

  const handleAssignReview = async (reviewerId: string, reviewType: 'quick_review' | 'comprehensive_review' | 'specialist_review') => {
    try {
      const updatedWorkflow = await qualityService.assignEditorialReview(contentId, versionId, reviewerId, {
        review_type: reviewType
      });
      
      setWorkflow(updatedWorkflow);
      onWorkflowUpdate?.(updatedWorkflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign review');
    }
  };

  const handleApplyAutomatedFixes = async () => {
    try {
      const result = await qualityService.applyAutomatedFixes(
        contentId,
        versionId,
        ['grammar', 'formatting', 'seo'],
        80 // confidence threshold
      );
      
      if (result.fixes_applied > 0) {
        // Reload quality data to show improvements
        await loadQualityData();
        onQualityImproved?.(qualityMetrics!.overallQualityScore + result.quality_improvement);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply automated fixes');
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': '#10b981',
      'A': '#059669',
      'B+': '#3b82f6',
      'B': '#2563eb',
      'C+': '#f59e0b',
      'C': '#d97706',
      'D': '#ef4444',
      'F': '#dc2626'
    };
    return colors[grade as keyof typeof colors] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: '#10b981',
      good: '#3b82f6',
      acceptable: '#f59e0b',
      needs_improvement: '#ef4444',
      rejected: '#dc2626'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  const formatRecommendationPriority = (priority: string) => {
    const priorities = {
      high: '🔴 High',
      medium: '🟡 Medium',
      low: '🟢 Low'
    };
    return priorities[priority as keyof typeof priorities] || priority;
  };

  if (loading) {
    return (
      <div className={`quality-assessment-dashboard loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Analyzing content quality...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`quality-assessment-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h3>Quality Assessment</h3>
          {qualityMetrics && (
            <div className="quality-summary">
              <div 
                className="quality-grade"
                style={{ color: getGradeColor(qualityMetrics.qualityGrade) }}
              >
                {qualityMetrics.qualityGrade}
              </div>
              <div className="quality-score">
                {formatScore(qualityMetrics.overallQualityScore)}/100
              </div>
              <div 
                className="quality-status"
                style={{ color: getStatusColor(qualityMetrics.qualityStatus) }}
              >
                {qualityMetrics.qualityStatus.replace('_', ' ')}
              </div>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          {!readOnly && userRole !== 'author' && (
            <button
              onClick={() => handleRunAssessment('automated')}
              disabled={runningAssessment}
              className="assessment-btn automated"
            >
              {runningAssessment ? '🔄' : '🤖'} Auto Assessment
            </button>
          )}
          
          {!readOnly && ['editor', 'admin'].includes(userRole) && (
            <button
              onClick={() => handleRunAssessment('comprehensive')}
              disabled={runningAssessment}
              className="assessment-btn comprehensive"
            >
              {runningAssessment ? '🔄' : '📊'} Full Assessment
            </button>
          )}
          
          {!readOnly && qualityMetrics?.flags.some(f => f.severity === 'high' || f.severity === 'critical') && (
            <button
              onClick={() => setShowFlagModal(true)}
              className="flag-issues-btn"
            >
              ⚠️ Issues ({qualityMetrics.flags.filter(f => f.severity === 'high' || f.severity === 'critical').length})
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="error-dismiss">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`tab ${activeTab === 'detailed' ? 'active' : ''}`}
        >
          🔍 Detailed Analysis
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
        >
          💡 Recommendations ({qualityMetrics?.recommendations.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`tab ${activeTab === 'workflow' ? 'active' : ''}`}
        >
          🔄 Workflow
        </button>
        {showReviewInterface && (
          <button
            onClick={() => setActiveTab('review')}
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
          >
            ✍️ Review
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && qualityMetrics && (
          <div className="overview-content">
            {/* Quality Score Visualization */}
            <div className="quality-visualization">
              <div className="score-circle">
                <div 
                  className="score-fill"
                  style={{
                    background: `conic-gradient(${getGradeColor(qualityMetrics.qualityGrade)} ${qualityMetrics.overallQualityScore * 3.6}deg, #e5e7eb 0deg)`
                  }}
                >
                  <div className="score-inner">
                    <div className="score-number">{formatScore(qualityMetrics.overallQualityScore)}</div>
                    <div className="score-label">Quality Score</div>
                  </div>
                </div>
              </div>
              
              <div className="publication-status">
                <h4>Publication Recommendation</h4>
                <div className={`recommendation ${qualityMetrics.publicationRecommendation.replace('_', '-')}`}>
                  {qualityMetrics.publicationRecommendation.replace('_', ' ')}
                </div>
                <p className="recommendation-explanation">
                  {qualityMetrics.publicationRecommendation === 'publish' && 'Content meets all quality standards and is ready for publication.'}
                  {qualityMetrics.publicationRecommendation === 'publish_with_edits' && 'Content is nearly ready but needs minor improvements.'}
                  {qualityMetrics.publicationRecommendation === 'major_revision' && 'Content requires significant improvements before publication.'}
                  {qualityMetrics.publicationRecommendation === 'reject' && 'Content does not meet minimum quality standards.'}
                </p>
              </div>
            </div>

            {/* Quality Dimensions */}
            <div className="quality-dimensions">
              <h4>Quality Dimensions</h4>
              <div className="dimensions-grid">
                <div className="dimension-card">
                  <div className="dimension-header">
                    <span className="dimension-icon">✍️</span>
                    <span className="dimension-name">Editorial</span>
                    <span className="dimension-score">{formatScore(qualityMetrics.editorial.score)}</span>
                  </div>
                  <div className="dimension-details">
                    <div className="detail-item">
                      <span>Accuracy:</span>
                      <span>{formatScore(qualityMetrics.editorial.accuracy.factual_correctness)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Clarity:</span>
                      <span>{formatScore(qualityMetrics.editorial.clarity.writing_quality)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Completeness:</span>
                      <span>{formatScore(qualityMetrics.editorial.completeness.topic_coverage)}</span>
                    </div>
                  </div>
                </div>

                <div className="dimension-card">
                  <div className="dimension-header">
                    <span className="dimension-icon">⚙️</span>
                    <span className="dimension-name">Technical</span>
                    <span className="dimension-score">{formatScore(qualityMetrics.technical.score)}</span>
                  </div>
                  <div className="dimension-details">
                    <div className="detail-item">
                      <span>Formatting:</span>
                      <span>{formatScore(qualityMetrics.technical.formatting.markdown_quality)}</span>
                    </div>
                    <div className="detail-item">
                      <span>SEO:</span>
                      <span>{formatScore(qualityMetrics.technical.seo_optimization.title_optimization)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Accessibility:</span>
                      <span>{formatScore(qualityMetrics.technical.accessibility.screen_reader_compatibility)}</span>
                    </div>
                  </div>
                </div>

                <div className="dimension-card">
                  <div className="dimension-header">
                    <span className="dimension-icon">💫</span>
                    <span className="dimension-name">Engagement</span>
                    <span className="dimension-score">{formatScore(qualityMetrics.engagement.score)}</span>
                  </div>
                  <div className="dimension-details">
                    <div className="detail-item">
                      <span>Potential:</span>
                      <span>{formatScore(qualityMetrics.engagement.engagement_potential.hook_effectiveness)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Utility:</span>
                      <span>{formatScore(qualityMetrics.engagement.utility.actionability)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Audience Fit:</span>
                      <span>{formatScore(qualityMetrics.engagement.audience_fit.difficulty_level_appropriateness)}</span>
                    </div>
                  </div>
                </div>

                <div className="dimension-card">
                  <div className="dimension-header">
                    <span className="dimension-icon">🤝</span>
                    <span className="dimension-name">Community</span>
                    <span className="dimension-score">{formatScore(qualityMetrics.community.score)}</span>
                  </div>
                  <div className="dimension-details">
                    <div className="detail-item">
                      <span>Value:</span>
                      <span>{formatScore(qualityMetrics.community.contribution_value.knowledge_gap_filling)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Standards:</span>
                      <span>{formatScore(qualityMetrics.community.standards_compliance.community_guidelines_adherence)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Transfer:</span>
                      <span>{formatScore(qualityMetrics.community.knowledge_transfer.teaching_effectiveness)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {!readOnly && qualityMetrics.automated.issues.length > 0 && (
              <div className="quick-actions">
                <h4>Quick Improvements</h4>
                <div className="action-cards">
                  <div className="action-card">
                    <div className="action-info">
                      <h5>🤖 Automated Fixes</h5>
                      <p>{qualityMetrics.automated.issues.filter(i => i.auto_fixable).length} fixable issues found</p>
                    </div>
                    <button
                      onClick={handleApplyAutomatedFixes}
                      className="action-button"
                      disabled={runningAssessment}
                    >
                      Apply Fixes
                    </button>
                  </div>
                  
                  {qualityMetrics.recommendations.filter(r => r.auto_fix_available).length > 0 && (
                    <div className="action-card">
                      <div className="action-info">
                        <h5>💡 Smart Suggestions</h5>
                        <p>{qualityMetrics.recommendations.filter(r => r.auto_fix_available).length} automated improvements available</p>
                      </div>
                      <button className="action-button">
                        View Suggestions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'detailed' && qualityMetrics && (
          <div className="detailed-analysis">
            {/* Automated Analysis Results */}
            <div className="analysis-section">
              <h4>📝 Language & Content Analysis</h4>
              <div className="analysis-grid">
                <div className="analysis-card">
                  <h5>Grammar & Style</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${qualityMetrics.automated.language_analysis.grammar_score}%` }}
                    ></div>
                    <span className="score-text">{formatScore(qualityMetrics.automated.language_analysis.grammar_score)}/100</span>
                  </div>
                  <div className="analysis-details">
                    <div>Spelling: {formatScore(qualityMetrics.automated.language_analysis.spelling_accuracy)}%</div>
                    <div>Style: {formatScore(qualityMetrics.automated.language_analysis.style_consistency)}%</div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h5>Readability</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${qualityMetrics.automated.readability.flesch_reading_ease}%` }}
                    ></div>
                    <span className="score-text">{formatScore(qualityMetrics.automated.readability.flesch_reading_ease)}/100</span>
                  </div>
                  <div className="analysis-details">
                    <div>Grade Level: {qualityMetrics.automated.readability.flesch_kincaid_grade}</div>
                    <div>Reading Time: {qualityMetrics.automated.readability.estimated_reading_time} min</div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h5>Structure</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${qualityMetrics.automated.structure.heading_hierarchy_score}%` }}
                    ></div>
                    <span className="score-text">{formatScore(qualityMetrics.automated.structure.heading_hierarchy_score)}/100</span>
                  </div>
                  <div className="analysis-details">
                    <div>Hierarchy: {formatScore(qualityMetrics.automated.structure.heading_hierarchy_score)}%</div>
                    <div>TOC Quality: {formatScore(qualityMetrics.automated.structure.table_of_contents_quality)}%</div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h5>SEO Optimization</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${qualityMetrics.automated.seo.meta_data_completeness}%` }}
                    ></div>
                    <span className="score-text">{formatScore(qualityMetrics.automated.seo.meta_data_completeness)}/100</span>
                  </div>
                  <div className="analysis-details">
                    <div>Meta Data: {formatScore(qualityMetrics.automated.seo.meta_data_completeness)}%</div>
                    <div>Links: {formatScore(qualityMetrics.automated.seo.internal_link_quality)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Detection */}
            {qualityMetrics.automated.issues.length > 0 && (
              <div className="issues-section">
                <h4>🔍 Detected Issues ({qualityMetrics.automated.issues.length})</h4>
                <div className="issues-list">
                  {qualityMetrics.automated.issues.map((issue, index) => (
                    <div key={index} className={`issue-item severity-${issue.severity}`}>
                      <div className="issue-header">
                        <span className="issue-type">{issue.type}</span>
                        <span className={`issue-severity severity-${issue.severity}`}>
                          {issue.severity}
                        </span>
                        {issue.auto_fixable && (
                          <span className="auto-fixable">🤖 Auto-fixable</span>
                        )}
                      </div>
                      <div className="issue-description">{issue.description}</div>
                      {issue.suggestion && (
                        <div className="issue-suggestion">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </div>
                      )}
                      {issue.location.section && (
                        <div className="issue-location">
                          <strong>Location:</strong> {issue.location.section}
                          {issue.location.line && ` (line ${issue.location.line})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Flags */}
            {qualityMetrics.flags.length > 0 && (
              <div className="flags-section">
                <h4>🚩 Quality Flags ({qualityMetrics.flags.length})</h4>
                <div className="flags-list">
                  {qualityMetrics.flags.map((flag, index) => (
                    <div key={index} className={`flag-item severity-${flag.severity}`}>
                      <div className="flag-header">
                        <span className="flag-type">{flag.type.replace('_', ' ')}</span>
                        <span className={`flag-severity severity-${flag.severity}`}>
                          {flag.severity}
                        </span>
                        {flag.auto_detected && (
                          <span className="auto-detected">🤖 Auto-detected</span>
                        )}
                      </div>
                      <div className="flag-description">{flag.description}</div>
                      {flag.evidence && (
                        <div className="flag-evidence">
                          <strong>Evidence:</strong> {flag.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && qualityMetrics && (
          <div className="recommendations-content">
            {qualityMetrics.recommendations.length === 0 ? (
              <div className="empty-state">
                <p>🎉 No recommendations - your content quality is excellent!</p>
              </div>
            ) : (
              <div className="recommendations-list">
                {qualityMetrics.recommendations.map((recommendation, index) => (
                  <div key={index} className={`recommendation-card priority-${recommendation.priority}`}>
                    <div className="recommendation-header">
                      <div className="recommendation-info">
                        <span className="recommendation-type">{recommendation.category}</span>
                        <span className="recommendation-priority">
                          {formatRecommendationPriority(recommendation.priority)}
                        </span>
                      </div>
                      <div className="recommendation-effort">
                        Effort: {recommendation.estimated_effort}
                      </div>
                    </div>
                    
                    <div className="recommendation-content">
                      <h5>{recommendation.issue}</h5>
                      <div className="recommendation-text">{recommendation.recommendation}</div>
                      <div className="expected-impact">
                        <strong>Expected Impact:</strong> {recommendation.expected_impact}
                      </div>
                    </div>

                    {recommendation.implementation_steps && (
                      <div className="implementation-steps">
                        <h6>Implementation Steps:</h6>
                        <ol>
                          {recommendation.implementation_steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {recommendation.resources && (
                      <div className="recommendation-resources">
                        <h6>Helpful Resources:</h6>
                        <div className="resources-list">
                          {recommendation.resources.map((resource, resourceIndex) => (
                            <a
                              key={resourceIndex}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              {resource.title} ({resource.type})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendation.auto_fix_available && (
                      <div className="auto-fix-section">
                        <p>🤖 This issue can be automatically fixed</p>
                        <button
                          className="auto-fix-btn"
                          onClick={() => {/* Implement auto-fix */}}
                        >
                          Apply Auto-Fix ({recommendation.auto_fix_confidence}% confidence)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflow' && workflow && (
          <div className="workflow-content">
            <div className="workflow-status">
              <h4>Current Status: {workflow.current_status.replace('_', ' ')}</h4>
              <div className="workflow-stage">
                Stage: {workflow.workflow_stage.replace('_', ' ')}
              </div>
            </div>

            {/* Workflow Timeline */}
            <div className="workflow-timeline">
              <h5>📅 Workflow History</h5>
              <div className="timeline">
                {workflow.workflow_history.map((step, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="step-type">{step.step_type.replace('_', ' ')}</div>
                      <div className="step-user">by {step.completed_by}</div>
                      <div className="step-date">{new Date(step.completed_date).toLocaleString()}</div>
                      <div className="step-duration">({step.duration_hours.toFixed(1)}h)</div>
                      {step.notes && (
                        <div className="step-notes">{step.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment and Actions */}
            {!readOnly && ['editor', 'admin'].includes(userRole) && (
              <div className="workflow-actions">
                <h5>🎯 Actions</h5>
                <div className="action-buttons">
                  {workflow.current_status === 'pending' && (
                    <button
                      onClick={() => handleAssignReview('reviewer-123', 'quick_review')}
                      className="workflow-btn assign"
                    >
                      👀 Assign Quick Review
                    </button>
                  )}
                  
                  {workflow.current_status === 'pending' && (
                    <button
                      onClick={() => handleAssignReview('reviewer-456', 'comprehensive_review')}
                      className="workflow-btn assign"
                    >
                      📊 Assign Comprehensive Review
                    </button>
                  )}
                  
                  {workflow.current_status === 'in_review' && userRole === 'admin' && (
                    <button className="workflow-btn escalate">
                      ⚡ Escalate Priority
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && showReviewInterface && (
          <div className="review-interface">
            <h4>✍️ Editorial Review</h4>
            <p>Editorial review interface would be implemented here...</p>
            {/* Detailed review form would go here */}
          </div>
        )}
      </div>

      <style jsx>{`
        .quality-assessment-dashboard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .quality-assessment-dashboard.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .header-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .quality-summary {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quality-grade {
          font-size: 24px;
          font-weight: 700;
        }

        .quality-score {
          font-size: 16px;
          font-weight: 600;
          color: #4b5563;
        }

        .quality-status {
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .assessment-btn {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .assessment-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .assessment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .assessment-btn.comprehensive {
          background: #059669;
        }

        .assessment-btn.comprehensive:hover:not(:disabled) {
          background: #047857;
        }

        .flag-issues-btn {
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          margin: 0 20px 16px 20px;
          border-radius: 6px;
          border: 1px solid #fecaca;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          margin-left: auto;
        }

        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .tab {
          background: none;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .tab:hover {
          color: #1f2937;
          background: #f9fafb;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-content {
          padding: 20px;
        }

        .overview-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .quality-visualization {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          align-items: center;
        }

        .score-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          position: relative;
          padding: 8px;
        }

        .score-fill {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-inner {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-number {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .score-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .publication-status h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .recommendation {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: capitalize;
          margin-bottom: 8px;
          display: inline-block;
        }

        .recommendation.publish {
          background: #dcfce7;
          color: #166534;
        }

        .recommendation.publish-with-edits {
          background: #dbeafe;
          color: #1e40af;
        }

        .recommendation.major-revision {
          background: #fef3c7;
          color: #92400e;
        }

        .recommendation.reject {
          background: #fecaca;
          color: #991b1b;
        }

        .recommendation-explanation {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .quality-dimensions h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .dimensions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .dimension-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .dimension-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .dimension-icon {
          font-size: 18px;
        }

        .dimension-name {
          font-weight: 600;
          color: #1f2937;
          flex: 1;
        }

        .dimension-score {
          font-weight: 700;
          color: #3b82f6;
        }

        .dimension-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }

        .quick-actions h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .action-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .action-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .action-button {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .detailed-analysis {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analysis-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .analysis-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .analysis-card h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .score-bar {
          background: #e5e7eb;
          border-radius: 4px;
          height: 8px;
          position: relative;
          margin-bottom: 8px;
        }

        .score-bar .score-fill {
          background: #3b82f6;
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .score-text {
          position: absolute;
          right: 8px;
          top: -20px;
          font-size: 12px;
          font-weight: 600;
          color: #4b5563;
        }

        .analysis-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .issues-section h4,
        .flags-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .issues-list,
        .flags-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item,
        .flag-item {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .issue-item.severity-critical,
        .flag-item.severity-critical {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .issue-item.severity-high,
        .flag-item.severity-high {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .issue-item.severity-medium,
        .flag-item.severity-medium {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .issue-header,
        .flag-header {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }

        .issue-type,
        .flag-type {
          background: #374151;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .issue-severity,
        .flag-severity {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .severity-critical {
          background: #fecaca;
          color: #991b1b;
        }

        .severity-high {
          background: #fed7d7;
          color: #c53030;
        }

        .severity-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .severity-low {
          background: #d1fae5;
          color: #065f46;
        }

        .auto-fixable,
        .auto-detected {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .issue-description,
        .flag-description {
          margin-bottom: 8px;
          font-size: 14px;
          color: #4b5563;
        }

        .issue-suggestion,
        .issue-location,
        .flag-evidence {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .recommendations-content {
          max-height: 600px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recommendation-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .recommendation-card.priority-high {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .recommendation-card.priority-medium {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .recommendation-info {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .recommendation-type {
          background: #374151;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .recommendation-priority {
          font-size: 12px;
          font-weight: 500;
        }

        .recommendation-effort {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .recommendation-content h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .recommendation-text {
          margin-bottom: 8px;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }

        .expected-impact {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .implementation-steps h6,
        .recommendation-resources h6 {
          margin: 0 0 8px 0;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .implementation-steps ol {
          margin: 0;
          padding-left: 16px;
          font-size: 12px;
          color: #4b5563;
        }

        .resources-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .resource-link {
          font-size: 12px;
          color: #3b82f6;
          text-decoration: none;
        }

        .resource-link:hover {
          text-decoration: underline;
        }

        .auto-fix-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 12px;
          margin-top: 12px;
        }

        .auto-fix-section p {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #0369a1;
        }

        .auto-fix-btn {
          background: #0ea5e9;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .workflow-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workflow-status h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          text-transform: capitalize;
        }

        .workflow-stage {
          font-size: 14px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .workflow-timeline h5 {
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .timeline-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          margin-top: 4px;
          flex-shrink: 0;
        }

        .timeline-content {
          flex: 1;
        }

        .step-type {
          font-weight: 600;
          color: #1f2937;
          text-transform: capitalize;
          margin-bottom: 2px;
        }

        .step-user,
        .step-date,
        .step-duration {
          font-size: 12px;
          color: #6b7280;
        }

        .step-notes {
          margin-top: 4px;
          font-size: 12px;
          color: #4b5563;
          font-style: italic;
        }

        .workflow-actions h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .workflow-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease;
        }

        .workflow-btn.assign {
          background: #3b82f6;
          color: #ffffff;
        }

        .workflow-btn.assign:hover {
          background: #2563eb;
        }

        .workflow-btn.escalate {
          background: #ef4444;
          color: #ffffff;
        }

        .workflow-btn.escalate:hover {
          background: #dc2626;
        }

        .review-interface {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .quality-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .quality-visualization {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .dimensions-grid {
            grid-template-columns: 1fr;
          }

          .analysis-grid {
            grid-template-columns: 1fr;
          }

          .action-cards {
            grid-template-columns: 1fr;
          }

          .recommendation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default QualityAssessmentDashboard;