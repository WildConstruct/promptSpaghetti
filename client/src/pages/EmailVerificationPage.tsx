/**
 * EmailVerificationPage - Email verification page for new user confirmation
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'resent'>('pending');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  // Clear any existing errors when page loads
  useEffect(() => {
    if (error) {
      clearError();
  }, [clearError, error]);
  const verifyEmailToken = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/verify-email`, {},}
  method: 'POST',
        headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ token: verificationToken })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email verification failed');
      const data = await response.json();
      setVerificationStatus('success');
      setVerificationMessage(data.message || 'Email verified successfully!');
      // Optionally auto-redirect to login after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: unknown) {
  setVerificationStatus('error');
  setVerificationMessage(error instanceof Error ? error.message : 'Email verification failed');
}, [navigate]);
  // Verify email token on page load
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else if (!email) {
      setVerificationStatus('error');
      setVerificationMessage('Invalid verification link. Please check your email for the correct link.');
  }, [token, email, verifyEmailToken]);
  const handleResendVerification = async (): Promise<void> => {
    if (!resendEmail && !email) {
      setVerificationMessage('Please enter your email address to resend verification.');
      return;
    const emailToUse = resendEmail || email || '';
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/resend-verification`, {},}
  method: 'POST',
        headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ email: emailToUse })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification email');
      setVerificationStatus('resent');
      setVerificationMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: unknown) {
  setVerificationStatus('error');
  setVerificationMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
};
  // Redirect if already authenticated
  if (isAuthenticated) {
  return;
  <div style={{
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  padding: '20px',
}}>
        <div style={{
  maxWidth: '400px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  padding: '40px',
  textAlign: 'center',
}}>
          <h1 style={{ fontSize: '24px', color: '#28a745', marginBottom: '20px' }}>
            ✅ You&apos;re Already Signed In!
          </h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Your email is already verified and you&apos;re logged in.
          </p>
          <Link
            to="/"
            style={{
  display: 'inline-block',
  backgroundColor: '#007bff',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '4px',
  textDecoration: 'none',
}}
          >
            Go to Graph Editor
          </Link>
        </div>
      </div>
    );
  return;
    <div style={{
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  padding: '20px',
}}>
      <div style={{
  maxWidth: '500px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  padding: '40px',
}}>
        <div style={{
  textAlign: 'center',
  marginBottom: '30px',
}}>
          <h1 style={{
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '8px',
}}>
            Email Verification
          </h1>
          <p style={{
  color: '#666',
  fontSize: '16px',
}}>
            {token ? 'Verifying your email address...' : 'Verify your email to activate your account'}
          </p>
        </div>
        {/* Verification Status Display */}
        <div style={{ marginBottom: '30px' }}>
          {verificationStatus === 'pending' && token && ()
            <div style={{
  textAlign: 'center',
  padding: '20px',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  color: '#856404',
}}>
              <div style={{ marginBottom: '10px' }}>🔄</div>
              Verifying your email...
            </div>
          )}
          {verificationStatus === 'success' && ()
            <div style={{
  textAlign: 'center',
  padding: '20px',
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '4px',
  color: '#155724',
}}>
              <div style={{ marginBottom: '10px' }}>✅</div>
              {verificationMessage}
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                Redirecting to login in 3 seconds...
              </div>
            </div>
          )}
          {verificationStatus === 'error' && ()
            <div style={{
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  borderRadius: '4px',
  color: '#721c24',
  padding: '15px',
  marginBottom: '20px',
}}>
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>❌</div>
              {verificationMessage}
            </div>
          )}
          {verificationStatus === 'resent' && ()
            <div style={{
  textAlign: 'center',
  padding: '20px',
  backgroundColor: '#d1ecf1',
  border: '1px solid #bee5eb',
  borderRadius: '4px',
  color: '#0c5460',
}}>
              <div style={{ marginBottom: '10px' }}>📧</div>
              {verificationMessage}
            </div>
          )}
        </div>
        {/* Resend verification form */}
        {(verificationStatus === 'error' || (!token && !email)) && ()
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
              Resend Verification Email
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={resendEmail || email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResendEmail(e.target.value)}
                style={{
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '16px',
}}
              />
            </div>
            <button
              onClick={handleResendVerification}
              style={{
  width: '100%',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '12px',
  fontSize: '16px',
  cursor: 'pointer',
}}
            >
              Resend Verification Email
            </button>
          </div>
        )}
        {/* Display global error if any */}
        {error && ()
          <div style={{
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  color: '#721c24',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '14px',
}}>
            {error}
          </div>
        )}
        {/* Loading indicator */}
        {isLoading && ()
          <div style={{
  textAlign: 'center',
  padding: '20px',
  color: '#666',
}}>
            Processing...
          </div>
        )}
        {/* Navigation Links */}
        <div style={{
  marginTop: '30px',
  textAlign: 'center',
  fontSize: '14px',
}}>
          <div style={{ marginBottom: '10px' }}>
            <Link
              to="/login"
              style={{
  color: '#007bff',
  textDecoration: 'none',
}}
            >
              Already verified? Sign in
            </Link>
          </div>
          <div>
            <Link
              to="/register"
              style={{
  color: '#666',
  textDecoration: 'none',
}}
            >
              Need to create an account? Sign up
            </Link>
          </div>
        </div>
        {/* Return to app link */}
        <div style={{
  marginTop: '30px',
  textAlign: 'center',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
}}>
          <Link
            to="/"
            style={{
  color: '#666',
  textDecoration: 'none',
  fontSize: '14px',
}}
          >
            ← Back to Graph Editor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;