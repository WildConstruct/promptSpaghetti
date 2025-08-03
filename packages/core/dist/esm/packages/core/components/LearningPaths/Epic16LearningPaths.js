import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Learning Paths Integration
 *
 * Main integration component that brings together the learning path
 * dashboard, viewer, and service components for Epic 16 Marketplace
 * & Community learning system.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
from;
'../../services/Epic16LearningPathService';
import { LearningPathDashboard } from './LearningPathDashboard';
import { LearningPathViewer } from './LearningPathViewer';
{ // Service initialization
    const learningService = useMemo(() => new Epic16LearningPathService(), []);
    // State management
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedPath, setSelectedPath] = useState(null);
    const [userEnrollment, setUserEnrollment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
                learningService.on('analyticsUpdate', (analytics) => { onAnalytics?.(analytics); });
                learningService.on('pathCompleted', async (data) => {
                    const { userId: completedUserId, pathId } = data;
                    if (completedUserId === userId) {
                        // Handle path completion
                        console.log(`Path ${pathId} completed by user ${userId}`);
                    }
                });
                learningService.on('skillUnlocked', (skill) => {
                    console.log('Skill unlocked:', skill);
                });
                try {
                }
                catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to initialize learning service');
                }
                finally {
                    setLoading(false);
                }
                ;
                initializeService();
                // Cleanup event listeners
                return () => { learningService.removeAllListeners(); };
            }
            finally { }
            [learningService, userId, onAnalytics, onCertification];
        };
    });
    // Handle path selection from dashboard
    const handlePathSelect = useCallback(async (path) => {
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
            }
            try { }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load learning path');
            }
            finally {
                setLoading(false);
            }
            [learningService, userId];
        }
        finally { }
    });
    // Handle progress updates
    const handleProgress = useCallback((progress) => {
        if (userEnrollment) {
            setUserEnrollment({});
        }
    }, ...userEnrollment, progress, {
        ...userEnrollment.progress,
        overallProgress: progress
    });
}
;
[userEnrollment];
;
// Handle path completion
const handlePathComplete = useCallback(() => {
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
    _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading learning system..." })] }) });
    ;
    // Render error state
    if (error && !selectedPath) {
        return;
        _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Learning System Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: _jsx("p", { children: error }) }), _jsx("div", { className: "mt-4", children: _jsx("button", { onClick: () => window.location.reload(), className: "bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200", children: "Retry" }) })] })] }) });
        ;
        return;
        _jsxs("div", { className: "epic16-learning-paths h-full", children: [currentView === 'dashboard' && ()
                    < div, " className=\"h-full\">", _jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-2", children: _jsx("nav", { className: "flex", "aria-label": "Breadcrumb", children: _jsxs("ol", { role: "list", className: "flex items-center space-x-4", children: [_jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "flex-shrink-0 h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" }) }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-500", children: "Epic 16" })] }) }), _jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "flex-shrink-0 h-5 w-5 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-4 text-sm font-medium text-gray-900", children: "Learning Paths" })] }) })] }) }) }), _jsx(LearningPathDashboard, { learningService: learningService, userId: userId, userRole: userRole, onPathSelect: handlePathSelect })] });
    }
    {
        currentView === 'viewer' && selectedPath && ()
            < div;
        className = "h-full" >
            { /* Navigation Bar */}
            < div;
        className = "bg-white border-b border-gray-200 px-6 py-3" >
            _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("nav", { className: "flex", "aria-label": "Breadcrumb", children: _jsxs("ol", { role: "list", className: "flex items-center space-x-4", children: [_jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "flex-shrink-0 h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" }) }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-500", children: "Epic 16" })] }) }), _jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "flex-shrink-0 h-5 w-5 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), _jsx("button", { onClick: handleBackToDashboard, className: "ml-4 text-sm font-medium text-blue-600 hover:text-blue-800", children: "Learning Paths" })] }) }), _jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "flex-shrink-0 h-5 w-5 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-4 text-sm font-medium text-gray-900 truncate max-w-xs", children: selectedPath.title })] }) })] }) }), _jsxs("div", { className: "flex items-center space-x-3", children: [userEnrollment && ()
                                < div, " className=\"text-sm text-gray-600\"> Progress: ", Math.round(userEnrollment.progress.overallProgress), "%"] }), ")}", _jsx("button", { onClick: handleBackToDashboard, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Back to Dashboard" })] });
        div >
        ;
        div >
            _jsx("div", { className: "h-full", style: { height: 'calc(100% - 60px)' }, children: _jsx(LearningPathViewer, { path: selectedPath, learningService: learningService, userId: userId, enrollment: userEnrollment, onProgress: handleProgress, onComplete: handlePathComplete }) });
        div >
        ;
    }
    { /* Global Loading Overlay */ }
    {
        loading && selectedPath && ()
            < div;
        className = "fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50" >
            _jsx("div", { className: "bg-white rounded-lg p-6 shadow-xl", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-700", children: "Loading..." })] }) });
        div >
        ;
    }
    { /* Global Error Toast */ }
    {
        error && selectedPath && ()
            < div;
        className = "fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 shadow-lg z-50" >
            _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) }), _jsx("div", { className: "ml-auto pl-3", children: _jsx("button", { onClick: () => setError(null), className: "inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100", children: _jsx("svg", { className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }) })] });
        div >
        ;
    }
    div >
    ;
    ;
}
;
export default Epic16LearningPaths;
