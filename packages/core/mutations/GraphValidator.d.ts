/**
 * PromptScape Graph Mutations - Validation System
 *
 * Comprehensive validation system for graph operations and states.
 * Supports schema validation, structural validation, and custom validation rules.
 */
import { EventEmitter } from 'events';
import { GraphOperation, ValidationResult, ValidationConfig, ValidationFunction, GraphState } from './types';
/**
 * Comprehensive graph validation system
 */
export declare class GraphValidator extends EventEmitter {
    private config;
    private customValidators;
    constructor(config: ValidationConfig);
    /**
     * Add custom validation function
     */
    addValidator(validator: ValidationFunction): void;
    /**
     * Remove custom validation function
     */
    removeValidator(validator: ValidationFunction): void;
    /**
     * Validate operation before execution
     */
    validate(operation: GraphOperation, currentState: GraphState): Promise<ValidationResult>;
    /**
     * Validate entire graph state
     */
    validateState(state: GraphState): Promise<ValidationResult>;
    private validateBasicOperation;
    private validateSpecificOperation;
    private validateNodeAdd;
    private validateNodeDelete;
    private validateNodeUpdate;
    private validateEdgeAdd;
    private validateEdgeDelete;
    private validateVariationAdd;
    private validateVariationDelete;
    private validateVariationUpdate;
    private validateVariationReorder;
    private validateOperationSchema;
    private validateStructuralConstraints;
    private validateGraphState;
    private isValidPosition;
    private simulateOperation;
    private hasCycles;
    private findOrphanedNodes;

//# sourceMappingURL=GraphValidator.d.ts.map