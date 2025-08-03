import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 16 - Integrated Marketplace Help System
 *
 * Master integration component that combines Epic 8.4 core help system
 * with Epic 16 marketplace-specific help overlay and contextual assistance.
 *
 * Features:
 * - Unified help experience across core editor and marketplace
 * - Smart context switching between help modes
 * - User journey tracking and optimization
 * - Help analytics and effectiveness measurement
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ContextualHelpSystem } from '../ContextualHelp/ContextualHelpSystem';
import { HelpContentManager } from '../ContextualHelp/HelpContentManager';
import { MarketplaceHelpOverlay } from './MarketplaceHelpOverlay';
import { MarketplaceContextualHelp } from './MarketplaceContextualHelp';
;
// User preferences
helpEnabled ?  : boolean;
autoContextualHelp ?  : boolean;
showGuidedTours ?  : boolean;
helpComplexity ?  : 'beginner' | 'advanced';
// Analytics and callbacks
onHelpAnalytics ?  : (event, data) => void ;
export const Epic16HelpSystem = ({
    nodes = [],
    edges = [],
    selectedNodeId,
    currentPage = '',
    userRole = 'new-user',
    userLevel = 'beginner' });
pageContext = {};
helpEnabled = true;
autoContextualHelp = true;
showGuidedTours = true;
helpComplexity = 'beginner';
onHelpAnalytics;
{
    // State management
    const [helpContentManager] = useState(() => new HelpContentManager());
    const [helpMode, setHelpMode] = useState('hybrid');
    const [userJourney, setUserJourney] = useState([]);
    const [helpEffectiveness, setHelpEffectiveness] = useState({});
    // Determine help context based on current page
    const helpContext = useMemo(() => {
        const isMarketplacePage = currentPage.includes('marketplace') || ;
        currentPage.includes('template') ||
            currentPage.includes('creator') ||
            currentPage.includes('community');
        const isCoreEditorPage = currentPage.includes('editor') || ;
        currentPage.includes('graph') ||
            nodes.length > 0;
        if (isMarketplacePage && !isCoreEditorPage) {
            return 'marketplace';
        }
        else if (isCoreEditorPage && !isMarketplacePage) {
            return 'core';
        }
        else {
            return 'hybrid';
        }
        [currentPage, nodes.length];
    });
    // Update help mode based on context
    useEffect(() => {
        setHelpMode(helpContext);
        setUserJourney(prev => [...prev, `${helpContext}:${currentPage}`].slice(-10)); // Keep last 10 pages}
    }, [helpContext, currentPage]);
    // Track help effectiveness
    const trackHelpEffectiveness = useCallback((helpId, wasEffective) => {
        setHelpEffectiveness(prev => ({}), ...prev[helpId], {
            views: (prev[helpId]?.views || 0) + 1,
            helpful: (prev[helpId]?.helpful || 0) + (wasEffective ? 1 : 0)
        });
    });
    onHelpAnalytics?.('help_effectiveness', {});
    helpId;
    wasEffective;
    context: helpContext;
    userRole;
}
userLevel;
;
[helpContext, userRole, userLevel, onHelpAnalytics];
;
// Handle help interactions
const handleHelpInteraction = useCallback((action, data) => {
    onHelpAnalytics?.('help_interaction', {});
    action;
    data;
    context: helpContext;
    currentPage;
    userRole;
    timestamp: Date.now();
});
;
[helpContext, currentPage, userRole, onHelpAnalytics];
;
// Handle contextual help triggers
const handleContextualHelpTriggered = useCallback((rule, context) => {
    onHelpAnalytics?.('contextual_help_triggered', {});
    ruleId: rule.id;
    ruleName: rule.name;
    triggerType: rule.triggerType;
    priority: rule.priority;
    context;
    userJourney: userJourney.slice(-5), // Last 5 pages
        timestamp;
    Date.now();
});
;
[userJourney, onHelpAnalytics];
;
// Handle user struggle detection
const handleUserStruggleDetected = useCallback((struggleType, severity) => {
    onHelpAnalytics?.('user_struggle_detected', {});
    struggleType;
    severity;
    context: helpContext;
    currentPage;
    userRole;
    userJourney: userJourney.slice(-5);
    timestamp: Date.now();
});
;
[helpContext, currentPage, userRole, userJourney, onHelpAnalytics];
;
// Handle tour completion
const handleTourCompleted = useCallback((tourId) => {
    onHelpAnalytics?.('tour_completed', {});
    tourId;
    context: helpContext;
    userRole;
    userLevel;
    timestamp: Date.now();
});
;
[helpContext, userRole, userLevel, onHelpAnalytics];
;
if (!helpEnabled)
    return null;
