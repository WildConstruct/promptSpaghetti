/**
 * Contextual Tooltips - Smart help tooltips for UI elements
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTutorial } from './TutorialContext';

export interface TooltipConfig {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  delay?: number; // ms before showing
  showOnce?: boolean;
  priority?: 'low' | 'medium' | 'high';
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

const defaultTooltips: TooltipConfig[] = [
  {
    id: 'canvas-drag',
    target: '.react-flow__viewport',
    title: 'Canvas Controls',
    content: 'Drag to pan, scroll to zoom, right-click for context menu',
    position: 'auto',
    delay: 2000,
    showOnce: true,
    priority: 'medium',
  },
  {
    id: 'node-edit',
    target: '.react-flow__node',
    title: 'Edit Nodes',
    content: 'Double-click any text to edit inline. Press Enter to save, Escape to cancel.',
    position: 'right',
    delay: 1500,
    priority: 'high',
  },
  {
    id: 'palette-drag',
    target: '.node-palette',
    title: 'Add Nodes',
    content: 'Drag node types from here onto the canvas to create new nodes',
    position: 'left',
    delay: 3000,
    priority: 'medium',
  },
  {
    id: 'preview-button',
    target: '.preview-button',
    title: 'Generate Previews',
    content: 'Click to see multiple variations of your prompt with different random seeds',
    position: 'bottom',
    delay: 2000,
    priority: 'medium',
  },
  {
    id: 'save-button',
    target: '.save-button',
    title: 'Auto-Save Active',
    content: 'Your work is automatically saved. Click here to save manually.',
    position: 'bottom',
    delay: 5000,
    showOnce: true,
    priority: 'low',
  },
  {
    id: 'edge-connection',
    target: '.react-flow__edge',
    title: 'Connect Nodes',
    content: 'Click and drag from a node handle to another node to create connections',
    position: 'auto',
    delay: 2500,
    priority: 'medium',
  },
  {
    id: 'settings-gear',
    target: '.settings-button',
    title: 'Settings & Help',
    content: 'Access preferences, replay tutorial, and view keyboard shortcuts',
    position: 'left',
    delay: 4000,
    showOnce: true,
    priority: 'low',
  },
];

interface TooltipState {
  visible: boolean;
  currentTooltip: TooltipConfig | null;
  position: { top: number; left: number };
  dismissed: Set<string>;
}

export const ContextualTooltips: React.FC<{
  additionalTooltips?: TooltipConfig[];
  enabled?: boolean;
}> = ({ additionalTooltips = [], enabled = true }) => {
  const { onboardingState, markHelpViewed, updatePreferences } = useTutorial();
  const [state, setState] = useState<TooltipState>({
    visible: false,
    currentTooltip: null,
    position: { top: 0, left: 0 },
    dismissed: new Set(),
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hoverTargets = useRef<Map<string, HTMLElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tooltips = [...defaultTooltips, ...additionalTooltips];

  // Calculate tooltip position
  const calculatePosition = useCallback((
    element: HTMLElement,
    tooltip: TooltipConfig
  ): { top: number; left: number } => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    const margin = 12;

    let top = 0;
    let left = 0;

    const getAutoPosition = () => {
      // Check available space in each direction
      const spaceTop = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceBottom = window.innerHeight - rect.bottom;
      const spaceLeft = rect.left;

      if (spaceBottom >= tooltipHeight + margin) return 'bottom';
      if (spaceRight >= tooltipWidth + margin) return 'right';
      if (spaceTop >= tooltipHeight + margin) return 'top';
      if (spaceLeft >= tooltipWidth + margin) return 'left';
      return 'bottom'; // fallback
    };

    const position = tooltip.position === 'auto' ? getAutoPosition() : tooltip.position;

    switch (position) {
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
    }

    // Keep tooltip on screen
    top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, top));
    left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, left));

    return { top, left };
  }, []);

  // Show tooltip
  const showTooltip = useCallback((tooltip: TooltipConfig, element: HTMLElement) => {
    if (!enabled || !onboardingState.preferences.showTooltips) return;
    if (state.dismissed.has(tooltip.id)) return;
    if (tooltip.showOnce && onboardingState.helpViewed[tooltip.id]) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const position = calculatePosition(element, tooltip);
      setState({
        visible: true,
        currentTooltip: tooltip,
        position,
        dismissed: state.dismissed,
      });
      
      if (tooltip.showOnce) {
        markHelpViewed(tooltip.id);
      }
    }, tooltip.delay || 1000);
  }, [enabled, onboardingState, calculatePosition, markHelpViewed, state.dismissed]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setState(prev => ({ ...prev, visible: false, currentTooltip: null }));
  }, []);

  // Dismiss tooltip
  const dismissTooltip = useCallback((tooltipId: string, dontShowAgain: boolean = false) => {
    setState(prev => ({
      ...prev,
      visible: false,
      currentTooltip: null,
      dismissed: new Set([...prev.dismissed, tooltipId]),
    }));

    if (dontShowAgain) {
      updatePreferences({ showTooltips: false });
    }
  }, [updatePreferences]);

  // Set up hover listeners
  useEffect(() => {
    if (!enabled) return;

    const observers: MutationObserver[] = [];

    tooltips.forEach(tooltip => {
      const setupTarget = () => {
        const elements = document.querySelectorAll(tooltip.target);
        
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Skip if already tracked
          if (hoverTargets.current.has(`${tooltip.id}-${htmlElement.id}`)) return;
          
          const handleMouseEnter = () => showTooltip(tooltip, htmlElement);
          const handleMouseLeave = () => hideTooltip();

          htmlElement.addEventListener('mouseenter', handleMouseEnter);
          htmlElement.addEventListener('mouseleave', handleMouseLeave);
          
          hoverTargets.current.set(`${tooltip.id}-${htmlElement.id}`, htmlElement);

          // Cleanup function
          const cleanup = () => {
            htmlElement.removeEventListener('mouseenter', handleMouseEnter);
            htmlElement.removeEventListener('mouseleave', handleMouseLeave);
            hoverTargets.current.delete(`${tooltip.id}-${htmlElement.id}`);
          };

          // Store cleanup in element dataset
          (htmlElement as any).__tooltipCleanup = cleanup;
        });
      };

      // Initial setup
      setupTarget();

      // Watch for new elements
      const observer = new MutationObserver(setupTarget);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      observers.push(observer);
    });

    return () => {
      // Clean up all observers
      observers.forEach(obs => obs.disconnect());
      
      // Clean up all event listeners
      hoverTargets.current.forEach((element) => {
        if ((element as any).__tooltipCleanup) {
          (element as any).__tooltipCleanup();
        }
      });
      hoverTargets.current.clear();
      
      clearTimeout(timeoutRef.current);
    };
  }, [enabled, tooltips, showTooltip, hideTooltip]);

  if (!enabled || !onboardingState.preferences.showTooltips || !state.visible || !state.currentTooltip) {
    return null;
  }

  const { currentTooltip, position } = state;

  return (
    <div
      ref={tooltipRef}
      className="contextual-tooltip"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: '300px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        animation: 'tooltipFadeIn 0.2s ease-out',
      }}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={hideTooltip}
    >
      {/* Priority indicator */}
      {currentTooltip.priority === 'high' && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '16px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 500,
          }}
        >
          TIP
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => dismissTooltip(currentTooltip.id)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#9ca3af',
          padding: '4px',
        }}
        aria-label="Close tooltip"
      >
        ×
      </button>

      {/* Title */}
      <h4
        style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '8px',
          color: '#1a1a1a',
          paddingRight: '24px',
        }}
      >
        {currentTooltip.title}
      </h4>

      {/* Content */}
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: '#4a4a4a',
          margin: 0,
          marginBottom: currentTooltip.actions ? '12px' : '8px',
        }}
      >
        {currentTooltip.content}
      </p>

      {/* Actions */}
      {currentTooltip.actions && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {currentTooltip.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action();
                dismissTooltip(currentTooltip.id);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Don't show again */}
      {currentTooltip.showOnce && (
        <button
          onClick={() => dismissTooltip(currentTooltip.id, true)}
          style={{
            fontSize: '12px',
            color: '#6b7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
            textDecoration: 'underline',
          }}
        >
          Don't show tips again
        </button>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Hook for programmatic tooltip control
export const useContextualTooltip = () => {
  const [customTooltips, setCustomTooltips] = useState<TooltipConfig[]>([]);

  const showTooltip = useCallback((tooltip: TooltipConfig) => {
    setCustomTooltips(prev => [...prev, tooltip]);
  }, []);

  const hideTooltip = useCallback((tooltipId: string) => {
    setCustomTooltips(prev => prev.filter(t => t.id !== tooltipId));
  }, []);

  return {
    customTooltips,
    showTooltip,
    hideTooltip,
  };
};