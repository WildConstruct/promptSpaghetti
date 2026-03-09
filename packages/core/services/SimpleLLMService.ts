// Simplified LLM Service for Epic 2 MVP
// This version provides the essential LLM functionality without all dependencies
//
// DEPRECATED:
// `SimpleLLMService` is a legacy browser-config/localStorage surface kept for
// compatibility with older UI components. New work should use the API-backed
// client from `ApiLLMService.ts` / `services/llm`.

import { Node, Edge } from 'reactflow';

type SimpleNodeType =
  | 'textBlock'
  | 'variable'
  | 'output'
  | 'weightedChoice'
  | 'conditional'
  | 'merge'
  | 'concat';

interface WeightedChoiceOption {
  text: string;
  weight: number;
  metadata?: Record<string, unknown>;
}

interface GraphNodeData {
  label: string;
  content: string;
  type: SimpleNodeType;
  source?: string;
  confidence?: number;
  variableName?: string;
  suggestions?: string[];
  metadata?: Record<string, unknown>;
  options?: WeightedChoiceOption[];
  mergeStrategy?: string;
  separator?: string;
  preserveFormatting?: boolean;
  preview?: string;
  condition?: string;
  intelligenceTags?: string[];
}

type GraphNode = Node<GraphNodeData>;
type GraphEdge = Edge<Record<string, unknown> | undefined>;

export interface LLMConfig {
  apiKey?: string;
  provider?: 'openrouter' | 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ParseOptions {
  mode: 'standard' | 'llm-enhanced';
  preserveVariables?: boolean;
  autoConnect?: boolean;
}

interface GraphIntelligence {
  detectedVariables: string[];
  hasChoices: boolean;
  structureType: 'branching' | 'templated' | 'linear';
  confidence: number;
}

export interface ParseResultMetadata {
  parserMode: 'standard' | 'llm-enhanced';
  parseTime: number;
  llmUsed: boolean;
  model?: string;
  cost?: number;
  intelligence?: GraphIntelligence;
}

export interface ParseResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: ParseResultMetadata;
}

// Simple prompt parser that mimics LLM behavior for testing
function standardParse(prompt: string): ParseResult {
  const start = Date.now();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Split prompt into segments
  const segments = prompt.split(/[.!?]+/).filter(s => s.trim());

  segments.forEach((segment, index) => {
    const nodeId = `node-${index}`;

    // Detect variables like {character} or [setting]
    const hasVariable = /\{[^}]+\}|\[[^\]]+\]/.test(segment);

    const nodeData: GraphNodeData = {
      label: segment.trim(),
      content: segment.trim(),
      type: hasVariable ? 'variable' : 'textBlock'
    };

    nodes.push({
      id: nodeId,
      type: nodeData.type,
      position: { x: 100 + index * 200, y: 100 + (index % 2) * 100 },
      data: nodeData
    });

    // Connect to previous node
    if (index > 0) {
      edges.push({
        id: `edge-${index}`,
        source: `node-${index - 1}`,
        target: nodeId,
        type: 'default'
      });
    }
  });

  // Add output node
  const outputId = `output-${nodes.length}`;
  nodes.push({
    id: outputId,
    type: 'output',
    position: { x: 100 + nodes.length * 200, y: 150 },
    data: {
      label: 'Output',
      content: '',
      type: 'output'
    }
  });

  if (nodes.length > 1) {
    edges.push({
      id: `edge-output`,
      source: nodes[nodes.length - 2].id,
      target: outputId,
      type: 'default'
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      parserMode: 'standard',
      parseTime: Date.now() - start,
      llmUsed: false
    }
  };
}

// Molecular chunk interface for LLM parsing
interface MolecularChunk {
  text: string;
  pos: string; // Part of speech
  description: string;
  semanticRole?: string;
}

interface SemanticGroup {
  text: string;
  chunks: MolecularChunk[];
  semanticRole: string;
  confidence: number;
}

