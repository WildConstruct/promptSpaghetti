import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTutorial } from './TutorialContext';
const ProgressBar = ({ label, current, total, color = '#6366f1' }) => {
    const percentage = Math.round((current / total) * 100);
    return (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '14px',
                }, children: [_jsx("span", { style: { color: '#4a4a4a' }, children: label }), _jsxs("span", { style: { color: '#666' }, children: [percentage, "%"] })] }), _jsx("div", { style: {
                    height: '8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }, children: _jsx("div", { style: {
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: color,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px',
                    } }) })] }));
};
export const ProgressTracker = () => {
    const { onboardingState, tutorialSteps } = useTutorial();
    const achievements = [
        { id: 'tutorial_complete', name: 'Tutorial Master', icon: '🎓' },
        { id: 'first_edit', name: 'First Edit', icon: '✏️' },
        { id: 'graph_master', name: 'Graph Master', icon: '🕸️' },
        { id: 'speed_demon', name: 'Speed Demon', icon: '⚡' },
        { id: 'explorer', name: 'Feature Explorer', icon: '🔍' },
        { id: 'power_user', name: 'Power User', icon: '💪' },
    ];
    const helpSections = [
        { id: 'keyboard_shortcuts', name: 'Keyboard Shortcuts' },
        { id: 'node_types', name: 'Node Types' },
        { id: 'advanced_features', name: 'Advanced Features' },
        { id: 'tips_tricks', name: 'Tips & Tricks' },
    ];
    const unlockedCount = onboardingState.achievementsUnlocked.length;
    const viewedHelpCount = Object.keys(onboardingState.helpViewed).length;
    return (_jsxs("div", { className: "progress-tracker", style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
        }, children: [_jsx("h3", { style: {
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '20px',
                    color: '#1a1a1a',
                }, children: "Your Progress" }), _jsx(ProgressBar, { label: "Tutorial Progress", current: onboardingState.completedSteps.length, total: tutorialSteps.length, color: "#6366f1" }), _jsx(ProgressBar, { label: "Achievements Unlocked", current: unlockedCount, total: achievements.length, color: "#10b981" }), _jsx(ProgressBar, { label: "Help Topics Explored", current: viewedHelpCount, total: helpSections.length, color: "#f59e0b" }), _jsxs("div", { style: { marginTop: '24px' }, children: [_jsx("h4", { style: {
                            fontSize: '16px',
                            fontWeight: 600,
                            marginBottom: '12px',
                            color: '#1a1a1a',
                        }, children: "Achievements" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px',
                        }, children: achievements.map((achievement) => {
                            const isUnlocked = onboardingState.achievementsUnlocked.includes(achievement.id);
                            return (_jsxs("div", { style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: isUnlocked ? '#f0fdf4' : '#f9fafb',
                                    border: `1px solid ${isUnlocked ? '#86efac' : '#e5e7eb'}`,
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                }, title: achievement.name, children: [_jsx("div", { style: {
                                            fontSize: '24px',
                                            marginBottom: '4px',
                                            filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                            opacity: isUnlocked ? 1 : 0.5,
                                        }, children: achievement.icon }), _jsx("span", { style: {
                                            fontSize: '12px',
                                            color: isUnlocked ? '#059669' : '#9ca3af',
                                            textAlign: 'center',
                                        }, children: achievement.name })] }, achievement.id));
                        }) })] }), _jsxs("div", { style: { marginTop: '24px' }, children: [_jsx("h4", { style: {
                            fontSize: '16px',
                            fontWeight: 600,
                            marginBottom: '12px',
                            color: '#1a1a1a',
                        }, children: "Next Milestones" }), _jsxs("ul", { style: {
                            margin: 0,
                            paddingLeft: '20px',
                            fontSize: '14px',
                            color: '#4a4a4a',
                        }, children: [!onboardingState.achievementsUnlocked.includes('tutorial_complete') && (_jsx("li", { style: { marginBottom: '8px' }, children: "Complete the tutorial" })), !onboardingState.achievementsUnlocked.includes('graph_master') && (_jsx("li", { style: { marginBottom: '8px' }, children: "Create your first graph" })), viewedHelpCount < helpSections.length && (_jsx("li", { style: { marginBottom: '8px' }, children: "Explore all help topics" })), unlockedCount < achievements.length && (_jsx("li", { children: "Unlock all achievements" }))] })] })] }));
};
// Mini progress widget for header
export const ProgressWidget = () => {
    const { onboardingState } = useTutorial();
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
        }, children: [_jsx("span", { style: { color: '#6b7280' }, children: "Progress:" }), _jsx("div", { style: {
                    width: '100px',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden',
                }, children: _jsx("div", { style: {
                        height: '100%',
                        width: `${onboardingState.tutorialProgress}%`,
                        backgroundColor: '#6366f1',
                        transition: 'width 0.3s ease',
                    } }) }), _jsxs("span", { style: { color: '#374151', fontWeight: 500 }, children: [Math.round(onboardingState.tutorialProgress), "%"] })] }));
};
