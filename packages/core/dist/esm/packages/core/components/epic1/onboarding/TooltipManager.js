import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Tooltip Manager - Centralized tooltip management system
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ContextualTooltips } from './ContextualTooltips';
import { useTutorial } from './TutorialContext';
const TooltipManagerContext = createContext(null);
export const useTooltipManager = () => {
    const context = useContext(TooltipManagerContext);
    if (!context) {
        throw new Error('useTooltipManager must be used within TooltipManagerProvider');
    }
    return context;
};
export const TooltipManagerProvider = ({ children }) => {
    const [activeTooltips, setActiveTooltips] = useState([]);
    const [queue, setQueue] = useState({ tooltips: [], currentIndex: 0 });
    const [isShowingQueue, setIsShowingQueue] = useState(false);
    const { onboardingState } = useTutorial();
    // Show single tooltip
    const showTooltip = useCallback((tooltip) => {
        if (!onboardingState.preferences.showTooltips)
            return;
        setActiveTooltips(prev => {
            // Remove existing tooltip with same ID
            const filtered = prev.filter(t => t.id !== tooltip.id);
            return [...filtered, tooltip];
        });
    }, [onboardingState.preferences.showTooltips]);
    // Hide specific tooltip
    const hideTooltip = useCallback((tooltipId) => {
        setActiveTooltips(prev => prev.filter(t => t.id !== tooltipId));
    }, []);
    // Hide all tooltips
    const hideAllTooltips = useCallback(() => {
        setActiveTooltips([]);
        setIsShowingQueue(false);
    }, []);
    // Queue multiple tooltips
    const queueTooltips = useCallback((tooltips) => {
        if (!onboardingState.preferences.showTooltips)
            return;
        setQueue({ tooltips, currentIndex: 0 });
        setIsShowingQueue(true);
        // Show first tooltip
        if (tooltips.length > 0) {
            showTooltip(tooltips[0]);
        }
    }, [onboardingState.preferences.showTooltips, showTooltip]);
    // Move to next tooltip in queue
    const nextInQueue = useCallback(() => {
        if (!isShowingQueue || queue.currentIndex >= queue.tooltips.length - 1) {
            setIsShowingQueue(false);
            return;
        }
        const nextIndex = queue.currentIndex + 1;
        setQueue(prev => ({ ...prev, currentIndex: nextIndex }));
        // Hide current and show next
        hideAllTooltips();
        setTimeout(() => {
            showTooltip(queue.tooltips[nextIndex]);
        }, 300);
    }, [isShowingQueue, queue, hideAllTooltips, showTooltip]);
    // Clear queue
    const clearQueue = useCallback(() => {
        setQueue({ tooltips: [], currentIndex: 0 });
        setIsShowingQueue(false);
        hideAllTooltips();
    }, [hideAllTooltips]);
    const value = {
        showTooltip,
        hideTooltip,
        hideAllTooltips,
        queueTooltips,
        nextInQueue,
        clearQueue,
        activeTooltips,
        queue,
        isShowingQueue,
    };
    return (_jsxs(TooltipManagerContext.Provider, { value: value, children: [children, _jsx(ContextualTooltips, { additionalTooltips: activeTooltips, enabled: onboardingState.preferences.showTooltips })] }));
};
// Tooltip presets for common scenarios
export const tooltipPresets = {
    firstTimeUser: [
        {
            id: 'welcome-canvas',
            target: '.react-flow__viewport',
            title: 'Welcome to Your Canvas!',
            content: 'This is where you\'ll build your prompt graphs. Let\'s explore the key features.',
            position: 'auto',
            delay: 1000,
            priority: 'high',
        },
        {
            id: 'palette-intro',
            target: '.node-palette',
            title: 'Node Library',
            content: 'Drag these node types onto the canvas to start building.',
            position: 'left',
            delay: 1000,
            priority: 'high',
        },
        {
            id: 'edit-intro',
            target: '.react-flow__node',
            title: 'Edit Nodes',
            content: 'Double-click any text to edit it inline.',
            position: 'right',
            delay: 1000,
            priority: 'high',
        },
    ],
    nodeEditing: [
        {
            id: 'edit-mode',
            target: '.node-editing',
            title: 'Editing Mode',
            content: 'Type to change the text. Press Enter to save or Escape to cancel.',
            position: 'top',
            delay: 500,
            priority: 'medium',
        },
    ],
    connectionHelp: [
        {
            id: 'drag-handle',
            target: '.react-flow__handle',
            title: 'Create Connections',
            content: 'Drag from here to another node to connect them.',
            position: 'auto',
            delay: 1000,
            priority: 'medium',
        },
    ],
};
// Hook for tooltip sequences
export const useTooltipSequence = () => {
    const { queueTooltips, nextInQueue, clearQueue, isShowingQueue } = useTooltipManager();
    const startSequence = useCallback((sequence) => {
        const tooltips = tooltipPresets[sequence];
        if (tooltips) {
            queueTooltips(tooltips);
        }
    }, [queueTooltips]);
    return {
        startSequence,
        nextInQueue,
        clearQueue,
        isShowingQueue,
    };
};
// Auto-tooltip component
export const AutoTooltips = ({ showForNewUsers = true, contextual = true }) => {
    const { onboardingState } = useTutorial();
    const { startSequence } = useTooltipSequence();
    useEffect(() => {
        // Show first-time tooltips for new users
        if (showForNewUsers && onboardingState.completedSteps.length === 0) {
            const timer = setTimeout(() => {
                startSequence('firstTimeUser');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showForNewUsers, onboardingState.completedSteps, startSequence]);
    return null;
};
