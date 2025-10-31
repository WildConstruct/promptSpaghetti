"use strict";
/**
 * Project Serialization Utilities - Story 6.1
 *
 * Handles serialization/deserialization of .psg files with validation,
 * checksum generation, and (placeholder) migration support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeProject = serializeProject;
exports.deserializeProject = deserializeProject;
exports.validateFileIntegrity = validateFileIntegrity;
exports.createEmptyProject = createEmptyProject;

const {
  PSG_FORMAT_VERSION,
  validatePsgFile,
  createDefaultMetadata,
  createDefaultSettings,
  isVersionCompatible,
} = require("../schemas/psgSchema");

/**
 * Serializes graph state to the .psg format.
 *
 * @param {object} graphState
 * @param {object} metadata
 * @param {object} settings
 * @param {object} options
 * @returns {{ success: boolean, data?: string, error?: string, warnings?: string[] }}
 */
function serializeProject(
  graphState,
  metadata,
  settings,
  options = {}
) {
  const {
    includeMetadata = true,
    includeSettings = true,
    includeCollaboration = true,
    compress = false,
    validateOutput = true,
  } = options;

  try {
    const nodes = Array.isArray(graphState?.nodes)
      ? graphState.nodes
      : [];

    const graph = {
      nodes: nodes.map(convertReactFlowNodeToGraphNode),
      seed: graphState?.seed,
    };

    const psgFile = {
      fileType: "psg",
      formatVersion: PSG_FORMAT_VERSION,
      metadata: includeMetadata
        ? metadata
        : createDefaultMetadata("Untitled Project"),
      settings: includeSettings
        ? settings
        : createDefaultSettings(),
      graph,
      exportedAt: new Date().toISOString(),
    };

    if (includeCollaboration && graphState?.annotations) {
      const annotations = graphState.annotations;
      psgFile.collaboration = {
        stickyNotes: annotations.stickyNotes || [],
        annotations: {
          nodeLabels: annotations.nodeLabels || {},
          regionGroups: annotations.regionGroups || [],
          connectionLabels: annotations.connectionLabels || {},
        },
      };
    }

    const draftContent = JSON.stringify(psgFile, null, compress ? 0 : 2);
    psgFile.checksum = generateChecksum(draftContent);

    let warnings = [];

    if (validateOutput) {
      const validation = validatePsgFile(psgFile);
      if (!validation.success) {
        return {
          success: false,
          error: `Serialization validation failed: ${validation.error}`,
          warnings: validation.issues?.map((issue) =>
            `${issue.path.join(".")}: ${issue.message}`
          ) || [],
        };
      }

      // If validation returns a normalized version of the file,
      // adopt it so we know we're outputting a conformant object.
      if (validation.data) {
        Object.assign(psgFile, validation.data, { checksum: psgFile.checksum });
      }

      warnings = validation.issues?.map((issue) =>
        `${issue.path.join(".")}: ${issue.message}`
      ) || [];
    }

    const finalContent = JSON.stringify(psgFile, null, compress ? 0 : 2);

    return {
      success: true,
      data: finalContent,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unknown serialization error",
    };
  }
}

/**
 * Deserializes .psg file content to graph state.
 *
 * @param {string} content
 * @param {object} options
 * @returns {{ success: boolean, data?: any, error?: string, warnings?: string[], migrated?: boolean }}
 */
