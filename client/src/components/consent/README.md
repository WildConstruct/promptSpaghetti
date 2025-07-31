# Just-in-Time Consent System

A comprehensive GDPR-compliant consent management system with contextual just-in-time prompts that appear when users interact with features requiring specific consent types.

## Overview

This system provides:

- **Contextual Consent Prompts**: Prompts appear exactly when consent is needed
- **Multiple Display Modes**: Modal, banner, sidebar, tooltip, and inline styles
- **Automatic Trigger Detection**: Data attributes for declarative consent requirements
- **Flexible Configuration**: Cooldowns, session limits, and behavior customization
- **GDPR Compliance**: Proper consent tracking and user control

## Quick Start

### 1. Set Up the Provider

Wrap your application with the consent providers:

```tsx
import { ConsentBanner } from './components/consent/ConsentBanner';
import { JustInTimeConsentProvider } from './components/consent/JustInTimeConsentProvider';

function App() {
  return (
    <div className="App">
      <JustInTimeConsentProvider>
        {/* Your app content */}
        <MainContent />

        {/* Add consent banner for initial consent */}
        <ConsentBanner />
      </JustInTimeConsentProvider>
    </div>
  );
}
```

### 2. Use Declarative Data Attributes

Add data attributes to elements that require consent:

```tsx
// Analytics consent required
<button data-consent-feature="analytics_dashboard" data-consent-action="view">
  View Analytics
</button>

// Marketing consent required
<form data-consent-feature="marketing_newsletter" data-consent-action="submit">
  <input type="email" placeholder="Email" />
  <button type="submit">Subscribe</button>
</form>

// Social media consent required
<div data-consent-feature="social_sharing" data-consent-action="click">
  Share on Social Media
</div>
```

### 3. Use Programmatic API

For more control, use the hooks directly:

```tsx
import { useConsentPrompt } from './components/consent/JustInTimeConsentProvider';
import { useConsent } from './hooks/useConsent';

function MyComponent() {
  const { hasConsent } = useConsent();
  const { promptForConsent } = useConsentPrompt();

  const handleAnalyticsAction = async () => {
    if (!hasConsent(ConsentType.ANALYTICS)) {
      const granted = await promptForConsent('analytics_dashboard', 'view');
      if (!granted) return;
    }

    // Proceed with analytics action
    trackEvent('user_action');
  };

  return <button onClick={handleAnalyticsAction}>View Analytics</button>;
}
```

## Component Architecture

### Core Components

1. **JustInTimeConsentPrompt**: The actual prompt UI component
2. **JustInTimeConsentProvider**: Provider that manages prompt state and triggers
3. **ConsentBanner**: Main consent banner for initial consent collection
4. **ConsentPreferencesModal**: Detailed consent management interface

### Hooks

1. **useJustInTimeConsent**: Core hook for managing JIT prompts
2. **useConsent**: Main consent state management hook
3. **useConsentPrompt**: Utility hook for manual prompt triggering

## Configuration

### Prompt Configuration

Prompts are configured in `useJustInTimeConsent.ts`:

```typescript
const DEFAULT_PROMPT_CONFIGS: Record<string, JustInTimePromptConfig> = {
  analytics_view: {
    triggerId: 'analytics_view',
    title: 'Analytics Consent',
    message: 'Allow analytics tracking to help us improve your experience?',
    contexts: [
      {
        feature: 'analytics_dashboard',
        action: 'view',
      },
    ],
    appearance: {
      style: 'modal', // modal, banner, sidebar, tooltip, inline
      theme: 'light', // light, dark, auto
      size: 'medium', // small, medium, large
      showIcon: true,
      iconType: 'info', // info, warning, question, shield
    },
    behavior: {
      showOnce: false, // Show only once per session
      cooldownPeriod: 60, // Minutes before showing again
      maxShowsPerSession: 3, // Maximum shows per session
      requireResponse: true, // Block until user responds
      allowDismiss: true, // Allow dismissing without response
      blockInteraction: true, // Block original action until consent
    },
  },
};
```

### Consent Type Mapping

Map trigger IDs to consent types:

```typescript
const CONSENT_TYPE_MAPPING: Record<string, ConsentType> = {
  analytics_view: ConsentType.ANALYTICS,
  marketing_newsletter: ConsentType.MARKETING,
  social_sharing: ConsentType.SOCIAL_MEDIA,
  personalization_features: ConsentType.PERSONALIZATION,
};
```

For more examples and advanced usage patterns, see the `ConsentAwareComponent.tsx` file.
