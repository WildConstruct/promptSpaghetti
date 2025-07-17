"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestReport = exports.runCrossModelTests = exports.testCases = exports.CrossModelTester = exports.generateGraphWithGemini = exports.defaultGeminiConfig = exports.GeminiGraphAgent = exports.generateGraphWithClaude = exports.defaultAnthropicConfig = exports.AnthropicGraphAgent = exports.generateGraphWithOpenAI = exports.defaultOpenAIConfig = exports.OpenAIGraphAgent = void 0;
exports.generateGraph = generateGraph;
var openai_agent_1 = require("./scripts/openai-agent");
Object.defineProperty(exports, "OpenAIGraphAgent", { enumerable: true, get: function () { return openai_agent_1.OpenAIGraphAgent; } });
Object.defineProperty(exports, "defaultOpenAIConfig", { enumerable: true, get: function () { return openai_agent_1.defaultOpenAIConfig; } });
Object.defineProperty(exports, "generateGraphWithOpenAI", { enumerable: true, get: function () { return openai_agent_1.generateGraphWithOpenAI; } });
var anthropic_agent_1 = require("./scripts/anthropic-agent");
Object.defineProperty(exports, "AnthropicGraphAgent", { enumerable: true, get: function () { return anthropic_agent_1.AnthropicGraphAgent; } });
Object.defineProperty(exports, "defaultAnthropicConfig", { enumerable: true, get: function () { return anthropic_agent_1.defaultAnthropicConfig; } });
Object.defineProperty(exports, "generateGraphWithClaude", { enumerable: true, get: function () { return anthropic_agent_1.generateGraphWithClaude; } });
var gemini_agent_1 = require("./scripts/gemini-agent");
Object.defineProperty(exports, "GeminiGraphAgent", { enumerable: true, get: function () { return gemini_agent_1.GeminiGraphAgent; } });
Object.defineProperty(exports, "defaultGeminiConfig", { enumerable: true, get: function () { return gemini_agent_1.defaultGeminiConfig; } });
Object.defineProperty(exports, "generateGraphWithGemini", { enumerable: true, get: function () { return gemini_agent_1.generateGraphWithGemini; } });
var cross_model_examples_1 = require("./examples/cross-model-examples");
Object.defineProperty(exports, "CrossModelTester", { enumerable: true, get: function () { return cross_model_examples_1.CrossModelTester; } });
Object.defineProperty(exports, "testCases", { enumerable: true, get: function () { return cross_model_examples_1.testCases; } });
Object.defineProperty(exports, "runCrossModelTests", { enumerable: true, get: function () { return cross_model_examples_1.runCrossModelTests; } });
Object.defineProperty(exports, "generateTestReport", { enumerable: true, get: function () { return cross_model_examples_1.generateTestReport; } });
async function generateGraph(request, provider = 'openai', config = {}) {
    switch (provider) {
        case 'openai':
            return generateGraphWithOpenAI(request, config);
        case 'claude':
            return generateGraphWithClaude(request, config);
        case 'gemini':
            return generateGraphWithGemini(request, config);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
//# sourceMappingURL=index.js.map