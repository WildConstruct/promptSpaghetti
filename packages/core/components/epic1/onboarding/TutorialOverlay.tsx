/**
 * Tutorial Overlay - Interactive tutorial UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { PromptPasteDialog } from './PromptPasteDialog';
import { ElementDetector, ElementDetectionResult } from './ElementDetector';

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

  // Find target element
  useEffect(() => {
    if (!isActive || !step.target) return;

    const findTarget = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
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

  // Add pulse animation style
  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }
  `;

  const getSpotlightStyle = () => {
    if (!step.spotlight || !targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const padding = 10;

    return {
      clipPath: `polygon(
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
      )`,
    };
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const margin = 20;

    let top = 0;
    let left = 0;

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
      default:
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
    }

    // Keep tooltip on screen
    top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, top));
    left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, left));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <>
      {/* Inject pulse animation */}
      <style>{pulseKeyframes}</style>
      
      <div
        ref={overlayRef}
        className="tutorial-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Dark overlay with spotlight */}
      <div
        className="tutorial-backdrop"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          transition: 'clip-path 0.3s ease',
          pointerEvents: 'auto',
          ...getSpotlightStyle(),
        }}
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
        style={{
          position: 'absolute',
          ...getTooltipPosition(),
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease',
          pointerEvents: 'auto',
          zIndex: 10000
        }}
      >
        {/* Progress */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#333',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#6366f1',
              width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step counter */}
        <div
          style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '8px',
          }}
        >
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#e0e0e0',
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#ccc',
            marginBottom: step.hint ? '16px' : '24px',
          }}
        >
          {step.description}
        </p>

        {/* Hint */}
        {step.hint && (
          <div
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderLeft: '3px solid #6366f1',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#ccc',
                margin: 0,
              }}
            >
              💡 {step.hint}
            </p>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              skipTutorial();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px',
              position: 'relative',
              zIndex: 10001,
              pointerEvents: 'auto',
            }}
          >
            Skip tutorial
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  previousStep();
                }}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#4b5563',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                }}
              >
                Back
              </button>
            )}

            {/* Always show continue button for all steps */}
            <button
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
              style={{
                backgroundColor: step.action === 'observe' ? '#6366f1' : 
                                showSkipHint ? '#f59e0b' : '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500,
                opacity: step.action === 'observe' ? 1 : 0.8,
                transition: 'all 0.3s ease',
                animation: showSkipHint ? 'pulse 1.5s infinite' : 'none',
                position: 'relative',
                zIndex: 10001,
                pointerEvents: 'auto',
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
          style={{
            position: 'absolute',
            ...(() => {
              const rect = targetElement.getBoundingClientRect();
              return {
                top: rect.top - 5,
                left: rect.left - 5,
                width: rect.width + 10,
                height: rect.height + 10,
              };
            })(),
            border: '2px solid #6366f1',
            borderRadius: '4px',
            pointerEvents: 'none',
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }
      `}</style>
      </div>
    </>
  );
};