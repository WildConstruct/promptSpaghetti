import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import {  NodeIntelligenceService,
  TextRefinementService,  GraphAnalyzer,
  MetadataExtractor,
  SimilarityEngine,
  TokenTracker,
  LLMService,
  ApiLLMClient,
  type LLMStatusResponse
} from '../../../services/llm';
import { debugLogEpic1 } from '../../../utils/debug';

interface IntelligenceContextType {
  nodeIntelligence: NodeIntelligenceService | null;
  textRefinement: TextRefinementService | null;
  graphAnalyzer: GraphAnalyzer | null;
  metadataExtractor: MetadataExtractor | null;
  similarityEngine: SimilarityEngine | null;
  costTracker: TokenTracker | null;
  consentGiven: boolean;
  isOffline: boolean;
  setConsent: (consent: boolean) => void;
}

const warnMissingProvider = () => {
  console.warn('setConsent called without IntelligenceProvider; ignoring request.');
};

const IntelligenceContext = createContext<IntelligenceContextType>({
  nodeIntelligence: null,
  textRefinement: null,
  graphAnalyzer: null,
  metadataExtractor: null,
  similarityEngine: null,
  costTracker: null,
  consentGiven: false,
  isOffline: true,
  setConsent: warnMissingProvider
});

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    console.warn('useIntelligence called outside of IntelligenceProvider, returning default values');
    // Return default values instead of throwing
    return {
      nodeIntelligence: null,
      textRefinement: null,
      graphAnalyzer: null,
      metadataExtractor: null,
      similarityEngine: null,
      costTracker: null,
      consentGiven: false,
      isOffline: true,
      setConsent: warnMissingProvider
    };
  }
  return context;
};

export const IntelligenceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState(() => {
    try {
      const stored = localStorage.getItem('epic2-consent');
      debugLogEpic1('[IntelligenceContext] Stored consent:', stored);
      return stored === 'true';
    } catch (error) {
      debugLogEpic1('[IntelligenceContext] Failed to read consent:', error);
      return false;
    }
  });
  const [status, setStatus] = useState<LLMStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const llmClient = new ApiLLMClient();

    llmClient
      .getStatus()
      .then(nextStatus => {
        if (!cancelled) {
          setStatus(nextStatus);
        }
      })
      .catch(error => {
        debugLogEpic1('[IntelligenceContext] Failed to load LLM status:', error);
        if (!cancelled) {
          setStatus({
            available: false,
            mode: 'heuristic',
            capabilities: []
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const services = useMemo(() => {
    debugLogEpic1(
      '[IntelligenceContext] Services memo - consent given:',
      consentGiven
    );

    try {
      debugLogEpic1('[IntelligenceContext] Initializing services...');
      debugLogEpic1('[IntelligenceContext] Server LLM status:', status);
      const llmService = new LLMService();
      const nodeIntelligence = new NodeIntelligenceService(llmService);
      const similarityEngine = new SimilarityEngine();
      const costTracker = new TokenTracker();

      if (!consentGiven) {
        debugLogEpic1(
          '[IntelligenceContext] No consent - exposing offline-safe services only'
        );
        return {
          nodeIntelligence,
          textRefinement: null,
          graphAnalyzer: null,
          metadataExtractor: null,
          similarityEngine,
          costTracker,
        };
      }

      const services = {
        nodeIntelligence,
        textRefinement: new TextRefinementService(llmService),
        graphAnalyzer: new GraphAnalyzer(llmService),
        metadataExtractor: new MetadataExtractor(llmService),
        similarityEngine,
        costTracker,
      };
      debugLogEpic1(
        '[IntelligenceContext] Services initialized successfully:',
        services
      );
      return services;
    } catch (error) {
      console.warn('[IntelligenceContext] Failed to initialize intelligence services:', error);
      return {
        nodeIntelligence: null,
        textRefinement: null,
        graphAnalyzer: null,
        metadataExtractor: null,
        similarityEngine: null,
        costTracker: null,
      };
    }
  }, [consentGiven, status]);

  const setConsent = useCallback((consent: boolean) => {
    setConsentGiven(consent);
    try {
      localStorage.setItem('epic2-consent', consent.toString());
    } catch (error) {
      console.warn('Failed to save consent preference:', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    ...services,
    consentGiven,
    isOffline: !consentGiven || !status?.available,
    setConsent
  }), [services, consentGiven, status, setConsent]);

  return (
    <IntelligenceContext.Provider value={contextValue}>
      {children}
    </IntelligenceContext.Provider>
  );
};
