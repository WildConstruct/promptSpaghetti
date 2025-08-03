/**
 * PSG File Format Migration Utilities
 * Handles migration from v1 to v2 format
 */
import { PsgFileV2Schema, createDefaultEditState, PSG_FORMAT_VERSION_V2, } from './psgSchemaV2';
/**
 * Migrate v1 PSG file to v2 format
 */
export function migratePsgV1ToV2(v1File) {
    const errors = [];
    const warnings = [];
    try {
        // Migrate metadata
        const metadata = {
            name: v1File.metadata.name,
            description: v1File.metadata.description,
            version: v1File.metadata.version,
            createdAt: v1File.metadata.createdAt,
            lastModified: v1File.metadata.lastModified,
            lastModifiedBy: undefined,
            author: v1File.metadata.author,
            collaborators: [],
            tags: v1File.metadata.tags || [],
            category: undefined,
            thumbnail: undefined,
            fileFormatVersion: PSG_FORMAT_VERSION_V2,
            isTemplate: false,
            templateCategory: undefined,
            demoContent: false,
        };
        // Migrate settings
        const settings = {
            autoSave: v1File.settings.autoSave,
            autoSaveInterval: 30,
            undoStackSize: 50,
            gridEnabled: true,
            gridSize: v1File.settings.gridSize || 20,
            snapToGrid: v1File.settings.gridSnapping || false,
            showMinimap: v1File.settings.showMinimap,
            theme: v1File.settings.theme,
            inlineEditingEnabled: true,
            autoFocusOnCreate: true,
            showValidationInline: true,
            editOnDoubleClick: true,
            execution: {
                defaultSeed: undefined,
                timeout: 5000,
                maxDepth: 100,
                enableCaching: true,
                parallelExecution: false,
            },
            enableAnimations: true,
            renderOptimization: true,
            lazyLoadNodes: false,
        };
        // Migrate nodes
        const nodes = v1File.graph.nodes.map((v1Node) => {
            const nodeData = migrateNodeData(v1Node);
            return {
                id: v1Node.id,
                type: mapNodeType(v1Node.type),
                position: v1Node.position,
                size: undefined,
                style: undefined,
                data: nodeData,
                label: v1Node.data?.label,
                description: undefined,
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastExecutionTime: undefined,
                executionCount: 0,
                errorCount: 0,
            };
        });
        // Migrate edges
        const edges = v1File.graph.edges.map((v1Edge) => ({
            id: v1Edge.id,
            source: v1Edge.source,
            target: v1Edge.target,
            sourceHandle: v1Edge.sourceHandle,
            targetHandle: v1Edge.targetHandle,
            type: v1Edge.type || 'default',
            animated: v1Edge.animated || false,
            style: v1Edge.style,
            label: v1Edge.label,
            data: v1Edge.data,
        }));
        // Build graph
        const graph = {
            nodes,
            edges,
            state: {
                selectedNodes: [],
                selectedEdges: [],
                copiedNodes: [],
                viewport: {
                    x: 0,
                    y: 0,
                    zoom: 1,
                },
                editingNodeId: undefined,
                focusedNodeId: undefined,
                isExecuting: false,
                lastExecutionId: undefined,
                executionResults: undefined,
            },
        };
        // Handle collaboration data if present
        let medievalDemo = undefined;
        if (v1File.collaboration?.stickyNotes && v1File.collaboration.stickyNotes.length > 0) {
            warnings.push('Sticky notes from collaboration features have been removed in v2');
        }
        // Build v2 file
        const v2File = {
            fileType: 'psg',
            formatVersion: PSG_FORMAT_VERSION_V2,
            metadata,
            settings,
            graph,
            medievalDemo,
            plugins: undefined,
            customNodeTypes: undefined,
            checksum: v1File.checksum,
            compressed: false,
            encryption: undefined,
        };
        // Validate the migrated file
        const validation = PsgFileV2Schema.safeParse(v2File);
        if (!validation.success) {
            errors.push('Migration validation failed: ' + validation.error.message);
            return {
                success: false,
                errors,
                warnings,
            };
        }
        return {
            success: true,
            data: validation.data,
            errors,
            warnings,
        };
    }
    catch (error) {
        errors.push('Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return {
            success: false,
            errors,
            warnings,
        };
    }
}
/**
 * Map v1 node type to v2 node type
 */
function mapNodeType(v1Type) {
    const typeMap = {
        'text': 'TextBlock',
        'textBlock': 'TextBlock',
        'weighted': 'WeightedChoice',
        'weightedChoice': 'WeightedChoice',
        'concat': 'Concat',
        'variable': 'Variable',
        'setVariable': 'Variable',
        'getVariable': 'Variable',
        'output': 'Output',
        'include': 'Include',
    };
    return typeMap[v1Type] || 'TextBlock';
}
/**
 * Migrate node data from v1 to v2 format
 */
function migrateNodeData(v1Node) {
    const editState = createDefaultEditState();
    const baseData = {
        editState,
        isValid: true,
        validationMessage: undefined,
        isLocked: false,
        lockReason: undefined,
        previewMode: 'auto',
        lastPreviewUpdate: undefined,
    };
    switch (v1Node.type) {
        case 'text':
        case 'textBlock':
            return {
                ...baseData,
                value: v1Node.data?.text || v1Node.data?.value || '',
                maxLength: undefined,
                multiline: true,
                placeholder: undefined,
            };
        case 'weighted':
        case 'weightedChoice':
            const choices = v1Node.data?.choices || v1Node.data?.options || [];
            return {
                ...baseData,
                value: choices.map((choice, index) => ({
                    id: choice.id || `option-${index}`,
                    text: choice.text || choice.value || '',
                    weight: choice.weight || 50,
                    color: undefined,
                })),
                normalizeWeights: true,
                showPercentages: true,
                allowAddRemove: true,
                minOptions: 2,
                maxOptions: undefined,
            };
        case 'concat':
            return {
                ...baseData,
                value: {
                    separator: v1Node.data?.separator || ' ',
                    trimInputs: v1Node.data?.trim !== false,
                },
            };
        case 'variable':
        case 'setVariable':
        case 'getVariable':
            return {
                ...baseData,
                value: {
                    name: v1Node.data?.name || v1Node.data?.variableName || 'unnamed',
                    defaultValue: v1Node.data?.defaultValue || v1Node.data?.value,
                    currentValue: undefined,
                },
                variableType: 'any',
                scope: 'local',
            };
        case 'output':
            return {
                ...baseData,
                value: '',
                isLocked: true, // Outputs are typically locked
            };
        default:
            return {
                ...baseData,
                value: v1Node.data?.value || v1Node.data || {},
            };
    }
}
/**
 * Check if a file needs migration
 */
export function needsMigration(fileData) {
    if (!fileData.formatVersion && !fileData.fileFormatVersion) {
        return true; // No version, assume v1
    }
    const version = fileData.formatVersion || fileData.metadata?.fileFormatVersion;
    if (!version)
        return true;
    const [major] = version.split('.').map(Number);
    return major < 2;
}
/**
 * Auto-migrate file if needed
 */
export function autoMigrate(fileData) {
    if (!needsMigration(fileData)) {
        return { data: fileData, migrated: false };
    }
    const result = migratePsgV1ToV2(fileData);
    if (result.success && result.data) {
        return {
            data: result.data,
            migrated: true,
            warnings: result.warnings,
        };
    }
    // Migration failed, return original
    return {
        data: fileData,
        migrated: false,
        warnings: ['Migration failed: ' + (result.errors?.join(', ') || 'Unknown error')],
    };
}
