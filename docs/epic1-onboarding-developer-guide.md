# Epic 1 Onboarding System - Developer Guide

## Overview

The Epic 1 onboarding system provides a comprehensive framework for user education, featuring interactive tutorials, contextual tooltips, keyboard shortcuts, and progress tracking. This guide explains how to integrate and extend these features.

## Architecture

### Component Structure
```
packages/core/components/epic1/onboarding/
├── TutorialContext.tsx          # Tutorial state management
├── TutorialOverlay.tsx          # Step-by-step overlay
├── ContextualTooltips.tsx       # Smart tooltip system
├── TooltipManager.tsx           # Centralized tooltip control
├── KeyboardShortcutReference.tsx # Shortcut help overlay
├── KeyboardShortcutManager.tsx  # Shortcut registration
├── ProgressTracker.tsx          # User progress tracking
├── SuccessCelebration.tsx       # Achievement celebrations
├── OnboardingIntegration.tsx    # Main integration wrapper
└── index.ts                     # Public exports
```

## Integration Guide

### Basic Setup

```tsx
import { OnboardingIntegration } from '@core/components/epic1/onboarding';

export const App = () => {
  return (
    <OnboardingIntegration>
      <YourGraphEditor />
    </OnboardingIntegration>
  );
};
```

This wrapper provides:
- Tutorial state management
- Keyboard shortcut handling
- Tooltip system
- Progress tracking
- Achievement celebrations

### Tutorial System

#### Creating Tutorial Steps

```typescript
const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt Spaghetti!',
    description: 'Let\'s learn inline editing',
    target: '.canvas-container',
    position: 'center',
    action: 'Next',
    validation: () => true,
  },
  {
    id: 'paste-prompt',
    title: 'Paste Your First Prompt',
    description: 'Copy and paste text here',
    target: '.paste-area',
    position: 'bottom',
    action: 'Paste the medieval prompt',
    validation: () => document.querySelectorAll('.node').length > 0,
  },
];
```

#### Using Tutorial Context

```tsx
import { useTutorial } from '@core/components/epic1/onboarding';

const MyComponent = () => {
  const { 
    currentStep, 
    progress, 
    nextStep, 
    skipTutorial,
    resetTutorial 
  } = useTutorial();

  return (
    <div>
      <ProgressBar value={progress} />
      <button onClick={nextStep}>Continue</button>
    </div>
  );
};
```

### Tooltip System

#### Adding Contextual Tooltips

```tsx
import { useContextualTooltip } from '@core/components/epic1/onboarding';

const NodeEditor = () => {
  const { showTooltip } = useContextualTooltip();

  useEffect(() => {
    showTooltip({
      id: 'double-click-hint',
      target: '.node-text',
      title: 'Double-click to edit',
      content: 'Start editing by double-clicking any text node',
      position: 'top',
      showOnce: true,
    });
  }, []);

  return <div className="node-text">Your content</div>;
};
```

#### Smart Tooltip Wrapper

```tsx
import { SmartTooltip } from '@core/components/epic1/onboarding';

<SmartTooltip
  content="Hold Space for quick preview"
  position="auto"
  delay={500}
>
  <PreviewButton />
</SmartTooltip>
```

### Keyboard Shortcuts

#### Registering Custom Shortcuts

```tsx
import { useKeyboardShortcutManager } from '@core/components/epic1/onboarding';

const CustomFeature = () => {
  const manager = useKeyboardShortcutManager();

  useEffect(() => {
    manager.registerShortcut({
      id: 'my-feature',
      keys: ['Ctrl/Cmd', 'M'],
      handler: (e) => {
        e.preventDefault();
        doMyFeature();
      },
      description: 'Activate my feature',
      category: 'custom',
    });

    return () => manager.unregisterShortcut('my-feature');
  }, []);
};
```

#### Using Common Shortcuts

```tsx
import { useCommonShortcuts } from '@core/components/epic1/onboarding';

const Editor = () => {
  const { registerCommonShortcuts } = useCommonShortcuts();

  useEffect(() => {
    registerCommonShortcuts({
      onSave: handleSave,
      onUndo: handleUndo,
      onRedo: handleRedo,
      onDuplicate: handleDuplicate,
      onSelectAll: handleSelectAll,
      onDelete: handleDelete,
      onPreview: handlePreview,
      onExport: handleExport,
    });
  }, []);
};
```

### Progress Tracking

#### Tracking User Actions

```tsx
import { useProgress } from '@core/components/epic1/onboarding';

const EditableNode = () => {
  const { trackAction, unlockAchievement } = useProgress();

  const handleEdit = () => {
    trackAction('first-edit');
    
    if (isFirstEdit) {
      unlockAchievement({
        id: 'first-edit',
        title: 'First Edit!',
        description: 'You completed your first inline edit',
        icon: '✏️',
      });
    }
  };
};
```

#### Progress Widget

```tsx
import { ProgressWidget } from '@core/components/epic1/onboarding';

<ProgressWidget
  position="bottom-right"
  showAchievements={true}
  compact={false}
/>
```

### Success Celebrations

#### Triggering Celebrations

```tsx
import { useSuccessCelebration } from '@core/components/epic1/onboarding';

const TaskComplete = () => {
  const { celebrate } = useSuccessCelebration();

  const handleComplete = () => {
    celebrate({
      type: 'confetti',
      message: 'Great job! Task completed!',
      duration: 3000,
    });
  };
};
```

## Advanced Features

