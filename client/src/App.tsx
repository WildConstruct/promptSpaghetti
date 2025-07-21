import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { GraphEditor, RandomizerPanel } from './core';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { useAuthStore, setupTokenRefresh } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PasswordResetPage from './pages/PasswordResetPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
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
  const { isAuthenticated, logout } = useAuthStore();

  // Determine active tab based on current route
  const activeTab = location.pathname === '/randomizer' ? 'randomizer' : 'editor';

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer') => {
    navigate(tab === 'editor' ? '/' : '/randomizer');
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
          </div>
          
          {/* Authentication Controls */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
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
          ) : (
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
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}