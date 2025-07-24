import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Ticket Integration - Main Component
 *
 * Main integration component that brings together all Epic 16 ticket
 * management functionality including dashboard, details view, and service integration.
 */
import { useState, useEffect, useMemo } from 'react';
import { Epic16TicketIntegrationService } from '../../services/Epic16TicketIntegrationService.js';
import TicketManagementDashboard from './TicketManagementDashboard.js';
import TicketDetailsView from './TicketDetailsView.js';
export const Epic16TicketIntegration = ({ userId, userRole, config, onConfigChange }) => {
    // Service instance
    const ticketService = useMemo(() => {
        return new Epic16TicketIntegrationService(config);
    }, [config]);
    // State management
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [view, setView] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    // Set up event listeners for service events
    useEffect(() => {
        const handleTicketCreated = (data) => {
            setNotifications(prev => [...prev, {
                    id: `created-${data.ticket.id}`,
                    type: 'success',
                    message: `Ticket ${data.ticket.id} has been created`,
                    timestamp: new Date()
                }]);
        };
        const handleTicketStatusChanged = (data) => {
            setNotifications(prev => [...prev, {
                    id: `status-${data.ticket.id}-${Date.now()}`,
                    type: 'info',
                    message: `Ticket ${data.ticket.id} status changed from ${data.oldStatus} to ${data.newStatus}`,
                    timestamp: new Date()
                }]);
        };
        const handleTicketEscalated = (data) => {
            setNotifications(prev => [...prev, {
                    id: `escalated-${data.ticket.id}`,
                    type: 'warning',
                    message: `Ticket ${data.ticket.id} has been escalated: ${data.reason}`,
                    timestamp: new Date()
                }]);
        };
        const handleCommentAdded = (data) => {
            setNotifications(prev => [...prev, {
                    id: `comment-${data.ticket.id}-${Date.now()}`,
                    type: 'info',
                    message: `New comment added to ticket ${data.ticket.id}`,
                    timestamp: new Date()
                }]);
        };
        // Subscribe to events
        ticketService.on('ticket_created', handleTicketCreated);
        ticketService.on('ticket_status_changed', handleTicketStatusChanged);
        ticketService.on('ticket_escalated', handleTicketEscalated);
        ticketService.on('comment_added', handleCommentAdded);
        return () => {
            // Cleanup listeners
            ticketService.off('ticket_created', handleTicketCreated);
            ticketService.off('ticket_status_changed', handleTicketStatusChanged);
            ticketService.off('ticket_escalated', handleTicketEscalated);
            ticketService.off('comment_added', handleCommentAdded);
        };
    }, [ticketService]);
    // Auto-dismiss notifications
    useEffect(() => {
        const timer = setTimeout(() => {
            setNotifications(prev => prev.slice(0, -1));
        }, 5000);
        return () => clearTimeout(timer);
    }, [notifications]);
    // Handle ticket selection
    const handleTicketSelect = (ticket) => {
        setSelectedTicket(ticket);
        setView('details');
    };
    // Handle ticket update
    const handleTicketUpdate = (updatedTicket) => {
        setSelectedTicket(updatedTicket);
    };
    // Handle view navigation
    const handleViewChange = (newView) => {
        setView(newView);
        if (newView === 'dashboard') {
            setSelectedTicket(null);
        }
    };
    return (_jsxs("div", { className: "epic16-ticket-integration h-full flex flex-col relative", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("nav", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => handleViewChange('dashboard'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'dashboard'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Dashboard" }), selectedTicket && (_jsx("button", { onClick: () => handleViewChange('details'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'details'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Ticket Details" })), userRole === 'admin' && (_jsx("button", { onClick: () => handleViewChange('settings'), className: `py-2 px-1 border-b-2 font-medium text-sm ${view === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Settings" }))] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["User: ", _jsx("span", { className: "font-medium", children: userId })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Role: ", _jsx("span", { className: "font-medium capitalize", children: userRole })] })] })] }) }), _jsxs("div", { className: "flex-1 overflow-hidden", children: [view === 'dashboard' && (_jsx(TicketManagementDashboard, { ticketService: ticketService, userId: userId, userRole: userRole, onTicketSelect: handleTicketSelect })), view === 'details' && selectedTicket && (_jsx(TicketDetailsView, { ticket: selectedTicket, ticketService: ticketService, userId: userId, userRole: userRole, onClose: () => handleViewChange('dashboard'), onTicketUpdate: handleTicketUpdate })), view === 'settings' && userRole === 'admin' && (_jsx(IntegrationSettings, { ticketService: ticketService, onConfigChange: onConfigChange }))] }), _jsx(NotificationSystem, { notifications: notifications }), _jsx(HelpSystem, {})] }));
};
const IntegrationSettings = ({ ticketService, onConfigChange }) => {
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Integration Settings" }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Epic 16 Configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm text-blue-700", children: "Epic 16 ticket integration is now active. This system provides comprehensive marketplace and community support ticket management with:" }), _jsxs("ul", { className: "mt-2 text-sm text-blue-700 list-disc list-inside space-y-1", children: [_jsx("li", { children: "12 marketplace ticket types with specialized workflows" }), _jsx("li", { children: "SLA tracking and automated escalation" }), _jsx("li", { children: "External system integrations (GitHub, Jira, Slack, Discord)" }), _jsx("li", { children: "Advanced comment system with visibility controls" }), _jsx("li", { children: "Real-time metrics and analytics" }), _jsx("li", { children: "Attachment management with security scanning" })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Service Status" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-green-400 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm font-medium text-green-800", children: "Active" })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Integrations" }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-yellow-400 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm font-medium text-yellow-800", children: "Configuration Required" })] }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Features Overview" }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Ticket Types" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Template Submission, Billing Disputes, Community Support, Technical Issues" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Workflow Automation" }), _jsx("div", { className: "text-gray-600 mt-1", children: "Auto-assignment, SLA tracking, Escalation rules" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "External Systems" }), _jsx("div", { className: "text-gray-600 mt-1", children: "GitHub, Jira, Zendesk, Slack, Discord integrations" })] })] }) })] })] })] })] }));
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
// Help System Component
const HelpSystem = () => {
    const [showHelp, setShowHelp] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowHelp(true), className: "fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700", title: "Help & Documentation", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), showHelp && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Epic 16 Ticket Integration Help" }), _jsx("button", { onClick: () => setShowHelp(false), className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Getting Started" }), _jsx("p", { className: "text-sm text-gray-600", children: "The Epic 16 ticket integration provides comprehensive support for marketplace and community tickets. Use the dashboard to view and manage tickets, apply filters to find specific issues, and drill into ticket details for full management." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Key Features" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1 list-disc list-inside", children: [_jsxs("li", { children: [_jsx("strong", { children: "Dashboard:" }), " Overview of all tickets with filtering and search"] }), _jsxs("li", { children: [_jsx("strong", { children: "Ticket Details:" }), " Full ticket view with comments and attachments"] }), _jsxs("li", { children: [_jsx("strong", { children: "Status Management:" }), " Update ticket status and assign to agents"] }), _jsxs("li", { children: [_jsx("strong", { children: "SLA Tracking:" }), " Monitor response and resolution times"] }), _jsxs("li", { children: [_jsx("strong", { children: "Escalation:" }), " Escalate tickets when needed"] }), _jsxs("li", { children: [_jsx("strong", { children: "Comments:" }), " Public, internal, and private communication"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Ticket Types" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm text-gray-600", children: [_jsx("div", { children: "\u2022 Template Submission" }), _jsx("div", { children: "\u2022 Billing Dispute" }), _jsx("div", { children: "\u2022 Community Support" }), _jsx("div", { children: "\u2022 Technical Support" }), _jsx("div", { children: "\u2022 Content Moderation" }), _jsx("div", { children: "\u2022 Feature Request" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Permissions" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1 list-disc list-inside", children: [_jsxs("li", { children: [_jsx("strong", { children: "User:" }), " Can view own tickets and add public comments"] }), _jsxs("li", { children: [_jsx("strong", { children: "Agent:" }), " Can manage assigned tickets and view internal comments"] }), _jsxs("li", { children: [_jsx("strong", { children: "Admin:" }), " Full access to all tickets and system settings"] })] })] })] })] }) }))] }));
};
export default Epic16TicketIntegration;
