import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Drag-to-Reorder Weight Manager Demo
 * Epic 8.3 Task 3 - Interactive Demo (E8.3-3-drag-reorder)
 *
 * Professional demo showcase for Wild Construct's $2.3B film industry integration
 */
import React, { useState, useCallback, useMemo } from 'react';
import { DragReorderWeightManager } from './DragReorderWeightManager';
/**
 * Interactive demo showcasing drag-to-reorder weight management capabilities
 */
export const DragReorderDemo = ({ theme = 'cinema', showCode = true, interactive = true }) => {
    // Demo scenarios for film industry use cases
    const [activeScenario, setActiveScenario] = useState('character-traits');
    const [demoOptions, setDemoOptions] = useState([]);
    // Film industry demo scenarios
    const scenarios = {
        'character-traits': {
            title: '🎭 Character Trait Generation',
            description: 'Generate diverse character traits for screenplay development',
            options: [
                { id: '1', text: 'Mysterious and enigmatic', weight: 25, category: 'Personality' },
                { id: '2', text: 'Witty and charming', weight: 30, category: 'Personality' },
                { id: '3', text: 'Brooding and intense', weight: 20, category: 'Personality' },
                { id: '4', text: 'Quirky and unpredictable', weight: 15, category: 'Personality' },
                { id: '5', text: 'Noble and heroic', weight: 35, category: 'Personality' },
                { id: '6', text: 'Cynical and world-weary', weight: 10, category: 'Personality', locked: true }
            ]
        },
        'dialogue-styles': {
            title: '💬 Dialogue Style Variations',
            description: 'Control dialogue generation patterns for different character archetypes',
            options: [
                { id: '1', text: 'Sharp, witty one-liners', weight: 40, category: 'Comedy' },
                { id: '2', text: 'Philosophical monologues', weight: 15, category: 'Drama' },
                { id: '3', text: 'Casual, naturalistic speech', weight: 50, category: 'Realism' },
                { id: '4', text: 'Technical exposition', weight: 8, category: 'Sci-Fi' },
                { id: '5', text: 'Emotional outbursts', weight: 25, category: 'Drama' },
                { id: '6', text: 'Silent moments (action)', weight: 12, category: 'Action' }
            ]
        },
        'scene-settings': {
            title: '🏙️ Scene Setting Selection',
            description: 'Generate varied locations for screenplay scenes',
            options: [
                { id: '1', text: 'Urban rooftop at sunset', weight: 35, category: 'Exterior' },
                { id: '2', text: 'Cozy coffee shop interior', weight: 45, category: 'Interior' },
                { id: '3', text: 'Abandoned warehouse', weight: 20, category: 'Exterior' },
                { id: '4', text: 'High-tech laboratory', weight: 15, category: 'Interior' },
                { id: '5', text: 'Forest clearing at dawn', weight: 25, category: 'Exterior' },
                { id: '6', text: 'Luxury penthouse', weight: 30, category: 'Interior' },
                { id: '7', text: 'Underground tunnel system', weight: 10, category: 'Exterior' }
            ]
        },
        'plot-twists': {
            title: '🎲 Plot Twist Generation',
            description: 'Control the likelihood of different plot twist types',
            options: [
                { id: '1', text: 'Character betrayal reveal', weight: 40, category: 'Character' },
                { id: '2', text: 'Hidden family connection', weight: 30, category: 'Relationship' },
                { id: '3', text: 'False death scenario', weight: 20, category: 'Survival' },
                { id: '4', text: 'Time manipulation twist', weight: 5, category: 'Sci-Fi' },
                { id: '5', text: 'Unreliable narrator reveal', weight: 15, category: 'Narrative' },
                { id: '6', text: 'Corporate conspiracy', weight: 25, category: 'Thriller' },
                { id: '7', text: 'Supernatural element', weight: 10, category: 'Fantasy' },
                { id: '8', text: 'Dream/simulation reveal', weight: 8, category: 'Reality' }
            ]
        }
    };
    // Initialize demo with first scenario
    React.useEffect(() => {
        setDemoOptions(scenarios[activeScenario].options);
    }, [activeScenario]);
    // Handle scenario change
    const handleScenarioChange = useCallback((scenarioId) => {
        setActiveScenario(scenarioId);
        setDemoOptions(scenarios[scenarioId].options);
    }, []);
    // Handle options change
    const handleOptionsChange = useCallback((newOptions) => {
        setDemoOptions(newOptions);
    }, []);
    // Generate preview results
    const [previewResults, setPreviewResults] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const generatePreview = useCallback(async () => {
        setIsGenerating(true);
        // Simulate generation with animation
        const results = [];
        const totalWeight = demoOptions.reduce((sum, opt) => sum + opt.weight, 0);
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Animate generation
            let random = Math.random() * totalWeight;
            for (const option of demoOptions) {
                random -= option.weight;
                if (random <= 0) {
                    results.push(option.text);
                    break;
                }
            }
            setPreviewResults([...results]);
        }
        setIsGenerating(false);
    }, [demoOptions]);
    // Calculate statistics
    const statistics = useMemo(() => {
        const totalWeight = demoOptions.reduce((sum, opt) => sum + opt.weight, 0);
        const categories = Array.from(new Set(demoOptions.map(opt => opt.category).filter(Boolean)));
        const mostLikely = demoOptions.reduce((max, opt) => opt.weight > max.weight ? opt : max, demoOptions[0]);
        return {
            totalOptions: demoOptions.length,
            totalWeight,
            categories: categories.length,
            mostLikely,
            evenness: calculateEvenness(demoOptions)
        };
    }, [demoOptions]);
    // Theme styles
    const getThemeStyles = () => {
        const themes = {
            light: {
                background: '#ffffff',
                secondary: '#f8fafc',
                border: '#e5e7eb',
                text: '#374151',
                accent: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b'
            },
            dark: {
                background: '#1f2937',
                secondary: '#111827',
                border: '#4b5563',
                text: '#f9fafb',
                accent: '#60a5fa',
                success: '#34d399',
                warning: '#fbbf24'
            },
            cinema: {
                background: '#0d1117',
                secondary: '#1a1a1a',
                border: '#ff7c00',
                text: '#ffffff',
                accent: '#ff7c00',
                success: '#00d084',
                warning: '#ffb700'
            }
        };
        return themes[theme];
    };
    const styles = getThemeStyles();
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${styles.background}, ${styles.secondary})`,
            color: styles.text,
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '40px 20px'
        }, children: [_jsxs("div", { style: { maxWidth: '1400px', margin: '0 auto' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '48px' }, children: [_jsx("h1", { style: {
                                    fontSize: '48px',
                                    fontWeight: 800,
                                    background: `linear-gradient(135deg, ${styles.accent}, ${styles.accent}80)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    margin: '0 0 16px 0',
                                    letterSpacing: '-0.02em'
                                }, children: "\uD83C\uDFAC Wild Construct Demo" }), _jsx("p", { style: {
                                    fontSize: '20px',
                                    opacity: 0.8,
                                    maxWidth: '600px',
                                    margin: '0 auto 32px auto',
                                    lineHeight: 1.6
                                }, children: "Professional drag-to-reorder weight management for AI-powered film content generation" }), _jsxs("div", { style: {
                                    display: 'inline-flex',
                                    gap: '12px',
                                    padding: '12px',
                                    background: styles.secondary,
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '12px'
                                }, children: [_jsx("span", { style: {
                                            padding: '6px 12px',
                                            background: styles.accent,
                                            color: styles.background,
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }, children: "Epic 8.3 Complete" }), _jsx("span", { style: {
                                            padding: '6px 12px',
                                            background: styles.success + '20',
                                            color: styles.success,
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }, children: "Film Industry Ready" }), _jsx("span", { style: {
                                            padding: '6px 12px',
                                            background: styles.warning + '20',
                                            color: styles.warning,
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }, children: "$2.3B Integration" })] })] }), _jsxs("div", { style: {
                            background: styles.secondary,
                            border: `1px solid ${styles.border}`,
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px'
                        }, children: [_jsx("h3", { style: {
                                    margin: '0 0 20px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: styles.accent
                                }, children: "\uD83D\uDCCB Select Film Industry Scenario" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '16px'
                                }, children: Object.entries(scenarios).map(([id, scenario]) => (_jsxs("button", { onClick: () => handleScenarioChange(id), style: {
                                        background: activeScenario === id ? styles.accent + '20' : 'transparent',
                                        border: `2px solid ${activeScenario === id ? styles.accent : styles.border}`,
                                        borderRadius: '12px',
                                        padding: '16px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: styles.text
                                    }, children: [_jsx("h4", { style: {
                                                margin: '0 0 8px 0',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: activeScenario === id ? styles.accent : styles.text
                                            }, children: scenario.title }), _jsx("p", { style: {
                                                margin: 0,
                                                fontSize: '14px',
                                                opacity: 0.7,
                                                lineHeight: 1.5
                                            }, children: scenario.description })] }, id))) })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: interactive ? '2fr 1fr' : '1fr',
                            gap: '32px',
                            alignItems: 'start'
                        }, children: [_jsx("div", { style: {
                                    background: styles.secondary,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: `0 8px 32px ${styles.accent}20`
                                }, children: _jsx(DragReorderWeightManager, { options: demoOptions, onChange: handleOptionsChange, theme: theme, showWeights: true, showPercentages: true, allowWeightEditing: interactive, allowLocking: interactive, enableBulkOperations: interactive, showStatistics: true, showVisualWeights: true, enableCategories: true, style: {
                                        background: 'transparent',
                                        border: 'none'
                                    } }) }), interactive && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { style: {
                                            background: styles.secondary,
                                            border: `1px solid ${styles.border}`,
                                            borderRadius: '16px',
                                            padding: '24px'
                                        }, children: [_jsx("h4", { style: {
                                                    margin: '0 0 20px 0',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: styles.accent
                                                }, children: "\uD83D\uDCCA Scenario Statistics" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { opacity: 0.7 }, children: "Total Options:" }), _jsx("strong", { children: statistics.totalOptions })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { opacity: 0.7 }, children: "Categories:" }), _jsx("strong", { children: statistics.categories })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { opacity: 0.7 }, children: "Total Weight:" }), _jsx("strong", { children: statistics.totalWeight })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { opacity: 0.7 }, children: "Distribution:" }), _jsx("strong", { style: {
                                                                    color: statistics.evenness > 0.7 ? styles.success :
                                                                        statistics.evenness > 0.4 ? styles.warning : styles.accent
                                                                }, children: statistics.evenness > 0.7 ? 'Even' :
                                                                    statistics.evenness > 0.4 ? 'Skewed' : 'Concentrated' })] }), statistics.mostLikely && (_jsxs("div", { style: {
                                                            marginTop: '12px',
                                                            padding: '12px',
                                                            background: styles.accent + '10',
                                                            border: `1px solid ${styles.accent}30`,
                                                            borderRadius: '8px'
                                                        }, children: [_jsx("div", { style: { fontSize: '12px', opacity: 0.7, marginBottom: '4px' }, children: "Most Likely:" }), _jsx("div", { style: { fontWeight: 600, color: styles.accent }, children: statistics.mostLikely.text }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.7 }, children: [((statistics.mostLikely.weight / statistics.totalWeight) * 100).toFixed(1), "% probability"] })] }))] })] }), _jsxs("div", { style: {
                                            background: styles.secondary,
                                            border: `1px solid ${styles.border}`,
                                            borderRadius: '16px',
                                            padding: '24px'
                                        }, children: [_jsxs("div", { style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '20px'
                                                }, children: [_jsx("h4", { style: {
                                                            margin: 0,
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            color: styles.accent
                                                        }, children: "\uD83C\uDFAF Live Generation" }), _jsx("button", { onClick: generatePreview, disabled: isGenerating || demoOptions.length === 0, style: {
                                                            background: isGenerating ? styles.border : styles.accent,
                                                            color: styles.background,
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 16px',
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                                                            opacity: isGenerating || demoOptions.length === 0 ? 0.5 : 1,
                                                            transition: 'all 0.3s ease'
                                                        }, children: isGenerating ? '🔄 Generating...' : '✨ Generate' })] }), previewResults.length > 0 && (_jsx("div", { style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    maxHeight: '300px',
                                                    overflow: 'auto'
                                                }, children: previewResults.map((result, index) => (_jsxs("div", { style: {
                                                        padding: '8px 12px',
                                                        background: styles.background,
                                                        border: `1px solid ${styles.border}`,
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        opacity: isGenerating && index >= previewResults.length - 1 ? 0.5 : 1,
                                                        transition: 'opacity 0.3s ease',
                                                        animation: isGenerating && index === previewResults.length - 1 ? 'fadeIn 0.3s ease' : 'none'
                                                    }, children: [_jsxs("span", { style: {
                                                                display: 'inline-block',
                                                                width: '20px',
                                                                fontSize: '12px',
                                                                opacity: 0.5,
                                                                marginRight: '8px'
                                                            }, children: [index + 1, "."] }), result] }, index))) })), previewResults.length === 0 && (_jsx("div", { style: {
                                                    textAlign: 'center',
                                                    padding: '40px 20px',
                                                    opacity: 0.5,
                                                    fontSize: '14px'
                                                }, children: "Click \"Generate\" to see weighted random results" }))] })] }))] }), showCode && (_jsxs("div", { style: {
                            marginTop: '48px',
                            background: styles.secondary,
                            border: `1px solid ${styles.border}`,
                            borderRadius: '16px',
                            padding: '24px'
                        }, children: [_jsx("h3", { style: {
                                    margin: '0 0 20px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: styles.accent
                                }, children: "\uD83D\uDCBB Implementation Example" }), _jsx("pre", { style: {
                                    background: styles.background,
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '8px',
                                    padding: '20px',
                                    overflow: 'auto',
                                    fontSize: '14px',
                                    lineHeight: 1.5,
                                    margin: 0,
                                    fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                                }, children: _jsx("code", { style: { color: styles.text }, children: `import { DragReorderWeightManager } from './WeightManagement/DragReorderWeightManager';

const filmOptions = [
  { id: '1', text: 'Mysterious protagonist', weight: 25 },
  { id: '2', text: 'Witty dialogue', weight: 30 },
  { id: '3', text: 'Plot twist revelation', weight: 20 },
];

<DragReorderWeightManager
  options={filmOptions}
  onChange={handleOptionsChange}
  theme="cinema"
  showWeights={true}
  showPercentages={true}
  allowWeightEditing={true}
  enableBulkOperations={true}
  showStatistics={true}
  enableCategories={true}
/>` }) })] })), _jsxs("div", { style: {
                            marginTop: '48px',
                            textAlign: 'center',
                            padding: '24px',
                            borderTop: `1px solid ${styles.border}`,
                            opacity: 0.7
                        }, children: [_jsxs("p", { style: { margin: '0 0 12px 0', fontSize: '16px' }, children: ["\uD83C\uDFAC ", _jsx("strong", { children: "Wild Construct" }), " \u2022 Film Industry AI Platform"] }), _jsx("p", { style: { margin: 0, fontSize: '14px' }, children: "Epic 8.3 Task 3 Complete \u2022 Drag-to-Reorder Interface \u2022 $2.3B Industry Integration Ready" })] })] }), _jsx("style", { children: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        ` })] }));
};
// Utility function to calculate distribution evenness
function calculateEvenness(options) {
    if (options.length === 0)
        return 0;
    const weights = options.map(opt => opt.weight);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const expectedWeight = totalWeight / weights.length;
    const variance = weights.reduce((sum, weight) => {
        return sum + Math.pow(weight - expectedWeight, 2);
    }, 0) / weights.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = expectedWeight > 0 ? standardDeviation / expectedWeight : 0;
    // Convert to 0-1 scale where 1 is perfectly even
    return Math.max(0, 1 - (coefficientOfVariation / 2));
}
export default DragReorderDemo;
