import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Help Request System - Main Component
 *
 * Main integration component that brings together all Epic 16 help request
 * functionality including dashboard, form, and intelligent routing.
 */
import { useState, useEffect, useMemo } from 'react';
import { Epic16HelpRequestService } from '../../services/Epic16HelpRequestService';
import HelpRequestDashboard from './HelpRequestDashboard';
import HelpRequestForm from './HelpRequestForm';
export const Epic16HelpRequestSystem = ({ userId, userRole, userType, userTier, config, onConfigChange }) => {
    // Service instance
    const helpService = useMemo(() => {
        return new Epic16HelpRequestService(config);
    }, [config]);
    // State management
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [view, setView] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    // Set up event listeners for service events
    useEffect(() => {
        const handleRequestSubmitted = (data) => {
            setNotifications(prev => [...prev, {
                    id: `submitted-${data.request.id}`,
                    type: 'success',
                    message: `Help request ${data.request.id} has been submitted`,
                    timestamp: new Date()
                }]);
        };
        const handleRequestAutoResolved = (data) => {
            setNotifications(prev => [...prev, {
                    id: `auto-resolved-${data.request.id}`,
                    type: 'info',
                    message: `Help request ${data.request.id} was automatically resolved`,
                    timestamp: new Date()
                }]);
        };
        const handleRequestStatusChanged = (data) => {
            setNotifications(prev => [...prev, {
                    id: `status-${data.request.id}-${Date.now()}`,
                    type: 'info',
                    message: `Help request ${data.request.id} status changed to ${data.newStatus}`,
                    timestamp: new Date()
                }]);
        };
        const handleRequestEscalated = (data) => {
            setNotifications(prev => [...prev, {
                    id: `escalated-${data.request.id}`,
                    type: 'warning',
                    message: `Help request ${data.request.id} has been escalated`,
                    timestamp: new Date()
                }]);
        };
        const handleResponseAdded = (data) => {
            setNotifications(prev => [...prev, {
                    id: `response-${data.request.id}-${Date.now()}`,
                    type: 'info',
                    message: `New response added to help request ${data.request.id}`,
                    timestamp: new Date()
                }]);
        };
        // Subscribe to events
        helpService.on('help_request_submitted', handleRequestSubmitted);
        helpService.on('help_request_auto_resolved', handleRequestAutoResolved);
        helpService.on('help_request_status_changed', handleRequestStatusChanged);
        helpService.on('help_request_escalated', handleRequestEscalated);
        helpService.on('help_response_added', handleResponseAdded);
        return () => {
            // Cleanup listeners
            helpService.off('help_request_submitted', handleRequestSubmitted);
            helpService.off('help_request_auto_resolved', handleRequestAutoResolved);
            helpService.off('help_request_status_changed', handleRequestStatusChanged);
            helpService.off('help_request_escalated', handleRequestEscalated);
            helpService.off('help_response_added', handleResponseAdded);
        };
    }, [helpService]);
    // Auto-dismiss notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(1));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notifications]);
    // Handle request selection
    const handleRequestSelect = (request) => {
        setSelectedRequest(request);
    };
    // Handle form submission
    const handleFormSubmitted = (request) => {
        setSelectedRequest(request);
        setView('dashboard');
    };
    // Handle view navigation
    const handleViewChange = (newView) => {
        setView(newView);
    };
    return (_jsxs("div", { className: "epic16-help-request-system h-full flex flex-col relative", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("nav", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => handleViewChange('dashboard'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'dashboard'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Help Dashboard" }), _jsx("button", { onClick: () => handleViewChange('form'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'form'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Submit Request" }), userRole === 'admin' && (_jsx("button", { onClick: () => handleViewChange('settings'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Settings" }))] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["User: ", _jsx("span", { className: "font-medium", children: userId })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Role: ", _jsx("span", { className: "font-medium capitalize", children: userRole })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Tier: ", _jsx("span", { className: "font-medium capitalize", children: userTier })] })] })] }) }), _jsxs("div", { className: "flex-1 overflow-hidden", children: [view === 'dashboard' && (_jsx(HelpRequestDashboard, { helpService: helpService, userId: userId, userRole: userRole, onRequestSelect: handleRequestSelect })), view === 'form' && (_jsx("div", { className: "p-6 overflow-y-auto", children: _jsx(HelpRequestForm, { helpService: helpService, userId: userId, userType: userType, userTier: userTier, onSubmitted: handleFormSubmitted, onCancel: () => handleViewChange('dashboard') }) })), view === 'settings' && userRole === 'admin' && (_jsx(HelpSystemSettings, { helpService: helpService, onConfigChange: onConfigChange }))] }), _jsx(NotificationSystem, { notifications: notifications }), _jsx(HelpSystemDocumentation, {})] }));
};
const HelpSystemSettings = ({ helpService, onConfigChange }) => {
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Help System Settings" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Auto-Resolution" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm text-blue-700", children: "The Epic 16 help request system is now active with intelligent auto-resolution capabilities:" }), _jsxs("ul", { className: "mt-2 text-sm text-blue-700 list-disc list-inside space-y-1", children: [_jsx("li", { children: "AI-powered knowledge base search with 85% confidence threshold" }), _jsx("li", { children: "Smart routing based on request type, user tier, and context" }), _jsx("li", { children: "12 request types with specialized handling workflows" }), _jsx("li", { children: "SLA tracking with automatic escalation" }), _jsx("li", { children: "Real-time analytics and deflection rate monitoring" }), _jsx("li", { children: "Multi-channel integration (chat, email, community forums)" })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Auto-Resolution" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-green-400 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm font-medium text-green-800", children: "Enabled (85% threshold)" })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Smart Routing" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-green-400 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm font-medium text-green-800", children: "Active" })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Analytics" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-green-400 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm font-medium text-green-800", children: "Tracking Enabled" })] }) })] })] })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Knowledge Base Integration" }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Search Integration" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Real-time article suggestions with relevance scoring" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Auto-Suggestions" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Intelligent article recommendations during form submission" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Deflection Tracking" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Monitor self-service success rates and optimize content" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Analytics Integration" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Track article effectiveness and user satisfaction" })] })] }) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "SLA Configuration" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Priority" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Response Time" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Resolution Time" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Escalation" })] }) }), _jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: "Critical" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "15 minutes" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "4 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "Immediate" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: "Urgent" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "30 minutes" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "8 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "2 hours" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: "High" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "1 hour" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "24 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "8 hours" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: "Medium" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "4 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "72 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "24 hours" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: "Low" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "8 hours" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "7 days" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "72 hours" })] })] })] }) })] })] })] }));
};
const NotificationSystem = ({ notifications }) => {
    if (notifications.length === 0)
        return null;
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2", children: notifications.slice(-3).map((notification) => {
            const colors = {
                success: 'bg-green-50 border-green-200 text-green-700',
                error: 'bg-red-50 border-red-200 text-red-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
            };
            return (_jsx("div", { className: `max-w-sm w-full border rounded-md p-4 shadow-lg ${colors[notification.type]}`, children: _jsxs("div", { className: "flex", children: [_jsxs("div", { className: "flex-shrink-0", children: [notification.type === 'success' && (_jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) })), notification.type === 'error' && (_jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) })), notification.type === 'info' && (_jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) })), notification.type === 'warning' && (_jsx("svg", { className: "h-5 w-5 text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }))] }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium", children: notification.message }), _jsx("p", { className: "text-xs mt-1 opacity-75", children: notification.timestamp.toLocaleTimeString() })] })] }) }, notification.id));
        }) }));
};
// Help System Documentation Component
const HelpSystemDocumentation = () => {
    const [showHelp, setShowHelp] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowHelp(true), className: "fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700", title: "Help & Documentation", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), showHelp && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Epic 16 Help Request System" }), _jsx("button", { onClick: () => setShowHelp(false), className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Intelligent Help System" }), _jsx("p", { className: "text-sm text-gray-600", children: "The Epic 16 help request system provides intelligent, automated assistance with AI-powered routing, knowledge base integration, and comprehensive analytics for marketplace and community support." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Key Features" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1 list-disc list-inside", children: [_jsxs("li", { children: [_jsx("strong", { children: "Smart Routing:" }), " Intelligent assignment based on request type and context"] }), _jsxs("li", { children: [_jsx("strong", { children: "Auto-Resolution:" }), " Knowledge base suggestions with 85% confidence threshold"] }), _jsxs("li", { children: [_jsx("strong", { children: "SLA Tracking:" }), " Automatic escalation and performance monitoring"] }), _jsxs("li", { children: [_jsx("strong", { children: "Multi-Channel:" }), " Support for web, email, chat, and community forums"] }), _jsxs("li", { children: [_jsx("strong", { children: "Analytics:" }), " Real-time metrics and deflection rate tracking"] }), _jsxs("li", { children: [_jsx("strong", { children: "Knowledge Base:" }), " Integrated article suggestions and search"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Request Types" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm text-gray-600", children: [_jsx("div", { children: "\u2022 Questions & General Help" }), _jsx("div", { children: "\u2022 Technical Issues" }), _jsx("div", { children: "\u2022 Account Problems" }), _jsx("div", { children: "\u2022 Billing Inquiries" }), _jsx("div", { children: "\u2022 Bug Reports" }), _jsx("div", { children: "\u2022 Feature Requests" }), _jsx("div", { children: "\u2022 Template Help" }), _jsx("div", { children: "\u2022 Marketplace Support" }), _jsx("div", { children: "\u2022 Community Support" }), _jsx("div", { children: "\u2022 Partnership Inquiries" }), _jsx("div", { children: "\u2022 Compliance Issues" }), _jsx("div", { children: "\u2022 Onboarding Help" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "How It Works" }), _jsxs("ol", { className: "text-sm text-gray-600 space-y-2 list-decimal list-inside", children: [_jsx("li", { children: "Submit help request through guided form" }), _jsx("li", { children: "AI searches knowledge base for relevant articles" }), _jsx("li", { children: "Smart routing assigns to appropriate agent or team" }), _jsx("li", { children: "Real-time SLA tracking and escalation if needed" }), _jsx("li", { children: "Response tracking and satisfaction monitoring" }), _jsx("li", { children: "Analytics and continuous improvement" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "User Roles" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1 list-disc list-inside", children: [_jsxs("li", { children: [_jsx("strong", { children: "User:" }), " Submit requests and track status"] }), _jsxs("li", { children: [_jsx("strong", { children: "Agent:" }), " Respond to assigned requests and manage queue"] }), _jsxs("li", { children: [_jsx("strong", { children: "Admin:" }), " Full system access, analytics, and configuration"] })] })] })] })] }) }))] }));
};
export default Epic16HelpRequestSystem;
