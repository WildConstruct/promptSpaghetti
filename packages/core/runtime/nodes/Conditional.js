"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalBuilder = exports.ConditionPresets = exports.ConditionalNode = void 0;
exports.createConditionalNode = createConditionalNode;
exports.conditional = conditional;
const advanced_1 = require("../advanced");
const io_system_1 = require("../io-system");
class ConditionalNode extends advanced_1.AdvancedRuntimeNode {
    constructor(id, branches = [], defaultOutput = '', config = {}) {
        const nodeConfig = {
            deterministic: true,
            cacheable: false,
            stateful: false,
            performanceHints: {
                expectedExecutionTime: 'fast',
                memoryUsage: 'low'
            }
        };
        super(id, nodeConfig);
        this.branches = branches;
        this.defaultOutput = defaultOutput;
        this.conditionalConfig = {
            allowVariableAccess: true,
            strictMode: false,
            customFunctions: {},
            ...config
        };
        const ioSpec = new io_system_1.IOSpecBuilder()
            .addInput({
            id: 'conditions',
            label: 'Condition Expressions',
            dataType: 'array',
            required: false,
            defaultValue: [],
            description: 'Array of condition expressions to evaluate'
        })
            .addInput({
            id: 'outputs',
            label: 'Condition Outputs',
            dataType: 'stringArray',
            required: false,
            defaultValue: [],
            description: 'Array of outputs corresponding to conditions'
        })
            .addInput({
            id: 'default',
            label: 'Default Output',
            dataType: 'string',
            required: false,
            defaultValue: '',
            description: 'Default output when no conditions match'
        })
            .addTextOutput('result', 'Conditional Result')
            .build();
        this.ioHandler = new io_system_1.AdvancedIOHandler(ioSpec);
    }
    run(ctx) {
        ctx.executionMeta.nodeExecutionOrder.push(this.id);
        return this.measureExecution(ctx, 'conditional-evaluation', () => {
            const effectiveBranches = this.getEffectiveBranches(ctx);
            for (const branch of effectiveBranches) {
                try {
                    const conditionResult = this.evaluateCondition(branch.condition, ctx);
                    if (conditionResult) {
                        return branch.output;
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    if (errorMessage.includes('Dangerous pattern detected')) {
                        throw error;
                    }
                    if (this.conditionalConfig.strictMode) {
                        throw new Error(`Condition evaluation failed: ${branch.condition} - ${error}`);
                    }
                }
            }
            return this.defaultOutput;
        });
    }
    validate() {
        const errors = [];
        const warnings = [];
        if (this.branches.length === 0) {
            warnings.push('No conditional branches configured - will always return default output');
        }
        this.branches.forEach((branch, index) => {
            if (!branch.condition || branch.condition.trim() === '') {
                errors.push(`Branch ${index} has empty condition`);
            }
            if (branch.output === undefined || branch.output === null) {
                warnings.push(`Branch ${index} has undefined output`);
            }
            const condition = branch.condition.trim();
            if (condition.includes('==')) {
                warnings.push(`Branch ${index}: Consider using '===' instead of '==' for strict equality`);
            }
            if (condition.includes('eval(') || condition.includes('Function(')) {
                errors.push(`Branch ${index}: Dangerous expression detected - eval/Function not allowed`);
            }
        });
        if (this.defaultOutput === undefined || this.defaultOutput === null) {
            warnings.push('Default output is undefined - consider providing a fallback value');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    serialize() {
        return {
            id: this.id,
            type: 'Conditional',
            config: this.getConfig(),
            data: {
                branches: this.branches,
                defaultOutput: this.defaultOutput,
                conditionalConfig: this.conditionalConfig
            },
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    getEffectiveBranches(ctx) {
        return this.branches;
    }
    evaluateCondition(expression, ctx) {
        try {
            const evalContext = this.createEvaluationContext(ctx);
            const result = this.safeEvaluate(expression, evalContext);
            return Boolean(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Dangerous pattern detected') || errorMessage.includes('Expression evaluation failed')) {
                throw error;
            }
            if (this.conditionalConfig.strictMode) {
                throw error;
            }
            return false;
        }
    }
    createEvaluationContext(ctx) {
        const evalContext = {};
        if (this.conditionalConfig.allowVariableAccess) {
            Object.assign(evalContext, ctx.variables);
            evalContext.hasVariable = (name) => name in ctx.variables;
            evalContext.getVariable = (name, defaultValue) => ctx.variables[name] !== undefined ? ctx.variables[name] : defaultValue;
        }
        Object.assign(evalContext, this.conditionalConfig.customFunctions);
        evalContext.getType = (value) => typeof value;
        const lengthFn = (value) => value?.length ?? 0;
        evalContext.len = lengthFn;
        evalContext.length = lengthFn;
        evalContext.isEmpty = (value) => !value || value.length === 0;
        evalContext.includes = (value, item) => {
            if (typeof value === 'string') {
                return String(value).includes(String(item));
            }
            else if (Array.isArray(value)) {
                return value.includes(item);
            }
            return false;
        };
        evalContext.startsWith = (str, prefix) => String(str).startsWith(String(prefix));
        evalContext.endsWith = (str, suffix) => String(str).endsWith(String(suffix));
        evalContext.matches = (str, pattern) => new RegExp(pattern).test(String(str));
        return evalContext;
    }
    safeEvaluate(expression, context) {
        const sanitizedExpression = this.sanitizeExpression(expression);
        const paramNames = Object.keys(context);
        const paramValues = paramNames.map(name => context[name]);
        try {
            const func = new Function(...paramNames, `return (${sanitizedExpression});`);
            return func(...paramValues);
        }
        catch (error) {
            throw new Error(`Expression evaluation failed: ${expression} - ${error}`);
        }
    }
    sanitizeExpression(expression) {
        const dangerous = [
            /eval\s*\(/gi,
            /Function\s*\(/gi,
            /constructor/gi,
            /prototype/gi,
            /__proto__/gi,
            /import\s*\(/gi,
            /require\s*\(/gi,
            /process\./gi,
            /global\./gi,
            /window\./gi,
            /document\./gi
        ];
        let sanitized = expression;
        for (const pattern of dangerous) {
            if (pattern.test(sanitized)) {
                throw new Error(`Dangerous pattern detected in expression: ${expression}`);
            }
        }
        return sanitized;
    }
}
exports.ConditionalNode = ConditionalNode;
function createConditionalNode(id, branches, defaultOutput, config) {
    return new ConditionalNode(id, branches, defaultOutput, config);
}
exports.ConditionPresets = {
    greaterThan: (variable, value) => `${variable} > ${value}`,
    lessThan: (variable, value) => `${variable} < ${value}`,
    equals: (variable, value) => `${variable} === ${JSON.stringify(value)}`,
    hasVariable: (variable) => `hasVariable('${variable}')`,
    isEmpty: (variable) => `isEmpty(${variable})`,
    startsWith: (variable, prefix) => `startsWith(${variable}, '${prefix}')`,
    contains: (variable, substring) => `${variable}.includes('${substring}')`,
    matches: (variable, pattern) => `matches(${variable}, '${pattern}')`,
    arrayIncludes: (array, item) => `includes(${array}, ${JSON.stringify(item)})`,
    arrayLength: (array, length) => `length(${array}) === ${length}`,
    and: (...conditions) => `(${conditions.join(') && (')})`,
    or: (...conditions) => `(${conditions.join(') || (')})`,
    not: (condition) => `!(${condition})`
};
class ConditionalBuilder {
    constructor() {
        this.branches = [];
        this.defaultOutput = '';
    }
    if(condition, output, label) {
        this.branches.push({ condition, output, label });
        return this;
    }
    elseIf(condition, output, label) {
        return this.if(condition, output, label);
    }
    else(output) {
        this.defaultOutput = output;
        return this;
    }
    build(id, config) {
        return new ConditionalNode(id, this.branches, this.defaultOutput, config);
    }
    getBranches() {
        return this.branches;
    }
    getDefaultOutput() {
        return this.defaultOutput;
    }
}
exports.ConditionalBuilder = ConditionalBuilder;
function conditional(id) {
    return new ConditionalBuilder();
}
//# sourceMappingURL=Conditional.js.map