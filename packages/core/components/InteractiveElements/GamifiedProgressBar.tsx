/**
 * Epic 16 Gamified Progress Bar
 * 
 * Interactive progress bar with gamification elements including
 * milestones, achievements, animations, and reward celebrations.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProgressBarElement,
  Epic16InteractiveElementsService,
  InteractionType,
  Milestone,
  ColorThreshold
} from '../../services/Epic16InteractiveElementsService';
}
interface GamifiedProgressBarProps {
  element: ProgressBarElement;
  interactiveService: Epic16InteractiveElementsService;
  userId: string;
  currentValue: number;
  onMilestoneReached?: (milestone: Milestone) => void;
  onComplete?: () => void;
  className?: string;
  interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  value: number;
  interface AnimationState {
  isAnimating: boolean;
  newValue: number;
  previousValue: number;
  celebrationActive: boolean;
  milestoneJustReached?: Milestone;
  export const GamifiedProgressBar: React.FC<GamifiedProgressBarProps> = ({,)
  element,
  interactiveService,
  userId,
  currentValue,
  onMilestoneReached,
  onComplete,
  className = ''
}
}) => {
  // Configuration
  const config = element.config.progress_config;
  const theme = element.config.theme;
  // State management
  const [animationState, setAnimationState] = useState<AnimationState>({)
  isAnimating: false,
  newValue: currentValue,
  previousValue: currentValue,
  celebrationActive: false,
});
  const [achievements, setAchievements] = useState<Achievement>([]);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const range = config.max_value - config.min_value;
    const normalized = Math.max(0, Math.min(range, currentValue - config.min_value));
    return (normalized / range) * 100;
  }, [currentValue, config.min_value, config.max_value]);
  // Get current color based on thresholds
  const currentColor = useMemo(() => {
    if (!config.color_thresholds || config.color_thresholds.length === 0) {
      return theme.primary_color;
    // Sort thresholds by value and find the appropriate one
    const sortedThresholds = [...config.color_thresholds].sort((a, b) => a.threshold - b.threshold);
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (progressPercentage >= sortedThresholds[i].threshold) {
        return sortedThresholds[i].color;
    return theme.primary_color;
  }, [progressPercentage, config.color_thresholds, theme.primary_color]);
  // Get next milestone
  const nextMilestone = useMemo(() => {
    if (!config.milestones) return null;
    return config.milestones
      .filter(milestone => currentValue < milestone.value)
      .sort((a, b) => a.value - b.value)[0] || null;
  }, [currentValue, config.milestones]);
  // Get completed milestones
  const completedMilestones = useMemo(() => {
    if (!config.milestones) return [];
    return config.milestones.filter(milestone => currentValue >= milestone.value);
  }, [currentValue, config.milestones]);
  // Initialize achievements
  useEffect(() => {
  const initialAchievements: Achievement = [
  {
  id: 'first_step',
  title: 'First Step',
  description: 'Started your journey',
  icon: '🎯',
  unlocked: currentValue > config.min_value,
  value: config.min_value + 1,
}
      {
  id: 'quarter_way',
  title: 'Quarter Champion',
  description: 'Reached 25% progress',
  icon: '🏃',
  unlocked: progressPercentage >= 25,
  value: config.min_value + (config.max_value - config.min_value) * 0.25,
}
      {
  id: 'halfway_hero',
  title: 'Halfway Hero',
  description: 'Reached 50% progress',
  icon: '⭐',
  unlocked: progressPercentage >= 50,
  value: config.min_value + (config.max_value - config.min_value) * 0.5,
}
      {
  id: 'three_quarter_master',
  title: 'Three Quarter Master',
  description: 'Reached 75% progress',
  icon: '🔥',
  unlocked: progressPercentage >= 75,
  value: config.min_value + (config.max_value - config.min_value) * 0.75,
}
      {
  id: 'completion_champion',
  title: 'Completion Champion',
  description: 'Reached 100% progress',
  icon: '🏆',
  unlocked: progressPercentage >= 100,
  value: config.max_value];
  setAchievements(initialAchievements);
}, [currentValue, progressPercentage, config.min_value, config.max_value]);
  // Handle value changes with animation
  useEffect(() => {
  if (currentValue !== animationState.newValue) {
  const previousValue = animationState.newValue;
  setAnimationState(prev => ({)
  ...prev,
  isAnimating: true,
  previousValue,
  newValue: currentValue,
}));
      // Check for milestone reached
      if (config.milestones) {
  const newlyReachedMilestone = config.milestones.find(;);
  milestone => previousValue < milestone.value && currentValue >= milestone.value
  );
  if (newlyReachedMilestone) {
  setAnimationState(prev => ({)
  ...prev,
  celebrationActive: true,
  milestoneJustReached: newlyReachedMilestone,
}));
          onMilestoneReached?.(newlyReachedMilestone);
          triggerCelebration();
          // Track milestone achievement
          interactiveService.trackInteraction(element.id, {)
  type: InteractionType.CUSTOM,
            user_id: userId,
            timestamp: new Date(),
            context: {
  page_url: window.location.href,
              referrer: document.referrer,
              user_agent: navigator.userAgent,
              screen_resolution: `${screen.width}x${screen.height}`}
},
  viewport_size: `${window.innerWidth}x${window.innerHeight}`}
},
  device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
              session_id: 'session-' + Date.now(),
              ab_test_variant: null;
  },
  data: {
  action: 'milestone_reached',
  milestone_id: newlyReachedMilestone.label,
  milestone_value: newlyReachedMilestone.value,
  progress_percentage: progressPercentage,
},
  result: {
  success: true,
              conversion: true,
              data: { milestone: newlyReachedMilestone }
  },
  duration: 0;
  });
      // Check for completion
      if (previousValue < config.max_value && currentValue >= config.max_value) {
  onComplete?.();
  // End animation after delay
  const animationTimeout = setTimeout(() => {
  setAnimationState(prev => ({)
  ...prev,
  isAnimating: false,
  celebrationActive: false,
  milestoneJustReached: undefined,
}));
      }, config.animated ? 1000 : 0);
      return () => clearTimeout(animationTimeout);
  }, [currentValue, animationState.newValue, config.milestones, config.max_value, config.animated, element.id, interactiveService, userId, progressPercentage, onMilestoneReached, onComplete]);
  // Trigger celebration particles
  const triggerCelebration = useCallback(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({)
  id: `particle-${Date.now()}-${i}`}
},
  x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
    }));
    setParticles(newParticles);
    // Remove particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 2000);
  }, []);
  // Format value for display
  const formatValue = useCallback((value: number) => {
    if (Number.isInteger(value)) {
      return value.toString();
    return value.toFixed(1);
  }, []);
  // Render milestone markers
  const renderMilestones = () => {
    if (!config.milestones || !config.show_labels) return null;
    return config.milestones.map((milestone) => {
      const milestonePercentage = ((milestone.value - config.min_value) / (config.max_value - config.min_value)) * 100;
      const isReached = currentValue >= milestone.value;
      const isNext = milestone === nextMilestone;
      return;
        <div
          key={milestone.value}
          className="absolute transform -translate-x-1/2"
          style={{ left: `${milestonePercentage}%`, top: '-8px' }}
          onMouseEnter={() => setShowTooltip(milestone.label)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer ${
  isReached
  ? 'bg-green-500 border-green-500 scale-110'
  : isNext,
  ? 'bg-yellow-400 border-yellow-400 animate-pulse'
  : 'bg-white border-gray-300',
}`}>
            {milestone.icon && isReached && ()
              <div className="text-xs text-center leading-none">{milestone.icon}</div>
            )}
          </div>
          {showTooltip === milestone.label && ()
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {milestone.label}
              {milestone.reward && ()
                <div className="text-yellow-300">Reward: {milestone.reward}</div>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
    });
  };
  // Render achievements
  const renderAchievements = () => {
    const recentlyUnlocked = achievements.filter(achievement => ;);
      achievement.unlocked && (!achievement.unlockedAt || Date.now() - achievement.unlockedAt.getTime() < 5000)
    );
    if (recentlyUnlocked.length === 0) return null;
    return;
      <div className="absolute top-full mt-4 left-0 right-0">
        {recentlyUnlocked.map(achievement => ()
          <div
            key={achievement.id}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 mb-2 shadow-lg animate-bounce"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <div className="font-bold">{achievement.title}</div>
                <div className="text-sm opacity-90">{achievement.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  return;
    <div className={`relative ${className}`}>}
      {/* Progress Bar Container */}
      <div 
        className="relative bg-gray-200 rounded-full overflow-hidden"
        style={{ 
          height: `${theme.border_radius * 2}px`}
},
  backgroundColor: theme.background_color;
  }}
      >
        {/* Progress Fill */}
        <div
          className={`h-full transition-all duration-500 ease-out ${config.animated ? 'transform origin-left' : ''}`}
          style={{
            width: `${progressPercentage}%`}
},
  backgroundColor: currentColor,
            transform: animationState.isAnimating && config.animated ? 'scaleX(1.05)' : 'scaleX(1)';
  }}
        >
          {/* Shine effect */}
          {config.animated && ()
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          )}
        </div>
        {/* Milestone markers */}
        {renderMilestones()}
        {/* Celebration particles */}
        {animationState.celebrationActive && particles.map(particle => ()
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`}
},
  top: `${particle.y}%`}
},
  backgroundColor: particle.color,
              animationDuration: '1s'
  }}
          />
        ))}
      </div>
      {/* Progress Label */}
      {config.show_percentage && ()
        <div className="flex justify-between items-center mt-2 text-sm">
          <span style={{ color: theme.text_color }}>
            {formatValue(currentValue)} / {formatValue(config.max_value)}
          </span>
          <span 
            className="font-bold"
            style={{ color: currentColor }}
          >
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
      )}
      {/* Next Milestone Info */}
      {nextMilestone && ()
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>Next: {nextMilestone.label}</span>
            <span>{formatValue(nextMilestone.value - currentValue)} to go</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
              style={{
  width: `${Math.max(),}
}
                  0,
                  (currentValue - (completedMilestones[completedMilestones.length - 1]?.value || config.min_value)
                )) / (nextMilestone.value - (completedMilestones[completedMilestones.length - 1]?.value || config.min_value)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
      {/* Milestone Celebration */}
      {animationState.celebrationActive && animationState.milestoneJustReached && ()
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center animate-scale-in border-4 border-yellow-400">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-lg text-gray-900">Milestone Reached!</div>
            <div className="text-sm text-gray-600">{animationState.milestoneJustReached.label}</div>
            {animationState.milestoneJustReached.reward && ()
              <div className="mt-2 text-sm text-yellow-600 font-medium">
                Reward: {animationState.milestoneJustReached.reward}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Achievement Notifications */}
      {renderAchievements()}
      {/* Completion Celebration */}
      {progressPercentage >= 100 && ()
        <div className="absolute top-full mt-4 left-0 right-0 text-center">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-4 shadow-lg">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold text-xl">Congratulations!</div>
            <div className="text-sm opacity-90">You've reached 100% completion!</div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
  opacity: 0;
          100% {
            transform: scale(1);
  opacity: 1;
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
      `}</style>
    </div>
  );
};

export default GamifiedProgressBar;