/**
 * Tutorial Overlay - Interactive tutorial UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { PromptPasteDialog } from './PromptPasteDialog';
import { ElementDetector, ElementDetectionResult } from './ElementDetector';
import './TutorialOverlay.css';

export const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    tutorialSteps,
    nextStep,
    previousStep,
    skipTutorial,
    onboardingState,
  } = useTutorial();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [isDetectingElement, setIsDetectingElement] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipHintTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!isActive) return;

    const findTarget = () => {
      if (step.target) {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setTargetElement(element);
        } else {
          setTargetElement(null);
        }
      } else {
        setTargetElement(null);
      }
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
    if (!isActive) return;

    const checkWizardState = () => {
      // This will trigger a re-render and position recalculation
      setTargetElement(prev => prev);
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

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

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
    if (!isActive || step.action !== 'paste') return;
    
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
    if (!isActive || !targetElement || step.action !== 'click') return;

    const handleClick = (e: MouseEvent) => {
      if (targetElement.contains(e.target as Node)) {
        nextStep();
      }
    };

    targetElement.addEventListener('click', handleClick);
    return () => targetElement.removeEventListener('click', handleClick);
  }, [isActive, targetElement, step.action, nextStep]);

  if (!isActive) return null;
  
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

  const getSpotlightClipPath = () => {
    if (!step.spotlight || !targetElement) return '';

    const rect = targetElement.getBoundingClientRect();
    const padding = 10;

    // For wizard button, don't apply clip path
    if (step.target === '.prompt-wizard-button') {
      return 'none';
    }

    return `polygon(
      0 0,
      0 100%,
      ${rect.left - padding}px 100%,
      ${rect.left - padding}px ${rect.top - padding}px,
      ${rect.right + padding}px ${rect.top - padding}px,
      ${rect.right + padding}px ${rect.bottom + padding}px,
      ${rect.left - padding}px ${rect.bottom + padding}px,
      ${rect.left - padding}px 100%,
      100% 100%,
      100% 0
    )`;
  };

  const isWizardStep = step.target === '.prompt-wizard-button';

  const getTooltipPosition = () => {
    const tooltipWidth = 400;
    const tooltipHeight = 250; // Increased to account for content
    const margin = 20;

    let top = 0;
    let left = 0;

    // Check if wizard modal is currently open
    const wizardModal = document.querySelector('.prompt-wizard-modal');
    const isWizardOpen = wizardModal !== null;

    // For steps that show the canvas after wizard closes
    if (step.id === 'see-nodes' || step.id === 'empty-canvas') {
      // Always position at top-right corner for canvas-related steps
      top = margin;
      left = window.innerWidth - tooltipWidth - margin;
      return { top: `${top}px`, left: `${left}px` };
    }

    // Special handling for wizard-related steps
    if (step.id === 'open-wizard' || step.id === 'enter-prompt') {
      if (isWizardOpen) {
        // Wizard is open - position at top center to avoid modal
        top = margin;
        left = window.innerWidth / 2 - tooltipWidth / 2;
      } else {
        // Wizard not open yet - position based on target if available
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          // Position below the wizard button
          top = rect.bottom + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Keep on screen
          left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, left));
        } else {
          // Fallback position
          top = margin;
          left = window.innerWidth - tooltipWidth - margin;
        }
      }
      return { top: `${top}px`, left: `${left}px` };
    }

    // For non-wizard steps with target elements
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      
      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + margin;
          break;
        case 'bottom':
          top = rect.bottom + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - margin;
          break;
        case 'center':
          // For center position, place it at top-right
          top = margin;
          left = window.innerWidth - tooltipWidth - margin;
          break;
        default:
          // Default to top-right
          top = margin;
          left = window.innerWidth - tooltipWidth - margin;
      }
    } else {
      // No target element - default position
      top = margin;
      left = window.innerWidth - tooltipWidth - margin;
    }

    // Keep tooltip on screen
    top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, top));
    left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, left));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <div ref={overlayRef} className="tutorial-overlay">
      {/* Dark overlay with spotlight */}
      <div
        className={`tutorial-backdrop ${isWizardStep ? 'light-overlay' : ''}`}
        style={{ clipPath: getSpotlightClipPath() }}
        onClick={(e) => {
          if (step.action === 'observe' || (step.action === 'click' && step.id === 'empty-canvas')) {
            e.stopPropagation();
            nextStep();
          }
        }}
      />

      {/* Tooltip */}
      <div
        className="tutorial-tooltip"
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
          style={(() => {
            const rect = targetElement.getBoundingClientRect();
            return {
              top: `${rect.top - 5}px`,
              left: `${rect.left - 5}px`,
              width: `${rect.width + 10}px`,
              height: `${rect.height + 10}px`
            };
          })()}
        />
      )}
    </div>
  );
};