interface ApiGraphNode {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

interface ApiGraphEdge {
  id?: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface ApiGraphResponse {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const SIMPLE_NODE_TYPES: ReadonlySet<SimpleNodeType> = new Set([
  'textBlock',
  'variable',
  'output',
  'weightedChoice',
  'conditional',
  'merge',
  'concat'
]);

const toSimpleNodeType = (value: unknown): SimpleNodeType => {
  if (typeof value !== 'string') {
    return 'textBlock';
  }
  const lower = value.toLowerCase();
  return SIMPLE_NODE_TYPES.has(lower as SimpleNodeType)
    ? (lower as SimpleNodeType)
    : 'textBlock';
};

const ensureString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const ensureRecord = (value: unknown): Record<string, unknown> | undefined =>
  isRecord(value) ? value : undefined;

function normaliseApiGraph(raw: unknown): ApiGraphResponse | null {
  if (!isRecord(raw)) {
    return null;
  }

  const rawNodes = raw.nodes;
  const rawEdges = raw.edges;

  if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
    return null;
  }

  const nodes: ApiGraphNode[] = [];
  for (const node of rawNodes) {
    if (!isRecord(node)) {
      return null;
    }
    const id = ensureString(node.id);
    if (!id) {
      return null;
    }
    nodes.push({
      id,
      type: ensureString(node.type, 'textBlock'),
      data: ensureRecord(node.data)
    });
  }

  const edges: ApiGraphEdge[] = [];
  for (const edge of rawEdges) {
    if (!isRecord(edge)) {
      return null;
    }
    const source = ensureString(edge.source);
    const target = ensureString(edge.target);
    if (!source || !target) {
      return null;
    }
    edges.push({
      id: typeof edge.id === 'string' ? edge.id : undefined,
      source,
      target,
      type: typeof edge.type === 'string' ? edge.type : undefined,
      data: ensureRecord(edge.data)
    });
  }

  return { nodes, edges };
}

function mapApiNodeToGraphNode(
  apiNode: ApiGraphNode,
  index: number
): GraphNode {
  const data = apiNode.data ?? {};
  const label =
    'label' in data && typeof data.label === 'string' ? data.label : '';
  const content =
    'content' in data && typeof data.content === 'string'
      ? data.content
      : label;

  let metadata: Record<string, unknown> | undefined;
  if ('metadata' in data) {
    const rawMetadata = (data as { metadata?: unknown }).metadata;
    metadata = ensureRecord(rawMetadata);
  }

  const nodeData: GraphNodeData = {
    label,
    content,
    type: toSimpleNodeType(apiNode.type),
    metadata
  };

  if ('variableName' in data && typeof data.variableName === 'string') {
    nodeData.variableName = data.variableName;
  }

  if ('options' in data && Array.isArray(data.options)) {
    const options: WeightedChoiceOption[] = data.options
      .map(option => {
        if (!isRecord(option)) return null;
        const text = ensureString(option.text);
        if (!text) return null;
        const weightRaw = option.weight;
        const weight =
          typeof weightRaw === 'number' && Number.isFinite(weightRaw)
            ? weightRaw
            : 1;
        const metadata = ensureRecord(option.metadata);
        const weightedOption: WeightedChoiceOption = {
          text,
          weight
        };
        if (metadata && Object.keys(metadata).length > 0) {
          weightedOption.metadata = metadata;
        }
        return weightedOption;
      })
      .filter((opt): opt is WeightedChoiceOption => opt !== null);
    if (options.length > 0) {
      nodeData.options = options;
    }
  }

  return {
    id: apiNode.id,
    type: nodeData.type,
    position: { x: 120 + index * 180, y: 150 },
    data: nodeData
  };
}

function mapApiEdgeToGraphEdge(
  apiEdge: ApiGraphEdge,
  index: number
): GraphEdge {
  return {
    id: apiEdge.id ?? `edge-${index}`,
    source: apiEdge.source,
    target: apiEdge.target,
    type: apiEdge.type ?? 'default',
    data: apiEdge.data
  };
}

function extractMessageContent(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }
  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }
  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) {
    return null;
  }
  const message = firstChoice.message;
  if (!isRecord(message)) {
    return null;
  }
  const content = message.content;
  return typeof content === 'string' ? content : null;
}

