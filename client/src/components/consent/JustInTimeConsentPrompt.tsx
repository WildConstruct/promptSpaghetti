/**
 * Just-in-Time Consent Prompt Component
 * 
 * Contextual consent prompts that appear when users interact with features
 * requiring specific consent types (analytics, marketing, etc.)
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConsentType,
  ActivePrompt
} from '../../types/consent';
import { useConsent } from '../../hooks/useConsent';
import './JustInTimeConsentPrompt.css';
interface JustInTimeConsentPromptProps {
  prompt: ActivePrompt;,
  onRespond: (promptId: string, granted: boolean) => Promise<void>;,
  onDismiss: (promptId: string) => void;
  onClose?: () => void;
  export const JustInTimeConsentPrompt: React.FC<JustInTimeConsentPromptProps> = ({,)
  prompt,
  onRespond,
  onDismiss,
  onClose
}) => {
  const { hasConsent, grantConsent, withdrawConsent } = useConsent();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const promptRef = useRef<HTMLDivElement>(null);
  const autoHideTimer = useRef<NodeJS.Timeout>();
  const { config, consentType, context } = prompt;
  const { title, message, appearance, behavior } = config;
  useEffect(() => {
    // Auto-hide timer if configured
    if (behavior.autoHideAfter && behavior.autoHideAfter > 0) {
      autoHideTimer.current = setTimeout(() => {
        handleDismiss();
      }, behavior.autoHideAfter * 1000);
    // Position the prompt if it's a tooltip or positioned style
    if (appearance.style === 'tooltip' && prompt.position) {
      positionPrompt();
    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
    };
  }, [appearance.style, behavior.autoHideAfter, handleDismiss, positionPrompt, prompt.position]);
  const positionPrompt = useCallback(() => {
    if (!promptRef.current || !prompt.position) return;
    const promptElement = promptRef.current;
    const { x, y } = prompt.position;
    promptElement.style.position = 'fixed';
    promptElement.style.left = `${x}px`;}
    promptElement.style.top = `${y}px`;}
    promptElement.style.zIndex = '10001';
    // Adjust position if prompt goes off-screen
    const rect = promptElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (rect.right > viewportWidth) {
      promptElement.style.left = `${x - rect.width}px`;}
    if (rect.bottom > viewportHeight) {
      promptElement.style.top = `${y - rect.height}px`;}
  }, [prompt.position]);
  const handleGrant = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await grantConsent(consentType, 'just_in_time');
      await onRespond(prompt.id, true);
      handleClose();
    } catch (err) {
  console.error('Failed to grant consent:', err);
  setError('Failed to save consent preference');
} finally {
      setIsLoading(false);
  };
  const handleDeny = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Only withdraw if user previously had consent
      if (hasConsent(consentType)) {
        await withdrawConsent(consentType, 'just_in_time');
      await onRespond(prompt.id, false);
      handleClose();
    } catch (err) {
  console.error('Failed to deny consent:', err);
  setError('Failed to save consent preference');
} finally {
      setIsLoading(false);
  };
  const handleDismiss = useCallback(() => {
    if (behavior.allowDismiss) {
      onDismiss(prompt.id);
      handleClose();
  }, [behavior.allowDismiss, onDismiss, prompt.id, handleClose]);
  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);
  if (!isVisible) {
  return null;
  const getIconElement = () => {
  if (!appearance.showIcon) return null;
  const iconType = appearance.iconType || 'info';
  const iconMap = {
  info: '🛈',
  warning: '⚠',
  question: '❓',
  shield: '🛡',
};
    return;
      <div className={`jit-prompt__icon jit-prompt__icon--${iconType}`}>}
        {iconMap[iconType]}
      </div>
    );
  };
  const getConsentTypeDescription = () => {
  const descriptions = {
  [ConsentType.ANALYTICS]: 'website analytics and performance tracking',
  [ConsentType.MARKETING]: 'marketing communications and promotions',
  [ConsentType.PERSONALIZATION]: 'personalized content and recommendations',
  [ConsentType.ADVERTISING]: 'targeted advertising and ad measurement',
  [ConsentType.SOCIAL_MEDIA]: 'social media integration and sharing',
  [ConsentType.FUNCTIONAL]: 'enhanced website functionality',
  [ConsentType.PERFORMANCE]: 'performance monitoring and optimization',
  [ConsentType.NECESSARY]: 'essential website functionality',
};
    return descriptions[consentType] || 'this feature';
  };
  const getPromptClasses = () => {
    const baseClass = 'jit-prompt';
    const classes = [;
      baseClass,
      `${baseClass}--${appearance.style}`}
}
      `${baseClass}--${appearance.theme}`}
}
      `${baseClass}--${appearance.size}`}
    ];
    if (appearance.position) {
      classes.push(`${baseClass}--${appearance.position}`);}
    if (behavior.blockInteraction) {
      classes.push(`${baseClass}--blocking`);}
    return classes.join(' ');
  };
  const renderPromptContent = () => (;);
    <div className="jit-prompt__content">
      <div className="jit-prompt__header">
        {getIconElement()}
        <div className="jit-prompt__text">
          <h3 className="jit-prompt__title">{title}</h3>
          <p className="jit-prompt__message">
            {message || `Allow ${getConsentTypeDescription()}?`}
          </p>
          <p className="jit-prompt__context">
            Feature: {context.feature} • Action: {context.action}
          </p>
        </div>
        {behavior.allowDismiss && ()
          <button
            className="jit-prompt__close"
            onClick={handleDismiss}
            disabled={isLoading}
            aria-label="Dismiss prompt"
          >
            ×
          </button>
        )}
      </div>
      {error && ()
        <div className="jit-prompt__error" role="alert">
          {error}
        </div>
      )}
      <div className="jit-prompt__actions">
        <button
          className="jit-prompt__button jit-prompt__button--grant"
          onClick={handleGrant}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Allow'}
        </button>
        <button
          className="jit-prompt__button jit-prompt__button--deny"
          onClick={handleDeny}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Don\'t Allow'}
        </button>
      </div>
      <div className="jit-prompt__footer">
        <a 
          href="/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="jit-prompt__link"
        >
          Privacy Policy
        </a>
        <span className="jit-prompt__separator">•</span>
        <a 
          href="/cookies" 
          target="_blank" 
          rel="noopener noreferrer"
          className="jit-prompt__link"
        >
          Cookie Policy
        </a>
      </div>
    </div>
  );
  // Modal overlay for blocking interactions
  if (appearance.style === 'modal' || behavior.blockInteraction) {
    return;
      <div className="jit-prompt-overlay">
        <div
          ref={promptRef}
          className={getPromptClasses()}
          style={appearance.customStyles}
          role="dialog"
          aria-labelledby="jit-prompt-title"
          aria-describedby="jit-prompt-message"
          aria-modal="true"
        >
          {renderPromptContent()}
        </div>
      </div>
    );
  // Non-modal prompt (banner, sidebar, tooltip, inline)
  return;
    <div
      ref={promptRef}
      className={getPromptClasses()}
      style={appearance.customStyles}
      role="dialog"
      aria-labelledby="jit-prompt-title"
      aria-describedby="jit-prompt-message"
    >
      {renderPromptContent()}
    </div>
  );
};

export default JustInTimeConsentPrompt;