export class NodeFactory {
    static nodeTemplates = new Map([
        [
            'textBlock',
            {
                type: 'textBlock',
                defaultData: {
                    nodeType: 'textBlock',
                    value: 'New text block',
                    text: 'New text block'
                }
            }
        ],
        [
            'weightedChoice',
            {
                type: 'weightedChoice',
                defaultData: {
                    nodeType: 'weightedChoice',
                    value: JSON.stringify([
                        {
                            id: 'option-1',
                            text: 'Option 1',
                            weight: 50,
                            hasBranch: false
                        },
                        { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: false }
                    ], null, 2),
                    options: [
                        { id: 'option-1', text: 'Option 1', weight: 50, hasBranch: false },
                        { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: false }
                    ]
                }
            }
        ],
        [
            'concat',
            {
                type: 'concat',
                defaultData: {
                    nodeType: 'concat',
                    value: ' ',
                    separator: ' '
                }
            }
        ],
        [
            'variable',
            {
                type: 'variable',
                defaultData: {
                    nodeType: 'variable',
                    value: 'myVariable',
                    variableName: 'myVariable',
                    mode: 'both'
                }
            }
        ],
        [
            'setVariable',
            {
                type: 'setVariable',
                defaultData: {
                    nodeType: 'setVariable',
                    value: 'myVariable',
                    variableName: 'myVariable',
                    mode: 'set'
                }
            }
        ],
        [
            'getVariable',
            {
                type: 'getVariable',
                defaultData: {
                    nodeType: 'getVariable',
                    value: 'myVariable',
                    variableName: 'myVariable',
                    mode: 'get'
                }
            }
        ],
        [
            'output',
            {
                type: 'output',
                defaultData: {
                    nodeType: 'output',
                    value: 'output',
                    label: 'output'
                }
            }
        ]
    ]);
    /**
     * Create a unique node ID
     */
    static createNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Create a new node with default data
     */
    static createNode(type, position, customData) {
        const template = this.nodeTemplates.get(type) || {
            type: 'textBlock',
            defaultData: { nodeType: 'textBlock', value: 'New node' }
        };
        const validPosition = {
            x: typeof position?.x === 'number' ? position.x : 250,
            y: typeof position?.y === 'number' ? position.y : 250
        };
        return {
            id: this.createNodeId(),
            type: template.type,
            position: validPosition,
            data: {
                ...template.defaultData,
                ...customData
            }
        };
    }
    /**
     * Clone a node with new position
     */
    static cloneNode(node, offset = { x: 50, y: 50 }) {
        return {
            ...node,
            id: this.createNodeId(),
            position: {
                x: node.position.x + offset.x,
                y: node.position.y + offset.y
            },
            selected: false
        };
    }
    /**
     * Update node data while preserving other properties
     */
    static updateNodeData(node, updates) {
        return {
            ...node,
            data: {
                ...node.data,
                ...updates
            }
        };
    }
    /**
     * Register a custom node template
     */
    static registerNodeTemplate(type, template) {
        this.nodeTemplates.set(type, template);
    }
    /**
     * Get all available node types
     */
    static getAvailableNodeTypes() {
        return Array.from(this.nodeTemplates.keys());
    }
    /**
     * Validate node data structure
     */
    static validateNodeData(node) {
        const errors = [];
        if (!node.id) {
            errors.push('Node missing ID');
        }
        if (!node.type) {
            errors.push('Node missing type');
        }
        if (!node.position ||
            typeof node.position.x !== 'number' ||
            typeof node.position.y !== 'number') {
            errors.push('Node missing or invalid position');
        }
        if (!node.data) {
            errors.push('Node missing data');
        }
        else if (!node.data.nodeType) {
            errors.push('Node data missing nodeType');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
