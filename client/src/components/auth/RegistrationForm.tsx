// Epic 11 Registration Form Component
// Progressive registration form with validation and analytics

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRegistration } from '../../hooks/useRegistration';
import { useFormAnalytics } from '../../hooks/useFormAnalytics';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { EmailSuggestions } from './EmailSuggestions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ValidationMessage } from '../common/ValidationMessage';
import { OAuthProviderButtons } from './OAuthProviderButtons';

// Registration form schema
const RegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  marketingConsent: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword']
});

type RegistrationFormData = z.infer<typeof RegistrationSchema>;

interface RegistrationFormProps {
  invitationToken?: string;
  onSuccess?: (user: unknown) => void;
  onCancel?: () => void;
  className?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  invitationToken,
  onSuccess,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    marketingConsent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    isLoading,
    error: registrationError,
    validationResult,
    validateField
  } = useRegistration();

  const { trackFieldEvent, trackFormStep } = useFormAnalytics();

  // Track form step changes
  useEffect(() => {
    trackFormStep(currentStep, 'registration');
  }, [currentStep, trackFormStep]);

  const steps = [
    { number: 1, title: 'Account Information', description: 'Create your account' },
    { number: 2, title: 'Personal Details', description: 'Tell us about yourself' },
    { number: 3, title: 'Confirmation', description: 'Review and confirm' }
  ];

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Track field interaction
    if (typeof value === 'string') {
      trackFieldEvent(field, 'change', value.length);
    }
  };

  const handleFieldBlur = async (field: string) => {
    trackFieldEvent(field, 'blur');
    
    // Validate individual field
    if (formData[field as keyof RegistrationFormData]) {
      await validateField(field, formData[field as keyof RegistrationFormData]);
    }
  };

  const handleFieldFocus = (field: string) => {
    trackFieldEvent(field, 'focus');
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Email validation
      if (!formData.email) {
        stepErrors.email = 'Email is required';
      } else {
        try {
          z.string().email().parse(formData.email);
        } catch {
          stepErrors.email = 'Please enter a valid email address';
        }
      }

      // Password validation
      if (!formData.password) {
        stepErrors.password = 'Password is required';
      } else if (formData.password.length < 12) {
        stepErrors.password = 'Password must be at least 12 characters';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        stepErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = 'Passwords don\'t match';
      }
    }

    if (currentStep === 2) {
      // Optional validation for personal details
      if (formData.firstName && formData.firstName.length < 2) {
        stepErrors.firstName = 'First name must be at least 2 characters';
      }
      if (formData.lastName && formData.lastName.length < 2) {
        stepErrors.lastName = 'Last name must be at least 2 characters';
      }
      if (formData.displayName && formData.displayName.length < 2) {
        stepErrors.displayName = 'Display name must be at least 2 characters';
      }
    }

    if (currentStep === 3) {
      // Terms acceptance validation
      if (!formData.acceptTerms) {
        stepErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    try {
      const registrationData = {
        email: formData.email!,
        password: formData.password!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        invitationToken
      };

      const result = await register(registrationData);
      
      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium text-gray-900">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">Create Your Account</h2>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            onFocus={() => handleFieldFocus('email')}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <ValidationMessage message={errors.email} type="error" />}
          {validationResult?.suggestions?.find(s => s.field === 'email') && (
            <EmailSuggestions 
              suggestion={validationResult.suggestions.find(s => s.field === 'email')!.suggestion}
              onAccept={(suggestion) => handleFieldChange('email', suggestion)}
            />
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="mt-1 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password || ''}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            onBlur={() => handleFieldBlur('password')}
            onFocus={() => handleFieldFocus('password')}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10 ${
              errors.password ? 'border-red-500' : ''
            }`}
            placeholder="Choose a strong password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {formData.password && (
          <PasswordStrengthIndicator 
            password={formData.password} 
            className="mt-2"
          />
        )}
        {errors.password && <ValidationMessage message={errors.password} type="error" />}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            onFocus={() => handleFieldFocus('confirmPassword')}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <ValidationMessage message={errors.confirmPassword} type="error" />}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">Personal Information</h2>
      <p className="text-center text-gray-600">These details are optional but help personalize your experience</p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="firstName"
              value={formData.firstName || ''}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
              onFocus={() => handleFieldFocus('firstName')}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : ''
              }`}
              placeholder="John"
            />
            {errors.firstName && <ValidationMessage message={errors.firstName} type="error" />}
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              value={formData.lastName || ''}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
              onFocus={() => handleFieldFocus('lastName')}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : ''
              }`}
              placeholder="Doe"
            />
            {errors.lastName && <ValidationMessage message={errors.lastName} type="error" />}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          Display Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="displayName"
            value={formData.displayName || ''}
            onChange={(e) => handleFieldChange('displayName', e.target.value)}
            onBlur={() => handleFieldBlur('displayName')}
            onFocus={() => handleFieldFocus('displayName')}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.displayName ? 'border-red-500' : ''
            }`}
            placeholder="This is how others will see your name"
          />
          {errors.displayName && <ValidationMessage message={errors.displayName} type="error" />}
          <p className="mt-1 text-sm text-gray-500">
            If not provided, we'll use your first and last name
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">Almost Done!</h2>
      <p className="text-center text-gray-600">Review your information and accept our terms</p>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900">{formData.email}</dd>
          </div>
          {(formData.firstName || formData.lastName) && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">
                {[formData.firstName, formData.lastName].filter(Boolean).join(' ')}
              </dd>
            </div>
          )}
          {formData.displayName && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Display Name</dt>
              <dd className="text-sm text-gray-900">{formData.displayName}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms || false}
              onChange={(e) => handleFieldChange('acceptTerms', e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="font-medium text-gray-700">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
                Privacy Policy
              </a>
              *
            </label>
            {errors.acceptTerms && <ValidationMessage message={errors.acceptTerms} type="error" />}
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="marketingConsent"
              type="checkbox"
              checked={formData.marketingConsent || false}
              onChange={(e) => handleFieldChange('marketingConsent', e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="marketingConsent" className="font-medium text-gray-700">
              I'd like to receive updates and marketing communications
            </label>
            <p className="text-gray-500">You can unsubscribe at any time</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* OAuth Provider Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <OAuthProviderButtons 
          mode="register" 
          onError={(error) => setErrors({ oauth: error })}
          onSuccess={onSuccess}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStepIndicator()}
        
        {registrationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                <p className="text-sm text-red-700 mt-1">{registrationError}</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Create Account
            </button>
          )}
        </div>

        {onCancel && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};