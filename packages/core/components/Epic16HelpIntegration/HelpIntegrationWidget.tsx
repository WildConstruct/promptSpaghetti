/**
 * Epic 16 Help Integration Widget
 * Task: E16-1753114247188-28937F - Design help integration
 * 
 * Main help integration widget that provides contextual help for Epic 16
 * marketplace features with seamless transitions to Epic 8 graph editor help.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  ArrowRight, 
  Star, 
  Clock, 
  CheckCircle,
  AlertCircle,
  X,
  Minimize2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { HelpContent } from '../ContextualHelp/ContextualHelpSystem';
import './HelpIntegrationWidget.css';

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface HelpIntegrationProps {
  // Current context
  currentSystem: 'graph-editor' | 'marketplace';
  currentView: string;
  templateId?: string;
  userId: string;
  userRole: 'buyer' | 'seller' | 'admin';
  
  // Integration callbacks
  onTransitionToSystem?: (system: 'graph-editor' | 'marketplace') => void;
  onEscalateToSupport?: (reason: string, description: string) => void;
  onSessionUpdate?: (updates: Record<string, any>) => void;
  
  // Customization
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'floating';
  minimized?: boolean;
  hidden?: boolean;
}

export interface HelpSession {
  id: string;
  sessionType: string;
  currentStep: number;
  totalSteps: number;
  content: HelpContent[];
  startTime: Date;
  userProgress: {
    completedActions: string[];
    skippedContent: string[];
    ratings: Record<string, number>;
  };
  escalationLevel: number;
}

export interface TransitionContext {
  fromSystem: 'graph-editor' | 'marketplace';
  toSystem: 'graph-editor' | 'marketplace';
  reason: string;
  preserveHelp: boolean;
  bridgeContent?: HelpContent[];
}

// =============================================================================
// Help Integration Widget Component
// =============================================================================

export const HelpIntegrationWidget: React.FC<HelpIntegrationProps> = ({
  currentSystem,
  currentView,
  templateId,
  userId,
  userRole,
  onTransitionToSystem,
  onEscalateToSupport,
  onSessionUpdate,
  theme = 'auto',
  position = 'bottom-right',
  minimized: initialMinimized = false,
  hidden = false
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(initialMinimized);
  const [currentSession, setCurrentSession] = useState<HelpSession | null>(null);
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [transitionContext, setTransitionContext] = useState<TransitionContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationDescription, setEscalationDescription] = useState('');
  
  // Refs for DOM interaction
  const widgetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      setHelpContent(prev => [...transitionContext.bridgeContent!, ...prev]);
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
      } else {
        throw new Error(data.error || 'Failed to initialize help session');
      }
    } catch (error) {
      console.error('Failed to initialize help session:', error);
      setError(error instanceof Error ? error.message : 'Failed to load help');
    } finally {
      setIsLoading(false);
    }
  }, [currentView, templateId, userId, userRole, currentSystem]);

  const handleSystemTransition = useCallback(async (toSystem: 'graph-editor' | 'marketplace') => {
    if (!currentSession) return;

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
    } catch (error) {
      console.error('Failed to handle system transition:', error);
    }
  }, [currentSession, currentSystem, userId, templateId, currentView, onTransitionToSystem]);

  const handleContentInteraction = useCallback(async (
    contentId: string, 
    interactionType: 'viewed' | 'completed' | 'skipped' | 'rated',
    data?: any
  ) => {
    if (!currentSession) return;

    try {
      // Update local session state
      const updatedSession = { ...currentSession };
      
      switch (interactionType) {
        case 'completed':
          if (!updatedSession.userProgress.completedActions.includes(contentId)) {
            updatedSession.userProgress.completedActions.push(contentId);
            updatedSession.currentStep = Math.min(
              updatedSession.currentStep + 1, 
              updatedSession.totalSteps
            );
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
    } catch (error) {
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
      } else {
        throw new Error('Failed to escalate to support');
      }
    } catch (error) {
      console.error('Failed to escalate to support:', error);
      alert('Failed to create support ticket. Please try again.');
    }
  }, [currentSession, userId, escalationReason, escalationDescription, currentView, templateId, currentSystem, userRole, onEscalateToSupport]);

  // =============================================================================
  // UI Rendering Methods
  // =============================================================================

  const renderHelpContent = () => {
    if (isLoading) {
      return (
        <div className="help-loading">
          <div className="help-spinner" />
          <p>Loading contextual help...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="help-error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={initializeHelpSession} className="retry-button">
            Retry
          </button>
        </div>
      );
    }

    if (helpContent.length === 0) {
      return (
        <div className="help-empty">
          <HelpCircle size={24} />
          <p>No help content available for this context.</p>
          <button onClick={() => setShowEscalation(true)} className="escalate-button">
            Contact Support
          </button>
        </div>
      );
    }

    return (
      <div className="help-content-list">
        {helpContent.map((content, index) => (
          <HelpContentCard
            key={content.id}
            content={content}
            isActive={activeContentId === content.id}
            isCompleted={currentSession?.userProgress.completedActions.includes(content.id) || false}
            onView={() => {
              setActiveContentId(content.id);
              handleContentInteraction(content.id, 'viewed');
            }}
            onComplete={() => handleContentInteraction(content.id, 'completed')}
            onSkip={() => handleContentInteraction(content.id, 'skipped')}
            onRate={(rating) => handleContentInteraction(content.id, 'rated', { rating })}
            stepNumber={index + 1}
            totalSteps={helpContent.length}
          />
        ))}
      </div>
    );
  };

  const renderTransitionPrompt = () => {
    if (!transitionContext || currentSystem === 'graph-editor') return null;

    return (
      <div className="help-transition-prompt">
        <div className="transition-header">
          <ArrowRight size={16} />
          <span>Continue in Graph Editor</span>
        </div>
        <p>Ready to start creating? Your marketplace session will be preserved.</p>
        <button 
          onClick={() => handleSystemTransition('graph-editor')}
          className="transition-button"
        >
          Open Graph Editor
        </button>
      </div>
    );
  };

  const renderEscalationForm = () => {
    if (!showEscalation) return null;

    return (
      <div className="help-escalation-form">
        <div className="escalation-header">
          <MessageCircle size={20} />
          <h3>Contact Support</h3>
          <button 
            onClick={() => setShowEscalation(false)}
            className="close-button"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="escalation-content">
          <div className="form-group">
            <label>What do you need help with?</label>
            <select 
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="navigation-help">Navigation Help</option>
              <option value="template-issues">Template Issues</option>
              <option value="purchase-problems">Purchase Problems</option>
              <option value="account-issues">Account Issues</option>
              <option value="technical-problem">Technical Problem</option>
              <option value="feature-request">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Please describe your issue:</label>
            <textarea
              value={escalationDescription}
              onChange={(e) => setEscalationDescription(e.target.value)}
              placeholder="Provide details about what you're experiencing..."
              rows={4}
            />
          </div>
          
          <div className="escalation-actions">
            <button 
              onClick={() => setShowEscalation(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              onClick={handleSupportEscalation}
              disabled={!escalationReason.trim() || !escalationDescription.trim()}
              className="submit-button"
            >
              Submit to Support
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (!currentSession || currentSession.totalSteps === 0) return null;

    const progress = (currentSession.currentStep / currentSession.totalSteps) * 100;

    return (
      <div className="help-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          {currentSession.currentStep} of {currentSession.totalSteps} completed
        </span>
      </div>
    );
  };

  // =============================================================================
  // Main Render
  // =============================================================================

  if (hidden) return null;

  return (
    <div 
      ref={widgetRef}
      className={`help-integration-widget ${theme} ${position} ${minimized ? 'minimized' : ''} ${isOpen ? 'open' : ''}`}
    >
      {/* Widget trigger button */}
      {!isOpen && (
        <button 
          className="help-trigger"
          onClick={() => setIsOpen(true)}
          title="Get contextual help"
        >
          <HelpCircle size={24} />
          {currentSession && currentSession.escalationLevel > 0 && (
            <div className="escalation-indicator" />
          )}
        </button>
      )}

      {/* Main help panel */}
      {isOpen && (
        <div className="help-panel" ref={contentRef}>
          {/* Header */}
          <div className="help-header">
            <div className="header-title">
              <BookOpen size={20} />
              <h2>Help & Guidance</h2>
              <span className="system-indicator">{currentSystem}</span>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => setMinimized(!minimized)}
                className="minimize-button"
                title={minimized ? 'Expand' : 'Minimize'}
              >
                {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="close-button"
                title="Close help"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Progress indicator */}
              {renderProgressIndicator()}

              {/* Help content area */}
              <div className="help-body">
                {renderHelpContent()}
                {renderTransitionPrompt()}
              </div>

              {/* Footer actions */}
              <div className="help-footer">
                <button 
                  onClick={() => setShowEscalation(true)}
                  className="support-button"
                >
                  <MessageCircle size={16} />
                  Need more help?
                </button>
                
                {currentSystem === 'marketplace' && (
                  <button 
                    onClick={() => handleSystemTransition('graph-editor')}
                    className="transition-button"
                  >
                    <ExternalLink size={16} />
                    Create Templates
                  </button>
                )}
              </div>
            </>
          )}

          {/* Escalation overlay */}
          {renderEscalationForm()}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Helper Components
