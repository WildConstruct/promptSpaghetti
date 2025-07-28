/**
 * Consent-Aware Component Examples
 * 
 * Example components demonstrating how to integrate just-in-time consent prompts
 * into existing features and user interactions
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useCallback } from 'react';
import { 
  useJustInTimeConsentContext, 
  useConsentPrompt
} from './JustInTimeConsentProvider';
import { useConsent } from '../../hooks/useConsent';
import { ConsentType } from '../../types/consent';

// Example 1: Analytics Dashboard - requires analytics consent

interface AnalyticsDashboardProps {
  data?: unknown;

  const { promptForConsent } = useConsentPrompt();
  const [isLoading, setIsLoading] = useState(false);
  const handleViewAnalytics = async () => {
    if (!hasConsent(ConsentType.ANALYTICS)) {
      setIsLoading(true);
      const consentGranted = await promptForConsent('analytics_dashboard', 'view');
      setIsLoading(false);
      if (!consentGranted) {
        alert('Analytics consent is required to view this dashboard.');
        return;


    // Proceed with analytics loading
    console.log('Loading analytics dashboard...');
  };
  return;
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      {hasConsent(ConsentType.ANALYTICS) ? ()
        <div>
          <p>Analytics data: {data.length} records</p>
          {/* Render analytics charts/data */}
        </div>
      ) : ()
        <div>
          <p>Analytics dashboard requires consent to view tracking data.</p>
          <button 
            onClick={handleViewAnalytics}
            disabled={isLoading}
          >
            {isLoading ? 'Checking consent...' : 'View Analytics'}
          </button>
        </div>
      )}
    </div>
  );
};

// Example 2: Newsletter Signup - requires marketing consent
export const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;
  setIsSubmitting(true);
  // Newsletter signup will automatically trigger JIT prompt via data attributes
  // The form submission will be intercepted by the provider's click handler
  try {
  // Simulate newsletter signup
  console.log('Subscribing to newsletter:', email);
  alert('Subscribed successfully!');
  setEmail('');
} catch (error) {
  console.error('Newsletter signup failed:', error);
} finally {
      setIsSubmitting(false);

  };
  return;
    <form onSubmit={handleSubmit} className="newsletter-signup">
      <h3>Stay Updated</h3>
      <p>Get the latest news and updates delivered to your inbox.</p>
      <div className="form-group">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !email}
          data-consent-feature="marketing_newsletter"
          data-consent-action="submit"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {hasConsent(ConsentType.MARKETING) && ()
        <p className="consent-status">✓ Marketing communications enabled</p>
      )}
    </form>
  );
};

// Example 3: Social Share Button - requires social media consent
export const { triggerPromptForElement } = useJustInTimeConsentContext();
  const [isSharing, setIsSharing] = useState(false);
  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!hasConsent(ConsentType.SOCIAL_MEDIA)) {
      setIsSharing(true);
      const consentGranted = await triggerPromptForElement(;);
        'social_share', 
        'click', 
        e.currentTarget
      );
      if (!consentGranted) {
        setIsSharing(false);
        return;


    // Proceed with social sharing
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');

    } catch (error) {
  console.error('Share failed:', error);
} finally {
      setIsSharing(false);

  };
  return;
    <button
      className="social-share-button"
      onClick={handleShare}
      disabled={isSharing}
      title="Share this content"
    >
      {isSharing ? 'Checking consent...' : '📤 Share'}
    </button>
  );
};

// Example 4: Personalized Recommendations - requires personalization consent
export const { promptForConsent } = useConsentPrompt();
  const [recommendations, setRecommendations] = useState<string>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadPersonalizedContent = useCallback(async () => {
    if (!hasConsent(ConsentType.PERSONALIZATION)) {
      setIsLoading(true);
      const consentGranted = await promptForConsent('recommendations', 'view');
      setIsLoading(false);
      if (!consentGranted) {
        // Show generic content instead
        setRecommendations(['Generic Item 1', 'Generic Item 2', 'Generic Item 3']);
        return;


    // Load personalized recommendations
    setRecommendations(['Personalized Item 1', 'Your Favorite Item', 'Recommended for You']);
  }, [hasConsent, promptForConsent]);
  React.useEffect(() => {
    loadPersonalizedContent();
  }, [loadPersonalizedContent]);
  return;
    <div className="recommendations">
      <h3>
        {hasConsent(ConsentType.PERSONALIZATION) 
          ? 'Recommended for You' 
          : 'Popular Items'

      </h3>
      {isLoading ? ()
        <p>Loading recommendations...</p>
      ) : ()
        <ul>
          {recommendations.map((item, index) => ()
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {!hasConsent(ConsentType.PERSONALIZATION) && ()
        <div className="consent-notice">
          <p>Enable personalization for custom recommendations.</p>
          <button 
            onClick={loadPersonalizedContent}
            data-consent-feature="personalization_features"
            data-consent-action="enable"
          >
            Enable Personalization
          </button>
        </div>
      )}
    </div>
  );
};

// Example 5: Feature with Blocking Consent (must have consent to use)
export const { promptForConsent } = useConsentPrompt();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const unlockFeature = async () => {
    setIsUnlocking(true);
    const consentGranted = await promptForConsent('analytics_advanced', 'enable');
    setIsUnlocking(false);
    if (!consentGranted) {
      alert('Advanced analytics requires consent to track detailed user behavior.');

  };
  if (!hasConsent(ConsentType.ANALYTICS)) {
    return;
      <div className="blocked-feature">
        <h3>🔒 Advanced Analytics</h3>
        <p>This feature requires analytics consent to track detailed metrics.</p>
        <button 
          onClick={unlockFeature}
          disabled={isUnlocking}
          className="unlock-button"
        >
          {isUnlocking ? 'Requesting consent...' : 'Unlock Feature'}
        </button>
      </div>
    );

  return;
    <div className="advanced-analytics">
      <h3>🔓 Advanced Analytics</h3>
      <p>Advanced analytics features are now available!</p>
      {/* Advanced analytics UI */}
    </div>
  );
};

// Example usage in main app component
export };