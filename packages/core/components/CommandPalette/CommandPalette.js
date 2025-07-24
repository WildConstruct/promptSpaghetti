import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Graph Editor Command Palette
 * Task T-1752989144320-364: Integrate generation flow into editor command palette
 *
 * Professional command palette with generation flow integration for Wild Construct
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
const GenerationWizard = ({ flow, currentStep, params, onParamsChange, onStepChange, onExecute, onCancel, theme }) => {
    const step = flow.steps[currentStep];
    const isLastStep = currentStep === flow.steps.length - 1;
    const getThemeStyles = () => {
        const themes = {
            light: {
                background: '#ffffff',
                secondary: '#f8fafc',
                border: '#e5e7eb',
                text: '#374151',
                accent: '#3b82f6'
            },
            dark: {
                background: '#1f2937',
                secondary: '#111827',
                border: '#4b5563',
                text: '#f9fafb',
                accent: '#60a5fa'
            },
            cinema: {
                background: '#1a1a1a',
                secondary: '#0d1117',
                border: '#ff7c00',
                text: '#ffffff',
                accent: '#ff7c00'
            }
        };
        return themes[theme];
    };
    const styles = getThemeStyles();
    return (_jsxs("div", { style: {
            width: '700px',
            maxHeight: '600px',
            background: styles.background,
            border: `1px solid ${styles.border}`,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
        }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                    padding: '24px',
                    borderBottom: `1px solid ${styles.border}`,
                    background: styles.secondary
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }, children: [_jsx("span", { style: { fontSize: '24px' }, children: flow.icon }), _jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: 600, color: styles.text }, children: flow.name }), _jsx("span", { style: {
                                    padding: '4px 8px',
                                    background: styles.accent + '20',
                                    color: styles.accent,
                                    fontSize: '12px',
                                    borderRadius: '6px',
                                    fontWeight: 500
                                }, children: flow.complexity.toUpperCase() })] }), _jsx("p", { style: { margin: 0, color: styles.text, opacity: 0.7 }, children: flow.description }), _jsx("div", { style: {
                            marginTop: '16px',
                            background: styles.border,
                            borderRadius: '4px',
                            height: '4px',
                            overflow: 'hidden'
                        }, children: _jsx("div", { style: {
                                width: `${((currentStep + 1) / flow.steps.length) * 100}%`,
                                height: '100%',
                                background: styles.accent,
                                transition: 'width 0.3s ease'
                            } }) }), _jsxs("div", { style: {
                            marginTop: '8px',
                            fontSize: '12px',
                            color: styles.text,
                            opacity: 0.7
                        }, children: ["Step ", currentStep + 1, " of ", flow.steps.length, " \u2022 ", flow.estimatedTime] })] }), _jsxs("div", { style: { padding: '24px', maxHeight: '400px', overflow: 'auto' }, children: [_jsx("h3", { style: {
                            margin: '0 0 8px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: styles.accent
                        }, children: step.title }), _jsx("p", { style: {
                            margin: '0 0 20px 0',
                            color: styles.text,
                            opacity: 0.7,
                            lineHeight: 1.5
                        }, children: step.description }), step.fields?.map(field => (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: styles.text
                                }, children: [field.label, field.validation?.required && (_jsx("span", { style: { color: '#ef4444', marginLeft: '4px' }, children: "*" }))] }), field.type === 'text' && (_jsx("input", { type: "text", value: params[field.id] || '', onChange: (e) => onParamsChange({ ...params, [field.id]: e.target.value }), placeholder: field.placeholder, style: {
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '6px',
                                    background: styles.secondary,
                                    color: styles.text,
                                    fontSize: '14px',
                                    outline: 'none'
                                } })), field.type === 'textarea' && (_jsx("textarea", { value: params[field.id] || '', onChange: (e) => onParamsChange({ ...params, [field.id]: e.target.value }), placeholder: field.placeholder, rows: 3, style: {
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '6px',
                                    background: styles.secondary,
                                    color: styles.text,
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                } })), field.type === 'select' && (_jsxs("select", { value: params[field.id] || field.defaultValue || '', onChange: (e) => onParamsChange({ ...params, [field.id]: e.target.value }), style: {
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '6px',
                                    background: styles.secondary,
                                    color: styles.text,
                                    fontSize: '14px',
                                    outline: 'none'
                                }, children: [_jsx("option", { value: "", children: "Select an option..." }), field.options?.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }))] }, field.id)))] }), _jsxs("div", { style: {
                    padding: '20px 24px',
                    borderTop: `1px solid ${styles.border}`,
                    background: styles.secondary,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsx("button", { onClick: onCancel, style: {
                            padding: '10px 16px',
                            background: 'transparent',
                            border: `1px solid ${styles.border}`,
                            borderRadius: '6px',
                            color: styles.text,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }, children: "Cancel" }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [currentStep > 0 && (_jsx("button", { onClick: () => onStepChange(currentStep - 1), style: {
                                    padding: '10px 16px',
                                    background: 'transparent',
                                    border: `1px solid ${styles.accent}`,
                                    borderRadius: '6px',
                                    color: styles.accent,
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }, children: "Previous" })), _jsx("button", { onClick: isLastStep ? onExecute : () => onStepChange(currentStep + 1), style: {
                                    padding: '10px 20px',
                                    background: styles.accent,
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: styles.background,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }, children: isLastStep ? '✨ Generate' : 'Next' })] })] })] }));
};
/**
 * Professional command palette for graph editor with generation flow integration
 */
