'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FormatValidator = void 0;
exports.validateFormat = validateFormat;
exports.isValidFormat = isValidFormat;
const graphSchema_1 = require('../../graphSchema');
class FormatValidator {
  static validate(content) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };
    try {
      const parsed = this.parseContent(content);
      this.validateStructure(parsed, result);
      this.validateSemantics(parsed, result);
      this.checkOptimizations(parsed, result);
    }
    catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'syntax',
        message: `Parse error: ${error.message}`,
        severity: 'error'
      });
    }
    result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
    return result;
  }
  static parseContent(content) {
    const lines = content.split('\n').map(line => line.trim());
    const parsed = {
      version: '',
      nodes: [],
      edges: []
    };
    let currentSection = 'header';
    let currentNode = null;
    let currentProps = {};
    let propsDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.startsWith('#'))
        continue;
      if (line === '---NODES---') {
        currentSection = 'nodes';
        continue;
      }
      if (line === '---EDGES---') {
        currentSection = 'edges';
        continue;
      }
      if (line === '---END---') {
        if (currentNode) {
          if (Object.keys(currentProps).length > 0) {
            currentNode.props = currentProps;
          }
          parsed.nodes.push(currentNode);
        }
        break;
      }
      if (currentSection === 'header') {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (key === 'version') {
          parsed.version = value;
        }
        else if (key === 'checksum') {
          parsed.checksum = value;
        }
        else if (key === 'metadata') {
          parsed.metadata = {};
        }
        continue;
      }
      if (currentSection === 'nodes') {
        if (!line.startsWith(' ') && line.endsWith(':')) {
          if (currentNode) {
            if (Object.keys(currentProps).length > 0) {
              currentNode.props = currentProps;
            }
            parsed.nodes.push(currentNode);
          }
          currentNode = {
            id: line.slice(0, -1),
            type: '',
            props: {}
          };
          currentProps = {};
          propsDepth = 0;
          continue;
        }
        if (currentNode && line.startsWith('  ')) {
          const [key, ...valueParts] = line.substring(2).split(':');
          const value = valueParts.join(':').trim();
          if (key === 'type') {
            currentNode.type = value;
          }
          else if (key === 'inputs') {
            currentNode.inputs = this.parseArrayValue(value);
          }
          else if (key === 'props') {
            propsDepth = 1;
          }
          else if (propsDepth > 0 && line.startsWith('    ')) {
            const propKey = key;
            currentProps[propKey] = this.parseValue(value);
          }
        }
        continue;
      }
      if (currentSection === 'edges') {
        if (line.includes(' -> ')) {
          const [source, target] = line.split(' -> ').map(s => s.trim());
          parsed.edges.push({ source, target });
        }
        continue;
      }
    }
    return parsed;
  }
  static parseValue(value) {
    if (!value)
      return null;
    if (value.startsWith('[') && value.endsWith(']')) {
      return this.parseArrayValue(value);
    }
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        return JSON.parse(value);
      }
      catch {
        return value;
      }
    }
    if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith('\'') && value.endsWith('\''))) {
      return value.slice(1, -1);
    }
    if (/^\d+\.?\d*$/.test(value)) {
      return parseFloat(value);
    }
    if (value === 'true')
      return true;
    if (value === 'false')
      return false;
    return value;
  }
  static parseArrayValue(value) {
    if (!value.startsWith('[') || !value.endsWith(']')) {
      return [];
    }
    const content = value.slice(1, -1).trim();
    if (!content)
      return [];
    return content.split(',').map(item => this.parseValue(item.trim()));
  }
  static validateStructure(parsed, result) {
    if (!parsed.version) {
      result.errors.push({
        type: 'schema',
        message: 'Missing required version field',
        severity: 'error'
      });
    }
    else if (!this.SUPPORTED_VERSIONS.includes(parsed.version)) {
      result.errors.push({
        type: 'schema',
        message: `Unsupported version: ${parsed.version}. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`,
        severity: 'error'
      });
    }
    if (parsed.nodes.length === 0) {
      result.errors.push({
        type: 'schema',
        message: 'Graph must contain at least one node',
        severity: 'error'
      });
    }
    parsed.nodes.forEach(node => {
      if (!node.id) {
        result.errors.push({
          type: 'schema',
          message: 'Node missing required id field',
          severity: 'error'
        });
      }
      if (!node.type) {
        result.errors.push({
          type: 'schema',
          message: `Node ${node.id} missing required type field`,
          nodeId: node.id,
          severity: 'error'
        });
      }
      else if (!this.VALID_NODE_TYPES.includes(node.type)) {
        result.errors.push({
          type: 'schema',
          message: `Node ${node.id} has invalid type: ${node.type}`,
          nodeId: node.id,
          severity: 'error'
        });
      }
      if (node.id && !/^[a-zA-Z0-9_-]+$/.test(node.id)) {
        result.errors.push({
          type: 'schema',
          message: `Node ID ${node.id} contains invalid characters. Use only alphanumeric, underscore, and hyphen.`,
          nodeId: node.id,
          severity: 'error'
        });
      }
    });
  }
  static validateSemantics(parsed, result) {
    const nodeIds = new Set(parsed.nodes.map(n => n.id));
    const duplicates = parsed.nodes
      .map(n => n.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index);
    duplicates.forEach(id => {
      result.errors.push({
        type: 'semantic',
        message: `Duplicate node ID: ${id}`,
        nodeId: id,
        severity: 'error'
      });
    });
    parsed.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        result.errors.push({
          type: 'semantic',
          message: `Edge references non-existent source node: ${edge.source}`,
          severity: 'error'
        });
      }
      if (!nodeIds.has(edge.target)) {
        result.errors.push({
          type: 'semantic',
          message: `Edge references non-existent target node: ${edge.target}`,
          severity: 'error'
        });
      }
    });
    parsed.nodes.forEach(node => {
      if (node.inputs) {
        node.inputs.forEach(inputId => {
          if (!nodeIds.has(inputId)) {
            result.errors.push({
              type: 'semantic',
              message: `Node ${node.id} references non-existent input: ${inputId}`,
              nodeId: node.id,
              severity: 'error'
            });
          }
        });
      }
    });
    this.detectCycles(parsed, result);
    this.validateNodeProperties(parsed, result);
  }
  static detectCycles(parsed, result) {
    const nodeMap = new Map(parsed.nodes.map(n => [n.id, n]));
    const visited = new Set();
    const recursionStack = new Set();
    const dfs = (nodeId, path) => {
      if (recursionStack.has(nodeId)) {
        result.errors.push({
          type: 'semantic',
          message: `Cycle detected: ${path.join(' -> ')} -> ${nodeId}`,
          nodeId: nodeId,
          severity: 'error'
        });
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }
      visited.add(nodeId);
      recursionStack.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (node?.inputs) {
        for (const inputId of node.inputs) {
          if (dfs(inputId, [...path, nodeId])) {
            return true;
          }
        }
      }
      recursionStack.delete(nodeId);
      return false;
    };
    for (const node of parsed.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }
  }
  static validateNodeProperties(parsed, result) {
    parsed.nodes.forEach(node => {
      switch (node.type) {
      case 'WeightedChoice':
      case 'WeightedAdvanced':
        if (!node.props?.choices || !Array.isArray(node.props.choices)) {
          result.errors.push({
            type: 'schema',
            message: `${node.type} node ${node.id} missing required choices array`,
            nodeId: node.id,
            severity: 'error'
          });
        }
        else {
          node.props.choices.forEach((choice, index) => {
            if (typeof choice.value !== 'string') {
              result.errors.push({
                type: 'schema',
                message: `${node.type} node ${node.id} choice ${index} missing value`,
                nodeId: node.id,
                severity: 'error'
              });
            }
            if (typeof choice.weight !== 'number' || choice.weight < 0) {
              result.errors.push({
                type: 'schema',
                message: `${node.type} node ${node.id} choice ${index} has invalid weight`,
                nodeId: node.id,
                severity: 'error'
              });
            }
          });
        }
        break;
      case 'SetVariable':
      case 'GetVariable':
        if (!node.props?.key) {
          result.errors.push({
            type: 'schema',
            message: `${node.type} node ${node.id} missing required key property`,
            nodeId: node.id,
            severity: 'error'
          });
        }
        break;
      case 'Include':
        if (!node.props?.name) {
          result.errors.push({
            type: 'schema',
            message: `Include node ${node.id} missing required name property`,
            nodeId: node.id,
            severity: 'error'
          });
        }
        break;
      }
    });
  }
  static checkOptimizations(parsed, result) {
    const connectedNodes = new Set();
    parsed.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    parsed.nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && (!node.inputs || node.inputs.length === 0)) {
        result.warnings.push({
          type: 'optimization',
          message: `Node ${node.id} appears to be isolated`,
          suggestion: 'Consider connecting this node or removing it',
          nodeId: node.id
        });
      }
    });
    const hasOutputNode = parsed.nodes.some(node => node.type === 'Output');
    if (!hasOutputNode) {
      result.warnings.push({
        type: 'best-practice',
        message: 'Graph has no Output nodes',
        suggestion: 'Add at least one Output node to generate results'
      });
    }
    this.checkReachability(parsed, result);
  }
  static checkReachability(parsed, result) {
    const nodeMap = new Map(parsed.nodes.map(n => [n.id, n]));
    const reachable = new Set();
    const rootNodes = parsed.nodes.filter(node => !node.inputs || node.inputs.length === 0);
    const dfs = (nodeId) => {
      if (reachable.has(nodeId))
        return;
      reachable.add(nodeId);
      parsed.nodes.forEach(node => {
        if (node.inputs?.includes(nodeId)) {
          dfs(node.id);
        }
      });
    };
    rootNodes.forEach(node => dfs(node.id));
    parsed.nodes.forEach(node => {
      if (!reachable.has(node.id)) {
        result.warnings.push({
          type: 'optimization',
          message: `Node ${node.id} is unreachable from root nodes`,
          suggestion: 'Ensure this node is connected to the graph flow',
          nodeId: node.id
        });
      }
    });
  }
}
exports.FormatValidator = FormatValidator;
FormatValidator.SUPPORTED_VERSIONS = ['1.0.0'];
FormatValidator.REQUIRED_SECTIONS = ['---NODES---', '---END---'];
FormatValidator.VALID_NODE_TYPES = graphSchema_1.NodeTypeEnum.options;
function validateFormat(content) {
  return FormatValidator.validate(content);
}
function isValidFormat(content) {
  const result = validateFormat(content);
  return result.isValid;
}
//# sourceMappingURL=validator.js.map