"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRandomizerSystem = void 0;
__exportStar(require("./serialization"), exports);
__exportStar(require("./agents"), exports);
__exportStar(require("./parser"), exports);
__exportStar(require("./generator"), exports);
class LLMRandomizerSystem {
    async generateWithLLM(request, provider = 'openai') {
        const { generateGraph } = await Promise.resolve().then(() => __importStar(require('./agents')));
        return generateGraph(request, provider);
    }
    async parseFromLLM(llmOutput) {
        const { parseGraph } = await Promise.resolve().then(() => __importStar(require('./parser')));
        return parseGraph(llmOutput);
    }
    async validateAndSerialize(graph) {
        const { serializeGraph } = await Promise.resolve().then(() => __importStar(require('./serialization')));
        return serializeGraph(graph);
    }
    async fullWorkflow(request, provider = 'openai') {
        if (!this.workflow) {
            const { RandomizerWorkflow } = await Promise.resolve().then(() => __importStar(require('./generator')));
            this.workflow = new RandomizerWorkflow();
        }
        const parameters = this.normalizeParameters(request, provider);
        return this.workflow.generateGraph(parameters);
    }
    normalizeParameters(request, provider) {
        if (typeof request === 'string') {
            return {
                purpose: request,
                complexity: 'moderate',
                nodeCount: 12,
                style: 'balanced',
                provider,
                temperature: 0.7,
                maxRetries: 3,
                nodeTypes: [],
                specificRequirements: [],
                constraints: [],
                focusAreas: [],
                includeMetadata: true,
                validateOutput: true,
                enablePreview: true,
                preferredPatterns: [],
                avoidPatterns: [],
                qualityLevel: 'standard',
                diversityScore: 0.5,
                outputFormat: 'both',
                includeExplanation: false,
                domain: undefined,
                userContext: undefined
            };
        }
        return {
            provider,
            temperature: 0.7,
            maxRetries: 3,
            nodeTypes: [],
            specificRequirements: [],
            constraints: [],
            focusAreas: [],
            includeMetadata: true,
            validateOutput: true,
            enablePreview: true,
            preferredPatterns: [],
            avoidPatterns: [],
            qualityLevel: 'standard',
            diversityScore: 0.5,
            outputFormat: 'both',
            includeExplanation: false,
            domain: undefined,
            userContext: undefined,
            ...request
        };
    }
}
exports.LLMRandomizerSystem = LLMRandomizerSystem;
//# sourceMappingURL=index.js.map