// Error Recovery Toast with Actionable Solutions
// Story 2.5a: Asset Browser Integration MVP

import React, { useEffect, useState } from 'react';
import './ErrorRecoveryToast.css';

export interface DropError {
  type:
    | 'type_incompatibility'
    | 'connection_conflict'
    | 'invalid_position'
    | 'general';
  message: string;
  details?: {
    sourceType?: string;
    targetType?: string;
    brokenConnections?: number;
    requiredDistance?: number;
  };
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => void;
  icon?: string;
  primary?: boolean;
}

interface ErrorRecoveryToastProps {
  error: DropError;
  onDismiss: () => void;
  autoHideDelay?: number; // default 2000ms per AC
}

export const ErrorRecoveryToast: React.FC<ErrorRecoveryToastProps> = ({
  error,
  onDismiss,
  autoHideDelay = 2000
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const actions = getRecoveryActions(error);

  useEffect(() => {
    if (!isPaused && autoHideDelay > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            onDismiss();
            return 0;
          }
          return prev - 100 / (autoHideDelay / 100);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPaused, autoHideDelay, onDismiss]);

  // scoped hotkeys: W and ? while toast is visible
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
      if ((e.key || '').toLowerCase() === 'w') {
        const act = actions.find(a => a.label.includes('WeightedChoice'));
        if (act) {
          e.preventDefault();
          act.action();
          onDismiss();
        }
      }
      if (e.key === '?') {
        const act = actions.find(a =>
          a.label.toLowerCase().includes('compatibility')
        );
        if (act) {
          e.preventDefault();
          act.action();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions, onDismiss]);

  return (
    <div
      className={`error-recovery-toast error-${error.type}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="toast-header">
        <span className="toast-icon">⚠️</span>
        <button className="toast-close" onClick={onDismiss}>
          ×
        </button>
      </div>

      <div className="toast-content">
        <div className="error-message">{error.message}</div>

        {actions.length > 0 && (
          <div className="recovery-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onDismiss();
                }}
                className={`recovery-action ${action.primary ? 'primary' : ''}`}
              >
                {action.icon && (
                  <span className="action-icon">{action.icon}</span>
                )}
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="toast-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
};

function getRecoveryActions(error: DropError): ErrorRecoveryAction[] {
  const actions: ErrorRecoveryAction[] = [];

  switch (error.type) {
    case 'type_incompatibility':
      actions.push({
        label: 'Click here to auto-scroll to empty area',
        action: () => scrollToEmptyArea(),
        icon: '➡️',
        primary: true
      });
      if (error.details?.sourceType === 'WeightedChoice') {
        actions.push({
          label: 'Press W to create one',
          action: () => createNodeOfType('WeightedChoice'),
          icon: '🎲'
        });
      }
      actions.push({
        label: 'View compatibility matrix (? key)',
        action: () => showCompatibilityMatrix(),
        icon: '❓'
      });
      break;

    case 'connection_conflict':
      actions.push({
        label: 'Disconnect nodes first',
        action: () => highlightConflictingConnections(),
        icon: '✂️',
        primary: true
      });
      if (
        error.details?.brokenConnections &&
        error.details.brokenConnections > 2
      ) {
        actions.push({
          label: 'Replace All (2.5b)',
          action: () => showComingSoonMessage(),
          icon: '🔄'
        });
      }
      break;

    case 'invalid_position':
      actions.push({
        label: 'Auto-scroll to valid area',
        action: () => scrollToEmptyArea(),
        icon: '📍',
        primary: true
      });
      actions.push({
        label: 'Enable grid snap (G)',
        action: () => toggleGridSnap(),
        icon: '⊞'
      });
      break;

    default:
      actions.push({
        label: 'Try again',
        action: () => console.log('Retry drop operation'),
        icon: '🔄',
        primary: true
      });
      actions.push({
        label: 'Get help',
        action: () => showHelpDialog(),
        icon: '❓'
      });
  }
  // Normalize labels to match AC exact copy
  actions.forEach(a => {
    if (a.label === 'Auto-scroll to valid area')
      a.label = 'Click here to auto-scroll to empty area';
    if (a.label === 'Create WeightedChoice (W)')
      a.label = 'Press W to create one';
    if (a.label === 'View compatibility')
      a.label = 'View compatibility matrix (? key)';
  });

  return actions;
}

// Helper functions for recovery actions
function scrollToEmptyArea() {
  const canvas = document.querySelector('.react-flow');
  if (canvas) {
    // Find empty area logic
    const emptySpot = findEmptySpotOnCanvas();
    if (emptySpot) {
      canvas.scrollTo({
        left: emptySpot.x - window.innerWidth / 2,
        top: emptySpot.y - window.innerHeight / 2,
        behavior: 'smooth'
      });
    }
  }
}

function createNodeOfType(nodeType: string) {
  // Dispatch action to create node
  const event = new CustomEvent('createNode', { detail: { type: nodeType } });
  window.dispatchEvent(event);
}

function showCompatibilityMatrix() {
  // Show compatibility help modal
  const event = new CustomEvent('showHelp', {
    detail: { topic: 'compatibility' }
  });
  window.dispatchEvent(event);
}

function highlightConflictingConnections() {
  // Highlight edges that would break
  const edges = document.querySelectorAll('.react-flow__edge');
  edges.forEach(edge => {
    edge.classList.add('highlight-conflict');
    setTimeout(() => edge.classList.remove('highlight-conflict'), 3000);
  });
}

function showComingSoonMessage() {
  console.log('Feature coming in Story 2.5b');
}

function toggleGridSnap() {
  const event = new CustomEvent('toggleGridSnap');
  window.dispatchEvent(event);
}

function showHelpDialog() {
  const event = new CustomEvent('showHelp', { detail: { topic: 'drag-drop' } });
  window.dispatchEvent(event);
}

function findEmptySpotOnCanvas(): { x: number; y: number } | null {
  // Simple algorithm to find empty space
  const nodes = document.querySelectorAll('.react-flow__node');
  if (nodes.length === 0) {
    return { x: 400, y: 300 };
  }

  // Find rightmost node and place new content to the right
  let maxX = 0;
  let avgY = 0;
  nodes.forEach(node => {
    const rect = node.getBoundingClientRect();
    maxX = Math.max(maxX, rect.right);
    avgY += rect.top;
  });
  avgY = avgY / nodes.length;

  return { x: maxX + 200, y: avgY };
}

// Toast Manager for global toast handling
export class ToastManager {
  private static instance: ToastManager;
  private toasts: Map<string, DropError> = new Map();
  private listeners: Set<(toasts: DropError[]) => void> = new Set();

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  showError(error: DropError): string {
    const id = `toast-${Date.now()}`;
    this.toasts.set(id, error);
    this.notifyListeners();
    return id;
  }

  dismiss(id: string): void {
    this.toasts.delete(id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: DropError[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const toastArray = Array.from(this.toasts.values());
    this.listeners.forEach(listener => listener(toastArray));
  }
}
