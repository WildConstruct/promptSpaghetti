/**
 * Epic 16 - Marketplace Help System Exports
 * 
 * Unified exports for all Epic 16 marketplace help system components.
 * Extends Epic 8.4 contextual help with marketplace-specific functionality.
 */

// Main integrated help system
export { Epic16HelpSystem } from './Epic16HelpSystem';
export type { Epic16HelpSystemProps } from './Epic16HelpSystem';

// Marketplace help overlay
export { MarketplaceHelpOverlay } from './MarketplaceHelpOverlay';
export type { 
  MarketplaceHelpOverlayProps,
  MarketplaceHelpContent,
  MarketplaceHelpContentType 
} from './MarketplaceHelpOverlay';

// Contextual help intelligence
export { MarketplaceContextualHelp } from './MarketplaceContextualHelp';
export type { 
  MarketplaceContextualHelpProps,
  ContextualTriggerType,
  UserBehaviorContext,
  ContextualHelpRule 
} from './MarketplaceContextualHelp';

// Re-export core help system components for convenience
export { ContextualHelpSystem } from '../ContextualHelp/ContextualHelpSystem';
export type { 
  HelpContent, 
  HelpContentType, 
  ContextualHelpProps 
} from '../ContextualHelp/ContextualHelpSystem';

export { HelpContentManager } from '../ContextualHelp/HelpContentManager';

// Import Epic16HelpSystem for local use
import { Epic16HelpSystem } from './Epic16HelpSystem';
export type { 
  UserProfile, 
  LearningPath 
} from '../ContextualHelp/HelpContentManager';

// Helper functions for help system integration
export 
export     effectiveness: {} as Record<string, { views: number; helpful: number }>
  };

  const trackEvent = (event: string, data: Record<string, any>) => {
    const entry = {
      event,
      data,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`
    };

    switch (event) {
    case 'help_interaction':
    case 'contextual_help_triggered':
    case 'tour_completed':
    case 'feedback_submitted':
      analytics.helpInteractions.push(entry);
      break;
      
    case 'user_struggle_detected':
      analytics.userStruggles.push(entry);
      break;
      
    case 'help_effectiveness':
      const helpId = data.helpId;
      analytics.effectiveness[helpId] = {
        views: (analytics.effectiveness[helpId]?.views || 0) + 1,
        helpful: (analytics.effectiveness[helpId]?.helpful || 0) + (data.wasEffective ? 1 : 0)
      };
      break;
    }

    // Optional: Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        custom_parameter_1: JSON.stringify(data),
        event_category: 'help_system'
      });
    }
  };

  const getAnalytics = () => ({ ...analytics });
  
  const getHelpEffectivenessReport = () => {
    const report = Object.entries(analytics.effectiveness).map(([helpId, stats]) => ({
      helpId,
      views: stats.views,
      helpful: stats.helpful,
      effectivenessRate: stats.views > 0 ? (stats.helpful / stats.views) * 100 : 0
    }));

    return report.sort((a, b) => b.effectivenessRate - a.effectivenessRate);
  };

  const getStruggleReport = () => {
    const struggles = analytics.userStruggles.reduce((acc, entry) => {
      const type = entry.data.struggleType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(struggles)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    trackEvent,
    getAnalytics,
    getHelpEffectivenessReport,
    getStruggleReport
  };
};

// Constants for help system configuration
export 
export default Epic16HelpSystem;