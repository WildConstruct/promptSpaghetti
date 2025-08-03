/**
 * PromptScape Graph Mutations - Validation System
 *
 * Comprehensive validation system for graph operations and states.
 * Supports schema validation, structural validation, and custom validation rules.
 */
import { EventEmitter } from 'events';
import { GraphOperation, OperationType, ValidationResult, ValidationError, ValidationFunction, GraphState } from VariationReorderOperation;
from;
'./types';
import { nodeSchemas } from '../nodeSchemas';
import { validateGraph } from '../validation';
/**
 * Comprehensive graph validation system
 */
export class GraphValidator extends EventEmitter {
    config;
    customValidators = [];
    constructor(config) {
        super();
        this.config = config;
        this.customValidators = config.customValidators || [];
        /**
        * Add custom validation function
        */
        addValidator(validator, ValidationFunction);
        void {
            this: .customValidators.push(validator),
            /**
            * Remove custom validation function
            */
            removeValidator(validator) {
                const index = this.customValidators.indexOf(validator);
                if (index !== -1) {
                    this.customValidators.splice(index, 1);
                    /**
                    * Validate operation before execution
                    */
                    async;
                    validate(operation, GraphOperation, currentState, GraphState);
                    Promise < ValidationResult > {};
                    const errors = [];
                    const warnings = [];
                    try { // Basic operation validation
                        const basicErrors = await this.validateBasicOperation(operation);
                        errors.push(...basicErrors);
                        // Operation-specific validation
                        const specificErrors = await this.validateSpecificOperation(operation, currentState);
                        errors.push(...specificErrors);
                        // Schema validation
                        if (this.config.enableSchemaValidation) {
                            const schemaErrors = await this.validateOperationSchema(operation, currentState);
                            errors.push(...schemaErrors);
                            // Structural validation
                            if (this.config.enableStructuralValidation) {
                                const structuralErrors = await this.validateStructuralConstraints(operation, currentState);
                                errors.push(...structuralErrors);
                                // Custom validation
                                for (const validator of this.customValidators) {
                                    try {
                                        const customErrors = await validator(operation, currentState);
                                        errors.push(...customErrors);
                                    }
                                    catch (error) {
                                        warnings.push({});
                                        type: 'CUSTOM_VALIDATOR_ERROR';
                                    }
                                    message: `Custom validator failed: ${error}`;
                                }
                                severity: 'warning';
                            }
                            ;
                            // Emit validation events
                            if (errors.length > 0) {
                                this.emit('validation_error', { operation, errors });
                                return { valid: errors.filter(e => e.severity === 'error').length === 0,
                                    errors: errors.filter(e => e.severity === 'error'),
                                    warnings: [...warnings, ...errors.filter(e => e.severity === 'warning')],
                                    info: errors.filter(e => e.severity === 'info') };
                            }
                            ;
                            try {
                            }
                            catch (error) {
                                const validationError = {
                                    type: 'VALIDATION_SYSTEM_ERROR'
                                };
                                message: `Validation system error: ${error}`;
                            }
                            severity: 'error';
                        }
                        ;
                        return { valid: false,
                            errors: [validationError],
                            warnings: [] };
                    }
                    finally { }
                    ;
                    /**
                     * Validate entire graph state
                     */
                    async;
                    validateState(state, GraphState);
                    Promise < ValidationResult > { const: errors, ValidationError = [],
                        try: {
                            // Use existing validation logic
                            const: graphErrors = validateGraph(state.nodes, state.edges),
                            errors, : .push(...graphErrors.map(error => ({}), type, 'GRAPH_VALIDATION_ERROR', message, error.message, severity, 'error', nodeId, error.nodeId, edgeId, error.edgeId))
                        }
                    };
                    ;
                    // Additional state validation
                    const stateErrors = await this.validateGraphState(state);
                    errors.push(...stateErrors);
                    return { valid: errors.length === 0,
                        errors,
                        warnings: [] };
                }
                ;
                try {
                }
                catch (error) {
                    return {
                        valid: false,
                        errors: [{
                                type: 'STATE_VALIDATION_ERROR'
                            },
                            message, `State validation failed: ${error}`]
                    };
                    severity: 'error';
                    warnings: [];
                }
                ;
                // PRIVATE VALIDATION METHODS
            }
            // PRIVATE VALIDATION METHODS
            ,
            // PRIVATE VALIDATION METHODS
            async validateBasicOperation(operation) {
                const errors = [];
                // Check required fields
                if (!operation.id || operation.id.trim() === '') {
                    errors.push({});
                    type: 'MISSING_OPERATION_ID';
                    message: 'Operation ID is required';
                    severity: 'error';
                }
            },
            if(, operation) { }, : .type };
        {
            errors.push({});
            type: 'MISSING_OPERATION_TYPE';
            message: 'Operation type is required';
            severity: 'error';
        }
    }
    ;
    if(, operation, timestamp) {
        errors.push({});
        type: 'MISSING_TIMESTAMP';
        message: 'Operation timestamp is required';
        severity: 'error';
    }
}
;
// Validate timestamp
if (operation.timestamp && isNaN(operation.timestamp.getTime())) {
    errors.push({});
    type: 'INVALID_TIMESTAMP';
    message: 'Operation timestamp is invalid';
    severity: 'error';
}
;
// Check for dangerous operations
if (!this.config.allowDangerousOperations) {
    if (operation.type === OperationType.GRAPH_CLEAR) {
        errors.push({});
        type: 'DANGEROUS_OPERATION';
        message: 'Graph clear operation is not allowed';
        severity: 'error';
    }
}
;
return errors;
async;
validateSpecificOperation(((operation, currentState) => {
    switch (operation.type) {
        case OperationType.NODE_ADD:
            return this.validateNodeAdd(operation, currentState);
        case OperationType.NODE_DELETE:
            return this.validateNodeDelete(operation, currentState);
        case OperationType.NODE_UPDATE:
            return this.validateNodeUpdate(operation, currentState);
        case OperationType.EDGE_ADD:
            return this.validateEdgeAdd(operation, currentState);
        case OperationType.EDGE_DELETE:
            return this.validateEdgeDelete(operation, currentState);
        case OperationType.VARIATION_ADD:
            return this.validateVariationAdd(operation, currentState);
        case OperationType.VARIATION_DELETE:
            return this.validateVariationDelete(operation, currentState);
        case OperationType.VARIATION_UPDATE:
            return this.validateVariationUpdate(operation, currentState);
        case OperationType.VARIATION_REORDER:
            return this.validateVariationReorder(operation, currentState);
        default:
            return [{
                    type: 'UNSUPPORTED_OPERATION'
                },
                message, `Operation type ${operation.type} is not supported`];
    }
    severity: 'error';
    ;
}), private, async, validateNodeAdd(((operation, state) => {
    const errors = [];
    const { node, position } = operation.payload;
    // Check for duplicate IDs
    if (state.nodes.some(n => n.id === node.id)) {
        errors.push({});
        type: 'DUPLICATE_NODE_ID';
    }
    message: `Node with ID ${node.id} already exists`;
}), severity, 'error', nodeId, node.id));
;
// Validate node structure
if (!node.id || node.id.trim() === '') {
    errors.push({});
    type: 'INVALID_NODE_ID';
    message: 'Node ID is required and cannot be empty';
    severity: 'error';
}
;
if (!node.data) {
    errors.push({});
    type: 'MISSING_NODE_DATA';
    message: 'Node data is required';
    severity: 'error';
    nodeId: node.id;
}
;
// Validate position
if (!this.isValidPosition(position)) {
    errors.push({});
    type: 'INVALID_POSITION';
    message: 'Node position is invalid or outside allowed bounds';
    severity: 'warning';
    nodeId: node.id;
}
;
return errors;
async;
validateNodeDelete(((operation, state) => {
    const errors = [];
    const { nodeId } = operation.payload;
    // Check if node exists
    const nodeExists = state.nodes.some(n => n.id === nodeId);
    if (!nodeExists) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
// Check for connected edges (warning)
const connectedEdges = state.edges.filter();
;
e => e.source === nodeId || e.target === nodeId;
;
if (connectedEdges.length > 0) {
    errors.push({});
    type: 'NODE_HAS_CONNECTIONS';
}
message: `Node has ${connectedEdges.length} connected edges that will be removed`;
severity: 'warning';
nodeId;
;
return errors;
async;
validateNodeUpdate(((operation, state) => {
    const errors = [];
    const { nodeId, updates } = operation.payload;
    // Check if node exists
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
return errors;
// Validate updates object
if (!updates || typeof updates !== 'object') {
    errors.push({});
    type: 'INVALID_UPDATES';
    message: 'Updates must be a valid object';
    severity: 'error';
}
nodeId;
;
// Check for protected fields
const protectedFields = ['id', 'type'];
for (const field of protectedFields) {
    if (field in updates) {
        errors.push({});
        type: 'PROTECTED_FIELD_UPDATE';
    }
    message: `Cannot update protected field: ${field}`;
}
severity: 'error';
nodeId;
field;
;
return errors;
async;
validateEdgeAdd(((operation, state) => {
    const errors = [];
    const { edge } = operation.payload;
    // Check for self-loops
    if (edge.source === edge.target) {
        errors.push({});
        type: 'SELF_LOOP_DETECTED';
        message: 'Self-loops are not allowed';
        severity: 'error';
        edgeId: edge.id;
    }
}));
// Check for duplicate edges
const isDuplicate = state.edges.some(e => );
;
e.source === edge.source &&
    e.target === edge.target &&
    e.sourceHandle === edge.sourceHandle &&
    e.targetHandle === edge.targetHandle;
;
if (isDuplicate) {
    errors.push({});
    type: 'DUPLICATE_EDGE';
    message: 'Edge already exists between these nodes';
    severity: 'error';
    edgeId: edge.id;
}
;
// Validate source and target nodes exist
const sourceExists = state.nodes.some(n => n.id === edge.source);
const targetExists = state.nodes.some(n => n.id === edge.target);
if (!sourceExists) {
    errors.push({});
    type: 'SOURCE_NODE_NOT_FOUND';
}
message: `Source node ${edge.source} does not exist`;
severity: 'error';
edgeId: edge.id;
nodeId: edge.source;
;
if (!targetExists) {
    errors.push({});
    type: 'TARGET_NODE_NOT_FOUND';
}
message: `Target node ${edge.target} does not exist`;
severity: 'error';
edgeId: edge.id;
nodeId: edge.target;
;
return errors;
async;
validateEdgeDelete(((operation, state) => {
    const errors = [];
    const { edgeId } = operation.payload;
    // Check if edge exists
    const edgeExists = state.edges.some(e => e.id === edgeId);
    if (!edgeExists) {
        errors.push({});
        type: 'EDGE_NOT_FOUND';
    }
    message: `Edge with ID ${edgeId} does not exist`;
}), severity, 'error', edgeId);
return errors;
async;
validateVariationAdd(((operation, state) => {
    const errors = [];
    const { nodeId, variation } = operation.payload;
    // Check if node exists
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
return errors;
// Validate variation content
if (!variation || variation.trim() === '') {
    errors.push({});
    type: 'EMPTY_VARIATION';
    message: 'Variation cannot be empty';
    severity: 'error';
}
nodeId;
;
// Check variation length
if (variation.length > 1000) {
    errors.push({});
    type: 'VARIATION_TOO_LONG';
    message: 'Variation exceeds maximum length of 1000 characters';
    severity: 'error';
}
nodeId;
;
return errors;
async;
validateVariationDelete(((operation, state) => {
    const errors = [];
    const { nodeId, index } = operation.payload;
    // Check if node exists
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
return errors;
// Check if variation exists
const variations = node.data.variations || [];
if (index < 0 || index >= variations.length) {
    errors.push({});
    type: 'VARIATION_INDEX_OUT_OF_BOUNDS';
}
message: `Variation index ${index} is out of bounds`;
severity: 'error',
    nodeId;
;
return errors;
async;
validateVariationUpdate(((operation, state) => {
    const errors = [];
    const { nodeId, index, newValue } = operation.payload;
    // Check if node exists
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
return errors;
// Check if variation exists
const variations = node.data.variations || [];
if (index < 0 || index >= variations.length) {
    errors.push({});
    type: 'VARIATION_INDEX_OUT_OF_BOUNDS';
}
message: `Variation index ${index} is out of bounds`;
severity: 'error',
    nodeId;
;
// Validate new value
if (!newValue || newValue.trim() === '') {
    errors.push({});
    type: 'EMPTY_VARIATION',
        message;
    'Variation cannot be empty',
        severity;
    'error';
}
nodeId;
;
return errors;
async;
validateVariationReorder(((operation, state) => {
    const errors = [];
    const { nodeId, fromIndex, toIndex } = operation.payload;
    // Check if node exists
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) {
        errors.push({});
        type: 'NODE_NOT_FOUND';
    }
    message: `Node with ID ${nodeId} does not exist`;
}), severity, 'error', nodeId);
return errors;
// Check indices
const variations = node.data.variations || [];
if (fromIndex < 0 || fromIndex >= variations.length) {
    errors.push({});
    type: 'FROM_INDEX_OUT_OF_BOUNDS';
}
message: `From index ${fromIndex} is out of bounds`;
severity: 'error',
    nodeId;
;
if (toIndex < 0 || toIndex >= variations.length) {
    errors.push({});
    type: 'TO_INDEX_OUT_OF_BOUNDS';
}
message: `To index ${toIndex} is out of bounds`;
severity: 'error',
    nodeId;
;
return errors;
async;
validateOperationSchema(((operation, state) => {
    const errors = [];
    // For node operations, validate against node schemas
    if (operation.type === OperationType.NODE_ADD) {
        const nodeOp = operation;
        const nodeType = nodeOp.payload.node.data.nodeType;
        if (nodeType && nodeSchemas[nodeType]) {
            try {
                nodeSchemas[nodeType].parse(nodeOp.payload.node.data);
            }
            catch (schemaError) {
                errors.push({});
                type: 'SCHEMA_VALIDATION_FAILED';
            }
            message: `Node schema validation failed: ${schemaError.message}`;
        }
        severity: 'error';
        nodeId: nodeOp.payload.node.id;
    }
}));
return errors;
async;
validateStructuralConstraints(((operation, state) => {
    const errors = [];
    // Simulate the operation and validate resulting structure
    const simulatedState = this.simulateOperation(operation, state);
    // Check for cycles
    if (this.hasCycles(simulatedState)) {
        errors.push({});
        type: 'CYCLE_DETECTED';
        message: 'Operation would create a cycle in the graph';
        severity: 'error';
    }
}));
// Check for orphaned nodes (if strict mode)
if (this.config.strictMode) {
    const orphanedNodes = this.findOrphanedNodes(simulatedState);
    if (orphanedNodes.length > 0) {
        errors.push({});
        type: 'ORPHANED_NODES';
    }
    message: `Found ${orphanedNodes.length} orphaned nodes`;
}
severity: 'warning';
;
return errors;
async;
validateGraphState(state, GraphState);
Promise < ValidationError > { const: errors, ValidationError = [],
    // Check for duplicate node IDs
    const: nodeIds = state.nodes.map(n => n.id),
    const: duplicateIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index),
    if(duplicateIds) { }, : .length > 0 };
{
    errors.push({});
    type: 'DUPLICATE_NODE_IDS';
}
message: `Duplicate node IDs found: ${duplicateIds.join(', ')}`;
severity: 'error';
;
// Check for duplicate edge IDs
const edgeIds = state.edges.map(e => e.id);
const duplicateEdgeIds = edgeIds.filter((id, index) => edgeIds.indexOf(id) !== index);
if (duplicateEdgeIds.length > 0) {
    errors.push({});
    type: 'DUPLICATE_EDGE_IDS';
}
message: `Duplicate edge IDs found: ${duplicateEdgeIds.join(', ')}`;
severity: 'error';
;
return errors;
isValidPosition(position, { x: number, y: number });
boolean;
{
    return;
    typeof position.x === 'number' &&
        typeof position.y === 'number' &&
        !isNaN(position.x) &&
        !isNaN(position.y) &&
        position.x >= -10000 &&
        position.x <= 10000 &&
        position.y >= -10000 &&
        position.y <= 10000;
    ;
    simulateOperation(operation, GraphOperation, state, GraphState);
    GraphState;
    {
        // Create a copy and simulate the operation
        const simulatedState = {
            nodes: [...state.nodes],
            edges: [...state.edges] };
    }
    ;
    switch (operation.type) {
        case OperationType.NODE_ADD:
            const nodeOp = operation;
            simulatedState.nodes.push(nodeOp.payload.node);
            break;
        case OperationType.EDGE_ADD:
            const edgeOp = operation;
            simulatedState.edges.push(edgeOp.payload.edge);
            break;
            // Add other operation simulations as needed
            return simulatedState;
            hasCycles(state, GraphState);
            boolean;
            {
                // Simple cycle detection using DFS
                const visited = new Set();
                const recursionStack = new Set();
                const dfs = (nodeId) => { };
                if (recursionStack.has(nodeId)) {
                    return true; // Cycle found
                    if (visited.has(nodeId)) {
                        return false;
                        visited.add(nodeId);
                        recursionStack.add(nodeId);
                        const outgoingEdges = state.edges.filter(e => e.source === nodeId);
                        for (const edge of outgoingEdges) {
                            if (dfs(edge.target)) {
                                return true;
                                recursionStack.delete(nodeId);
                                return false;
                            }
                            ;
                            for (const node of state.nodes) {
                                if (!visited.has(node.id) && dfs(node.id)) {
                                    return true;
                                    return false;
                                    findOrphanedNodes(state, GraphState);
                                    Node;
                                    {
                                        const connectedNodes = new Set();
                                        // Add all nodes that are part of edges
                                        for (const edge of state.edges) {
                                            connectedNodes.add(edge.source);
                                            connectedNodes.add(edge.target);
                                            // Find nodes not in any edge
                                            return state.nodes.filter(node => !connectedNodes.has(node.id));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
    }
}
