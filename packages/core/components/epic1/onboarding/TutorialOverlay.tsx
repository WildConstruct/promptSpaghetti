/**
 * Tutorial Overlay - Interactive tutorial UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { PromptPasteDialog } from './PromptPasteDialog';
import {
  getSpotlightClipPath,
  getSpotlightRect,
  getTutorialTooltipPosition,
  resolveTutorialTarget
} from './tutorialLayout';
import './TutorialOverlay.css';

export const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    tutorialSteps,
    nextStep,
    previousStep,
    skipTutorial,
  } = useTutorial();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipHintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [, setLayoutTick] = useState(0);

  const step = tutorialSteps[currentStep];

  // Show skip hint after a delay for interactive steps
  useEffect(() => {
    setShowSkipHint(false);
    
    if (step.action !== 'observe') {
      // Clear any existing timer
      if (skipHintTimerRef.current) {
        clearTimeout(skipHintTimerRef.current);
      }
      
      // Set timer to show skip hint after 5 seconds
      skipHintTimerRef.current = setTimeout(() => {
        setShowSkipHint(true);
      }, 5000);
    }
    
    return () => {
      if (skipHintTimerRef.current) {
        clearTimeout(skipHintTimerRef.current);
      }
    };
  }, [currentStep, step.action]);

  // Find target element and trigger position recalculation
  useEffect(() => {
    if (!isActive) {return;}

    const findTarget = () => {
      setTargetElement(resolveTutorialTarget(step));
    };

    // Try to find immediately
    findTarget();

    // Set up observer for dynamic elements
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isActive, step, currentStep]);

  // Force position recalculation when wizard modal appears/disappears
  useEffect(() => {
    if (!isActive) {return;}

    const checkWizardState = () => {
      setLayoutTick(prev => prev + 1);
    };

    // Check for wizard modal changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const hasWizardChange = Array.from(mutation.addedNodes).some(
            node => node instanceof Element && node.classList?.contains('prompt-wizard-overlay')
          ) || Array.from(mutation.removedNodes).some(
            node => node instanceof Element && node.classList?.contains('prompt-wizard-overlay')
          );
          if (hasWizardChange) {
            checkWizardState();
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {return;}

    const refreshLayout = () => {
      setLayoutTick(prev => prev + 1);
    };

    window.addEventListener('resize', refreshLayout);
    window.addEventListener('scroll', refreshLayout, true);

    return () => {
      window.removeEventListener('resize', refreshLayout);
      window.removeEventListener('scroll', refreshLayout, true);
    };
  }, [isActive]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isActive) {return;}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTutorial();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, previousStep, skipTutorial]);

  // Handle paste action - show dialog for paste step
  useEffect(() => {
    if (!isActive || step.action !== 'paste') {return;}
    
    // Show the paste dialog for the paste step
    setShowPasteDialog(true);
  }, [isActive, step.action]);
  
  // Handle prompt paste from dialog
  const handlePromptPaste = (prompt: string) => {
    console.log('Prompt pasted:', prompt);
    // TODO: Parse the prompt and create nodes
    // For now, just advance the tutorial
    setShowPasteDialog(false);
    nextStep();
    
    // Dispatch event for the main editor to handle
    window.dispatchEvent(new CustomEvent('epic1:promptPasted', { 
      detail: { prompt } 
    }));
  };

  // Handle click action
  useEffect(() => {
    if (!isActive || !targetElement || step.action !== 'click') {return;}

    const handleClick = (e: MouseEvent) => {
      if (targetElement.contains(e.target as Node)) {
        nextStep();
      }
    };

    targetElement.addEventListener('click', handleClick);
    return () => targetElement.removeEventListener('click', handleClick);
  }, [isActive, targetElement, step.action, nextStep]);

  if (!isActive) {return null;}
  
  // Show paste dialog if needed
  if (showPasteDialog) {
    return (
      <PromptPasteDialog
        isOpen={true}
        onClose={() => {
          setShowPasteDialog(false);
          skipTutorial();
        }}
        onPaste={handlePromptPaste}
        tutorialStep={step.id}
      />
    );
  }

  const spotlightRect = step.spotlight ? getSpotlightRect(targetElement) : null;
  const isWizardStep = step.anchorId === 'wizard-button' || step.target === '.prompt-wizard-button';
  // Only allow clicking through backdrop when we have a specific target with spotlight
  // For 'empty-canvas' or steps without spotlight, keep backdrop clickable
  const shouldAllowClick = step.action === 'click' && step.spotlight === true;

  const getTooltipPosition = () => {
    const wizardModal = document.querySelector('.prompt-wizard-modal');
    const isWizardOpen = wizardModal !== null;
    return getTutorialTooltipPosition(
      step,
      targetElement,
      { width: window.innerWidth, height: window.innerHeight },
      { wizardOpen: isWizardOpen }
    );
  };

  return (
    <div
      ref={overlayRef}
      className="tutorial-overlay"
      data-testid="tutorial-overlay"
      data-tutorial-step={step.id}
    >
      {/* Dark overlay with spotlight */}
      <div
        className={`tutorial-backdrop ${isWizardStep ? 'light-overlay' : ''} ${shouldAllowClick ? 'allow-clicks' : ''}`}
        data-testid="tutorial-backdrop"
        style={{ 
          clipPath: step.spotlight ? getSpotlightClipPath(spotlightRect) : 'none'
        }}
        onClick={(e) => {
          // Allow clicking to continue for observe steps or specific click steps
          if (step.action === 'observe' || (step.action === 'click' && !step.spotlight)) {
            e.stopPropagation();
            nextStep();
          }
        }}
      />

      {/* Tooltip */}
      <div
        className="tutorial-tooltip"
        data-testid="tutorial-tooltip"
        style={getTooltipPosition()}
      >
        {/* Progress */}
        <div className="tutorial-progress">
          <div
            className="tutorial-progress-bar"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Step counter */}
        <div className="tutorial-step-counter">
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>

        {/* Title */}
        <h3 className="tutorial-title">
          {step.title}
        </h3>

        {/* Description */}
        <p className={`tutorial-description ${step.hint ? 'with-hint' : ''}`}>
          {step.description}
        </p>

        {/* Hint */}
        {step.hint && (
          <div className="tutorial-hint">
            <p className="tutorial-hint-text">
              💡 {step.hint}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="tutorial-actions">
          <button
            className="tutorial-skip-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              skipTutorial();
            }}
          >
            Skip tutorial
          </button>

          <div className="tutorial-navigation">
            {currentStep > 0 && (
              <button
                className="tutorial-back-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  previousStep();
                }}
              >
                Back
              </button>
            )}

            {/* Always show continue button for all steps */}
            <button
              className={`tutorial-continue-button ${step.action === 'observe' ? 'observe' : ''} ${showSkipHint ? 'skip-hint' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Tutorial button clicked, advancing to next step');
                nextStep();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title={step.action !== 'observe' ? 'Skip this step' : ''}
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 
               step.action === 'observe' ? 'Continue' : 
               showSkipHint ? 'Skip (Press to continue)' : 'Skip'}
            </button>
          </div>
        </div>
      </div>

      {/* Target element highlight */}
      {targetElement && step.spotlight && (
        <div
          className="tutorial-target-highlight"
          data-testid="tutorial-highlight"
          style={{
            top: `${(spotlightRect?.top ?? 0) + 5}px`,
            left: `${(spotlightRect?.left ?? 0) + 5}px`,
            width: `${Math.max(0, (spotlightRect?.width ?? 0) - 10)}px`,
            height: `${Math.max(0, (spotlightRect?.height ?? 0) - 10)}px`
          }}
        />
      )}
    </div>
  );
};
