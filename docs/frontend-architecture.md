# PromptScape Randomizer Graph — Frontend Architecture

_Epic 19: Privacy & Compliance UI/UX Strategy_  
_Version 1.0 · 2025-07-21_

---

## 1 · Frontend Architecture Overview

### 1.1 Core Frontend Preservation Strategy
**Existing React Architecture (UNCHANGED):**
```
Core PromptScape UI:
├── App.tsx (Main application - Enhanced, not replaced)
├── core/
│   ├── GraphEditor.tsx (CORE - React-Flow canvas)
│   ├── InspectorSidebar.tsx (CORE - Node properties)
│   ├── Palette.tsx (CORE - Node library) 
│   ├── PreviewModal.tsx (CORE - Prompt generation)
│   └── RandomizerPanel.tsx (CORE - LLM integration)
└── components/
    ├── GraphNode.tsx (CORE - Node rendering)
    ├── NodePalette.tsx (CORE - Drag/drop interface)
    └── StatusBar.tsx (CORE - Application status)
```

### 1.2 Epic 19 Privacy UI Integration (ADDITIVE)
**Privacy Component Hierarchy:**
```
Privacy & Compliance UI (Epic 19):
├── App.tsx (Enhanced with privacy providers)
├── components/
│   ├── consent/ (NEW - GDPR Compliance)
│   │   ├── ConsentBanner.tsx
│   │   ├── ConsentPreferencesModal.tsx
│   │   ├── JustInTimeConsentPrompt.tsx
│   │   ├── JustInTimeConsentProvider.tsx
│   │   ├── ConsentAwareComponent.tsx
│   │   └── GranularConsentInterface.tsx
│   ├── policy/ (NEW - Policy Management)
│   │   └── PolicyPreviewDashboard.tsx
│   ├── transparency/ (NEW - Data Rights)
│   │   └── UserDataTransparencyDashboard.tsx
│   └── preferences/ (NEW - User Control)
│       └── PreferenceCenter.tsx
├── hooks/ (NEW - Privacy State Management)
│   ├── useConsent.ts
│   └── useJustInTimeConsent.ts
├── types/ (NEW - TypeScript Definitions)
│   └── consent.ts
└── services/ (NEW - Frontend Privacy Logic)
    └── DeviceFingerprintService.ts
```

---

## 2 · Component Architecture Strategy

### 2.1 Non-Breaking Integration Pattern
**Component Injection Strategy:**
```typescript
// App.tsx Integration (Enhanced, not replaced)
export default function App() {
  return (
    <ReactFlowProvider>
      {/* Epic 19: Privacy Context Wrapper */}
      <JustInTimeConsentProvider>
        
        {/* Epic 19: Global Consent Banner */}
        <ConsentBanner />
        
        {/* EXISTING: Core application (UNCHANGED) */}
        <div style={{ width: '100vw', height: '100vh' }}>
          <TabNavigation />
          {activeTab === 'editor' && <GraphEditor />}
          {activeTab === 'randomizer' && <RandomizerPanel />}
        </div>
        
        {/* Epic 19: Privacy Modals & Prompts */}
        <ConsentPreferencesModal />
        <JustInTimeConsentPrompt />
        
      </JustInTimeConsentProvider>
    </ReactFlowProvider>
  );
}
```

### 2.2 Context-Driven Privacy Architecture
**Privacy State Management:**
```typescript
// JustInTimeConsentProvider.tsx - Global Privacy Context
interface ConsentContextValue {
  // Core consent state
  hasConsent: (type: ConsentType) => boolean;
  grantConsent: (type: ConsentType) => Promise<void>;
  revokeConsent: (type: ConsentType) => Promise<void>;
  
  // Just-in-time prompting
  promptForConsent: (feature: string, action: string) => Promise<boolean>;
  isPromptVisible: boolean;
  promptConfig: JustInTimePromptConfig | null;
  
  // User preferences
  preferences: ConsentPreferences;
  updatePreferences: (prefs: ConsentPreferences) => Promise<void>;
}

// Usage in any component
const ConsentAwareFeature: React.FC = () => {
  const { hasConsent, promptForConsent } = useConsent();
  
  const handleAnalyticsAction = async () => {
    if (!hasConsent(ConsentType.ANALYTICS)) {
      const granted = await promptForConsent('analytics_view', 'click');
      if (!granted) return;
    }
    // Proceed with action
  };
};
```

### 2.3 Component Responsibility Matrix
| Component | Responsibility | Integration Method | Core Impact |
|-----------|----------------|-------------------|-------------|
| **ConsentBanner** | GDPR compliance banner | Global overlay | Zero - dismissible |
| **JustInTimePrompts** | Contextual consent | Event-triggered | Minimal - user choice |
| **PolicyDashboard** | Enterprise policy mgmt | Admin route | Zero - separate route |
| **TransparencyDashboard** | Data rights interface | User account route | Zero - separate route |
| **PreferenceCenter** | Granular controls | Settings route | Zero - separate route |

