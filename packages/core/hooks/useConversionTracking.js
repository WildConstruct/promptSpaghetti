/**
 * React Hook for Conversion Tracking Integration
 *
 * Provides easy-to-use React integration for the conversion tracking system.
 * Automatically tracks common user actions and provides tracking utilities.
 */
import { useEffect, useCallback, useRef } from 'react';
import { conversionTracker } from '../analytics/ConversionTracker.js';
export const useConversionTracking = (config = {}) => {
    const { enableAutoTracking = true, trackPageViews = true, trackUserInteractions = true, experimentId, variantId } = config;
    const hasTrackedPageView = useRef(false);
    const sessionEvents = useRef(new Set());
    // Auto-track page views
    useEffect(() => {
        if (trackPageViews && !hasTrackedPageView.current) {
            conversionTracker.trackEvent('session_started', {
                page: window.location.pathname,
                referrer: document.referrer
            });
            hasTrackedPageView.current = true;
        }
    }, [trackPageViews]);
    // Track director-specific workflow actions
    const trackDirectorAction = useCallback((action, context = {}) => {
        if (!enableAutoTracking)
            return;
        const enrichedContext = {
            ...context,
            timestamp: Date.now(),
            page: window.location.pathname,
            ...(experimentId && variantId && {
                experiment_id: experimentId,
                variant_id: variantId
            })
        };
        conversionTracker.trackDirectorWorkflow(action, enrichedContext);
    }, [enableAutoTracking, experimentId, variantId]);
    // Track node creation events
    const trackNodeCreation = useCallback((nodeType, nodeData) => {
        const eventKey = 'node_created';
        // Only track first node creation as conversion event
        if (!sessionEvents.current.has(eventKey)) {
            conversionTracker.trackEvent('first_project_created', {
                first_node_type: nodeType,
                node_data_size: JSON.stringify(nodeData).length,
                is_first_node: true
            });
            sessionEvents.current.add(eventKey);
        }
        // Track all node creations for analytics
        trackDirectorAction('node-created', {
            node_type: nodeType,
            node_config: nodeData,
            session_node_count: sessionEvents.current.size
        });
    }, [trackDirectorAction]);
    // Track connection creation events
    const trackConnectionCreation = useCallback((source, target) => {
        const eventKey = 'connection_made';
        // Only track first connection as conversion event
        if (!sessionEvents.current.has(eventKey)) {
            conversionTracker.trackEvent('first_connection_made', {
                source_node: source,
                target_node: target,
                is_first_connection: true
            });
            sessionEvents.current.add(eventKey);
        }
        trackDirectorAction('connection-made', {
            source_node: source,
            target_node: target,
            total_connections: sessionEvents.current.size
        });
    }, [trackDirectorAction]);
    // Track preview generation events
    const trackPreviewGeneration = useCallback((previewConfig) => {
        const eventKey = 'preview_generated';
        // Only track first preview as conversion event
        if (!sessionEvents.current.has(eventKey)) {
            conversionTracker.trackEvent('first_preview_generated', {
                graph_complexity: previewConfig.nodeCount + previewConfig.edgeCount,
                seed_count: previewConfig.seedCount,
                is_first_preview: true,
                execution_time: previewConfig.executionTime
            });
            sessionEvents.current.add(eventKey);
        }
        trackDirectorAction('preview-generated', previewConfig);
    }, [trackDirectorAction]);
    // Track advanced feature usage
    const trackAdvancedFeature = useCallback((featureName, featureContext = {}) => {
        conversionTracker.trackEvent('advanced_feature_used', {
            feature_name: featureName,
            feature_context: featureContext,
            user_level: 'director' // Could be dynamic based on user profile
        });
        trackDirectorAction('advanced-feature-used', {
            feature: featureName,
            ...featureContext
        });
    }, [trackDirectorAction]);
    // Track project save events
    const trackProjectSave = useCallback((projectData) => {
        const eventType = projectData.isFirstSave ? 'project_saved' : 'project_saved';
        conversionTracker.trackEvent(eventType, {
            project_id: projectData.projectId,
            graph_size: projectData.nodeCount + projectData.edgeCount,
            node_count: projectData.nodeCount,
            edge_count: projectData.edgeCount,
            is_first_save: projectData.isFirstSave || false
        });
    }, []);
    // Track help system interactions
    const trackHelpInteraction = useCallback((helpContext) => {
        conversionTracker.trackEvent('help_content_viewed', {
            help_content_id: helpContext.helpContentId,
            user_level: helpContext.userLevel,
            trigger_action: helpContext.triggerAction
        });
        conversionTracker.trackEngagement('help_interaction', {
            content_id: helpContext.helpContentId,
            user_proficiency: helpContext.userLevel
        });
    }, []);
    // Track export generation
    const trackExportGeneration = useCallback((exportData) => {
        conversionTracker.trackEvent('export_generated', {
            export_format: exportData.format,
            project_size: exportData.projectSize,
            export_time: exportData.exportTime,
            is_professional_export: true
        });
        trackDirectorAction('export-generated', exportData);
    }, [trackDirectorAction]);
    // Track business events (subscription, payment, etc.)
    const trackBusinessEvent = useCallback((eventType, value, metadata = {}) => {
        conversionTracker.trackBusinessEvent(eventType, value, {
            user_role: 'director',
            conversion_source: 'director_workflow',
            ...metadata
        });
    }, []);
    // Track template usage
    const trackTemplateUsage = useCallback((templateData) => {
        conversionTracker.trackEvent('template_used', {
            template_id: templateData.templateId,
            template_category: templateData.templateCategory,
            is_first_template: templateData.isFirstTemplate || false
        });
    }, []);
    // A/B testing integration
    const trackExperimentEvent = useCallback((eventType, properties = {}) => {
        if (experimentId && variantId) {
            conversionTracker.trackExperimentConversion(experimentId, variantId, eventType, properties);
        }
    }, [experimentId, variantId]);
    // Graph state tracking
    const trackGraphState = useCallback((nodes, edges) => {
        const graphComplexity = {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            nodeTypes: [...new Set(nodes.map(n => n.data?.nodeType || 'unknown'))],
            hasAdvancedNodes: nodes.some(n => ['Conditional', 'Sequential', 'Markov', 'WeightedAdvanced'].includes(n.data?.nodeType))
        };
        // Track graph milestones
        if (graphComplexity.nodeCount === 1) {
            trackDirectorAction('first-node-created', graphComplexity);
        }
        else if (graphComplexity.nodeCount === 5) {
            trackDirectorAction('workflow-established', graphComplexity);
        }
        else if (graphComplexity.nodeCount >= 10) {
            trackDirectorAction('complex-project-created', graphComplexity);
        }
        if (graphComplexity.hasAdvancedNodes) {
            trackAdvancedFeature('advanced_nodes', {
                advanced_node_types: graphComplexity.nodeTypes.filter(t => ['Conditional', 'Sequential', 'Markov', 'WeightedAdvanced'].includes(t))
            });
        }
    }, [trackDirectorAction, trackAdvancedFeature]);
    // User interaction tracking
    useEffect(() => {
        if (!trackUserInteractions || !enableAutoTracking)
            return;
        const trackClick = (event) => {
            const target = event.target;
            // Track button clicks
            if (target.tagName === 'BUTTON') {
                const buttonText = target.textContent || target.getAttribute('aria-label') || 'unknown';
                conversionTracker.trackEngagement('feature_usage', {
                    interaction_type: 'button_click',
                    button_text: buttonText,
                    element_id: target.id || undefined
                });
            }
        };
        document.addEventListener('click', trackClick);
        return () => document.removeEventListener('click', trackClick);
    }, [trackUserInteractions, enableAutoTracking]);
    return {
        // Direct tracking methods
        trackDirectorAction,
        trackNodeCreation,
        trackConnectionCreation,
        trackPreviewGeneration,
        trackAdvancedFeature,
        trackProjectSave,
        trackHelpInteraction,
        trackExportGeneration,
        trackBusinessEvent,
        trackTemplateUsage,
        trackExperimentEvent,
        trackGraphState,
        // Utility methods
        trackCustomEvent: useCallback((eventType, properties = {}, value) => {
            conversionTracker.trackEvent(eventType, properties, value);
        }, []),
        // Conversion tracker instance for advanced usage
        conversionTracker
    };
};
export default useConversionTracking;
