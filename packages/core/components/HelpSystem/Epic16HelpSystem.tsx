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
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContextualHelpSystem } from '../ContextualHelp/ContextualHelpSystem';
import { HelpContentManager } from '../ContextualHelp/HelpContentManager';
import { MarketplaceHelpOverlay } from './MarketplaceHelpOverlay';
import { MarketplaceContextualHelp } from './MarketplaceContextualHelp';

export interface Epic16HelpSystemProps {
  // Core editor context (Epic 8.4)
  nodes?: unknown;
  edges?: unknown;
  selectedNodeId?: string;
  // Marketplace context (Epic 16)
  currentPage?: string;
  userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  // Page-specific context
  pageContext?: {,
  template?: {,
  id: string;,
  category: string;
  type: string;,
  isPremium: boolean;
};
    cartItems?: number;
    purchaseStage?: 'browsing' | 'preview' | 'cart' | 'checkout' | 'download';
    forumContext?: {
  category: string;,
  hasPosted: boolean;
  reputation: number;
};
  };
  // User preferences
  helpEnabled?: boolean;
  autoContextualHelp?: boolean;
  showGuidedTours?: boolean;
  helpComplexity?: 'beginner' | 'advanced';
  // Analytics and callbacks
  onHelpAnalytics?: (event: string, data: Record<string, any>) => void;
}
export const Epic16HelpSystem: React.FC<Epic16HelpSystemProps> = ({)
  nodes = [],
  edges = [],
  selectedNodeId,
  currentPage = '',
  userRole = 'new-user',
  userLevel = 'beginner',
  pageContext = {},
  helpEnabled = true,
  autoContextualHelp = true,
  showGuidedTours = true,
  helpComplexity = 'beginner',
  onHelpAnalytics
}) => {
  // State management
  const [helpContentManager] = useState(() => new HelpContentManager());
  const [helpMode, setHelpMode] = useState<'core' | 'marketplace' | 'hybrid'>('hybrid');
  const [userJourney, setUserJourney] = useState<string>([]);
  const [helpEffectiveness, setHelpEffectiveness] = useState<Record<string, { views: number; helpful: number }>>({});
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
    } else if (isCoreEditorPage && !isMarketplacePage) {
      return 'core';
    } else {
      return 'hybrid';
  }, [currentPage, nodes.length]);
  // Update help mode based on context
  useEffect(() => {
    setHelpMode(helpContext as any);
    setUserJourney(prev => [...prev, `${helpContext}:${currentPage}`].slice(-10)); // Keep last 10 pages}
  }, [helpContext, currentPage]);
  // Track help effectiveness
  const trackHelpEffectiveness = useCallback((helpId: string, wasEffective: boolean) => {
  setHelpEffectiveness(prev => ({)
  ...prev,
  [helpId]: {,
  views: (prev[helpId]?.views || 0) + 1,
  helpful: (prev[helpId]?.helpful || 0) + (wasEffective ? 1 : 0),
}));
    onHelpAnalytics?.('help_effectiveness', {)
  helpId,
  wasEffective,
  context: helpContext,
  userRole,
  userLevel
});
  }, [helpContext, userRole, userLevel, onHelpAnalytics]);
  // Handle help interactions
  const handleHelpInteraction = useCallback((action: string, data: Record<string, any>) => {
  onHelpAnalytics?.('help_interaction', {)
  action,
  data,
  context: helpContext,
  currentPage,
  userRole,
  timestamp: Date.now(),
});
  }, [helpContext, currentPage, userRole, onHelpAnalytics]);
  // Handle contextual help triggers
  const handleContextualHelpTriggered = useCallback((rule: Error, context: unknown) => {
  onHelpAnalytics?.('contextual_help_triggered', {)
  ruleId: rule.id,
  ruleName: rule.name,
  triggerType: rule.triggerType,
  priority: rule.priority,
  context,
  userJourney: userJourney.slice(-5), // Last 5 pages,
  timestamp: Date.now(),
});
  }, [userJourney, onHelpAnalytics]);
  // Handle user struggle detection
  const handleUserStruggleDetected = useCallback((struggleType: string, severity: number) => {
  onHelpAnalytics?.('user_struggle_detected', {)
  struggleType,
  severity,
  context: helpContext,
  currentPage,
  userRole,
  userJourney: userJourney.slice(-5),
  timestamp: Date.now(),
});
  }, [helpContext, currentPage, userRole, userJourney, onHelpAnalytics]);
  // Handle tour completion
  const handleTourCompleted = useCallback((tourId: string) => {
  onHelpAnalytics?.('tour_completed', {)
  tourId,
  context: helpContext,
  userRole,
  userLevel,
  timestamp: Date.now(),
});
  }, [helpContext, userRole, userLevel, onHelpAnalytics]);
  if (!helpEnabled) return null;
  return;
    <div className="epic16-help-system">
      {/* Core Editor Help (Epic 8.4) - Show when in core context */}
      {(helpMode === 'core' || helpMode === 'hybrid') && nodes.length > 0 && ()
        <ContextualHelpSystem
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          userLevel={userLevel}
          enabled={helpEnabled}
          autoTrigger={autoContextualHelp}
          showProgressiveHints={showGuidedTours}
          onHelpContentViewed={(contentId) => trackHelpEffectiveness(contentId, true)}
          onUserLevelChange={(level) => {
  onHelpAnalytics?.('user_level_changed', { )
  from: userLevel,
  to: level,
  context: helpContext,
});
          }}
        />
      )}
      {/* Marketplace Help Overlay - Show when in marketplace context */}
      {(helpMode === 'marketplace' || helpMode === 'hybrid') && ()
        <MarketplaceHelpOverlay
          currentPage={currentPage as any}
          userRole={userRole}
          selectedTemplate={pageContext.template}
          cartItems={pageContext.cartItems}
          purchaseStage={pageContext.purchaseStage}
          forumContext={pageContext.forumContext}
          showMarketplaceHelp={helpEnabled}
          enableGuidedTours={showGuidedTours}
          helpComplexity={helpComplexity}
          coreHelpManager={helpContentManager}
          onHelpInteraction={handleHelpInteraction}
          onTourCompleted={handleTourCompleted}
          onFeedbackSubmitted={(feedback) => {
  onHelpAnalytics?.('feedback_submitted', {)
  ...feedback,
  context: helpContext,
  userRole
});
          }}
        />
      )}
      {/* Contextual Help Intelligence - Always active for behavior tracking */}
      {autoContextualHelp && ()
        <MarketplaceContextualHelp
          userRole={userRole}
          userLevel={userLevel}
          currentPage={currentPage}
          pageContext={pageContext}
          enabled={helpEnabled}
          intelligenceLevel="smart"
          triggerSensitivity="medium"
          helpContentManager={helpContentManager}
          onContextualHelpTriggered={handleContextualHelpTriggered}
          onUserStruggleDetected={handleUserStruggleDetected}
          onHelpEffectiveness={trackHelpEffectiveness}
        />
      )}
      {/* Help System Status Indicator */}
      <div className="help-system-status">
        <div className="help-mode-indicator">
          <span className={`mode-badge ${helpMode}`}>}
            {helpMode === 'core' && '🎬 Editor'}
            {helpMode === 'marketplace' && '🏪 Marketplace'}
            {helpMode === 'hybrid' && '🔄 Integrated'}
          </span>
        </div>
        {process.env.NODE_ENV === 'development' && ()
          <div className="help-debug-info">
            <div>Mode: {helpMode}</div>
            <div>Journey: {userJourney.slice(-3).join(' → ')}</div>
            <div>Effectiveness: {Object.keys(helpEffectiveness).length} tracked</div>
          </div>
        )}
      </div>
      <style>{`
        .epic16-help-system {
          position: relative;
        .help-system-status {
          position: fixed;,
  top: 10px;
          left: 10px;
          z-index: 9998;
          pointer-events: none;
        .help-mode-indicator {
          pointer-events: auto;
        .mode-badge {
          background: rgba(0, 0, 0, 0.7);
          color: #fff;,
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(5px);,
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
          margin-top: 8px;,
  background: rgba(0, 0, 0, 0.8);
          color: #fff;,
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
            top: 5px;,
  left: 5px;
          .mode-badge {
            font-size: 10px;,
  padding: 3px 6px;
          .help-debug-info {
            display: none;
      `}</style>
    </div>
  );
};

export default Epic16HelpSystem;