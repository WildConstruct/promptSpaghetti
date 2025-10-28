/**
 * Success Celebration - Celebrates user achievements
 */

import React, { useEffect, useState } from 'react';
import { useTutorial } from './TutorialContext';

interface CelebrationProps {
  type?: 'tutorial_complete' | 'first_edit' | 'achievement';
  title?: string;
  message?: string;
  duration?: number;
}

export const SuccessCelebration: React.FC<CelebrationProps> = ({
  type = 'achievement',
  title = 'Achievement Unlocked!',
  message = 'Great job!',
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { onboardingState } = useTutorial();

  useEffect(() => {
    if (!onboardingState.preferences.enableCelebrations) return;

    setIsVisible(true);

    // Create confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -50,
    }));
    setParticles(newParticles);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Auto-hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onboardingState.preferences.enableCelebrations]);

  if (!isVisible || !onboardingState.preferences.enableCelebrations) return null;

  return (
    <>
      {/* Celebration message */}
      <div
        className="celebration-message"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
          zIndex: 10001,
          animation: 'celebrationBounce 0.5s ease-out',
          textAlign: 'center',
          minWidth: '300px',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'celebrationSpin 1s ease-in-out',
          }}
        >
          {type === 'tutorial_complete' ? '🎉' : type === 'first_edit' ? '✨' : '🏆'}
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '8px',
            color: '#1a1a1a',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: '#4a4a4a',
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>

      {/* Confetti particles */}
      <div
        className="confetti-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 10000,
          overflow: 'hidden',
        }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: '10px',
              height: '10px',
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][
                particle.id % 5
              ],
              borderRadius: '50%',
              animation: `confettiFall ${2 + Math.random()}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes celebrationBounce {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes celebrationSpin {
          0% {
            transform: rotate(0deg) scale(0.5);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(${window.innerHeight + 100}px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Hook to trigger celebrations
export const useSuccessCelebration = () => {
  const { unlockAchievement, onboardingState } = useTutorial();
  const [celebration, setCelebration] = useState<CelebrationProps | null>(null);

  const celebrate = (props: CelebrationProps) => {
    if (onboardingState.preferences.enableCelebrations) {
      setCelebration(props);
      setTimeout(() => setCelebration(null), props.duration || 3000);
    }
  };

  const celebrateFirstEdit = () => {
    if (!onboardingState.achievementsUnlocked.includes('first_edit')) {
      unlockAchievement('first_edit');
      celebrate({
        type: 'first_edit',
        title: 'First Edit Complete!',
        message: 'You\'re on your way to mastering Prompt Spaghetti!',
      });
    }
  };

  const celebrateTutorialComplete = () => {
    unlockAchievement('tutorial_complete');
    celebrate({
      type: 'tutorial_complete',
      title: 'Tutorial Complete!',
      message: 'You\'re ready to create amazing prompts!',
      duration: 5000,
    });
  };

  const celebrateAchievement = (title: string, message: string) => {
    celebrate({
      type: 'achievement',
      title,
      message,
    });
  };

  return {
    celebration,
    celebrate,
    celebrateFirstEdit,
    celebrateTutorialComplete,
    celebrateAchievement,
  };
};