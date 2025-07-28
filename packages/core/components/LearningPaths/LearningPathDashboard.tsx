/**
 * Epic 16 Learning Path Dashboard
 * 
 * Comprehensive dashboard for managing and discovering learning paths
 * with personalized recommendations, progress tracking, and analytics.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LearningPath,
  LearningCategory,
  DifficultyLevel,
  TargetAudience,
  UserEnrollment,
  EnrollmentStatus,
  Epic16LearningPathService
} from '../../services/Epic16LearningPathService';
interface LearningPathDashboardProps {
  learningService: Epic16LearningPathService;
  userId: string;
  userRole: 'user' | 'creator' | 'admin';
  onPathSelect?: (path: LearningPath) => void;
}
interface PathFilters {
  category: LearningCategory[];
  difficulty: DifficultyLevel[];
  audience: TargetAudience[];
  duration: { min?: number; max?: number };
  certification: boolean | null;
  searchQuery: string;
}

export const LearningPathDashboard: React.FC<LearningPathDashboardProps> = ({)
  learningService,
  userId,
  userRole,
  onPathSelect
}) => {
  // State management
  const [availablePaths, setAvailablePaths] = useState<LearningPath[]>([]);
  const [userPaths, setUserPaths] = useState<UserEnrollment[]>([]);
  const [recommendations, setRecommendations] = useState<LearningPath[]>([]);
  const [_____selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PathFilters>({)
    category: [],
    difficulty: [],
    audience: [],
    duration: {},
    certification: null,
    searchQuery: '',
  });
  const [view, setView] = useState<'discover' | 'my-learning' | 'recommendations' | 'analytics'>('discover');
  const [analytics, setAnalytics] = useState<unknown>(null);
  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load available paths
      const searchResults = await learningService.searchLearningPaths('', {)
        category: filters.category.length > 0 ? filters.category : undefined,
        difficulty: filters.difficulty.length > 0 ? filters.difficulty : undefined,
        audience: filters.audience.length > 0 ? filters.audience : undefined,
        duration: Object.keys(filters.duration).length > 0 ? filters.duration : undefined,
        certification: filters.certification ?? undefined
      });
      setAvailablePaths(searchResults);
      // Load user's paths
      const userEnrollments = await learningService.getUserPaths(userId);
      setUserPaths(userEnrollments);
      // Load recommendations
      const pathRecommendations = await learningService.getRecommendations(userId, 5);
      setRecommendations(pathRecommendations);
      // Load analytics if admin/creator
      if (userRole !== 'user') {
        const analyticsData = await learningService.getAnalytics();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  }, [learningService, userId, userRole, filters]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  // Filter paths based on search query
  const filteredPaths = useMemo(() => {
    if (!filters.searchQuery) return availablePaths;
    const query = filters.searchQuery.toLowerCase();
    return availablePaths.filter(path =>)
      path.title.toLowerCase().includes(query) ||
      path.description.toLowerCase().includes(query) ||
      path.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [availablePaths, filters.searchQuery]);
  // Handle path enrollment
  const handleEnroll = async (pathId: string) => {
    try {
      await learningService.enrollUser(userId, pathId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in path');
    }
  };
  // Handle path selection
  const handlePathSelect = (path: LearningPath) => {
    setSelectedPath(path);
    onPathSelect?.(path);
  };
  // Reset filters
  const resetFilters = () => {
    setFilters({)
      category: [],
      difficulty: [],
      audience: [],
      duration: {},
      certification: null,
      searchQuery: '',
    });
  };
  // Render learning path card
  const renderPathCard = (path: LearningPath, enrollment?: UserEnrollment) => {
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress.overallProgress || 0;
    const status = enrollment?.status;
    return ()
      <div
        key={path.id}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handlePathSelect(path)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{path.description}</p>
          </div>
          {path.certification && ()
            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Certificate
              </span>
            </div>
          )}
        </div>
        {/* Metadata */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.floor(path.estimatedDuration / 60)}h {path.estimatedDuration % 60}m
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {path.analytics.enrollments} enrolled
          </div>
        </div>
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {path.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          {path.tags.slice(0, 3).map((tag) => ()
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
        {/* Progress or Action */}
        <div className="flex items-center justify-between">
          {isEnrolled ? ()
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  status === EnrollmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    status === EnrollmentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                  {status?.replace('_', ' ').toUpperCase()}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Continue →
                </button>
              </div>
            </div>
          ) : ()
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">{path.analytics.satisfactionRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {path.analytics.completionRate.toFixed(0)}% completion
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnroll(path.id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Enroll
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  if (loading) {
    return ()
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading learning paths...</span>
        </div>
      </div>
    );
  }
  return ()
    <div className="learning-path-dashboard h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Paths</h1>
            <p className="text-sm text-gray-600">
              Epic 16 Marketplace & Community Learning System
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {userRole !== 'user' && ()
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                Create Path
              </button>
            )}
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {error && ()
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
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
        {/* Navigation Tabs */}
        <div className="mt-4">
          <nav className="flex space-x-8">
            {[
              { key: 'discover', label: 'Discover', icon: '🔍' },
              { key: 'my-learning', label: 'My Learning', icon: '📚' },
              { key: 'recommendations', label: 'Recommended', icon: '✨' },
              ...(userRole !== 'user' ? [{ key: 'analytics', label: 'Analytics', icon: '📊' }] : [])
            ].map((tab) => ()
              <button
                key={tab.key}
                onClick={() => setView(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-1 flex">
        {/* Sidebar - Filters (only for discover view) */}
        {view === 'discover' && ()
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Search learning paths..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.values(LearningCategory).map((category) => ()
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={(e) => {
                          const newCategories = e.target.checked;
                            ? [...filters.category, category]
                            : filters.category.filter(c => c !== category);
                          setFilters({ ...filters, category: newCategories });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="space-y-2">
                  {Object.values(DifficultyLevel).map((difficulty) => ()
                    <label key={difficulty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(difficulty)}
                        onChange={(e) => {
                          const newDifficulties = e.target.checked;
                            ? [...filters.difficulty, difficulty]
                            : filters.difficulty.filter(d => d !== difficulty);
                          setFilters({ ...filters, difficulty: newDifficulties });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 capitalize">
                        {difficulty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Target Audience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.values(TargetAudience).map((audience) => ()
                    <label key={audience} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.audience.includes(audience)}
                        onChange={(e) => {
                          const newAudience = e.target.checked;
                            ? [...filters.audience, audience]
                            : filters.audience.filter(a => a !== audience);
                          setFilters({ ...filters, audience: newAudience });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {audience.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.duration.min || ''}
                    onChange={(e) => setFilters({)
                      ...filters,
                      duration: { ...filters.duration, min: e.target.value ? parseInt(e.target.value) * 60 : undefined }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.duration.max ? Math.floor(filters.duration.max / 60) : ''}
                    onChange={(e) => setFilters({)
                      ...filters,
                      duration: { ...filters.duration, max: e.target.value ? parseInt(e.target.value) * 60 : undefined }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              {/* Certification Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.certification === true}
                    onChange={(e) => setFilters({ ...filters, certification: e.target.checked ? true : null })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Certification available
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'discover' && ()
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Learning Paths ({filteredPaths.length})
                </h2>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Sort by Popularity</option>
                  <option>Sort by Rating</option>
                  <option>Sort by Duration</option>
                  <option>Sort by Newest</option>
                </select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPaths.map((path) => renderPathCard(path))}
              </div>
              {filteredPaths.length === 0 && ()
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No learning paths found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search criteria or browse all available paths.
                  </p>
                </div>
              )}
            </div>
          )}
          {view === 'my-learning' && ()
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Learning ({userPaths.length})
                </h2>
              </div>
              {userPaths.length === 0 ? ()
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled learning paths</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start learning by enrolling in a path from the discover section.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setView('discover')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Discover Paths
                    </button>
                  </div>
                </div>
              ) : ()
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {userPaths.map((enrollment) => {
                    const path = availablePaths.find(p => p.id === enrollment.pathId);
                    return path ? renderPathCard(path, enrollment) : null;
                  })}
                </div>
              )}
            </div>
          )}
          {view === 'recommendations' && ()
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended for You ({recommendations.length})
                </h2>
              </div>
              {recommendations.length === 0 ? ()
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete some learning paths to get personalized recommendations.
                  </p>
                </div>
              ) : ()
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommendations.map((path) => renderPathCard(path))}
                </div>
              )}
            </div>
          )}
          {view === 'analytics' && userRole !== 'user' && analytics && ()
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Learning Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalPaths}</div>
                  <div className="text-sm text-gray-600">Total Paths</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600">{analytics.totalEnrollments}</div>
                  <div className="text-sm text-gray-600">Total Enrollments</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600">{analytics.totalCompletions}</div>
                  <div className="text-sm text-gray-600">Completions</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-600">{analytics.overallCompletionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Growth</h3>
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2">Analytics charts would be implemented here with a charting library like Chart.js or D3.js</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathDashboard;