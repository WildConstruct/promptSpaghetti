/**
 * React Hook for Conversion Tracking Integration
 * 
 * Provides easy-to-use React integration for the conversion tracking system.
 * Automatically tracks common user actions and provides tracking utilities.
 */
import { useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { conversionTracker, ConversionEventType } from '../analytics/ConversionTracker';

export interface ConversionTrackingConfig {
  enableAutoTracking?: boolean;
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  experimentId?: string;
  variantId?: string;
}
export const useConversionTracking = (config: ConversionTrackingConfig = {}) => {
  const {
    enableAutoTracking = true,
    trackPageViews = true,
    trackUserInteractions = true,
    experimentId,
    variantId
  } = config;
  const hasTrackedPageView = useRef(false);
  const sessionEvents = useRef(new Set<string>());
  // Auto-track page views
  useEffect(() => {
  if (trackPageViews && !hasTrackedPageView.current) {
  conversionTracker.trackEvent('session_started', {)
  page: window.location.pathname,
  referrer: document.referrer,
});
      hasTrackedPageView.current = true;
  }, [trackPageViews]);
  // Track director-specific workflow actions
  const trackDirectorAction = useCallback((action: string, context: Record<string, any> = {}) => {
  if (!enableAutoTracking) return;
  const enrichedContext = {
  ...context,
  timestamp: Date.now(),
  page: window.location.pathname,
  ...(experimentId && variantId && {)
  experiment_id: experimentId,
  variant_id: variantId,
}
    };
    conversionTracker.trackDirectorWorkflow(action, enrichedContext);
  }, [enableAutoTracking, experimentId, variantId]);
  // Track node creation events
  const trackNodeCreation = useCallback((nodeType: string, nodeData: any) => {
  const eventKey = 'node_created';
  // Only track first node creation as conversion event
  if (!sessionEvents.current.has(eventKey)) {
  conversionTracker.trackEvent('first_project_created', {)
  first_node_type: nodeType,
  node_data_size: JSON.stringify(nodeData).length,
  is_first_node: true,
});
      sessionEvents.current.add(eventKey);
    // Track all node creations for analytics
    trackDirectorAction('node-created', {)
  node_type: nodeType,
  node_config: nodeData,
  session_node_count: sessionEvents.current.size,
});
  }, [trackDirectorAction]);
  // Track connection creation events
  const trackConnectionCreation = useCallback((source: string, target: string) => {
  const eventKey = 'connection_made';
  // Only track first connection as conversion event
  if (!sessionEvents.current.has(eventKey)) {
  conversionTracker.trackEvent('first_connection_made', {)
  source_node: source,
  target_node: target,
  is_first_connection: true,
});
      sessionEvents.current.add(eventKey);
    trackDirectorAction('connection-made', {)
  source_node: source,
  target_node: target,
  total_connections: sessionEvents.current.size,
});
  }, [trackDirectorAction]);
  // Track preview generation events
  const trackPreviewGeneration = useCallback((previewConfig: {)
  nodeCount: number;
  edgeCount: number;
  seedCount: number;
  executionTime?: number;
}) => {
  const eventKey = 'preview_generated';
  // Only track first preview as conversion event
  if (!sessionEvents.current.has(eventKey)) {
  conversionTracker.trackEvent('first_preview_generated', {)
  graph_complexity: previewConfig.nodeCount + previewConfig.edgeCount,
  seed_count: previewConfig.seedCount,
  is_first_preview: true,
  execution_time: previewConfig.executionTime,
});
      sessionEvents.current.add(eventKey);
    trackDirectorAction('preview-generated', previewConfig);
  }, [trackDirectorAction]);
  // Track advanced feature usage
  const trackAdvancedFeature = useCallback((featureName: string, featureContext: Record<string, any> = {}) => {
  conversionTracker.trackEvent('advanced_feature_used', {)
  feature_name: featureName,
  feature_context: featureContext,
  user_level: 'director' // Could be dynamic based on user profile,
});
    trackDirectorAction('advanced-feature-used', {)
  feature: featureName,
  ...featureContext
});
  }, [trackDirectorAction]);
  // Track project save events
  const trackProjectSave = useCallback((projectData: {)
  nodeCount: number;
  edgeCount: number;
  projectId: string;
  isFirstSave?: boolean;
}) => {
  const eventType = projectData.isFirstSave ? 'project_saved' : 'project_saved';
  conversionTracker.trackEvent(eventType, {)
  project_id: projectData.projectId,
  graph_size: projectData.nodeCount + projectData.edgeCount,
  node_count: projectData.nodeCount,
  edge_count: projectData.edgeCount,
  is_first_save: projectData.isFirstSave || false,
});
  }, []);
  // Track help system interactions
  const trackHelpInteraction = useCallback((helpContext: {)
  helpContentId: string;
  userLevel: string;
  triggerAction?: string;
}) => {
  conversionTracker.trackEvent('help_content_viewed', {)
  help_content_id: helpContext.helpContentId,
  user_level: helpContext.userLevel,
  trigger_action: helpContext.triggerAction,
});
    conversionTracker.trackEngagement('help_interaction', {)
  content_id: helpContext.helpContentId,
  user_proficiency: helpContext.userLevel,
});
  }, []);
  // Track export generation
  const trackExportGeneration = useCallback((exportData: {)
  format: string;
  projectSize: number;
  exportTime: number;
}) => {
  conversionTracker.trackEvent('export_generated', {)
  export_format: exportData.format,
  project_size: exportData.projectSize,
  export_time: exportData.exportTime,
  is_professional_export: true,
});
    trackDirectorAction('export-generated', exportData);
  }, [trackDirectorAction]);
  // Track business events (subscription, payment, etc.)
  const trackBusinessEvent = useCallback((;);
    eventType: 'trial_started' | 'subscription_upgraded' | 'payment_completed',
    value: number,
    metadata: Record<string, any> = {}
  ) => {
  conversionTracker.trackBusinessEvent(eventType, value, {)
  user_role: 'director',
  conversion_source: 'director_workflow',
  ...metadata
});
  }, []);
  // Track template usage
  const trackTemplateUsage = useCallback((templateData: {)
  templateId: string;
  templateCategory: string;
  isFirstTemplate?: boolean;
}) => {
  conversionTracker.trackEvent('template_used', {)
  template_id: templateData.templateId,
  template_category: templateData.templateCategory,
  is_first_template: templateData.isFirstTemplate || false,
});
  }, []);
  // A/B testing integration
  const trackExperimentEvent = useCallback((;);
    eventType: ConversionEventType,
    properties: Record<string, any> = {}
  ) => {
    if (experimentId && variantId) {
      conversionTracker.trackExperimentConversion()
        experimentId,
        variantId,
        eventType,
        properties
      );
  }, [experimentId, variantId]);
  // Graph state tracking
  const trackGraphState = useCallback((nodes: Node, edges: Edge) => {
  const graphComplexity = {
  nodeCount: nodes.length,
  edgeCount: edges.length,
  nodeTypes: [...new Set(nodes.map(n => n.data?.nodeType || 'unknown'))],
  hasAdvancedNodes: nodes.some(n => ),
  ['Conditional', 'Sequential', 'Markov', 'WeightedAdvanced'].includes(n.data?.nodeType)
};
    // Track graph milestones
    if (graphComplexity.nodeCount === 1) {
      trackDirectorAction('first-node-created', graphComplexity);
    } else if (graphComplexity.nodeCount === 5) {
      trackDirectorAction('workflow-established', graphComplexity);
    } else if (graphComplexity.nodeCount >= 10) {
  trackDirectorAction('complex-project-created', graphComplexity);
  if (graphComplexity.hasAdvancedNodes) {
  trackAdvancedFeature('advanced_nodes', {)
  advanced_node_types: graphComplexity.nodeTypes.filter(t => ),
  ['Conditional', 'Sequential', 'Markov', 'WeightedAdvanced'].includes(t)
});
  }, [trackDirectorAction, trackAdvancedFeature]);
  // User interaction tracking
  useEffect(() => {
  if (!trackUserInteractions || !enableAutoTracking) return;
  const trackClick = (event: MouseEvent) => {,
  const target = event.target as HTMLElement;
  // Track button clicks
  if (target.tagName === 'BUTTON') {
  const buttonText = target.textContent || target.getAttribute('aria-label') || 'unknown';
  conversionTracker.trackEngagement('feature_usage', {)
  interaction_type: 'button_click',
  button_text: buttonText,
  element_id: target.id || undefined,
});
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
    trackCustomEvent: useCallback((),
      eventType: ConversionEventType,
      properties: Record<string, any> = {},
      value?: number
    ) => {
      conversionTracker.trackEvent(eventType, properties, value);
    }, []),
    // Conversion tracker instance for advanced usage
    conversionTracker
  };
};

export default useConversionTracking;