### Custom Tutorial Flows

```typescript
const advancedTutorial = {
  id: 'advanced-features',
  name: 'Advanced Features Tour',
  steps: [...],
  prerequisites: ['basic-tutorial'],
  estimatedTime: '5 minutes',
};

// Register custom tutorial
tutorialManager.registerTutorial(advancedTutorial);
```

### Conditional Tooltips

```tsx
const ConditionalTooltip = () => {
  const { user } = useAuth();
  const { showTooltip } = useContextualTooltip();

  useEffect(() => {
    if (user.isNewUser && !user.hasUsedFeatureX) {
      showTooltip({
        id: 'feature-x-intro',
        target: '.feature-x-button',
        content: 'Try our new Feature X!',
        priority: 'high',
      });
    }
  }, [user]);
};
```

### Analytics Integration

```typescript
import { useOnboardingAnalytics } from '@core/components/epic1/onboarding';

const AnalyticsTracker = () => {
  const analytics = useOnboardingAnalytics();

  useEffect(() => {
    analytics.on('tutorial:completed', (data) => {
      trackEvent('Tutorial Completed', {
        duration: data.duration,
        skippedSteps: data.skippedSteps,
        completionRate: data.completionRate,
      });
    });

    analytics.on('achievement:unlocked', (achievement) => {
      trackEvent('Achievement Unlocked', achievement);
    });
  }, []);
};
```

## Configuration

### Onboarding Settings

```typescript
const onboardingConfig = {
  tutorial: {
    autoStart: true,
    startDelay: 1000,
    allowSkip: true,
    persistProgress: true,
  },
  tooltips: {
    enabled: true,
    delay: 500,
    maxSimultaneous: 3,
    position: 'auto',
  },
  shortcuts: {
    enabled: true,
    conflictWarnings: true,
    customizable: true,
  },
  celebrations: {
    enabled: true,
    reduceMotion: false,
    sound: false,
  },
};
```

### LocalStorage Schema

```typescript
// Tutorial progress
localStorage.setItem('onboarding:tutorial', JSON.stringify({
  completed: boolean,
  currentStep: string,
  completedSteps: string[],
  skippedAt: Date | null,
}));

// Tooltip preferences
localStorage.setItem('onboarding:tooltips', JSON.stringify({
  dismissed: string[],
  enabled: boolean,
  neverShowAgain: string[],
}));

// User achievements
localStorage.setItem('onboarding:achievements', JSON.stringify({
  unlocked: Achievement[],
  progress: Record<string, number>,
  stats: UserStats,
}));
```

## Testing

### Unit Tests

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useTutorial } from '@core/components/epic1/onboarding';

test('tutorial progresses through steps', () => {
  const { result } = renderHook(() => useTutorial());
  
  expect(result.current.currentStep).toBe('welcome');
  
  act(() => {
    result.current.nextStep();
  });
  
  expect(result.current.currentStep).toBe('paste-prompt');
  expect(result.current.progress).toBe(14); // 1/7 steps
});
```

### Integration Tests

```tsx
test('complete onboarding flow', async () => {
  render(
    <OnboardingIntegration>
      <GraphEditor />
    </OnboardingIntegration>
  );

  // Tutorial should start
  expect(screen.getByText('Welcome to Prompt Spaghetti!')).toBeInTheDocument();

  // Complete tutorial
  fireEvent.click(screen.getByText('Start Tutorial'));
  // ... complete all steps

  // Celebration should appear
  await waitFor(() => {
    expect(screen.getByText('Tutorial Complete!')).toBeInTheDocument();
  });
});
```

## Performance

### Optimization Tips

1. **Lazy Load Celebrations**
   ```tsx
   const SuccessCelebration = lazy(() => 
     import('./SuccessCelebration')
   );
   ```

2. **Debounce Tooltip Triggers**
   ```tsx
   const debouncedShow = useMemo(
     () => debounce(showTooltip, 300),
     [showTooltip]
   );
   ```

3. **Memoize Tutorial Steps**
   ```tsx
   const steps = useMemo(() => 
     generateTutorialSteps(userLevel),
     [userLevel]
   );
   ```

## Accessibility

### ARIA Labels

```tsx
<div
  role="dialog"
  aria-label="Tutorial overlay"
  aria-describedby="tutorial-description"
>
  <h2 id="tutorial-title">{step.title}</h2>
  <p id="tutorial-description">{step.description}</p>
</div>
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tutorial can be navigated with arrow keys
- Shortcuts work with screen readers
- Reduced motion respects user preferences

## Troubleshooting

### Common Issues

1. **Tutorial not starting**
   - Check localStorage permissions
   - Verify TutorialProvider is wrapped correctly
   - Check for conflicting z-index styles

2. **Shortcuts not working**
   - Ensure no input is focused
   - Check for event.preventDefault() conflicts
   - Verify shortcut registration order

3. **Tooltips overlapping**
   - Use priority levels
   - Implement collision detection
   - Set maxSimultaneous limit

## Future Enhancements

### Planned Features
- Video tutorials integration
- Multi-language support
- A/B testing framework
- Advanced analytics
- AI-powered help suggestions
- Collaborative tutorials

### Extension Points
- Custom celebration animations
- Plugin system for tutorials
- Themed tooltip styles
- Gesture-based shortcuts
- Voice-guided tutorials

---

For more examples and implementation details, see:
- `/packages/core/components/epic1/examples/`
- `/docs/epic1-getting-started.md`
- Component test files for usage patterns