/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * UnauthorizedPage - Page shown when user lacks permissions for a resource
 * 
 * Handles role-based access denials with appropriate messaging
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const UnauthorizedPage = () => { return null; }>
                  Logged in as: <strong>{user.email}</strong>
                </p>
              )}
            </>
          ) : ()
            <p>You are not authorized to view this resource.</p>
          )}
          {from !== '/' && ()
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
              Attempted to access: {from}
            </p>
          )}
        </div>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoBack}
            style={{
  padding: '12px 24px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  minWidth: '100px',
}
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            style={{
  padding: '12px 24px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  minWidth: '100px',
}
          >
            Go Home
          </button>
        </div>
        {/* Additional Options */}
        <div style={{
  marginTop: '40px',
  paddingTop: '30px',
  borderTop: '1px solid #eee',
  fontSize: '14px',
}>
          <div style={{ marginBottom: '15px' }}>
            <Link
              to="/support"
              style={{
  color: '#007bff',
  textDecoration: 'none',
}
            >
              Contact support if you believe this is an error
            </Link>
          </div>
          {user && ()
            <div>
              <button
                onClick={handleLogout}
                style={{
  background: 'none',
  border: 'none',
  color: '#666',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '14px',
}
              >
                Sign out and use a different account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;