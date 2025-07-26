/**
 * Verification Queue Interface - E17-1753114397393-BA8A32
 * 
 * Detailed admin review workflow for verification requests
 * Part of Epic 17.5.5 - Verification System
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Mail,
  Phone,
  FileText,
  Award,
  Camera,
  ExternalLink,
  MessageSquare,
  Flag,
  Calendar,
  MapPin,
  Smartphone,
  Globe,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';
import type { 
  IdentityValidationRequest, 
  ValidationResult, 
  IdentityValidationType,
  ValidationStatus,
  IdentityValidationData 
} from '../../auth/IdentityValidation';

export interface VerificationQueueProps {
  request: IdentityValidationRequest;
  onBack: () => void;
  onStatusUpdate: (requestId: string, status: ValidationStatus, notes?: string) => void;
  onRequestUpdate?: (requestId: string, updates: Partial<IdentityValidationRequest>) => void;
  className?: string;
}

export interface ReviewDecision {
  status: ValidationStatus;
  reviewNotes: string;
  nextSteps: string[];
  flagged: boolean;
  requiresSeniorReview: boolean;
  confidenceLevel: number;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  request,
  onBack,
  onStatusUpdate,
  onRequestUpdate,
  className = ''
}) => {
  const [_____activeSection, _____setActiveSection] = useState('details');
  const [reviewDecision, setReviewDecision] = useState<Partial<ReviewDecision>>({
    status: 'pending',
    reviewNotes: '',
    nextSteps: [],
    flagged: false,
    requiresSeniorReview: false,
    confidenceLevel: 80
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getVerificationTypeIcon = (type: IdentityValidationType) => {
    const icons = {
      email_verification: Mail,
      phone_verification: Phone,
      government_id: FileText,
      professional_credentials: Award,
      portfolio_verification: Camera,
      social_media_verification: ExternalLink,
      basic_profile: User,
      industry_affiliation: Award,
      address_verification: MapPin,
      payment_method_verification: FileText
    };
    return icons[type] || FileText;
  };

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
    case 'approved': return 'text-green-600 bg-green-100';
    case 'rejected': return 'text-red-600 bg-red-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'in_review': return 'text-blue-600 bg-blue-100';
    case 'requires_update': return 'text-orange-600 bg-orange-100';
    case 'expired': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSubmitDecision = async () => {
    if (!reviewDecision.status || !reviewDecision.reviewNotes) {
      alert('Please provide a status and review notes before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusUpdate(request.requestId, reviewDecision.status!, reviewDecision.reviewNotes);
      onBack();
    } catch (error) {
      console.error('Error submitting review decision:', error);
      alert('Error submitting review decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRequestDetails = () => {
    const Icon = getVerificationTypeIcon(request.type);
    
    return (
      <Card className="request-details">
        <CardHeader>
          <div className="details-header">
            <Icon className="w-6 h-6 text-blue-500" />
            <div>
              <CardTitle>Verification Request Details</CardTitle>
              <p className="text-sm text-gray-600">
                {request.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Verification
              </p>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Request ID</span>
              <span className="detail-value">{request.requestId}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">{request.userId}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Submitted</span>
              <span className="detail-value">
                {new Date(request.timestamp).toLocaleString()}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Request Source</span>
              <span className="detail-value">
                {request.metadata.requestSource.replace('_', ' ')}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Time in Queue</span>
              <span className="detail-value">
                {Math.round((Date.now() - request.timestamp) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUserProfile = () => (
    <Card className="user-profile">
      <CardHeader>
        <CardTitle>User Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="profile-grid">
          {request.data.fullName && (
            <div className="profile-item">
              <User className="w-4 h-4 text-gray-400" />
              <span className="profile-label">Full Name</span>
              <span className="profile-value">{request.data.fullName}</span>
            </div>
          )}
          
          {request.data.email && (
            <div className="profile-item">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="profile-label">Email</span>
              <span className="profile-value">{request.data.email}</span>
            </div>
          )}
          
          {request.data.phoneNumber && (
            <div className="profile-item">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="profile-label">Phone</span>
              <span className="profile-value">{request.data.phoneNumber}</span>
            </div>
          )}
          
          {request.data.dateOfBirth && (
            <div className="profile-item">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="profile-label">Date of Birth</span>
              <span className="profile-value">{request.data.dateOfBirth}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationData = () => {
    switch (request.type) {
    case 'government_id':
      return renderGovernmentIdData();
    case 'professional_credentials':
      return renderProfessionalCredentialsData();
    case 'social_media_verification':
      return renderSocialMediaData();
    default:
      return renderGenericVerificationData();
    }
  };

  const renderGovernmentIdData = () => {
    const govId = request.data.governmentId;
    if (!govId) return null;

    return (
      <Card className="verification-data">
        <CardHeader>
          <CardTitle>Government ID Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Document Type</span>
              <span className="data-value">{govId.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            
            <div className="data-item">
              <span className="data-label">Document Number</span>
              <span className="data-value">{govId.number}</span>
            </div>
            
            <div className="data-item">
              <span className="data-label">Expiration Date</span>
              <span className="data-value">{govId.expirationDate}</span>
            </div>
            
            <div className="data-item">
              <span className="data-label">Issuing Authority</span>
              <span className="data-value">{govId.issuingAuthority}</span>
            </div>
          </div>
          
          {govId.documentImages && govId.documentImages.length > 0 && (
            <div className="document-images">
              <h4>Uploaded Documents</h4>
              <div className="images-grid">
                {govId.documentImages.map((image, index) => (
                  <div key={index} className="image-item">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <span>Document {index + 1}</span>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProfessionalCredentialsData = () => {
    const credentials = request.data.professionalCredentials;
    if (!credentials) return null;

    return (
      <Card className="verification-data">
        <CardHeader>
          <CardTitle>Professional Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Role</span>
              <span className="data-value">{credentials.role}</span>
            </div>
            
            <div className="data-item">
              <span className="data-label">Experience Level</span>
              <span className="data-value">{credentials.experience}</span>
            </div>
          </div>
          
          {credentials.credentials && credentials.credentials.length > 0 && (
            <div className="credentials-list">
              <h4>Credentials</h4>
              {credentials.credentials.map((cred, index) => (
                <div key={index} className="credential-item">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <div className="credential-info">
                    <span className="credential-title">{cred.title}</span>
                    <span className="credential-details">
                      {cred.institution} • {cred.year}
                    </span>
                  </div>
                  <Badge className={getStatusColor(cred.verificationStatus)}>
                    {cred.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {credentials.portfolio && credentials.portfolio.length > 0 && (
            <div className="portfolio-list">
              <h4>Portfolio Items</h4>
              {credentials.portfolio.map((item, index) => (
                <div key={index} className="portfolio-item">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <div className="portfolio-info">
                    <span className="portfolio-title">{item.title}</span>
                    <span className="portfolio-details">
                      {item.type} • {item.year} • {item.role}
                    </span>
                  </div>
                  {item.url && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSocialMediaData = () => {
    const profiles = request.data.socialMediaProfiles;
    if (!profiles) return null;

    return (
      <Card className="verification-data">
        <CardHeader>
          <CardTitle>Social Media Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="profiles-list">
            {profiles.map((profile, index) => (
              <div key={index} className="profile-item">
                <Globe className="w-4 h-4 text-blue-500" />
                <div className="profile-info">
                  <span className="profile-platform">{profile.platform.toUpperCase()}</span>
                  <span className="profile-url">{profile.url}</span>
                  {profile.followerCount && (
                    <span className="profile-followers">
                      {profile.followerCount.toLocaleString()} followers
                    </span>
                  )}
                </div>
                <Badge className={profile.verified ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}>
                  {profile.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGenericVerificationData = () => (
    <Card className="verification-data">
      <CardHeader>
        <CardTitle>Verification Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Generic verification data display for {request.type}</p>
        <pre className="data-dump">
          {JSON.stringify(request.data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );

  const renderMetadata = () => (
    <Card className="metadata">
      <CardHeader>
        <CardTitle>Request Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="metadata-grid">
          <div className="metadata-item">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="metadata-label">User Agent</span>
            <span className="metadata-value">{request.metadata.userAgent}</span>
          </div>
          
          <div className="metadata-item">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="metadata-label">IP Address</span>
            <span className="metadata-value">{request.metadata.ipAddress}</span>
          </div>
          
          <div className="metadata-item">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="metadata-label">Session ID</span>
            <span className="metadata-value">{request.metadata.sessionId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReviewSection = () => (
    <Card className="review-section">
      <CardHeader>
        <CardTitle>Review Decision</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="review-form">
          <div className="form-group">
            <label>Decision</label>
            <select
              value={reviewDecision.status || 'pending'}
              onChange={(e) => setReviewDecision(prev => ({ 
                ...prev, 
                status: e.target.value as ValidationStatus 
              }))}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="requires_update">Requires Update</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Review Notes *</label>
            <Textarea
              value={reviewDecision.reviewNotes || ''}
              onChange={(e) => setReviewDecision(prev => ({ 
                ...prev, 
                reviewNotes: e.target.value 
              }))}
              placeholder="Provide detailed notes about your review decision..."
              rows={4}
              className="form-textarea"
            />
          </div>
          
          <div className="form-group">
            <label>Confidence Level</label>
            <div className="confidence-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={reviewDecision.confidenceLevel || 80}
                onChange={(e) => setReviewDecision(prev => ({ 
                  ...prev, 
                  confidenceLevel: parseInt(e.target.value) 
                }))}
                className="slider"
              />
              <span className="confidence-value">{reviewDecision.confidenceLevel || 80}%</span>
            </div>
          </div>
          
          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reviewDecision.flagged || false}
                onChange={(e) => setReviewDecision(prev => ({ 
                  ...prev, 
                  flagged: e.target.checked 
                }))}
              />
              <Flag className="w-4 h-4 text-red-500" />
              Flag for attention
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reviewDecision.requiresSeniorReview || false}
                onChange={(e) => setReviewDecision(prev => ({ 
                  ...prev, 
                  requiresSeniorReview: e.target.checked 
                }))}
              />
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Requires senior review
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`verification-queue ${className}`}>
      <div className="queue-header">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
        
        <div className="header-actions">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="queue-content">
        <div className="content-main">
          {renderRequestDetails()}
          {renderUserProfile()}
          {renderVerificationData()}
          {renderMetadata()}
        </div>
        
        <div className="content-sidebar">
          {renderReviewSection()}
          
          <div className="action-buttons">
            <Button 
              onClick={handleSubmitDecision}
              disabled={isSubmitting || !reviewDecision.status || !reviewDecision.reviewNotes}
              className="submit-button"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Decision
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .verification-queue {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .queue-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1.5rem;
        }

        .content-main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .content-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        .profile-grid, .data-grid, .metadata-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-item, .data-item, .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .profile-label, .data-label, .metadata-label {
          font-weight: 500;
          color: #374151;
          min-width: 100px;
        }

        .profile-value, .data-value, .metadata-value {
          color: #1f2937;
          flex: 1;
        }

        .document-images, .credentials-list, .portfolio-list, .profiles-list {
          margin-top: 1rem;
        }

        .document-images h4, .credentials-list h4, .portfolio-list h4 {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .image-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .credential-item, .portfolio-item, .profile-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .credential-info, .portfolio-info, .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .credential-title, .portfolio-title, .profile-platform {
          font-weight: 600;
          color: #1f2937;
        }

        .credential-details, .portfolio-details, .profile-url, .profile-followers {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .data-dump {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          overflow-x: auto;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
        }

        .form-select, .form-textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .confidence-slider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .slider {
          flex: 1;
        }

        .confidence-value {
          font-weight: 600;
          color: #1f2937;
          min-width: 40px;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .action-buttons {
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          background: #059669;
          border-color: #059669;
        }

        .submit-button:hover:not(:disabled) {
          background: #047857;
          border-color: #047857;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .queue-content {
            grid-template-columns: 1fr;
          }
          
          .content-sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .queue-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationQueue;