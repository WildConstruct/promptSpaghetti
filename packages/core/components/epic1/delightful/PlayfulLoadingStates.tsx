/**
 * Playful Loading States for Epic 1
 * Fun, unexpected loading animations
 */

import React, { useState, useEffect } from 'react';

export interface LoadingState {
  id: string;
  message: string;
  emoji: string;
  animation: 'spin' | 'bounce' | 'pulse' | 'dance' | 'typewriter';
}

interface PlayfulLoadingStatesProps {
  isLoading: boolean;
  loadingType?: 'graph' | 'preview' | 'save' | 'general';
  customMessages?: string[];
}

export const PlayfulLoadingStates: React.FC<PlayfulLoadingStatesProps> = ({
  isLoading,
  loadingType = 'general',
  customMessages = [],
}) => {
  const [currentMessage, setCurrentMessage] = useState<LoadingState | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Playful loading messages by type
  const loadingMessages: Record<string, LoadingState[]> = {
    graph: [
      { id: 'g1', message: 'Summoning nodes from the void...', emoji: '🌀', animation: 'spin' },
      { id: 'g2', message: 'Teaching edges how to connect...', emoji: '🔗', animation: 'pulse' },
      { id: 'g3', message: 'Polishing node surfaces...', emoji: '✨', animation: 'bounce' },
      { id: 'g4', message: 'Arranging pixels artfully...', emoji: '🎨', animation: 'dance' },
      { id: 'g5', message: 'Convincing nodes to stay put...', emoji: '📌', animation: 'typewriter' },
    ],
    preview: [
      { id: 'p1', message: 'Rolling cosmic dice...', emoji: '🎲', animation: 'spin' },
      { id: 'p2', message: 'Consulting the oracle...', emoji: '🔮', animation: 'pulse' },
      { id: 'p3', message: 'Mixing word potions...', emoji: '⚗️', animation: 'bounce' },
      { id: 'p4', message: 'Weaving narrative threads...', emoji: '🧵', animation: 'dance' },
      { id: 'p5', message: 'Birthing possibilities...', emoji: '🌟', animation: 'typewriter' },
    ],
    save: [
      { id: 's1', message: 'Preserving your masterpiece...', emoji: '🖼️', animation: 'pulse' },
      { id: 's2', message: 'Etching in digital stone...', emoji: '🗿', animation: 'bounce' },
      { id: 's3', message: 'Tucking nodes into bed...', emoji: '🛏️', animation: 'spin' },
      { id: 's4', message: 'Sealing with a kiss...', emoji: '💋', animation: 'dance' },
      { id: 's5', message: 'Making it permanent...', emoji: '🔒', animation: 'typewriter' },
    ],
    general: [
      { id: 'x1', message: 'Doing something magical...', emoji: '🪄', animation: 'spin' },
      { id: 'x2', message: 'Almost there...', emoji: '⏳', animation: 'pulse' },
      { id: 'x3', message: 'Good things take time...', emoji: '🌱', animation: 'bounce' },
      { id: 'x4', message: 'Brewing excellence...', emoji: '☕', animation: 'dance' },
      { id: 'x5', message: 'Loading awesomeness...', emoji: '🚀', animation: 'typewriter' },
    ],
  };

  // Add custom messages if provided
  const allMessages = [
    ...loadingMessages[loadingType],
    ...customMessages.map((msg, i) => ({
      id: `custom-${i}`,
      message: msg,
      emoji: '✨',
      animation: 'pulse' as const,
    })),
  ];

  // Rotate through messages
  useEffect(() => {
    if (!isLoading) {
      setCurrentMessage(null);
      return;
    }

    // Pick a random message on load
    const randomIndex = Math.floor(Math.random() * allMessages.length);
    setCurrentMessage(allMessages[randomIndex]);
    setMessageIndex(randomIndex);
    setCharIndex(0);

    // Change message every 3 seconds
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % allMessages.length);
      setCharIndex(0);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, loadingType]);

  // Update current message when index changes
  useEffect(() => {
    if (isLoading && allMessages[messageIndex]) {
      setCurrentMessage(allMessages[messageIndex]);
    }
  }, [messageIndex, isLoading]);

  // Typewriter effect
  useEffect(() => {
    if (!currentMessage || currentMessage.animation !== 'typewriter') return;

    const timer = setTimeout(() => {
      if (charIndex < currentMessage.message.length) {
        setCharIndex(prev => prev + 1);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [charIndex, currentMessage]);

  if (!isLoading || !currentMessage) return null;

  // Get animation class
  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'spin': return 'loading-spin';
      case 'bounce': return 'loading-bounce';
      case 'pulse': return 'loading-pulse';
      case 'dance': return 'loading-dance';
      case 'typewriter': return 'loading-typewriter';
      default: return 'loading-pulse';
    }
  };

  // Display message based on animation type
  const displayMessage = currentMessage.animation === 'typewriter'
    ? currentMessage.message.slice(0, charIndex) + (charIndex < currentMessage.message.length ? '|' : '')
    : currentMessage.message;

  return (
    <div className="playful-loading-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated emoji */}
      <span 
        className={getAnimationClass(currentMessage.animation)}
        style={{ fontSize: 32 }}
      >
        {currentMessage.emoji}
      </span>

      {/* Loading message */}
      <span style={{
        fontSize: 16,
        color: '#333',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        {displayMessage}
      </span>

      {/* Progress shimmer */}
      <div className="loading-shimmer" style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  );
};

// Inline loading spinner for smaller contexts
export const InlineLoadingSpinner: React.FC<{ size?: number }> = ({ size = 16 }) => {
  const spinners = ['◐', '◓', '◑', '◒'];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % spinners.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ 
      fontSize: size, 
      display: 'inline-block',
      animation: 'spin 1s linear infinite',
    }}>
      {spinners[frame]}
    </span>
  );
};