// Call OpenRouter API for actual LLM parsing
async function callOpenRouterAPI(
  prompt: string,
  config: LLMConfig
): Promise<ParseResult | null> {
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const systemPrompt = `You are a prompt parser that breaks down complex prompts into semantic nodes.
Analyze the given prompt and return a JSON structure with nodes and edges.
Each node should represent a semantic unit (phrase, concept, or variable).
Edges should connect related nodes.

Return JSON in this format:
{
  "nodes": [
    {
      "id": "node-0",
      "type": "textBlock",
      "data": {
        "label": "text content",
        "content": "text content",
        "metadata": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-0",
      "source": "node-0",
      "target": "node-1",
      "type": "default"
    }
  ]
}

Identify variables (enclosed in {}, [], or <>), choices (or patterns), and maintain the original text structure.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://prompt-spaghetti.app',
        'X-Title': 'Prompt Spaghetti Parser'
      },
      body: JSON.stringify({
        model: config.model || 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Parse this prompt into semantic nodes: "${prompt}"`
          }
        ],
        temperature: 0.3,
        max_tokens: config.maxTokens || 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as unknown;
    const content = extractMessageContent(payload);
    if (!content) {
      throw new Error('OpenRouter response missing content');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('OpenRouter response content is not valid JSON');
    }

    const normalised = normaliseApiGraph(parsed);
    if (!normalised) {
      throw new Error('OpenRouter response does not match expected schema');
    }

    const nodes = normalised.nodes.map(mapApiNodeToGraphNode);
    const edges = normalised.edges.map(mapApiEdgeToGraphEdge);

    if (!nodes.some(node => node.type === 'output')) {
      const outputId = `output-${nodes.length}`;
      const outputNode: GraphNode = {
        id: outputId,
        type: 'output',
        position: { x: 120 + nodes.length * 180, y: 220 },
        data: {
          label: 'Generated Output',
          content: '',
          type: 'output'
        }
      };
      nodes.push(outputNode);

      if (nodes.length > 1) {
        const previous = nodes[nodes.length - 2];
        edges.push({
          id: `edge-${edges.length}`,
          source: previous.id,
          target: outputId,
          type: 'default'
        });
      }
    }

    return {
      nodes,
      edges,
      metadata: {
        parserMode: 'llm-enhanced',
        parseTime: 0,
        llmUsed: true,
        model: config.model || 'openai/gpt-3.5-turbo',
        cost: 0.0002
      }
    };
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return null;
  }
}

