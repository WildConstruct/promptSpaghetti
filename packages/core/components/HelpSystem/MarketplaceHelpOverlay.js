import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 16 - Marketplace Help Overlay System
 * Task: E16-1753114247197-8DC18E - Create help overlay system
 *
 * Extends the Epic 8.4 ContextualHelpSystem to provide marketplace-specific
 * help overlays, guided tours, and contextual assistance for Epic 16 features.
 *
 * Features:
 * - Marketplace-specific help overlays
 * - Template discovery guidance
 * - Purchase flow assistance
 * - Creator dashboard help
 * - Community features guidance
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
export const MarketplaceHelpOverlay = ({ currentPage = 'marketplace', userRole = 'new-user', selectedTemplate, cartItems = 0, purchaseStage = 'browsing', forumContext, showMarketplaceHelp = true, enableGuidedTours = true, helpComplexity = 'beginner', _____coreHelpManager, onHelpInteraction, onTourCompleted, onFeedbackSubmitted }) => {
    // State management
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentTour, setCurrentTour] = useState(null);
    const [tourStep, setTourStep] = useState(0);
    const [overlaySize, setOverlaySize] = useState('normal');
    const [showFeedback, setShowFeedback] = useState(false);
    // Refs for positioning and DOM manipulation
    const overlayRef = useRef(null);
    const targetElementRef = useRef(null);
    // Comprehensive marketplace help content database
    const marketplaceHelpDatabase = useMemo(() => [
        {
            id: 'marketplace-welcome',
            type: 'marketplace-discovery',
            title: 'Welcome to the Template Marketplace',
            content: 'Discover professionally-crafted prompt templates created by the community. Browse categories, preview templates, and find the perfect starting point for your creative projects.',
            filmTerminology: 'Think of this as your script library - a curated collection of proven narrative structures and creative frameworks.',
            actionItems: [
                'Browse template categories to find relevant content',
                'Use search and filters to narrow down options',
                'Preview templates before purchasing',
                'Check ratings and reviews from other creators'
            ],
            relatedFeatures: ['Template Search', 'Category Filters', 'Preview System', 'Rating System'],
            level: 'beginner',
            context: {
                conditions: { isFirstVisit: true }
            },
            marketplaceContext: {
                page: 'marketplace',
                userRole: 'new-user'
            }
        },
        {
            id: 'template-discovery-guide',
            type: 'template-browsing',
            title: 'Finding the Right Template',
            content: 'Use the search and filter system to discover templates that match your creative vision. Templates are organized by genre, complexity, and use case.',
            filmTerminology: 'Like scouting locations or casting - find the right elements that match your creative vision.',
            actionItems: [
                'Try category filters to explore different genres',
                'Use the search bar for specific topics',
                'Sort by popularity, rating, or recent updates',
                'Save interesting templates to your wishlist'
            ],
            relatedFeatures: ['Advanced Search', 'Category Navigation', 'Sort Options', 'Wishlist'],
            level: 'beginner',
            context: {
                triggerElements: ['search-bar', 'category-filter', 'sort-dropdown']
            },
            marketplaceContext: {
                page: 'marketplace',
                purchaseStage: 'browsing'
            }
        },
        {
            id: 'template-preview-system',
            type: 'template-preview',
            title: 'Template Preview & Evaluation',
            content: 'Preview templates to understand their structure and potential outputs. Each template shows example generations and explains the creative approach.',
            filmTerminology: 'Like reading a script treatment - get a feel for the story structure and creative approach before committing.',
            actionItems: [
                'Click preview to see template structure',
                'Review example outputs and variations',
                'Check the complexity level and requirements',
                'Read the creator\'s description and intent'
            ],
            relatedFeatures: ['Template Preview', 'Example Outputs', 'Complexity Indicators'],
            level: 'beginner',
            context: {
                triggerElements: ['preview-button', 'template-card']
            },
            marketplaceContext: {
                page: 'template-details',
                purchaseStage: 'preview'
            }
        },
        {
            id: 'purchase-flow-guidance',
            type: 'purchase-flow',
            title: 'Template Purchase Process',
            content: 'Add templates to your cart and complete the purchase. You\'ll receive immediate access to download and use templates in your projects.',
            filmTerminology: 'Like acquiring rights to a script - once purchased, you have full creative license to adapt and use.',
            actionItems: [
                'Add desired templates to your shopping cart',
                'Review license terms and usage rights',
                'Complete secure checkout process',
                'Download templates to your project library'
            ],
            relatedFeatures: ['Shopping Cart', 'Secure Checkout', 'License Management', 'Download System'],
            level: 'beginner',
            context: {
                triggerElements: ['add-to-cart', 'checkout-button']
            },
            marketplaceContext: {
                page: 'template-details',
                purchaseStage: 'cart'
            }
        },
        {
            id: 'rating-review-system',
            type: 'rating-system',
            title: 'Rating and Reviewing Templates',
            content: 'Share your experience with templates by rating and reviewing them. Help other creators discover quality content and provide feedback to template creators.',
            filmTerminology: 'Like film critics and audience reviews - your feedback guides others and improves the creative community.',
            actionItems: [
                'Rate templates based on quality and usefulness',
                'Write detailed reviews about your experience',
                'Include specific use cases and results',
                'Be constructive in feedback to help creators improve'
            ],
            relatedFeatures: ['Rating System', 'Review Writing', 'Community Feedback'],
            level: 'intermediate',
            context: {
                triggerElements: ['rating-stars', 'write-review']
            },
            marketplaceContext: {
                page: 'template-details',
                userRole: 'buyer'
            }
        },
        {
            id: 'creator-dashboard-intro',
            type: 'creator-onboarding',
            title: 'Creator Dashboard Overview',
            content: 'Manage your template creations, track sales performance, and engage with your audience. The creator dashboard provides all tools needed for template monetization.',
            filmTerminology: 'Like a production office - track your projects, monitor performance, and manage your creative business.',
            actionItems: [
                'Upload and publish your first template',
                'Set appropriate pricing and licensing',
                'Monitor sales and download analytics',
                'Respond to community feedback and questions'
            ],
            relatedFeatures: ['Template Upload', 'Analytics Dashboard', 'Revenue Tracking', 'Community Management'],
            level: 'advanced',
            context: {
                conditions: { hasCreatedTemplate: true }
            },
            marketplaceContext: {
                page: 'creator-dashboard',
                userRole: 'creator'
            }
        },
        {
            id: 'community-participation',
            type: 'community-features',
            title: 'Community & Forum Participation',
            content: 'Connect with other creators, share techniques, ask questions, and participate in community discussions. Build your reputation and learn from experienced professionals.',
            filmTerminology: 'Like industry networking events and creative guilds - connect, collaborate, and grow your professional network.',
            actionItems: [
                'Introduce yourself in the community forum',
                'Ask questions and share your experiences',
                'Participate in creative challenges and discussions',
                'Follow creators whose work inspires you'
            ],
            relatedFeatures: ['Community Forum', 'User Profiles', 'Following System', 'Creative Challenges'],
            level: 'intermediate',
            context: {
                triggerElements: ['forum-post', 'community-nav']
            },
            marketplaceContext: {
                page: 'community',
                userRole: 'community-member'
            }
        },
        {
            id: 'profile-optimization',
            type: 'profile-management',
            title: 'Profile & Portfolio Management',
            content: 'Create a compelling profile that showcases your work and builds trust with potential buyers. A well-crafted profile increases template visibility and sales.',
            filmTerminology: 'Like your director\'s reel - showcase your best work and creative style to attract collaborators and opportunities.',
            actionItems: [
                'Complete your profile with professional information',
                'Upload a professional profile photo',
                'Write a compelling bio highlighting your expertise',
                'Showcase your best template creations'
            ],
            relatedFeatures: ['Profile Editor', 'Portfolio Gallery', 'Bio Management', 'Achievement System'],
            level: 'intermediate',
            context: {
                triggerElements: ['profile-edit', 'portfolio-section']
            },
            marketplaceContext: {
                page: 'profile',
                userRole: 'creator'
            }
        },
        {
            id: 'monetization-strategies',
            type: 'monetization',
            title: 'Template Monetization Best Practices',
            content: 'Learn effective strategies for pricing, marketing, and optimizing your templates for maximum revenue. Understanding market trends and customer needs drives success.',
            filmTerminology: 'Like film distribution strategy - understand your audience, price appropriately, and market effectively.',
            actionItems: [
                'Research competitive pricing in your template category',
                'Create compelling template descriptions and previews',
                'Use relevant tags and categories for discoverability',
                'Analyze performance metrics to optimize strategy'
            ],
            relatedFeatures: ['Pricing Tools', 'Analytics Dashboard', 'SEO Optimization', 'Marketing Resources'],
            level: 'advanced',
            context: {
                conditions: { isCreator: true, hasPublishedTemplates: true }
            },
            marketplaceContext: {
                page: 'creator-dashboard',
                userRole: 'creator'
            }
        }
    ], []);
    // Calculate current marketplace context for smart help suggestions
    const currentMarketplaceContext = useMemo(() => {
        return {
            page: currentPage,
            userRole,
            templateCategory: selectedTemplate?.category,
            templateType: selectedTemplate?.type,
            isPremiumTemplate: selectedTemplate?.isPremium,
            hasItemsInCart: cartItems > 0,
            purchaseStage,
            forumReputation: forumContext?.reputation || 0,
            hasPostedInForum: forumContext?.hasPosted || false,
            isNewUser: userRole === 'new-user',
            isCreator: userRole === 'creator'
        };
    }, [currentPage, userRole, selectedTemplate, cartItems, purchaseStage, forumContext]);
    // Find relevant marketplace help content based on context
    const getRelevantMarketplaceHelp = useCallback((context) => {
        return marketplaceHelpDatabase.filter(help => {
            const marketplaceCtx = help.marketplaceContext;
            // Page matching
            if (marketplaceCtx.page && marketplaceCtx.page !== context.page) {
                return false;
            }
            // User role matching
            if (marketplaceCtx.userRole && marketplaceCtx.userRole !== context.userRole) {
                return false;
            }
            // Purchase stage matching
            if (marketplaceCtx.purchaseStage && marketplaceCtx.purchaseStage !== context.purchaseStage) {
                return false;
            }
            // Template category matching
            if (marketplaceCtx.templateCategory && context.templateCategory &&
                marketplaceCtx.templateCategory !== context.templateCategory) {
                return false;
            }
            // Level filtering based on complexity preference
            const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
            const contextLevelIndex = levelOrder.indexOf(helpComplexity);
            const helpLevelIndex = levelOrder.indexOf(help.level);
            if (helpLevelIndex > contextLevelIndex + 1)
                return false;
            return true;
        });
    }, [marketplaceHelpDatabase, helpComplexity]);
    // Position overlay relative to target element
    const positionOverlay = useCallback((targetElement, overlay) => {
        if (!targetElement || !overlay)
            return;
        const targetRect = targetElement.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let x = targetRect.left + targetRect.width / 2 - overlayRect.width / 2;
        let y = targetRect.bottom + 10;
        // Adjust for viewport boundaries
        if (x < 10)
            x = 10;
        if (x + overlayRect.width > viewportWidth - 10) {
            x = viewportWidth - overlayRect.width - 10;
        }
        if (y + overlayRect.height > viewportHeight - 10) {
            y = targetRect.top - overlayRect.height - 10;
        }
        setOverlayPosition({ x, y });
    }, []);
    // Show help overlay for specific element
    const showHelpOverlay = useCallback((elementSelector, helpId) => {
        const targetElement = document.querySelector(elementSelector);
        if (!targetElement)
            return;
        targetElementRef.current = targetElement;
        // Find relevant help content
        const relevantHelp = helpId
            ? marketplaceHelpDatabase.find(h => h.id === helpId)
            : getRelevantMarketplaceHelp(currentMarketplaceContext)[0];
        if (relevantHelp) {
            setActiveOverlay(relevantHelp);
            setIsOverlayVisible(true);
            // Position overlay after it's rendered
            setTimeout(() => {
                if (overlayRef.current) {
                    positionOverlay(targetElement, overlayRef.current);
                }
            }, 10);
            // Track interaction
            onHelpInteraction?.('overlay_shown', {
                helpId: relevantHelp.id,
                targetElement: elementSelector,
                context: currentMarketplaceContext
            });
        }
    }, [marketplaceHelpDatabase, getRelevantMarketplaceHelp, currentMarketplaceContext, positionOverlay, onHelpInteraction]);
    // Hide overlay
    const hideOverlay = useCallback(() => {
        if (activeOverlay) {
            onHelpInteraction?.('overlay_closed', {
                helpId: activeOverlay.id,
                timeShown: Date.now() // Could track duration
            });
        }
        setActiveOverlay(null);
        setIsOverlayVisible(false);
        targetElementRef.current = null;
    }, [activeOverlay, onHelpInteraction]);
    // Start guided tour
    const startGuidedTour = useCallback((tourType) => {
        const tourContent = marketplaceHelpDatabase.filter(help => help.type === tourType ||
            (help.marketplaceContext.page === currentPage && help.level === 'beginner'));
        if (tourContent.length > 0) {
            setCurrentTour(tourType);
            setTourStep(0);
            setActiveOverlay(tourContent[0]);
            setIsOverlayVisible(true);
            onHelpInteraction?.('tour_started', {
                tourType,
                stepCount: tourContent.length,
                context: currentMarketplaceContext
            });
        }
    }, [marketplaceHelpDatabase, currentPage, currentMarketplaceContext, onHelpInteraction]);
    // Next tour step
    const nextTourStep = useCallback(() => {
        if (!currentTour)
            return;
        const tourContent = marketplaceHelpDatabase.filter(help => help.type === currentTour ||
            (help.marketplaceContext.page === currentPage && help.level === 'beginner'));
        const nextStep = tourStep + 1;
        if (nextStep < tourContent.length) {
            setTourStep(nextStep);
            setActiveOverlay(tourContent[nextStep]);
        }
        else {
            // Tour completed
            onTourCompleted?.(currentTour);
            onHelpInteraction?.('tour_completed', {
                tourType: currentTour,
                totalSteps: tourContent.length
            });
            setCurrentTour(null);
            setTourStep(0);
            hideOverlay();
        }
    }, [currentTour, tourStep, marketplaceHelpDatabase, currentPage, onTourCompleted, onHelpInteraction, hideOverlay]);
    // Auto-trigger contextual help based on marketplace context
    useEffect(() => {
        if (!showMarketplaceHelp)
            return;
        const relevantHelp = getRelevantMarketplaceHelp(currentMarketplaceContext);
        const prioritizedHelp = relevantHelp.filter(help => {
            // Show help for new users or specific contexts
            return currentMarketplaceContext.isNewUser ||
                help.marketplaceContext.purchaseStage === currentMarketplaceContext.purchaseStage;
        });
        if (prioritizedHelp.length > 0 && !activeOverlay) {
            const timer = setTimeout(() => {
                setActiveOverlay(prioritizedHelp[0]);
                setIsOverlayVisible(true);
                setOverlayPosition({ x: 20, y: 100 });
            }, 2000); // Delay to avoid overwhelming user
            return () => clearTimeout(timer);
        }
    }, [showMarketplaceHelp, getRelevantMarketplaceHelp, currentMarketplaceContext, activeOverlay]);
    // Handle feedback submission
    const handleFeedbackSubmit = useCallback((rating, comment) => {
        if (activeOverlay) {
            onFeedbackSubmitted?.({
                rating,
                comment,
                context: `${activeOverlay.id} - ${currentMarketplaceContext.page}`
            });
        }
        setShowFeedback(false);
    }, [activeOverlay, currentMarketplaceContext, onFeedbackSubmitted]);
    // Expose methods for external control
    useEffect(() => {
        // Attach methods to window for external access
        window.marketplaceHelp = {
            showHelp: showHelpOverlay,
            hideHelp: hideOverlay,
            startTour: startGuidedTour
        };
        return () => {
            delete window.marketplaceHelp;
        };
    }, [showHelpOverlay, hideOverlay, startGuidedTour]);
    if (!showMarketplaceHelp)
        return null;
    return (_jsxs("div", { className: "marketplace-help-overlay", children: [isOverlayVisible && activeOverlay && (_jsxs("div", { ref: overlayRef, className: `marketplace-help-tooltip ${overlaySize}`, style: {
                    position: 'fixed',
                    left: `${overlayPosition.x}px`,
                    top: `${overlayPosition.y}px`,
                    zIndex: 10001
                }, children: [_jsxs("div", { className: "overlay-header", children: [_jsxs("div", { className: "help-title", children: [_jsxs("span", { className: "help-icon", children: [activeOverlay.type === 'marketplace-discovery' && '🏪', activeOverlay.type === 'template-browsing' && '🔍', activeOverlay.type === 'template-preview' && '👁️', activeOverlay.type === 'purchase-flow' && '💳', activeOverlay.type === 'rating-system' && '⭐', activeOverlay.type === 'creator-onboarding' && '👨‍🎨', activeOverlay.type === 'community-features' && '👥', activeOverlay.type === 'profile-management' && '👤', activeOverlay.type === 'monetization' && '💰', !activeOverlay.type.includes('marketplace') && '💡'] }), _jsx("h3", { children: activeOverlay.title })] }), _jsxs("div", { className: "overlay-controls", children: [_jsx("button", { className: "size-toggle", onClick: () => setOverlaySize(overlaySize === 'compact' ? 'normal' : 'compact'), title: "Toggle size", children: overlaySize === 'compact' ? '⬆' : '⬇' }), _jsx("button", { className: "feedback-button", onClick: () => setShowFeedback(true), title: "Provide feedback", children: "\uD83D\uDCAC" }), _jsx("button", { className: "close-button", onClick: hideOverlay, title: "Close help", children: "\u00D7" })] })] }), _jsxs("div", { className: "overlay-content", children: [_jsx("p", { className: "help-description", children: activeOverlay.content }), activeOverlay.filmTerminology && overlaySize !== 'compact' && (_jsxs("div", { className: "marketplace-terminology", children: [_jsx("span", { className: "terminology-icon", children: "\uD83C\uDFAD" }), _jsx("p", { children: activeOverlay.filmTerminology })] })), overlaySize === 'expanded' && activeOverlay.actionItems && (_jsxs("div", { className: "action-items", children: [_jsx("h4", { children: "Quick Actions:" }), _jsx("ul", { children: activeOverlay.actionItems.map((action, index) => (_jsx("li", { children: action }, index))) })] })), overlaySize === 'expanded' && activeOverlay.relatedFeatures && (_jsxs("div", { className: "related-features", children: [_jsx("h4", { children: "Related Features:" }), _jsx("div", { className: "feature-tags", children: activeOverlay.relatedFeatures.map((feature, index) => (_jsx("span", { className: "feature-tag", children: feature }, index))) })] }))] }), currentTour && (_jsxs("div", { className: "tour-navigation", children: [_jsxs("div", { className: "tour-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: {
                                                width: `${((tourStep + 1) / marketplaceHelpDatabase.filter(h => h.type === currentTour).length) * 100}%`
                                            } }) }), _jsxs("span", { className: "step-text", children: ["Step ", tourStep + 1, " of ", marketplaceHelpDatabase.filter(h => h.type === currentTour).length] })] }), _jsxs("div", { className: "tour-controls", children: [_jsx("button", { className: "tour-skip", onClick: hideOverlay, children: "Skip Tour" }), _jsx("button", { className: "tour-next", onClick: nextTourStep, children: tourStep === marketplaceHelpDatabase.filter(h => h.type === currentTour).length - 1 ? 'Finish' : 'Next →' })] })] })), showFeedback && (_jsxs("div", { className: "feedback-form", children: [_jsx("h4", { children: "Was this helpful?" }), _jsx("div", { className: "feedback-rating", children: [1, 2, 3, 4, 5].map(rating => (_jsx("button", { className: "rating-star", onClick: () => handleFeedbackSubmit(rating, ''), children: "\u2B50" }, rating))) }), _jsx("button", { className: "feedback-close", onClick: () => setShowFeedback(false), children: "Cancel" })] }))] })), userRole === 'new-user' && currentPage === 'marketplace' && !currentTour && enableGuidedTours && (_jsx("div", { className: "marketplace-tour-launcher", children: _jsx("button", { className: "start-marketplace-tour", onClick: () => startGuidedTour('marketplace-discovery'), children: "\uD83D\uDE80 Take Marketplace Tour" }) })), _jsx("style", { jsx: true, children: `
        .marketplace-help-overlay {
          position: relative;
          pointer-events: none;
        }

        .marketplace-help-overlay * {
          pointer-events: auto;
        }

        .marketplace-help-tooltip {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #0f4c75;
          border-radius: 12px;
          color: #fff;
          min-width: 320px;
          max-width: 500px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          animation: marketplaceSlideIn 0.3s ease-out;
          backdrop-filter: blur(10px);
        }

        .marketplace-help-tooltip.compact {
          max-height: 180px;
          min-width: 280px;
        }

        .marketplace-help-tooltip.normal {
          max-height: 350px;
        }

        .marketplace-help-tooltip.expanded {
          max-height: 600px;
          max-width: 600px;
        }

        @keyframes marketplaceSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #0f4c75;
          background: rgba(15, 76, 117, 0.2);
        }

        .help-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .help-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #3bb3e0;
        }

        .help-icon {
          font-size: 20px;
        }

        .overlay-controls {
          display: flex;
          gap: 8px;
        }

        .size-toggle,
        .feedback-button,
        .close-button {
          background: rgba(59, 179, 224, 0.2);
          border: 1px solid #3bb3e0;
          color: #3bb3e0;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .size-toggle:hover,
        .feedback-button:hover,
        .close-button:hover {
          background: rgba(59, 179, 224, 0.4);
          transform: scale(1.05);
        }

        .overlay-content {
          padding: 20px;
        }

        .help-description {
          margin: 0 0 16px 0;
          line-height: 1.5;
          font-size: 14px;
          color: #e0e7ff;
        }

        .marketplace-terminology {
          background: linear-gradient(135deg, rgba(59, 179, 224, 0.1) 0%, rgba(15, 76, 117, 0.2) 100%);
          border-left: 4px solid #3bb3e0;
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 0 8px 8px 0;
        }

        .marketplace-terminology p {
          margin: 0;
          font-size: 13px;
          color: #3bb3e0;
          font-style: italic;
        }

        .terminology-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .action-items {
          margin-top: 20px;
        }

        .action-items h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #3bb3e0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-items ul {
          margin: 0;
          padding-left: 20px;
        }

        .action-items li {
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 6px;
          color: #cbd5e1;
        }

        .related-features {
          margin-top: 20px;
        }

        .related-features h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #3bb3e0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .feature-tag {
          background: rgba(59, 179, 224, 0.2);
          color: #3bb3e0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          border: 1px solid rgba(59, 179, 224, 0.3);
        }

        .tour-navigation {
          border-top: 1px solid #0f4c75;
          padding: 16px 20px;
          background: rgba(15, 76, 117, 0.1);
        }

        .tour-progress {
          margin-bottom: 12px;
        }

        .progress-bar {
          background: rgba(59, 179, 224, 0.2);
          height: 4px;
          border-radius: 2px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(90deg, #3bb3e0 0%, #0f4c75 100%);
          height: 100%;
          transition: width 0.3s ease;
        }

        .step-text {
          font-size: 12px;
          color: #3bb3e0;
        }

        .tour-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tour-skip {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #cbd5e1;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .tour-skip:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }

        .tour-next {
          background: linear-gradient(135deg, #3bb3e0 0%, #0f4c75 100%);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .tour-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 179, 224, 0.3);
        }

        .feedback-form {
          border-top: 1px solid #0f4c75;
          padding: 16px 20px;
          background: rgba(15, 76, 117, 0.1);
        }

        .feedback-form h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #3bb3e0;
        }

        .feedback-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }

        .rating-star {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .rating-star:hover {
          transform: scale(1.2);
        }

        .feedback-close {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #cbd5e1;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }

        .marketplace-tour-launcher {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9998;
        }

        .start-marketplace-tour {
          background: linear-gradient(135deg, #3bb3e0 0%, #0f4c75 100%);
          color: #fff;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 8px 24px rgba(59, 179, 224, 0.3);
          transition: all 0.3s ease;
          animation: marketplaceTourPulse 4s ease-in-out infinite;
        }

        .start-marketplace-tour:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(59, 179, 224, 0.4);
        }

        @keyframes marketplaceTourPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .marketplace-help-tooltip {
            min-width: 280px;
            max-width: 90vw;
          }
          
          .overlay-header {
            padding: 12px 16px;
          }
          
          .overlay-content {
            padding: 16px;
          }
          
          .marketplace-tour-launcher {
            bottom: 20px;
            right: 20px;
          }
          
          .start-marketplace-tour {
            padding: 12px 20px;
            font-size: 13px;
          }
        }
      ` })] }));
};
export default MarketplaceHelpOverlay;
