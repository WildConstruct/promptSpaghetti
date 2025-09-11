import { useState, useCallback, useRef } from 'react';
import {
  simplePromptParser,
  PromptAnalysis
} from '../../../../lib/simplePromptParser';
import { reconcileAnalysis } from '../../../../lib/analysisReconciler';
import LLMService from '../../../../shims/llm-service';

export type ParseMode = 'standard' | 'llm-enhanced';

interface ParseResult {
  text: string;
  analysis: PromptAnalysis;
}

export const useParsingEngine = () => {
  const [isLLMParsing, setIsLLMParsing] = useState(false);
  const [llmMode, setLlmMode] = useState<ParseMode>('standard');

  const parsedResultsRef = useRef<{
    standard: ParseResult | null;
    'llm-enhanced': ParseResult | null;
  }>({ standard: null, 'llm-enhanced': null });

  const llmServiceRef = useRef(new LLMService({}));
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
          prompt: '',
          nodes: [],
          edges: [],
          groups: [],
          metadata: {
            modelUsed: mode,
            timestamp: new Date().toISOString()
          }
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
              analysis = parserRef.current(text);
            } else {
              // LLM-enhanced parsing
              setIsLLMParsing(true);
              try {
                const llmParserResult =
                  await llmServiceRef.current.parsePrompt(text);

                if (llmParserResult?.analysis) {
                  const standardAnalysis = parserRef.current(text);
                  analysis = reconcileAnalysis(
                    standardAnalysis,
                    llmParserResult.analysis
                  );
                } else {
                  // Fallback to standard if LLM fails
                  analysis = parserRef.current(text);
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
            const fallbackAnalysis = parserRef.current(text);
            parsedResultsRef.current[mode] = {
              text,
              analysis: fallbackAnalysis
            };
            onComplete(fallbackAnalysis);
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
