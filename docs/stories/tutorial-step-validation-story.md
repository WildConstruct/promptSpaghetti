# TUTORIAL-STEP-VALIDATION - Story

## User Story

**As a** tutorial system  
**I want** to validate prerequisites before proceeding to each step  
**So that** tutorial doesn't break when expected conditions aren't met

## Acceptance Criteria

- [ ] Each tutorial step validates its prerequisites before proceeding
- [ ] Step 4+ check for existence of nodes created in step 3
- [ ] Graceful handling when prerequisites aren't met
- [ ] Clear user feedback when validation fails
- [ ] Tutorial can recover from validation failures
- [ ] No silent failures in tutorial flow

## Technical Details

### Current Problem

- TutorialContext.tsx has no validation logic for step prerequisites
- Steps 4+ assume nodes exist but don't check if they were actually created
- Tutorial fails silently when expected elements/states don't exist
- No recovery mechanisms when tutorial gets out of sync

### Required Changes

#### 1. Create Step Validator

**New File**: `packages/core/components/epic1/onboarding/TutorialStepValidator.tsx`

```typescript
export interface StepValidationResult {
  isValid: boolean;
  message?: string;
  canRecover?: boolean;
  recoveryAction?: () => void;
}

export class TutorialStepValidator {
  static validateStep(
    stepId: string,
    context: TutorialValidationContext
  ): StepValidationResult {
    switch (stepId) {
      case 'nodes-created':
        return this.validateNodesCreated(context);
      case 'inline-edit':
        return this.validateInlineEdit(context);
      case 'preview-update':
        return this.validatePreviewUpdate(context);
      default:
        return { isValid: true };
    }
  }

  private static validateNodesCreated(
    context: TutorialValidationContext
  ): StepValidationResult {
    const { nodes } = context;
    if (nodes.length === 0) {
      return {
        isValid: false,
        message: 'No nodes found. The prompt parsing may have failed.',
        canRecover: true,
        recoveryAction: () => {
          // Could restart prompt parsing or show manual node creation option
        }
      };
    }
    return { isValid: true };
  }

  private static validateInlineEdit(
    context: TutorialValidationContext
  ): StepValidationResult {
    const { nodes } = context;
    const hasWeightedChoice = nodes.some(n => n.type === 'weightedChoice');

    if (!hasWeightedChoice) {
      return {
        isValid: false,
        message: 'No weighted choice nodes found to edit.',
        canRecover: true,
        recoveryAction: () => {
          // Could guide user to create weighted choice node
        }
      };
    }
    return { isValid: true };
  }

  private static validatePreviewUpdate(
    context: TutorialValidationContext
  ): StepValidationResult {
    const { nodes, edges } = context;
    if (nodes.length === 0 || edges.length === 0) {
      return {
        isValid: false,
        message: 'Graph appears incomplete. Missing nodes or connections.',
        canRecover: true,
        recoveryAction: () => {
          // Could restart tutorial or provide manual completion steps
        }
      };
    }
    return { isValid: true };
  }
}
```

#### 2. Update TutorialContext.tsx

**File**: `packages/core/components/epic1/onboarding/TutorialContext.tsx`

**Add validation to nextStep function:**

```typescript
const nextStep = useCallback(() => {
  if (currentStep < tutorialSteps.length - 1) {
    const nextStepId = tutorialSteps[currentStep + 1].id;

    // Validate prerequisites for next step
    const validation = TutorialStepValidator.validateStep(nextStepId, {
      nodes: currentNodes,
      edges: currentEdges,
      tutorialState: onboardingState
    });

    if (!validation.isValid) {
      // Handle validation failure
      console.warn('[Tutorial] Step validation failed:', validation.message);
      showValidationError(validation);
      return;
    }

    const stepId = tutorialSteps[currentStep].id;
    setCurrentStep(prev => prev + 1);
    // ... rest of existing logic
  } else {
    completeTutorial();
  }
}, [currentStep, currentNodes, currentEdges, onboardingState]);
```

### Additional Changes Needed

- Add validation error UI/feedback system
- Implement recovery mechanisms for failed validations
- Update tutorial state management to track validation status
- Add logging for validation failures
- Consider adding "retry" or "skip" options for failed steps

### Testing Steps

1. Start tutorial and intentionally break prerequisites:
   - Skip step 3 (prompt parsing) and try to proceed to step 4
   - Manually delete nodes and try to proceed to editing steps
   - Disconnect edges and try to proceed to preview step
2. Verify validation catches issues and provides helpful feedback
3. Test recovery mechanisms when available
4. Verify tutorial can continue normally when prerequisites are met

### Dependencies

- Depends on TUTORIAL-ELEMENT-DETECTION for reliable element finding
- Should be implemented after core tutorial flow is working
- Complements TUTORIAL-EVENT-HANDLER for state synchronization

### Definition of Done

- All tutorial steps have appropriate prerequisite validation
- Validation failures provide clear, actionable feedback
- Recovery mechanisms work when available
- No silent failures in tutorial progression
- Tutorial state remains consistent with application state
