import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.4 - Contextual Help System
 *
 * Director-friendly contextual help system designed for film industry professionals.
 * Provides intelligent, non-intrusive guidance using cinema terminology and workflows.
 *
 * Features:
 * - Smart contextual tooltips that appear based on user actions
 * - Progressive onboarding hints for new directors
 * - Film industry terminology and metaphors
 * - Professional cinema-appropriate UI design
 * - Help content management system
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
export const ContextualHelpSystem = ({ nodes, edges, selectedNodeId, _____selectedEdgeId, userLevel = 'beginner', enabled = true, autoTrigger = true, showProgressiveHints = true, onHelpContentViewed, _____onUserLevelChange }) => {
    // State management
    const [activeHelp, setActiveHelp] = useState(null);
    const [helpPosition, setHelpPosition] = useState({ x: 0, y: 0 });
    const [viewedContent, setViewedContent] = useState(new Set());
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTour, setCurrentTour] = useState(null);
    const [tourStep, setTourStep] = useState(0);
    // Refs for positioning
    const helpTooltipRef = useRef(null);
    // Comprehensive help content database
    const helpDatabase = useMemo(() => [
        {
            id: 'getting-started-canvas',
            type: 'getting-started',
            title: 'Welcome to the Director\'s Canvas',
            content: 'This is your creative workspace where you\'ll build narrative flows. Think of it like a storyboard editor - each node represents a scene or creative decision in your story.',
            filmTerminology: 'Like setting up shots in pre-production, you\'ll arrange story elements visually.',
            actionItems: [
                'Drag nodes from the palette to create story elements',
                'Connect nodes to establish narrative flow',
                'Use the preview system to see your story in action'
            ],
            level: 'beginner',
            context: {
                conditions: { nodeCount: 0, edgeCount: 0 }
            }
        },
        {
            id: 'node-creation-basics',
            type: 'node-creation',
            title: 'Creating Story Elements',
            content: 'Nodes are the building blocks of your narrative. Each type serves a specific purpose in your creative workflow.',
            filmTerminology: 'Think of nodes as different shot types - wide shots (Output), close-ups (WeightedChoice), and transitions (Concat).',
            actionItems: [
                'Choose the right node type for your creative intent',
                'Configure variations to explore creative possibilities',
                'Connect nodes to build narrative flow'
            ],
            relatedFeatures: ['Palette', 'Inspector Panel', 'Node Configuration'],
            level: 'beginner',
            context: {
                triggerElements: ['palette-item'],
                actions: ['node-drag', 'node-drop']
            }
        },
        {
            id: 'weighted-choice-direction',
            type: 'professional-workflow',
            title: 'Directing Creative Choices',
            content: 'WeightedChoice nodes let you control the probability of different creative options. Higher weights make options more likely to appear.',
            filmTerminology: 'Like calling different takes during a shoot - you can favor certain performance directions while keeping alternatives available.',
            actionItems: [
                'Adjust weights to favor preferred creative directions',
                'Use multiple variations to explore alternatives',
                'Preview different weight combinations to find the right balance'
            ],
            level: 'intermediate',
            context: {
                nodeTypes: ['WeightedChoice'],
                triggerElements: ['weight-slider', 'variation-input']
            }
        },
        {
            id: 'connection-flow-narrative',
            type: 'connection-flow',
            title: 'Building Narrative Connections',
            content: 'Connections between nodes determine how your story flows. Each connection represents a creative pathway through your narrative.',
            filmTerminology: 'Like editing decisions - each connection is a cut that moves the audience from one moment to the next.',
            actionItems: [
                'Connect output ports to input ports to establish flow',
                'Create branching paths for multiple story possibilities',
                'Use the preview to see how connections affect the final result'
            ],
            level: 'beginner',
            context: {
                actions: ['connection-start', 'connection-complete']
            }
        },
        {
            id: 'preview-system-dailies',
            type: 'preview-generation',
            title: 'Reviewing Your Creative Work',
            content: 'The preview system shows you how your narrative choices play out. Generate multiple versions to explore creative possibilities.',
            filmTerminology: 'Like watching dailies - you can review different takes and see which creative choices work best.',
            actionItems: [
                'Use the Director Preview Toolbar for real-time feedback',
                'Generate multiple variants to compare options',
                'Rate and save the versions you like best'
            ],
            relatedFeatures: ['Real-time Preview', 'Enhanced Preview Modal', 'Variance Analysis'],
            level: 'intermediate',
            context: {
                triggerElements: ['preview-button', 'director-toolbar']
            }
        },
        {
            id: 'advanced-conditional-direction',
            type: 'advanced-features',
            title: 'Advanced Creative Direction',
            content: 'Conditional nodes let you create smart creative decisions based on story context. Use them to build adaptive narratives.',
            filmTerminology: 'Like having different shot plans for different scenarios - the system adapts based on creative context.',
            actionItems: [
                'Define conditions that trigger different creative paths',
                'Use variables to carry story context between scenes',
                'Test different scenarios to ensure robust storytelling'
            ],
            level: 'advanced',
            context: {
                nodeTypes: ['Conditional', 'GetVariable', 'SetVariable']
            }
        },
        {
            id: 'professional-export-pipeline',
            type: 'professional-workflow',
            title: 'Pipeline Integration',
            content: 'Export your creative work in formats that integrate with professional VFX and post-production pipelines.',
            filmTerminology: 'Like delivering final cuts to post - structured exports that fit your production pipeline.',
            actionItems: [
                'Use structured export formats for VFX integration',
                'Include metadata for post-production tracking',
                'Maintain version control for collaborative workflows'
            ],
            level: 'professional',
            context: {
                triggerElements: ['export-button', 'save-project']
            }
        }
    ], []);
    // Calculate current context for smart help suggestions
    const currentContext = useMemo(() => {
        const nodeCount = nodes.length;
        const edgeCount = edges.length;
        const selectedNodeType = selectedNodeId ? nodes.find(n => n.id === selectedNodeId)?.type : null;
        const hasWeightedChoices = nodes.some(n => n.type === 'WeightedChoice');
        const hasConditionals = nodes.some(n => n.type === 'Conditional');
        return {
            nodeCount,
            edgeCount,
            selectedNodeType,
            hasWeightedChoices,
            hasConditionals,
            isEmpty: nodeCount === 0 && edgeCount === 0,
            isComplex: nodeCount > 5 || edgeCount > 8
        };
    }, [nodes, edges, selectedNodeId]);
    // Find relevant help content based on current context
    const getRelevantHelp = useCallback((context) => {
        return helpDatabase.filter(help => {
            // Level filtering
            const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
            const userLevelIndex = levelOrder.indexOf(userLevel);
            const helpLevelIndex = levelOrder.indexOf(help.level);
            if (helpLevelIndex > userLevelIndex + 1)
                return false; // Not too advanced
            // Context matching
            if (help.context.conditions) {
                for (const [key, value] of Object.entries(help.context.conditions)) {
                    if (context[key] !== undefined && context[key] !== value) {
                        return false;
                    }
                }
            }
            // Node type matching
            if (help.context.nodeTypes && context.selectedNodeType) {
                return help.context.nodeTypes.includes(context.selectedNodeType);
            }
            return true;
        });
    }, [helpDatabase, userLevel]);
    // Auto-trigger contextual help
    useEffect(() => {
        if (!enabled || !autoTrigger)
            return;
        const relevantHelp = getRelevantHelp(currentContext);
        const unviewedHelp = relevantHelp.filter(help => !viewedContent.has(help.id));
        if (unviewedHelp.length > 0) {
            // Prioritize by user level and context relevance
            const prioritized = unviewedHelp.sort((a, b) => {
                const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            // Show the most relevant help with a slight delay
            const timer = setTimeout(() => {
                setActiveHelp(prioritized[0]);
                setHelpPosition({ x: 20, y: 100 }); // Default position
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [enabled, autoTrigger, currentContext, getRelevantHelp, viewedContent]);
    // Handle help content viewed
    const markAsViewed = useCallback((contentId) => {
        setViewedContent(prev => new Set([...prev, contentId]));
        onHelpContentViewed?.(contentId);
    }, [onHelpContentViewed]);
    // Close help
    const closeHelp = useCallback(() => {
        if (activeHelp) {
            markAsViewed(activeHelp.id);
        }
        setActiveHelp(null);
        setIsExpanded(false);
    }, [activeHelp, markAsViewed]);
    // Start onboarding tour
    const startTour = useCallback((tourType) => {
        setCurrentTour(tourType);
        setTourStep(0);
        // Get tour content
        const tourContent = helpDatabase.filter(help => help.type === tourType || help.level === 'beginner');
        if (tourContent.length > 0) {
            setActiveHelp(tourContent[0]);
        }
    }, [helpDatabase]);
    // Next tour step
    const nextTourStep = useCallback(() => {
        if (!currentTour)
            return;
        const tourContent = helpDatabase.filter(help => help.type === currentTour || help.level === 'beginner');
        const nextStep = tourStep + 1;
        if (nextStep < tourContent.length) {
            setTourStep(nextStep);
            setActiveHelp(tourContent[nextStep]);
        }
        else {
            // Tour complete
            setCurrentTour(null);
            setTourStep(0);
            closeHelp();
        }
    }, [currentTour, tourStep, helpDatabase, closeHelp]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: "contextual-help-system", children: [_jsxs("div", { className: "help-launcher", children: [_jsx("button", { className: "help-button", onClick: () => setActiveHelp(helpDatabase[0]), title: "Get contextual help", children: _jsx("span", { className: "help-icon", children: "\uD83D\uDCA1" }) }), showProgressiveHints && currentContext.isEmpty && (_jsxs("div", { className: "progressive-hint", children: [_jsx("span", { className: "hint-icon", children: "\uD83D\uDC4B" }), _jsx("span", { className: "hint-text", children: "Start by dragging a node from the palette" })] }))] }), activeHelp && (_jsxs("div", { ref: helpTooltipRef, className: `help-tooltip ${isExpanded ? 'expanded' : 'compact'}`, style: {
                    position: 'fixed',
                    left: `${helpPosition.x}px`,
                    top: `${helpPosition.y}px`,
                    zIndex: 10000
                }, children: [_jsxs("div", { className: "help-header", children: [_jsxs("div", { className: "help-title", children: [_jsxs("span", { className: "help-type-icon", children: [activeHelp.type === 'getting-started' && '🎬', activeHelp.type === 'node-creation' && '📝', activeHelp.type === 'connection-flow' && '🔗', activeHelp.type === 'weight-adjustment' && '⚖️', activeHelp.type === 'preview-generation' && '▶️', activeHelp.type === 'professional-workflow' && '🏆', activeHelp.type === 'advanced-features' && '🚀', activeHelp.type === 'troubleshooting' && '🔧'] }), _jsx("h3", { children: activeHelp.title })] }), _jsxs("div", { className: "help-controls", children: [_jsx("button", { className: "expand-button", onClick: () => setIsExpanded(!isExpanded), title: isExpanded ? 'Collapse help' : 'Expand help', children: isExpanded ? '▼' : '▶' }), _jsx("button", { className: "close-button", onClick: closeHelp, title: "Close help", children: "\u00D7" })] })] }), _jsxs("div", { className: "help-content", children: [_jsx("p", { className: "help-description", children: activeHelp.content }), activeHelp.filmTerminology && (_jsxs("div", { className: "film-terminology", children: [_jsx("span", { className: "film-icon", children: "\uD83C\uDFAD" }), _jsx("p", { children: activeHelp.filmTerminology })] })), isExpanded && activeHelp.actionItems && (_jsxs("div", { className: "action-items", children: [_jsx("h4", { children: "Next Steps:" }), _jsx("ul", { children: activeHelp.actionItems.map((action, index) => (_jsx("li", { children: action }, index))) })] })), isExpanded && activeHelp.relatedFeatures && (_jsxs("div", { className: "related-features", children: [_jsx("h4", { children: "Related Features:" }), _jsx("div", { className: "feature-tags", children: activeHelp.relatedFeatures.map((feature, index) => (_jsx("span", { className: "feature-tag", children: feature }, index))) })] }))] }), currentTour && (_jsxs("div", { className: "tour-navigation", children: [_jsxs("div", { className: "tour-progress", children: ["Step ", tourStep + 1, " of ", helpDatabase.filter(h => h.level === 'beginner').length] }), _jsx("button", { className: "tour-next", onClick: nextTourStep, children: "Next \u2192" })] }))] })), currentContext.isEmpty && (_jsx("div", { className: "tour-launcher", children: _jsx("button", { className: "start-tour-btn", onClick: () => startTour('getting-started'), children: "\uD83C\uDF93 Start Director Tour" }) })), _jsx("style", { jsx: true, children: `
        .contextual-help-system {
          position: relative;
        }

        .help-launcher {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .help-button {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }

        .help-button:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
        }

        .help-icon {
          font-size: 18px;
        }

        .progressive-hint {
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: fadeInPulse 2s ease-in-out;
        }

        @keyframes fadeInPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .help-tooltip {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 1px solid #ffd700;
          border-radius: 8px;
          color: #fff;
          min-width: 300px;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          animation: helpSlideIn 0.3s ease-out;
        }

        .help-tooltip.compact {
          max-height: 200px;
        }

        .help-tooltip.expanded {
          max-height: 500px;
        }

        @keyframes helpSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #444;
        }

        .help-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .help-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #ffd700;
        }

        .help-type-icon {
          font-size: 16px;
        }

        .help-controls {
          display: flex;
          gap: 4px;
        }

        .expand-button, .close-button {
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          padding: 4px;
          border-radius: 3px;
          transition: color 0.2s ease;
        }

        .expand-button:hover, .close-button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .help-content {
          padding: 16px;
        }

        .help-description {
          margin: 0 0 12px 0;
          line-height: 1.4;
          font-size: 13px;
          color: #ddd;
        }

        .film-terminology {
          background: rgba(255, 215, 0, 0.1);
          border-left: 3px solid #ffd700;
          padding: 8px 12px;
          margin: 12px 0;
          border-radius: 0 4px 4px 0;
        }

        .film-terminology p {
          margin: 0;
          font-size: 12px;
          color: #ffd700;
          font-style: italic;
        }

        .film-icon {
          margin-right: 6px;
        }

        .action-items {
          margin-top: 16px;
        }

        .action-items h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #ffd700;
          text-transform: uppercase;
        }

        .action-items ul {
          margin: 0;
          padding-left: 16px;
        }

        .action-items li {
          font-size: 12px;
          line-height: 1.4;
          margin-bottom: 4px;
          color: #ccc;
        }

        .related-features {
          margin-top: 16px;
        }

        .related-features h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #ffd700;
          text-transform: uppercase;
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .feature-tag {
          background: #444;
          color: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
        }

        .tour-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid #444;
          background: rgba(255, 215, 0, 0.1);
        }

        .tour-progress {
          font-size: 11px;
          color: #ffd700;
        }

        .tour-next {
          background: #ffd700;
          color: #000;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }

        .tour-launcher {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }

        .start-tour-btn {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #000;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
          transition: all 0.2s ease;
          animation: tourPulse 3s ease-in-out infinite;
        }

        .start-tour-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
        }

        @keyframes tourPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      ` })] }));
};
export default ContextualHelpSystem;