// Enhanced LLM parse with molecular chunking and rich metadata
async function llmEnhancedParse(
  prompt: string,
  config: LLMConfig
): Promise<ParseResult> {
  if (config.apiKey && config.apiKey !== 'demo') {
    const apiResult = await callOpenRouterAPI(prompt, config);
    if (apiResult) {
      return apiResult;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 800));

  const chunks = performMolecularChunking(prompt);
  const semanticGroups = groupChunksIntoSemanticUnits(chunks);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let previousNodeId: string | null = null;
  let nodeCounter = 0;
  const detectedVariables = new Set<string>();
  let hasChoices = false;
  let hasBranching = false;

  const variablePattern = /\{([^}]+)\}|\[([^\]]+)\]|<([^>]+)>/g;

  semanticGroups.forEach((group, groupIndex) => {
    const nodeId = `node-${nodeCounter++}`;
    let nodeType: SimpleNodeType = 'textBlock';

    const nodeData: GraphNodeData = {
      label: group.text,
      content: group.text,
      type: nodeType,
      metadata: {
        semanticRole: group.semanticRole,
        confidence: group.confidence,
        chunkCount: group.chunks.length
      }
    };

    const variableMatches = Array.from(group.text.matchAll(variablePattern));
    if (variableMatches.length > 0) {
      const firstMatch = variableMatches[0];
      const rawName =
        firstMatch[1] || firstMatch[2] || firstMatch[3] || firstMatch[0];
      const variableName = rawName
        .replace(/[{}<>]/g, '')
        .replace(/\[|\]/g, '')
        .trim();
      if (variableName) {
        nodeType = 'variable';
        nodeData.type = 'variable';
        nodeData.variableName = variableName;
        nodeData.suggestions = generateSmartSuggestions(
          variableName,
          group.chunks
        );
        detectedVariables.add(variableName);
      }
    }

    const choiceOptions = extractOptionsFromChunks(group.chunks);
    if (choiceOptions.length > 1 || group.semanticRole === 'choice') {
      nodeType = 'weightedChoice';
      nodeData.type = 'weightedChoice';
      nodeData.options = choiceOptions;
      hasChoices = true;
      hasBranching = true;
    }

    const hasConditional = group.chunks.some(
      chunk =>
        chunk.pos === 'conditional' || /\b(if|when|unless)\b/i.test(chunk.text)
    );

    if (hasConditional) {
      nodeType = 'conditional';
      nodeData.type = 'conditional';
      nodeData.condition = extractConditionFromChunks(group.chunks);
      hasBranching = true;
    }

    const position = calculateSmartPosition(
      nodes.length,
      nodeType,
      hasBranching
    );

    nodes.push({
      id: nodeId,
      type: nodeType,
      position,
      data: nodeData
    });

    if (previousNodeId) {
      const previousGroup = semanticGroups[groupIndex - 1];
      edges.push({
        id: `edge-${edges.length}`,
        source: previousNodeId,
        target: nodeId,
        type: nodeType === 'textBlock' ? 'default' : 'smoothstep',
        data: {
          label: getEdgeLabel(previousGroup, group),
          confidence: Math.min(previousGroup.confidence, group.confidence)
        }
      });
    }

    previousNodeId = nodeId;
  });

  if (nodes.length > 2 && hasBranching) {
    const mergeId = `merge-${nodeCounter++}`;
    const mergeNode: GraphNodeData = {
      label: 'Merge Paths',
      content: '',
      type: 'merge',
      mergeStrategy: 'intelligent'
    };

    nodes.push({
      id: mergeId,
      type: 'merge',
      position: calculateSmartPosition(nodes.length, 'merge', hasBranching),
      data: mergeNode
    });

    if (previousNodeId) {
      edges.push({
        id: `edge-${edges.length}`,
        source: previousNodeId,
        target: mergeId,
        type: 'smoothstep'
      });
    }
    previousNodeId = mergeId;
  }

  if (nodes.length > 1 && detectedVariables.size > 0) {
    const concatId = `concat-${nodeCounter++}`;
    const concatNode: GraphNodeData = {
      label: 'Assemble Output',
      content: '',
      type: 'concat',
      separator: ' ',
      preserveFormatting: true
    };

    nodes.push({
      id: concatId,
      type: 'concat',
      position: calculateSmartPosition(nodes.length, 'concat', hasBranching),
      data: concatNode
    });

    if (previousNodeId) {
      edges.push({
        id: `edge-${edges.length}`,
        source: previousNodeId,
        target: concatId,
        type: 'smoothstep'
      });
    }
    previousNodeId = concatId;
  }

  const outputId = `output-${nodeCounter}`;
  const outputNode: GraphNodeData = {
    label: 'Generated Output',
    content: '',
    type: 'output',
    preview: generatePreview(prompt, chunks),
    metadata: {
      totalChunks: chunks.length,
      semanticGroups: semanticGroups.length,
      complexity: calculateComplexity(chunks, semanticGroups)
    }
  };

  nodes.push({
    id: outputId,
    type: 'output',
    position: calculateSmartPosition(nodes.length, 'output', hasBranching),
    data: outputNode
  });

  if (previousNodeId) {
    edges.push({
      id: `edge-${edges.length}`,
      source: previousNodeId,
      target: outputId,
      type: 'smoothstep',
      data: {
        label: 'Final Output',
        confidence: 0.95
      }
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      parserMode: 'llm-enhanced',
      parseTime: 0,
      llmUsed: true,
      model: config.model || 'gpt-3.5-turbo',
      cost: 0.0002,
      intelligence: {
        detectedVariables: Array.from(detectedVariables),
        hasChoices,
        structureType: hasBranching
          ? 'branching'
          : detectedVariables.size > 0
            ? 'templated'
            : 'linear',
        confidence: Math.min(0.92, 0.6 + semanticGroups.length * 0.05)
      }
    }
  };
}

