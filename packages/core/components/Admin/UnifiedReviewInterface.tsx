/**
 * Unified Review Interface - E17-1753114397293-31FD2B
 * 
 * Comprehensive review interface that consolidates all review workflows
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Textarea } from '../ui/Textarea';
import { 
  Eye,
  FileText,
  User,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Download,
  Upload,
  Image,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Save,
  Send,
  Edit,
  Trash2,
  Plus,
  Minus,
  Info,
  Shield,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Settings,
  RefreshCw
} from 'lucide-react';

// Unified review types extending existing system
export interface ReviewItem {
  id: string;
  type: 'template_submission' | 'verification_request' | 'policy_violation' | 'content_appeal' | 'marketplace_listing';
  title: string;
  description?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitter: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    tier: string;
    reputation_score?: number;
  };
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  assigned_reviewer?: string;
  estimated_review_time?: number; // minutes
  
  // Type-specific data
  template_data?: {
    template_id: string;
    version: number;
    categories: string[];
    tags: string[];
    price_cents: number;
    graph_json: any;
    validation_results: ValidationResult[];
    previous_reviews?: ReviewFeedback[];
  };
  
  verification_data?: {
    request_type: 'identity' | 'business' | 'creator';
    documents: DocumentData[];
    verification_criteria: VerificationCriterion[];
    previous_attempts?: number;
  };
  
  violation_data?: {
    policy_id: string;
    violation_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: Evidence[];
    automated_detection: boolean;
    affected_content?: string[];
  };
  
  appeal_data?: {
    original_decision_id: string;
    appeal_reason: string;
    supporting_evidence: Evidence[];
    original_reviewer: string;
    appeal_deadline: Date;
  };
}

export interface ValidationResult {
  rule_id: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  field?: string;
  auto_fixable: boolean;
  suggestions?: string[];
}

export interface ReviewFeedback {
  category: 'content' | 'quality' | 'compliance' | 'usability' | 'technical';
  rating: number; // 1-5
  comments: string;
  suggestions: string[];
  is_blocking: boolean;
}

export interface DocumentData {
  id: string;
  type: 'image' | 'pdf' | 'document' | 'video' | 'audio';
  fileName: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    quality?: 'low' | 'medium' | 'high';
  };
}

export interface VerificationCriterion {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: 'document_check' | 'identity_match' | 'address_verification' | 'business_validation';
  status: 'pending' | 'passed' | 'failed' | 'manual_review';
  automated_result?: any;
  manual_override?: boolean;
}

export interface Evidence {
  id: string;
  type: 'screenshot' | 'log' | 'report' | 'document';
  url: string;
  description: string;
  timestamp: Date;
  confidence_score?: number;
}

export interface ReviewDecision {
  decision: 'approved' | 'rejected' | 'changes_requested';
  overall_score: number; // 1-100
  feedback: ReviewFeedback[];
  public_comments: string;
  private_notes: string;
  follow_up_required: boolean;
  follow_up_date?: Date;
  conditional_approval?: {
    conditions: string[];
    deadline: Date;
  };
}

export interface UnifiedReviewInterfaceProps {
  reviewItem: ReviewItem;
  onDecision: (decision: ReviewDecision) => void;
  onSaveDraft: (decision: Partial<ReviewDecision>) => void;
  onBack: () => void;
  reviewerPermissions: string[];
  className?: string;
}

const UnifiedReviewInterface: React.FC<UnifiedReviewInterfaceProps> = ({
  reviewItem,
  onDecision,
  onSaveDraft,
  onBack,
  reviewerPermissions,
  className = ''
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewDecision, setReviewDecision] = useState<Partial<ReviewDecision>>({
    feedback: [],
    public_comments: '',
    private_notes: '',
    follow_up_required: false
  });
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [documentZoom, setDocumentZoom] = useState(100);
  const [mediaPlaying, setMediaPlaying] = useState<Record<string, boolean>>({});
  const [selectedValidationRules, setSelectedValidationRules] = useState<string[]>([]);
  const [customValidations, setCustomValidations] = useState<ValidationResult[]>([]);

  // Load any existing draft
  useEffect(() => {
    loadReviewDraft();
  }, [reviewItem.id]);

  const loadReviewDraft = async () => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewItem.id}/draft`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (response.ok) {
        const draft = await response.json();
        setReviewDecision(draft);
      }
    } catch (error) {
      console.error('Failed to load review draft:', error);
    }
  };

  const handleSaveDraft = async () => {
    await onSaveDraft(reviewDecision);
  };

  const handleSubmitDecision = async () => {
    if (!reviewDecision.decision) {
      alert('Please select a decision before submitting.');
      return;
    }

    if (!reviewDecision.public_comments?.trim()) {
      alert('Please provide public comments for the submitter.');
      return;
    }

    await onDecision(reviewDecision as ReviewDecision);
  };

  const updateFeedback = (category: string, updates: Partial<ReviewFeedback>) => {
    const existingIndex = reviewDecision.feedback?.findIndex(f => f.category === category) ?? -1;
    const updatedFeedback = [...(reviewDecision.feedback || [])];
    
    if (existingIndex >= 0) {
      updatedFeedback[existingIndex] = { ...updatedFeedback[existingIndex], ...updates };
    } else {
      updatedFeedback.push({
        category: category as ReviewFeedback['category'],
        rating: 3,
        comments: '',
        suggestions: [],
        is_blocking: false,
        ...updates
      });
    }
    
    setReviewDecision(prev => ({ ...prev, feedback: updatedFeedback }));
  };

  const calculateOverallScore = () => {
    if (!reviewDecision.feedback?.length) return 50;
    
    const weightedScore = reviewDecision.feedback.reduce((total, feedback) => {
      const weight = feedback.is_blocking ? 2 : 1;
      return total + (feedback.rating * 20 * weight); // Convert 1-5 to 0-100
    }, 0);
    
    const totalWeight = reviewDecision.feedback.reduce((total, feedback) => 
      total + (feedback.is_blocking ? 2 : 1), 0
    );
    
    return Math.round(weightedScore / totalWeight);
  };

  const renderOverviewTab = () => (
    <div className="review-overview">
      <div className="overview-header">
        <div className="item-info">
          <div className="item-type-badge">
            <Badge className={getTypeColor(reviewItem.type)}>
              {formatItemType(reviewItem.type)}
            </Badge>
          </div>
          <h2 className="item-title">{reviewItem.title}</h2>
          {reviewItem.description && (
            <p className="item-description">{reviewItem.description}</p>
          )}
        </div>
        
        <div className="item-metadata">
          <div className="metadata-grid">
            <div className="metadata-item">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Submitted {formatTimeAgo(reviewItem.submitted_at || reviewItem.created_at)}</span>
            </div>
            <div className="metadata-item">
              <User className="w-4 h-4 text-gray-400" />
              <span>{reviewItem.submitter.name}</span>
              <Badge variant="outline" className="ml-2">
                {reviewItem.submitter.tier}
              </Badge>
            </div>
            <div className="metadata-item">
              <Target className="w-4 h-4 text-gray-400" />
              <Badge className={getPriorityColor(reviewItem.priority)}>
                {reviewItem.priority}
              </Badge>
            </div>
            {reviewItem.estimated_review_time && (
              <div className="metadata-item">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span>Est. {reviewItem.estimated_review_time}m review</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type-specific quick insights */}
      {reviewItem.template_data && (
        <Card className="template-insights">
          <CardHeader>
            <CardTitle className="text-lg">Template Submission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="insights-grid">
              <div className="insight-item">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="insight-label">Version</span>
                  <span className="insight-value">v{reviewItem.template_data.version}</span>
                </div>
              </div>
              <div className="insight-item">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <span className="insight-label">Price</span>
                  <span className="insight-value">
                    {reviewItem.template_data.price_cents === 0 ? 'Free' : 
                      `$${(reviewItem.template_data.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
              <div className="insight-item">
                <Flag className="w-5 h-5 text-red-500" />
                <div>
                  <span className="insight-label">Validation Issues</span>
                  <span className="insight-value">
                    {reviewItem.template_data.validation_results.filter(r => r.severity === 'error').length} errors,{' '}
                    {reviewItem.template_data.validation_results.filter(r => r.severity === 'warning').length} warnings
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviewItem.verification_data && (
        <Card className="verification-insights">
          <CardHeader>
            <CardTitle className="text-lg">Verification Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="verification-progress">
              <div className="progress-header">
                <span>Verification Criteria</span>
                <span>{reviewItem.verification_data.verification_criteria.filter(c => c.status === 'passed').length}/
                  {reviewItem.verification_data.verification_criteria.length} Complete</span>
              </div>
              <div className="criteria-list">
                {reviewItem.verification_data.verification_criteria.map(criterion => (
                  <div key={criterion.id} className="criterion-item">
                    <div className="criterion-status">
                      {criterion.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {criterion.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                      {criterion.status === 'manual_review' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {criterion.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="criterion-info">
                      <span className="criterion-name">{criterion.name}</span>
                      {criterion.required && <Badge variant="outline" className="ml-2">Required</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContentTab = () => (
    <div className="content-review">
      {reviewItem.template_data && (
        <div className="template-content">
          <Tabs defaultValue="preview" className="content-tabs">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="preview-content">
              <Card>
                <CardHeader>
                  <CardTitle>Template Graph Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="graph-preview">
                    <pre className="graph-json">
                      {JSON.stringify(reviewItem.template_data.graph_json, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="validation" className="validation-content">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Validation Results
                    <Badge variant="outline">
                      {reviewItem.template_data.validation_results.length} rules checked
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="validation-list">
                    {reviewItem.template_data.validation_results.map((result, index) => (
                      <div key={index} className={`validation-item severity-${result.severity}`}>
                        <div className="validation-icon">
                          {result.severity === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                          {result.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {result.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="validation-content">
                          <div className="validation-header">
                            <span className="validation-category">{result.category}</span>
                            {result.auto_fixable && <Badge variant="outline" className="ml-2">Auto-fixable</Badge>}
                          </div>
                          <p className="validation-message">{result.message}</p>
                          {result.field && <p className="validation-field">Field: {result.field}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="history-content">
              <Card>
                <CardHeader>
                  <CardTitle>Review History</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewItem.template_data.previous_reviews && reviewItem.template_data.previous_reviews.length > 0 ? (
                    <div className="history-list">
                      {reviewItem.template_data.previous_reviews.map((review, index) => (
                        <div key={index} className="history-item">
                          <div className="review-meta">
                            <Badge className={`rating-${review.rating}`}>
                              {review.rating}/5 stars
                            </Badge>
                            <span className="review-category">{review.category}</span>
                          </div>
                          <p className="review-comments">{review.comments}</p>
                          {review.suggestions.length > 0 && (
                            <ul className="review-suggestions">
                              {review.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No previous reviews available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {reviewItem.verification_data && (
        <div className="verification-documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Verification Documents
                <Badge variant="outline">
                  {reviewItem.verification_data.documents.length} files
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="documents-grid">
                {reviewItem.verification_data.documents.map((doc, index) => (
                  <div key={doc.id} className="document-card">
                    <div className="document-preview">
                      {doc.type === 'image' ? (
                        <img 
                          src={doc.thumbnailUrl || doc.url} 
                          alt={doc.fileName}
                          className="document-image"
                          style={{ transform: `scale(${documentZoom / 100})` }}
                        />
                      ) : (
                        <div className="document-placeholder">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <span className="document-type">{doc.type.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="document-info">
                      <h4 className="document-name">{doc.fileName}</h4>
                      <p className="document-size">{formatFileSize(doc.fileSize)}</p>
                    </div>
                    <div className="document-actions">
                      <Button size="sm" variant="outline" onClick={() => window.open(doc.url, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {/* Download */}}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="document-controls">
                <div className="zoom-controls">
                  <Button size="sm" variant="outline" onClick={() => setDocumentZoom(prev => Math.max(prev - 25, 25))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="zoom-level">{documentZoom}%</span>
                  <Button size="sm" variant="outline" onClick={() => setDocumentZoom(prev => Math.min(prev + 25, 200))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderReviewTab = () => (
    <div className="review-decision">
      <div className="decision-section">
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="decision-options">
              <div className="decision-buttons">
                <Button
                  variant={reviewDecision.decision === 'approved' ? 'default' : 'outline'}
                  className={reviewDecision.decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  onClick={() => setReviewDecision(prev => ({ ...prev, decision: 'approved' }))}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={reviewDecision.decision === 'changes_requested' ? 'default' : 'outline'}
                  className={reviewDecision.decision === 'changes_requested' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  onClick={() => setReviewDecision(prev => ({ ...prev, decision: 'changes_requested' }))}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  variant={reviewDecision.decision === 'rejected' ? 'default' : 'outline'}
                  className={reviewDecision.decision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => setReviewDecision(prev => ({ ...prev, decision: 'rejected' }))}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
              
              <div className="overall-score">
                <span className="score-label">Overall Score:</span>
                <span className="score-value">{calculateOverallScore()}/100</span>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${calculateOverallScore()}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="feedback-section">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="feedback-categories">
              {['content', 'quality', 'compliance', 'usability', 'technical'].map(category => {
                const existingFeedback = reviewDecision.feedback?.find(f => f.category === category);
                return (
                  <div key={category} className="feedback-category">
                    <div className="category-header">
                      <h4 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <div className="rating-controls">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            className={`rating-star ${(existingFeedback?.rating || 0) >= rating ? 'active' : ''}`}
                            onClick={() => updateFeedback(category, { rating })}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder={`Comments for ${category}...`}
                      value={existingFeedback?.comments || ''}
                      onChange={(e) => updateFeedback(category, { comments: e.target.value })}
                      className="feedback-textarea"
                      rows={3}
                    />
                    
                    <div className="feedback-options">
                      <label className="blocking-checkbox">
                        <input
                          type="checkbox"
                          checked={existingFeedback?.is_blocking || false}
                          onChange={(e) => updateFeedback(category, { is_blocking: e.target.checked })}
                        />
                        <span>Blocking issue</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="comments-section">
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="comment-inputs">
              <div className="comment-group">
                <label className="comment-label">Public Comments (visible to submitter)</label>
                <Textarea
                  placeholder="Provide clear feedback for the submitter..."
                  value={reviewDecision.public_comments || ''}
                  onChange={(e) => setReviewDecision(prev => ({ ...prev, public_comments: e.target.value }))}
                  className="public-comments"
                  rows={4}
                  required
                />
              </div>
              
              <div className="comment-group">
                <label className="comment-label">Private Notes (internal only)</label>
                <Textarea
                  placeholder="Internal notes for other reviewers or administrators..."
                  value={reviewDecision.private_notes || ''}
                  onChange={(e) => setReviewDecision(prev => ({ ...prev, private_notes: e.target.value }))}
                  className="private-notes"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="follow-up-section">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="follow-up-options">
              <label className="follow-up-checkbox">
                <input
                  type="checkbox"
                  checked={reviewDecision.follow_up_required || false}
                  onChange={(e) => setReviewDecision(prev => ({ 
                    ...prev, 
                    follow_up_required: e.target.checked 
                  }))}
                />
                <span>Follow-up required</span>
              </label>
              
              {reviewDecision.follow_up_required && (
                <div className="follow-up-details">
                  <input
                    type="date"
                    value={reviewDecision.follow_up_date ? 
                      reviewDecision.follow_up_date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setReviewDecision(prev => ({ 
                      ...prev, 
                      follow_up_date: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                    className="follow-up-date"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper functions
  const getTypeColor = (type: string) => {
    const colors = {
      template_submission: 'bg-blue-100 text-blue-800',
      verification_request: 'bg-green-100 text-green-800',
      policy_violation: 'bg-red-100 text-red-800',
      content_appeal: 'bg-purple-100 text-purple-800',
      marketplace_listing: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatItemType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`unified-review-interface ${className}`}>
      <div className="review-header">
        <div className="header-nav">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
          
          <div className="header-actions">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmitDecision}
              disabled={!reviewDecision.decision || !reviewDecision.public_comments?.trim()}
              className="submit-decision"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Decision
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="review-tabs">
        <TabsList className="review-tab-list">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="content" className="tab-content">
          {renderContentTab()}
        </TabsContent>

        <TabsContent value="review" className="tab-content">
          {renderReviewTab()}
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .unified-review-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .review-header {
          background: white;
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .submit-decision {
          background: #059669;
          color: white;
        }

        .submit-decision:hover {
          background: #047857;
        }

        .submit-decision:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .review-tabs {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .review-tab-list {
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 32px;
        }

        .tab-content {
          margin: 0;
          padding: 0;
        }

        /* Overview Tab Styles */
        .overview-header {
          margin-bottom: 24px;
        }

        .item-info {
          margin-bottom: 16px;
        }

        .item-type-badge {
          margin-bottom: 8px;
        }

        .item-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .item-description {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .template-insights, .verification-insights {
          margin-top: 24px;
          border: 1px solid #e5e7eb;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .insight-label {
          font-size: 14px;
          color: #6b7280;
          display: block;
        }

        .insight-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          display: block;
        }

        .verification-progress {
          space-y: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #1f2937;
        }

        .criteria-list {
          space-y: 8px;
        }

        .criterion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .criterion-status {
          flex-shrink: 0;
        }

        .criterion-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .criterion-name {
          font-size: 14px;
          color: #374151;
        }

        /* Content Tab Styles */
        .content-review {
          space-y: 24px;
        }

        .content-tabs {
          border: 1px solid #e5e7eb;
        }

        .graph-preview {
          max-height: 400px;
          overflow: auto;
          background: #f8fafc;
          border-radius: 6px;
          padding: 16px;
        }

        .graph-json {
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #374151;
          white-space: pre-wrap;
          margin: 0;
        }

        .validation-list {
          space-y: 12px;
        }

        .validation-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
        }

        .validation-item.severity-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .validation-item.severity-warning {
          background: #fffbeb;
          border: 1px solid #fed7aa;
        }

        .validation-item.severity-info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .validation-icon {
          flex-shrink: 0;
        }

        .validation-content {
          flex: 1;
        }

        .validation-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }

        .validation-category {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
        }

        .validation-message {
          font-size: 14px;
          color: #374151;
          margin: 4px 0;
        }

        .validation-field {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .document-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .document-preview {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          overflow: hidden;
        }

        .document-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .document-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
        }

        .document-type {
          font-size: 12px;
          font-weight: 600;
        }

        .document-info {
          padding: 12px;
        }

        .document-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          word-break: break-word;
        }

        .document-size {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .document-actions {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .document-controls {
          display: flex;
          justify-content: center;
          padding: 16px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .zoom-level {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          min-width: 50px;
          text-align: center;
        }

        /* Review Tab Styles */
        .review-decision {
          space-y: 24px;
        }

        .decision-options {
          space-y: 16px;
        }

        .decision-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .overall-score {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .score-label {
          font-size: 14px;
          color: #6b7280;
        }

        .score-value {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .score-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
          transition: width 0.3s;
        }

        .feedback-categories {
          space-y: 20px;
        }

        .feedback-category {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .rating-controls {
          display: flex;
          gap: 4px;
        }

        .rating-star {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;
          color: #d1d5db;
        }

        .rating-star:hover {
          color: #fbbf24;
        }

        .rating-star.active {
          color: #f59e0b;
        }

        .feedback-textarea {
          width: 100%;
          margin-bottom: 8px;
          resize: vertical;
        }

        .feedback-options {
          display: flex;
          align-items: center;
        }

        .blocking-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .comment-inputs {
          space-y: 20px;
        }

        .comment-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comment-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .public-comments, .private-notes {
          width: 100%;
          resize: vertical;
        }

        .follow-up-options {
          space-y: 12px;
        }

        .follow-up-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .follow-up-details {
          padding-left: 24px;
        }

        .follow-up-date {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }

        .history-list {
          space-y: 16px;
        }

        .history-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .review-comments {
          color: #374151;
          margin: 8px 0;
        }

        .review-suggestions {
          margin: 8px 0 0 20px;
          color: #6b7280;
          font-size: 14px;
        }

        .review-suggestions li {
          margin-bottom: 4px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .unified-review-interface {
            padding: 16px;
          }

          .header-nav {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: stretch;
          }

          .item-title {
            font-size: 20px;
          }

          .metadata-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .decision-buttons {
            flex-direction: column;
          }

          .overall-score {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .category-header {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
            text-align: center;
          }

          .documents-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UnifiedReviewInterface;