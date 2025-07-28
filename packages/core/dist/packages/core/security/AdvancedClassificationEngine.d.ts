/**
 * Advanced Classification Engine
 *
 * Enhanced data classification system with machine learning capabilities,
 * real-time processing, workflow integration, and advanced analytics.
 * Extends the base DataClassifier with enterprise-grade features.
 */
import { EventEmitter } from 'events';
import { ClassificationLevel, DataCategory, ClassificationResult } from './DataClassifier';
export interface MLClassificationModel {
    id: string;
    name: string;
    type: 'text_classifier' | 'pattern_detector' | 'anomaly_detector' | 'similarity_matcher';
    version: string;
    accuracy: number;
    trainingData: number;
    lastTrained: Date;
    enabled: boolean;
    threshold: number;
    categories: DataCategory;
    features: string;
}
export interface ClassificationWorkflow {
    id: string;
    name: string;
    description: string;
    triggers: WorkflowTrigger;
    actions: WorkflowAction;
    conditions: WorkflowCondition;
    enabled: boolean;
    priority: number;
}
export interface WorkflowTrigger {
    type: 'classification_complete' | 'threshold_exceeded' | 'compliance_violation' | 'manual_review_required';
    conditions: Record<string, any>;
}
export interface WorkflowAction {
    type: 'notify' | 'encrypt' | 'quarantine' | 'audit_log' | 'escalate' | 'auto_remediate';
    parameters: Record<string, any>;
    timeout: number;
}
export interface WorkflowCondition {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
    value: any;
    logic: 'AND' | 'OR';
}
export interface ClassificationAnalytics {
    totalClassifications: number;
    classificationsByLevel: Record<ClassificationLevel, number>;
    classificationsByCategory: Record<DataCategory, number>;
    complianceViolations: number;
    averageConfidence: number;
    topRiskPatterns: Array<{}, pattern>;
    string: any;
    count: number;
    riskScore: number;
}
export interface DataFlow {
    id: string;
    source: string;
    destination: string;
    dataTypes: DataCategory;
    classificationLevels: ClassificationLevel;
    encryptionInTransit: boolean;
    lastClassified: Date;
    riskScore: number;
    complianceStatus: 'compliant' | 'violation' | 'unknown';
}
export interface ClassificationContext {
    source: string;
    purpose: string;
    userContext: {
        userId: string;
        role: string;
        department: string;
        clearanceLevel: string;
    };
    environmentContext: {
        system: string;
        network: string;
        location: string;
        timezone: string;
    };
    dataFlow?: DataFlow;
    parentClassification?: string;
}
export interface EnhancedClassificationResult extends ClassificationResult {
    mlPredictions: Array<{}, model>;
    string: any;
    prediction: ClassificationLevel;
    confidence: number;
    features: Record<string, number>;
}
/**
 * Advanced Classification Engine with ML and Workflow Capabilities
 */
export declare class AdvancedClassificationEngine extends EventEmitter {
    private baseClassifier;
    private policyManager;
    private mlModels;
    private workflows;
    private dataFlows;
    private analytics;
    private contextualCache;
    constructor();
    /**
    * Enhanced classification with ML and context awareness
    */
    classifyWithContext(): any;
}
//# sourceMappingURL=AdvancedClassificationEngine.d.ts.map