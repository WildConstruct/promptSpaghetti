/**
 * Advanced Classification Engine
 *
 * Enhanced data classification system with machine learning capabilities,
 * real-time processing, workflow integration, and advanced analytics.
 * Extends the base DataClassifier with enterprise-grade features.
 */
import { EventEmitter } from 'events';
import { 
  ClassificationLevel,
  DataCategory,
  ComplianceFramework,
  ClassificationResult,
  DataElement
} from './DataClassifier';
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
    categories: DataCategory[];
    features: string[];
}
export interface ClassificationWorkflow {
    id: string;
    name: string;
    description: string;
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    conditions: WorkflowCondition[];
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
    topRiskPatterns: Array<{,
        pattern: string;
        count: number;
        riskScore: number;
    }>;
    temporalTrends: Array<{,
        timestamp: Date;
        count: number;
        avgConfidence: number;
    }>;
    lastUpdated: Date;
}
export interface DataFlow {
    id: string;
    source: string;
    destination: string;
    dataTypes: DataCategory[];
    classificationLevels: ClassificationLevel[];
    encryptionInTransit: boolean;
    lastClassified: Date;
    riskScore: number;
    complianceStatus: 'compliant' | 'violation' | 'unknown';
}
export interface ClassificationContext {
    source: string;
    purpose: string;
    userContext: {,
        userId: string;
        role: string;
        department: string;
        clearanceLevel: string;
    };
    environmentContext: {,
        system: string;
        network: string;
        location: string;
        timezone: string;
    };
    dataFlow?: DataFlow;
    parentClassification?: string;
}
export interface EnhancedClassificationResult extends ClassificationResult {
    mlPredictions: Array<{,
        model: string;
        prediction: ClassificationLevel;
        confidence: number;
        features: Record<string, number>;
    }>;
    contextualFactors: Array<{,
        factor: string;
        impact: number;
        description: string;
    }>;
    riskScore: number;
    remediation: Array<{,
        action: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        automated: boolean;
    }>;
    workflowsTriggered: string[];
    reviewRequired: boolean;
    reviewReason?: string;
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
    classifyWithContext(data: DataElement, context: ClassificationContext): Promise<EnhancedClassificationResult>;
    /**
     * Real-time stream classification
     */
    classifyStream()
      dataStream: AsyncIterable<DataElement>,
      context: ClassificationContext,
    ): Promise<AsyncGenerator<EnhancedClassificationResult>>;
    private classifyStreamInternal;
    /**
     * Add or update ML model
     */
    addMLModel(model: MLClassificationModel): void;
    /**
     * Train ML model with new data
     */
    trainMLModel(modelId: string, trainingData: Array<{)
        data: DataElement;
        expectedClassification: ClassificationLevel;
        context?: ClassificationContext;
    }>): Promise<{
        accuracy: number;
        metrics: Record<string, number>;
    }>;
    /**
     * Add classification workflow
     */
    addWorkflow(workflow: ClassificationWorkflow): void;
    /**
     * Execute workflow manually
     */
    executeWorkflow()
      workflowId: string,
      result: EnhancedClassificationResult,
      context: ClassificationContext,
    ): Promise<void>;
    /**
     * Get classification analytics
     */
    getAnalytics(): ClassificationAnalytics;
    /**
     * Get data flow information
     */
    getDataFlows(): DataFlow[];
    /**
     * Get compliance report
     */
    generateComplianceReport(framework: ComplianceFramework, dateRange: {)
        start: Date;
        end: Date;
    }): {
        framework: ComplianceFramework;
        period: {,
            start: Date;
            end: Date;
        };
        totalClassifications: number;
        compliantClassifications: number;
        violations: Array<{,
            dataId: string;
            violation: string;
            severity: string;
            timestamp: Date;
        }>;
        recommendations: string[];
    };
    private applyMLModels;
    private analyzeContextualFactors;
    private calculateRiskScore;
    private getClassificationRisk;
    private shouldRequireReview;
    private getReviewReason;
    private generateRemediationActions;
    private triggerWorkflows;
    private evaluateTrigger;
    private evaluateWorkflowConditions;
    private getFieldValue;
    private getNestedValue;
    private evaluateCondition;
    private executeWorkflowAction;
    private executeNotifyAction;
    private executeEncryptAction;
    private executeQuarantineAction;
    private executeAuditLogAction;
    private executeEscalateAction;
    private executeAutoRemediateAction;
    private extractFeatures;
    private hashSource;
    private performTraining;
    private extractModelFeatures;
    private mapClearanceToNumber;
    private makePrediction;
    private updateAnalytics;
    private updateDataFlow;
    private initializeAnalytics;
    private initializeDefaultWorkflows;
    private initializeMLModels;
    private startAnalyticsCollection;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
export default AdvancedClassificationEngine;
//# sourceMappingURL=AdvancedClassificationEngine.d.ts.map