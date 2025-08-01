/**
 * RegistrationPage - Registration page wrapper for existing RegistrationForm component
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RegistrationForm } from '../components/auth/RegistrationForm';
import { useAuthStore } from '../stores/authStore';

export const RegistrationPage = () => { return null; }>
            <Link
              to="/login"
              style={{
  color: '#007bff',
  textDecoration: 'none',
}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
        {/* Terms and Privacy */}
        <div style={{
  marginTop: '20px',
  textAlign: 'center',
  fontSize: '12px',
  color: '#666',
  lineHeight: '1.4',
}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={{ color: '#007bff', textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" style={{ color: '#007bff', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </div>
        {/* Return to app link */}
        <div style={{
  marginTop: '30px',
  textAlign: 'center',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
}>
          <Link
            to="/"
            style={{
  color: '#666',
  textDecoration: 'none',
  fontSize: '14px',
}
          >
            ← Back to Graph Editor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;