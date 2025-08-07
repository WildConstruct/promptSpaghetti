/**
 * Epic 1 Execution Context
 * Manages deterministic execution state including seeded PRNG and variables
 */
import seedrandom from 'seedrandom';
/**
 * Epic 1 Execution Context
 * Provides deterministic random number generation and variable management
 */
export class Epic1ExecutionContext {
    seed;
    prng;
    variables;
    nodeSeeds;
    stats;
    depth = 0;
    maxDepth = 100;
    constructor(seed = Date.now()) {
        this.seed = String(seed);
        this.prng = seedrandom(this.seed);
        this.variables = new Map();
        this.nodeSeeds = new Map();
        this.stats = {
            startTime: Date.now(),
            nodesExecuted: 0,
            errors: [],
            warnings: []
        };
    }
    /**
     * Get the main seed used for this execution
     */
    getSeed() {
        return this.seed;
    }
    /**
     * Generate a deterministic seed for a specific node
     * This ensures each node gets its own predictable seed based on the main seed
     */
    getNodeSeed(nodeId) {
        if (!this.nodeSeeds.has(nodeId)) {
            // Create a node-specific seed by combining main seed with node ID
            const nodeSeed = `${this.seed}-${nodeId}`;
            this.nodeSeeds.set(nodeId, nodeSeed);
        }
        return this.nodeSeeds.get(nodeId);
    }
    /**
     * Get a seeded PRNG for a specific node
     */
    getNodePRNG(nodeId) {
        const nodeSeed = this.getNodeSeed(nodeId);
        return seedrandom(nodeSeed);
    }
    /**
     * Get a random number between 0 and 1 using the main PRNG
     */
    random() {
        return this.prng();
    }
    /**
     * Set a variable value
     */
    setVariable(name, value) {
        // Validate variable name
        if (!this.isValidVariableName(name)) {
            throw new Error(`Invalid variable name: ${name}`);
        }
        // Deep clone objects and arrays to prevent mutation
        const clonedValue = this.cloneValue(value);
        this.variables.set(name, clonedValue);
    }
    /**
     * Get a variable value
     */
    getVariable(name) {
        return this.variables.get(name);
    }
    /**
     * Check if a variable exists
     */
    hasVariable(name) {
        return this.variables.has(name);
    }
    /**
     * Get all variables (read-only copy)
     */
    getAllVariables() {
        const result = {};
        this.variables.forEach((value, key) => {
            result[key] = this.cloneValue(value);
        });
        return result;
    }
    /**
     * Clear all variables
     */
    clearVariables() {
        this.variables.clear();
    }
    /**
     * Substitute variables in a text string
     * Replaces {{variableName}} with the variable value
     */
    substituteVariables(text) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const value = this.getVariable(varName);
            if (value === undefined) {
                this.addWarning('unknown', `Unknown variable: ${varName}`);
                return match; // Keep original if variable not found
            }
            // Convert value to string representation
            if (typeof value === 'object') {
                try {
                    return JSON.stringify(value);
                }
                catch {
                    return '[Object]';
                }
            }
            return String(value);
        });
    }
    /**
     * Increment execution depth (for cycle detection)
     */
    incrementDepth() {
        this.depth++;
        if (this.depth > this.maxDepth) {
            throw new Error(`Maximum execution depth (${this.maxDepth}) exceeded`);
        }
    }
    /**
     * Decrement execution depth
     */
    decrementDepth() {
        this.depth = Math.max(0, this.depth - 1);
    }
    /**
     * Get current execution depth
     */
    getDepth() {
        return this.depth;
    }
    /**
     * Record that a node was executed
     */
    recordNodeExecution(nodeId) {
        this.stats.nodesExecuted++;
    }
    /**
     * Add an error to the execution stats
     */
    addError(nodeId, error) {
        this.stats.errors.push({ nodeId, error });
    }
    /**
     * Add a warning to the execution stats
     */
    addWarning(nodeId, message) {
        this.stats.warnings.push({ nodeId, message });
    }
    /**
     * Finalize execution and return stats
     */
    finalize() {
        this.stats.endTime = Date.now();
        return { ...this.stats };
    }
    /**
     * Get execution duration in milliseconds
     */
    getDuration() {
        const endTime = this.stats.endTime || Date.now();
        return endTime - this.stats.startTime;
    }
    /**
     * Clone the context for isolated execution
     * Useful for preview or testing
     */
    clone() {
        const cloned = new Epic1ExecutionContext(this.seed);
        // Copy variables
        this.variables.forEach((value, key) => {
            cloned.variables.set(key, this.cloneValue(value));
        });
        // Copy node seeds
        this.nodeSeeds.forEach((seed, nodeId) => {
            cloned.nodeSeeds.set(nodeId, seed);
        });
        return cloned;
    }
    /**
     * Validate variable name
     */
    isValidVariableName(name) {
        // Must be alphanumeric + underscore, start with letter or underscore
        // Max 64 characters (as per validation.ts)
        const pattern = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
        return pattern.test(name);
    }
    /**
     * Deep clone a value to prevent mutation
     */
    cloneValue(value) {
        if (value === null || value === undefined) {
            return value;
        }
        const type = typeof value;
        // Primitives are immutable
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return value;
        }
        // Clone arrays and objects
        try {
            return JSON.parse(JSON.stringify(value));
        }
        catch {
            // If JSON serialization fails, return the original
            // This shouldn't happen with valid variable values
            return value;
        }
    }
}
