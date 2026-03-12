export type LLMProvider = 'openrouter' | 'openai';

export type LLMMode = 'live' | 'heuristic';

export const LLM_CAPABILITIES = [
  'getStatus',
  'draftGraphFromPrompt',
  'complete',
  'suggest',
  'metadata',
  'refine',
  'analyze',
  'populateChoices',
  'optimizeChoices'
] as const;

export type LLMCapability = (typeof LLM_CAPABILITIES)[number];

export interface LLMStatusContract {
  available: boolean;
  mode: LLMMode;
  provider?: LLMProvider;
  defaultModel?: string | null;
  capabilities: LLMCapability[];
}
