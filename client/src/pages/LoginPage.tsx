/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * LoginPage - Login page wrapper for existing LoginForm component
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../stores/authStore';

export const LoginPage = () => { return null; }>
            <Link
              to="/register"
              style={{
  color: '#007bff',
  textDecoration: 'none',
}
            >
              Don't have an account? Sign up
            </Link>
          </div>
          <div>
            <Link
              to="/reset-password"
              style={{
  color: '#666',
  textDecoration: 'none',
}
            >
              Forgot your password?
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

export default LoginPage;