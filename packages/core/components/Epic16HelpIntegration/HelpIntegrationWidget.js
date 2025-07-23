import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Help Integration Widget
 * Task: E16-1753114247188-28937F - Design help integration
 *
 * Main help integration widget that provides contextual help for Epic 16
 * marketplace features with seamless transitions to Epic 8 graph editor help.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle, MessageCircle, BookOpen, ArrowRight, Star, Clock, CheckCircle, AlertCircle, X, Minimize2, Maximize2, ExternalLink } from 'lucide-react';
import './HelpIntegrationWidget.css';
// =============================================================================
// Help Integration Widget Component
// =============================================================================
export const HelpIntegrationWidget = ({ currentSystem, currentView, templateId, userId, userRole, onTransitionToSystem, onEscalateToSupport, onSessionUpdate, theme = 'auto', position = 'bottom-right', minimized: initialMinimized = false, hidden = false }) => {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [minimized, setMinimized] = useState(initialMinimized);
    const [currentSession, setCurrentSession] = useState(null);
    const [helpContent, setHelpContent] = useState([]);
    const [transitionContext, setTransitionContext] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // UI state
    const [activeContentId, setActiveContentId] = useState(null);
    const [showEscalation, setShowEscalation] = useState(false);
    const [escalationReason, setEscalationReason] = useState('');
    const [escalationDescription, setEscalationDescription] = useState('');
    // Refs for DOM interaction
    const widgetRef = useRef(null);
    const contentRef = useRef(null);
    // =============================================================================
    // Effect Hooks and Lifecycle
    // =============================================================================
    // Initialize help session when context changes
    useEffect(() => {
        if (!hidden && (currentView || templateId)) {
            initializeHelpSession();
        }
    }, [currentSystem, currentView, templateId, userId, userRole]);
    // Handle transitions between systems
    useEffect(() => {
        if (transitionContext && transitionContext.bridgeContent) {
            setHelpContent(prev => [...transitionContext.bridgeContent, ...prev]);
            setTransitionContext(null);
        }
    }, [transitionContext]);
    // =============================================================================
    // Core Help Integration Methods
    // =============================================================================
    const initializeHelpSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Determine session type based on current context
            const sessionType = determineSessionType(currentView, templateId, userRole);
            // Request contextual help from API
            const response = await fetch('/api/help-integration/contextual-help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    userId,
                    sessionType,
                    context: {
                        currentView,
                        templateId,
                        userRole,
                        systemContext: currentSystem,
                        marketplaceContext: currentSystem === 'marketplace' ? {
                            currentView,
                            templateId,
                            userRole
                        } : undefined,
                        graphContext: currentSystem === 'graph-editor' ? {
                            isEditing: true
                        } : undefined
                    }
                })
            });
            if (!response.ok) {
                throw new Error('Failed to load help content');
            }
            const data = await response.json();
            if (data.success) {
                setHelpContent(data.content);
                setCurrentSession({
                    id: data.sessionId,
                    sessionType,
                    currentStep: 0,
                    totalSteps: data.content.length,
                    content: data.content,
                    startTime: new Date(),
                    userProgress: {
                        completedActions: [],
                        skippedContent: [],
                        ratings: {}
                    },
                    escalationLevel: 0
                });
            }
            else {
                throw new Error(data.error || 'Failed to initialize help session');
            }
        }
        catch (error) {
            console.error('Failed to initialize help session:', error);
            setError(error instanceof Error ? error.message : 'Failed to load help');
        }
        finally {
            setIsLoading(false);
        }
    }, [currentView, templateId, userId, userRole, currentSystem]);
    const handleSystemTransition = useCallback(async (toSystem) => {
        if (!currentSession)
            return;
        try {
            const response = await fetch('/api/help-integration/system-transition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    userId,
                    fromSystem: currentSystem,
                    toSystem,
                    preserveHelp: true,
                    currentSessionId: currentSession.id,
                    transitionData: {
                        currentStep: currentSession.currentStep,
                        templateId,
                        currentView
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.bridgeContent) {
                    setTransitionContext({
                        fromSystem: currentSystem,
                        toSystem,
                        reason: 'user-navigation',
                        preserveHelp: true,
                        bridgeContent: data.bridgeContent
                    });
                }
                // Notify parent component of transition
                onTransitionToSystem?.(toSystem);
            }
        }
        catch (error) {
            console.error('Failed to handle system transition:', error);
        }
    }, [currentSession, currentSystem, userId, templateId, currentView, onTransitionToSystem]);
    const handleContentInteraction = useCallback(async (contentId, interactionType, data) => {
        if (!currentSession)
            return;
        try {
            // Update local session state
            const updatedSession = { ...currentSession };
            switch (interactionType) {
                case 'completed':
                    if (!updatedSession.userProgress.completedActions.includes(contentId)) {
                        updatedSession.userProgress.completedActions.push(contentId);
                        updatedSession.currentStep = Math.min(updatedSession.currentStep + 1, updatedSession.totalSteps);
                    }
                    break;
                case 'skipped':
                    if (!updatedSession.userProgress.skippedContent.includes(contentId)) {
                        updatedSession.userProgress.skippedContent.push(contentId);
                    }
                    break;
                case 'rated':
                    if (data?.rating) {
                        updatedSession.userProgress.ratings[contentId] = data.rating;
                    }
                    break;
            }
            setCurrentSession(updatedSession);
            // Update session via API
            await fetch(`/api/help-integration/session/${currentSession.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    currentStep: updatedSession.currentStep,
                    completedActions: updatedSession.userProgress.completedActions,
                    skippedContent: updatedSession.userProgress.skippedContent,
                    ...(data?.rating && { feedbackRating: data.rating })
                })
            });
            // Notify parent component
            onSessionUpdate?.(updatedSession.userProgress);
        }
        catch (error) {
            console.error('Failed to update content interaction:', error);
        }
    }, [currentSession, onSessionUpdate]);
    const handleSupportEscalation = useCallback(async () => {
        if (!currentSession || !escalationReason.trim() || !escalationDescription.trim()) {
            return;
        }
        try {
            const response = await fetch('/api/help-integration/escalate-to-support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    sessionId: currentSession.id,
                    userId,
                    escalationReason,
                    userDescription: escalationDescription,
                    priority: 'medium',
                    additionalContext: {
                        currentView,
                        templateId,
                        systemState: {
                            currentSystem,
                            userRole,
                            sessionProgress: currentSession.userProgress
                        }
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                // Update session with escalation info
                setCurrentSession(prev => prev ? {
                    ...prev,
                    escalationLevel: prev.escalationLevel + 1
                } : null);
                // Notify parent component
                onEscalateToSupport?.(escalationReason, escalationDescription);
                // Close escalation form
                setShowEscalation(false);
                setEscalationReason('');
                setEscalationDescription('');
                // Show success message
                alert(`Support ticket created: ${data.ticketNumber}. Expected response: ${data.expectedResponse}`);
            }
            else {
                throw new Error('Failed to escalate to support');
            }
        }
        catch (error) {
            console.error('Failed to escalate to support:', error);
            alert('Failed to create support ticket. Please try again.');
        }
    }, [currentSession, userId, escalationReason, escalationDescription, currentView, templateId, currentSystem, userRole, onEscalateToSupport]);
    // =============================================================================
    // UI Rendering Methods
    // =============================================================================
    const renderHelpContent = () => {
        if (isLoading) {
            return (_jsxs("div", { className: "help-loading", children: [_jsx("div", { className: "help-spinner" }), _jsx("p", { children: "Loading contextual help..." })] }));
        }
        if (error) {
            return (_jsxs("div", { className: "help-error", children: [_jsx(AlertCircle, { size: 24 }), _jsx("p", { children: error }), _jsx("button", { onClick: initializeHelpSession, className: "retry-button", children: "Retry" })] }));
        }
        if (helpContent.length === 0) {
            return (_jsxs("div", { className: "help-empty", children: [_jsx(HelpCircle, { size: 24 }), _jsx("p", { children: "No help content available for this context." }), _jsx("button", { onClick: () => setShowEscalation(true), className: "escalate-button", children: "Contact Support" })] }));
        }
        return (_jsx("div", { className: "help-content-list", children: helpContent.map((content, index) => (_jsx(HelpContentCard, { content: content, isActive: activeContentId === content.id, isCompleted: currentSession?.userProgress.completedActions.includes(content.id) || false, onView: () => {
                    setActiveContentId(content.id);
                    handleContentInteraction(content.id, 'viewed');
                }, onComplete: () => handleContentInteraction(content.id, 'completed'), onSkip: () => handleContentInteraction(content.id, 'skipped'), onRate: (rating) => handleContentInteraction(content.id, 'rated', { rating }), stepNumber: index + 1, totalSteps: helpContent.length }, content.id))) }));
    };
    const renderTransitionPrompt = () => {
        if (!transitionContext || currentSystem === 'graph-editor')
            return null;
        return (_jsxs("div", { className: "help-transition-prompt", children: [_jsxs("div", { className: "transition-header", children: [_jsx(ArrowRight, { size: 16 }), _jsx("span", { children: "Continue in Graph Editor" })] }), _jsx("p", { children: "Ready to start creating? Your marketplace session will be preserved." }), _jsx("button", { onClick: () => handleSystemTransition('graph-editor'), className: "transition-button", children: "Open Graph Editor" })] }));
    };
    const renderEscalationForm = () => {
        if (!showEscalation)
            return null;
        return (_jsxs("div", { className: "help-escalation-form", children: [_jsxs("div", { className: "escalation-header", children: [_jsx(MessageCircle, { size: 20 }), _jsx("h3", { children: "Contact Support" }), _jsx("button", { onClick: () => setShowEscalation(false), className: "close-button", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "escalation-content", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "What do you need help with?" }), _jsxs("select", { value: escalationReason, onChange: (e) => setEscalationReason(e.target.value), children: [_jsx("option", { value: "", children: "Select a reason..." }), _jsx("option", { value: "navigation-help", children: "Navigation Help" }), _jsx("option", { value: "template-issues", children: "Template Issues" }), _jsx("option", { value: "purchase-problems", children: "Purchase Problems" }), _jsx("option", { value: "account-issues", children: "Account Issues" }), _jsx("option", { value: "technical-problem", children: "Technical Problem" }), _jsx("option", { value: "feature-request", children: "Feature Request" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Please describe your issue:" }), _jsx("textarea", { value: escalationDescription, onChange: (e) => setEscalationDescription(e.target.value), placeholder: "Provide details about what you're experiencing...", rows: 4 })] }), _jsxs("div", { className: "escalation-actions", children: [_jsx("button", { onClick: () => setShowEscalation(false), className: "cancel-button", children: "Cancel" }), _jsx("button", { onClick: handleSupportEscalation, disabled: !escalationReason.trim() || !escalationDescription.trim(), className: "submit-button", children: "Submit to Support" })] })] })] }));
    };
    const renderProgressIndicator = () => {
        if (!currentSession || currentSession.totalSteps === 0)
            return null;
        const progress = (currentSession.currentStep / currentSession.totalSteps) * 100;
        return (_jsxs("div", { className: "help-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${progress}%` } }) }), _jsxs("span", { className: "progress-text", children: [currentSession.currentStep, " of ", currentSession.totalSteps, " completed"] })] }));
    };
    // =============================================================================
    // Main Render
    // =============================================================================
    if (hidden)
        return null;
    return (_jsxs("div", { ref: widgetRef, className: `help-integration-widget ${theme} ${position} ${minimized ? 'minimized' : ''} ${isOpen ? 'open' : ''}`, children: [!isOpen && (_jsxs("button", { className: "help-trigger", onClick: () => setIsOpen(true), title: "Get contextual help", children: [_jsx(HelpCircle, { size: 24 }), currentSession && currentSession.escalationLevel > 0 && (_jsx("div", { className: "escalation-indicator" }))] })), isOpen && (_jsxs("div", { className: "help-panel", ref: contentRef, children: [_jsxs("div", { className: "help-header", children: [_jsxs("div", { className: "header-title", children: [_jsx(BookOpen, { size: 20 }), _jsx("h2", { children: "Help & Guidance" }), _jsx("span", { className: "system-indicator", children: currentSystem })] }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { onClick: () => setMinimized(!minimized), className: "minimize-button", title: minimized ? 'Expand' : 'Minimize', children: minimized ? _jsx(Maximize2, { size: 16 }) : _jsx(Minimize2, { size: 16 }) }), _jsx("button", { onClick: () => setIsOpen(false), className: "close-button", title: "Close help", children: _jsx(X, { size: 16 }) })] })] }), !minimized && (_jsxs(_Fragment, { children: [renderProgressIndicator(), _jsxs("div", { className: "help-body", children: [renderHelpContent(), renderTransitionPrompt()] }), _jsxs("div", { className: "help-footer", children: [_jsxs("button", { onClick: () => setShowEscalation(true), className: "support-button", children: [_jsx(MessageCircle, { size: 16 }), "Need more help?"] }), currentSystem === 'marketplace' && (_jsxs("button", { onClick: () => handleSystemTransition('graph-editor'), className: "transition-button", children: [_jsx(ExternalLink, { size: 16 }), "Create Templates"] }))] })] })), renderEscalationForm()] }))] }));
};
const HelpContentCard = ({ content, isActive, isCompleted, stepNumber, totalSteps, onView, onComplete, onSkip, onRate }) => {
    const [rating, setRating] = useState(0);
    const [showActions, setShowActions] = useState(false);
    return (_jsxs("div", { className: `help-content-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`, onClick: onView, children: [_jsxs("div", { className: "content-header", children: [_jsx("div", { className: "step-indicator", children: isCompleted ? _jsx(CheckCircle, { size: 16 }) : _jsx("span", { children: stepNumber }) }), _jsx("h3", { children: content.title }), _jsxs("div", { className: "content-meta", children: [_jsx(Clock, { size: 12 }), _jsxs("span", { children: [Math.ceil(content.estimatedTime / 60), " min"] })] })] }), _jsxs("div", { className: "content-body", children: [_jsx("p", { children: content.content }), content.filmTerminology && (_jsxs("div", { className: "film-terminology", children: [_jsx("strong", { children: "Film industry context:" }), " ", content.filmTerminology] })), content.actionItems && content.actionItems.length > 0 && (_jsx("ul", { className: "action-items", children: content.actionItems.map((item, index) => (_jsx("li", { children: item }, index))) }))] }), isActive && (_jsxs("div", { className: "content-actions", children: [_jsx("button", { onClick: onComplete, className: "complete-button", children: "Mark Complete" }), _jsx("button", { onClick: onSkip, className: "skip-button", children: "Skip" }), _jsxs("div", { className: "rating-section", children: [_jsx("span", { children: "Helpful?" }), [1, 2, 3, 4, 5].map((star) => (_jsx("button", { onClick: () => {
                                    setRating(star);
                                    onRate(star);
                                }, className: `star-button ${star <= rating ? 'active' : ''}`, children: _jsx(Star, { size: 14 }) }, star)))] })] }))] }));
};
// =============================================================================
// Utility Functions
// =============================================================================
function determineSessionType(currentView, templateId, userRole = 'buyer') {
    if (currentView === 'home' || currentView === 'getting-started') {
        return 'onboarding';
    }
    if (currentView === 'search' || currentView === 'marketplace') {
        return 'marketplace-navigation';
    }
    if (currentView === 'template-detail' && templateId) {
        return 'purchase-assistance';
    }
    if (userRole === 'seller' && currentView.includes('dashboard')) {
        return 'template-creation';
    }
    if (currentView.includes('help') || currentView.includes('support')) {
        return 'troubleshooting';
    }
    return 'feature-discovery';
}
function getAuthToken() {
    // Implementation would get JWT token from app state or localStorage
    return localStorage.getItem('authToken') || '';
}
export default HelpIntegrationWidget;
