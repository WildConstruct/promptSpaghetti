/**
 * LoginForm - Simplified login form using Zustand auth store
 * 
 * Integrates with the authentication routing system
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { OAuthProviderButtons } from './OAuthProviderButtons';

// Login form validation schema
const loginSchema = z.object({)
  email: z.string(),
  .email('Please enter a valid email address')
  .min(1, 'Email is required'),
  password: z.string(),
  .min(1, 'Password is required'),
  rememberMe: z.boolean(),
});
type LoginFormData = z.infer<typeof loginSchema>;
}
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  export const LoginForm: React.FC<LoginFormProps> = ({,)
  onSuccess,
  onError
}
}) => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, returnUrl } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>({)
  email: '',
  password: '',
  rememberMe: false,
});
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const validateField = (field: keyof LoginFormData, value: Error): string | undefined => {
    try {
      const fieldSchema = loginSchema.shape[field];
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      return 'Invalid value';
  };
  const handleInputChange = (field: keyof LoginFormData, value: Error) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  const handleInputBlur = (field: keyof LoginFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof LoginFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    try {
      const success = await login(formData.email, formData.password, formData.rememberMe);
      if (success) {
        // Redirect to return URL or default to home
        const redirectTo = returnUrl || '/';
        navigate(redirectTo);
        onSuccess?.();
      } else {
        onError?.(authError || 'Login failed');
    } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Login failed';
  onError?.(errorMessage);
};
  return;
    <div style={{ width: '100%' }}>
      {/* OAuth Provider Buttons */}
      <OAuthProviderButtons 
        mode="login" 
        onError={onError}
        onSuccess={onSuccess}
      />
      <form 
        onSubmit={handleSubmit} 
        style={{ width: '100%' }}
        role="form"
        aria-label="Login form"
        noValidate
      >
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Login credentials</legend>
        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="login-email"
            style={{
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
}}
          >
            Email Address *
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleInputBlur('email')}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`}
},
  borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box';
  }}
            placeholder="Enter your email"
            disabled={isLoading}
            required
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && ()
            <div 
              id="email-error"
              role="alert"
              style={{
  color: '#dc3545',
  fontSize: '14px',
  marginTop: '4px',
}}
            >
              {errors.email}
            </div>
          )}
        </div>
        {/* Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="login-password"
            style={{
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
}}
          >
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleInputBlur('password')}
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '45px',
                border: `1px solid ${errors.password ? '#dc3545' : '#ddd'}`}
},
  borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box';
  }}
              placeholder="Enter your password"
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : 'password-toggle'}
              autoComplete="current-password"
            />
            <button
              id="password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  fontSize: '14px',
}}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls="login-password"
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && ()
            <div 
              id="password-error"
              role="alert"
              style={{
  color: '#dc3545',
  fontSize: '14px',
  marginTop: '4px',
}}
            >
              {errors.password}
            </div>
          )}
        </div>
        {/* Remember Me Checkbox */}
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="remember-me"
            style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              id="remember-me"
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              style={{ marginRight: '8px' }}
              disabled={isLoading}
              aria-describedby="remember-me-description"
            />
            Remember me
            <span 
              id="remember-me-description" 
              className="sr-only"
            >
              Keep me signed in on this device
            </span>
          </label>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
  width: '100%',
  padding: '14px',
  backgroundColor: isLoading ? '#6c757d' : '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s',
}}
          aria-describedby={authError ? 'form-error' : undefined}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        {/* Loading status for screen readers */}
        {isLoading && ()
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          >
            Signing in, please wait...
          </div>
        )}
        {/* Form-level error */}
        {authError && ()
          <div 
            id="form-error"
            role="alert"
            style={{
  color: '#dc3545',
  fontSize: '14px',
  marginTop: '12px',
  textAlign: 'center',
}}
          >
            {authError}
          </div>
        )}
        </fieldset>
      </form>
      {/* Add screen reader only styles */}
      <style>{`
        .sr-only {
          position: absolute;,
  width: 1px;
          height: 1px;,
  padding: 0;
          margin: -1px;,
  overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;,
  border: 0;
      `}</style>
    </div>
  );
};

export default LoginForm;