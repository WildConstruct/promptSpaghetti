import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Gamified Progress Bar
 *
 * Interactive progress bar with gamification elements including
 * milestones, achievements, animations, and reward celebrations.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { InteractionType } from '../../services/Epic16InteractiveElementsService';
export const GamifiedProgressBar = ({ element, interactiveService, userId, currentValue, onMilestoneReached, onComplete, className = '' }) => {
    // Configuration
    const config = element.config.progress_config;
    const theme = element.config.theme;
    // State management
    const [animationState, setAnimationState] = useState({
        isAnimating: false,
        newValue: currentValue,
        previousValue: currentValue,
        celebrationActive: false
    });
    const [achievements, setAchievements] = useState([]);
    const [showTooltip, setShowTooltip] = useState(null);
    const [particles, setParticles] = useState([]);
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
        }
        // Sort thresholds by value and find the appropriate one
        const sortedThresholds = [...config.color_thresholds].sort((a, b) => a.threshold - b.threshold);
        for (let i = sortedThresholds.length - 1; i >= 0; i--) {
            if (progressPercentage >= sortedThresholds[i].threshold) {
                return sortedThresholds[i].color;
            }
        }
        return theme.primary_color;
    }, [progressPercentage, config.color_thresholds, theme.primary_color]);
    // Get next milestone
    const nextMilestone = useMemo(() => {
        if (!config.milestones)
            return null;
        return config.milestones
            .filter(milestone => currentValue < milestone.value)
            .sort((a, b) => a.value - b.value)[0] || null;
    }, [currentValue, config.milestones]);
    // Get completed milestones
    const completedMilestones = useMemo(() => {
        if (!config.milestones)
            return [];
        return config.milestones.filter(milestone => currentValue >= milestone.value);
    }, [currentValue, config.milestones]);
    // Initialize achievements
    useEffect(() => {
        const initialAchievements = [
            {
                id: 'first_step',
                title: 'First Step',
                description: 'Started your journey',
                icon: '🎯',
                unlocked: currentValue > config.min_value,
                value: config.min_value + 1
            },
            {
                id: 'quarter_way',
                title: 'Quarter Champion',
                description: 'Reached 25% progress',
                icon: '🏃',
                unlocked: progressPercentage >= 25,
                value: config.min_value + (config.max_value - config.min_value) * 0.25
            },
            {
                id: 'halfway_hero',
                title: 'Halfway Hero',
                description: 'Reached 50% progress',
                icon: '⭐',
                unlocked: progressPercentage >= 50,
                value: config.min_value + (config.max_value - config.min_value) * 0.5
            },
            {
                id: 'three_quarter_master',
                title: 'Three Quarter Master',
                description: 'Reached 75% progress',
                icon: '🔥',
                unlocked: progressPercentage >= 75,
                value: config.min_value + (config.max_value - config.min_value) * 0.75
            },
            {
                id: 'completion_champion',
                title: 'Completion Champion',
                description: 'Reached 100% progress',
                icon: '🏆',
                unlocked: progressPercentage >= 100,
                value: config.max_value
            }
        ];
        setAchievements(initialAchievements);
    }, [currentValue, progressPercentage, config.min_value, config.max_value]);
    // Handle value changes with animation
    useEffect(() => {
        if (currentValue !== animationState.newValue) {
            const previousValue = animationState.newValue;
            setAnimationState(prev => ({
                ...prev,
                isAnimating: true,
                previousValue,
                newValue: currentValue
            }));
            // Check for milestone reached
            if (config.milestones) {
                const newlyReachedMilestone = config.milestones.find(milestone => previousValue < milestone.value && currentValue >= milestone.value);
                if (newlyReachedMilestone) {
                    setAnimationState(prev => ({
                        ...prev,
                        celebrationActive: true,
                        milestoneJustReached: newlyReachedMilestone
                    }));
                    onMilestoneReached?.(newlyReachedMilestone);
                    triggerCelebration();
                    // Track milestone achievement
                    interactiveService.trackInteraction(element.id, {
                        type: InteractionType.CUSTOM,
                        user_id: userId,
                        timestamp: new Date(),
                        context: {
                            page_url: window.location.href,
                            referrer: document.referrer,
                            user_agent: navigator.userAgent,
                            screen_resolution: `${screen.width}x${screen.height}`,
                            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                            device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
                            session_id: 'session-' + Date.now(),
                            ab_test_variant: null
                        },
                        data: {
                            action: 'milestone_reached',
                            milestone_id: newlyReachedMilestone.label,
                            milestone_value: newlyReachedMilestone.value,
                            progress_percentage: progressPercentage
                        },
                        result: {
                            success: true,
                            conversion: true,
                            data: { milestone: newlyReachedMilestone }
                        },
                        duration: 0
                    });
                }
            }
            // Check for completion
            if (previousValue < config.max_value && currentValue >= config.max_value) {
                onComplete?.();
            }
            // End animation after delay
            const animationTimeout = setTimeout(() => {
                setAnimationState(prev => ({
                    ...prev,
                    isAnimating: false,
                    celebrationActive: false,
                    milestoneJustReached: undefined
                }));
            }, config.animated ? 1000 : 0);
            return () => clearTimeout(animationTimeout);
        }
    }, [currentValue, animationState.newValue, config.milestones, config.max_value, config.animated, element.id, interactiveService, userId, progressPercentage, onMilestoneReached, onComplete]);
    // Trigger celebration particles
    const triggerCelebration = useCallback(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: `particle-${Date.now()}-${i}`,
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
    const formatValue = useCallback((value) => {
        if (Number.isInteger(value)) {
            return value.toString();
        }
        return value.toFixed(1);
    }, []);
    // Render milestone markers
    const renderMilestones = () => {
        if (!config.milestones || !config.show_labels)
            return null;
        return config.milestones.map((milestone) => {
            const milestonePercentage = ((milestone.value - config.min_value) / (config.max_value - config.min_value)) * 100;
            const isReached = currentValue >= milestone.value;
            const isNext = milestone === nextMilestone;
            return (_jsxs("div", { className: "absolute transform -translate-x-1/2", style: { left: `${milestonePercentage}%`, top: '-8px' }, onMouseEnter: () => setShowTooltip(milestone.label), onMouseLeave: () => setShowTooltip(null), children: [_jsx("div", { className: `w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer ${isReached
                            ? 'bg-green-500 border-green-500 scale-110'
                            : isNext
                                ? 'bg-yellow-400 border-yellow-400 animate-pulse'
                                : 'bg-white border-gray-300'}`, children: milestone.icon && isReached && (_jsx("div", { className: "text-xs text-center leading-none", children: milestone.icon })) }), showTooltip === milestone.label && (_jsxs("div", { className: "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap", children: [milestone.label, milestone.reward && (_jsxs("div", { className: "text-yellow-300", children: ["Reward: ", milestone.reward] })), _jsx("div", { className: "absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900" })] }))] }, milestone.value));
        });
    };
    // Render achievements
    const renderAchievements = () => {
        const recentlyUnlocked = achievements.filter(achievement => achievement.unlocked && (!achievement.unlockedAt || Date.now() - achievement.unlockedAt.getTime() < 5000));
        if (recentlyUnlocked.length === 0)
            return null;
        return (_jsx("div", { className: "absolute top-full mt-4 left-0 right-0", children: recentlyUnlocked.map(achievement => (_jsx("div", { className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 mb-2 shadow-lg animate-bounce", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-2xl", children: achievement.icon }), _jsxs("div", { children: [_jsx("div", { className: "font-bold", children: achievement.title }), _jsx("div", { className: "text-sm opacity-90", children: achievement.description })] })] }) }, achievement.id))) }));
    };
    return (_jsxs("div", { className: `relative ${className}`, children: [_jsxs("div", { className: "relative bg-gray-200 rounded-full overflow-hidden", style: {
                    height: `${theme.border_radius * 2}px`,
                    backgroundColor: theme.background_color
                }, children: [_jsx("div", { className: `h-full transition-all duration-500 ease-out ${config.animated ? 'transform origin-left' : ''}`, style: {
                            width: `${progressPercentage}%`,
                            backgroundColor: currentColor,
                            transform: animationState.isAnimating && config.animated ? 'scaleX(1.05)' : 'scaleX(1)'
                        }, children: config.animated && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse", style: { animationDuration: '2s' } })) }), renderMilestones(), animationState.celebrationActive && particles.map(particle => (_jsx("div", { className: "absolute w-2 h-2 rounded-full animate-ping", style: {
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            backgroundColor: particle.color,
                            animationDuration: '1s'
                        } }, particle.id)))] }), config.show_percentage && (_jsxs("div", { className: "flex justify-between items-center mt-2 text-sm", children: [_jsxs("span", { style: { color: theme.text_color }, children: [formatValue(currentValue), " / ", formatValue(config.max_value)] }), _jsxs("span", { className: "font-bold", style: { color: currentColor }, children: [progressPercentage.toFixed(1), "%"] })] })), nextMilestone && (_jsxs("div", { className: "mt-2 text-xs text-gray-600", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { children: ["Next: ", nextMilestone.label] }), _jsxs("span", { children: [formatValue(nextMilestone.value - currentValue), " to go"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-1 mt-1", children: _jsx("div", { className: "bg-yellow-400 h-1 rounded-full transition-all duration-300", style: {
                                width: `${Math.max(0, (currentValue - (completedMilestones[completedMilestones.length - 1]?.value || config.min_value)) / (nextMilestone.value - (completedMilestones[completedMilestones.length - 1]?.value || config.min_value)) * 100)}%`
                            } }) })] })), animationState.celebrationActive && animationState.milestoneJustReached && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl p-6 text-center animate-scale-in border-4 border-yellow-400", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83C\uDF89" }), _jsx("div", { className: "font-bold text-lg text-gray-900", children: "Milestone Reached!" }), _jsx("div", { className: "text-sm text-gray-600", children: animationState.milestoneJustReached.label }), animationState.milestoneJustReached.reward && (_jsxs("div", { className: "mt-2 text-sm text-yellow-600 font-medium", children: ["Reward: ", animationState.milestoneJustReached.reward] }))] }) })), renderAchievements(), progressPercentage >= 100 && (_jsx("div", { className: "absolute top-full mt-4 left-0 right-0 text-center", children: _jsxs("div", { className: "bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-4 shadow-lg", children: [_jsx("div", { className: "text-3xl mb-2", children: "\uD83C\uDFC6" }), _jsx("div", { className: "font-bold text-xl", children: "Congratulations!" }), _jsx("div", { className: "text-sm opacity-90", children: "You've reached 100% completion!" })] }) })), _jsx("style", { jsx: true, children: `
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      ` })] }));
};
export default GamifiedProgressBar;