// Helper function: Perform molecular chunking with POS tagging
function performMolecularChunking(prompt: string): MolecularChunk[] {
  const chunks: MolecularChunk[] = [];

  // Tokenize into words and punctuation, but also capture whitespace
  // Updated pattern to keep compound terms like "8k", "3D", etc. together
  const tokens =
    prompt.match(
      /\{[^}]+\}|\[[^\]]+\]|<[^>]+>|\b\d+[a-zA-Z]+\b|\b[a-zA-Z]+\d+\b|\b\w+-\w+\b|\b\w+\b|\s+|[^\w\s]/g
    ) || [];

  tokens.forEach((token: string) => {
    // Skip pure whitespace tokens in chunk creation
    if (/^\s+$/.test(token)) {
      chunks.push({
        text: token,
        pos: 'whitespace',
        description: 'Whitespace',
        semanticRole: ''
      });
      return;
    }

    let pos = 'unknown';
    let description = '';
    let semanticRole = '';

    // Variable detection
    if (/^\{[^}]+\}$|^\[[^\]]+\]$|^<[^>]+>$/.test(token)) {
      pos = 'variable';
      description = 'User-defined variable placeholder';
      semanticRole = 'parameter';
    }
    // Technical specifications (8k, 4K, 3D, etc.)
    else if (/^\d+[kKmMgG]$|^[248]K$|^\d+D$/i.test(token)) {
      pos = 'technical-spec';
      description = 'Technical specification or resolution';
      semanticRole = 'modifier';
    }
    // Fashion/cinematic specific nouns
    else if (
      /^(model|gown|couture|fashion|editorial|tiger|palace|hall|ceiling|chandelier|floor|mirror|lighting|texture|fabric|engraving|filigree|lacquer|ornament|runway)$/i.test(
        token
      )
    ) {
      pos = 'domain-noun';
      description = `Fashion/cinematic domain noun`;
      semanticRole = 'entity';
    }
    // Common nouns
    else if (
      /^(character|person|place|location|object|thing|time|day|night|eyes|body|light|energy|detail|render|setting)$/i.test(
        token
      )
    ) {
      pos = 'noun';
      description = `Common noun identifying a ${token.toLowerCase()}`;
      semanticRole = 'entity';
    }
    // Hyphenated compound words and style descriptors
    else if (
      /\w+-\w+/.test(token) ||
      /^(hyper-real|cinematic|photoreal|editorial|regal|metallic|ornamental|intricate|translucent|baroque|golden|amber|warm|polished|dark-skinned|micro-detail)$/i.test(
        token
      )
    ) {
      pos = 'compound-descriptor';
      description = `Compound or style descriptor`;
      semanticRole = 'style';
    }
    // Color adjectives
    else if (
      /^(red|blue|green|yellow|black|white|dark-skinned|golden|amber|metallic)$/i.test(
        token
      )
    ) {
      pos = 'color';
      description = `Color descriptor`;
      semanticRole = 'modifier';
    }
    // Size/Physical adjectives
    else if (
      /^(tall|giant|gigantic|large|small|tiny|huge|micro|macro)$/i.test(token)
    ) {
      pos = 'size';
      description = `Size or scale descriptor`;
      semanticRole = 'modifier';
    }
    // General adjectives
    else if (
      /^(serene|beautiful|dark|bright|happy|sad|warm|perfect|vaulted)$/i.test(
        token
      )
    ) {
      pos = 'adjective';
      description = `Descriptive adjective modifying appearance or mood`;
      semanticRole = 'modifier';
    }
    // Action verbs
    else if (
      /^(walks|walking|move|moves|moving|shimmering|glowing|reflecting|embroidered|polished|sync)$/i.test(
        token
      )
    ) {
      pos = 'action-verb';
      description = `Action or movement verb`;
      semanticRole = 'action';
    }
    // State verbs
    else if (/^(is|are|was|were|has|have|had)$/i.test(token)) {
      pos = 'state-verb';
      description = `State or being verb`;
      semanticRole = 'state';
    }
    // General verbs
    else if (/^(run|walk|jump|create|make|do|say|think)$/i.test(token)) {
      pos = 'verb';
      description = `General action verb`;
      semanticRole = 'action';
    }
    // Conjunctions
    else if (/^(and|or|but|either|neither|nor)$/i.test(token)) {
      pos = 'conjunction';
      description = `Connecting word for choices or combinations`;
      semanticRole = 'connector';
    }
    // Prepositions
    else if (/^(in|on|at|with|by|for|from|to|of)$/i.test(token)) {
      pos = 'preposition';
      description = `Relational word indicating position or relationship`;
      semanticRole = 'relation';
    }
    // Conditionals
    else if (/^(if|when|unless|while|until)$/i.test(token)) {
      pos = 'conditional';
      description = `Conditional keyword introducing logic`;
      semanticRole = 'condition';
    }
    // Articles
    else if (/^(a|an|the)$/i.test(token)) {
      pos = 'article';
      description = `Article determining specificity`;
      semanticRole = 'determiner';
    }
    // Punctuation
    else if (/^[.,;:!?]$/.test(token)) {
      pos = 'punctuation';
      description = `Punctuation mark`;
      semanticRole = 'delimiter';
    }
    // Default to noun for unknown words
    else if (/^\w+$/.test(token)) {
      pos = 'noun';
      description = `Unclassified word, likely a noun or name`;
      semanticRole = 'entity';
    }

    chunks.push({
      text: token,
      pos,
      description,
      semanticRole
    });
  });

  return chunks;
}