---

## 3 · UI/UX Design System Integration

### 3.1 Design System Consistency
**Visual Integration Strategy:**
```css
/* Epic 19 CSS Integration - Inherits existing design tokens */

/* Consent Components use existing color palette */
.consent-banner {
  background: var(--background-primary);   /* Existing token */
  border: 1px solid var(--border-subtle);  /* Existing token */
  font-family: var(--font-primary);        /* Existing token */
}

/* Privacy modals match existing modal styling */
.consent-modal {
  backdrop-filter: var(--backdrop-blur);   /* Existing token */
  border-radius: var(--border-radius-lg);  /* Existing token */
  box-shadow: var(--shadow-modal);         /* Existing token */
}

/* Just-in-time prompts use existing notification styling */
.jit-consent-prompt {
  background: var(--notification-bg);      /* Existing token */
  color: var(--notification-text);         /* Existing token */
}
```

### 3.2 Responsive Design Strategy
**Multi-Device Privacy Experience:**
```typescript
// Responsive consent component architecture
interface ConsentDisplayConfig {
  mobile: {
    style: 'banner' | 'fullscreen';
    position: 'bottom' | 'top';
    dismissible: boolean;
  };
  tablet: {
    style: 'modal' | 'sidebar';
    position: 'center' | 'right';
    width: string;
  };
  desktop: {
    style: 'modal' | 'tooltip' | 'inline';
    position: 'center' | 'contextual';
    maxWidth: string;
  };
}
```

### 3.3 Accessibility Integration
**WCAG 2.1 AA Compliance:**
```typescript
// Accessibility-first privacy components
export const ConsentBanner: React.FC = () => {
  return (
    <div
      role="banner"
      aria-label="Cookie and privacy consent"
      aria-live="polite"
      tabIndex={0}
    >
      <h2 id="consent-title">Your Privacy Choices</h2>
      <p aria-describedby="consent-title">
        We respect your privacy. Choose which cookies you accept.
      </p>
      
      {/* Keyboard navigation */}
      <div role="group" aria-labelledby="consent-buttons">
        <button aria-label="Accept all cookies">Accept All</button>
        <button aria-label="Reject non-essential cookies">Reject All</button>
        <button aria-label="Customize cookie preferences">Customize</button>
      </div>
    </div>
  );
};
```

---

## 4 · User Experience Flow Integration

### 4.1 User Journey Preservation
**Core User Experience (UNCHANGED):**
```
Existing Flow:
1. User opens PromptScape
2. Creates/edits prompt graph
3. Previews generated prompts
4. Exports/saves graph

Epic 19 Enhanced Flow (OPTIONAL):
1. User opens PromptScape
2. [OPTIONAL] Consent banner (dismissible)
3. Creates/edits prompt graph (UNCHANGED)
4. [CONTEXTUAL] Just-in-time consent for analytics
5. Previews generated prompts (UNCHANGED)
6. [OPTIONAL] Privacy dashboard access
7. Exports/saves graph (UNCHANGED)
```

### 4.2 Just-in-Time Consent UX Pattern
**Contextual Privacy Prompts:**
```typescript
// Declarative consent requirements
export const AnalyticsButton: React.FC = () => {
  return (
    <button
      data-consent-feature="analytics_dashboard"
      data-consent-action="view"
      className="core-button" // Existing styling
    >
      View Analytics
      {/* Just-in-time prompt appears automatically */}
    </button>
  );
};

// Programmatic consent checking
export const AdvancedFeature: React.FC = () => {
  const { hasConsent, promptForConsent } = useConsent();
  
  const handleFeatureAccess = async () => {
    // Check consent first
    if (!hasConsent(ConsentType.PERSONALIZATION)) {
      const granted = await promptForConsent('personalization', 'access');
      if (!granted) {
        // Gracefully fallback to basic functionality
        showBasicVersion();
        return;
      }
    }
    
    // Proceed with personalized experience
    showPersonalizedVersion();
  };
};
```

### 4.3 Progressive Disclosure Strategy
**Tiered Privacy Experience:**
```typescript
interface PrivacyDisclosureLevel {
  BASIC: {
    components: ['ConsentBanner'];
    features: ['essential_cookies'];
    userType: 'basic';
  };
  STANDARD: {
    components: ['ConsentBanner', 'JustInTimePrompts'];
    features: ['analytics', 'preferences'];
    userType: 'standard';
  };
  ENTERPRISE: {
    components: ['Full Privacy Suite'];
    features: ['policy_mgmt', 'audit_logs', 'compliance_reports'];
    userType: 'enterprise';
  };
}
```

