/**
 * Micro-interactions component
 * Adds subtle animations and feedback for user interactions
 */

import React, { useEffect, useState } from 'react';
import './MicroInteractions.css';

interface MicroInteractionProps {
  trigger: 'hover' | 'click' | 'edit' | 'save' | 'error' | 'snap' | 'bounce' | 'drag' | 'connect';
  x?: number;
  y?: number;
  message?: string;
  targetX?: number;
  targetY?: number;
  nodeId?: string;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  trigger,
  x = 0,
  y = 0,
  message
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = trigger === 'error' ? 2000 : 1000;
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  const renderInteraction = () => {
    switch (trigger) {
      case 'hover':
        return <div className="micro-hover-ring" />;
      
      case 'click':
        return <div className="micro-click-ripple" />;
      
      case 'edit':
        return (
          <div className="micro-edit-indicator">
            <span className="edit-icon">✏️</span>
          </div>
        );
      
      case 'save':
        return (
          <div className="micro-save-success">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        );
      
      case 'error':
        return (
          <div className="micro-error-shake">
            <span className="error-icon">⚠️</span>
            {message && <span className="error-message">{message}</span>}
          </div>
        );
      
      case 'snap':
        return (
          <div className="micro-magnetic-snap">
            <div className="snap-ring" />
            <div className="snap-pulse" />
          </div>
        );
      
      case 'bounce':
        return (
          <div className="micro-node-bounce">
            <div className="bounce-shadow" />
          </div>
        );
      
      case 'drag':
        return (
          <div className="micro-drag-trail">
            <div className="trail-dot" />
            <div className="trail-dot" />
            <div className="trail-dot" />
          </div>
        );
      
      case 'connect':
        return (
          <div className="micro-connection-pulse">
            <svg className="connection-line" width="100" height="100">
              <path 
                className="pulse-path" 
                d={`M ${x} ${y} Q ${(x + (targetX || x)) / 2} ${y - 20} ${targetX || x} ${targetY || y}`}
                fill="none"
                stroke="#4A90E2"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`micro-interaction micro-${trigger}`}
      style={{ 
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none'
      }}
    >
      {renderInteraction()}
    </div>
  );
};

// Haptic feedback support
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'error') => {
  // Check if Vibration API is available
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([40, 20, 40]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
    }
  }
};

// Hook for managing micro-interactions
export function useMicroInteractions() {
  const [interactions, setInteractions] = useState<Array<{
    id: string;
    type: MicroInteractionProps['trigger'];
    x: number;
    y: number;
    message?: string;
    targetX?: number;
    targetY?: number;
    nodeId?: string;
  }>>([]);

  const trigger = (
    type: MicroInteractionProps['trigger'],
    x: number,
    y: number,
    options?: {
      message?: string;
      targetX?: number;
      targetY?: number;
      nodeId?: string;
      haptic?: 'light' | 'medium' | 'heavy' | 'error';
    }
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setInteractions(prev => [...prev, { 
      id, 
      type, 
      x, 
      y, 
      message: options?.message,
      targetX: options?.targetX,
      targetY: options?.targetY,
      nodeId: options?.nodeId
    }]);

    // Trigger haptic feedback if requested
    if (options?.haptic) {
      triggerHaptic(options.haptic);
    }

    // Auto-remove after animation
    const duration = type === 'error' ? 2500 : 
                    type === 'snap' ? 600 :
                    type === 'bounce' ? 800 :
                    type === 'connect' ? 1000 : 1500;
    
    setTimeout(() => {
      setInteractions(prev => prev.filter(i => i.id !== id));
    }, duration);
  };

  return { interactions, trigger };
}