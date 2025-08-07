import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Example: How to integrate the onboarding system
 *
 * This example shows how to add the interactive
 * tutorial and help system to your Epic 1 app.
 */
import { useState } from 'react';
import { OnboardingIntegration, useOnboarding, ProgressTracker, } from '../onboarding';
import { Epic1GraphEditor } from '../Epic1GraphEditor';
// Example graph editor with onboarding
export const OnboardingExample = () => {
    const [showSettings, setShowSettings] = useState(false);
    return (_jsx(OnboardingIntegration, { showProgress: true, children: _jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsx("div", { className: "tutorial-welcome" }), _jsx(Epic1GraphEditor, {}), _jsx("button", { onClick: () => setShowSettings(!showSettings), style: {
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        padding: '12px 24px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }, children: "Settings" }), showSettings && _jsx(SettingsPanel, { onClose: () => setShowSettings(false) })] }) }));
};
// Settings panel with tutorial controls
const SettingsPanel = ({ onClose }) => {
    const { resetTutorial, updatePreferences, onboardingState, celebrateAchievement, } = useOnboarding();
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            overflowY: 'auto',
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }, children: [_jsx("h2", { style: { margin: 0 }, children: "Settings" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }, children: "\u00D7" })] }), _jsxs("section", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Tutorial & Help" }), _jsx("button", { onClick: resetTutorial, style: {
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '16px',
                        }, children: "Restart Tutorial" }), _jsx("div", { style: { marginBottom: '12px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: onboardingState.preferences.showTooltips, onChange: (e) => updatePreferences({ showTooltips: e.target.checked }) }), "Show helpful tooltips"] }) }), _jsx("div", { style: { marginBottom: '12px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: onboardingState.preferences.enableCelebrations, onChange: (e) => updatePreferences({ enableCelebrations: e.target.checked }) }), "Enable celebration animations"] }) }), _jsx("div", { style: { marginBottom: '12px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: onboardingState.preferences.keyboardShortcutsOverlay, onChange: (e) => updatePreferences({ keyboardShortcutsOverlay: e.target.checked }) }), "Show keyboard shortcuts on ?"] }) })] }), _jsxs("section", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Your Progress" }), _jsx(ProgressTracker, {})] }), _jsxs("section", { children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Test Celebrations" }), _jsx("button", { onClick: () => celebrateAchievement('Test Achievement', 'This is what celebrations look like!'), style: {
                            padding: '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }, children: "Test Celebration" })] })] }));
};
// Example: Triggering first edit celebration
export const FirstEditExample = () => {
    const { triggerFirstEdit, hasCompletedTutorial } = useOnboarding();
    const [nodeText, setNodeText] = useState('Original text');
    const handleEdit = (newText) => {
        setNodeText(newText);
        // Trigger first edit celebration
        if (!hasCompletedTutorial()) {
            triggerFirstEdit();
        }
    };
    return (_jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "First Edit Detection Example" }), _jsxs("div", { style: {
                    marginTop: '24px',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                }, children: [_jsxs("p", { children: ["Current text: ", nodeText] }), _jsx("input", { type: "text", value: nodeText, onChange: (e) => handleEdit(e.target.value), style: {
                            width: '100%',
                            padding: '8px',
                            marginTop: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                        } }), _jsx("p", { style: { fontSize: '14px', color: '#6b7280', marginTop: '8px' }, children: "Edit the text above to trigger the first edit celebration!" })] })] }));
};
// Example: Tutorial state management
export const TutorialStateExample = () => {
    const { onboardingState, startTutorial, isNewUser, hasCompletedTutorial, } = useOnboarding();
    return (_jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Tutorial State Management" }), _jsxs("div", { style: { marginTop: '24px' }, children: [_jsx("h3", { children: "Current State:" }), _jsx("pre", { style: {
                            backgroundColor: '#f3f4f6',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }, children: JSON.stringify({
                            isNewUser: isNewUser(),
                            hasCompletedTutorial: hasCompletedTutorial(),
                            tutorialProgress: onboardingState.tutorialProgress,
                            completedSteps: onboardingState.completedSteps,
                            achievementsUnlocked: onboardingState.achievementsUnlocked,
                        }, null, 2) })] }), _jsx("div", { style: { marginTop: '24px' }, children: _jsx("button", { onClick: startTutorial, style: {
                        padding: '12px 24px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }, children: "Start Tutorial" }) })] }));
};
