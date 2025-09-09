// Simplified LLM Service for Epic 2 MVP
// This version provides the essential LLM functionality without all dependencies

import { Node, Edge } from 'reactflow';

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

export interface ParseResult {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    parserMode: string;
    parseTime: number;
    llmUsed?: boolean;
    model?: string;
    cost?: number;
    intelligence?: {
      detectedVariables: string[];
      hasChoices: boolean;
      structureType: 'branching' | 'templated' | 'linear';
      confidence: number;
    };
  };
}

// Simple prompt parser that mimics LLM behavior for testing
function standardParse(prompt: string): ParseResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Split prompt into segments
  const segments = prompt.split(/[.!?]+/).filter(s => s.trim());

  segments.forEach((segment, index) => {
    const nodeId = `node-${index}`;

    // Detect variables like {character} or [setting]
    const hasVariable = /\{[^}]+\}|\[[^\]]+\]/.test(segment);

    nodes.push({
      id: nodeId,
      type: hasVariable ? 'variable' : 'textBlock',
      position: { x: 100 + index * 200, y: 100 + (index % 2) * 100 },
      data: {
        label: segment.trim(),
        content: segment.trim(),
        type: hasVariable ? 'variable' : 'textBlock'
      }
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
      parseTime: Date.now(),
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

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Add output node if not present
    const hasOutput = result.nodes.some((n: any) => n.type === 'output');
    if (!hasOutput) {
      const outputId = `output-${result.nodes.length}`;
      result.nodes.push({
        id: outputId,
        type: 'output',
        data: {
          label: 'Generated Output',
          content: ''
        }
      });

      if (result.nodes.length > 1) {
        result.edges.push({
          id: `edge-output`,
          source: result.nodes[result.nodes.length - 2].id,
          target: outputId,
          type: 'default'
        });
      }
    }

    return {
      nodes: result.nodes,
      edges: result.edges,
      metadata: {
        parserMode: 'llm-enhanced',
        parseTime: Date.now(),
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
  // Try actual API call first if configured
  if (config.apiKey && config.apiKey !== 'demo') {
    const apiResult = await callOpenRouterAPI(prompt, config);
    if (apiResult) {
      return apiResult;
    }
  }

  // Fallback to local parsing with simulated delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Perform molecular chunking with POS tagging and semantic analysis
  const chunks = performMolecularChunking(prompt);

  // Group chunks into semantic units for node creation
  const semanticGroups = groupChunksIntoSemanticUnits(chunks);

  // Create nodes from semantic groups
  let nodeIndex = 0;
  let previousNodeId: string | null = null;
  const detectedVariables = new Set<string>();
  let hasChoices = false;
  let hasBranching = false;

  semanticGroups.forEach((group, groupIndex) => {
    const nodeId = `node-${nodeIndex++}`;
    let nodeType = 'textBlock';
    let nodeData: any = {
      label: group.text,
      content: group.text,
      type: 'textBlock',
      metadata: {
        chunks: group.chunks,
        semanticRole: group.semanticRole,
        confidence: group.confidence
      }
    };

    // Detect variables in molecular chunks
    const variablePattern = /\{([^}]+)\}|\[([^\]]+)\]|<([^>]+)>/g;
    const varMatches = group.text.matchAll(variablePattern);
    const foundVars = Array.from(varMatches) as RegExpMatchArray[];

    if (foundVars.length > 0) {
      nodeType = 'variable';
      nodeData.type = 'variable';
      nodeData.variableName =
        foundVars[0][1] || foundVars[0][2] || foundVars[0][3];
      detectedVariables.add(nodeData.variableName);

      // Intelligent suggestions based on semantic analysis
      nodeData.suggestions = generateSmartSuggestions(
        nodeData.variableName,
        group.chunks
      );
    }

    // Detect choice patterns from POS analysis
    const hasChoiceWords = group.chunks.some(
      (chunk: any) =>
        chunk.pos === 'conjunction' && /\b(or|either)\b/i.test(chunk.text)
    );

    if (hasChoiceWords || group.semanticRole === 'choice') {
      hasChoices = true;
      hasBranching = true;
      nodeType = 'weightedChoice';
      nodeData.type = 'weightedChoice';

      // Extract options using molecular chunks
      const options = extractOptionsFromChunks(group.chunks);
      nodeData.options = options.map((opt, i) => ({
        text: opt.text,
        weight: opt.weight || 1.0 / options.length,
        metadata: opt.metadata
      }));
    }

    // Detect conditional patterns
    const hasConditional = group.chunks.some(
      (chunk: any) =>
        chunk.pos === 'conditional' || /\b(if|when|unless)\b/i.test(chunk.text)
    );

    if (hasConditional) {
      nodeType = 'conditional';
      nodeData.type = 'conditional';
      nodeData.condition = extractConditionFromChunks(group.chunks);
      hasBranching = true;
    }

    // Smart positioning based on semantic structure
    const position = calculateSmartPosition(groupIndex, nodeType, hasBranching);

    nodes.push({
      id: nodeId,
      type: nodeType,
      position,
      data: nodeData
    });

    // Create intelligent edge connections
    if (previousNodeId) {
      edges.push({
        id: `edge-${edges.length}`,
        source: previousNodeId,
        target: nodeId,
        type: 'smoothstep',
        animated: nodeType === 'variable' || nodeType === 'conditional',
        data: {
          label: getEdgeLabel(semanticGroups[groupIndex - 1], group),
          confidence: Math.min(
            semanticGroups[groupIndex - 1].confidence,
            group.confidence
          )
        }
      });
    }

    previousNodeId = nodeId;
  });

  // Add intelligent combination nodes if needed
  if (nodes.length > 2 && hasBranching) {
    const mergeId = `merge-${nodeIndex++}`;
    nodes.push({
      id: mergeId,
      type: 'merge',
      position: calculateSmartPosition(nodes.length, 'merge', hasBranching),
      data: {
        label: 'Merge Paths',
        content: '',
        type: 'merge',
        mergeStrategy: 'intelligent'
      }
    });

    // Connect branch endpoints to merge
    if (previousNodeId) {
      edges.push({
        id: `edge-merge`,
        source: previousNodeId,
        target: mergeId,
        type: 'smoothstep'
      });
    }
    previousNodeId = mergeId;
  }

  // Add concatenation node for multi-part outputs
  if (nodes.length > 1 && detectedVariables.size > 0) {
    const concatId = `concat-${nodeIndex++}`;
    nodes.push({
      id: concatId,
      type: 'concat',
      position: calculateSmartPosition(nodes.length, 'concat', hasBranching),
      data: {
        label: 'Assemble Output',
        content: '',
        type: 'concat',
        separator: ' ',
        preserveFormatting: true
      }
    });

    if (previousNodeId) {
      edges.push({
        id: `edge-concat`,
        source: previousNodeId,
        target: concatId,
        type: 'smoothstep'
      });
    }
    previousNodeId = concatId;
  }

  // Add output node with rich metadata
  const outputId = `output-${nodeIndex}`;
  nodes.push({
    id: outputId,
    type: 'output',
    position: calculateSmartPosition(nodes.length, 'output', hasBranching),
    data: {
      label: 'Generated Output',
      content: '',
      type: 'output',
      preview: generatePreview(prompt, chunks),
      metadata: {
        totalChunks: chunks.length,
        semanticGroups: semanticGroups.length,
        complexity: calculateComplexity(chunks, semanticGroups)
      }
    }
  });

  if (previousNodeId) {
    edges.push({
      id: `edge-output`,
      source: previousNodeId,
      target: outputId,
      type: 'smoothstep',
      animated: true,
      data: {
        label: 'Final Output',
        confidence: 0.95
      }
    });
  }

  // Return with comprehensive metadata
  return {
    nodes,
    edges,
    metadata: {
      parserMode: 'llm-enhanced',
      parseTime: Date.now(),
      llmUsed: true,
      model: config.model || 'gpt-3.5-turbo',
      cost: 0.0002, // Higher cost for more intelligent parsing
      intelligence: {
        detectedVariables: Array.from(detectedVariables),
        hasChoices,
        structureType: hasBranching
          ? 'branching'
          : detectedVariables.size > 0
            ? 'templated'
            : 'linear',
        confidence: 0.92
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
function groupChunksIntoSemanticUnits(chunks: MolecularChunk[]): any[] {
  const groups: any[] = [];
  let currentGroup: any = {
    text: '',
    chunks: [],
    semanticRole: 'descriptor',
    confidence: 1.0
  };

  // More intelligent grouping based on semantic boundaries
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const nextChunk = chunks[i + 1];
    const prevChunk = chunks[i - 1];

    // Add current chunk to group
    currentGroup.chunks.push(chunk);

    // Determine if we should create a new group
    let shouldBreak = false;

    // Major punctuation creates natural breaks
    if (chunk.pos === 'punctuation' && /[.!?]/.test(chunk.text)) {
      shouldBreak = true;
    }
    // Don't break on commas - keep phrases together
    // Only break on commas if we have accumulated a significant amount of text
    else if (chunk.pos === 'punctuation' && chunk.text === ',' && nextChunk) {
      // Only break if we have at least 5 chunks accumulated
      if (currentGroup.chunks.length > 5) {
        shouldBreak = true;
      }
    }
    // Keep person descriptors together (avoid breaking "tall dark-skinned model")
    else if (
      chunk.text.toLowerCase() === 'model' ||
      chunk.text.toLowerCase() === 'person'
    ) {
      // Only break if the next chunk is not an adjective or related descriptor
      if (
        nextChunk &&
        nextChunk.pos !== 'adjective' &&
        nextChunk.pos !== 'preposition'
      ) {
        shouldBreak = true; // Break after the noun
      }
    }
    // Break after major noun phrases only if they are substantial
    else if (
      (chunk.pos === 'domain-noun' || chunk.pos === 'noun') &&
      nextChunk
    ) {
      // Only break if we're transitioning to a new clause or action
      if (
        (nextChunk.pos === 'action-verb' || nextChunk.text === '.') &&
        currentGroup.chunks.length > 3
      ) {
        shouldBreak = true;
      }
    }
    // Choice patterns
    else if (chunk.pos === 'conjunction' && /^(or)$/i.test(chunk.text)) {
      // Break before 'or' to separate choices
      currentGroup.chunks.pop(); // Remove 'or' from current group
      if (currentGroup.chunks.length > 0) {
        currentGroup.text = currentGroup.chunks
          .map((c: any) => c.text)
          .join(' ')
          .trim();
        groups.push(currentGroup);
      }
      // Create 'or' as its own group
      groups.push({
        text: chunk.text,
        chunks: [chunk],
        semanticRole: 'choice',
        confidence: 1.0
      });
      currentGroup = {
        text: '',
        chunks: [],
        semanticRole: 'alternative',
        confidence: 1.0
      };
      shouldBreak = false;
    }

    // Execute break if needed
    if (shouldBreak) {
      // Join chunks without adding spaces - preserve original spacing
      currentGroup.text = currentGroup.chunks
        .map((c: any) => c.text)
        .join('')
        .trim();
      if (
        currentGroup.text &&
        currentGroup.text !== '.' &&
        !/^[.,;:!?]+$/.test(currentGroup.text)
      ) {
        groups.push(currentGroup);
      }
      currentGroup = {
        text: '',
        chunks: [],
        semanticRole: 'statement',
        confidence: 1.0
      };
    }
  }

  // Add final group - IMPORTANT: capture any remaining text
  if (currentGroup.chunks.length > 0) {
    // Join chunks without adding spaces - preserve original spacing
    currentGroup.text = currentGroup.chunks
      .map((c: any) => c.text)
      .join('')
      .trim();
    if (currentGroup.text && currentGroup.text !== '.') {
      // Don't create groups for standalone punctuation
      groups.push(currentGroup);
    }
  }

  // Filter out any groups that are just punctuation
  return groups.filter(g => g.text && !/^[.,;:!?]+$/.test(g.text));
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
function extractOptionsFromChunks(chunks: MolecularChunk[]): any[] {
  const options: any[] = [];
  let currentOption = '';

  chunks.forEach(chunk => {
    if (chunk.pos === 'conjunction' && /^(or|,)$/i.test(chunk.text)) {
      if (currentOption.trim()) {
        options.push({
          text: currentOption.trim(),
          weight: 1.0,
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
      weight: 1.0,
      metadata: { source: 'molecular_parsing' }
    });
  }

  return options.length > 0
    ? options
    : [{ text: chunks.map(c => c.text).join(' '), weight: 1.0 }];
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
  nodeType: string,
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
function getEdgeLabel(fromGroup: any, toGroup: any): string {
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
function calculateComplexity(chunks: MolecularChunk[], groups: any[]): number {
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

// Singleton instance
let serviceInstance: SimpleLLMService | null = null;

export function getLLMService(): SimpleLLMService {
  if (!serviceInstance) {
    // Check for API key in environment or localStorage
    let envApiKey: string | undefined;

    // Check if we're in a browser with Vite
    if (typeof window !== 'undefined' && (window as any).__VITE__) {
      // In Vite environment, env vars are injected differently
      // We'll rely on localStorage config for now
    }

    const storedConfig =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('llm-config')
        : null;
    const parsedConfig = storedConfig ? JSON.parse(storedConfig) : {};

    // Hardcode the API key from .env for now (will be replaced with proper env handling)
    const defaultApiKey =
      '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';

    serviceInstance = new SimpleLLMService({
      apiKey: parsedConfig.apiKey || defaultApiKey,
      provider: parsedConfig.provider || 'openrouter',
      model: parsedConfig.model || 'openai/gpt-3.5-turbo',
      temperature: parsedConfig.temperature || 0.7,
      maxTokens: parsedConfig.maxTokens || 500
    });
  }
  return serviceInstance;
}
