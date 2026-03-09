import { useState, useCallback, useRef } from 'react';
import {
  simplePromptParser,
  PromptAnalysis,
  type GeneratedNode,
  type AnalysisEdge
} from '../../../../lib/simplePromptParser';
import { reconcileAnalysis } from '../../../../lib/analysisReconciler';
import { ApiLLMClient } from '@promptscape/core/services/llm';

export type ParseMode = 'standard' | 'llm-enhanced';

interface ParseResult {
  text: string;
  analysis: PromptAnalysis;
}

type DraftGraphResponse = {
  ok?: boolean;
  summary?: string;
  operations?: Array<{
    kind?: string;
    nodes?: Array<Record<string, unknown>>;
    edges?: Array<Record<string, unknown>>;
  }>;
  notes?: string[];
  model?: string;
  fallback?: boolean;
};

const HIGHLIGHT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FFB347',
  '#B19CD9'
];

function mapDraftNodeType(type: unknown): GeneratedNode['node']['nodeType'] {
  const normalized = typeof type === 'string' ? type.toLowerCase() : '';
  if (normalized.includes('choice')) {
    return 'Choice';
  }
  if (normalized.includes('variable')) {
    return 'Variable';
  }
  if (normalized.includes('output')) {
    return 'Output';
  }
  return 'Text';
}

function analysisFromDraftGraphResponse(
  prompt: string,
  response: DraftGraphResponse
): PromptAnalysis | null {
  const draftInsert = Array.isArray(response.operations)
    ? response.operations.find(operation => operation.kind === 'insertNodes')
    : null;

  if (!draftInsert || !Array.isArray(draftInsert.nodes)) {
    return null;
  }

  const baseline = simplePromptParser.parse(prompt);
  const generatedNodes: GeneratedNode[] = draftInsert.nodes.map(
    (node, index): GeneratedNode => {
      const nodeId =
        typeof node.id === 'string' ? node.id : `draft-node-${index}`;
      const nodeType = mapDraftNodeType(node.type);
      const data =
        typeof node.data === 'object' && node.data !== null
          ? (node.data as Record<string, unknown>)
          : {};
      const previewText =
        typeof data.text === 'string'
          ? data.text
          : typeof data.content === 'string'
            ? data.content
            : typeof data.label === 'string'
              ? data.label
              : nodeType;

      return {
        node: {
          id: nodeId,
          nodeType,
          variableName:
            typeof data.variableName === 'string'
              ? data.variableName
              : undefined,
          getPreviewText: () => previewText,
          data
        }
      };
    }
  );

  const mappings = baseline.mappings
    .slice(0, Math.max(0, generatedNodes.length - 1))
    .map((mapping, index) => ({
      ...mapping,
      nodeId: generatedNodes[index]?.node.id || mapping.nodeId,
      highlightColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]
    }));

  const responseEdges: AnalysisEdge[] = Array.isArray(draftInsert.edges)
    ? draftInsert.edges
        .map((edge, index) => {
          const source =
            typeof edge.source === 'string' ? edge.source : undefined;
          const target =
            typeof edge.target === 'string' ? edge.target : undefined;
          if (!source || !target) {
            return null;
          }
          return {
            id:
              typeof edge.id === 'string'
                ? edge.id
                : `${source}__${target}__${index}`,
            source,
            target,
            sourceHandle:
              typeof edge.sourceHandle === 'string'
                ? edge.sourceHandle
                : undefined,
            targetHandle:
              typeof edge.targetHandle === 'string'
                ? edge.targetHandle
                : undefined
          };
        })
        .filter((edge): edge is AnalysisEdge => edge !== null)
    : [];

  return {
    segments: baseline.segments,
    nodes: generatedNodes,
    mappings,
    edges: responseEdges.length > 0 ? responseEdges : baseline.edges,
    rawPrompt: prompt,
    llmMetadata: {
      parserMode: 'llm-enhanced',
      summary: response.summary,
      notes: response.notes || [],
      model: response.model || 'heuristic-segmentation-v1',
      fallback: response.fallback !== false
    }
  };
}

export const useParsingEngine = () => {
  const [isLLMParsing, setIsLLMParsing] = useState(false);
  const [llmMode, setLlmMode] = useState<ParseMode>('standard');

  const parsedResultsRef = useRef<{
    standard: ParseResult | null;
    'llm-enhanced': ParseResult | null;
  }>({ standard: null, 'llm-enhanced': null });

  const llmServiceRef = useRef(new ApiLLMClient({}));
  const parserRef = useRef<typeof simplePromptParser>(simplePromptParser);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const performParse = useCallback(
    async (
      text: string,
      mode: ParseMode,
      onComplete: (analysis: PromptAnalysis) => void
    ): Promise<void> => {
      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Skip if text hasn't changed for this mode
      const cachedResult = parsedResultsRef.current[mode];
      if (cachedResult && cachedResult.text === text) {
        onComplete(cachedResult.analysis);
        return;
      }

      // Skip if empty
      if (!text || text.trim().length === 0) {
        const emptyAnalysis: PromptAnalysis = {
          segments: [],
          nodes: [],
          edges: [],
          mappings: [],
          rawPrompt: ''
        };
        parsedResultsRef.current[mode] = { text, analysis: emptyAnalysis };
        onComplete(emptyAnalysis);
        return;
      }

      // Debounce parsing
      return new Promise(resolve => {
        debounceTimerRef.current = setTimeout(async () => {
          try {
            let analysis: PromptAnalysis;

            if (mode === 'standard') {
              // Standard parsing
              analysis = parserRef.current.parse(text);
            } else {
              // LLM-enhanced parsing
              setIsLLMParsing(true);
              try {
                const llmParserResult =
                  (await llmServiceRef.current.draftGraphFromPrompt({
                    prompt: text,
                    mode: 'draft'
                  })) as DraftGraphResponse;

                const draftAnalysis = analysisFromDraftGraphResponse(
                  text,
                  llmParserResult
                );

                if (draftAnalysis) {
                  analysis = draftAnalysis;
                } else {
                  // Fallback to standard if LLM fails
                  analysis = parserRef.current.parse(text);
                }
              } finally {
                setIsLLMParsing(false);
              }
            }

            // Cache the result
            parsedResultsRef.current[mode] = { text, analysis };
            onComplete(analysis);
            resolve();
          } catch (error) {
            console.error('Parse error:', error);
            // Fallback to standard parsing on error
            const fallbackAnalysis = parserRef.current.parse(text);
            const analysis =
              mode === 'llm-enhanced'
                ? {
                    ...fallbackAnalysis,
                    llmMetadata: {
                      parserMode: 'llm-enhanced',
                      fallback: true,
                      error:
                        error instanceof Error
                          ? error.message
                          : 'draftGraphFromPrompt failed'
                    }
                  }
                : fallbackAnalysis;
            parsedResultsRef.current[mode] = { text, analysis };
            onComplete(analysis);
            resolve();
          }
        }, 300); // 300ms debounce
      });
    },
    []
  );

  const clearCache = useCallback(() => {
    parsedResultsRef.current = { standard: null, 'llm-enhanced': null };
  }, []);

  return {
    performParse,
    clearCache,
    isLLMParsing,
    llmMode,
    setLlmMode,
    parsedResults: parsedResultsRef.current
  };
};
