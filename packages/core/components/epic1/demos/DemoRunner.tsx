/**
 * Demo Runner - Automated demo execution with timing
 * Supports scripted demos for investor presentations
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';

export interface DemoStep {
  id: string;
  name: string;
  description: string;
  duration: number; // milliseconds
  action: () => void;
  validation?: () => boolean;
}

export interface DemoScript {
  title: string;
  description: string;
  totalDuration: number;
  steps: DemoStep[];
}

interface DemoRunnerProps {
  script: DemoScript;
  onStepChange?: (step: DemoStep, index: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export const DemoRunner: React.FC<DemoRunnerProps> = ({
  script,
  onStepChange,
  onComplete,
  onError,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Calculate progress
  const currentStep = currentStepIndex >= 0 ? script.steps[currentStepIndex] : null;
  const progress = (elapsedTime / script.totalDuration) * 100;

  // Run demo
  const startDemo = useCallback(() => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setElapsedTime(0);
    setCompletedSteps([]);
    setError(null);
    startTimeRef.current = Date.now();

    // Start elapsed time counter
    intervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 100);

    // Execute first step
    executeStep(0);
  }, [script]);

  // Execute a specific step
  const executeStep = useCallback((stepIndex: number) => {
    if (stepIndex >= script.steps.length) {
      // Demo complete
      stopDemo();
      onComplete?.();
      return;
    }

    const step = script.steps[stepIndex];
    setCurrentStepIndex(stepIndex);

    try {
      // Execute step action
      step.action();
      
      // Validate if provided
      if (step.validation && !step.validation()) {
        throw new Error(`Validation failed for step: ${step.name}`);
      }

      // Mark as completed
      setCompletedSteps(prev => [...prev, step.id]);
      
      // Notify listener
      onStepChange?.(step, stepIndex);

      // Schedule next step
      timeoutRef.current = setTimeout(() => {
        executeStep(stepIndex + 1);
      }, step.duration);

    } catch (err) {
      const error = err as Error;
      setError(error);
      stopDemo();
      onError?.(error);
    }
  }, [script, onStepChange, onComplete, onError]);

  // Stop demo
  const stopDemo = useCallback(() => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Pause/Resume
  const pauseDemo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resumeDemo = useCallback(() => {
    if (currentStepIndex >= 0 && currentStepIndex < script.steps.length) {
      setIsRunning(true);
      executeStep(currentStepIndex);
    }
  }, [currentStepIndex, script, executeStep]);

  // Reset demo
  const resetDemo = useCallback(() => {
    stopDemo();
    setCurrentStepIndex(-1);
    setElapsedTime(0);
    setCompletedSteps([]);
    setError(null);
  }, [stopDemo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDemo();
    };
  }, [stopDemo]);

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const decimal = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimal}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 360,
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
      }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          {script.title}
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
          {script.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 4,
        background: '#e9ecef',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: error ? '#dc3545' : '#007bff',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Current Step */}
      {currentStep && (
        <div style={{
          padding: 16,
          borderBottom: '1px solid #e9ecef',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#007bff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              {currentStepIndex + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{currentStep.name}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {currentStep.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step List */}
      <div style={{
        maxHeight: 200,
        overflowY: 'auto',
        padding: 8,
      }}>
        {script.steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              padding: 8,
              borderRadius: 6,
              marginBottom: 4,
              background: completedSteps.includes(step.id) ? '#e7f3ff' :
                        index === currentStepIndex ? '#fff3cd' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: completedSteps.includes(step.id) ? '#28a745' :
                         index === currentStepIndex ? '#ffc107' : '#e9ecef',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              flexShrink: 0,
            }}>
              {completedSteps.includes(step.id) ? '✓' : index + 1}
            </div>
            <div style={{ flex: 1 }}>{step.name}</div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {formatTime(step.duration)}
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: 12,
          background: '#f8d7da',
          color: '#721c24',
          fontSize: 13,
          borderTop: '1px solid #f5c6cb',
        }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Controls */}
      <div style={{
        padding: 12,
        background: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: 8,
      }}>
        {!isRunning && currentStepIndex === -1 && (
          <button
            onClick={startDemo}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Start Demo
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={pauseDemo}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Pause
          </button>
        )}
        
        {!isRunning && currentStepIndex >= 0 && currentStepIndex < script.steps.length && (
          <button
            onClick={resumeDemo}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Resume
          </button>
        )}
        
        <button
          onClick={resetDemo}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Reset
        </button>
      </div>

      {/* Timer Display */}
      <div style={{
        padding: '8px 16px',
        background: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#666',
      }}>
        <span>Elapsed: {formatTime(elapsedTime)}</span>
        <span>Total: {formatTime(script.totalDuration)}</span>
      </div>
    </div>
  );
};