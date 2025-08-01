/**
 * Epic 16 Learning Path Viewer
 * 
 * Detailed view for learning paths with module navigation,
 * progress tracking, interactive content, and assessments.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LearningPath,
  LearningModule,
  LearningActivity,
  UserEnrollment,
  ModuleProgress }
  Epic16LearningPathService
 from '../../services/Epic16LearningPathService';


interface LearningPathViewerProps { path: LearningPath;
  learningService: Epic16LearningPathService;
  userId: string;
  enrollment?: UserEnrollment;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  export const LearningPathViewer: React.FC<LearningPathViewerProps> = ({);
  path;
  learningService;
  userId;
  enrollment;
  onProgress }
  onComplete


}) => { // State management
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [currentActivity, setCurrentActivity] = useState<LearningActivity | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Initialize current module
  useEffect(() => {
    if (path.modules.length > 0) {
      const currentModuleId = enrollment?.progress.currentModule || path.modules[0].id;
      const module = path.modules.find(m => m.id === currentModuleId) || path.modules[0];
      setCurrentModule(module);
      // Set progress if available
      if (enrollment?.progress.moduleProgress[module.id]) {
        setModuleProgress(enrollment.progress.moduleProgress[module.id]) }, [path, enrollment]);
  // Calculate overall progress
  const overallProgress = useMemo(() => { if (!enrollment) return 0;
    return enrollment.progress.overallProgress }, [enrollment]);
  // Handle module selection
  const handleModuleSelect = useCallback((module: LearningModule) => { setCurrentModule(module);
    setCurrentActivity(null);
    // Set progress for this module
    if (enrollment?.progress.moduleProgress[module.id]) {
      setModuleProgress(enrollment.progress.moduleProgress[module.id]) } else { setModuleProgress(null) }, [enrollment]);
  // Handle activity selection
  const handleActivitySelect = useCallback((activity: LearningActivity) => { setCurrentActivity(activity) }, []);
  // Handle activity completion
  const handleActivityComplete = useCallback(async (activityId: string) => { if (!currentModule || !enrollment) return;
    setLoading(true);
    setError(null);
    try {
      const updatedProgress = await learningService.updateProgress(;);
        userId
        path.id
        currentModule.id }
        activityId
      );
      if (updatedProgress) { // Update local progress
        setModuleProgress(updatedProgress.moduleProgress[currentModule.id] || null);
        onProgress?.(updatedProgress.overallProgress);
        // Check if path is completed
        if (updatedProgress.overallProgress >= 100) {
          onComplete?.() } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update progress') } finally { setLoading(false) }, [currentModule, enrollment, learningService, userId, path.id, onProgress, onComplete]);
  // Get module status
  const getModuleStatus = useCallback((module: LearningModule) => { if (!enrollment) return 'not_started';
  const completed = enrollment.progress.completedModules.includes(module.id);
  const current = enrollment.progress.currentModule === module.id;
  const progress = enrollment.progress.moduleProgress[module.id];
  if (completed) return 'completed';
  if (current || (progress && progress.progress > 0)) return 'in_progress';
  // Check if prerequisites are met
  const prerequisitesMet = module.prerequisites.every(prereqId =>;);
  enrollment.progress.completedModules.includes(prereqId)
  );
  return prerequisitesMet ? 'available' : 'locked' }
}, [enrollment]);
  // Get activity status
  const getActivityStatus = useCallback((activity: LearningActivity) => {
    if (!enrollment || !currentModule) return 'not_started';
    const completed = enrollment.progress.completedActivities.includes(activity.id);
    if (completed) return 'completed';
    return 'available'
  }, [enrollment, currentModule]);
  // Render module sidebar
  const renderModuleSidebar = () => (;);
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Path header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{path.title}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Overall progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
        {/* Path metadata */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.floor(path.estimatedDuration / 60)}h {path.estimatedDuration % 60}m
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {path.modules.length} modules
          </div>
        </div>
      </div>
      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {path.modules.map((module, index) => {
            const status = getModuleStatus(module);
            const isActive = currentModule?.id === module.id;
            const progress = enrollment?.progress.moduleProgress[module.id];
            return;
              <div
                key={module.id}
                className={ `rounded-lg border p-4 cursor-pointer transition-all ${
  isActive
  ? 'bg-blue-50 border-blue-200'
  : status === 'locked'
  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
  : 'bg-white border-gray-200 hover:border-gray-300' }
`}
                onClick={() => status !== 'locked' && handleModuleSelect(module)}
              >
                <div className="flex items-start space-x-3">
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-1">
                    {status === 'completed' && ()
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {status === 'in_progress' && ()
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    {status === 'available' && ()
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                      </div>
                    )}
                    {status === 'locked' && ()
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Module content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{module.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{module.description}</p>
                    {/* Module metadata */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{module.duration}min</span>
                        <span>•</span>
                        <span>{module.activities.length} activities</span>
                        {module.quiz && ()
                          <>
                            <span>•</span>
                            <span>Quiz</span>
                          </>
                        )}
                      </div>
                      {progress && ()
                        <span className="text-xs text-gray-500">
                          {Math.round(progress.progress)}%
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    {progress && progress.progress > 0 && ()
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Path actions */}
      <div className="p-4 border-t border-gray-200">
        {path.certification && ()
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Certification Available</p>
                <p className="text-xs text-yellow-700">{path.certification.name}</p>
              </div>
            </div>
          </div>
        )}
        <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
          View Path Details
        </button>
      </div>
    </div>
  );
  // Render main content
  const renderMainContent = () => {
    if (!currentModule) {
      return;
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Select a module to start learning</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose a module from the sidebar to begin your learning journey.
            </p>
          </div>
        </div>
      );
    return;
      <div className="flex flex-col h-full">
        {/* Module header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentModule.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{currentModule.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Module progress */}
              {moduleProgress && ()
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {Math.round(moduleProgress.progress)}% Complete
                  </div>
                  <div className="text-xs text-gray-500">
                    {moduleProgress.completedActivities.length} of {currentModule.activities.length + (currentModule.quiz ? 1 : 0)} activities
                  </div>
                </div>
              )}
              {!sidebarOpen && ()
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {/* Module progress bar */}
          {moduleProgress && ()
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${moduleProgress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        {/* Content area */}
        <div className="flex-1 flex">
          {/* Activity list */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Activities</h3>
              <div className="space-y-2">
                {currentModule.content.map((content, index) => ()
                  <div
                    key={content.id}
                    className="bg-white border border-gray-200 rounded-md p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{content.title}</h4>
                        <p className="text-xs text-gray-500">{content.type.replace('_', ' ')} • {content.duration}min</p>
                      </div>
                    </div>
                  </div>
                ))}
                {currentModule.activities.map((activity) => {
                  const status = getActivityStatus(activity);
                  const isActive = currentActivity?.id === activity.id;
                  return;
                    <div
                      key={activity.id}
                      className={ `border rounded-md p-3 cursor-pointer transition-all ${
  isActive
  ? 'bg-blue-50 border-blue-200'
  : 'bg-white border-gray-200 hover:border-gray-300' }
`}
                      onClick={() => handleActivitySelect(activity)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {status === 'completed' ? ()
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : ()
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
                          <p className="text-xs text-gray-500">
                            {activity.type.replace('_', ' ')} • {activity.estimatedTime}min
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {currentModule.quiz && ()
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Module Quiz</h4>
                        <p className="text-xs text-gray-500">
                          {currentModule.quiz.questions.length} questions • {currentModule.quiz.timeLimit || 'No time limit'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Activity content */}
          <div className="flex-1 overflow-y-auto">
            {currentActivity ? ()
              <ActivityViewer
                activity={currentActivity}
                onComplete={() => handleActivityComplete(currentActivity.id)}
                loading={loading}
              />
            ) : ()
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select an activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose an activity from the list to start learning.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  return;
    <div className="learning-path-viewer h-full flex">
      {/* Collapsible sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'},}
  md:block`}>}
        {renderModuleSidebar()}
      </div>
      {/* Main content */}
      <div className="flex-1">
        {error && ()
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {renderMainContent()}
      </div>
    </div>
  );
};

// Activity Viewer Component


interface ActivityViewerProps { activity: LearningActivity;
  onComplete: () => void;
  loading?: boolean;
  const ActivityViewer: React.FC<ActivityViewerProps> = ({);
  activity;
  onComplete }
  loading = false


}) => { const [completed, setCompleted] = useState(false);
  const handleComplete = () => {
    setCompleted(true);
    onComplete() };
  return;
    <div className="p-6">
      {/* Activity header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{activity.estimatedTime} minutes</span>
          </div>
        </div>
        <p className="text-gray-600">{activity.description}</p>
        {/* Activity type badge */}
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {activity.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
      </div>
      {/* Instructions */}
      {activity.instructions.length > 0 && ()
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-1">
            {activity.instructions.map((instruction, index) => ()
              <li key={index} className="text-sm text-blue-800">{instruction}</li>
            ))}
          </ol>
        </div>
      )}
      {/* Activity content */}
      <div className="mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-64">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" />
            </svg>
            <p className="mt-2">Interactive activity content would be rendered here</p>
            <p className="text-sm mt-1">
              Implementation would include multimedia content, interactive exercises
              code editors, simulations, and assessment tools based on activity type.
            </p>
          </div>
        </div>
      </div>
      {/* Resources */}
      {activity.resources.length > 0 && ()
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activity.resources.map((resource, index) => ()
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{resource.name}</h4>
                    <p className="text-xs text-gray-500">{resource.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Completion button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {activity.config.showHints && ()
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Show Hint
            </button>
          )}
        </div>
        <button
          onClick={handleComplete}
          disabled={completed || loading}
          className={ `px-6 py-2 text-sm font-medium rounded-md ${
  completed
  ? 'bg-green-100 text-green-800 cursor-not-allowed'
  : loading
  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
  : 'bg-blue-600 text-white hover:bg-blue-700' }
`}
        >
          {completed ? 'Completed ✓' : loading ? 'Saving...' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
};

export default LearningPathViewer;