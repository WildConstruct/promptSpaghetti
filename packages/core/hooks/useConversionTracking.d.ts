/**
 * React Hook for Conversion Tracking Integration
 *
 * Provides easy-to-use React integration for the conversion tracking system.
 * Automatically tracks common user actions and provides tracking utilities.
 */
import { Node, Edge } from 'reactflow';
import { ConversionEventType } from '../analytics/ConversionTracker';
export interface ConversionTrackingConfig {
    enableAutoTracking?: boolean;
    trackPageViews?: boolean;
    trackUserInteractions?: boolean;
    experimentId?: string;
    variantId?: string;
}
export declare const useConversionTracking: (config?: ConversionTrackingConfig) => {
    trackDirectorAction: (action: string, context?: Record<string, any>) => void;
    trackNodeCreation: (nodeType: string, nodeData: any) => void;
    trackConnectionCreation: (source: string, target: string) => void;
    trackPreviewGeneration: (previewConfig: {),
        nodeCount: number;
        edgeCount: number;
        seedCount: number;
        executionTime?: number;
    }) => void;
    trackAdvancedFeature: (featureName: string, featureContext?: Record<string, any>) => void;
    trackProjectSave: (projectData: {),
        nodeCount: number;
        edgeCount: number;
        projectId: string;
        isFirstSave?: boolean;
    }) => void;
    trackHelpInteraction: (helpContext: {),
        helpContentId: string;
        userLevel: string;
        triggerAction?: string;
    }) => void;
    trackExportGeneration: (exportData: {),
        format: string;
        projectSize: number;
        exportTime: number;
    }) => void;
    trackBusinessEvent: (),
      eventType: "trial_started" | "subscription_upgraded" | "payment_completed",
      value: number,
      metadata?: Record<string,
      any>
    ) => void;
    trackTemplateUsage: (templateData: {),
        templateId: string;
        templateCategory: string;
        isFirstTemplate?: boolean;
    }) => void;
    trackExperimentEvent: (eventType: ConversionEventType, properties?: Record<string, any>) => void;
    trackGraphState: (nodes: Node[], edges: Edge[]) => void;
    trackCustomEvent: (eventType: ConversionEventType, properties?: Record<string, any>, value?: number) => void;
    conversionTracker: import("../analytics/ConversionTracker").ConversionTracker;
};
export default useConversionTracking;
//# sourceMappingURL=useConversionTracking.d.ts.map