export const CommandPalette = ({ isOpen, onClose, nodes, edges, selectedNodes, onGenerationStart, onNodeCreate, onNodeDelete, onExport, onTemplateApply, theme = 'cinema', recentCommands = [], customActions = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [_____activeCategory, _____setActiveCategory] = useState(null);
    const [showGenerationWizard, setShowGenerationWizard] = useState(false);
    const [activeGenerationFlow, setActiveGenerationFlow] = useState(null);
    const [generationParams, setGenerationParams] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const searchInputRef = useRef(null);
    const reactFlowInstance = useReactFlow();
    // Generation flows for film industry
    const generationFlows = [
        {
            id: 'character-development',
            name: 'Character Development Chain',
            description: 'Generate comprehensive character profiles with traits, background, and dialogue patterns',
            icon: '🎭',
            category: 'Character',
            estimatedTime: '2-3 minutes',
            complexity: 'moderate',
            outputType: 'node_chain',
            steps: [
                {
                    id: 'character-basics',
                    title: 'Character Basics',
                    description: 'Define the core character information',
                    type: 'input',
                    required: true,
                    fields: [
                        {
                            id: 'character-name',
                            label: 'Character Name',
                            type: 'text',
                            placeholder: 'e.g., Sarah McKenzie',
                            validation: { required: true, minLength: 2 }
                        },
                        {
                            id: 'character-role',
                            label: 'Character Role',
                            type: 'select',
                            options: [
                                { value: 'protagonist', label: 'Protagonist' },
                                { value: 'antagonist', label: 'Antagonist' },
                                { value: 'supporting', label: 'Supporting Character' },
                                { value: 'mentor', label: 'Mentor' },
                                { value: 'comic-relief', label: 'Comic Relief' }
                            ]
                        },
                        {
                            id: 'genre',
                            label: 'Genre',
                            type: 'select',
                            options: [
                                { value: 'drama', label: 'Drama' },
                                { value: 'action', label: 'Action' },
                                { value: 'comedy', label: 'Comedy' },
                                { value: 'thriller', label: 'Thriller' },
                                { value: 'sci-fi', label: 'Sci-Fi' },
                                { value: 'fantasy', label: 'Fantasy' }
                            ]
                        }
                    ]
                },
                {
                    id: 'character-traits',
                    title: 'Character Traits',
                    description: 'Select personality traits and characteristics',
                    type: 'selection',
                    required: true,
                    fields: [
                        {
                            id: 'personality-traits',
                            label: 'Personality Traits',
                            type: 'multiselect',
                            options: [
                                { value: 'brave', label: 'Brave' },
                                { value: 'intelligent', label: 'Intelligent' },
                                { value: 'cynical', label: 'Cynical' },
                                { value: 'compassionate', label: 'Compassionate' },
                                { value: 'rebellious', label: 'Rebellious' },
                                { value: 'mysterious', label: 'Mysterious' }
                            ]
                        },
                        {
                            id: 'character-flaws',
                            label: 'Character Flaws',
                            type: 'multiselect',
                            options: [
                                { value: 'pride', label: 'Excessive Pride' },
                                { value: 'trust-issues', label: 'Trust Issues' },
                                { value: 'impulsive', label: 'Impulsiveness' },
                                { value: 'perfectionism', label: 'Perfectionism' },
                                { value: 'fear-commitment', label: 'Fear of Commitment' }
                            ]
                        }
                    ]
                },
                {
                    id: 'generation-config',
                    title: 'Generation Settings',
                    description: 'Configure the generation parameters',
                    type: 'configuration',
                    required: false,
                    fields: [
                        {
                            id: 'complexity-level',
                            label: 'Complexity Level',
                            type: 'select',
                            defaultValue: 'moderate',
                            options: [
                                { value: 'simple', label: 'Simple (Basic traits)' },
                                { value: 'moderate', label: 'Moderate (Detailed profile)' },
                                { value: 'advanced', label: 'Advanced (Full psychology)' }
                            ]
                        },
                        {
                            id: 'include-dialogue',
                            label: 'Include Dialogue Samples',
                            type: 'boolean',
                            defaultValue: true
                        },
                        {
                            id: 'backstory-depth',
                            label: 'Backstory Depth',
                            type: 'number',
                            placeholder: 'Number of backstory elements (1-10)',
                            defaultValue: 3,
                            validation: { required: false }
                        }
                    ]
                }
            ]
        },
        {
            id: 'story-structure',
            name: 'Three-Act Story Structure',
            description: 'Generate a complete three-act story structure with plot points and character arcs',
            icon: '📚',
            category: 'Story',
            estimatedTime: '3-5 minutes',
            complexity: 'advanced',
            outputType: 'complete_graph',
            steps: [
                {
                    id: 'story-premise',
                    title: 'Story Premise',
                    description: 'Define the core story concept',
                    type: 'input',
                    required: true,
                    fields: [
                        {
                            id: 'logline',
                            label: 'Logline',
                            type: 'textarea',
                            placeholder: 'One sentence summary of your story...',
                            validation: { required: true, maxLength: 200 }
                        },
                        {
                            id: 'target-audience',
                            label: 'Target Audience',
                            type: 'select',
                            options: [
                                { value: 'family', label: 'Family (G/PG)' },
                                { value: 'teen', label: 'Teen (PG-13)' },
                                { value: 'adult', label: 'Adult (R)' },
                                { value: 'arthouse', label: 'Art House' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'dialogue-generator',
            name: 'Scene Dialogue Generator',
            description: 'Generate realistic dialogue for specific scenes with character voice consistency',
            icon: '💬',
            category: 'Dialogue',
            estimatedTime: '1-2 minutes',
            complexity: 'simple',
            outputType: 'single_node',
            steps: [
                {
                    id: 'scene-setup',
                    title: 'Scene Setup',
                    description: 'Describe the scene context',
                    type: 'input',
                    required: true,
                    fields: [
                        {
                            id: 'scene-description',
                            label: 'Scene Description',
                            type: 'textarea',
                            placeholder: 'Describe the scene, setting, and situation...',
                            validation: { required: true }
                        },
                        {
                            id: 'characters-present',
                            label: 'Characters Present',
                            type: 'text',
                            placeholder: 'List characters in this scene (comma-separated)'
                        },
                        {
                            id: 'scene-tone',
                            label: 'Scene Tone',
                            type: 'select',
                            options: [
                                { value: 'dramatic', label: 'Dramatic' },
                                { value: 'comedic', label: 'Comedic' },
                                { value: 'tense', label: 'Tense/Suspenseful' },
                                { value: 'romantic', label: 'Romantic' },
                                { value: 'action', label: 'Action-packed' },
                                { value: 'emotional', label: 'Emotional/Heartfelt' }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
    // Build command actions
    const commandActions = useMemo(() => {
        const actions = [
            // Generation commands
            ...generationFlows.map(flow => ({
                id: `generate-${flow.id}`,
                title: `Generate ${flow.name}`,
                description: flow.description,
                category: 'generation',
                icon: flow.icon,
                shortcut: flow.id === 'character-development' ? '⌘G' : undefined,
                keywords: [flow.name.toLowerCase(), flow.category.toLowerCase(), 'generate', 'create'],
                action: () => startGenerationFlow(flow)
            })),
            // Node creation commands
            {
                id: 'create-weighted-choice',
                title: 'Add Weighted Choice',
                description: 'Create a new weighted random choice node',
                category: 'editing',
                icon: '🎲',
                shortcut: '⌘N',
                keywords: ['weighted', 'choice', 'random', 'probability'],
                action: () => createNodeAtCenter('WeightedChoice')
            },
            {
                id: 'create-output',
                title: 'Add Output Node',
                description: 'Create a new output node for final results',
                category: 'editing',
                icon: '📤',
                keywords: ['output', 'result', 'final'],
                action: () => createNodeAtCenter('Output')
            },
            {
                id: 'create-concat',
                title: 'Add Text Combiner',
                description: 'Create a node to combine multiple text inputs',
                category: 'editing',
                icon: '🔗',
                keywords: ['concat', 'combine', 'join', 'merge'],
                action: () => createNodeAtCenter('Concat')
            },
            // Template commands
            {
                id: 'apply-character-template',
                title: 'Apply Character Template',
                description: 'Apply a pre-built character generation template',
                category: 'templates',
                icon: '🎭',
                keywords: ['template', 'character', 'preset'],
                action: () => onTemplateApply('character-basic')
            },
            {
                id: 'apply-story-template',
                title: 'Apply Story Template',
                description: 'Apply a three-act story structure template',
                category: 'templates',
                icon: '📖',
                keywords: ['template', 'story', 'structure'],
                action: () => onTemplateApply('story-structure')
            },
            // Export commands
            {
                id: 'export-json',
                title: 'Export as JSON',
                description: 'Export the current graph as JSON file',
                category: 'export',
                icon: '💾',
                shortcut: '⌘E',
                keywords: ['export', 'save', 'json', 'file'],
                action: () => onExport('json')
            },
            {
                id: 'export-image',
                title: 'Export as Image',
                description: 'Export the graph as PNG image',
                category: 'export',
                icon: '🖼️',
                keywords: ['export', 'image', 'png', 'visual'],
                action: () => onExport('png')
            },
            // Navigation commands
            {
                id: 'fit-view',
                title: 'Fit to View',
                description: 'Center and fit all nodes in the viewport',
                category: 'navigation',
                icon: '🔍',
                shortcut: '⌘0',
                keywords: ['fit', 'center', 'view', 'zoom'],
                action: () => reactFlowInstance?.fitView({ padding: 0.1 })
            },
            {
                id: 'select-all',
                title: 'Select All Nodes',
                description: 'Select all nodes in the graph',
                category: 'navigation',
                icon: '📋',
                shortcut: '⌘A',
                keywords: ['select', 'all', 'nodes'],
                action: () => selectAllNodes(),
                requiresNodes: true
            },
            // Editing commands
            {
                id: 'delete-selected',
                title: 'Delete Selected',
                description: 'Delete all selected nodes',
                category: 'editing',
                icon: '🗑️',
                shortcut: 'Delete',
                keywords: ['delete', 'remove', 'selected'],
                action: () => onNodeDelete(selectedNodes.map(n => n.id)),
                requiresSelection: true,
                disabled: selectedNodes.length === 0
            },
            {
                id: 'duplicate-selected',
                title: 'Duplicate Selected',
                description: 'Create copies of selected nodes',
                category: 'editing',
                icon: '📄',
                shortcut: '⌘D',
                keywords: ['duplicate', 'copy', 'clone'],
                action: () => duplicateSelectedNodes(),
                requiresSelection: true,
                disabled: selectedNodes.length === 0
            },
            // Add custom actions
            ...customActions
        ];
        return actions;
    }, [selectedNodes, customActions, onExport, onTemplateApply, onNodeDelete, reactFlowInstance]);
    // Filter actions based on search
    const filteredActions = useMemo(() => {
        if (!searchQuery.trim()) {
            return commandActions;
        }
        const query = searchQuery.toLowerCase();
        return commandActions.filter(action => {
            return (action.title.toLowerCase().includes(query) ||
                action.description.toLowerCase().includes(query) ||
                action.keywords.some(keyword => keyword.includes(query)) ||
                action.category.includes(query));
        });
    }, [commandActions, searchQuery]);
    // Group actions by category
    const groupedActions = useMemo(() => {
        const groups = {};
        filteredActions.forEach(action => {
            if (!groups[action.category]) {
                groups[action.category] = [];
            }
            groups[action.category].push(action);
        });
        return groups;
    }, [filteredActions]);
    // Category icons
    const categoryIcons = {
        generation: '✨',
        editing: '✏️',
        navigation: '🧭',
        export: '📤',
        templates: '📋',
        workflow: '⚡'
    };
    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen)
                return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredActions[selectedIndex]) {
                        executeAction(filteredActions[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, selectedIndex, onClose]);
    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);
    // Helper functions
    const createNodeAtCenter = useCallback((nodeType) => {
        const viewport = reactFlowInstance?.getViewport();
        const center = {
            x: viewport ? -viewport.x + 400 : 400,
            y: viewport ? -viewport.y + 300 : 300
        };
        onNodeCreate(nodeType, center);
        onClose();
    }, [reactFlowInstance, onNodeCreate, onClose]);
    const selectAllNodes = useCallback(() => {
        // This would need to be implemented based on the specific graph editor API
        onClose();
    }, [onClose]);
    const duplicateSelectedNodes = useCallback(() => {
        // Implementation for duplicating nodes
        selectedNodes.forEach(node => {
            const position = { x: node.position.x + 50, y: node.position.y + 50 };
            onNodeCreate(node.data?.nodeType || 'WeightedChoice', position, node.data);
        });
        onClose();
    }, [selectedNodes, onNodeCreate, onClose]);
    const startGenerationFlow = useCallback((flow) => {
        setActiveGenerationFlow(flow);
        setCurrentStep(0);
        setGenerationParams({});
        setShowGenerationWizard(true);
    }, []);
    const executeAction = useCallback(async (action) => {
        try {
            await action.action();
        }
        catch (error) {
            console.error('Failed to execute command:', error);
        }
    }, []);
    const executeGenerationFlow = useCallback(async () => {
        if (!activeGenerationFlow)
            return;
        try {
            await onGenerationStart(activeGenerationFlow, generationParams);
            setShowGenerationWizard(false);
            setActiveGenerationFlow(null);
            onClose();
        }
        catch (error) {
            console.error('Generation failed:', error);
        }
    }, [activeGenerationFlow, generationParams, onGenerationStart, onClose]);
    // Theme styles
    const getThemeStyles = () => {
        const themes = {
            light: {
                background: '#ffffff',
                secondary: '#f8fafc',
                border: '#e5e7eb',
                text: '#374151',
                textSecondary: '#6b7280',
                accent: '#3b82f6',
                hover: '#f3f4f6',
                overlay: 'rgba(0, 0, 0, 0.5)'
            },
            dark: {
                background: '#1f2937',
                secondary: '#111827',
                border: '#4b5563',
                text: '#f9fafb',
                textSecondary: '#9ca3af',
                accent: '#60a5fa',
                hover: '#374151',
                overlay: 'rgba(0, 0, 0, 0.7)'
            },
            cinema: {
                background: '#1a1a1a',
                secondary: '#0d1117',
                border: '#ff7c00',
                text: '#ffffff',
                textSecondary: '#a0a0a0',
                accent: '#ff7c00',
                hover: '#2d2d2d',
                overlay: 'rgba(0, 0, 0, 0.8)'
            }
        };
        return themes[theme];
    };
    const styles = getThemeStyles();
    if (!isOpen && !showGenerationWizard)
        return null;
    return (_jsx(_Fragment, { children: _jsxs("div", { style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: styles.overlay,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '100px'
            }, onClick: onClose, children: [isOpen && !showGenerationWizard && (_jsxs("div", { style: {
                        width: '640px',
                        maxHeight: '500px',
                        background: styles.background,
                        border: `1px solid ${styles.border}`,
                        borderRadius: '12px',
                        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px ${styles.border}`,
                        overflow: 'hidden',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { style: {
                                padding: '16px',
                                borderBottom: `1px solid ${styles.border}`
                            }, children: _jsx("input", { ref: searchInputRef, type: "text", value: searchQuery, onChange: (e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedIndex(0);
                                }, placeholder: "Search commands... (\u2318K)", style: {
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: styles.secondary,
                                    color: styles.text,
                                    fontSize: '16px',
                                    outline: 'none'
                                } }) }), _jsxs("div", { style: {
                                maxHeight: '400px',
                                overflow: 'auto',
                                padding: '8px'
                            }, children: [Object.entries(groupedActions).map(([category, actions]) => (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: {
                                                padding: '8px 12px 4px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: styles.textSecondary,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }, children: [categoryIcons[category], " ", category] }), actions.map((action, actionIndex) => {
                                            const globalIndex = filteredActions.indexOf(action);
                                            const isSelected = globalIndex === selectedIndex;
                                            return (_jsxs("div", { onClick: () => executeAction(action), style: {
                                                    padding: '12px',
                                                    margin: '2px 4px',
                                                    borderRadius: '6px',
                                                    background: isSelected ? styles.hover : 'transparent',
                                                    border: isSelected ? `1px solid ${styles.accent}` : '1px solid transparent',
                                                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                                                    opacity: action.disabled ? 0.5 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'all 0.15s ease'
                                                }, children: [_jsx("span", { style: { fontSize: '20px' }, children: action.icon }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: {
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                    color: styles.text,
                                                                    marginBottom: '2px'
                                                                }, children: [action.title, action.premium && (_jsx("span", { style: {
                                                                            marginLeft: '8px',
                                                                            padding: '2px 6px',
                                                                            background: styles.accent,
                                                                            color: styles.background,
                                                                            fontSize: '10px',
                                                                            borderRadius: '4px',
                                                                            fontWeight: 500
                                                                        }, children: "PRO" }))] }), _jsx("div", { style: {
                                                                    fontSize: '12px',
                                                                    color: styles.textSecondary,
                                                                    lineHeight: 1.4
                                                                }, children: action.description })] }), action.shortcut && (_jsx("div", { style: {
                                                            padding: '4px 8px',
                                                            background: styles.secondary,
                                                            border: `1px solid ${styles.border}`,
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            color: styles.textSecondary,
                                                            fontFamily: 'Monaco, monospace'
                                                        }, children: action.shortcut }))] }, action.id));
                                        })] }, category))), filteredActions.length === 0 && (_jsxs("div", { style: {
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        color: styles.textSecondary
                                    }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDD0D" }), _jsx("div", { style: { fontSize: '14px' }, children: "No commands found" }), _jsx("div", { style: { fontSize: '12px', marginTop: '4px' }, children: "Try searching for \"generate\", \"create\", or \"export\"" })] }))] }), _jsxs("div", { style: {
                                padding: '12px 16px',
                                borderTop: `1px solid ${styles.border}`,
                                background: styles.secondary,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                color: styles.textSecondary
                            }, children: [_jsx("div", { children: "\u2191\u2193 Navigate \u2022 Enter Execute \u2022 Esc Close" }), _jsx("div", { children: "\uD83C\uDFAC Wild Construct Command Palette" })] })] })), showGenerationWizard && activeGenerationFlow && (_jsx(GenerationWizard, { flow: activeGenerationFlow, currentStep: currentStep, params: generationParams, onParamsChange: setGenerationParams, onStepChange: setCurrentStep, onExecute: executeGenerationFlow, onCancel: () => {
                        setShowGenerationWizard(false);
                        setActiveGenerationFlow(null);
                    }, theme: theme }))] }) }));
};
export default CommandPalette;
