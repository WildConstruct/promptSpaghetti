import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Delightful Integration for Epic 1
 * Combines all Easter eggs and delightful details
 */
import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EasterEggManager } from './EasterEggManager';
import { PlayfulLoadingStates, InlineLoadingSpinner, PlayfulProgressBar } from './PlayfulLoadingStates';
import { UnexpectedAnimations, celebrateNodeClick } from './UnexpectedAnimations';
import { useStore } from '@/stores/graphStore';
export const DelightfulIntegration = ({ children, enableEasterEggs = true, enableAnimations = true, enablePlayfulLoading = true, }) => {
    const [weirdMode, setWeirdMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [expertMode, setExpertMode] = useState(false);
    const [precisionMode, setPrecisionMode] = useState(false);
    const [achievementUnlocked, setAchievementUnlocked] = useState(null);
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState('general');
    const [progress, setProgress] = useState(0);
    // Store reference
    const { nodes, edges } = useStore();
    // Achievement system
    const unlockAchievement = useCallback((achievementId, title, description) => {
        // Check if already unlocked
        const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
        if (unlocked.includes(achievementId))
            return;
        // Save achievement
        unlocked.push(achievementId);
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
        // Show notification
        setAchievementUnlocked(title);
        // Create achievement toast
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${title}</div>
        <div class="achievement-desc">${description}</div>
      </div>
    `;
        document.body.appendChild(toast);
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        // Remove after animation
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }, []);
    // Check for achievements
    useEffect(() => {
        // First graph created
        if (nodes.length > 0 && edges.length > 0) {
            unlockAchievement('first-graph', 'Graph Master', 'Created your first graph!');
        }
        // Complex graph
        if (nodes.length > 10) {
            unlockAchievement('complex-graph', 'Complexity Conqueror', 'Created a graph with 10+ nodes!');
        }
        // Perfect triangle
        if (nodes.length === 3 && edges.length === 3) {
            unlockAchievement('triangle', 'Sacred Geometry', 'Created a perfect triangle!');
        }
        // Speed demon - create 5 nodes in 10 seconds
        // (would need timestamp tracking for this)
    }, [nodes, edges, unlockAchievement]);
    // Preset shuffle handler
    const handlePresetsShuffled = useCallback(() => {
        // Trigger shuffle animation on preset panel
        const presetPanel = document.querySelector('.preset-panel');
        if (presetPanel) {
            presetPanel.classList.add('shuffle-animation');
            setTimeout(() => {
                presetPanel.classList.remove('shuffle-animation');
            }, 500);
        }
        // Show notification
        const notification = document.createElement('div');
        notification.textContent = '🎲 Presets shuffled!';
        notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      animation: slide-in 0.3s ease-out;
    `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }, []);
    // Loading simulation (for demo)
    const simulateLoading = useCallback((type, duration = 3000) => {
        setIsLoading(true);
        setLoadingType(type);
        setProgress(0);
        const steps = 20;
        const stepDuration = duration / steps;
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setProgress((currentStep / steps) * 100);
            if (currentStep >= steps) {
                clearInterval(interval);
                setIsLoading(false);
                setProgress(0);
            }
        }, stepDuration);
    }, []);
    // Expert mode features
    const ExpertModeIndicator = () => {
        if (!expertMode)
            return null;
        return (_jsxs("div", { className: "expert-mode-panel", style: {
                position: 'fixed',
                bottom: 20,
                left: 20,
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                zIndex: 9996,
            }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', color: '#4ecdc4' }, children: "Expert Mode" }), _jsx("div", { children: "Shortcuts:" }), _jsx("div", { children: "\u2022 Alt+Click: Quick connect" }), _jsx("div", { children: "\u2022 Shift+Drag: Multi-select" }), _jsx("div", { children: "\u2022 Ctrl+D: Duplicate" }), _jsx("div", { children: "\u2022 Tab: Quick switch" })] }));
    };
    // Weird mode visual effects
    useEffect(() => {
        if (weirdMode) {
            // Add CSS variables for weird mode
            document.documentElement.style.setProperty('--weird-hue', '0deg');
            const interval = setInterval(() => {
                const hue = (Date.now() / 100) % 360;
                document.documentElement.style.setProperty('--weird-hue', `${hue}deg`);
            }, 50);
            return () => {
                clearInterval(interval);
                document.documentElement.style.removeProperty('--weird-hue');
            };
        }
    }, [weirdMode]);
    return (_jsxs("div", { className: `delightful-wrapper ${weirdMode ? 'weird-mode-active' : ''}`, children: [enableEasterEggs && (_jsx(EasterEggManager, { onWeirdModeToggle: setWeirdMode, onDebugModeToggle: setDebugMode, onExpertModeToggle: setExpertMode, onPresetsShuffled: handlePresetsShuffled, onPrecisionModeToggle: setPrecisionMode })), enablePlayfulLoading && isLoading && (_jsxs("div", { style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                }, children: [_jsx(PlayfulLoadingStates, { isLoading: isLoading, loadingType: loadingType }), progress > 0 && (_jsx("div", { style: { marginTop: 20, minWidth: 300 }, children: _jsx(PlayfulProgressBar, { progress: progress, message: "Working magic..." }) }))] })), _jsxs(ReactFlowProvider, { children: [enableAnimations && (_jsx(UnexpectedAnimations, { enabled: enableAnimations, weirdMode: weirdMode })), _jsx(ExpertModeIndicator, {}), children] }), debugMode && (_jsxs("div", { style: {
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    display: 'flex',
                    gap: 8,
                    zIndex: 9995,
                }, children: [_jsx("button", { onClick: () => simulateLoading('graph', 2000), children: "Test Graph Loading" }), _jsx("button", { onClick: () => simulateLoading('preview', 3000), children: "Test Preview Loading" }), _jsx("button", { onClick: () => simulateLoading('save', 1500), children: "Test Save Loading" }), _jsx("button", { onClick: () => celebrateNodeClick('test-node'), children: "Test Celebration" })] }))] }));
};
// Achievement toast styles
const achievementStyles = `
  .achievement-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 16px;
    transform: translateX(400px);
    transition: transform 0.3s ease-out;
    z-index: 10000;
  }

  .achievement-toast.show {
    transform: translateX(0);
  }

  .achievement-icon {
    font-size: 40px;
    animation: bounce 0.5s ease-out;
  }

  .achievement-title {
    font-size: 12px;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .achievement-name {
    font-size: 18px;
    font-weight: bold;
    margin: 4px 0;
  }

  .achievement-desc {
    font-size: 14px;
    opacity: 0.9;
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes slide-in {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes shuffle-animation {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }

  .weird-mode-active {
    filter: hue-rotate(var(--weird-hue, 0deg));
    transition: filter 0.3s ease;
  }

  .weird-mode-active .react-flow__node {
    animation: weird-float 3s ease-in-out infinite;
  }

  @keyframes weird-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-5px) scale(1.02); }
  }

  .delightful-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }
`;
// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = achievementStyles;
    document.head.appendChild(styleElement);
}
// Export useful hooks
export const useDelightfulLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState('general');
    const startLoading = useCallback((type = 'general') => {
        setLoadingType(type);
        setIsLoading(true);
    }, []);
    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);
    return {
        isLoading,
        loadingType,
        startLoading,
        stopLoading,
        LoadingComponent: () => (_jsx(PlayfulLoadingStates, { isLoading: isLoading, loadingType: loadingType })),
        InlineSpinner: () => _jsx(InlineLoadingSpinner, {}),
    };
};
