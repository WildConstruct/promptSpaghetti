import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Help/HelpContentManager.tsx
// Help Content Management System for Story 8.4 Task 4
// Manages help content, onboarding state, and contextual help delivery
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUILT_IN_HELP_CONTENT } from './ContextualHelpSystem';
const HelpContext = createContext(undefined);
export const useHelpSystem = () => {
    const context = useContext(HelpContext);
    if (!context) {
        throw new Error('useHelpSystem must be used within a HelpProvider');
    }
    return context;
};
export const HelpProvider = ({ children, customHelpContent = [], enableOnboarding = true, enableHelpHints = true }) => {
    // Core state
    const [helpContent, setHelpContent] = useState([
        ...BUILT_IN_HELP_CONTENT,
        ...customHelpContent
    ]);
    // Onboarding state
    const [onboardingEnabled, setOnboardingEnabled] = useState(enableOnboarding);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [showHelpHints, setShowHelpHints] = useState(enableHelpHints);
    // Load onboarding state from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('wildConstruct_helpSystem');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setOnboardingComplete(parsed.onboardingComplete || false);
                setShowHelpHints(parsed.showHelpHints !== undefined ? parsed.showHelpHints : enableHelpHints);
                setOnboardingStep(parsed.onboardingStep || 0);
            }
            catch (error) {
                console.warn('Failed to parse help system state:', error);
            }
        }
    }, [enableHelpHints]);
    // Save state to localStorage
    const saveState = () => {
        const state = {
            onboardingComplete,
            showHelpHints,
            onboardingStep,
            lastUpdated: Date.now()
        };
        localStorage.setItem('wildConstruct_helpSystem', JSON.stringify(state));
    };
    // Save state when it changes
    useEffect(() => {
        saveState();
    }, [onboardingComplete, showHelpHints, onboardingStep]);
    // Content management functions
    const getHelpContent = (id) => {
        return helpContent.find(content => content.id === id);
    };
    const addHelpContent = React.useCallback((content) => {
        setHelpContent(prev => {
            // Check if content already exists
            const existingIndex = prev.findIndex(c => c.id === content.id);
            if (existingIndex >= 0) {
                // Update existing content
                const updated = [...prev];
                updated[existingIndex] = content;
                return updated;
            }
            else {
                // Add new content
                return [...prev, content];
            }
        });
    }, []);
    const updateHelpContent = React.useCallback((id, updates) => {
        setHelpContent(prev => prev.map(content => content.id === id ? { ...content, ...updates } : content));
    }, []);
    const removeHelpContent = React.useCallback((id) => {
        setHelpContent(prev => prev.filter(content => content.id !== id));
    }, []);
    // Onboarding functions
    const getOnboardingSteps = () => {
        return helpContent
            .filter(content => content.category === 'onboarding')
            .sort((a, b) => (a.priority === 'high' ? -1 : 1));
    };
    const startOnboarding = () => {
        setOnboardingStep(0);
        setOnboardingComplete(false);
        setOnboardingEnabled(true);
    };
    const nextOnboardingStep = () => {
        const steps = getOnboardingSteps();
        if (onboardingStep < steps.length - 1) {
            setOnboardingStep(prev => prev + 1);
        }
        else {
            completeOnboarding();
        }
    };
    const previousOnboardingStep = () => {
        if (onboardingStep > 0) {
            setOnboardingStep(prev => prev - 1);
        }
    };
    const skipOnboarding = () => {
        setOnboardingEnabled(false);
        setOnboardingComplete(true);
    };
    const completeOnboarding = () => {
        setOnboardingEnabled(false);
        setOnboardingComplete(true);
        setOnboardingStep(0);
    };
    const toggleHelpHints = () => {
        setShowHelpHints(prev => !prev);
    };
    const resetHelpSystem = () => {
        setOnboardingComplete(false);
        setOnboardingStep(0);
        setOnboardingEnabled(enableOnboarding);
        setShowHelpHints(enableHelpHints);
        localStorage.removeItem('wildConstruct_helpSystem');
    };
    const contextValue = {
        helpContent,
        onboardingEnabled: onboardingEnabled && !onboardingComplete,
        onboardingStep,
        onboardingComplete,
        showHelpHints,
        getHelpContent,
        addHelpContent,
        updateHelpContent,
        removeHelpContent,
        startOnboarding,
        nextOnboardingStep,
        previousOnboardingStep,
        skipOnboarding,
        completeOnboarding,
        toggleHelpHints,
        resetHelpSystem
    };
    return (_jsx(HelpContext.Provider, { value: contextValue, children: children }));
};
// Hook for easy help content registration
export 
// Register help content for a component
const registerHelpContent = (content) => {
    if (Array.isArray(content)) {
        content.forEach(addHelpContent);
    }
    else {
        addHelpContent(content);
    }
};
// Register help content with automatic cleanup
const useHelpContent = (content) => {
    React.useEffect(() => {
        registerHelpContent(content);
        // Cleanup function to remove content when component unmounts
        return () => {
            if (Array.isArray(content)) {
                content.forEach(c => removeHelpContent(c.id));
            }
            else {
                removeHelpContent(content.id);
            }
        };
    }, []);
};
return {
    registerHelpContent,
    useHelpContent,
    updateHelpContent,
    removeHelpContent
};
;
React.useEffect(() => {
    const content = {
        ...stableHelpContent,
        id: fieldId
    };
    addHelpContent(content);
}, [fieldId, stableHelpContent, addHelpContent]);
return getHelpContent(fieldId);
;
export const onboardingSteps = helpContent
    .filter(content => content.category === 'onboarding')
    .sort((a, b) => (a.priority === 'high' ? -1 : 1));
const currentStepData = onboardingSteps[onboardingStep];
return {
    isOnboardingActive: onboardingEnabled && !onboardingComplete,
    currentStep: currentStepData,
    currentStepIndex: onboardingStep,
    totalSteps: onboardingSteps.length,
    allSteps: onboardingSteps,
    nextStep: nextOnboardingStep,
    previousStep: previousOnboardingStep,
    skipOnboarding,
    completeOnboarding,
    startOnboarding,
    isComplete: onboardingComplete
};
;
return (_jsxs("div", { className: `help-system-settings ${className}`, style: {
        background: '#2d3748',
        border: '1px solid #4a5568',
        borderRadius: 6,
        padding: 12
    }, children: [_jsx("h4", { style: {
                margin: '0 0 12px 0',
                fontSize: 12,
                fontWeight: 600,
                color: '#e2e8f0'
            }, children: "Help System Settings" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: 11,
                        color: '#e2e8f0'
                    }, children: [_jsx("input", { type: "checkbox", checked: showHelpHints, onChange: toggleHelpHints, style: { cursor: 'pointer' } }), "Show help tooltips and hints"] }), _jsxs("div", { style: {
                        fontSize: 11,
                        color: '#a0aec0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }, children: [_jsxs("span", { children: ["Onboarding: ", onboardingComplete ? '✅ Complete' : '🔄 Available'] }), onboardingComplete && (_jsx("button", { onClick: startOnboarding, style: {
                                padding: '2px 6px',
                                fontSize: 10,
                                background: '#4299e1',
                                border: 'none',
                                borderRadius: 2,
                                color: 'white',
                                cursor: 'pointer'
                            }, children: "Restart Tour" }))] }), _jsx("button", { onClick: resetHelpSystem, style: {
                        padding: '4px 8px',
                        fontSize: 10,
                        background: '#e53e3e',
                        border: 'none',
                        borderRadius: 3,
                        color: 'white',
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                    }, children: "Reset Help System" })] })] }));
;
export default HelpProvider;
