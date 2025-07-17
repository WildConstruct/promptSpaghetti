"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionPresets = exports.WeightedAdvancedNode = void 0;
exports.createWeightedAdvancedNode = createWeightedAdvancedNode;
const advanced_1 = require("../advanced");
const io_system_1 = require("../io-system");
class WeightedAdvancedNode extends advanced_1.AdvancedRuntimeNode {
    constructor(id, choices = [], distributionConfig = { type: 'linear', normalize: true }) {
        const config = {
            deterministic: true,
            cacheable: true,
            stateful: false,
            performanceHints: {
                expectedExecutionTime: 'fast',
                memoryUsage: 'low'
            }
        };
        super(id, config);
        this.choices = choices;
        this.distributionConfig = distributionConfig;
        const ioSpec = new io_system_1.IOSpecBuilder()
            .addInput({
            id: 'values',
            label: 'Choice Values',
            dataType: 'stringArray',
            required: false,
            defaultValue: [],
            description: 'Array of string values to choose from'
        })
            .addInput({
            id: 'weights',
            label: 'Choice Weights',
            dataType: 'numberArray',
            required: false,
            defaultValue: [],
            constraints: {
                min: 0,
                customValidator: (weights) => {
                    if (weights.some(w => w < 0)) {
                        return advanced_1.ValidationHelpers.createInvalidResult(['Weights cannot be negative']);
                    }
                    if (weights.every(w => w === 0)) {
                        return advanced_1.ValidationHelpers.createInvalidResult(['At least one weight must be positive']);
                    }
                    return advanced_1.ValidationHelpers.createValidResult();
                }
            },
            description: 'Array of numeric weights (must be non-negative)'
        })
            .addTextOutput('result', 'Selected Choice')
            .build();
        this.ioHandler = new io_system_1.AdvancedIOHandler(ioSpec);
    }
    run(ctx) {
        ctx.executionMeta.nodeExecutionOrder.push(this.id);
        return this.measureExecution(ctx, 'weighted-selection', () => {
            const effectiveChoices = this.getEffectiveChoices(ctx);
            if (effectiveChoices.length === 0) {
                return '';
            }
            if (effectiveChoices.length === 1) {
                return effectiveChoices[0].value;
            }
            const distributedWeights = this.applyDistribution(effectiveChoices);
            return this.selectFromDistribution(distributedWeights, ctx);
        });
    }
    validate() {
        const errors = [];
        const warnings = [];
        if (this.choices.length === 0) {
            warnings.push('No choices configured - node will depend on dynamic inputs');
        }
        this.choices.forEach((choice, index) => {
            if (!choice.value) {
                errors.push(`Choice ${index} has empty value`);
            }
            if (choice.weight < 0) {
                errors.push(`Choice ${index} has negative weight: ${choice.weight}`);
            }
        });
        if (!['linear', 'exponential', 'gaussian', 'custom'].includes(this.distributionConfig.type)) {
            errors.push(`Invalid distribution type: ${this.distributionConfig.type}`);
        }
        if (this.distributionConfig.type === 'exponential' && this.distributionConfig.parameters?.factor && this.distributionConfig.parameters.factor <= 0) {
            errors.push('Exponential distribution factor must be positive');
        }
        if (this.distributionConfig.type === 'gaussian') {
            const params = this.distributionConfig.parameters;
            if (params?.std && params.std <= 0) {
                errors.push('Gaussian distribution standard deviation must be positive');
            }
        }
        const totalWeight = this.choices.reduce((sum, choice) => sum + choice.weight, 0);
        if (this.choices.length > 0 && totalWeight === 0) {
            errors.push('All weights are zero - cannot perform weighted selection');
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
            type: 'WeightedAdvanced',
            config: this.config,
            data: {
                choices: this.choices,
                distributionConfig: this.distributionConfig
            },
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    getEffectiveChoices(ctx) {
        return this.choices;
    }
    applyDistribution(choices) {
        const { type, parameters = {}, normalize = true, minWeight = 0 } = this.distributionConfig;
        let distributedChoices;
        switch (type) {
            case 'linear':
                distributedChoices = this.applyLinearDistribution(choices);
                break;
            case 'exponential':
                distributedChoices = this.applyExponentialDistribution(choices, parameters.factor || 1.5);
                break;
            case 'gaussian':
                distributedChoices = this.applyGaussianDistribution(choices, parameters.mean || 0.5, parameters.std || 0.2);
                break;
            case 'custom':
                distributedChoices = this.applyCustomDistribution(choices, parameters);
                break;
            default:
                distributedChoices = choices;
        }
        if (minWeight > 0) {
            distributedChoices = distributedChoices.map(choice => ({
                ...choice,
                weight: Math.max(choice.weight, minWeight)
            }));
        }
        if (normalize) {
            const totalWeight = distributedChoices.reduce((sum, choice) => sum + choice.weight, 0);
            if (totalWeight > 0) {
                distributedChoices = distributedChoices.map(choice => ({
                    ...choice,
                    weight: choice.weight / totalWeight
                }));
            }
        }
        return distributedChoices;
    }
    applyLinearDistribution(choices) {
        return choices;
    }
    applyExponentialDistribution(choices, factor) {
        return choices.map(choice => ({
            ...choice,
            weight: Math.pow(choice.weight, factor)
        }));
    }
    applyGaussianDistribution(choices, mean, std) {
        return choices.map((choice, index) => {
            const x = index / (choices.length - 1 || 1);
            const gaussian = Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            return {
                ...choice,
                weight: choice.weight * gaussian
            };
        });
    }
    applyCustomDistribution(choices, parameters) {
        return choices;
    }
    selectFromDistribution(choices, ctx) {
        const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
        if (totalWeight === 0) {
            const rng = this.createSeededRNG(ctx.seed);
            const index = Math.floor(rng() * choices.length);
            return choices[index].value;
        }
        const rng = this.createSeededRNG(ctx.seed);
        let random = rng() * totalWeight;
        for (const choice of choices) {
            if (random < choice.weight) {
                return choice.value;
            }
            random -= choice.weight;
        }
        return choices[choices.length - 1].value;
    }
}
exports.WeightedAdvancedNode = WeightedAdvancedNode;
function createWeightedAdvancedNode(id, choices, distributionConfig) {
    return new WeightedAdvancedNode(id, choices, distributionConfig);
}
exports.DistributionPresets = {
    linear: { type: 'linear', normalize: true },
    exponential: { type: 'exponential', parameters: { factor: 2 }, normalize: true },
    gaussian: { type: 'gaussian', parameters: { mean: 0.5, std: 0.2 }, normalize: true },
    uniform: { type: 'linear', normalize: true, minWeight: 1 }
};
//# sourceMappingURL=WeightedAdvanced.js.map