// Fun progress bar
export const PlayfulProgressBar: React.FC<{ 
  progress: number; 
  message?: string;
  showPercentage?: boolean;
}> = ({ 
  progress, 
  message = 'Loading magic...',
  showPercentage = true 
}) => {
  const [sparkles, setSparkles] = useState<{ id: number; left: number }[]>([]);

  // Add sparkles as progress increases
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const sparkle = {
        id: Date.now(),
        left: progress,
      };
      setSparkles(prev => [...prev, sparkle]);

      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
      }, 1000);
    }
  }, [Math.floor(progress / 10)]); // Sparkle every 10%

  return (
    <div style={{ width: '100%', padding: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontSize: 14,
      }}>
        <span>{message}</span>
        {showPercentage && <span>{Math.round(progress)}%</span>}
      </div>
      
      <div style={{
        width: '100%',
        height: 8,
        background: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Progress fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
          transition: 'width 0.3s ease',
          position: 'relative',
        }}>
          {/* Animated stripes */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`,
            animation: 'slide 1s linear infinite',
          }} />
        </div>

        {/* Sparkles */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: `${sparkle.left}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 16,
              animation: 'sparkle 1s ease-out forwards',
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
};

// CSS animations
const loadingStyles = `
  @keyframes loading-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes loading-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes loading-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  @keyframes loading-dance {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-5px) rotate(-5deg); }
    75% { transform: translateX(5px) rotate(5deg); }
  }

  @keyframes shimmer {
    to { left: 100%; }
  }

  @keyframes slide {
    to { background-position: 20px 0; }
  }

  @keyframes sparkle {
    0% {
      transform: translate(-50%, -50%) scale(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -150%) scale(1) rotate(180deg);
      opacity: 0;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-spin { animation: loading-spin 1s linear infinite; }
  .loading-bounce { animation: loading-bounce 1s ease-in-out infinite; }
  .loading-pulse { animation: loading-pulse 1.5s ease-in-out infinite; }
  .loading-dance { animation: loading-dance 1s ease-in-out infinite; }
  .loading-typewriter { opacity: 1; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = loadingStyles;
  document.head.appendChild(styleElement);
}