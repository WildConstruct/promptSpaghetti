import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { GraphEditor, RandomizerPanel } from './core';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { useAuthStore, setupTokenRefresh } from './stores/authStore';
import EpicDashboard from './components/EpicDashboard';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PasswordResetPage from './pages/PasswordResetPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './components/pages/ProfilePage';
import SettingsPage from './components/pages/SettingsPage';
import UserManagementDashboard from './components/admin/UserManagementDashboard';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { UserNavigation } from './components/navigation/UserNavigation';
import 'reactflow/dist/style.css';
import './randomizer.css';

/**
 * Main application interface with tab navigation.
 * Handles graph editor and LLM randomizer functionality.
 */
function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedGraph, setGeneratedGraph] = useState<unknown>(null);
  const { isAuthenticated, logout, user } = useAuthStore();

  // Determine active tab based on current route
  const activeTab = location.pathname === '/randomizer' ? 'randomizer' : 
    location.pathname === '/epic-status' ? 'epic-status' :
      location.pathname.startsWith('/admin') ? 'admin' : 'editor';

  // Check if user has admin access
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('administrator');

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer' | 'epic-status' | 'admin') => {
    const paths = {
      editor: '/',
      randomizer: '/randomizer',
      'epic-status': '/epic-status',
      admin: '/admin'
    };
    navigate(paths[tab] || '/');
  }, [navigate]);

  const handleGraphGenerated = useCallback((graph: unknown) => {
    setGeneratedGraph(graph);
    navigate('/'); // Navigate to editor tab
  }, [navigate]);

  const handleRandomizerError = useCallback((error: Error) => {
    console.error('Randomizer error:', error);
    alert(`Generation failed: ${error.message}`);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Tab Navigation and Auth Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #ccc', 
          backgroundColor: '#f5f5f5',
          padding: '0'
        }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => handleTabChange('editor')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'editor' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'editor' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
              }}
            >
              Graph Editor
            </button>
            <button
              onClick={() => handleTabChange('randomizer')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'randomizer' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'randomizer' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal'
              }}
            >
              LLM Randomizer
            </button>
            <button
              onClick={() => handleTabChange('epic-status')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'epic-status' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'epic-status' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'epic-status' ? 'bold' : 'normal'
              }}
            >
              Epic Status
            </button>
            
            {/* Admin Tab - Only show for admin users */}
            {isAdmin && (
              <button
                onClick={() => handleTabChange('admin')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: activeTab === 'admin' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'admin' ? '2px solid #f59e0b' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'admin' ? 'bold' : 'normal',
                  color: activeTab === 'admin' ? '#f59e0b' : '#374151'
                }}
              >
                Admin
              </button>
            )}
          </div>
          
          {/* Authentication Controls */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', gap: '12px' }}>
              <UserNavigation />
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #dc3545',
                  backgroundColor: 'transparent',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderRadius: '4px'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'editor' ? (
            <GraphEditor 
              initialNodes={generatedGraph?.nodes || []}
              initialEdges={generatedGraph?.edges || []}
            />
          ) : activeTab === 'randomizer' ? (
            <div style={{ 
              padding: '20px', 
              height: '100%', 
              overflow: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              <RandomizerPanel
                onGraphGenerated={handleGraphGenerated}
                onError={handleRandomizerError}
                className="randomizer-main"
              />
            </div>
          ) : activeTab === 'admin' && isAdmin ? (
            <div style={{ 
              height: '100%', 
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <h2>Admin Panel</h2>
                <p>Admin functionality will be integrated here</p>
              </div>
            </div>
          ) : (
            <EpicDashboard />
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}

/**
 * Root App component with routing.
 * Handles authentication flow and route protection.
 */
export default function App() {
  useEffect(() => {
    // Setup automatic token refresh
    setupTokenRefresh();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <MainApp />
          </PrivateRoute>
        } />
        <Route path="/randomizer" element={
          <PrivateRoute>
            <MainApp />
          </PrivateRoute>
        } />
        <Route path="/epic-status" element={
          <PrivateRoute>
            <MainApp />
          </PrivateRoute>
        } />
        
        {/* User Profile and Settings Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        } />
        
        {/* Admin Routes - Protected for admin users only */}
        <Route path="/admin/users" element={
          <PrivateRoute requiredRoles={['admin', 'administrator']}>
            <UserManagementDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/*" element={
          <PrivateRoute requiredRoles={['admin', 'administrator']}>
            <MainApp />
          </PrivateRoute>
        } />
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}