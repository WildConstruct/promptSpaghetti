import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection.js';
import { HierarchyField, HierarchyHeader, ComplexityIndicator, HierarchyColors, TypographyScale, SpacingScale } from '../../VisualHierarchy/HierarchyDesignSystem.js';
import { useUISettingsStore } from '../../../stores/uiSettingsStore.js';
/**
 * Epic 8.4 Task 2 - Visual Hierarchy Design Demo
 *
 * Demonstrates the complete visual hierarchy system with:
 * - Information architecture with clear priorities
 * - Visual cues for field importance
 * - Consistent section headers and groupings
 * - Progressive visual complexity indicators
 * - Full accessibility compliance
 */
export const VisualHierarchyDemoEditor = ({ nodeId, nodeType, data, onChange }) => {
    const { getNodeDisclosureLevel } = useUISettingsStore();
    const currentLevel = getNodeDisclosureLevel(nodeId, nodeType);
    return (_jsxs("div", { style: {
            padding: SpacingScale.md,
            maxHeight: '100%',
            overflowY: 'auto',
            background: HierarchyColors.neutral.background
        }, role: "form", "aria-label": `${nodeType} editor with visual hierarchy`, children: [_jsx(HierarchyHeader, { title: `${nodeType} Configuration`, level: currentLevel, priority: "critical", description: "Visual hierarchy design system demonstration", icon: "\uD83C\uDFA8", children: _jsx(ComplexityIndicator, { level: currentLevel, size: "small" }) }), _jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", fieldName: "template", defaultExpanded: true, description: "Core configuration required for basic functionality", children: [_jsx(HierarchyField, { priority: "critical", level: currentLevel, label: "Node Name", description: "Human-readable name for this node", required: true, children: _jsx("input", { type: "text", value: data.name || '', onChange: (e) => onChange({ name: e.target.value }), placeholder: "Enter node name...", style: {
                                width: '100%',
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                border: `1px solid ${HierarchyColors[currentLevel].border}`,
                                background: HierarchyColors[currentLevel].background,
                                color: HierarchyColors[currentLevel].text,
                                ...TypographyScale.tertiary
                            } }) }), _jsx(HierarchyField, { priority: "critical", level: currentLevel, label: "Template Content", description: "Main template with {variable} syntax support", required: true, children: _jsx("textarea", { value: data.template || '', onChange: (e) => onChange({ template: e.target.value }), placeholder: "Enter template with {variables}...", rows: 3, style: {
                                width: '100%',
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                border: `1px solid ${HierarchyColors[currentLevel].border}`,
                                background: HierarchyColors[currentLevel].background,
                                color: HierarchyColors[currentLevel].text,
                                resize: 'vertical',
                                ...TypographyScale.tertiary
                            } }) })] }), _jsxs(ProgressiveDisclosureSection, { title: "Advanced Options", level: "advanced", fieldName: "weights", description: "Additional configuration for power users", icon: "\u26A1", children: [_jsx(HierarchyField, { priority: "important", level: currentLevel, label: "Weight Distribution", description: "Controls probability distribution for random selection", children: _jsxs("div", { style: { display: 'flex', gap: SpacingScale.sm, alignItems: 'center' }, children: [_jsx("input", { type: "range", min: "0", max: "100", value: data.weight || 50, onChange: (e) => onChange({ weight: parseInt(e.target.value) }), style: { flex: 1 } }), _jsxs("span", { style: {
                                        ...TypographyScale.caption,
                                        color: HierarchyColors[currentLevel].text,
                                        minWidth: '3em'
                                    }, children: [data.weight || 50, "%"] })] }) }), _jsx(HierarchyField, { priority: "important", level: currentLevel, label: "Randomization Seed", description: "Seed for reproducible random generation", children: _jsx("input", { type: "number", value: data.seed || '', onChange: (e) => onChange({ seed: parseInt(e.target.value) || undefined }), placeholder: "Random seed (optional)", style: {
                                width: '100%',
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                border: `1px solid ${HierarchyColors[currentLevel].border}`,
                                background: HierarchyColors[currentLevel].background,
                                color: HierarchyColors[currentLevel].text,
                                ...TypographyScale.tertiary
                            } }) }), _jsx(HierarchyField, { priority: "standard", level: currentLevel, label: "Performance Mode", description: "Enable optimizations for large-scale generation", children: _jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: SpacingScale.sm,
                                cursor: 'pointer',
                                ...TypographyScale.tertiary,
                                color: HierarchyColors[currentLevel].text
                            }, children: [_jsx("input", { type: "checkbox", checked: data.performanceMode || false, onChange: (e) => onChange({ performanceMode: e.target.checked }), style: {
                                        accentColor: HierarchyColors[currentLevel].primary
                                    } }), "Enable performance optimizations"] }) })] }), _jsxs(ProgressiveDisclosureSection, { title: "Debug Information", level: "debug", fieldName: "internalId", description: "Technical details for debugging and development", icon: "\uD83D\uDD27", children: [_jsx(HierarchyField, { priority: "supplementary", level: currentLevel, label: "Node ID", description: "Internal unique identifier for this node", children: _jsx("input", { type: "text", value: nodeId, readOnly: true, style: {
                                width: '100%',
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                border: `1px solid ${HierarchyColors[currentLevel].border}`,
                                background: HierarchyColors[currentLevel].accent,
                                color: HierarchyColors[currentLevel].text,
                                ...TypographyScale.caption,
                                fontFamily: 'monospace',
                                opacity: 0.8
                            } }) }), _jsx(HierarchyField, { priority: "supplementary", level: currentLevel, label: "Raw Configuration", description: "Complete internal configuration object", children: _jsx("pre", { style: {
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                border: `1px solid ${HierarchyColors[currentLevel].border}`,
                                background: HierarchyColors[currentLevel].accent,
                                color: HierarchyColors[currentLevel].text,
                                ...TypographyScale.micro,
                                fontFamily: 'monospace',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                            }, children: JSON.stringify(data, null, 2) }) }), _jsx(HierarchyField, { priority: "supplementary", level: currentLevel, label: "Execution Stats", description: "Performance metrics and execution statistics", children: _jsx("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: SpacingScale.sm,
                                padding: SpacingScale.sm,
                                borderRadius: 4,
                                background: HierarchyColors[currentLevel].accent
                            }, children: [
                                { label: 'Executions', value: Math.floor(Math.random() * 1000) },
                                { label: 'Avg Time', value: `${(Math.random() * 10).toFixed(1)}ms` },
                                { label: 'Cache Hits', value: `${Math.floor(Math.random() * 100)}%` },
                                { label: 'Memory', value: `${(Math.random() * 5).toFixed(1)}MB` }
                            ].map((stat) => (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    color: HierarchyColors[currentLevel].text
                                }, children: [_jsx("div", { style: {
                                            ...TypographyScale.micro,
                                            opacity: 0.7,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: SpacingScale.xs / 2
                                        }, children: stat.label }), _jsx("div", { style: {
                                            ...TypographyScale.caption,
                                            fontWeight: 600,
                                            color: HierarchyColors[currentLevel].primary
                                        }, children: stat.value })] }, stat.label))) }) })] }), _jsxs("div", { style: {
                    marginTop: SpacingScale.xl,
                    padding: SpacingScale.md,
                    borderRadius: 6,
                    background: `${HierarchyColors[currentLevel].primary}10`,
                    border: `1px solid ${HierarchyColors[currentLevel].primary}`
                }, children: [_jsx("div", { style: {
                            ...TypographyScale.caption,
                            color: HierarchyColors[currentLevel].text,
                            fontWeight: 600,
                            marginBottom: SpacingScale.xs,
                            display: 'flex',
                            alignItems: 'center',
                            gap: SpacingScale.xs
                        }, children: "\uD83D\uDCCA Visual Hierarchy Summary" }), _jsxs("div", { style: {
                            ...TypographyScale.micro,
                            color: HierarchyColors[currentLevel].secondary,
                            lineHeight: 1.4
                        }, children: [_jsx("strong", { children: "Current Level:" }), " ", currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1), _jsx("br", {}), _jsx("strong", { children: "Critical Fields:" }), " ", currentLevel === 'basic' ? '2 visible' : 'All available', _jsx("br", {}), _jsx("strong", { children: "Advanced Features:" }), " ", currentLevel !== 'basic' ? 'Accessible' : 'Hidden', _jsx("br", {}), _jsx("strong", { children: "Debug Information:" }), " ", currentLevel === 'debug' ? 'Visible' : 'Hidden', _jsx("br", {}), _jsx("strong", { children: "Accessibility:" }), " Full ARIA support, keyboard navigation"] })] })] }));
};
export default VisualHierarchyDemoEditor;
