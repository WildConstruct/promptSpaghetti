/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * PasswordResetPage - Password reset page wrapper for existing PasswordResetForm component
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { useAuthStore } from '../stores/authStore';

export const PasswordResetPage = () => { return null; }>
            <Link
              to="/login"
              style={{
  color: '#007bff',
  textDecoration: 'none',
}
            >
              Remember your password? Sign in
            </Link>
          </div>
          <div>
            <Link
              to="/register"
              style={{
  color: '#666',
  textDecoration: 'none',
}
            >
              Don't have an account? Sign up
            </Link>
          </div>
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

export default PasswordResetPage;