// =============================================================================

interface HelpContentCardProps {
  content: HelpContent;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  totalSteps: number;
  onView: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onRate: (rating: number) => void;
}

const HelpContentCard: React.FC<HelpContentCardProps> = ({
  content,
  isActive,
  isCompleted,
  stepNumber,
  totalSteps,
  onView,
  onComplete,
  onSkip,
  onRate
}) => {
  const [rating, setRating] = useState(0);
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={`help-content-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={onView}
    >
      <div className="content-header">
        <div className="step-indicator">
          {isCompleted ? <CheckCircle size={16} /> : <span>{stepNumber}</span>}
        </div>
        <h3>{content.title}</h3>
        <div className="content-meta">
          <Clock size={12} />
          <span>{Math.ceil((content as any).estimatedTime / 60)} min</span>
        </div>
      </div>
      
      <div className="content-body">
        <p>{content.content}</p>
        
        {content.filmTerminology && (
          <div className="film-terminology">
            <strong>Film industry context:</strong> {content.filmTerminology}
          </div>
        )}
        
        {content.actionItems && content.actionItems.length > 0 && (
          <ul className="action-items">
            {content.actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      
      {isActive && (
        <div className="content-actions">
          <button onClick={onComplete} className="complete-button">
            Mark Complete
          </button>
          <button onClick={onSkip} className="skip-button">
            Skip
          </button>
          
          <div className="rating-section">
            <span>Helpful?</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  onRate(star);
                }}
                className={`star-button ${star <= rating ? 'active' : ''}`}
              >
                <Star size={14} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Utility Functions
// =============================================================================

function determineSessionType(
  currentView: string, 
  templateId?: string, 
  userRole: string = 'buyer'
): string {
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

function getAuthToken(): string {
  // Implementation would get JWT token from app state or localStorage
  return localStorage.getItem('authToken') || '';
}

export default HelpIntegrationWidget;