// Helper function: Group molecular chunks into semantic units
function groupChunksIntoSemanticUnits(
  chunks: MolecularChunk[]
): SemanticGroup[] {
  const groups: SemanticGroup[] = [];

  let currentGroup: SemanticGroup = {
    text: '',
    chunks: [],
    semanticRole: 'descriptor',
    confidence: 1
  };

  const pushGroup = (): void => {
    const text = currentGroup.chunks
      .map(chunk => chunk.text)
      .join('')
      .trim();
    if (!text || /^[.,;:!?]+$/.test(text)) {
      currentGroup = {
        text: '',
        chunks: [],
        semanticRole: 'statement',
        confidence: 1
      };
      return;
    }

    currentGroup = {
      text,
      chunks: [...currentGroup.chunks],
      semanticRole: determineSemanticRole(currentGroup.chunks),
      confidence: currentGroup.confidence
    };
    groups.push(currentGroup);

    currentGroup = {
      text: '',
      chunks: [],
      semanticRole: 'statement',
      confidence: 1
    };
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    currentGroup.chunks.push(chunk);

    const nextChunk = chunks[i + 1];
    let shouldBreak = false;

    if (chunk.pos === 'punctuation' && /[.!?]/.test(chunk.text)) {
      shouldBreak = true;
    } else if (chunk.pos === 'punctuation' && chunk.text === ',' && nextChunk) {
      if (currentGroup.chunks.length > 5) {
        shouldBreak = true;
      }
    } else if (
      (chunk.text.toLowerCase() === 'model' ||
        chunk.text.toLowerCase() === 'person') &&
      nextChunk &&
      nextChunk.pos !== 'adjective' &&
      nextChunk.pos !== 'preposition'
    ) {
      shouldBreak = true;
    } else if (
      (chunk.pos === 'domain-noun' || chunk.pos === 'noun') &&
      nextChunk &&
      (nextChunk.pos === 'action-verb' || nextChunk.text === '.') &&
      currentGroup.chunks.length > 3
    ) {
      shouldBreak = true;
    } else if (chunk.pos === 'conjunction' && /^or$/i.test(chunk.text)) {
      currentGroup.chunks.pop();
      if (currentGroup.chunks.length > 0) {
        pushGroup();
      }
      groups.push({
        text: chunk.text,
        chunks: [chunk],
        semanticRole: 'choice',
        confidence: 1
      });
      currentGroup = {
        text: '',
        chunks: [],
        semanticRole: 'alternative',
        confidence: 1
      };
      continue;
    }

    if (shouldBreak) {
      pushGroup();
    }
  }

  if (currentGroup.chunks.length > 0) {
    pushGroup();
  }

  return groups;
}

// Helper to determine semantic role based on chunk types
function determineSemanticRole(chunks: MolecularChunk[]): string {
  const hasAdjective = chunks.some(c => c.pos === 'adjective');
  const hasNoun = chunks.some(c => c.pos === 'noun');
  const hasVerb = chunks.some(c => c.pos === 'verb');
  const hasPreposition = chunks.some(c => c.pos === 'preposition');

  if (hasAdjective && hasNoun) return 'descriptor';
  if (hasVerb) return 'action';
  if (hasPreposition) return 'relation';
  if (hasNoun) return 'entity';
  return 'statement';
}

