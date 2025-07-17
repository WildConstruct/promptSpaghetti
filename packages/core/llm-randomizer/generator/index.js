"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomizerSystem = exports.RandomizerWorkflow = exports.GraphPreview = exports.RandomizerPanel = exports.ParameterManager = exports.defaultPresets = exports.ParameterValidator = exports.ValidationResultSchema = exports.ParameterPresetSchema = exports.RandomizerParametersSchema = exports.NodeTypePreference = exports.LLMProvider = exports.StylePreference = exports.ComplexityLevel = void 0;
var parameter_schema_1 = require("./parameters/parameter-schema");
Object.defineProperty(exports, "ComplexityLevel", { enumerable: true, get: function () { return parameter_schema_1.ComplexityLevel; } });
Object.defineProperty(exports, "StylePreference", { enumerable: true, get: function () { return parameter_schema_1.StylePreference; } });
Object.defineProperty(exports, "LLMProvider", { enumerable: true, get: function () { return parameter_schema_1.LLMProvider; } });
Object.defineProperty(exports, "NodeTypePreference", { enumerable: true, get: function () { return parameter_schema_1.NodeTypePreference; } });
Object.defineProperty(exports, "RandomizerParametersSchema", { enumerable: true, get: function () { return parameter_schema_1.RandomizerParametersSchema; } });
Object.defineProperty(exports, "ParameterPresetSchema", { enumerable: true, get: function () { return parameter_schema_1.ParameterPresetSchema; } });
Object.defineProperty(exports, "ValidationResultSchema", { enumerable: true, get: function () { return parameter_schema_1.ValidationResultSchema; } });
Object.defineProperty(exports, "ParameterValidator", { enumerable: true, get: function () { return parameter_schema_1.ParameterValidator; } });
Object.defineProperty(exports, "defaultPresets", { enumerable: true, get: function () { return parameter_schema_1.defaultPresets; } });
var parameter_manager_1 = require("./parameters/parameter-manager");
Object.defineProperty(exports, "ParameterManager", { enumerable: true, get: function () { return parameter_manager_1.ParameterManager; } });
var RandomizerPanel_1 = require("./ui/RandomizerPanel");
Object.defineProperty(exports, "RandomizerPanel", { enumerable: true, get: function () { return RandomizerPanel_1.RandomizerPanel; } });
var GraphPreview_1 = require("./preview/GraphPreview");
Object.defineProperty(exports, "GraphPreview", { enumerable: true, get: function () { return GraphPreview_1.GraphPreview; } });
var randomizer_workflow_1 = require("./workflow/randomizer-workflow");
Object.defineProperty(exports, "RandomizerWorkflow", { enumerable: true, get: function () { return randomizer_workflow_1.RandomizerWorkflow; } });
class RandomizerSystem {
    constructor(options = {}) {
        this.parameterManager = new ParameterManager(options);
        this.workflow = new RandomizerWorkflow();
    }
    getParameterManager() {
        return this.parameterManager;
    }
    getWorkflow() {
        return this.workflow;
    }
    async quickGenerate(purpose, complexity = 'moderate', provider = 'openai') {
        const parameters = this.parameterManager.createCompleteParameters({
            purpose,
            complexity,
            provider
        });
        return this.workflow.generateGraph(parameters);
    }
    async generateWithPreset(presetId, overrides = {}) {
        const preset = this.parameterManager.getPreset(presetId);
        if (!preset) {
            throw new Error(`Preset not found: ${presetId}`);
        }
        const parameters = {
            ...preset.parameters,
            ...overrides
        };
        return this.workflow.generateGraph(parameters);
    }
    async generateVariations(parameters, count = 3) {
        return this.workflow.generateVariations(parameters, count);
    }
    getHistory() {
        return {
            entries: this.parameterManager.getHistory(),
            stats: this.parameterManager.getHistoryStats()
        };
    }
    exportData() {
        return this.parameterManager.exportData();
    }
    importData(data) {
        return this.parameterManager.importData(data);
    }
}
exports.RandomizerSystem = RandomizerSystem;
//# sourceMappingURL=index.js.map