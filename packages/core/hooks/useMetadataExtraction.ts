// Metadata Extraction Hook with Debouncing for Story 2.3a
// Provides automatic background metadata extraction for segments

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  MetadataExtractor,
  SegmentMetadata
} from '../services/llm/MetadataExtractor';
import { LLMService } from '../services/llm/LLMService';

interface UseMetadataExtractionOptions {
  enabled?: boolean;
  debounceMs?: number;
  onMetadataExtracted?: (nodeId: string, metadata: SegmentMetadata) => void;
  llmService?: LLMService;
}

interface MetadataState {
  [nodeId: string]: {
    metadata?: SegmentMetadata;
    extracting: boolean;
    lastExtracted?: number;
  };
}

export function useMetadataExtraction(
  options: UseMetadataExtractionOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 1000,
    onMetadataExtracted,
    llmService
  } = options;

  const [metadataState, setMetadataState] = useState<MetadataState>({});
  const extractorRef = useRef<MetadataExtractor>();
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize extractor
  useEffect(() => {
    if (!extractorRef.current) {
      extractorRef.current = new MetadataExtractor(llmService);
    }
  }, [llmService]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Extract metadata for a segment (debounced)
  const extractMetadata = useCallback(
    (nodeId: string, text: string) => {
      if (!enabled || !extractorRef.current || !text.trim()) return;

      // Clear existing timer for this node
      const existingTimer = debounceTimersRef.current.get(nodeId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced extraction
      const timer = setTimeout(async () => {
        // Check if we've already extracted for this exact text recently
        const state = metadataState[nodeId];
        if (state?.lastExtracted && Date.now() - state.lastExtracted < 60000) {
          // Skip if extracted within last minute
          return;
        }

        // Mark as extracting
        setMetadataState(prev => ({
          ...prev,
          [nodeId]: { ...prev[nodeId], extracting: true }
        }));

        try {
          // Perform extraction in background
          const result = await extractorRef.current!.extract(text);

          // Update state with extracted metadata
          setMetadataState(prev => ({
            ...prev,
            [nodeId]: {
              metadata: result.metadata,
              extracting: false,
              lastExtracted: Date.now()
            }
          }));

          // Notify parent component
          if (onMetadataExtracted) {
            onMetadataExtracted(nodeId, result.metadata);
          }

          // Log for debugging (only in dev mode)
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Metadata extracted for node ${nodeId}:`, {
              fromCache: result.fromCache,
              extractionTime: result.extractionTime,
              tags: result.metadata.tags
            });
          }
        } catch (error) {
          // Silent failure - no user notification
          console.debug('Metadata extraction failed:', error);

          // Mark extraction as complete even on failure
          setMetadataState(prev => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], extracting: false }
          }));
        }

        // Remove timer from map
        debounceTimersRef.current.delete(nodeId);
      }, debounceMs);

      debounceTimersRef.current.set(nodeId, timer);
    },
    [enabled, debounceMs, onMetadataExtracted, metadataState]
  );

  // Get metadata for a specific node
  const getNodeMetadata = useCallback(
    (nodeId: string): SegmentMetadata | undefined => {
      return metadataState[nodeId]?.metadata;
    },
    [metadataState]
  );

  // Check if extraction is in progress for a node
  const isExtracting = useCallback(
    (nodeId: string): boolean => {
      return metadataState[nodeId]?.extracting || false;
    },
    [metadataState]
  );

  // Manually trigger extraction (bypasses debounce)
  const extractNow = useCallback(
    async (nodeId: string, text: string): Promise<SegmentMetadata | null> => {
      if (!extractorRef.current || !text.trim()) return null;

      // Cancel any pending debounced extraction
      const existingTimer = debounceTimersRef.current.get(nodeId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        debounceTimersRef.current.delete(nodeId);
      }

      setMetadataState(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], extracting: true }
      }));

      try {
        const result = await extractorRef.current.extract(text);

        setMetadataState(prev => ({
          ...prev,
          [nodeId]: {
            metadata: result.metadata,
            extracting: false,
            lastExtracted: Date.now()
          }
        }));

        if (onMetadataExtracted) {
          onMetadataExtracted(nodeId, result.metadata);
        }

        return result.metadata;
      } catch (error) {
        console.debug('Manual extraction failed:', error);

        setMetadataState(prev => ({
          ...prev,
          [nodeId]: { ...prev[nodeId], extracting: false }
        }));

        return null;
      }
    },
    [onMetadataExtracted]
  );

  // Batch extraction for multiple segments
  const extractBatch = useCallback(
    async (segments: Array<{ nodeId: string; text: string }>) => {
      if (!extractorRef.current || !enabled) return;

      const texts = segments.map(s => s.text);
      const results = await extractorRef.current.extractBatch(texts);

      results.forEach((result, index) => {
        const { nodeId } = segments[index];

        setMetadataState(prev => ({
          ...prev,
          [nodeId]: {
            metadata: result.metadata,
            extracting: false,
            lastExtracted: Date.now()
          }
        }));

        if (onMetadataExtracted) {
          onMetadataExtracted(nodeId, result.metadata);
        }
      });
    },
    [enabled, onMetadataExtracted]
  );

  // Clear metadata for a node
  const clearNodeMetadata = useCallback((nodeId: string) => {
    setMetadataState(prev => {
      const newState = { ...prev };
      delete newState[nodeId];
      return newState;
    });
  }, []);

  // Clear all metadata and cache
  const clearAll = useCallback(() => {
    setMetadataState({});
    if (extractorRef.current) {
      extractorRef.current.clearCache();
    }
  }, []);

  // Parse search query for smart filtering
  const parseSearchQuery = useCallback((query: string) => {
    if (!extractorRef.current) {
      return { filters: {}, keywords: [] };
    }
    return extractorRef.current.parseSearchQuery(query);
  }, []);

  // Calculate relevance score
  const calculateRelevance = useCallback(
    (metadata: SegmentMetadata, filters: Partial<SegmentMetadata>) => {
      if (!extractorRef.current) return 0;
      return extractorRef.current.calculateRelevance(metadata, filters);
    },
    []
  );

  return {
    // Main extraction function (debounced)
    extractMetadata,

    // State access
    getNodeMetadata,
    isExtracting,
    metadataState,

    // Manual controls
    extractNow,
    extractBatch,
    clearNodeMetadata,
    clearAll,

    // Search utilities
    parseSearchQuery,
    calculateRelevance,

    // Direct access to extractor (for advanced use)
    extractor: extractorRef.current
  };
}
