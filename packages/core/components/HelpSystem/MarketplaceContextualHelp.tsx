/**
 * Epic 16 - Marketplace Contextual Help System
 * Task: E16-1753114247194-DB73D0 - Implement contextual help
 * 
 * Intelligent contextual help system that provides smart assistance based on
 * user actions, marketplace context, and user behavior patterns. Extends the
 * Epic 8.4 foundation with marketplace-specific contextual intelligence.
 * 
 * Features:
 * - Smart contextual triggers based on user actions
 * - Marketplace-specific help content
 * - User behavior pattern recognition
 * - Progressive help complexity adaptation
 * - Community-driven help suggestions
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { HelpContentManager, UserProfile } from '../ContextualHelp/HelpContentManager';
import { MarketplaceHelpOverlay, MarketplaceHelpContent } from './MarketplaceHelpOverlay';

// Contextual help trigger types
export type ContextualTriggerType = 
  | 'hover'
  | 'click'
  | 'focus'
  | 'scroll'
  | 'idle'
  | 'error'
  | 'success'
  | 'first-time'
  | 'struggle-detected'
  | 'feature-discovery';

// User behavior tracking
export interface UserBehaviorContext {
  // Navigation patterns
  currentPage: string;
  previousPage?: string;
  timeOnPage: number;
  scrollDepth: number;
  
  // Interaction patterns
  clickCount: number;
  hoverCount: number;
  searchAttempts: number;
  filterChanges: number;
  
  // Task completion patterns
  templatesViewed: number;
  templatesAddedToCart: number;
  purchasesCompleted: number;
  reviewsWritten: number;
  
  // Struggle indicators
  backButtonUse: number;
  searchRefinements: number;
  timeWithoutProgress: number;
  errorEncounters: number;
  helpRequestCount: number;
  
  // Success indicators
  taskCompletionRate: number;
  featureDiscoveryCount: number;
  returnUserBehavior: boolean;
}

// Contextual help rule
export interface ContextualHelpRule {
  id: string;
  name: string;
  triggerType: ContextualTriggerType;
  conditions: {
    pagePattern?: RegExp;
    elementSelector?: string;
    userBehavior?: Partial<UserBehaviorContext>;
    timeThreshold?: number;
    eventCount?: number;
  };
  helpContent: MarketplaceHelpContent;
  priority: number;
  cooldownMinutes?: number;
  maxTriggers?: number;
}

export interface MarketplaceContextualHelpProps {
  // User context
  userId?: string;
  userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  
  // Current context
  currentPage: string;
  pageContext?: Record<string, any>;
  
  // Behavior tracking
  behaviorContext?: Partial<UserBehaviorContext>;
  
  // Configuration
  enabled?: boolean;
  intelligenceLevel?: 'basic' | 'smart' | 'adaptive';
  triggerSensitivity?: 'low' | 'medium' | 'high';
  
  // Integration
  helpContentManager?: HelpContentManager;
  
  // Callbacks
  onContextualHelpTriggered?: (rule: ContextualHelpRule, context: unknown) => void;
  onUserStruggleDetected?: (struggleType: string, severity: number) => void;
  onHelpEffectiveness?: (helpId: string, wasEffective: boolean) => void;
}

export const MarketplaceContextualHelp: React.FC<MarketplaceContextualHelpProps> = ({
  userId = 'anonymous',
  userRole = 'new-user',
  userLevel = 'beginner',
  currentPage,
  pageContext = {},
  behaviorContext = {},
  enabled = true,
  intelligenceLevel = 'smart',
  triggerSensitivity = 'medium',
  helpContentManager,
  onContextualHelpTriggered,
  onUserStruggleDetected,
  onHelpEffectiveness
}) => {
  // State management
  const [activeHelp, setActiveHelp] = useState<MarketplaceHelpContent | null>(null);
  const [triggeredRules, setTriggeredRules] = useState<Set<string>>(new Set());
  const [userBehavior, setUserBehavior] = useState<UserBehaviorContext>({
    currentPage,
    timeOnPage: 0,
    scrollDepth: 0,
    clickCount: 0,
    hoverCount: 0,
    searchAttempts: 0,
    filterChanges: 0,
    templatesViewed: 0,
    templatesAddedToCart: 0,
    purchasesCompleted: 0,
    reviewsWritten: 0,
    backButtonUse: 0,
    searchRefinements: 0,
    timeWithoutProgress: 0,
    errorEncounters: 0,
    helpRequestCount: 0,
    taskCompletionRate: 0,
    featureDiscoveryCount: 0,
    returnUserBehavior: false,
    ...behaviorContext
  });
  const [strugglingAreas, setStrugglingAreas] = useState<string[]>([]);
  const [lastTriggerTime, setLastTriggerTime] = useState<Record<string, number>>({});
  
  // Refs for behavior tracking
  const pageStartTime = useRef<number>(Date.now());
  const scrollTimer = useRef<NodeJS.Timeout>();
  const idleTimer = useRef<NodeJS.Timeout>();
  const behaviorTrackingInterval = useRef<NodeJS.Timeout>();
  
  // Comprehensive contextual help rules
  const contextualHelpRules: ContextualHelpRule[] = useMemo(() => [
    // First-time user help
    {
      id: 'marketplace-first-visit',
      name: 'First Marketplace Visit',
      triggerType: 'first-time',
      conditions: {
        pagePattern: /\/marketplace$/,
        userBehavior: { timeOnPage: 5000 } // 5 seconds
      },
      helpContent: {
        id: 'first-visit-guide',
        type: 'marketplace-discovery',
        title: 'Welcome to the Marketplace!',
        content: 'Discover thousands of professional prompt templates created by our community. Use the search and filters to find exactly what you need.',
        actionItems: [
          'Browse popular categories on the left',
          'Use the search bar to find specific topics',
          'Click any template to see a detailed preview'
        ],
        level: 'beginner',
        context: {},
        marketplaceContext: {
          page: 'marketplace',
          userRole: 'new-user'
        }
      },
      priority: 10,
      maxTriggers: 1
    },
    
    // Search struggle detection
    {
      id: 'search-struggle-help',
      name: 'Search Difficulty Detected',
      triggerType: 'struggle-detected',
      conditions: {
        pagePattern: /\/marketplace/,
        userBehavior: { 
          searchRefinements: 3,
          timeWithoutProgress: 30000 // 30 seconds without success
        }
      },
      helpContent: {
        id: 'search-help',
        type: 'template-browsing',
        title: 'Having trouble finding what you need?',
        content: 'Try these search strategies to find the perfect template for your project.',
        actionItems: [
          'Use broader keywords (e.g., "story" instead of "sci-fi adventure")',
          'Try browsing categories instead of searching',
          'Check the "Most Popular" section for inspiration',
          'Use our AI-powered search suggestions'
        ],
        level: 'beginner',
        context: {},
        marketplaceContext: {
          page: 'marketplace',
          purchaseStage: 'browsing'
        }
      },
      priority: 8,
      cooldownMinutes: 10
    },
    
    // Template preview hesitation
    {
      id: 'preview-hesitation',
      name: 'Template Preview Hesitation',
      triggerType: 'hover',
      conditions: {
        elementSelector: '.template-card',
        userBehavior: { 
          hoverCount: 5,
          templatesViewed: 0
        }
      },
      helpContent: {
        id: 'preview-encouragement',
        type: 'template-preview',
        title: 'Click to Preview Templates',
        content: 'Previewing templates is free and helps you understand how they work before purchasing. See example outputs and complexity levels.',
        actionItems: [
          'Click any template card to open the preview',
          'Look at example outputs to see template quality',
          'Check the complexity level and requirements',
          'Read other users\' reviews and ratings'
        ],
        level: 'beginner',
        context: {},
        marketplaceContext: {
          page: 'marketplace',
          purchaseStage: 'browsing'
        }
      },
      priority: 6,
      cooldownMinutes: 15
    },
    
    // Purchase hesitation
    {
      id: 'purchase-hesitation',
      name: 'Purchase Flow Hesitation',
      triggerType: 'idle',
      conditions: {
        pagePattern: /\/template\/.*$/,
        timeThreshold: 20000, // 20 seconds on template page
        userBehavior: { templatesAddedToCart: 0 }
      },
      helpContent: {
        id: 'purchase-confidence',
        type: 'purchase-flow',
        title: 'Ready to Get Started?',
        content: 'This template includes everything you need plus our satisfaction guarantee. You can download immediately after purchase.',
        actionItems: [
          'Click "Add to Cart" to secure this template',
          'Review the license terms (usually very flexible)',
          'Check out our satisfaction guarantee policy',
          'Join thousands of satisfied creators'
        ],
        level: 'beginner',
        context: {},
        marketplaceContext: {
          page: 'template-details',
          purchaseStage: 'preview'
        }
      },
      priority: 7,
      cooldownMinutes: 30
    },
    
    // Creator dashboard first time
    {
      id: 'creator-dashboard-first',
      name: 'First Creator Dashboard Visit',
      triggerType: 'first-time',
      conditions: {
        pagePattern: /\/creator\/dashboard$/
      },
      helpContent: {
        id: 'creator-dashboard-intro',
        type: 'creator-onboarding',
        title: 'Welcome to Your Creator Dashboard',
        content: 'This is your command center for managing templates, tracking sales, and building your creative business on the marketplace.',
        actionItems: [
          'Start by uploading your first template',
          'Complete your creator profile for better visibility',
          'Set competitive pricing for your templates',
          'Engage with customer feedback and questions'
        ],
        level: 'advanced',
        context: {},
        marketplaceContext: {
          page: 'creator-dashboard',
          userRole: 'creator'
        }
      },
      priority: 9,
      maxTriggers: 1
    },
    
    // Feature discovery triggers
    {
      id: 'wishlist-discovery',
      name: 'Wishlist Feature Discovery',
      triggerType: 'hover',
      conditions: {
        elementSelector: '.wishlist-button, .heart-button'
      },
      helpContent: {
        id: 'wishlist-feature',
        type: 'marketplace-navigation',
        title: 'Save Templates for Later',
        content: 'Add templates to your wishlist to save them for later. Get notified when they go on sale or when the creator releases updates.',
        actionItems: [
          'Click the heart icon to save to wishlist',
          'Access your wishlist from your profile menu',
          'Get notifications for price changes',
          'Share your wishlist with collaborators'
        ],
        level: 'intermediate',
        context: {},
        marketplaceContext: {
          page: 'marketplace'
        }
      },
      priority: 4,
      cooldownMinutes: 60
    },
    
    // Community engagement
    {
      id: 'community-engagement-prompt',
      name: 'Community Engagement Opportunity',
      triggerType: 'scroll',
      conditions: {
        pagePattern: /\/community|\/forum/,
        userBehavior: { timeOnPage: 15000 }
      },
      helpContent: {
        id: 'community-participation',
        type: 'community-features',
        title: 'Join the Conversation',
        content: 'Our community is full of creators sharing tips, asking questions, and collaborating on projects. Your participation helps everyone grow.',
        actionItems: [
          'Introduce yourself in the welcome forum',
          'Share your latest creations for feedback',
          'Help answer questions from new creators',
          'Participate in weekly creative challenges'
        ],
        level: 'intermediate',
        context: {},
        marketplaceContext: {
          page: 'community',
          userRole: 'community-member'
        }
      },
      priority: 5,
      cooldownMinutes: 120
    },
    
    // Error recovery help
    {
      id: 'error-recovery',
      name: 'Error Recovery Assistance',
      triggerType: 'error',
      conditions: {
        userBehavior: { errorEncounters: 1 }
      },
      helpContent: {
        id: 'error-help',
        type: 'troubleshooting',
        title: 'Having Technical Issues?',
        content: 'Don\'t worry! Most issues can be resolved quickly. Here are some common solutions.',
        actionItems: [
          'Try refreshing the page',
          'Clear your browser cache and cookies',
          'Check your internet connection',
          'Contact our support team if problems persist'
        ],
        level: 'beginner',
        context: {},
        marketplaceContext: {}
      },
      priority: 10,
      cooldownMinutes: 5
    }
  ], [currentPage]);

  // Behavior tracking and context analysis
  const updateBehaviorContext = useCallback((updates: Partial<UserBehaviorContext>) => {
    setUserBehavior(prev => ({
      ...prev,
      ...updates,
      timeOnPage: Date.now() - pageStartTime.current
    }));
  }, []);

  // Struggle detection algorithm
  const detectUserStruggle = useCallback((behavior: UserBehaviorContext) => {
    const struggles: string[] = [];
    
    // Search struggle indicators
    if (behavior.searchRefinements > 2 && behavior.templatesViewed === 0) {
      struggles.push('search-difficulty');
    }
    
    // Navigation struggle
    if (behavior.backButtonUse > 3 && behavior.timeOnPage < 60000) {
      struggles.push('navigation-confusion');
    }
    
    // Purchase hesitation
    if (behavior.templatesViewed > 5 && behavior.templatesAddedToCart === 0) {
      struggles.push('purchase-hesitation');
    }
    
    // Feature discovery struggle
    if (behavior.timeOnPage > 120000 && behavior.featureDiscoveryCount === 0) {
      struggles.push('feature-discovery');
    }
    
    // Update struggling areas and notify
    if (struggles.length > 0) {
      setStrugglingAreas(prev => [...new Set([...prev, ...struggles])]);
      struggles.forEach(struggle => {
        const severity = Math.min(10, Math.ceil(behavior.timeWithoutProgress / 10000));
        onUserStruggleDetected?.(struggle, severity);
      });
    }
  }, [onUserStruggleDetected]);

  // Evaluate contextual help rules
  const evaluateRules = useCallback((behavior: UserBehaviorContext): ContextualHelpRule | null => {
    const now = Date.now();
    const applicableRules = contextualHelpRules.filter(rule => {
      // Check if rule was recently triggered (cooldown)
      const lastTrigger = lastTriggerTime[rule.id] || 0;
      const cooldownMs = (rule.cooldownMinutes || 0) * 60 * 1000;
      if (now - lastTrigger < cooldownMs) return false;
      
      // Check max triggers
      if (rule.maxTriggers && triggeredRules.has(rule.id)) {
        // Count how many times this rule was triggered
        const triggerCount = Array.from(triggeredRules).filter(id => id === rule.id).length;
        if (triggerCount >= rule.maxTriggers) return false;
      }
      
      // Check page pattern
      if (rule.conditions.pagePattern && !rule.conditions.pagePattern.test(currentPage)) {
        return false;
      }
      
      // Check user behavior conditions
      if (rule.conditions.userBehavior) {
        for (const [key, value] of Object.entries(rule.conditions.userBehavior)) {
          const behaviorValue = behavior[key as keyof UserBehaviorContext];
          if (typeof value === 'number' && typeof behaviorValue === 'number') {
            if (behaviorValue < value) return false;
          } else if (behaviorValue !== value) {
            return false;
          }
        }
      }
      
      // Check time threshold
      if (rule.conditions.timeThreshold && behavior.timeOnPage < rule.conditions.timeThreshold) {
        return false;
      }
      
      return true;
    });
    
    // Return highest priority applicable rule
    return applicableRules.sort((a, b) => b.priority - a.priority)[0] || null;
  }, [contextualHelpRules, lastTriggerTime, triggeredRules, currentPage]);

  // Trigger contextual help
  const triggerContextualHelp = useCallback((rule: ContextualHelpRule) => {
    setActiveHelp(rule.helpContent);
    setTriggeredRules(prev => new Set([...prev, rule.id]));
    setLastTriggerTime(prev => ({ ...prev, [rule.id]: Date.now() }));
    
    onContextualHelpTriggered?.(rule, {
      userBehavior,
      currentPage,
      pageContext,
      strugglingAreas
    });
  }, [userBehavior, currentPage, pageContext, strugglingAreas, onContextualHelpTriggered]);

  // Set up behavior tracking
  useEffect(() => {
    if (!enabled) return;
    
    // Track page time
    pageStartTime.current = Date.now();
    
    // Set up behavior tracking interval
    behaviorTrackingInterval.current = setInterval(() => {
      const currentBehavior = {
        ...userBehavior,
        timeOnPage: Date.now() - pageStartTime.current
      };
      
      // Detect struggles
      detectUserStruggle(currentBehavior);
      
      // Evaluate rules for contextual help
      if (intelligenceLevel !== 'basic') {
        const applicableRule = evaluateRules(currentBehavior);
        if (applicableRule && !activeHelp) {
          triggerContextualHelp(applicableRule);
        }
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      if (behaviorTrackingInterval.current) {
        clearInterval(behaviorTrackingInterval.current);
      }
    };
  }, [enabled, intelligenceLevel, userBehavior, detectUserStruggle, evaluateRules, triggerContextualHelp, activeHelp]);

  // Set up DOM event listeners for behavior tracking
  useEffect(() => {
    if (!enabled) return;
    
    const handleClick = () => updateBehaviorContext({ clickCount: userBehavior.clickCount + 1 });
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      updateBehaviorContext({ scrollDepth: Math.max(0, Math.min(100, scrollDepth)) });
    };
    const handleError = () => updateBehaviorContext({ errorEncounters: userBehavior.errorEncounters + 1 });
    
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('error', handleError);
    
    // Track specific marketplace interactions
    const trackMarketplaceInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.search-bar')) {
        updateBehaviorContext({ searchAttempts: userBehavior.searchAttempts + 1 });
      } else if (target.closest('.filter-control')) {
        updateBehaviorContext({ filterChanges: userBehavior.filterChanges + 1 });
      } else if (target.closest('.template-card')) {
        updateBehaviorContext({ templatesViewed: userBehavior.templatesViewed + 1 });
      } else if (target.closest('.add-to-cart')) {
        updateBehaviorContext({ templatesAddedToCart: userBehavior.templatesAddedToCart + 1 });
      }
    };
    
    document.addEventListener('click', trackMarketplaceInteraction);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('error', handleError);
      document.removeEventListener('click', trackMarketplaceInteraction);
    };
  }, [enabled, userBehavior, updateBehaviorContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (behaviorTrackingInterval.current) clearInterval(behaviorTrackingInterval.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="marketplace-contextual-help">
      {/* Main Help Overlay Integration */}
      <MarketplaceHelpOverlay
        currentPage={currentPage as any}
        userRole={userRole}
        selectedTemplate={pageContext.template}
        cartItems={userBehavior.templatesAddedToCart}
        purchaseStage={pageContext.purchaseStage || 'browsing'}
        forumContext={pageContext.forumContext}
        showMarketplaceHelp={!!activeHelp}
        enableGuidedTours={false} // Controlled by contextual system
        helpComplexity={userLevel === 'beginner' ? 'beginner' : 'advanced'}
        onHelpInteraction={(action, context) => {
          // Track help effectiveness
          if (action === 'overlay_closed' && activeHelp) {
            const wasEffective = context.timeShown > 5000; // If shown for more than 5 seconds
            onHelpEffectiveness?.(activeHelp.id, wasEffective);
          }
          
          if (action === 'overlay_closed') {
            setActiveHelp(null);
          }
        }}
      />
      
      {/* Debug Information (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="contextual-help-debug">
          <div className="debug-panel">
            <h4>Contextual Help Debug</h4>
            <div className="debug-info">
              <div>Time on Page: {Math.floor(userBehavior.timeOnPage / 1000)}s</div>
              <div>Scroll Depth: {Math.floor(userBehavior.scrollDepth)}%</div>
              <div>Templates Viewed: {userBehavior.templatesViewed}</div>
              <div>Search Attempts: {userBehavior.searchAttempts}</div>
              <div>Struggling Areas: {strugglingAreas.join(', ') || 'None'}</div>
              <div>Active Help: {activeHelp?.id || 'None'}</div>
              <div>Triggered Rules: {Array.from(triggeredRules).length}</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .marketplace-contextual-help {
          position: relative;
        }

        .contextual-help-debug {
          position: fixed;
          bottom: 10px;
          left: 10px;
          z-index: 9999;
          pointer-events: none;
        }

        .debug-panel {
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          font-family: monospace;
          max-width: 300px;
          pointer-events: auto;
        }

        .debug-panel h4 {
          margin: 0 0 8px 0;
          color: #3bb3e0;
          font-size: 12px;
        }

        .debug-info div {
          margin-bottom: 4px;
          opacity: 0.8;
        }

        .debug-info div:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default MarketplaceContextualHelp;