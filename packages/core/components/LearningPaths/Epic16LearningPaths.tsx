/**
 * Epic 16 Learning Paths Integration
 * 
 * Main integration component that brings together the learning path
 * dashboard, viewer, and service components for Epic 16 Marketplace
 * & Community learning system.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LearningPath,
  UserEnrollment,
  Epic16LearningPathService
} from '../../services/Epic16LearningPathService';
import { LearningPathDashboard } from './LearningPathDashboard';
import { LearningPathViewer } from './LearningPathViewer';
interface Epic16LearningPathsProps {
  userId: string;
  userRole: 'user' | 'creator' | 'admin';
  userTier: 'free' | 'premium' | 'enterprise';
  onAnalytics?: (analytics: unknown) => void;
  onCertification?: (certification: unknown) => void;
  export const Epic16LearningPaths: React.FC<Epic16LearningPathsProps> = ({,)
  userId,
  userRole,
  userTier,
  onAnalytics,
  onCertification
}) => {
  // Service initialization
  const learningService = useMemo(() => new Epic16LearningPathService(), []);
  // State management
  const [currentView, setCurrentView] = useState<'dashboard' | 'viewer'>('dashboard');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [userEnrollment, setUserEnrollment] = useState<UserEnrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize service with user context
  useEffect(() => {
    const initializeService = async () => {
      setLoading(true);
      setError(null);
      try {
        // Set up service event listeners for analytics and certifications
        learningService.on('certificateEarned', (certificate) => {
          onCertification?.(certificate);
        });
        learningService.on('analyticsUpdate', (analytics) => {
          onAnalytics?.(analytics);
        });
        learningService.on('pathCompleted', async (data) => {
          const { userId: completedUserId, pathId } = data;
          if (completedUserId === userId) {
            // Handle path completion
            console.log(`Path ${pathId} completed by user ${userId}`);}
        });
        learningService.on('skillUnlocked', (skill) => {
  // Handle skill unlock notifications
  console.log('Skill unlocked:', skill);
});
      } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to initialize learning service');
} finally {
        setLoading(false);
    };
    initializeService();
    // Cleanup event listeners
    return () => {
      learningService.removeAllListeners();
    };
  }, [learningService, userId, onAnalytics, onCertification]);
  // Handle path selection from dashboard
  const handlePathSelect = useCallback(async (path: LearningPath) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedPath(path);
      // Get user's enrollment for this path
      const userPaths = await learningService.getUserPaths(userId);
      const enrollment = userPaths.find(e => e.pathId === path.id);
      setUserEnrollment(enrollment || null);
      // If not enrolled, auto-enroll for seamless experience
      if (!enrollment) {
        const newEnrollment = await learningService.enrollUser(userId, path.id);
        setUserEnrollment(newEnrollment);
      setCurrentView('viewer');
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load learning path');
} finally {
      setLoading(false);
  }, [learningService, userId]);
  // Handle progress updates
  const handleProgress = useCallback((progress: number) => {
  if (userEnrollment) {
  setUserEnrollment({)
  ...userEnrollment,
  progress: {
  ...userEnrollment.progress,
  overallProgress: progress,
});
  }, [userEnrollment]);
  // Handle path completion
  const handlePathComplete = useCallback(() => {
    // Show completion celebration or navigate back to dashboard
    setCurrentView('dashboard');
    setSelectedPath(null);
    setUserEnrollment(null);
  }, []);
  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setSelectedPath(null);
    setUserEnrollment(null);
  }, []);
  // Render loading state
  if (loading && !selectedPath) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading learning system...</span>
        </div>
      </div>
    );
  // Render error state
  if (error && !selectedPath) {
    return;
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Learning System Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  return;
    <div className="epic16-learning-paths h-full">
      {currentView === 'dashboard' && ()
        <div className="h-full">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-2">
            <nav className="flex" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="ml-2 text-sm font-medium text-gray-500">Epic 16</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-900">Learning Paths</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          <LearningPathDashboard
            learningService={learningService}
            userId={userId}
            userRole={userRole}
            onPathSelect={handlePathSelect}
          />
        </div>
      )}
      {currentView === 'viewer' && selectedPath && ()
        <div className="h-full">
          {/* Navigation Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <nav className="flex" aria-label="Breadcrumb">
                <ol role="list" className="flex items-center space-x-4">
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-500">Epic 16</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <button
                        onClick={handleBackToDashboard}
                        className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Learning Paths
                      </button>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-900 truncate max-w-xs">
                        {selectedPath.title}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex items-center space-x-3">
                {userEnrollment && ()
                  <div className="text-sm text-gray-600">
                    Progress: {Math.round(userEnrollment.progress.overallProgress)}%
                  </div>
                )}
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
          <div className="h-full" style={{ height: 'calc(100% - 60px)' }}>
            <LearningPathViewer
              path={selectedPath}
              learningService={learningService}
              userId={userId}
              enrollment={userEnrollment}
              onProgress={handleProgress}
              onComplete={handlePathComplete}
            />
          </div>
        </div>
      )}
      {/* Global Loading Overlay */}
      {loading && selectedPath && ()
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading...</span>
            </div>
          </div>
        </div>
      )}
      {/* Global Error Toast */}
      {error && selectedPath && ()
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 shadow-lg z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Epic16LearningPaths;