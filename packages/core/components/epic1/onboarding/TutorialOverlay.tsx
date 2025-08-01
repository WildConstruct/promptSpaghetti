/**
 * Tutorial Overlay - Interactive tutorial UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTutorial } from './TutorialContext';

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
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];

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

  // Handle paste action
  useEffect(() => {
    if (!isActive || step.action !== 'paste') return;

    const handlePaste = () => {
      nextStep();
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isActive, step.action, nextStep]);

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
        pointerEvents: step.spotlight ? 'none' : 'auto',
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
        onClick={step.action === 'observe' ? nextStep : undefined}
      />

      {/* Tooltip */}
      <div
        className="tutorial-tooltip"
        style={{
          position: 'absolute',
          ...getTooltipPosition(),
          width: '400px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          pointerEvents: 'auto',
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
            backgroundColor: '#f0f0f0',
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
            color: '#666',
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
            color: '#1a1a1a',
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#4a4a4a',
            marginBottom: step.hint ? '16px' : '24px',
          }}
        >
          {step.description}
        </p>

        {/* Hint */}
        {step.hint && (
          <div
            style={{
              backgroundColor: '#f3f4f6',
              borderLeft: '3px solid #6366f1',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#4b5563',
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
            onClick={skipTutorial}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            Skip tutorial
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 0 && (
              <button
                onClick={previousStep}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#4b5563',
                }}
              >
                Back
              </button>
            )}

            {step.action === 'observe' && (
              <button
                onClick={nextStep}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Continue'}
              </button>
            )}
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
  );
};