function deserializeProject(content, options = {}) {
  const {
    skipValidation = false,
    autoMigrate = true,
    preserveIds = true,
  } = options;

  try {
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        success: false,
        error: "Invalid JSON format in .psg file",
      };
    }

    const warnings = [];

    if (!skipValidation) {
      const validation = validatePsgFile(parsed);
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid .psg file format: ${validation.error}`,
          warnings: validation.issues?.map((issue) =>
            `${issue.path.join(".")}: ${issue.message}`
          ) || [],
        };
      }

      parsed = validation.data;
      warnings.push(
        ...(validation.issues?.map((issue) =>
          `${issue.path.join(".")}: ${issue.message}`
        ) || [])
      );
    }

    const compatibility = isVersionCompatible(parsed.formatVersion);
    if (!compatibility.compatible) {
      return {
        success: false,
        error: compatibility.message || "Incompatible file version",
      };
    }

    let migrated = false;

    if (compatibility.requiresMigration) {
      if (autoMigrate) {
        // Placeholder for future migration logic.
        migrated = true;
        if (compatibility.message) {
          warnings.push(compatibility.message);
        }
      } else if (compatibility.message) {
        warnings.push(compatibility.message);
      }
    }

    const reactFlowNodes = Array.isArray(parsed.graph?.nodes)
      ? parsed.graph.nodes.map((node) =>
          convertGraphNodeToReactFlowNode(node, { preserveIds })
        )
      : [];

    const reactFlowEdges = generateEdgesFromNodes(reactFlowNodes);

    const graphState = {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
    };

    if (parsed.collaboration) {
      graphState.annotations = {
        stickyNotes: parsed.collaboration.stickyNotes || [],
        nodeLabels: parsed.collaboration.annotations?.nodeLabels || {},
        regionGroups: parsed.collaboration.annotations?.regionGroups || [],
        connectionLabels:
          parsed.collaboration.annotations?.connectionLabels || {},
      };
    }

    return {
      success: true,
      data: {
        graph: graphState,
        metadata: parsed.metadata,
        settings: parsed.settings,
        collaboration: parsed.collaboration,
      },
      warnings,
      migrated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unknown deserialization error",
    };
  }
}

/**
 * Converts a ReactFlow node to the schema format used in .psg files.
 */
function convertReactFlowNodeToGraphNode(reactFlowNode = {}) {
  const typeMap = {
    "weighted-choice": "WeightedChoice",
    concat: "Concat",
    output: "Output",
    include: "Include",
    "set-variable": "SetVariable",
    "get-variable": "GetVariable",
    "weighted-advanced": "WeightedAdvanced",
    conditional: "Conditional",
    sequential: "Sequential",
    markov: "Markov",
    "python-transform": "PythonTransform",
  };

  const uiNodeType = reactFlowNode?.data?.nodeType || "output";
  const schemaType = typeMap[uiNodeType] || "Output";

  const nodeData = { ...(reactFlowNode?.data || {}) };
  const rawVariations = Array.isArray(nodeData.variations)
    ? [...nodeData.variations]
    : undefined;
  const rawInputs = Array.isArray(nodeData.inputs)
    ? [...nodeData.inputs]
    : [];

  delete nodeData.nodeType;
  delete nodeData.variations;
  delete nodeData.inputs;

  const graphNode = {
    id: reactFlowNode?.id,
    type: schemaType,
    inputs: rawInputs,
    ...nodeData,
  };

  if (schemaType === "WeightedChoice" && rawVariations) {
    graphNode.choices = rawVariations.map((value) => ({
      value,
      weight: 1,
    }));
  }

  return graphNode;
}

/**
 * Converts a graph schema node back into a ReactFlow node.
 */
function convertGraphNodeToReactFlowNode(graphNode = {}, options = {}) {
  const { preserveIds = true } = options;

  const typeMap = {
    WeightedChoice: "weighted-choice",
    Concat: "concat",
    Output: "output",
    Include: "include",
    SetVariable: "set-variable",
    GetVariable: "get-variable",
    WeightedAdvanced: "weighted-advanced",
    Conditional: "conditional",
    Sequential: "sequential",
    Markov: "markov",
    PythonTransform: "python-transform",
  };

  const uiNodeType = typeMap[graphNode.type] || "output";
  const id = preserveIds
    ? graphNode.id
    : `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const graphNodeCopy = { ...graphNode };
  const inputs = Array.isArray(graphNodeCopy.inputs)
    ? [...graphNodeCopy.inputs]
    : [];
  delete graphNodeCopy.inputs;
  delete graphNodeCopy.type;
  const choices = Array.isArray(graphNodeCopy.choices)
    ? [...graphNodeCopy.choices]
    : undefined;
  delete graphNodeCopy.choices;
  const label = graphNodeCopy.label || graphNodeCopy.id;
  delete graphNodeCopy.label;
  delete graphNodeCopy.id;

  const data = {
    nodeType: uiNodeType,
    label,
    inputs,
    ...graphNodeCopy,
  };

  if (graphNode.type === "WeightedChoice" && Array.isArray(choices)) {
    data.variations = choices.map((choice) => choice.value);
    delete data.choices;
  }

  return {
    id,
    type: "default",
    position: { x: 0, y: 0 },
    data,
  };
}

/**
 * Generates ReactFlow edges using node input metadata.
 */
function generateEdgesFromNodes(nodes) {
  const edges = [];

  nodes.forEach((node) => {
    const inputs = node?.data?.inputs;
    if (!Array.isArray(inputs)) {
      return;
    }

    inputs.forEach((inputId, index) => {
      edges.push({
        id: `edge_${inputId}_to_${node.id}_${index}`,
        source: inputId,
        target: node.id,
        sourceHandle: null,
        targetHandle: `input_${index}`,
        type: "default",
      });
    });
  });

  return edges;
}

/**
 * Generates a checksum for file integrity validation.
 */
function generateChecksum(content) {
  let checksum = 0;

  for (let i = 0; i < content.length; i += 1) {
    checksum = ((checksum << 5) - checksum + content.charCodeAt(i)) & 0xffffffff;
  }

  return Math.abs(checksum).toString(16);
}

/**
 * Validates file integrity using a generated checksum.
 */
function validateFileIntegrity(psgFile) {
  if (!psgFile?.checksum) {
    return true;
  }

  const { checksum, ...rest } = psgFile;
  const content = JSON.stringify(rest, null, 2);
  const calculated = generateChecksum(content);

  return checksum === calculated;
}

/**
 * Creates a minimal .psg project (primarily for tests/bootstrapping).
 */
function createEmptyProject(name = "New Project", author) {
  return {
    fileType: "psg",
    formatVersion: PSG_FORMAT_VERSION,
    metadata: createDefaultMetadata(name, author),
    settings: createDefaultSettings(),
    graph: { nodes: [] },
    exportedAt: new Date().toISOString(),
  };
}
