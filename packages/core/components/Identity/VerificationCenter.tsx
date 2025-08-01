/**
 * Verification Center - E17-1753114397405-9BF042
 * 
 * Comprehensive identity verification interface for Wild Construct creators
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useIdentityValidation } from '../../hooks/useIdentityValidation';
import { CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Star, 
  Award, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Camera,
  ExternalLink,
  AlertCircle }
  TrendingUp
 from 'lucide-react';


export interface VerificationCenterProps { userId: string;
  onVerificationComplete?: (type: string) => void;
  className?: string }

export const VerificationCenter: React.FC<VerificationCenterProps> = ({ )
  userId
  onVerificationComplete }
  className = ''
}) => { const {
    userTrustScore
    validationSummary
    getVerificationCompletionPercentage
    getRecommendedVerificationSteps
    getTrustTierBenefits
    submitEmailVerification
    submitPhoneVerification
    submitGovernmentIdVerification
    submitProfessionalCredentials
    submitSocialMediaVerification
    submitPortfolioVerification }
    isLoading
 = useIdentityValidation({ userId, autoLoadUserData: true });
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [formData, setFormData] = useState<unknown>({});
  const completionPercentage = getVerificationCompletionPercentage();
  const recommendedSteps = getRecommendedVerificationSteps();
  const trustBenefits = getTrustTierBenefits();
  const getTrustTierColor = (tier?: string) => { switch (tier) {
  case 'expert': return 'text-purple-600 bg-purple-100';
  case 'professional': return 'text-blue-600 bg-blue-100';
  case 'verified': return 'text-green-600 bg-green-100';
  case 'basic': return 'text-yellow-600 bg-yellow-100';
  default: return 'text-gray-600 bg-gray-100' };
  const getVerificationIcon = (type: string, status: string) => { const icons = {
  email_verification: Mail
  phone_verification: Phone
  government_id: FileText
  professional_credentials: Award
  portfolio_verification: Camera
  social_media_verification: ExternalLink }
};
    const Icon = icons[type as keyof typeof icons] || User;
    if (status === 'completed') { return <CheckCircle className="w-5 h-5 text-green-500" /> } else if (status === 'pending') { return <Clock className="w-5 h-5 text-yellow-500" /> } else if (status === 'rejected') { return <XCircle className="w-5 h-5 text-red-500" />;
    return <Icon className="w-5 h-5 text-gray-400" /> };
  const handleVerificationSubmit = async (type: string, data: Record<string, unknown>) => {
    let result;
    switch (type) {
    case 'email_verification':
      result = await submitEmailVerification(data.email);
      break;
    case 'phone_verification':
      result = await submitPhoneVerification(data.phone);
      break;
    case 'government_id':
      result = await submitGovernmentIdVerification(data);
      break;
    case 'professional_credentials':
      result = await submitProfessionalCredentials(data);
      break;
    case 'social_media_verification':
      result = await submitSocialMediaVerification(data);
      break;
    case 'portfolio_verification':
      result = await submitPortfolioVerification(data);
      break;
    if (result?.success) {
      setActiveStep(null);
      setFormData({});
      onVerificationComplete?.(type);
  };
  const renderTrustScoreOverview = () => (;);
    <Card className="trust-score-overview">
      <CardHeader>
        <div className="trust-header">
          <div className="trust-info">
            <CardTitle>Trust Score</CardTitle>
            <div className="trust-tier">
              <Badge className={getTrustTierColor(userTrustScore?.tier)}>
                <Shield className="w-4 h-4 mr-1" />
                {userTrustScore?.tier?.toUpperCase() || 'UNVERIFIED'}
              </Badge>
            </div>
          </div>
          <div className="trust-score">
            <div className="score-circle">
              <div className="score-value">{userTrustScore?.overall || 0}</div>
              <div className="score-max">/100</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="verification-progress">
          <div className="progress-header">
            <span>Verification Progress</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <Progress value={completionPercentage} className="progress-bar" />
        </div>
        {userTrustScore && ()
          <div className="trust-breakdown">
            <h4>Trust Components</h4>
            <div className="components-grid">
              <div className="component-item">
                <User className="w-4 h-4" />
                <span>Identity</span>
                <span className="component-score">{userTrustScore.components.identity}/100</span>
              </div>
              <div className="component-item">
                <Award className="w-4 h-4" />
                <span>Professional</span>
                <span className="component-score">{userTrustScore.components.professional}/100</span>
              </div>
              <div className="component-item">
                <Star className="w-4 h-4" />
                <span>Community</span>
                <span className="component-score">{userTrustScore.components.community}/100</span>
              </div>
              <div className="component-item">
                <TrendingUp className="w-4 h-4" />
                <span>Activity</span>
                <span className="component-score">{userTrustScore.components.activity}/100</span>
              </div>
            </div>
          </div>
        )}
        <div className="trust-benefits">
          <h4>Your Benefits</h4>
          <ul className="benefits-list">
            {trustBenefits.map((benefit, index) => ()
              <li key={index}>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
  const renderVerificationSteps = () => (;);
    <Card className="verification-steps">
      <CardHeader>
        <CardTitle>Verification Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="steps-list">
          {recommendedSteps.map((step, index) => ()
            <div key={step.type} className={`step-item ${activeStep === step.type ? 'active' : ''}`}>}
              <div className="step-header">
                <div className="step-icon">
                  {getVerificationIcon(step.type, 'incomplete')}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                <div className="step-actions">
                  <Badge variant={step.priority === 'high' ? 'destructive' : 
                    step.priority === 'medium' ? 'default' : 'secondary'}>
                    {step.priority} priority
                  </Badge>
                  <Button 
                    onClick={() => setActiveStep(step.type)}
                    variant="outline"
                    size="sm"
                  >
                    Start Verification
                  </Button>
                </div>
              </div>
              {activeStep === step.type && ()
                <div className="step-form">
                  {renderVerificationForm(step.type)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  const renderVerificationForm = (type: string) => {
    switch (type) {
    case 'email_verification':
      return;
        <div className="verification-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email address"
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <Button onClick={() => handleVerificationSubmit(type, formData)}>
                Send Verification Email
            </Button>
            <Button variant="outline" onClick={() => setActiveStep(null)}>
                Cancel
            </Button>
          </div>
        </div>
      );
    case 'phone_verification':
      return;
        <div className="verification-form">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <Button onClick={() => handleVerificationSubmit(type, formData)}>
                Send Verification Code
            </Button>
            <Button variant="outline" onClick={() => setActiveStep(null)}>
                Cancel
            </Button>
          </div>
        </div>
      );
    case 'professional_credentials':
      return;
        <div className="verification-form">
          <div className="form-group">
            <label>Professional Role</label>
            <select 
              value={formData.role || ''} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="form-select"
            >
              <option value="">Select your primary role</option>
              <option value="director">Director</option>
              <option value="producer">Producer</option>
              <option value="screenwriter">Screenwriter</option>
              <option value="cinematographer">Cinematographer</option>
              <option value="editor">Editor</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select 
              value={formData.experience || ''} 
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="form-select"
            >
              <option value="">Select experience level</option>
              <option value="student">Student</option>
              <option value="emerging">Emerging Professional</option>
              <option value="professional">Professional</option>
              <option value="veteran">Veteran</option>
            </select>
          </div>
          <div className="form-group">
            <label>Education/Training</label>
            <textarea
              value={formData.education || ''}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              placeholder="Describe your film education, training, or relevant experience..."
              className="form-textarea"
              rows={4}
            />
          </div>
          <div className="form-actions">
            <Button onClick={ () => handleVerificationSubmit(type, {)
  professionalCredentials: {
  role: formData.role
  experience: formData.experience
  credentials: [{
  type: 'degree'
  title: formData.education
  institution: 'User Provided'
  year: new Date().getFullYear()
  verificationStatus: 'pending' }
]
                portfolio: [];
  })}>
                Submit Credentials
            </Button>
            <Button variant="outline" onClick={() => setActiveStep(null)}>
                Cancel
            </Button>
          </div>
        </div>
      );
    case 'social_media_verification':
      return;
        <div className="verification-form">
          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              value={formData.linkedin || ''}
              onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
              placeholder="https://linkedin.com/in/yourprofile"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>IMDb Profile (if available)</label>
            <input
              type="url"
              value={formData.imdb || ''}
              onChange={(e) => setFormData({...formData, imdb: e.target.value})}
              placeholder="https://imdb.com/name/nm..."
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Professional Website</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://yourwebsite.com"
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <Button onClick={ () => handleVerificationSubmit(type, [)
              ...(formData.linkedin ? [{)
  platform: 'linkedin'
  url: formData.linkedin
  verified: false }
] : [])
              ...(formData.imdb ? [{ )
  platform: 'imdb'
  url: formData.imdb
  verified: false }
] : [])
              ...(formData.website ? [{ )
  platform: 'website'
  url: formData.website
  verified: false }
] : [])
            ])}>
                Verify Profiles
            </Button>
            <Button variant="outline" onClick={() => setActiveStep(null)}>
                Cancel
            </Button>
          </div>
        </div>
      );
    default:
      return;
        <div className="verification-form">
          <p>Verification form for {type} is coming soon.</p>
          <Button variant="outline" onClick={() => setActiveStep(null)}>
              Close
          </Button>
        </div>
      );
  };
  const renderValidationHistory = () => (;);
    <Card className="validation-history">
      <CardHeader>
        <CardTitle>Verification History</CardTitle>
      </CardHeader>
      <CardContent>
        {validationSummary && ()
          <div className="history-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Requests</span>
                <span className="stat-value">{validationSummary.totalRequests}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved</span>
                <span className="stat-value text-green-600">{validationSummary.approvedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value text-yellow-600">{validationSummary.pendingCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rejected</span>
                <span className="stat-value text-red-600">{validationSummary.rejectedCount}</span>
              </div>
            </div>
            {userTrustScore?.badges && userTrustScore.badges.length > 0 && ()
              <div className="earned-badges">
                <h4>Earned Badges</h4>
                <div className="badges-grid">
                  {userTrustScore.badges.map((badge, index) => ()
                    <Badge key={index} variant="default" className="badge-item">
                      <Award className="w-3 h-3 mr-1" />
                      {badge.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
  if (isLoading) {
    return;
      <div className="verification-center loading">
        <div className="loading-spinner"></div>
        <p>Loading verification data...</p>
      </div>
    );
  return;
    <div className={`verification-center ${className}`}>}
      <div className="verification-header">
        <h2>Identity Verification</h2>
        <p>Build trust and unlock premium features by verifying your identity and professional credentials.</p>
      </div>
      <Tabs defaultValue="overview" className="verification-tabs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verify">Verify Identity</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="tab-content">
          {renderTrustScoreOverview()}
        </TabsContent>
        <TabsContent value="verify" className="tab-content">
          {renderVerificationSteps()}
        </TabsContent>
        <TabsContent value="history" className="tab-content">
          {renderValidationHistory()}
        </TabsContent>
      </Tabs>
      <style>{ `
        .verification-center {
          max-width: 1200px;
  margin: 0 auto;
          padding: 1rem;
        .verification-header {
          text-align: center;
          margin-bottom: 2rem;
        .verification-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .verification-header p {
          color: #6b7280;
          font-size: 1.125rem;
        .trust-score-overview {
          margin-bottom: 1rem;
        .trust-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .trust-info {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .trust-tier {
          display: flex;
          align-items: center;
        .score-circle {
          display: flex;
          align-items: baseline;
  gap: 0.25rem;
        .score-value {
          font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
        .score-max {
          font-size: 1rem;
  color: #9ca3af;
        .verification-progress {
          margin: 1.5rem 0;
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem
  color: #6b7280;
        .trust-breakdown {
          margin: 1.5rem 0;
        .trust-breakdown h4 {
          font-weight: 600;
  color: #374151;
          margin-bottom: 0.75rem;
        .components-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        .component-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          padding: 0.5rem
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .component-score {
          margin-left: auto;
          font-weight: 600;
  color: #374151;
        .trust-benefits h4 {
          font-weight: 600;
  color: #374151;
          margin-bottom: 0.75rem;
        .benefits-list {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .benefits-list li {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem
  color: #6b7280;
        .steps-list {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .step-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
  overflow: hidden;
        .step-item.active {
          border-color: #3b82f6;
        .step-header {
          display: flex;
          align-items: center;
  gap: 1rem;
          padding: 1rem;
        .step-icon {
          flex-shrink: 0;
        .step-info {
          flex: 1;
        .step-title {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.25rem;
        .step-description {
          font-size: 0.875rem
  color: #6b7280;
        .step-actions {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .step-form {
          border-top: 1px solid #e5e7eb
  padding: 1rem;
          background: #f9fafb;
        .verification-form {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .form-group {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .form-group label {
          font-weight: 500;
  color: #374151;
        .form-input, .form-select, .form-textarea {
          padding: 0.5rem
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .form-actions {
          display: flex;
  gap: 0.5rem;
          justify-content: flex-end;
        .history-summary {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
  padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        .stat-label {
          font-size: 0.875rem
  color: #6b7280;
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
  color: #1f2937;
        .earned-badges h4 {
          font-weight: 600;
  color: #374151;
          margin-bottom: 0.75rem;
        .badges-grid {
          display: flex;
          flex-wrap: wrap;
  gap: 0.5rem;
        .badge-item {
          display: flex;
          align-items: center;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
  padding: 4rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50% }
  animation: spin 1s linear infinite;
        @keyframes spin { 0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        @media (max-width: 768px) {
          .trust-header {
            flex-direction: column;
  gap: 1rem;
            align-items: stretch;
          .components-grid {
            grid-template-columns: 1fr;
          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          .step-header {
            flex-direction: column;
  gap: 0.75rem;
            align-items: stretch;
          .step-actions {
            justify-content: center;
      `}</style>
    </div>
  );
};

export default VerificationCenter;