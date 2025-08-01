/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Cookie/Consent Banner Component
 * 
 * GDPR-compliant consent banner with granular controls and preference management
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect } from 'react';
import { ConsentType, ConsentBannerState, ConsentConfiguration } from '../../types/consent';
import { useConsent } from '../../hooks/useConsent';
import { ConsentPreferencesModal } from './ConsentPreferencesModal';
import './ConsentBanner.css';


interface ConsentBannerProps {
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onCustomize?: () => void;
  onClose?: () => void;
  export const ConsentBanner: React.FC<ConsentBannerProps> = ({),
  onAcceptAll,
  onRejectAll,
  onCustomize,
  onClose


}) => {
  const {
  preferences,
  isLoading,
  error: _error, // eslint-disable-line @typescript-eslint/no-unused-vars,
  hasConsent,
  grantConsent,
  withdrawConsent,
  updatePreferences,
  refreshConfig
 = useConsent();
  const [bannerState, setBannerState] = useState<ConsentBannerState>({)
  isVisible: true,
  mode: 'compact',
  hasInteracted: false,
  showPreferences: false,
  isLoading: false,
  error: undefined,
});
  const [config] = useState<ConsentConfiguration | null>(null);
  useEffect(() => {
    // Load configuration and check if banner should be shown
    const initializeBanner = async () => {
      setBannerState(prev => ({ ...prev, isLoading: true }));
      try {
  await refreshConfig();
  // Check if user has already interacted with consent
  const hasInteracted = preferences && Object.keys(preferences.consents).length > 0;
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  hasInteracted: Boolean(hasInteracted),
  isVisible: !hasInteracted,
}));
 catch (error) {
  console.error('Failed to initialize consent banner:', error);
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  error: 'Failed to load consent configuration',
}));
    };
    initializeBanner();
  }, [preferences, refreshConfig]);
  const handleAcceptAll = async () => {
    setBannerState(prev => ({ ...prev, isLoading: true }));
    try {
  // Grant consent for all non-essential types
  const consentTypes = Object.values(ConsentType).filter(type => type !== ConsentType.NECESSARY);
  for (const type of consentTypes) {
  await grantConsent(type, 'banner');
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  hasInteracted: true,
  isVisible: false,
}));
      onAcceptAll?.();
 catch (error) {
  console.error('Failed to accept all consents:', error);
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  error: 'Failed to save consent preferences',
}));
  };
  const handleRejectAll = async () => {
    setBannerState(prev => ({ ...prev, isLoading: true }));
    try {
  // Withdraw consent for all non-essential types
  const consentTypes = Object.values(ConsentType).filter(type => type !== ConsentType.NECESSARY);
  for (const type of consentTypes) {
  if (hasConsent(type)) {
  await withdrawConsent(type, 'banner');
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  hasInteracted: true,
  isVisible: false,
}));
      onRejectAll?.();
 catch (error) {
  console.error('Failed to reject consents:', error);
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  error: 'Failed to save consent preferences',
}));
  };
  const handleCustomize = () => {
    setBannerState(prev => ({ ...prev, showPreferences: true }));
    onCustomize?.();
  };
  const handleClosePreferences = () => {
    setBannerState(prev => ({ ...prev, showPreferences: false }));
  };
  const handleSavePreferences = async (updatedPreferences: unknown) => {
    setBannerState(prev => ({ ...prev, isLoading: true }));
    try {
  await updatePreferences(updatedPreferences);
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  hasInteracted: true,
  isVisible: false,
  showPreferences: false,
}));
 catch (error) {
  console.error('Failed to save preferences:', error);
  setBannerState(prev => ({)
  ...prev,
  isLoading: false,
  error: 'Failed to save consent preferences',
}));
  };
  const handleClose = () => {
    setBannerState(prev => ({ ...prev, isVisible: false }));
    onClose?.();
  };
  // Don't render if not visible or still loading initial state
  if (!bannerState.isVisible || isLoading) {
    return null;
  const bannerConfig = config?.bannerConfig;
  const content = bannerConfig?.content;
  return;
    <>
      <div 
        className={`consent-banner consent-banner--${bannerConfig?.position || 'bottom'} consent-banner--${bannerConfig?.theme || 'light'}`}
        style={{
  backgroundColor: bannerConfig?.styling?.backgroundColor,
  color: bannerConfig?.styling?.textColor,
  borderRadius: bannerConfig?.styling?.borderRadius,
  fontSize: bannerConfig?.styling?.fontSize,
  fontFamily: bannerConfig?.styling?.fontFamily,
  zIndex: bannerConfig?.styling?.zIndex || 9999,
  boxShadow: bannerConfig?.styling?.boxShadow,

        role="dialog"
        aria-labelledby="consent-banner-title"
        aria-describedby="consent-banner-description"
      >
        <div className="consent-banner__container">
          {bannerConfig?.layout?.showLogo && ()
            <div className="consent-banner__logo">
              <img src="/logo.svg" alt="Company Logo" />
            </div>
          )}
          <div className="consent-banner__content">
            <h2 id="consent-banner-title" className="consent-banner__title">
              {content?.title || 'Cookie Consent'}
            </h2>
            <p id="consent-banner-description" className="consent-banner__message">
              {content?.message || 'We use cookies to enhance your experience and analyze our traffic.'}
            </p>
            {bannerState.error && ()
              <div className="consent-banner__error" role="alert">
                {bannerState.error}
              </div>
            )}
            <div className="consent-banner__links">
              <a 
                href={content?.privacyPolicyUrl || '/privacy'} 
                className="consent-banner__link"
                style={{ color: bannerConfig?.styling?.linkColor }}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <a 
                href={content?.cookiePolicyUrl || '/cookies'} 
                className="consent-banner__link"
                style={{ color: bannerConfig?.styling?.linkColor }}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Cookie Policy
              </a>
            </div>
          </div>
          <div className={`consent-banner__actions consent-banner__actions--${bannerConfig?.layout?.buttonsLayout || 'horizontal'}`}>}
            {bannerConfig?.enableAcceptAll !== false && ()
              <button
                className="consent-banner__button consent-banner__button--primary"
                onClick={handleAcceptAll}
                disabled={bannerState.isLoading}
                style={{
  backgroundColor: bannerConfig?.styling?.primaryButtonColor,
  color: bannerConfig?.styling?.primaryButtonTextColor,
}
                aria-label="Accept all cookies"
              >
                {bannerState.isLoading ? 'Saving...' : (content?.acceptAllText || 'Accept All')}
              </button>
            )}
            {bannerConfig?.enableRejectAll !== false && ()
              <button
                className="consent-banner__button consent-banner__button--secondary"
                onClick={handleRejectAll}
                disabled={bannerState.isLoading}
                style={{
  backgroundColor: bannerConfig?.styling?.secondaryButtonColor,
  color: bannerConfig?.styling?.secondaryButtonTextColor,
}
                aria-label="Reject all non-essential cookies"
              >
                {content?.rejectAllText || 'Reject All'}
              </button>
            )}
            {bannerConfig?.enableCustomize !== false && ()
              <button
                className="consent-banner__button consent-banner__button--secondary"
                onClick={handleCustomize}
                disabled={bannerState.isLoading}
                style={{
  backgroundColor: bannerConfig?.styling?.secondaryButtonColor,
  color: bannerConfig?.styling?.secondaryButtonTextColor,
}
                aria-label="Customize cookie preferences"
              >
                {content?.customizeText || 'Customize'}
              </button>
            )}
            {bannerConfig?.layout?.showCloseButton && ()
              <button
                className="consent-banner__button consent-banner__button--close"
                onClick={handleClose}
                disabled={bannerState.isLoading}
                aria-label="Close consent banner"
                title="Close"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      {bannerState.showPreferences && ()
        <ConsentPreferencesModal
          isOpen={bannerState.showPreferences}
          onClose={handleClosePreferences}
          onSave={handleSavePreferences}
          preferences={preferences}
          config={config}
        />
      )}
    </>
  );
};

export default ConsentBanner;