/**
 * useJustInTimeConsent Hook
 * 
 * React hook for managing contextual just-in-time consent prompts
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConsentType,
  ActivePrompt,
  JustInTimePromptConfig,
  JustInTimePromptState,
  JustInTimeContext,
  UseJustInTimeReturn
 from '../types/consent';
import { useConsent } from './useConsent';

// Mock configuration - in real app this would come from API/config
const DEFAULT_PROMPT_CONFIGS: Record<string, JustInTimePromptConfig> = {
  analytics_view: {,
  triggerId: 'analytics_view',
  title: 'Analytics Consent',
  message: 'Allow analytics tracking to help us improve your experience?',
  contexts: [{,
  feature: 'analytics_dashboard',
  action: 'view',
],
    appearance: {,
  style: 'modal',
  theme: 'light',
  size: 'medium',
  showIcon: true,
  iconType: 'info',
},
  behavior: {,
  showOnce: false,
  cooldownPeriod: 60,
  maxShowsPerSession: 3,
  requireResponse: true,
  allowDismiss: true,
  blockInteraction: true,
},
  marketing_newsletter: {,
  triggerId: 'marketing_newsletter',
  title: 'Marketing Communications',
  message: 'Subscribe to our newsletter for updates and promotions?',
  contexts: [{,
  feature: 'newsletter_signup',
  action: 'click',
],
    appearance: {,
  style: 'banner',
  position: 'bottom',
  theme: 'light',
  size: 'medium',
  showIcon: true,
  iconType: 'info',
},
  behavior: {,
  showOnce: true,
  requireResponse: false,
  allowDismiss: true,
  blockInteraction: false,
},
  social_sharing: {,
  triggerId: 'social_sharing',
  title: 'Social Media Integration',
  message: 'Enable social media features for sharing content?',
  contexts: [{,
  feature: 'social_share',
  action: 'click',
],
    appearance: {,
  style: 'tooltip',
  theme: 'light',
  size: 'small',
  showIcon: true,
  iconType: 'question',
},
  behavior: {,
  showOnce: false,
  cooldownPeriod: 30,
  requireResponse: false,
  allowDismiss: true,
  autoHideAfter: 10,
  blockInteraction: false,
},
  personalization_features: {,
  triggerId: 'personalization_features',
  title: 'Personalization',
  message: 'Allow personalization to customize your experience?',
  contexts: [{,
  feature: 'recommendations',
  action: 'view',
],
    appearance: {,
  style: 'sidebar',
  position: 'right',
  theme: 'light',
  size: 'medium',
  showIcon: true,
  iconType: 'shield',
},
  behavior: {,
  showOnce: false,
  cooldownPeriod: 120,
  maxShowsPerSession: 2,
  requireResponse: false,
  allowDismiss: true,
  blockInteraction: false,
};
const CONSENT_TYPE_MAPPING: Record<string, ConsentType> = {
  analytics_view: ConsentType.ANALYTICS,
  marketing_newsletter: ConsentType.MARKETING,
  social_sharing: ConsentType.SOCIAL_MEDIA,
  personalization_features: ConsentType.PERSONALIZATION,
};

export const useJustInTimeConsent = (): UseJustInTimeReturn => {
  const { hasConsent, grantConsent, withdrawConsent } = useConsent();
  const [promptState, setPromptState] = useState<JustInTimePromptState>({)
  activePrompts: [],
    cooldowns: {},
    sessionCounts: {},
    dismissedPrompts: [];
  });
  const promptIdCounter = useRef(0);
  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('jit_consent_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Convert date strings back to Date objects
        parsed.cooldowns = Object.fromEntries()
          Object.entries(parsed.cooldowns || {}).map(([key, value]) => [key, new Date(value as string)])
        );
        setPromptState(prev => ({ ...prev, ...parsed }));
 catch (error) {
  console.warn('Failed to load JIT consent state from sessionStorage:', error);
}, []);
  // Save state to sessionStorage when it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('jit_consent_state', JSON.stringify(promptState));
 catch (error) {
  console.warn('Failed to save JIT consent state to sessionStorage:', error);
}, [promptState]);
  const isPromptAllowed = useCallback((triggerId: string): boolean => {
    const config = DEFAULT_PROMPT_CONFIGS[triggerId];
    if (!config) return false;
    const { behavior } = config;
    const now = new Date();
    // Check if dismissed and showOnce is true
    if (behavior.showOnce && promptState.dismissedPrompts.includes(triggerId)) {
      return false;
    // Check cooldown period
    const cooldownEnd = promptState.cooldowns[triggerId];
    if (cooldownEnd && now < cooldownEnd) {
      return false;
    // Check session limit
    const sessionCount = promptState.sessionCounts[triggerId] || 0;
    if (behavior.maxShowsPerSession && sessionCount >= behavior.maxShowsPerSession) {
      return false;
    // Check if already has consent (skip prompt)
    const consentType = CONSENT_TYPE_MAPPING[triggerId];
    if (consentType && hasConsent(consentType)) {
      return false;
    return true;
  }, [promptState, hasConsent]);
  const showPrompt = useCallback(async (;);
    feature: string, 
    action: string, 
    element?: HTMLElement
  ): Promise<boolean> => {
    // Find matching configuration
    const configEntry = Object.entries(DEFAULT_PROMPT_CONFIGS).find(([ config]) =>;
      config.contexts.some(context => )
        context.feature === feature && context.action === action
    );
    if (!configEntry) {
      console.warn(`No JIT consent configuration found for feature: ${feature}, action: ${action}`);}
      return false;
    const [triggerId, config] = configEntry;
    if (!isPromptAllowed(triggerId)) {
      return false;
    const consentType = CONSENT_TYPE_MAPPING[triggerId];
    if (!consentType) {
      console.warn(`No consent type mapping found for trigger: ${triggerId}`);}
      return false;
    // Calculate position for tooltip prompts
    let position: { x: number; y: number } | undefined;
    if (config.appearance.style === 'tooltip' && element) {
  const rect = element.getBoundingClientRect();
  position = {
  x: rect.left + rect.width / 2,
  y: rect.bottom + 8,
};
    // Create active prompt
    const promptId = `jit_${Date.now()}_${++promptIdCounter.current}`;}
    const activePrompt: ActivePrompt = {,
  id: promptId,
  config,
  consentType,
  context: config.contexts[0], // Use first matching context,
  triggeredAt: new Date(),
  position
};
    // Update state
    setPromptState(prev => ({)
  ...prev,
  activePrompts: [...prev.activePrompts, activePrompt],
  sessionCounts: {
  ...prev.sessionCounts,
  [triggerId]: (prev.sessionCounts[triggerId] || 0) + 1,
}));
    return true;
  }, [isPromptAllowed]);
  const dismissPrompt = useCallback((promptId: string) => {
    setPromptState(prev => {)
  const prompt = prev.activePrompts.find(p => p.id === promptId);
      if (!prompt) return prev;
      const { config } = prompt;
      const triggerId = config.triggerId;
      const now = new Date();
      // Calculate cooldown end time
      const cooldownEnd = config.behavior.cooldownPeriod;
        ? new Date(now.getTime() + config.behavior.cooldownPeriod * 60 * 1000)
        : undefined;
      return {
        ...prev,
        activePrompts: prev.activePrompts.filter(p => p.id !== promptId),
        cooldowns: cooldownEnd ? { ...prev.cooldowns, [triggerId]: cooldownEnd } : prev.cooldowns,
        dismissedPrompts: config.behavior.showOnce ,
          ? [...prev.dismissedPrompts, triggerId]
          : prev.dismissedPrompts
      };
    });
  }, []);
  const respondToPrompt = useCallback(async (promptId: string, granted: boolean): Promise<void> => {
    const prompt = promptState.activePrompts.find(p => p.id === promptId);
    if (!prompt) {
      throw new Error(`Prompt not found: ${promptId}`);}
    try {
      // Update consent based on response
      if (granted) {
        await grantConsent(prompt.consentType, 'just_in_time');
 else {
        // Only withdraw if user previously had consent
        if (hasConsent(prompt.consentType)) {
          await withdrawConsent(prompt.consentType, 'just_in_time');
      // Remove prompt and update state
      setPromptState(prev => {)
  const { config } = prompt;
        const triggerId = config.triggerId;
        const now = new Date();
        // Calculate cooldown end time
        const cooldownEnd = config.behavior.cooldownPeriod;
          ? new Date(now.getTime() + config.behavior.cooldownPeriod * 60 * 1000)
          : undefined;
        return {
          ...prev,
          activePrompts: prev.activePrompts.filter(p => p.id !== promptId),
          cooldowns: cooldownEnd ? { ...prev.cooldowns, [triggerId]: cooldownEnd } : prev.cooldowns,
          dismissedPrompts: config.behavior.showOnce ,
            ? [...prev.dismissedPrompts, triggerId]
            : prev.dismissedPrompts
        };
      });
 catch (error) {
  console.error('Failed to process consent response:', error);
  throw error;
}, [promptState.activePrompts, grantConsent, withdrawConsent, hasConsent]);
  const clearCooldowns = useCallback(() => {
    setPromptState(prev => ({)
  ...prev,
      cooldowns: {},
      sessionCounts: {},
      dismissedPrompts: [];
  }));
  }, []);
  return {
  activePrompts: promptState.activePrompts,
  showPrompt,
  dismissPrompt,
  respondToPrompt,
  clearCooldowns,
  isPromptAllowed
};
};

export default useJustInTimeConsent;