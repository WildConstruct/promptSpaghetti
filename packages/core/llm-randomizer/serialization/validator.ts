// Epic 12 - LLM Agent Randomizer System
// Story 12.1 - Serialization Format Design
// Validation system for LLM-generated graph format
import { NodeTypeEnum } from '../../graphSchema';


export interface ValidationResult { isValid: boolean;
  errors: ValidationError;
  warnings: ValidationWarning }



export interface ValidationError { type: 'syntax' | 'semantic' | 'schema';
  message: string;
  line?: number;
  column?: number;
  nodeId?: string;
  severity: 'error' | 'warning' }




export interface ValidationWarning { type: 'optimization' | 'compatibility' | 'best-practice' }
  message: string;
  suggestion?: string;
  nodeId?: string;




export interface ParsedGraph { version: string;
  checksum?: string;
  metadata?: Record<string, any>;
  nodes: ParsedNode;
  edges: ParsedEdge }



export interface ParsedNode { id: string;
  type: string;
  props?: Record<string, any>;
  inputs?: string }



export interface ParsedEdge { source: string;
  target: string }

export class FormatValidator {};
    try { // Parse the content
      const parsed = this.parseContent(content);
      // Validate structure
      this.validateStructure(parsed, result);
      // Validate semantics
      this.validateSemantics(parsed, result);
      // Check for optimizations
      this.checkOptimizations(parsed, result) } catch (error) { result.isValid = false;
      result.errors.push({)
  type: 'syntax' }
        message: `Parse error: ${error.message}`}

  severity: 'error';
  });
    result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
    return result;
  /**
   * Parse the serialized content into structured data
   */
  private static parseContent(content: string): ParsedGraph { const lines = content.split('\n');
  const parsed: ParsedGraph = {
  version: ''
  nodes: []
  edges: [] }
};
    let currentSection = 'header';
    let currentNode: Partial<ParsedNode> | null = null;
    let currentProps: Record<string, any> = {};
    let propsDepth = 0;
    for (let i = 0; i < lines.length; i++) { const rawLine = lines[i];
  const trimmedLine = rawLine.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) continue; // Skip empty lines and comments
  // Detect section boundaries
  if (trimmedLine === '---NODES---') {
  currentSection = 'nodes';
  continue;
  if (trimmedLine === '---EDGES---') {
  currentSection = 'edges';
  continue;
  if (trimmedLine === '---END---') {
  if (currentNode) {
  if (Object.keys(currentProps).length > 0) {
  currentNode.props = currentProps;
  parsed.nodes.push(currentNode as ParsedNode);
  break;
  // Parse header section
  if (currentSection === 'header') {
  const [key, ...valueParts] = trimmedLine.split(':');
  const value = valueParts.join(':').trim();
  if (key === 'version') {
  parsed.version = value } else if (key === 'checksum') { parsed.checksum = value } else if (key === 'metadata') {
          parsed.metadata = {};
        continue;
      // Parse nodes section
      if (currentSection === 'nodes') { // Check if this is a new node (no leading whitespace and ends with colon)
        if (!rawLine.startsWith(' ') && trimmedLine.endsWith(':')) {
          // Save previous node
          if (currentNode) {
            if (Object.keys(currentProps).length > 0) {
              currentNode.props = currentProps;
            parsed.nodes.push(currentNode as ParsedNode);
          // Start new node
          currentNode = {
            id: trimmedLine.slice(0, -1), // Remove colon
            type: '' }
            props: {}
          };
          currentProps = {};
          propsDepth = 0;
          continue;
        // Parse node properties
        if (currentNode && rawLine.startsWith('  ')) { const propLine = rawLine.substring(2);
  const [key, ...valueParts] = propLine.split(':');
  const value = valueParts.join(':').trim();
  if (key.trim() === 'type') {
  currentNode.type = value } else if (key.trim() === 'inputs') { currentNode.inputs = this.parseArrayValue(value) } else if (key.trim() === 'props') { propsDepth = 1 } else if (propsDepth > 0 && rawLine.startsWith('    ')) {
            // Property under props
            const propKey = key.trim();
            currentProps[propKey] = this.parseValue(value);
        continue;
      // Parse edges section
      if (currentSection === 'edges') {
        if (trimmedLine.includes(' -> ')) {
          const [source, target] = trimmedLine.split(' -> ').map(s => s.trim());
          parsed.edges.push({ source, target });
        continue;
    return parsed;
  /**
   * Parse a value from YAML-like format
   */
  private static parseValue(value: string): any {
    if (!value) return null;
    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      return this.parseArrayValue(value);
    // Handle objects
    if (value.startsWith('{') && value.endsWith('}')) { try {
        return JSON.parse(value) } catch { return value;
  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
  (value.startsWith('\'') && value.endsWith('\''))) {
  return value.slice(1, -1);
  // Handle numbers
  if (/^\d+\.?\d*$/.test(value)) {
  return parseFloat(value);
  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
  /**
  * Parse array value from string representation
  */
  private static parseArrayValue(value: string): any {,
  if (!value.startsWith('[') || !value.endsWith(']')) {
  return [];
  const content = value.slice(1, -1).trim();
  if (!content) return [];
  return content.split(',').map(item => this.parseValue(item.trim()));
  /**
  * Validate overall structure and format
  */
  private static validateStructure(parsed: ParsedGraph, result: ValidationResult): void {,
  // Check version
  if (!parsed.version) {
  result.errors.push({)
  type: 'schema',
  message: 'Missing required version field',
  severity: 'error' }
});
 else if (!this.SUPPORTED_VERSIONS.includes(parsed.version)) { result.errors.push({)
  type: 'schema' }
        message: `Unsupported version: ${parsed.version}. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`}
},
  severity: 'error';
  });
    // Check nodes
    if (parsed.nodes.length === 0) { result.errors.push({)
  type: 'schema',
  message: 'Graph must contain at least one node',
  severity: 'error' }
});
    // Validate node structure
    parsed.nodes.forEach(node => { )
  if (!node.id) {
  result.errors.push({)
  type: 'schema',
  message: 'Node missing required id field',
  severity: 'error' }
});
      if (!node.type) { result.errors.push({)
  type: 'schema' }
          message: `Node ${node.id} missing required type field`}
},
  nodeId: node.id,
          severity: 'error';
  });
 else if (!this.VALID_NODE_TYPES.includes(node.type as any)) { result.errors.push({)
  type: 'schema' }
          message: `Node ${node.id} has invalid type: ${node.type}`}
},
  nodeId: node.id,
          severity: 'error';
  });
      // Validate node ID format
      if (node.id && !/^[a-zA-Z0-9_-]+$/.test(node.id)) { result.errors.push({)
  type: 'schema' }
          message: `Node ID ${node.id} contains invalid characters. Use only alphanumeric, underscore, and hyphen.`}
},
  nodeId: node.id,
          severity: 'error';
  });
    });
  /**
   * Validate semantic correctness
   */
  private static validateSemantics(parsed: ParsedGraph, result: ValidationResult): void { const nodeIds = new Set(parsed.nodes.map(n => n.id));
    // Check for duplicate node IDs
    const duplicates = parsed.nodes;
      .map(n => n.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index);
    duplicates.forEach(id => {)
  result.errors.push({)
  type: 'semantic' }
        message: `Duplicate node ID: ${id}`}
},
  nodeId: id,
        severity: 'error';
  });
    });
    // Validate edge references
    parsed.edges.forEach(edge => { )
  if (!nodeIds.has(edge.source)) {
        result.errors.push({)
  type: 'semantic' }
          message: `Edge references non-existent source node: ${edge.source}`}
},
  severity: 'error';
  });
      if (!nodeIds.has(edge.target)) { result.errors.push({)
  type: 'semantic' }
          message: `Edge references non-existent target node: ${edge.target}`}
},
  severity: 'error';
  });
    });
    // Validate node input references
    parsed.nodes.forEach(node => { )
  if (node.inputs) {
        node.inputs.forEach(inputId => {)
  if (!nodeIds.has(inputId)) {
            result.errors.push({)
  type: 'semantic' }
              message: `Node ${node.id} references non-existent input: ${inputId}`}
},
  nodeId: node.id,
              severity: 'error';
  });
        });
    });
    // Check for cycles
    this.detectCycles(parsed, result);
    // Validate node-specific properties
    this.validateNodeProperties(parsed, result);
  /**
   * Detect cycles in the graph
   */
  private static detectCycles(parsed: ParsedGraph, result: ValidationResult): void { const nodeMap = new Map(parsed.nodes.map(n => [n.id, n]));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const dfs = (nodeId: string, path: string): boolean => {
      if (recursionStack.has(nodeId)) {
        result.errors.push({)
  type: 'semantic' }
          message: `Cycle detected: ${path.join(' -> ')} -> ${nodeId}`}

  nodeId: nodeId
          severity: 'error';
  });
        return true;
      if (visited.has(nodeId)) { return false;
      visited.add(nodeId);
      recursionStack.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (node?.inputs) {
        for (const inputId of node.inputs) {
          if (dfs(inputId, [...path, nodeId])) {
            return true;
      recursionStack.delete(nodeId);
      return false };
    for (const node of parsed.nodes) { if (!visited.has(node.id)) {
        dfs(node.id, []);
  /**
   * Validate node-specific properties
   */
  private static validateNodeProperties(parsed: ParsedGraph, result: ValidationResult): void {
    parsed.nodes.forEach(node => {)
  switch (node.type) {
      case 'WeightedChoice':
      case 'WeightedAdvanced':
        if (!node.props?.choices || !Array.isArray(node.props.choices)) {
          result.errors.push({)
  type: 'schema' }
            message: `${node.type} node ${node.id} missing required choices array`}

  nodeId: node.id
            severity: 'error';
  });
 else { node.props.choices.forEach((choice: any, index: number) => {
            if (typeof choice.value !== 'string') {
              result.errors.push({)
  type: 'schema' }
                message: `${node.type} node ${node.id} choice ${index} missing value`}

  nodeId: node.id
                severity: 'error';
  });
            if (typeof choice.weight !== 'number' || choice.weight < 0) { result.errors.push({)
  type: 'schema' }
                message: `${node.type} node ${node.id} choice ${index} has invalid weight`}
},
  nodeId: node.id,
                severity: 'error';
  });
          });
        break;
      case 'SetVariable':
      case 'GetVariable':
        if (!node.props?.key) { result.errors.push({)
  type: 'schema' }
            message: `${node.type} node ${node.id} missing required key property`}
},
  nodeId: node.id,
            severity: 'error';
  });
        break;
      case 'Include':
        if (!node.props?.name) { result.errors.push({)
  type: 'schema' }
            message: `Include node ${node.id} missing required name property`}
},
  nodeId: node.id,
            severity: 'error';
  });
        break;
    });
  /**
   * Check for optimization opportunities
   */
  private static checkOptimizations(parsed: ParsedGraph, result: ValidationResult): void { // Check for isolated nodes
    const connectedNodes = new Set<string>();
    parsed.edges.forEach(edge => {)
  connectedNodes.add(edge.source);
      connectedNodes.add(edge.target) });
    parsed.nodes.forEach(node => { )
  if (!connectedNodes.has(node.id) && (!node.inputs || node.inputs.length === 0)) {
        result.warnings.push({)
  type: 'optimization' }
          message: `Node ${node.id} appears to be isolated`}

  suggestion: 'Consider connecting this node or removing it'
          nodeId: node.id;
  });
    });
    // Check for missing output nodes
    const hasOutputNode = parsed.nodes.some(node => node.type === 'Output');
    if (!hasOutputNode) { result.warnings.push({)
  type: 'best-practice'
  message: 'Graph has no Output nodes'
  suggestion: 'Add at least one Output node to generate results' }
});
    // Check for unreachable nodes
    this.checkReachability(parsed, result);
  /**
   * Check for unreachable nodes
   */
  private static checkReachability(parsed: ParsedGraph, result: ValidationResult): void { const nodeMap = new Map(parsed.nodes.map(n => [n.id, n]));
  const reachable = new Set<string>();
  // Find all root nodes (no inputs)
  const rootNodes = parsed.nodes.filter(node => !node.inputs || node.inputs.length === 0);
  const dfs = (nodeId: string) => { }
  if (reachable.has(nodeId)) return;
  reachable.add(nodeId);
  // Find all nodes that depend on this node
  parsed.nodes.forEach(node => { )
  if (node.inputs?.includes(nodeId)) {
  dfs(node.id) });
    };
    // Mark all reachable nodes
    rootNodes.forEach(node => dfs(node.id));
    // Check for unreachable nodes
    parsed.nodes.forEach(node => { )
  if (!reachable.has(node.id)) {
        result.warnings.push({)
  type: 'optimization' }
          message: `Node ${node.id} is unreachable from root nodes`}

  suggestion: 'Ensure this node is connected to the graph flow'
          nodeId: node.id;
  });
    });
/**
 * Utility function for easy validation
 */
export function validateFormat(content: string): ValidationResult {
  return FormatValidator.validate(content);
/**
 * Check if content is valid (no errors)
 */
export function isValidFormat(content: string): boolean {
  const result = validateFormat(content);
  return result.isValid;