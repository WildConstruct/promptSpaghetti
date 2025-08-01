/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 17.5.5 - Verification Information Form Component
import React, { useState, useCallback } from 'react';
import { VerificationLevel, VerificationInformation } from './types';

interface VerificationFormProps {
  onSubmit?: (data: { requested_level: VerificationLevel; information: VerificationInformation }) => void;
  onError?: (error: string) => void;
  initialData?: Partial<VerificationInformation>;
  isEditing?: boolean;
const VERIFICATION_LEVELS: Array<{ value: VerificationLevel; label: string; description: string }> = [
  {
  value: 'basic',
  label: 'Basic Verification',
  description: 'Email and basic personal information verification',

  {
  value: 'intermediate',
  label: 'Intermediate Verification',
  description: 'Professional credentials and portfolio verification',

  {
  value: 'advanced',
  label: 'Advanced Verification',
  description: 'Business entity verification with documentation',

  {
    value: 'premium',
    label: 'Premium Verification',
    description: 'Enhanced verification with manual review'];
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' }
  // Add more countries as needed
];

export const [formData, setFormData] = useState<VerificationInformation>({)
  personal_info: {,
  full_name: initialData?.personal_info?.full_name || '',
  email: initialData?.personal_info?.email || '',
  phone: initialData?.personal_info?.phone || '',
  date_of_birth: initialData?.personal_info?.date_of_birth || '',
  country: initialData?.personal_info?.country || 'US',
  state_province: initialData?.personal_info?.state_province || '',
  city: initialData?.personal_info?.city || '',
  postal_code: initialData?.personal_info?.postal_code || '',
  address_line_1: initialData?.personal_info?.address_line_1 || '',
  address_line_2: initialData?.personal_info?.address_line_2 || '',
},
  professional_info: {,
  job_title: initialData?.professional_info?.job_title || '',
  company: initialData?.professional_info?.company || '',
  industry: initialData?.professional_info?.industry || '',
  years_experience: initialData?.professional_info?.years_experience || undefined,
  linkedin_url: initialData?.professional_info?.linkedin_url || '',
  website_url: initialData?.professional_info?.website_url || '',
  portfolio_url: initialData?.professional_info?.portfolio_url || '',
},
  business_info: {,
  business_name: initialData?.business_info?.business_name || '',
  business_type: initialData?.business_info?.business_type || '',
  registration_number: initialData?.business_info?.registration_number || '',
  tax_id: initialData?.business_info?.tax_id || '',
  business_address: {,
  country: initialData?.business_info?.business_address?.country || 'US',
  state_province: initialData?.business_info?.business_address?.state_province || '',
  city: initialData?.business_info?.business_address?.city || '',
  postal_code: initialData?.business_info?.business_address?.postal_code || '',
  address_line_1: initialData?.business_info?.business_address?.address_line_1 || '',
  address_line_2: initialData?.business_info?.business_address?.address_line_2 || '',
},
  verification_purpose: initialData?.verification_purpose || '',
    additional_notes: initialData?.additional_notes || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = useCallback((section: keyof VerificationInformation, field: string, value: Error) => {
  setFormData(prev => {)
  if (section === 'business_info' && field.startsWith('business_address.')) {
  const addressField = field.replace('business_address.', '');
  return {
  ...prev,
  business_info: {,
  ...prev.business_info!,
  business_address: {,
  ...prev.business_info!.business_address!,
  [addressField]: value,
};
      return {
  ...prev,
  [section]: {,
  ...prev[section],
  [field]: value,
};
    });
  }, []);
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
  event.preventDefault();
  // Basic validation
  if (!formData.personal_info.full_name || !formData.personal_info.email) {
  onError?.('Full name and email are required');
  return;
  if (!formData.verification_purpose || formData.verification_purpose.length < 10) {
  onError?.('Verification purpose must be at least 10 characters');
  return;
  setIsSubmitting(true);
  try {
  await onSubmit?.({)
  requested_level: requestedLevel,
  information: formData,
});
 catch (error) {
  onError?.(error instanceof Error ? error.message : 'Submission failed');
 finally {
      setIsSubmitting(false);
  }, [formData, requestedLevel, onSubmit, onError]);
  return;
    <form onSubmit={handleSubmit} className="verification-form">
      <h2>{isEditing ? 'Update' : 'Create'} Verification Request</h2>
      {/* Verification Level Selection */}
      {!isEditing && ()
        <div className="form-section">
          <h3>Verification Level</h3>
          <div className="level-options">
            {VERIFICATION_LEVELS.map(level => ()
              <div key={level.value} className="level-option">
                <label>
                  <input
                    type="radio"
                    name="verification_level"
                    value={level.value}
                    checked={requestedLevel === level.value}
                    onChange={(e) => setRequestedLevel(e.target.value as VerificationLevel)}
                  />
                  <div className="level-info">
                    <strong>{level.label}</strong>
                    <p>{level.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Personal Information */}
      <div className="form-section">
        <h3>Personal Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.personal_info.full_name}
              onChange={(e) => handleInputChange('personal_info', 'full_name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.personal_info.email}
              onChange={(e) => handleInputChange('personal_info', 'email', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.personal_info.phone}
              onChange={(e) => handleInputChange('personal_info', 'phone', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={formData.personal_info.date_of_birth}
              onChange={(e) => handleInputChange('personal_info', 'date_of_birth', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Country *</label>
            <select
              value={formData.personal_info.country}
              onChange={(e) => handleInputChange('personal_info', 'country', e.target.value)}
              required
            >
              {COUNTRIES.map(country => ()
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>State/Province</label>
            <input
              type="text"
              value={formData.personal_info.state_province}
              onChange={(e) => handleInputChange('personal_info', 'state_province', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Address Line 1</label>
          <input
            type="text"
            value={formData.personal_info.address_line_1}
            onChange={(e) => handleInputChange('personal_info', 'address_line_1', e.target.value)}
          />
        </div>
      </div>
      {/* Professional Information */}
      {['intermediate', 'advanced', 'premium'].includes(requestedLevel) && ()
        <div className="form-section">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={formData.professional_info?.job_title}
                onChange={(e) => handleInputChange('professional_info', 'job_title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={formData.professional_info?.company}
                onChange={(e) => handleInputChange('professional_info', 'company', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.professional_info?.industry}
                onChange={(e) => handleInputChange('professional_info', 'industry', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="70"
                value={formData.professional_info?.years_experience || ''}
                onChange={(e) => handleInputChange('professional_info', 'years_experience')
                  e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              value={formData.professional_info?.linkedin_url}
              onChange={(e) => handleInputChange('professional_info', 'linkedin_url', e.target.value)}
            />
          </div>
        </div>
      )}
      {/* Business Information */}
      {['advanced', 'premium'].includes(requestedLevel) && ()
        <div className="form-section">
          <h3>Business Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                value={formData.business_info?.business_name}
                onChange={(e) => handleInputChange('business_info', 'business_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <input
                type="text"
                value={formData.business_info?.business_type}
                onChange={(e) => handleInputChange('business_info', 'business_type', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                value={formData.business_info?.registration_number}
                onChange={(e) => handleInputChange('business_info', 'registration_number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tax ID</label>
              <input
                type="text"
                value={formData.business_info?.tax_id}
                onChange={(e) => handleInputChange('business_info', 'tax_id', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Verification Purpose */}
      <div className="form-section">
        <h3>Verification Purpose</h3>
        <div className="form-group">
          <label>Why are you requesting verification? *</label>
          <textarea
            value={formData.verification_purpose}
            onChange={(e) => handleInputChange('verification_purpose', '', e.target.value)}
            placeholder="Please describe why you need verification and how you plan to use it..."
            rows={4}
            minLength={10}
            maxLength={1000}
            required
          />
          <small>{formData.verification_purpose.length}/1000 characters</small>
        </div>
        <div className="form-group">
          <label>Additional Notes</label>
          <textarea
            value={formData.additional_notes}
            onChange={(e) => handleInputChange('additional_notes', '', e.target.value)}
            placeholder="Any additional information you'd like to provide..."
            rows={3}
            maxLength={2000}
          />
          <small>{formData.additional_notes?.length || 0}/2000 characters</small>
        </div>
      </div>
      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Request' : 'Create Request')}
        </button>
      </div>
      <style>{`
        .verification-form {
          max-width: 800px;,
  margin: 0 auto;,
  padding: 24px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        .verification-form h2 {
          margin-bottom: 24px;,
  color: #333;
          text-align: center;
        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e0e0e0;
        .form-section:last-of-type {
          border-bottom: none;
        .form-section h3 {
          margin-bottom: 16px;,
  color: #555;
          font-size: 18px;
        .level-options {
          display: flex;
          flex-direction: column;,
  gap: 12px;
        .level-option {
          border: 1px solid #ddd;
          border-radius: 6px;,
  padding: 16px;,
  transition: all 0.2s;
        .level-option:has(input:checked) {
          border-color: #007bff;
          background-color: #f8f9fa;
        .level-option label {
          display: flex;
          align-items: flex-start;,
  gap: 12px;,
  cursor: pointer;
        .level-option input[type="radio"] {
          margin-top: 2px;
        .level-info strong {
          display: block;
          margin-bottom: 4px;,
  color: #333;
        .level-info p {
          margin: 0;,
  color: #666;
          font-size: 14px;
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;,
  gap: 16px;
          margin-bottom: 16px;
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
        .form-group {
          display: flex;
          flex-direction: column;
        .form-group label {
          margin-bottom: 6px;
          font-weight: 600;,
  color: #555;
          font-size: 14px;
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;,
  border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;,
  transition: border-color 0.2s;
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {,
  outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        .form-group small {
          margin-top: 4px;,
  color: #666;
          font-size: 12px;
        .form-actions {
          margin-top: 32px;
          text-align: center;
        .submit-button {
          padding: 12px 32px;
          background-color: #007bff;,
  color: white;,
  border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;,
  cursor: pointer;,
  transition: background-color 0.2s;
          min-width: 200px;
        .submit-button:hover:not(:disabled) {
          background-color: #0056b3;
        .submit-button:disabled {
          background-color: #6c757d;,
  cursor: not-allowed;
      `}</style>
    </form>
  );
};