// Helper function: Generate smart suggestions based on semantic analysis
function generateSmartSuggestions(
  varName: string,
  chunks: MolecularChunk[]
): string[] {
  const lowerName = varName.toLowerCase();

  // Context-aware suggestions
  const hasAdjective = chunks.some(c => c.pos === 'adjective');

  if (lowerName.includes('name') || lowerName.includes('character')) {
    return hasAdjective
      ? ['Brave Knight', 'Wise Sage', 'Mysterious Stranger', 'Young Hero']
      : ['Alice', 'Marcus', 'Elena', 'Kai'];
  }
  if (lowerName.includes('place') || lowerName.includes('location')) {
    return hasAdjective
      ? ['Enchanted Forest', 'Ancient Castle', 'Hidden Valley', 'Crystal Cave']
      : ['forest', 'castle', 'village', 'mountain'];
  }
  if (lowerName.includes('mood') || lowerName.includes('emotion')) {
    return ['joyful', 'melancholic', 'anxious', 'serene', 'excited'];
  }
  if (lowerName.includes('color')) {
    return ['crimson', 'azure', 'emerald', 'golden', 'obsidian'];
  }
  if (lowerName.includes('time')) {
    return ['dawn', 'noon', 'dusk', 'midnight', 'twilight'];
  }

  // Default contextual suggestions
  return ['option A', 'option B', 'option C', 'custom value'];
}

// Helper function: Extract options from molecular chunks
function extractOptionsFromChunks(
  chunks: MolecularChunk[]
): WeightedChoiceOption[] {
  const options: WeightedChoiceOption[] = [];
  let currentOption = '';

  chunks.forEach(chunk => {
    if (chunk.pos === 'conjunction' && /^(or|,)$/i.test(chunk.text)) {
      if (currentOption.trim()) {
        options.push({
          text: currentOption.trim(),
          weight: 1,
          metadata: { source: 'molecular_parsing' }
        });
        currentOption = '';
      }
    } else if (chunk.pos !== 'punctuation') {
      currentOption += (currentOption ? ' ' : '') + chunk.text;
    }
  });

  if (currentOption.trim()) {
    options.push({
      text: currentOption.trim(),
      weight: 1,
      metadata: { source: 'molecular_parsing' }
    });
  }

  if (options.length === 0) {
    const fallbackText = chunks
      .map(chunk => chunk.text)
      .join(' ')
      .trim();
    if (fallbackText) {
      options.push({ text: fallbackText, weight: 1 });
    }
  }

  if (options.length === 0) {
    options.push({ text: 'Option', weight: 1 });
  }

  const normalisedWeight = 1 / options.length;
  return options.map(option => ({
    text: option.text,
    weight: option.weight ?? normalisedWeight,
    metadata: option.metadata
  }));
}

// Helper function: Extract condition from chunks
function extractConditionFromChunks(chunks: MolecularChunk[]): string {
  const condStart = chunks.findIndex(c => c.pos === 'conditional');
  if (condStart >= 0) {
    return chunks
      .slice(condStart)
      .map(c => c.text)
      .join(' ');
  }
  return chunks.map(c => c.text).join(' ');
}

// Helper function: Calculate smart positioning for nodes
function calculateSmartPosition(
  index: number,
  nodeType: SimpleNodeType,
  hasBranching: boolean
): { x: number; y: number } {
  const baseX = 100;
  const baseY = 100;
  const xSpacing = hasBranching ? 300 : 250;
  const ySpacing = 150;

  if (nodeType === 'conditional' || nodeType === 'weightedChoice') {
    return {
      x: baseX + (index % 2) * xSpacing * 1.5,
      y: baseY + Math.floor(index / 2) * ySpacing * 1.3
    };
  }

  if (nodeType === 'merge' || nodeType === 'concat') {
    return {
      x: baseX + xSpacing * 2,
      y: baseY + index * ySpacing * 0.8
    };
  }

  if (nodeType === 'output') {
    return {
      x: baseX + xSpacing * 3,
      y: baseY + ySpacing * 2
    };
  }

  // Default positioning
  return {
    x: baseX + (index % 3) * xSpacing,
    y: baseY + Math.floor(index / 3) * ySpacing
  };
}

