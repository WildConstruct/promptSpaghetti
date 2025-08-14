/**
 * Utility functions for applying presets to nodes
 */
/**
 * Apply a preset's values to a node's data
 */
export function applyPresetToNode(nodeData, preset, nodeType) {
    const updatedData = { ...nodeData };
    switch (preset.nodeType) {
        case 'textBlock':
            if (preset.value.text !== undefined) {
                updatedData.value = preset.value.text;
                updatedData.text = preset.value.text;
                updatedData.editBuffer = preset.value.text;
            }
            break;
        case 'weightedChoice':
            if (preset.value.options) {
                updatedData.value = JSON.stringify(preset.value.options);
                updatedData.options = preset.value.options;
                updatedData.editBuffer = JSON.stringify(preset.value.options, null, 2);
            }
            break;
        case 'concat':
            if (preset.value.separator !== undefined) {
                updatedData.value = preset.value.separator;
                updatedData.separator = preset.value.separator;
                updatedData.editBuffer = preset.value.separator;
            }
            break;
        case 'variable':
        case 'setVariable':
        case 'getVariable':
            if (preset.value.variableName) {
                updatedData.value = preset.value.variableName;
                updatedData.variableName = preset.value.variableName;
                updatedData.editBuffer = preset.value.variableName;
                // Set operation type if specified
                if (preset.value.operation) {
                    updatedData.operation = preset.value.operation;
                }
                // For set variables, include the value
                if (preset.value.value !== undefined &&
                    preset.value.operation === 'set') {
                    updatedData.variableValue = preset.value.value;
                }
            }
            break;
        case 'output':
            if (preset.value.label) {
                updatedData.value = preset.value.label;
                updatedData.label = preset.value.label;
                updatedData.editBuffer = preset.value.label;
            }
            break;
    }
    // Mark as modified from preset
    updatedData.isModifiedFromPreset = true;
    updatedData.originalPresetId = preset.id;
    updatedData.lastModified = new Date();
    return updatedData;
}
/**
 * Check if a node has been modified from its original preset
 */
export function isNodeModifiedFromPreset(nodeData) {
    return nodeData.isModifiedFromPreset === true;
}
/**
 * Get the current value from node data based on node type
 */
export function getNodeValue(nodeData, nodeType) {
    switch (nodeType) {
        case 'textBlock':
            return nodeData.text || nodeData.value;
        case 'weightedChoice':
            return (nodeData.options || (nodeData.value ? JSON.parse(nodeData.value) : []));
        case 'concat':
            return nodeData.separator || nodeData.value;
        case 'variable':
        case 'setVariable':
        case 'getVariable':
            return nodeData.variableName || nodeData.value;
        case 'output':
            return nodeData.label || nodeData.value;
        default:
            return nodeData.value;
    }
}
/**
 * Create a preset from current node data
 */
export function createPresetFromNode(nodeData, nodeType, name, category, tags = []) {
    const value = getNodeValue(nodeData, nodeType);
    let presetValue;
    switch (nodeType) {
        case 'textBlock':
            presetValue = { text: value };
            break;
        case 'weightedChoice':
            presetValue = { options: value };
            break;
        case 'concat':
            presetValue = { separator: value };
            break;
        case 'variable':
        case 'setVariable':
        case 'getVariable':
            presetValue = {
                variableName: value,
                operation: nodeData.operation || (nodeType === 'setVariable' ? 'set' : 'get')
            };
            if (nodeData.variableValue !== undefined) {
                presetValue.value = nodeData.variableValue;
            }
            break;
        case 'output':
            presetValue = { label: value };
            break;
        default:
            presetValue = value;
    }
    return {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        category,
        tags,
        nodeType,
        value: presetValue,
        metadata: {
            created: new Date(),
            usage: 0,
            author: 'user'
        }
    };
}
