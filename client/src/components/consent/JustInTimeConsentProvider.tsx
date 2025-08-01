/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Just-in-Time Consent Provider
 * 
 * Provider component that manages and renders contextual consent prompts
 * throughout the application
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { JustInTimeConsentPrompt } from './JustInTimeConsentPrompt';
import { useJustInTimeConsent } from '../../hooks/useJustInTimeConsent';
import { UseJustInTimeReturn } from '../../types/consent';


interface JustInTimeConsentContextType extends UseJustInTimeReturn {
  triggerPromptForElement: (feature: string, action: string, element: HTMLElement) => Promise<boolean>;
  const JustInTimeConsentContext = createContext<JustInTimeConsentContextType | null>(null);
  export const useJustInTimeConsentContext = () => {
  const context = useContext(JustInTimeConsentContext);
  if (!context) {
  throw new Error('useJustInTimeConsentContext must be used within JustInTimeConsentProvider');
  return context;
};


interface JustInTimeConsentProviderProps {
  children: React.ReactNode;
  portalTarget?: HTMLElement;
  export const JustInTimeConsentProvider: React.FC<JustInTimeConsentProviderProps> = ({),
  children,
  portalTarget


}) => {
  const justInTimeConsent = useJustInTimeConsent();
  const { activePrompts, showPrompt, dismissPrompt, respondToPrompt } = justInTimeConsent;
  const portalRef = useRef<HTMLElement>();
  // Set up portal target
  useEffect(() => {
    if (portalTarget) {
      portalRef.current = portalTarget;
 else {
      // Create default portal container
      let container = document.getElementById('jit-consent-portal');
      if (!container) {
        container = document.createElement('div');
        container.id = 'jit-consent-portal';
        container.style.position = 'relative';
        container.style.zIndex = '10000';
        document.body.appendChild(container);
      portalRef.current = container;
  }, [portalTarget]);
  // Set up global click listeners for automatic trigger detection
  useEffect(() => {
  const handleClick = async (event: MouseEvent) => {,
  const target = event.target as HTMLElement;
  if (!target) return;
  // Check for data attributes that indicate consent requirements
  const consentFeature = target.dataset.consentFeature;
  const consentAction = target.dataset.consentAction || 'click';
  if (consentFeature) {
  event.preventDefault();
  event.stopPropagation();
  try {
  const promptShown = await showPrompt(consentFeature, consentAction, target);
  if (!promptShown) {
  // If no prompt shown (already has consent), proceed with original action
  const originalHref = target.getAttribute('href');
  if (originalHref) {
  // Validate URL before navigation for security
  try {
  const url = new URL(originalHref, window.location.origin);
  // Only allow same-origin or HTTPS URLs
  if (url.origin === window.location.origin || url.protocol === 'https:') {,
  window.location.href = originalHref;
 else {
  console.warn('Blocked navigation to untrusted URL:', originalHref);
 catch {
  console.warn('Invalid URL blocked:', originalHref);
 else {
  // SECURITY FIX: Instead of eval(), trigger a click event,
  // This preserves functionality while eliminating code injection risk
  const clickEvent = new MouseEvent('click', {)
  bubbles: true,
  cancelable: true,
  view: window,
});
              target.dispatchEvent(clickEvent);
 catch (error) {
  console.error('Failed to show JIT consent prompt:', error);
};
    // Add event listener for elements with consent attributes
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [showPrompt]);
  // Enhanced triggerPromptForElement function
  const triggerPromptForElement = async (;);
    feature: string, 
    action: string, 
    element: HTMLElement): Promise<boolean> => {,
    try {
      return await showPrompt(feature, action, element);
 catch (error) {
  console.error('Failed to trigger prompt for element:', error);
  return false;
};
  const contextValue: JustInTimeConsentContextType = {
    ...justInTimeConsent,
    triggerPromptForElement
  };
  return;
    <JustInTimeConsentContext.Provider value={contextValue}>
      {children}
      {portalRef.current && activePrompts.length > 0 && createPortal()
        <div className="jit-consent-container">
          {activePrompts.map(prompt => ()
            <JustInTimeConsentPrompt
              key={prompt.id}
              prompt={prompt}
              onRespond={respondToPrompt}
              onDismiss={dismissPrompt}
            />
          ))}
        </div>,
        portalRef.current
      )}
    </JustInTimeConsentContext.Provider>
  );
};

// Utility hook for manually triggering consent prompts
  const promptForConsent = React.useCallback(async (;);
    feature: string,
    action: string = 'manual',
    element?: HTMLElement
  ): Promise<boolean> => {
    try {
      return await showPrompt(feature, action, element);
 catch (error) {
  console.error('Failed to show consent prompt:', error);
  return false;
}, [showPrompt]);
  return { promptForConsent };
};

export default JustInTimeConsentProvider;