---

## 5 · State Management Integration

### 5.1 Privacy State Architecture
**Isolated Privacy State:**
```typescript
// Privacy state separate from core graph state
interface AppState {
  // Existing core state (UNCHANGED)
  graph: GraphState;
  editor: EditorState;
  preview: PreviewState;
  
  // Epic 19: Privacy state (NEW - isolated)
  privacy: {
    consent: ConsentState;
    preferences: PreferenceState;
    policies: PolicyState;
    audit: AuditState;
  };
}

// Privacy state management
const usePrivacyState = () => {
  const [consentState, setConsentState] = useState<ConsentState>();
  const [preferences, setPreferences] = useState<PreferenceState>();
  
  // Persisted to separate privacy storage
  useEffect(() => {
    loadPrivacyState(); // Separate from graph state
  }, []);
};
```

### 5.2 Cross-Component Communication
**Event-Driven Privacy Integration:**
```typescript
// Privacy event system
enum PrivacyEvent {
  CONSENT_GRANTED = 'privacy:consent_granted',
  CONSENT_REVOKED = 'privacy:consent_revoked',
  POLICY_UPDATED = 'privacy:policy_updated',
  DATA_REQUESTED = 'privacy:data_requested'
}

// Core components can listen to privacy events
const GraphEditor: React.FC = () => {
  useEffect(() => {
    const handleConsentChange = (event: ConsentEvent) => {
      if (event.type === ConsentType.ANALYTICS) {
        // Adjust analytics collection
        toggleAnalytics(event.granted);
      }
    };
    
    PrivacyEventBus.subscribe(PrivacyEvent.CONSENT_GRANTED, handleConsentChange);
    return () => PrivacyEventBus.unsubscribe(PrivacyEvent.CONSENT_GRANTED, handleConsentChange);
  }, []);
};
```

---

## 6 · Performance Integration Strategy

### 6.1 Lazy Loading Architecture
**On-Demand Privacy Components:**
```typescript
// Lazy load privacy components to avoid bundle bloat
const ConsentPreferencesModal = lazy(() => 
  import('./components/consent/ConsentPreferencesModal')
);
const PolicyPreviewDashboard = lazy(() => 
  import('./components/policy/PolicyPreviewDashboard')
);
const TransparencyDashboard = lazy(() => 
  import('./components/transparency/UserDataTransparencyDashboard')
);

// Load only when needed
const App: React.FC = () => {
  const [showPrivacyFeatures, setShowPrivacyFeatures] = useState(false);
  
  return (
    <div>
      {/* Core components load immediately */}
      <GraphEditor />
      <InspectorSidebar />
      
      {/* Privacy components load on-demand */}
      <Suspense fallback={<PrivacyLoadingSpinner />}>
        {showPrivacyFeatures && <ConsentPreferencesModal />}
        {showPrivacyFeatures && <PolicyPreviewDashboard />}
      </Suspense>
    </div>
  );
};
```

### 6.2 Bundle Splitting Strategy
**Privacy Feature Code Splitting:**
```typescript
// webpack.config.js - Split privacy features into separate chunk
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Core functionality (always loaded)
        core: {
          name: 'core',
          test: /[\\/]src[\\/](core|components[\\/](GraphNode|StatusBar))[\\/]/,
          priority: 30
        },
        // Privacy features (lazy loaded)
        privacy: {
          name: 'privacy',
          test: /[\\/]src[\\/]components[\\/](consent|policy|transparency)[\\/]/,
          priority: 20
        }
      }
    }
  }
};
```

### 6.3 Performance Monitoring Integration
**Privacy Impact Tracking:**
```typescript
// Monitor performance impact of privacy features
export const PerformanceAwarePrivacyComponent: React.FC = () => {
  const { measurePrivacyOperation } = usePrivacyPerformance();
  
  const handleConsentCheck = async () => {
    const measurement = await measurePrivacyOperation('consent_check', async () => {
      return await checkUserConsent();
    });
    
    // Alert if privacy operations slow down core functionality
    if (measurement.duration > 100) {
      console.warn('Privacy check taking too long:', measurement);
    }
  };
};
```

---

## 7 · Testing Strategy Integration

