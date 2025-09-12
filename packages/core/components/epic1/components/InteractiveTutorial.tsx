import React, { useState, useEffect, useCallback } from 'react';
import './InteractiveTutorial.css';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt Spaghetti!',
    content: 'This tutorial will show you how to create powerful prompt graphs. Let\'s start by exploring the interface.',
  },
  {
    id: 'palette',
    title: 'Node Palette',
    content: 'Drag nodes from here onto the canvas to create your graph. Each node type has a specific purpose.',
    target: '.node-palette',
    position: 'right'
  },
  {
    id: 'canvas',
    title: 'Canvas Area',
    content: 'This is where you build your graph. Drag nodes here and connect them to create prompt flows.',
    target: '.react-flow',
    position: 'top'
  },
  {
    id: 'inspector',
    title: 'Inspector Panel',
    content: 'Select a node to see its properties here. You can edit text, adjust weights, and configure behavior.',
    target: '.inspector-panel',
    position: 'left'
  },
  {
    id: 'wizard',
    title: 'Prompt Wizard',
    content: 'Click the Wizard button to quickly create nodes from a text prompt. It uses AI to understand your structure.',
    target: '.palette-footer-button',
    position: 'right'
  },
  {
    id: 'preview',
    title: 'Preview Your Prompts',
    content: 'Use the Preview button to see how your graph generates different prompt variations.',
    target: '.preview-button',
    position: 'bottom'
  },
  {
    id: 'save',
    title: 'Save Your Work',
    content: 'Don\'t forget to save! Use the File menu or Ctrl+S to save your graph.',
    target: '.menu-section',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    content: 'You now know the basics. Start creating by dragging a node from the palette or using the Wizard. Have fun!',
  }
];

export const InteractiveTutorial: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  // Listen for tutorial start event
  useEffect(() => {
    const handleStartTutorial = () => {
      setIsActive(true);
      setCurrentStep(0);
    };

    window.addEventListener('epic1:startTutorial', handleStartTutorial);
    return () => window.removeEventListener('epic1:startTutorial', handleStartTutorial);
  }, []);

  // Handle element highlighting
  useEffect(() => {
    if (!isActive) return;

    const step = tutorialSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightElement(null);
    }
  }, [isActive, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHighlightElement(null);
  }, []);

  const handleSkip = useCallback(() => {
    handleClose();
  }, [handleClose]);

  if (!isActive) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="tutorial-overlay" onClick={handleSkip}>
        {highlightElement && (
          <div 
            className="tutorial-highlight"
            style={{
              top: highlightElement.offsetTop - 5,
              left: highlightElement.offsetLeft - 5,
              width: highlightElement.offsetWidth + 10,
              height: highlightElement.offsetHeight + 10,
            }}
          />
        )}
      </div>

      {/* Tutorial Popup */}
      <div 
        className={`tutorial-popup ${step.position || 'center'}`}
        onClick={(e) => e.stopPropagation()}
        style={highlightElement && step.position ? getPopupPosition(highlightElement, step.position) : undefined}
      >
        <div className="tutorial-header">
          <h3>{step.title}</h3>
          <button className="tutorial-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="tutorial-content">
          <p>{step.content}</p>
        </div>

        <div className="tutorial-progress">
          <div className="tutorial-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="tutorial-footer">
          <div className="tutorial-step-indicator">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          
          <div className="tutorial-actions">
            <button 
              className="tutorial-btn-skip" 
              onClick={handleSkip}
            >
              Skip Tutorial
            </button>
            
            <div className="tutorial-nav">
              <button 
                className="tutorial-btn-prev" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </button>
              <button 
                className="tutorial-btn-next" 
                onClick={handleNext}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function getPopupPosition(element: HTMLElement, position: string): React.CSSProperties {
  const rect = element.getBoundingClientRect();
  const popupWidth = 400;
  const popupHeight = 250;
  const offset = 20;

  switch (position) {
    case 'top':
      return {
        top: rect.top - popupHeight - offset,
        left: rect.left + rect.width / 2 - popupWidth / 2,
      };
    case 'bottom':
      return {
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2 - popupWidth / 2,
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - popupHeight / 2,
        left: rect.left - popupWidth - offset,
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2 - popupHeight / 2,
        left: rect.right + offset,
      };
    default:
      return {};
  }
}