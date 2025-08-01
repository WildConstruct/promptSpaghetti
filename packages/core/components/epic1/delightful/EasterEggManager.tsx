/**
 * Easter Egg Manager for Epic 1
 * Manages hidden features and delightful surprises
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/stores/graphStore';

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: 'konami' | 'longpress' | 'tripleclick' | 'shake' | 'shift' | 'custom';
  action: () => void;
  enabled: boolean;
  discovered?: boolean;
}

interface EasterEggManagerProps {
  onWeirdModeToggle?: (enabled: boolean) => void;
  onDebugModeToggle?: (enabled: boolean) => void;
  onExpertModeToggle?: (enabled: boolean) => void;
  onPresetsShuffled?: () => void;
  onPrecisionModeToggle?: (enabled: boolean) => void;
}

export const EasterEggManager: React.FC<EasterEggManagerProps> = ({
  onWeirdModeToggle,
  onDebugModeToggle,
  onExpertModeToggle,
  onPresetsShuffled,
  onPrecisionModeToggle,
}) => {
  const [weirdMode, setWeirdMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [discoveredEggs, setDiscoveredEggs] = useState<Set<string>>(new Set());
  
  // Konami code tracking
  const konamiSequence = useRef<string[]>([]);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  // Long press tracking
  const longPressTimer = useRef<NodeJS.Timeout>();
  const longPressActive = useRef(false);
  
  // Triple click tracking
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout>();
  
  // Shake detection
  const lastShakeTime = useRef(0);
  const shakeThreshold = 15;
  
  // Store reference for expert mode features
  const { nodes, edges } = useStore();

  // Discover an Easter egg
  const discoverEgg = useCallback((eggId: string) => {
    if (!discoveredEggs.has(eggId)) {
      setDiscoveredEggs(prev => new Set([...prev, eggId]));
      
      // Trigger celebration animation
      triggerCelebration(eggId);
      
      // Save to localStorage
      const allDiscovered = JSON.parse(localStorage.getItem('discoveredEasterEggs') || '[]');
      allDiscovered.push(eggId);
      localStorage.setItem('discoveredEasterEggs', JSON.stringify(allDiscovered));
    }
  }, [discoveredEggs]);

  // Celebration animation
  const triggerCelebration = (eggId: string) => {
    // Create confetti or sparkle effect
    const celebration = document.createElement('div');
    celebration.className = 'easter-egg-celebration';
    celebration.innerHTML = getEggEmoji(eggId);
    celebration.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 72px;
      z-index: 9999;
      animation: eggCelebration 2s ease-out forwards;
      pointer-events: none;
    `;
    
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 2000);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Get emoji for egg type
  const getEggEmoji = (eggId: string): string => {
    const emojis: Record<string, string> = {
      'konami': '🎮',
      'longpress': '🔍',
      'tripleclick': '⚡',
      'shake': '🎲',
      'shift': '🎯',
      'weird': '🌈',
      'debug': '🐛',
      'expert': '🏆',
    };
    return emojis[eggId] || '✨';
  };

  // 1. Konami Code Handler
  useEffect(() => {
    const handleKonami = (e: KeyboardEvent) => {
      konamiSequence.current.push(e.key);
      
      // Keep only last 10 keys
      if (konamiSequence.current.length > 10) {
        konamiSequence.current.shift();
      }
      
      // Check if matches Konami code
      const currentSequence = konamiSequence.current.join(',');
      const targetSequence = konamiCode.join(',');
      
      if (currentSequence === targetSequence) {
        discoverEgg('konami');
        setWeirdMode(prev => {
          const newMode = !prev;
          onWeirdModeToggle?.(newMode);
          return newMode;
        });
        konamiSequence.current = [];
        
        // Add weird mode effects
        document.body.classList.toggle('weird-mode');
      }
    };

    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, [onWeirdModeToggle, discoverEgg]);

  // 2. Long Press Handler
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only on canvas area
      if ((e.target as HTMLElement).closest('.react-flow__viewport')) {
        longPressActive.current = true;
        longPressTimer.current = setTimeout(() => {
          if (longPressActive.current) {
            discoverEgg('longpress');
            setDebugMode(prev => {
              const newMode = !prev;
              onDebugModeToggle?.(newMode);
              return newMode;
            });
          }
        }, 1000); // 1 second hold
      }
    };

    const handleMouseUp = () => {
      longPressActive.current = false;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [onDebugModeToggle, discoverEgg]);

  // 3. Triple Click Handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only on canvas area
      if ((e.target as HTMLElement).closest('.react-flow__viewport')) {
        clickCount.current++;
        
        if (clickCount.current === 3) {
          discoverEgg('tripleclick');
          setExpertMode(prev => {
            const newMode = !prev;
            onExpertModeToggle?.(newMode);
            return newMode;
          });
          clickCount.current = 0;
        }
        
        // Reset counter after delay
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
          clickCount.current = 0;
        }, 500);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onExpertModeToggle, discoverEgg]);

  // 4. Shake Detection
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(current.x - lastX);
        const deltaY = Math.abs(current.y - lastY);
        const deltaZ = Math.abs(current.z - lastZ);
        
        if (deltaX + deltaY + deltaZ > shakeThreshold) {
          const now = Date.now();
          if (now - lastShakeTime.current > 1000) { // Debounce
            lastShakeTime.current = now;
            discoverEgg('shake');
            onPresetsShuffled?.();
            
            // Visual feedback
            document.body.style.animation = 'shake 0.5s';
            setTimeout(() => {
              document.body.style.animation = '';
            }, 500);
          }
        }
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    };

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [onPresetsShuffled, discoverEgg]);

  // 5. Shift for Precision Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !precisionMode) {
        setPrecisionMode(true);
        onPrecisionModeToggle?.(true);
        document.body.classList.add('precision-mode');
        
        // First time discovery
        if (!discoveredEggs.has('shift')) {
          discoverEgg('shift');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && precisionMode) {
        setPrecisionMode(false);
        onPrecisionModeToggle?.(false);
        document.body.classList.remove('precision-mode');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [precisionMode, onPrecisionModeToggle, discoveredEggs, discoverEgg]);

  // Load discovered eggs from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('discoveredEasterEggs') || '[]');
    setDiscoveredEggs(new Set(saved));
  }, []);

  // Debug overlay
  if (debugMode) {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff00',
          padding: 16,
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 12,
          zIndex: 9998,
          maxWidth: 300,
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>🐛 Debug Info</h4>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
          <div>Weird Mode: {weirdMode ? 'ON' : 'OFF'}</div>
          <div>Expert Mode: {expertMode ? 'ON' : 'OFF'}</div>
          <div>Precision Mode: {precisionMode ? 'ON' : 'OFF'}</div>
          <div>Discovered Eggs: {discoveredEggs.size}/5</div>
          <div style={{ marginTop: 8, opacity: 0.7 }}>
            Hold again to close
          </div>
        </div>
      </>
    );
  }

  // Expert mode indicator
  if (expertMode) {
    return (
      <div style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)',
        color: 'white',
        padding: '8px 24px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 'bold',
        zIndex: 9997,
        animation: 'pulse 2s infinite',
      }}>
        ⚡ EXPERT MODE ACTIVE ⚡
      </div>
    );
  }

  return null;
};

// CSS animations (should be in a separate CSS file)
const easterEggStyles = `
  @keyframes eggCelebration {
    0% {
      transform: translate(-50%, -50%) scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(0) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .weird-mode {
    animation: hueRotate 10s infinite;
  }

  @keyframes hueRotate {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }

  .precision-mode * {
    transition: all 0.1s ease-out !important;
  }

  .precision-mode .react-flow__node {
    cursor: crosshair !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = easterEggStyles;
  document.head.appendChild(styleElement);
}