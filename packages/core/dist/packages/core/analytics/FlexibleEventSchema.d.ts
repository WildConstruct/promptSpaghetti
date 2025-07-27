/**
 * Flexible Event Schema System - Story 30.2 Task 3
 *
 * Dynamic schema system for conversion events with runtime validation,
 * property transformation, and extensible field definitions.
 *
 * Features:
 * - Runtime schema validation and transformation
 * - Extensible property definitions with custom types
 * - Schema versioning and migration support
 * - Property relationships and dependencies
 * - Performance-optimized validation pipeline
 */
import { FlexibleConversionEvent, PropertySchema, PropertyType, ValidationError, ValidationWarning, ConditionLogic } from './ConversionDataModel';
export interface EventSchemaDefinition {
    id: string;
    name: string;
    version: string;
    description: string;
    metadata: {
        createdAt: number;
        updatedAt: number;
        createdBy: string;
        tags: string[];
        isActive: boolean;
        deprecated?: boolean;
    };
    baseRequirements: {
        requiredFields: string[];
        optionalFields: string[];
        forbiddenFields: string[];
    };
    properties: Map<string, PropertySchemaDefinition>;
    globalConstraints: GlobalConstraint[];
    transformations: SchemaTransformation[];
    validation: {
        strictMode: boolean;
        allowUnknownProperties: boolean;
        validatePropertyTypes: boolean;
        enforceConstraints: boolean;
        customValidators: CustomValidator[];
    };
    inheritance?: {
        parentSchema: string;
        overrides: PropertyOverride[];
        extensions: PropertyExtension[];
    };
    performance: {
        cacheValidationResults: boolean;
        enableLazyValidation: boolean;
        batchValidation: boolean;
        maxValidationTime: number;
    };
}
export interface PropertySchemaDefinition extends Omit<PropertySchema, 'relationships'> {
    id: string;
    name: string;
    description: string;
    typeInfo: {
        baseType: PropertyType;
        subType?: string;
        format?: string;
        encoding?: string;
        precision?: number;
    };
    validation: {
        enabled: boolean;
        level: 'strict' | 'lenient' | 'permissive';
        customRules: ValidationRule[];
        performance: {
            timeout: number;
            priority: 'high' | 'medium' | 'low';
        };
    };
    transformationPipeline: PropertyTransformationStep[];
    relationships: PropertyRelationshipDefinition[];
    metadata: {
        businessContext: string;
        dataSource: string;
        updateFrequency: string;
        qualityMetrics?: PropertyQualityMetrics;
        examples: PropertyExample[];
    };
}
export interface PropertyTransformationStep {
    id: string;
    name: string;
    type: 'normalize' | 'validate' | 'enrich' | 'sanitize' | 'encrypt' | 'custom';
    order: number;
    enabled: boolean;
    config: {
        operation: string;
        parameters: Record<string, unknown>;
        conditions?: ConditionLogic;
        errorHandling: 'skip' | 'warn' | 'fail' | 'default';
    };
    performance: {
        timeout: number;
        retries: number;
        cacheable: boolean;
    };
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    rule: {
        type: 'format' | 'range' | 'pattern' | 'custom' | 'cross_field' | 'temporal';
        condition: ConditionLogic;
        errorMessage: string;
        warningMessage?: string;
    };
    execution: {
        priority: number;
        dependencies: string[];
        asyncValidation: boolean;
        cacheResults: boolean;
    };
    errorHandling: {
        severity: 'critical' | 'major' | 'minor';
        action: 'block' | 'warn' | 'log';
        suggestedFix?: string;
    };
}
export interface PropertyRelationshipDefinition {
    id: string;
    type: 'depends_on' | 'conflicts_with' | 'derives_from' | 'validates_against';
    targetProperty: string;
    relationship: RelationshipSpec;
    strength: number;
    bidirectional: boolean;
}
export interface RelationshipSpec {
    condition: ConditionLogic;
    transformation?: string;
    validation?: string;
    metadata: {
        description: string;
        businessReason: string;
        examples: string[];
    };
}
export interface GlobalConstraint {
    id: string;
    name: string;
    description: string;
    constraint: ConditionLogic;
    severity: 'error' | 'warning';
    applicableEvents: string[];
}
export interface SchemaTransformation {
    id: string;
    name: string;
    description: string;
    stage: 'pre_validation' | 'post_validation' | 'pre_storage' | 'post_retrieval';
    transformation: TransformationDefinition;
    conditions?: ConditionLogic;
}
export interface TransformationDefinition {
    type: 'property_mapping' | 'data_enrichment' | 'format_conversion' | 'aggregation' | 'custom';
    config: Record<string, unknown>;
    inputFields: string[];
    outputFields: string[];
    preserveOriginal: boolean;
}
export interface CustomValidator {
    id: string;
    name: string;
    description: string;
    validator: {
        functionBody: string;
        parameters: ValidatorParameter[];
        returnType: 'boolean' | 'ValidationResult' | 'Promise<ValidationResult>';
    };
    execution: {
        timeout: number;
        sandboxed: boolean;
        allowedAPIs: string[];
        memoryLimit: number;
    };
    tests: ValidatorTest[];
}
export interface ValidatorParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: unknown;
}
export interface ValidatorTest {
    name: string;
    input: unknown;
    expectedOutput: unknown;
    description: string;
}
export interface PropertyOverride {
    propertyId: string;
    changes: Partial<PropertySchemaDefinition>;
    reason: string;
}
export interface PropertyExtension {
    propertyId: string;
    newProperty: PropertySchemaDefinition;
    reason: string;
}
export interface PropertyQualityMetrics {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    lastAssessed: number;
}
export interface PropertyExample {
    description: string;
    validExample: unknown;
    invalidExample?: unknown;
    explanation: string;
}
export interface SchemaValidationResult {
    isValid: boolean;
    overallScore: number;
    fieldResults: Map<string, FieldValidationResult>;
    globalConstraintResults: GlobalConstraintResult[];
    transformationResults: TransformationResult[];
    performance: {
        totalTime: number;
        validationTime: number;
        transformationTime: number;
        cacheHitRate: number;
    };
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata: {
        schemaVersion: string;
        validationTimestamp: number;
        validatorVersion: string;
        processingPipeline: string[];
    };
}
export interface FieldValidationResult {
    fieldName: string;
    isValid: boolean;
    score: number;
    ruleResults: RuleValidationResult[];
    originalValue: unknown;
    transformedValue: unknown;
    transformationApplied: boolean;
    relationshipResults: RelationshipValidationResult[];
    validationTime: number;
    cacheUsed: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface RuleValidationResult {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    score: number;
    executionTime: number;
    message?: string;
    details?: Record<string, unknown>;
}
export interface RelationshipValidationResult {
    relationshipId: string;
    relatedField: string;
    relationshipType: string;
    isValid: boolean;
    confidence: number;
    message?: string;
}
export interface GlobalConstraintResult {
    constraintId: string;
    constraintName: string;
    satisfied: boolean;
    score: number;
    affectedFields: string[];
    message?: string;
}
export interface TransformationResult {
    transformationId: string;
    transformationName: string;
    executed: boolean;
    success: boolean;
    inputFields: string[];
    outputFields: string[];
    performance: {
        executionTime: number;
        memoryUsed: number;
    };
    error?: string;
}
/**
 * Flexible Event Schema Manager
 * Manages schema definitions, validation, and transformations
 */
export declare class FlexibleEventSchemaManager {
    private schemas;
    private validationCache;
    private transformationCache;
    private readonly CACHE_TTL;
    private readonly MAX_VALIDATION_TIME;
    private readonly MAX_CACHE_SIZE;
    constructor();
    /**
     * Register a new event schema
     */
    registerSchema(schema: EventSchemaDefinition): void;
    /**
     * Validate event against schema
     */
    validateEvent(event: FlexibleConversionEvent, schemaId: string, options?: ValidationOptions): Promise<SchemaValidationResult>;
    /**
     * Transform event according to schema
     */
    transformEvent(event: FlexibleConversionEvent, schemaId: string, stage?: 'pre_validation' | 'post_validation' | 'pre_storage' | 'post_retrieval'): Promise<FlexibleConversionEvent>;
    /**
     * Get schema by ID
     */
    getSchema(schemaId: string): EventSchemaDefinition | null;
    /**
     * List all available schemas
     */
    listSchemas(): EventSchemaDefinition[];
    /**
     * Update existing schema
     */
    updateSchema(schemaId: string, updates: Partial<EventSchemaDefinition>): void;
    /**
     * Create schema from template
     */
    createSchemaFromTemplate(templateName: string, schemaId: string, customizations?: Partial<EventSchemaDefinition>): EventSchemaDefinition;
    private performValidation;
    private validateBaseRequirements;
    private validateProperties;
    private validateProperty;
    private validatePropertyType;
    private validatePropertyConstraints;
    private validateCustomRules;
    private validateGlobalConstraints;
    private validateRelationships;
    private getPropertyType;
    private isTypeCompatible;
    private validateConstraint;
    private validateFormat;
    private executeCustomConstraint;
    private executeCustomRule;
    private evaluateCondition;
    private evaluateGlobalConstraint;
    private validateRelationship;
    private calculateOverallScore;
    private generateConstraintFix;
    private hasField;
    private generateCacheKey;
    private hashObject;
    private cacheValidationResult;
    private clearCacheForSchema;
    private validateSchemaDefinition;
    private getSchemaTemplate;
    private shouldApplyTransformation;
    private applyTransformation;
    private transformProperty;
    private applyTransformationStep;
    private initializeDefaultSchemas;
    private createMarketplaceEventSchema;
    private createConversionEventSchema;
    private createUserBehaviorSchema;
}
export interface ValidationOptions {
    useCache?: boolean;
    strictMode?: boolean;
    validateRelationships?: boolean;
    maxValidationTime?: number;
    customContext?: Record<string, unknown>;
}
export default FlexibleEventSchemaManager;
//# sourceMappingURL=FlexibleEventSchema.d.ts.map