// Helper function: Get edge label based on semantic relationship
function getEdgeLabel(
  fromGroup: SemanticGroup,
  toGroup: SemanticGroup
): string {
  if (
    fromGroup.semanticRole === 'condition' &&
    toGroup.semanticRole === 'statement'
  ) {
    return 'then';
  }
  if (fromGroup.semanticRole === 'choice') {
    return 'select';
  }
  if (toGroup.semanticRole === 'template') {
    return 'fill';
  }
  return '';
}

// Helper function: Generate preview with molecular understanding
function generatePreview(prompt: string, chunks: MolecularChunk[]): string {
  const variables = chunks.filter(c => c.pos === 'variable');
  if (variables.length > 0) {
    return `Template with ${variables.length} variable${variables.length > 1 ? 's' : ''}: ${variables.map(v => v.text).join(', ')}`;
  }
  return prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
}

// Helper function: Calculate complexity score
function calculateComplexity(
  chunks: MolecularChunk[],
  groups: SemanticGroup[]
): number {
  const varCount = chunks.filter(c => c.pos === 'variable').length;
  const choiceCount = chunks.filter(
    c => c.pos === 'conjunction' && /or/i.test(c.text)
  ).length;
  const condCount = chunks.filter(c => c.pos === 'conditional').length;

  return Math.min(
    1.0,
    varCount * 0.2 + choiceCount * 0.3 + condCount * 0.4 + groups.length * 0.1
  );
}

/**
 * @deprecated Prefer the API-backed client from `ApiLLMService.ts`.
 * This class remains only for legacy UI compatibility during migration.
 */
export class SimpleLLMService {
  private config: LLMConfig;
  private enabled: boolean = false;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    // Check if API key is configured
    this.enabled = Boolean(
      config.apiKey || process.env.VITE_OPENROUTER_API_KEY
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    this.enabled = Boolean(
      this.config.apiKey || process.env.VITE_OPENROUTER_API_KEY
    );
  }

  async parse(
    prompt: string,
    options: ParseOptions = { mode: 'standard' }
  ): Promise<ParseResult> {
    const startTime = Date.now();

    if (options.mode === 'llm-enhanced' && this.enabled) {
      try {
        const result = await llmEnhancedParse(prompt, this.config);
        result.metadata.parseTime = Date.now() - startTime;
        return result;
      } catch (error) {
        console.warn(
          'LLM parse failed, falling back to standard parser:',
          error
        );
        // Fall back to standard parser
      }
    }

    const result = standardParse(prompt);
    result.metadata.parseTime = Date.now() - startTime;
    return result;
  }

  // Cost estimation
  estimateCost(prompt: string): number {
    if (!this.enabled) return 0;

    // Simple token estimation (4 chars ≈ 1 token)
    const estimatedTokens = Math.ceil(prompt.length / 4);
    const costPerToken = 0.000001; // Mock cost
    return estimatedTokens * costPerToken;
  }
}

// Legacy singleton retained for older UI callsites.
let serviceInstance: SimpleLLMService | null = null;

/**
 * @deprecated Prefer constructing or consuming the API-backed client from
 * `ApiLLMService.ts`. This accessor exists only for legacy UI callsites that
 * still depend on browser-local configuration.
 */
export function getLLMService(): SimpleLLMService {
  if (!serviceInstance) {
    const storedConfig =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('llm-config')
        : null;
    const parsedConfig = storedConfig ? JSON.parse(storedConfig) : {};

    // No default API key - must be configured via localStorage or server-side
    serviceInstance = new SimpleLLMService({
      apiKey: parsedConfig.apiKey,
      provider: parsedConfig.provider || 'openrouter',
      model: parsedConfig.model || 'openai/gpt-3.5-turbo',
      temperature: parsedConfig.temperature || 0.7,
      maxTokens: parsedConfig.maxTokens || 500
    });
  }
  return serviceInstance;
}
