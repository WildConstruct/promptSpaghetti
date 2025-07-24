import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Learning Path Dashboard
 *
 * Comprehensive dashboard for managing and discovering learning paths
 * with personalized recommendations, progress tracking, and analytics.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { LearningCategory, DifficultyLevel, TargetAudience, EnrollmentStatus } from '../../services/Epic16LearningPathService.js';
export const LearningPathDashboard = ({ learningService, userId, userRole, onPathSelect }) => {
    // State management
    const [availablePaths, setAvailablePaths] = useState([]);
    const [userPaths, setUserPaths] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [_____selectedPath, setSelectedPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: [],
        difficulty: [],
        audience: [],
        duration: {},
        certification: null,
        searchQuery: ''
    });
    const [view, setView] = useState('discover');
    const [analytics, setAnalytics] = useState(null);
    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Load available paths
            const searchResults = await learningService.searchLearningPaths('', {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load learning paths');
        }
        finally {
            setLoading(false);
        }
    }, [learningService, userId, userRole, filters]);
    useEffect(() => {
        loadData();
    }, [loadData]);
    // Filter paths based on search query
    const filteredPaths = useMemo(() => {
        if (!filters.searchQuery)
            return availablePaths;
        const query = filters.searchQuery.toLowerCase();
        return availablePaths.filter(path => path.title.toLowerCase().includes(query) ||
            path.description.toLowerCase().includes(query) ||
            path.tags.some(tag => tag.toLowerCase().includes(query)));
    }, [availablePaths, filters.searchQuery]);
    // Handle path enrollment
    const handleEnroll = async (pathId) => {
        try {
            await learningService.enrollUser(userId, pathId);
            await loadData(); // Refresh data
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enroll in path');
        }
    };
    // Handle path selection
    const handlePathSelect = (path) => {
        setSelectedPath(path);
        onPathSelect?.(path);
    };
    // Reset filters
    const resetFilters = () => {
        setFilters({
            category: [],
            difficulty: [],
            audience: [],
            duration: {},
            certification: null,
            searchQuery: ''
        });
    };
    // Render learning path card
    const renderPathCard = (path, enrollment) => {
        const isEnrolled = !!enrollment;
        const progress = enrollment?.progress.overallProgress || 0;
        const status = enrollment?.status;
        return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer", onClick: () => handlePathSelect(path), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: path.title }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: path.description })] }), path.certification && (_jsx("div", { className: "ml-4", children: _jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: [_jsx("svg", { className: "w-3 h-3 mr-1", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Certificate"] }) }))] }), _jsxs("div", { className: "flex items-center space-x-4 mb-4 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), Math.floor(path.estimatedDuration / 60), "h ", path.estimatedDuration % 60, "m"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }), path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)] }), _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }), path.analytics.enrollments, " enrolled"] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded", children: path.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }), path.tags.slice(0, 3).map((tag) => (_jsx("span", { className: "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded", children: tag }, tag)))] }), _jsx("div", { className: "flex items-center justify-between", children: isEnrolled ? (_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Progress" }), _jsxs("span", { className: "text-sm text-gray-500", children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx("span", { className: `text-xs font-medium px-2 py-1 rounded-full ${status === EnrollmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                            status === EnrollmentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`, children: status?.replace('_', ' ').toUpperCase() }), _jsx("button", { className: "text-blue-600 hover:text-blue-800 text-sm font-medium", children: "Continue \u2192" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-4 h-4 text-yellow-400 mr-1", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }), _jsx("span", { className: "text-sm text-gray-600", children: path.analytics.satisfactionRating.toFixed(1) })] }), _jsxs("span", { className: "text-sm text-gray-500", children: [path.analytics.completionRate.toFixed(0), "% completion"] })] }), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    handleEnroll(path.id);
                                }, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Enroll" })] })) })] }, path.id));
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading learning paths..." })] }) }));
    }
    return (_jsxs("div", { className: "learning-path-dashboard h-full flex flex-col", children: [_jsxs("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Learning Paths" }), _jsx("p", { className: "text-sm text-gray-600", children: "Epic 16 Marketplace & Community Learning System" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [userRole !== 'user' && (_jsx("button", { className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Create Path" })), _jsx("button", { onClick: resetFilters, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Clear Filters" })] })] }), error && (_jsx("div", { className: "mt-4 bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) })] }) })), _jsx("div", { className: "mt-4", children: _jsx("nav", { className: "flex space-x-8", children: [
                                { key: 'discover', label: 'Discover', icon: '🔍' },
                                { key: 'my-learning', label: 'My Learning', icon: '📚' },
                                { key: 'recommendations', label: 'Recommended', icon: '✨' },
                                ...(userRole !== 'user' ? [{ key: 'analytics', label: 'Analytics', icon: '📊' }] : [])
                            ].map((tab) => (_jsxs("button", { onClick: () => setView(tab.key), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: [_jsx("span", { className: "mr-2", children: tab.icon }), tab.label] }, tab.key))) }) })] }), _jsxs("div", { className: "flex-1 flex", children: [view === 'discover' && (_jsx("div", { className: "w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search" }), _jsx("input", { type: "text", value: filters.searchQuery, onChange: (e) => setFilters({ ...filters, searchQuery: e.target.value }), placeholder: "Search learning paths...", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: Object.values(LearningCategory).map((category) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.category.includes(category), onChange: (e) => {
                                                            const newCategories = e.target.checked
                                                                ? [...filters.category, category]
                                                                : filters.category.filter(c => c !== category);
                                                            setFilters({ ...filters, category: newCategories });
                                                        }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-600", children: category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) })] }, category))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Difficulty" }), _jsx("div", { className: "space-y-2", children: Object.values(DifficultyLevel).map((difficulty) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.difficulty.includes(difficulty), onChange: (e) => {
                                                            const newDifficulties = e.target.checked
                                                                ? [...filters.difficulty, difficulty]
                                                                : filters.difficulty.filter(d => d !== difficulty);
                                                            setFilters({ ...filters, difficulty: newDifficulties });
                                                        }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-600 capitalize", children: difficulty })] }, difficulty))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Target Audience" }), _jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: Object.values(TargetAudience).map((audience) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.audience.includes(audience), onChange: (e) => {
                                                            const newAudience = e.target.checked
                                                                ? [...filters.audience, audience]
                                                                : filters.audience.filter(a => a !== audience);
                                                            setFilters({ ...filters, audience: newAudience });
                                                        }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-600", children: audience.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) })] }, audience))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Duration (hours)" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", placeholder: "Min", value: filters.duration.min || '', onChange: (e) => setFilters({
                                                        ...filters,
                                                        duration: { ...filters.duration, min: e.target.value ? parseInt(e.target.value) * 60 : undefined }
                                                    }), className: "px-3 py-2 border border-gray-300 rounded-md text-sm" }), _jsx("input", { type: "number", placeholder: "Max", value: filters.duration.max ? Math.floor(filters.duration.max / 60) : '', onChange: (e) => setFilters({
                                                        ...filters,
                                                        duration: { ...filters.duration, max: e.target.value ? parseInt(e.target.value) * 60 : undefined }
                                                    }), className: "px-3 py-2 border border-gray-300 rounded-md text-sm" })] })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.certification === true, onChange: (e) => setFilters({ ...filters, certification: e.target.checked ? true : null }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Certification available" })] }) })] }) })), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [view === 'discover' && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: ["All Learning Paths (", filteredPaths.length, ")"] }), _jsxs("select", { className: "px-3 py-2 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { children: "Sort by Popularity" }), _jsx("option", { children: "Sort by Rating" }), _jsx("option", { children: "Sort by Duration" }), _jsx("option", { children: "Sort by Newest" })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: filteredPaths.map((path) => renderPathCard(path)) }), filteredPaths.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No learning paths found" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Try adjusting your search criteria or browse all available paths." })] }))] })), view === 'my-learning' && (_jsxs("div", { children: [_jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: ["My Learning (", userPaths.length, ")"] }) }), userPaths.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No enrolled learning paths" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Start learning by enrolling in a path from the discover section." }), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: () => setView('discover'), className: "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: "Discover Paths" }) })] })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: userPaths.map((enrollment) => {
                                            const path = availablePaths.find(p => p.id === enrollment.pathId);
                                            return path ? renderPathCard(path, enrollment) : null;
                                        }) }))] })), view === 'recommendations' && (_jsxs("div", { children: [_jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: ["Recommended for You (", recommendations.length, ")"] }) }), recommendations.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No recommendations available" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Complete some learning paths to get personalized recommendations." })] })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: recommendations.map((path) => renderPathCard(path)) }))] })), view === 'analytics' && userRole !== 'user' && analytics && (_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-6", children: "Learning Analytics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: analytics.totalPaths }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Paths" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: analytics.totalEnrollments }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Enrollments" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: analytics.totalCompletions }), _jsx("div", { className: "text-sm text-gray-600", children: "Completions" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("div", { className: "text-3xl font-bold text-yellow-600", children: [analytics.overallCompletionRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Completion Rate" })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Platform Growth" }), _jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }), _jsx("p", { className: "mt-2", children: "Analytics charts would be implemented here with a charting library like Chart.js or D3.js" })] })] })] }))] })] })] }));
};
export default LearningPathDashboard;
