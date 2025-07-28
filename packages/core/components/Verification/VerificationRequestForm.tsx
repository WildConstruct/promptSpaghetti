/**
 * Verification Request Form - E17-1753114397395-B624E7
 * 
 * Main component for submitting verification requests.
 * Handles different verification types and guides users through the process.
 */
import React, { useState, useCallback } from 'react';
import { IdentityValidationType, IdentityValidationData } from '../../auth/IdentityValidation';
interface VerificationRequestFormProps {
  userId: string;
  onSubmit: (),
    type: IdentityValidationType,
    data: Partial<IdentityValidationData>,
  ) => Promise<{ requestId: string; status: string }>;
  onCancel?: () => void;
}
interface FormStep {
  id: string;
  title: string;
  description: string;
  verificationType: IdentityValidationType;
  required: boolean;
}
const VERIFICATION_STEPS: FormStep[] = [
  {
    id: 'email',
    title: 'Email Verification',
    description: 'Verify your email address to establish basic identity',
    verificationType: 'email_verification',
    required: true,
  },
  {
    id: 'phone',
    title: 'Phone Verification',
    description: 'Verify your phone number for additional security',
    verificationType: 'phone_verification',
    required: false,
  },
  {
    id: 'identity',
    title: 'Government ID',
    description: 'Upload government-issued identification for identity verification',
    verificationType: 'government_id',
    required: false,
  },
  {
    id: 'professional',
    title: 'Professional Credentials',
    description: 'Submit your professional credentials and portfolio',
    verificationType: 'professional_credentials',
    required: false,
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Link and verify your professional social media profiles',
    verificationType: 'social_media_verification',
    required: false,
  }
];

export const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({)
  userId,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<string>('email');
  const [formData, setFormData] = useState<Partial<IdentityValidationData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const currentStepData = VERIFICATION_STEPS.find(step => step.id === currentStep);
  const handleStepSubmit = useCallback(async (stepData: Partial<IdentityValidationData>) => {
    if (!currentStepData) return;
    setIsSubmitting(true);
    setSubmitErrors([]);
    try {
      // Update form data
      setFormData(prev => ({ ...prev, ...stepData }));
      // Move to next step or complete
      const currentIndex = VERIFICATION_STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex < VERIFICATION_STEPS.length - 1) {
        setCurrentStep(VERIFICATION_STEPS[currentIndex + 1].id);
      }
    } catch (error) {
      setSubmitErrors([`Failed to submit ${currentStepData.title}: ${error.message}`]);}
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, currentStepData, onSubmit]);
  const handleStepSelect = useCallback((stepId: string) => {
    setCurrentStep(stepId);
    setSubmitErrors([]);
  }, []);
  if (!currentStepData) {
    return <div className="verification-error">Invalid verification step</div>;
  }
  return ()
    <div className="verification-request-form">
      <div className="verification-header">
        <h2>Account Verification</h2>
        <p>Complete verification to build trust and unlock marketplace features</p>
      </div>
      {/* Progress Steps */}
      <div className="verification-steps">
        {VERIFICATION_STEPS.map((step, index) => ()
          <div
            key={step.id}
            className={`step ${step.id === currentStep ? 'active' : ''} ${}
              VERIFICATION_STEPS.findIndex(s => s.id === currentStep) > index ? 'completed' : ''
            }`}
            onClick={() => handleStepSelect(step.id)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              {step.required && <span className="required">Required</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Current Step Content */}
      <div className="verification-content">
        <div className="step-header">
          <h3>{currentStepData.title}</h3>
          <p>{currentStepData.description}</p>
        </div>
        {submitErrors.length > 0 && ()
          <div className="error-messages">
            {submitErrors.map((error, index) => ()
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}
        <VerificationStepContent
          step={currentStepData}
          data={formData}
          onSubmit={handleStepSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      {/* Navigation */}
      <div className="verification-navigation">
        {onCancel && ()
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <div className="nav-info">
          Step {VERIFICATION_STEPS.findIndex(s => s.id === currentStep) + 1} of {VERIFICATION_STEPS.length}
        </div>
      </div>
      <style>{`
        .verification-request-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .verification-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .verification-header h2 {
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        .verification-header p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }
        .verification-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding: 0 20px;
        }
        .step {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          transition: background-color 0.2s;
          min-width: 140px;
        }
        .step:hover {
          background-color: #f3f4f6;
        }
        .step.active {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
        }
        .step.completed .step-number {
          background-color: #10b981;
          color: white;
        }
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .step.active .step-number {
          background-color: #3b82f6;
          color: white;
        }
        .step-info {
          flex: 1;
        }
        .step-title {
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
          margin-bottom: 2px;
        }
        .required {
          background-color: #fef2f2;
          color: #dc2626;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
        .verification-content {
          margin-bottom: 32px;
        }
        .step-header {
          margin-bottom: 24px;
        }
        .step-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        .step-header p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .error-messages {
          margin-bottom: 20px;
        }
        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #dc2626;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .verification-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .nav-info {
          color: #6b7280;
          font-size: 14px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .verification-error {
          text-align: center;
          color: #dc2626;
          padding: 40px;
        }
        @media (max-width: 768px) {
          .verification-request-form {
            padding: 16px;
          }
          .verification-steps {
            flex-direction: column;
            gap: 8px;
          }
          .step {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Step Content Component
interface VerificationStepContentProps {
  step: FormStep;
  data: Partial<IdentityValidationData>;
  onSubmit: (data: Partial<IdentityValidationData>) => Promise<void>;
  isSubmitting: boolean;
}
const VerificationStepContent: React.FC<VerificationStepContentProps> = ({)
  step,
  data,
  onSubmit,
  isSubmitting
}) => {
  const [stepData, setStepData] = useState<Partial<IdentityValidationData>>(data);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(stepData);
  }, [stepData, onSubmit]);
  const updateStepData = useCallback((updates: Partial<IdentityValidationData>) => {
    setStepData(prev => ({ ...prev, ...updates }));
  }, []);
  switch (step.verificationType) {
  case 'email_verification':
    return ()
      <EmailVerificationStep
        data={stepData}
        onUpdate={updateStepData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  case 'phone_verification':
    return ()
      <PhoneVerificationStep
        data={stepData}
        onUpdate={updateStepData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  case 'government_id':
    return ()
      <GovernmentIdStep
        data={stepData}
        onUpdate={updateStepData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  case 'professional_credentials':
    return ()
      <ProfessionalCredentialsStep
        data={stepData}
        onUpdate={updateStepData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  case 'social_media_verification':
    return ()
      <SocialMediaStep
        data={stepData}
        onUpdate={updateStepData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  default:
    return <div>Unknown verification type</div>;
  }
};

// Individual Step Components (simplified for now - will be expanded)
const EmailVerificationStep: React.FC<{
  data: Partial<IdentityValidationData>;
  onUpdate: (data: Partial<IdentityValidationData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}> = ({ data, onUpdate, onSubmit, isSubmitting }) => {
  return ()
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          value={data.email || ''}
          onChange={(e) => onUpdate({ email: e.target.value })}
          required
          disabled={isSubmitting}
        />
        <div className="form-help">
          We'll send a verification email to confirm this address
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !data.email}>
        {isSubmitting ? 'Sending...' : 'Send Verification Email'}
      </button>
      <style>{`
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-help {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }
      `}</style>
    </form>
  );
};
const PhoneVerificationStep: React.FC<{
  data: Partial<IdentityValidationData>;
  onUpdate: (data: Partial<IdentityValidationData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}> = ({ data, onUpdate, onSubmit, isSubmitting }) => {
  return ()
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          value={data.phoneNumber || ''}
          onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
          placeholder="+1 (555) 123-4567"
          required
          disabled={isSubmitting}
        />
        <div className="form-help">
          Include country code. We'll send a verification SMS
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !data.phoneNumber}>
        {isSubmitting ? 'Sending...' : 'Send Verification SMS'}
      </button>
      <style>{`
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-help {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .btn-primary {
          background-color: #3b82f6;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
};

// Placeholder components for other steps
const GovernmentIdStep: React.FC<{
  data: Partial<IdentityValidationData>;
  onUpdate: (data: Partial<IdentityValidationData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}> = ({ onSubmit, isSubmitting }) => ()
  <div>
    <p>Government ID verification will be implemented in the next iteration.</p>
    <button type="button" onClick={(e) => onSubmit(e as any)} disabled={isSubmitting}>
      Skip for Now
    </button>
  </div>
);
const ProfessionalCredentialsStep: React.FC<{
  data: Partial<IdentityValidationData>;
  onUpdate: (data: Partial<IdentityValidationData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}> = ({ onSubmit, isSubmitting }) => ()
  <div>
    <p>Professional credentials verification will be implemented in the next iteration.</p>
    <button type="button" onClick={(e) => onSubmit(e as any)} disabled={isSubmitting}>
      Skip for Now
    </button>
  </div>
);
const SocialMediaStep: React.FC<{
  data: Partial<IdentityValidationData>;
  onUpdate: (data: Partial<IdentityValidationData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}> = ({ onSubmit, isSubmitting }) => ()
  <div>
    <p>Social media verification will be implemented in the next iteration.</p>
    <button type="button" onClick={(e) => onSubmit(e as any)} disabled={isSubmitting}>
      Skip for Now
    </button>
  </div>
);

export default VerificationRequestForm;