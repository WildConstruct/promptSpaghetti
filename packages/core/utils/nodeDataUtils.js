"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateNodeData = exports.mergeNodeData = exports.cloneNodeData = exports.validateNodeDataLegacy = exports.validateNodeDataLegacyWrapper = exports.getVariationCount = exports.hasVariations = exports.getRandomVariation = exports.reorderVariationsInNode = exports.updateVariationInNode = exports.removeVariationFromNode = exports.addVariationToNode = exports.createDefaultNodeData = void 0;
const NodeTypes_1 = require("../types/NodeTypes");
const createDefaultNodeData = (type) => {
    const id = `${type}-${Date.now()}`;
    return (0, NodeTypes_1.createNodeData)(type, id);
};
exports.createDefaultNodeData = createDefaultNodeData;
const addVariationToNode = (nodeData, variation) => {
    const currentVariations = nodeData.variations || [];
    return {
        ...nodeData,
        variations: [...currentVariations, variation],
    };
};
exports.addVariationToNode = addVariationToNode;
const removeVariationFromNode = (nodeData, index) => {
    const currentVariations = nodeData.variations || [];
    return {
        ...nodeData,
        variations: currentVariations.filter((_, i) => i !== index),
    };
};
exports.removeVariationFromNode = removeVariationFromNode;
const updateVariationInNode = (nodeData, index, newValue) => {
    const currentVariations = nodeData.variations || [];
    const updatedVariations = [...currentVariations];
    updatedVariations[index] = newValue;
    return {
        ...nodeData,
        variations: updatedVariations,
    };
};
exports.updateVariationInNode = updateVariationInNode;
const reorderVariationsInNode = (nodeData, fromIndex, toIndex) => {
    const currentVariations = nodeData.variations || [];
    const updatedVariations = [...currentVariations];
    const [movedItem] = updatedVariations.splice(fromIndex, 1);
    updatedVariations.splice(toIndex, 0, movedItem);
    return {
        ...nodeData,
        variations: updatedVariations,
    };
};
exports.reorderVariationsInNode = reorderVariationsInNode;
const getRandomVariation = (nodeData, seed) => {
    const variations = nodeData.variations || [];
    if (variations.length === 0)
        return nodeData.label;
    const randomIndex = seed !== undefined
        ? Math.floor((Math.abs(seed) + 1) % variations.length)
        : Math.floor(Math.random() * variations.length);
    return variations[randomIndex];
};
exports.getRandomVariation = getRandomVariation;
const hasVariations = (nodeData) => {
    return Boolean(nodeData.variations && nodeData.variations.length > 0);
};
exports.hasVariations = hasVariations;
const getVariationCount = (nodeData) => {
    return nodeData.variations?.length || 0;
};
exports.getVariationCount = getVariationCount;
const validateNodeDataLegacyWrapper = (nodeData) => {
    const { validateNodeData: newValidate } = require("../types/NodeTypes");
    const errors = newValidate(nodeData);
    return {
        valid: errors.length === 0,
        errors,
    };
};
exports.validateNodeDataLegacyWrapper = validateNodeDataLegacyWrapper;
const validateNodeDataLegacy = (nodeData) => {
    const errors = [];
    if (!nodeData.label || nodeData.label.trim() === "") {
        errors.push("Node label is required");
    }
    if (!nodeData.id || nodeData.id.trim() === "") {
        errors.push("Node ID is required");
    }
    switch (nodeData.type) {
        case "WeightedChoice":
            const wcData = nodeData;
            if (wcData.choices && wcData.weights && wcData.choices.length !== wcData.weights.length) {
                errors.push("Number of choices must match number of weights");
            }
            if (wcData.weights && wcData.weights.some(w => w <= 0)) {
                errors.push("All weights must be positive numbers");
            }
            break;
        case "SetVariable":
            const setVarData = nodeData;
            if (!setVarData.variableName || setVarData.variableName.trim() === "") {
                errors.push("Variable name is required");
            }
            break;
        case "GetVariable":
            const getVarData = nodeData;
            if (!getVarData.variableName || getVarData.variableName.trim() === "") {
                errors.push("Variable name is required");
            }
            break;
        case "Include":
            const includeData = nodeData;
            if (!includeData.name || includeData.name.trim() === "") {
                errors.push("Include name is required");
            }
            break;
    }
    return {
        valid: errors.length === 0,
        errors,
    };
};
exports.validateNodeDataLegacy = validateNodeDataLegacy;
const cloneNodeData = (nodeData) => {
    return JSON.parse(JSON.stringify(nodeData));
};
exports.cloneNodeData = cloneNodeData;
const mergeNodeData = (original, updates) => {
    return {
        ...original,
        ...updates,
    };
};
exports.mergeNodeData = mergeNodeData;
const migrateNodeData = (oldNodeData) => {
    try {
        if (oldNodeData.id && oldNodeData.type && oldNodeData.label) {
            return oldNodeData;
        }
        const type = oldNodeData.type;
        const id = oldNodeData.id || `${type}-${Date.now()}`;
        const label = oldNodeData.label || type;
        const newData = (0, NodeTypes_1.createNodeData)(type, id, label);
        if (oldNodeData.variations) {
            newData.variations = oldNodeData.variations;
        }
        return newData;
    }
    catch (error) {
        console.warn("Failed to migrate node data:", error);
        return null;
    }
};
exports.migrateNodeData = migrateNodeData;
//# sourceMappingURL=nodeDataUtils.js.map