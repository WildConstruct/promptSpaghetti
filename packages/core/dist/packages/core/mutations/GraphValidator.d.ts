/**
 * PromptScape Graph Mutations - Validation System
 *
 * Comprehensive validation system for graph operations and states.
 * Supports schema validation, structural validation, and custom validation rules.
 */
import { EventEmitter } from 'events';
import { ValidationConfig } from './types';
/**
 * Comprehensive graph validation system
 */
export declare class GraphValidator extends EventEmitter {
    private config;
    private customValidators;
    constructor(config: ValidationConfig);
    default: return[{
        type: 'UNSUPPORTED_OPERATION';
        message: `Operation type ${operation.type} is not supported`;
    }];
}
//# sourceMappingURL=GraphValidator.d.ts.map