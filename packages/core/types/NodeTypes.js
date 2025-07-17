"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRuntimeNodeType = isRuntimeNodeType;
exports.isUINodeType = isUINodeType;
exports.createBaseNodeData = createBaseNodeData;
exports.createWeightedChoiceNodeData = createWeightedChoiceNodeData;
exports.createConcatNodeData = createConcatNodeData;
exports.createOutputNodeData = createOutputNodeData;
exports.createIncludeNodeData = createIncludeNodeData;
exports.createSetVariableNodeData = createSetVariableNodeData;
exports.createGetVariableNodeData = createGetVariableNodeData;
exports.createSubjectNodeData = createSubjectNodeData;
exports.createActionNodeData = createActionNodeData;
exports.createNodeData = createNodeData;
exports.serializeForRuntime = serializeForRuntime;
exports.deserializeFromRuntime = deserializeFromRuntime;
exports.validateNodeData = validateNodeData;
function isRuntimeNodeType(type) {
    return ["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable"].includes(type);
}
function isUINodeType(type) {
    return ["Subject", "Connector", "Attribute", "Action"].includes(type);
}
function createBaseNodeData(id, label) {
    return {
        id,
        label,
        variations: [],
        category: "general",
        description: "",
        tags: [],
        includeMetadata: false,
        transformations: [],
        contextHints: [],
    };
}
function createWeightedChoiceNodeData(id, label = "Weighted Choice") {
    return {
        ...createBaseNodeData(id, label),
        type: "WeightedChoice",
        choices: [],
        weights: [],
    };
}
function createConcatNodeData(id, label = "Concat") {
    return {
        ...createBaseNodeData(id, label),
        type: "Concat",
        separator: " ",
        joinMode: "space",
        trimInputs: true,
        preserveOrder: true,
    };
}
function createOutputNodeData(id, label = "Output") {
    return {
        ...createBaseNodeData(id, label),
        type: "Output",
        template: "",
        format: "text",
        destination: "stdout",
    };
}
function createIncludeNodeData(id, label = "Include") {
    return {
        ...createBaseNodeData(id, label),
        type: "Include",
        name: "",
        includeType: "template",
    };
}
function createSetVariableNodeData(id, label = "Set Variable") {
    return {
        ...createBaseNodeData(id, label),
        type: "SetVariable",
        variableName: "",
        value: "",
        variableType: "auto",
        scope: "global",
        persistent: false,
        allowOverwrite: true,
    };
}
function createGetVariableNodeData(id, label = "Get Variable") {
    return {
        ...createBaseNodeData(id, label),
        type: "GetVariable",
        variableName: "",
        defaultValue: "",
        variableType: "auto",
        scope: "global",
        required: false,
    };
}
function createSubjectNodeData(id, label = "Subject") {
    return {
        ...createBaseNodeData(id, label),
        type: "Subject",
        grammaticalNumber: "singular",
        grammaticalPerson: "third",
        allowPronouns: false,
        pronouns: [],
        baseForm: "",
    };
}
function createActionNodeData(id, label = "Action") {
    return {
        ...createBaseNodeData(id, label),
        type: "Action",
        actionType: "verb",
        tense: "present",
        mood: "indicative",
        requiresObject: false,
        intensity: "medium",
        adverbVariations: [],
    };
}
function createNodeData(type, id, label) {
    switch (type) {
        case "WeightedChoice":
            return createWeightedChoiceNodeData(id, label);
        case "Concat":
            return createConcatNodeData(id, label);
        case "Output":
            return createOutputNodeData(id, label);
        case "Include":
            return createIncludeNodeData(id, label);
        case "SetVariable":
            return createSetVariableNodeData(id, label);
        case "GetVariable":
            return createGetVariableNodeData(id, label);
        case "Subject":
            return createSubjectNodeData(id, label);
        case "Action":
            return createActionNodeData(id, label);
        case "Connector":
        case "Attribute":
        default:
            return {
                ...createBaseNodeData(id, label || type),
                type: type,
            };
    }
}
function serializeForRuntime(nodeData) {
    if (!isRuntimeNodeType(nodeData.type)) {
        return null;
    }
    const base = {
        id: nodeData.id,
        type: nodeData.type,
    };
    switch (nodeData.type) {
        case "WeightedChoice":
            return {
                ...base,
                choices: nodeData.choices.map((choice, index) => ({
                    value: choice,
                    weight: nodeData.weights[index] || 1,
                })),
            };
        case "Concat":
            return base;
        case "Output":
            return base;
        case "Include":
            return {
                ...base,
                name: nodeData.name,
            };
        case "SetVariable":
            return {
                ...base,
                key: nodeData.variableName,
                value: nodeData.value,
            };
        case "GetVariable":
            return {
                ...base,
                key: nodeData.variableName,
            };
        default:
            return base;
    }
}
function deserializeFromRuntime(runtimeData) {
    if (!isRuntimeNodeType(runtimeData.type)) {
        return null;
    }
    const id = runtimeData.id;
    const type = runtimeData.type;
    switch (type) {
        case "WeightedChoice":
            const choices = (runtimeData.choices || []).map((c) => c.value || c);
            const weights = (runtimeData.choices || []).map((c) => c.weight || 1);
            return {
                ...createWeightedChoiceNodeData(id),
                choices,
                weights,
            };
        case "Concat":
            return createConcatNodeData(id);
        case "Output":
            return createOutputNodeData(id);
        case "Include":
            return {
                ...createIncludeNodeData(id),
                name: runtimeData.name || "",
            };
        case "SetVariable":
            return {
                ...createSetVariableNodeData(id),
                variableName: runtimeData.key || "",
                value: runtimeData.value || "",
            };
        case "GetVariable":
            return {
                ...createGetVariableNodeData(id),
                variableName: runtimeData.key || "",
            };
        default:
            return null;
    }
}
function validateNodeData(nodeData) {
    const errors = [];
    if (!nodeData.id) {
        errors.push("Node ID is required");
    }
    if (!nodeData.type) {
        errors.push("Node type is required");
    }
    if (!nodeData.label) {
        errors.push("Node label is required");
    }
    if (nodeData.type === "WeightedChoice") {
        const data = nodeData;
        if (!data.choices || data.choices.length === 0) {
            errors.push("WeightedChoice nodes must have at least one choice");
        }
        if (data.choices && data.weights && data.choices.length !== data.weights.length) {
            errors.push("WeightedChoice nodes must have matching choices and weights arrays");
        }
    }
    if (nodeData.type === "Include") {
        const data = nodeData;
        if (!data.name) {
            errors.push("Include nodes must have a name");
        }
    }
    if (nodeData.type === "SetVariable" || nodeData.type === "GetVariable") {
        const data = nodeData;
        if (!data.variableName) {
            errors.push(`${nodeData.type} nodes must have a variable name`);
        }
    }
    return errors;
}
//# sourceMappingURL=NodeTypes.js.map