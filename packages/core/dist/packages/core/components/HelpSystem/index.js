/**
 * Epic 16 - Marketplace Help System Exports
 *
 * Unified exports for all Epic 16 marketplace help system components.
 * Extends Epic 8.4 contextual help with marketplace-specific functionality.
 */
// Main integrated help system
export { Epic16HelpSystem } from './Epic16HelpSystem';
// Marketplace help overlay
export { MarketplaceHelpOverlay } from './MarketplaceHelpOverlay';
// Contextual help intelligence
export { MarketplaceContextualHelp } from './MarketplaceContextualHelp';
// Re-export core help system components for convenience
export { ContextualHelpSystem } from '../ContextualHelp/ContextualHelpSystem';
export { HelpContentManager } from '../ContextualHelp/HelpContentManager';
// Import Epic16HelpSystem for local use
import { Epic16HelpSystem } from './Epic16HelpSystem';
// Helper functions for help system integration
export const createHelpAnalytics = () => {
    const analytics = {
        helpInteractions: [],
        userStruggles: [],
        effectiveness: {}
    };
    const trackEvent = (event, data) => {
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
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', event, {
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
        }, {});
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
export const HELP_SYSTEM_CONFIG = {
    ANALYTICS_ENABLED: true,
    CONTEXTUAL_TRIGGERS_ENABLED: true,
    MARKETPLACE_HELP_ENABLED: true,
    DEFAULT_HELP_DELAY: 3000,
    MAX_HELP_CONTENT_CACHE: 50
};
export default Epic16HelpSystem;