### 7.1 Component Testing Approach
**Privacy Component Test Coverage:**
```typescript
// ConsentBanner.test.tsx
describe('ConsentBanner Integration', () => {
  it('should not interfere with core graph functionality', () => {
    render(
      <JustInTimeConsentProvider>
        <GraphEditor />
        <ConsentBanner />
      </JustInTimeConsentProvider>
    );
    
    // Core functionality should work normally
    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('node-palette')).toBeInTheDocument();
    
    // Privacy banner should be dismissible
    const banner = screen.getByRole('banner');
    const dismissButton = screen.getByLabelText('Dismiss consent banner');
    fireEvent.click(dismissButton);
    
    expect(banner).not.toBeInTheDocument();
  });
  
  it('should preserve core workflows when consent is denied', async () => {
    // Test that denying consent doesn't break core features
  });
});
```

### 7.2 Integration Testing Strategy
**End-to-End Privacy Flows:**
```typescript
// e2e/privacy-integration.spec.ts
describe('Privacy Feature Integration', () => {
  test('basic user can use core features without privacy interruption', async () => {
    await page.goto('/');
    
    // Dismiss privacy banner
    await page.click('[aria-label="Dismiss consent banner"]');
    
    // Core functionality should work normally
    await page.click('[data-testid="add-node-button"]');
    await page.fill('[data-testid="node-text-input"]', 'test prompt');
    await page.click('[data-testid="preview-button"]');
    
    // Should generate prompts without privacy interference
    await expect(page.locator('[data-testid="preview-results"]')).toBeVisible();
  });
  
  test('enterprise user can access privacy features', async () => {
    // Test full privacy feature access
  });
});
```

### 7.3 Accessibility Testing Integration
**Privacy A11y Compliance:**
```typescript
// accessibility/privacy-a11y.test.ts
describe('Privacy Component Accessibility', () => {
  test('consent banner is keyboard navigable', async () => {
    render(<ConsentBanner />);
    
    // Tab navigation should work
    await user.tab();
    expect(screen.getByLabelText('Accept all cookies')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText('Reject non-essential cookies')).toHaveFocus();
    
    // Screen reader announcements
    expect(screen.getByRole('banner')).toHaveAttribute('aria-live', 'polite');
  });
  
  test('just-in-time prompts maintain focus management', async () => {
    // Test focus trapping and restoration
  });
});
```

---

## 8 · Migration & Rollback Strategy

### 8.1 Feature Flag Integration
**Frontend Feature Toggling:**
```typescript
// FeatureFlags.ts
interface PrivacyFeatureFlags {
  SHOW_CONSENT_BANNER: boolean;
  ENABLE_JIT_PROMPTS: boolean;
  SHOW_POLICY_DASHBOARD: boolean;
  SHOW_TRANSPARENCY_TOOLS: boolean;
  ENABLE_PREFERENCE_CENTER: boolean;
}

// App.tsx with feature flags
export default function App() {
  const { privacyFlags } = useFeatureFlags();
  
  return (
    <ReactFlowProvider>
      {privacyFlags.SHOW_CONSENT_BANNER && <ConsentBanner />}
      
      <GraphEditor /> {/* Always present */}
      
      {privacyFlags.ENABLE_JIT_PROMPTS && (
        <JustInTimeConsentProvider>
          {/* Privacy-aware components */}
        </JustInTimeConsentProvider>
      )}
    </ReactFlowProvider>
  );
}
```

### 8.2 Graceful Degradation
**Privacy-Optional Experience:**
```typescript
// Privacy components with fallback behavior
export const PrivacyAwareAnalytics: React.FC = () => {
  const { hasConsent, isPrivacyEnabled } = useConsent();
  
  if (!isPrivacyEnabled) {
    // Privacy framework disabled - show basic analytics
    return <BasicAnalyticsView />;
  }
  
  if (!hasConsent(ConsentType.ANALYTICS)) {
    // Privacy enabled but consent denied - show placeholder
    return <AnalyticsPlaceholder />;
  }
  
  // Privacy enabled and consent granted - full experience
  return <FullAnalyticsView />;
};
```

### 8.3 Data Migration Strategy
**Frontend State Migration:**
```typescript
// Privacy state migration utilities
export const migratePrivacyState = (version: string) => {
  switch (version) {
    case '1.0':
      // Migrate from no privacy state to Epic 19 privacy state
      return {
        consent: getDefaultConsentState(),
        preferences: getDefaultPreferences(),
        version: '1.0'
      };
    case '0.9':
      // Rollback privacy state if needed
      return null;
  }
};
```

---

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-21 | 1.0 | Initial frontend architecture for Epic 19 privacy UI integration | PO-Sarah |

---

**Next Steps:**
1. **Integration risk assessment** for Epic 19 rollback procedures
2. **Business priority validation** for privacy feature scope
3. **User feedback mechanism** setup for consent system changes
4. **Performance testing** for privacy UI impact on core workflows

This frontend architecture ensures Epic 19 privacy features integrate seamlessly with the existing PromptScape UI while maintaining the core user experience and providing enterprise-grade privacy controls.