/**
 * Unexpected Animations for Epic 1
 * Delightful surprises throughout the interface
 */

import React, { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';

interface UnexpectedAnimationsProps {
  enabled?: boolean;
  weirdMode?: boolean;
}

export const UnexpectedAnimations: React.FC<UnexpectedAnimationsProps> = ({
  enabled = true,
  weirdMode = false,
}) => {
  const { getNodes, setNodes, setEdges } = useReactFlow();
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [idleTime, setIdleTime] = useState(0);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastInteractionTime(Date.now());
      setIdleTime(0);
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  // Update idle time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idle = (now - lastInteractionTime) / 1000; // seconds
      setIdleTime(idle);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastInteractionTime]);

  // Idle animations
  useEffect(() => {
    if (!enabled || idleTime < 10) {return;} // Start after 10 seconds idle

    const nodes = getNodes();
    if (nodes.length === 0) {return;}

    // Random node breathes
    if (idleTime > 10 && idleTime < 20) {
      const interval = setInterval(() => {
        const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
        
        setNodes(nodes => nodes.map(n => 
          n.id === randomNode.id 
            ? { ...n, className: `${n.className || ''} node-breathe` }
            : n
        ));

        setTimeout(() => {
          setNodes(nodes => nodes.map(n => 
            n.id === randomNode.id 
              ? { ...n, className: (n.className || '').replace('node-breathe', '') }
              : n
          ));
        }, 3000);
      }, 5000);

      return () => clearInterval(interval);
    }

    // Nodes start sleeping after 30 seconds
    if (idleTime > 30) {
      setNodes(nodes => nodes.map(n => ({
        ...n,
        className: `${n.className || ''} node-sleeping`
      })));

      return () => {
        setNodes(nodes => nodes.map(n => ({
          ...n,
          className: (n.className || '').replace('node-sleeping', '')
        })));
      };
    }
  }, [enabled, idleTime, getNodes, setNodes]);

  // Weird mode effects
  useEffect(() => {
    if (!weirdMode || !enabled) {return;}

    // Rainbow edges
    const interval = setInterval(() => {
      setEdges(edges => edges.map(e => ({
        ...e,
        style: {
          ...e.style,
          stroke: `hsl(${Date.now() / 50 % 360}, 70%, 50%)`,
          strokeWidth: 2 + Math.sin(Date.now() / 1000) * 1,
        }
      })));
    }, 50);

    // Floating nodes
    const nodeInterval = setInterval(() => {
      const time = Date.now() / 1000;
      setNodes(nodes => nodes.map((n, i) => ({
        ...n,
        position: {
          x: n.position.x + Math.sin(time + i) * 2,
          y: n.position.y + Math.cos(time + i * 1.5) * 2,
        }
      })));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(nodeInterval);
    };
  }, [weirdMode, enabled, setEdges, setNodes]);

  // Random surprises
  useEffect(() => {
    if (!enabled) {return;}

    const surpriseTriggers = [
      {
        chance: 0.001, // 0.1% chance per second
        action: () => {
          // Confetti burst
          createConfettiBurst();
        }
      },
      {
        chance: 0.002,
        action: () => {
          // Random emoji float by
          createFloatingEmoji();
        }
      },
      {
        chance: 0.0005,
        action: () => {
          // Screen flash
          createScreenFlash();
        }
      }
    ];

    const interval = setInterval(() => {
      surpriseTriggers.forEach(trigger => {
        if (Math.random() < trigger.chance) {
          trigger.action();
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return null; // This component only adds behavior
};

// Helper functions for animations
function createConfettiBurst() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
  const confettiCount = 30;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall 2s ease-out forwards;
      transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
    `;

    // Random direction
    const angle = (Math.PI * 2 * i) / confettiCount;
    const velocity = 200 + Math.random() * 200;
    confetti.style.setProperty('--dx', `${Math.cos(angle) * velocity}px`);
    confetti.style.setProperty('--dy', `${Math.sin(angle) * velocity}px`);
    confetti.style.setProperty('--dr', `${Math.random() * 720 - 360}deg`);

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

function createFloatingEmoji() {
  const emojis = ['🎨', '✨', '🌟', '💫', '🎯', '🎪', '🎭', '🎨', '🦄', '🌈'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const element = document.createElement('div');
  element.textContent = emoji;
  element.style.cssText = `
    position: fixed;
    font-size: 40px;
    left: -50px;
    top: ${Math.random() * window.innerHeight}px;
    pointer-events: none;
    z-index: 9998;
    animation: float-across 10s linear forwards;
  `;

  document.body.appendChild(element);
  setTimeout(() => element.remove(), 10000);
}

function createScreenFlash() {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    opacity: 0;
    pointer-events: none;
    z-index: 9999;
    animation: flash 0.3s ease-out;
  `;

  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

// Node click celebration
export function celebrateNodeClick(nodeId: string) {
  const node = document.querySelector(`[data-id="${nodeId}"]`);
  if (!node) {return;}

  const rect = node.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Create sparkles
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 20px;
      pointer-events: none;
      z-index: 9999;
      animation: sparkle-burst 1s ease-out forwards;
      transform: translate(-50%, -50%);
    `;

    const angle = (Math.PI * 2 * i) / 5;
    sparkle.style.setProperty('--dx', `${Math.cos(angle) * 50}px`);
    sparkle.style.setProperty('--dy', `${Math.sin(angle) * 50}px`);

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
}

// CSS animations
const animationStyles = `
  @keyframes node-wiggle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-5deg) scale(1.05); }
    75% { transform: rotate(5deg) scale(1.05); }
  }

  .node-wiggle {
    animation: node-wiggle 0.5s ease-in-out;
  }

  @keyframes edge-dance {
    0%, 100% { stroke-dashoffset: 0; }
    50% { stroke-dashoffset: 10; }
  }

  .edge-dance {
    stroke-dasharray: 5 5;
    animation: edge-dance 0.5s linear infinite;
  }

  @keyframes node-breathe {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }

  .node-breathe {
    animation: node-breathe 3s ease-in-out infinite;
  }

  @keyframes node-sleep {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  .node-sleeping {
    animation: node-sleep 4s ease-in-out infinite;
    opacity: 0.7;
  }

  .node-sleeping::after {
    content: '💤';
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    animation: float-up 3s ease-out infinite;
  }

  @keyframes float-up {
    0% { transform: translateY(0) scale(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-30px) scale(1); opacity: 0; }
  }

  @keyframes confetti-fall {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--dr));
      opacity: 0;
    }
  }

  @keyframes float-across {
    0% { transform: translateX(0) translateY(0) rotate(0deg); }
    100% { transform: translateX(calc(100vw + 100px)) translateY(-20px) rotate(360deg); }
  }

  @keyframes flash {
    0% { opacity: 0; }
    50% { opacity: 0.3; }
    100% { opacity: 0; }
  }

  @keyframes sparkle-burst {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1);
      opacity: 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}
