import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { 
  NodeIntelligenceService,
  TextRefinementService, 
  GraphAnalyzer,
  MetadataExtractor,
  SimilarityEngine,
  TokenTracker,
  LLMService
} from '../../../services/llm';

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

const IntelligenceContext = createContext<IntelligenceContextType>({
  nodeIntelligence: null,
  textRefinement: null,
  graphAnalyzer: null,
  metadataExtractor: null,
  similarityEngine: null,
  costTracker: null,
  consentGiven: false,
  isOffline: true,
  setConsent: () => {}
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
      setConsent: () => {}
    };
  }
  return context;
};

export const IntelligenceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState(() => {
    try {
      const stored = localStorage.getItem('epic2-consent');
      console.log('[IntelligenceContext] Stored consent:', stored);
      return stored === 'true';
    } catch (error) {
      console.log('[IntelligenceContext] Failed to read consent:', error);
      return false;
    }
  });

  const services = useMemo(() => {
    console.log('[IntelligenceContext] Services memo - consent given:', consentGiven);
    
    if (!consentGiven) {
      console.log('[IntelligenceContext] No consent - returning null services');
      return {
        nodeIntelligence: null,
        textRefinement: null,
        graphAnalyzer: null,
        metadataExtractor: null,
        similarityEngine: null,
        costTracker: null,
      };
    }

    try {
      console.log('[IntelligenceContext] Initializing services...');
      console.log('[IntelligenceContext] Available env vars:', process.env);
      
      // Create LLM service with proper configuration
      // Check localStorage for API key first (for demo purposes)
      const storedApiKey = localStorage.getItem('openrouter-api-key');
      // In Node/test/CI, use process.env for environment variables  
      const envApiKey = process.env.OPENROUTER_API_KEY || 
                        process.env.VITE_OPENROUTER_API_KEY;
      
      const apiKey = storedApiKey || envApiKey;
      
      console.log('[IntelligenceContext] API key sources:', {
        hasStoredKey: !!storedApiKey,
        hasEnvKey: !!envApiKey,
        envValue: process.env.VITE_OPENROUTER_API_KEY ? 'Found in process.env' : 'Not in process.env',
        finalKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'None'
      });
      
      if (!apiKey) {
        console.warn('[IntelligenceContext] No API key found. Using offline mode.');
        console.log('[IntelligenceContext] To use AI features, set your OpenRouter API key:');
        console.log('  localStorage.setItem("openrouter-api-key", "YOUR_API_KEY")');
      } else {
        console.log('[IntelligenceContext] API key found, initializing with real LLM service');
      }
      
      const llmConfig = {
        mode: 'development' as const,
        cacheEnabled: true,
        dailyLimit: 1000,
        costLimit: 10,
        apiKey
      };
      
      const llmService = new LLMService(llmConfig);
      const services = {
        nodeIntelligence: new NodeIntelligenceService(llmService),
        textRefinement: new TextRefinementService(llmService),
        graphAnalyzer: new GraphAnalyzer(llmService),
        metadataExtractor: new MetadataExtractor(llmService),
        similarityEngine: new SimilarityEngine(),
        costTracker: new TokenTracker(),
      };
      console.log('[IntelligenceContext] Services initialized successfully:', services);
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
  }, [consentGiven]);

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
    isOffline: !services.nodeIntelligence,
    setConsent
  }), [services, consentGiven, setConsent]);

  return (
    <IntelligenceContext.Provider value={contextValue}>
      {children}
    </IntelligenceContext.Provider>
  );
};