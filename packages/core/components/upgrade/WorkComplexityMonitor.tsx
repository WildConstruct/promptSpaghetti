/**
 * Work complexity monitor for triggering upgrade prompts
 */

import React, { useState, useEffect, useRef, ReactNode, memo } from 'react';
import { useAuth } from '../../providers/AuthUserProvider';
import { UpgradeModal } from './UpgradePrompt';

/**
 * Work complexity metrics
 */
interface WorkMetrics {
  nodeCount: number;
  edgeCount: number;
  sessionDuration: number; // minutes
  lastPromptShown: number; // timestamp
  actionsPerformed: number;
}

/**
 * Props for WorkComplexityMonitor
 */
interface WorkComplexityMonitorProps {
  children: ReactNode;
  nodeCount?: number;
  edgeCount?: number;
  threshold?: number;
  minSessionDuration?: number; // minutes
  promptCooldown?: number; // hours
  onSignUp?: () => void;
  onSignIn?: () => void;
}

/**
 * Monitor work complexity and show upgrade prompts
 */
export function WorkComplexityMonitor({
  children,
  nodeCount = 0,
  edgeCount = 0,
  threshold = 10,
  minSessionDuration = 5,
  promptCooldown = 24,
  onSignUp,
  onSignIn
}: WorkComplexityMonitorProps) {
  const { isAuthenticated } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [metrics, setMetrics] = useState<WorkMetrics>({
    nodeCount: 0,
    edgeCount: 0,
    sessionDuration: 0,
    lastPromptShown: 0,
    actionsPerformed: 0
  });

  const sessionStartRef = useRef<number>(Date.now());
  const actionCountRef = useRef<number>(0);
  const promptShownRef = useRef<boolean>(false);

  // Update metrics when props change
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      nodeCount,
      edgeCount
    }));
  }, [nodeCount, edgeCount]);

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = (Date.now() - sessionStartRef.current) / 60000; // minutes
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor(duration)
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Track user actions
  useEffect(() => {
    const handleUserAction = () => {
      actionCountRef.current++;
      setMetrics(prev => ({
        ...prev,
        actionsPerformed: actionCountRef.current
      }));
    };

    // Track various user actions
    const events = ['click', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleUserAction);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserAction);
      });
    };
  }, []);

  // Check if prompt should be shown
  useEffect(() => {
    // Don't show if authenticated
    if (isAuthenticated) {
      setShowPrompt(false);
      return;
    }

    // Don't show if already shown in this session
    if (promptShownRef.current) {
      return;
    }

    // Check if dismissed recently
    const dismissedUntil = localStorage.getItem('upgrade_prompt_dismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
      return;
    }

    // Check complexity threshold
    const complexityScore = metrics.nodeCount + metrics.edgeCount * 0.5;
    const meetsComplexity = complexityScore >= threshold;

    // Check session duration
    const meetsSessionDuration = metrics.sessionDuration >= minSessionDuration;

    // Check cooldown period
    const lastPromptTime = parseInt(
      localStorage.getItem('last_upgrade_prompt') || '0'
    );
    const cooldownMs = promptCooldown * 60 * 60 * 1000;
    const meetsCooldown = Date.now() - lastPromptTime > cooldownMs;

    // Show prompt if all conditions are met
    if (meetsComplexity && meetsSessionDuration && meetsCooldown) {
      setShowPrompt(true);
      promptShownRef.current = true;
      localStorage.setItem('last_upgrade_prompt', Date.now().toString());
    }
  }, [metrics, isAuthenticated, threshold, minSessionDuration, promptCooldown]);

  const handleSignUp = () => {
    setShowPrompt(false);
    onSignUp?.();
  };

  const handleSignIn = () => {
    setShowPrompt(false);
    onSignIn?.();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <>
      {children}

      {showPrompt && (
        <UpgradeModal
          title="Save your work to the cloud"
          benefits={[
            'Never lose your work with automatic backups',
            'Access your graphs from any device',
            'Share and collaborate with others',
            'View version history and restore previous versions'
          ]}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          onDismiss={handleDismiss}
          dismissDuration={7}
        />
      )}
    </>
  );
}

/**
 * Hook to track work complexity
 */
export function useWorkComplexity() {
  const [complexity, setComplexity] = useState({
    nodeCount: 0,
    edgeCount: 0,
    score: 0
  });

  const updateComplexity = (nodes: number, edges: number) => {
    const score = nodes + edges * 0.5;
    setComplexity({
      nodeCount: nodes,
      edgeCount: edges,
      score
    });
  };

  return {
    complexity,
    updateComplexity,
    isComplex: complexity.score >= 10
  };
}

/**
 * Progress indicator showing work complexity
 */
interface ComplexityIndicatorProps {
  nodeCount: number;
  edgeCount: number;
  threshold?: number;
}

export const ComplexityIndicator = memo(function ComplexityIndicator({
  nodeCount,
  edgeCount,
  threshold = 10
}: ComplexityIndicatorProps) {
  const score = nodeCount + edgeCount * 0.5;
  const progress = Math.min((score / threshold) * 100, 100);

  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#6b7280'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px'
        }}
      >
        <span>Work Complexity</span>
        <span style={{ fontWeight: '600', color: '#374151' }}>
          {Math.floor(progress)}%
        </span>
      </div>

      <div
        style={{
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: progress >= 100 ? '#10b981' : '#3b82f6',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <div
        style={{
          marginTop: '4px',
          fontSize: '11px',
          color: '#9ca3af'
        }}
      >
        {nodeCount} nodes, {edgeCount} connections
      </div>
    </div>
  );
});
