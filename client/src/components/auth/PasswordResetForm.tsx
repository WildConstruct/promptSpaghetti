// Epic 11 Password Reset Form
// React component for password reset request functionality
import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
const PasswordResetRequestSchema = z.object({)
  email: z.string().email('Please enter a valid email address'),
});
const PasswordResetConfirmSchema = z.object({)
  newPassword: z.string(),
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});
}
interface PasswordResetFormProps {
  mode: 'request' | 'confirm';
  token?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({,)
  mode,
  token,
  onSuccess,
  onCancel
}
}) => {
  const [formData, setFormData] = useState({)
  email: '',
  newPassword: '',
  confirmPassword: '',
});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
  requestPasswordReset,
  confirmPasswordReset,
  validateToken,
  loading,
  error: hookError,
} = usePasswordReset();
  // Validate token on component mount for confirm mode
  React.useEffect(() => {
    if (mode === 'confirm' && token) {
      validateToken(token);
  }, [mode, token, validateToken]);
  const validateForm = useCallback(() => {
    setErrors({});
    try {
      if (mode === 'request') {
        PasswordResetRequestSchema.parse({ email: formData.email });
      } else {
  PasswordResetConfirmSchema.parse({)
  newPassword: formData.newPassword,
  confirmPassword: formData.confirmPassword,
});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      return false;
  }, [mode, formData]);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    setIsSubmitting(true);
    try {
      if (mode === 'request') {
        await requestPasswordReset(formData.email);
      } else if (mode === 'confirm' && token) {
        await confirmPasswordReset(token, formData.newPassword, formData.confirmPassword);
      onSuccess?.();
    } catch (error) {
  // Error handling is managed by the hook
  console.error('Password reset error:', error);
} finally {
      setIsSubmitting(false);
  }, [validateForm, mode, formData.email, token, formData.newPassword, formData.confirmPassword, requestPasswordReset, confirmPasswordReset, onSuccess]);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
  };
  if (mode === 'request') {
    return;
      <div className="password-reset-form">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email address"
                disabled={loading || isSubmitting}
                autoComplete="email"
                autoFocus
              />
              {errors.email && ()
                <div className="error-message">{errors.email}</div>
              )}
            </div>
            {hookError && ()
              <div className="error-message global-error">
                {hookError}
              </div>
            )}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || isSubmitting || !formData.email}
              >
                {loading || isSubmitting ? ()
                  <>
                    <span className="spinner"></span>
                    Sending Reset Link...
                  </>
                ) : ()
                  'Send Reset Link'
                )}
              </button>
            </div>
            <div className="form-footer">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-link"
                disabled={loading || isSubmitting}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
        <style>{`
          .password-reset-form {
            max-width: 400px;,
  margin: 0 auto;
            padding: 2rem 1rem;
          .auth-card {
            background: white;
            border-radius: 8px;,
  padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          .auth-header {
            text-align: center;
            margin-bottom: 2rem;
          .auth-header h2 {
            font-size: 1.5rem;
            font-weight: 600;,
  color: #1a202c;
            margin-bottom: 0.5rem;
          .auth-header p {
            color: #718096;
            font-size: 0.875rem;
            line-height: 1.5;
          .auth-form {
            display: flex;
            flex-direction: column;,
  gap: 1.5rem;
          .form-group {
            display: flex;
            flex-direction: column;,
  gap: 0.5rem;
          .form-group label {
            font-weight: 500;
            font-size: 0.875rem;,
  color: #374151;
          .form-input {
            padding: 0.75rem;,
  border: 2px solid #e2e8f0;
            border-radius: 6px;
            font-size: 1rem;,
  transition: border-color 0.2s ease;
          .form-input:focus {,
  outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          .form-input.error {
            border-color: #ef4444;
          .form-input:disabled {
            background-color: #f8fafc;,
  color: #94a3b8;
            cursor: not-allowed;
          .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          .global-error {
            background: #fef2f2;,
  border: 1px solid #fecaca;
            border-radius: 6px;,
  padding: 0.75rem;
            margin-top: 0;
          .form-actions {
            margin-top: 1rem;
          .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.875rem;,
  cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;,
  display: inline-flex;
            align-items: center;
            justify-content: center;,
  gap: 0.5rem;
            border: none;
          .btn-primary {
            background: #4f46e5;,
  color: white;
          .btn-primary:hover:not(:disabled) {,
  background: #4338ca;
          .btn-primary:disabled {,
  background: #9ca3af;
            cursor: not-allowed;
          .btn-full {
            width: 100%;
          .btn-link {
            background: none;,
  color: #4f46e5;
            padding: 0.5rem;
          .btn-link:hover:not(:disabled) {,
  color: #4338ca;
            text-decoration: underline;
          .spinner {
            width: 1rem;,
  height: 1rem;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;,
  animation: spin 1s linear infinite;
          @keyframes spin {
            to {
              transform: rotate(360deg);
          .form-footer {
            text-align: center;
            margin-top: 1rem;
        `}</style>
      </div>
    );
  // Confirm mode
  return;
    <div className="password-reset-form">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Set New Password</h2>
          <p>Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-container">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="Enter new password"
                disabled={loading || isSubmitting}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isSubmitting}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && ()
              <div className="error-message">{errors.newPassword}</div>
            )}
            {formData.newPassword && ()
              <PasswordStrengthIndicator 
                password={formData.newPassword}
                className="password-strength"
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm new password"
              disabled={loading || isSubmitting}
              autoComplete="new-password"
            />
            {errors.confirmPassword && ()
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
          {hookError && ()
            <div className="error-message global-error">
              {hookError}
            </div>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={
                loading || 
                isSubmitting || 
                !formData.newPassword || 
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword
            >
              {loading || isSubmitting ? ()
                <>
                  <span className="spinner"></span>
                  Updating Password...
                </>
              ) : ()
                'Update Password'
              )}
            </button>
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-link"
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .password-reset-form {
          max-width: 400px;,
  margin: 0 auto;
          padding: 2rem 1rem;
        .auth-card {
          background: white;
          border-radius: 8px;,
  padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        .auth-header h2 {
          font-size: 1.5rem;
          font-weight: 600;,
  color: #1a202c;
          margin-bottom: 0.5rem;
        .auth-header p {
          color: #718096;
          font-size: 0.875rem;
          line-height: 1.5;
        .auth-form {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .form-group {
          display: flex;
          flex-direction: column;,
  gap: 0.5rem;
        .form-group label {
          font-weight: 500;
          font-size: 0.875rem;,
  color: #374151;
        .password-input-container {
          position: relative;,
  display: flex;
          align-items: center;
        .form-input {
          padding: 0.75rem;,
  border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;,
  transition: border-color 0.2s ease;
          width: 100%;
        .form-input:focus {,
  outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        .form-input.error {
          border-color: #ef4444;
        .form-input:disabled {
          background-color: #f8fafc;,
  color: #94a3b8;
          cursor: not-allowed;
        .password-toggle {
          position: absolute;,
  right: 0.75rem;
          background: none;,
  border: none;
          cursor: pointer;,
  padding: 0.25rem;
          font-size: 1rem;,
  color: #6b7280;
          border-radius: 4px;
        .password-toggle:hover:not(:disabled) {,
  background: #f3f4f6;
        .password-toggle:disabled {,
  cursor: not-allowed;
          opacity: 0.5;
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        .global-error {
          background: #fef2f2;,
  border: 1px solid #fecaca;
          border-radius: 6px;,
  padding: 0.75rem;
          margin-top: 0;
        .form-actions {
          margin-top: 1rem;
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;,
  cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;,
  display: inline-flex;
          align-items: center;
          justify-content: center;,
  gap: 0.5rem;
          border: none;
        .btn-primary {
          background: #4f46e5;,
  color: white;
        .btn-primary:hover:not(:disabled) {,
  background: #4338ca;
        .btn-primary:disabled {,
  background: #9ca3af;
          cursor: not-allowed;
        .btn-full {
          width: 100%;
        .btn-link {
          background: none;,
  color: #4f46e5;
          padding: 0.5rem;
        .btn-link:hover:not(:disabled) {,
  color: #4338ca;
          text-decoration: underline;
        .spinner {
          width: 1rem;,
  height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
        @keyframes spin {
          to {
            transform: rotate(360deg);
        .form-footer {
          text-align: center;
          margin-top: 1rem;
        .password-strength {
          margin-top: 0.5rem;
      `}</style>
    </div>
  );
};

export default PasswordResetForm;