return;
_jsxs("div", { className: "epic16-help-system", children: [(helpMode === 'core' || helpMode === 'hybrid') && nodes.length > 0 && ()
            < ContextualHelpSystem, "nodes=", nodes, "edges=", edges, "selectedNodeId=", selectedNodeId, "userLevel=", userLevel, "enabled=", helpEnabled, "autoTrigger=", autoContextualHelp, "showProgressiveHints=", showGuidedTours, "onHelpContentViewed=", (contentId) => trackHelpEffectiveness(contentId, true), "onUserLevelChange=", (level) => {
            onHelpAnalytics?.('user_level_changed', {});
            from: userLevel;
            to: level;
            context: helpContext;
        }, "); /> )}", (helpMode === 'marketplace' || helpMode === 'hybrid') && ()
            < MarketplaceHelpOverlay, "currentPage=", currentPage, "userRole=", userRole, "selectedTemplate=", pageContext.template, "cartItems=", pageContext.cartItems, "purchaseStage=", pageContext.purchaseStage, "forumContext=", pageContext.forumContext, "showMarketplaceHelp=", helpEnabled, "enableGuidedTours=", showGuidedTours, "helpComplexity=", helpComplexity, "coreHelpManager=", helpContentManager, "onHelpInteraction=", handleHelpInteraction, "onTourCompleted=", handleTourCompleted, "onFeedbackSubmitted=", (feedback) => {
            onHelpAnalytics?.('feedback_submitted', {});
        }, "...feedback context: helpContext } userRole }); /> )}", autoContextualHelp && ()
            < MarketplaceContextualHelp, "userRole=", userRole, "userLevel=", userLevel, "currentPage=", currentPage, "pageContext=", pageContext, "enabled=", helpEnabled, "intelligenceLevel=\"smart\" triggerSensitivity=\"medium\" helpContentManager=", helpContentManager, "onContextualHelpTriggered=", handleContextualHelpTriggered, "onUserStruggleDetected=", handleUserStruggleDetected, "onHelpEffectiveness=", trackHelpEffectiveness, "/> )}", _jsxs("div", { className: "help-system-status", children: [_jsx("div", { className: "help-mode-indicator", children: _jsxs("span", { className: `mode-badge ${helpMode}`, children: ["}", helpMode === 'core' && '🎬 Editor', helpMode === 'marketplace' && '🏪 Marketplace', helpMode === 'hybrid' && '🔄 Integrated'] }) }), process.env.NODE_ENV === 'development' && ()
                    < div, " className=\"help-debug-info\">", _jsxs("div", { children: ["Mode: ", helpMode] }), _jsxs("div", { children: ["Journey: ", userJourney.slice(-3).join(' → ')] }), _jsxs("div", { children: ["Effectiveness: ", Object.keys(helpEffectiveness).length, " tracked"] })] }), ")}"] })
    ,
        _jsx("style", { children: `
        .epic16-help-system {
          position: relative;
        .help-system-status {
          position: fixed;
  top: 10px;
          left: 10px;
          z-index: 9998;
          pointer-events: none;
        .help-mode-indicator {
          pointer-events: auto;
        .mode-badge {
          background: rgba(0, 0, 0, 0.7);
          color: #fff
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(5px)
  border: 1px solid rgba(255, 255, 255, 0.2);
        .mode-badge.core {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 193, 7, 0.6) 100%);
          color: #000;
          border-color: #ffd700;
        .mode-badge.marketplace {
          background: linear-gradient(135deg, rgba(59, 179, 224, 0.8) 0%, rgba(15, 76, 117, 0.6) 100%);
          color: #fff;
          border-color: #3bb3e0;
        .mode-badge.hybrid {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(59, 179, 224, 0.4) 100%);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.4);
        .help-debug-info {
          margin-top: 8px;
  background: rgba(0, 0, 0, 0.8);
          color: #fff }
  padding: 8px;
          border-radius: 6px;
          font-size: 10px;
          font-family: monospace;
          pointer-events: auto;
        .help-debug-info div {
          margin-bottom: 2px;
        .help-debug-info div:last-child {
          margin-bottom: 0;
        @media (max-width: 768px) {
          .help-system-status {
            top: 5px;
  left: 5px;
          .mode-badge {
            font-size: 10px;
  padding: 3px 6px;
          .help-debug-info {
            display: none;
      ` });
div >
;
;
;
export default Epic16HelpSystem;
