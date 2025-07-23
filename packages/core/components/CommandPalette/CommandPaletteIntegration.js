import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Command Palette Integration
 * Task T-1752989144320-364: Complete integration with GraphEditor
 *
 * Seamless integration of command palette with the main graph editor
 */
import { useState, useCallback } from 'react';
import { useReactFlow, useNodes, useEdges } from 'reactflow';
import { CommandPalette } from './CommandPalette';
import { useCommandPaletteShortcuts } from '../hooks/useKeyboardShortcuts';
import { useGraphStore } from '../graphStore';
/**
 * Command palette integration component for the graph editor
 */
export const CommandPaletteIntegration = ({ theme = 'cinema', onNodeCreate, onNodesDelete, onExport, onTemplateApply, onSave, selectedNodes = [], customActions = [], disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [recentCommands, setRecentCommands] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const reactFlowInstance = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();
    const { addNode, updateNode } = useGraphStore();
    // Command palette handlers
    const handleOpen = useCallback(() => {
        if (disabled)
            return;
        setIsOpen(true);
    }, [disabled]);
    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);
    // Set up keyboard shortcuts
    useCommandPaletteShortcuts(handleOpen, handleClose, isOpen);
    // Generation flow handler
    const handleGenerationStart = useCallback(async (flow, params) => {
        setIsGenerating(true);
        try {
            // Add to recent commands
            setRecentCommands(prev => {
                const updated = [flow.id, ...prev.filter(id => id !== flow.id)].slice(0, 5);
                return updated;
            });
            // Generate content based on the flow
            await executeGenerationFlow(flow, params);
        }
        catch (error) {
            console.error('Generation failed:', error);
            // Could show error notification here
        }
        finally {
            setIsGenerating(false);
        }
    }, []);
    // Execute generation flow
    const executeGenerationFlow = async (flow, params) => {
        const viewport = reactFlowInstance.getViewport();
        const centerX = -viewport.x + 400;
        const centerY = -viewport.y + 300;
        switch (flow.id) {
            case 'character-development':
                await generateCharacterDevelopmentChain(params, { x: centerX, y: centerY });
                break;
            case 'story-structure':
                await generateStoryStructure(params, { x: centerX, y: centerY });
                break;
            case 'dialogue-generator':
                await generateDialogueNode(params, { x: centerX, y: centerY });
                break;
            default:
                console.warn('Unknown generation flow:', flow.id);
        }
    };
    // Character development chain generation
    const generateCharacterDevelopmentChain = async (params, startPosition) => {
        const { 'character-name': name, 'character-role': role, 'genre': genre, 'personality-traits': traits = [], 'character-flaws': flaws = [], 'complexity-level': complexity = 'moderate', 'include-dialogue': includeDialogue = true } = params;
        const spacing = 200;
        const currentPosition = { ...startPosition };
        // 1. Character Name Generator
        const nameNode = createCharacterNode('Character Name', {
            choices: [
                { text: name || 'Main Character', weight: 100 }
            ]
        }, currentPosition);
        addNode(nameNode);
        currentPosition.x += spacing;
        // 2. Personality Traits
        if (traits.length > 0) {
            const traitsNode = createCharacterNode('Personality Traits', {
                choices: traits.map((trait, index) => ({
                    text: `${name} is ${trait.toLowerCase()}`,
                    weight: 100 - (index * 10) // Decreasing weights
                }))
            }, currentPosition);
            addNode(traitsNode);
            currentPosition.x += spacing;
        }
        // 3. Character Flaws
        if (flaws.length > 0) {
            const flawsNode = createCharacterNode('Character Flaws', {
                choices: flaws.map((flaw, index) => ({
                    text: `Struggles with ${flaw.replace('-', ' ').toLowerCase()}`,
                    weight: 80 - (index * 10)
                }))
            }, currentPosition);
            addNode(flawsNode);
            currentPosition.y += 100;
            currentPosition.x = startPosition.x;
        }
        // 4. Background Generator (if moderate or advanced complexity)
        if (complexity !== 'simple') {
            const backgroundChoices = generateBackgroundChoices(role, genre);
            const backgroundNode = createCharacterNode('Background', {
                choices: backgroundChoices
            }, currentPosition);
            addNode(backgroundNode);
            currentPosition.x += spacing;
        }
        // 5. Dialogue Patterns (if enabled and advanced complexity)
        if (includeDialogue && complexity === 'advanced') {
            const dialogueChoices = generateDialogueChoices(genre, traits);
            const dialogueNode = createCharacterNode('Dialogue Style', {
                choices: dialogueChoices
            }, currentPosition);
            addNode(dialogueNode);
            currentPosition.x += spacing;
        }
        // 6. Final Output Node
        const outputNode = createOutputNode('Character Profile', currentPosition);
        addNode(outputNode);
        // Center the view on the generated content
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.1 });
        }, 100);
    };
    // Story structure generation
    const generateStoryStructure = async (params, startPosition) => {
        const { logline, 'target-audience': audience } = params;
        const acts = [
            { title: 'Act I - Setup', elements: ['Inciting Incident', 'Character Introduction', 'World Building'] },
            { title: 'Act II - Confrontation', elements: ['Rising Action', 'Midpoint', 'Plot Complications'] },
            { title: 'Act III - Resolution', elements: ['Climax', 'Falling Action', 'Resolution'] }
        ];
        const currentPosition = { ...startPosition };
        const spacing = 250;
        for (const act of acts) {
            const actNode = createCharacterNode(act.title, {
                choices: act.elements.map((element, index) => ({
                    text: element,
                    weight: 100 - (index * 5)
                }))
            }, currentPosition);
            addNode(actNode);
            currentPosition.y += spacing;
        }
        // Add logline as output
        if (logline) {
            const loglineNode = createOutputNode(`Logline: ${logline}`, {
                x: startPosition.x + spacing,
                y: startPosition.y
            });
            addNode(loglineNode);
        }
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.1 });
        }, 100);
    };
    // Dialogue generator
    const generateDialogueNode = async (params, startPosition) => {
        const { 'scene-description': description, 'characters-present': characters, 'scene-tone': tone } = params;
        const dialogueStyles = generateDialogueStylesForTone(tone);
        const dialogueNode = createCharacterNode(`${tone} Dialogue`, {
            choices: dialogueStyles.map((style, index) => ({
                text: style,
                weight: 100 - (index * 10)
            }))
        }, startPosition);
        addNode(dialogueNode);
        if (description) {
            const contextNode = createCharacterNode('Scene Context', {
                choices: [{ text: description, weight: 100 }]
            }, { x: startPosition.x, y: startPosition.y - 150 });
            addNode(contextNode);
        }
        const outputNode = createOutputNode('Generated Dialogue', {
            x: startPosition.x + 200,
            y: startPosition.y
        });
        addNode(outputNode);
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.1 });
        }, 100);
    };
    // Helper functions for node creation
    const createCharacterNode = (title, data, position) => ({
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'default',
        position,
        data: {
            nodeType: 'WeightedChoice',
            title: title,
            ...data
        }
    });
    const createOutputNode = (title, position) => ({
        id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'default',
        position,
        data: {
            nodeType: 'Output',
            title: title
        }
    });
    // Content generation helpers
    const generateBackgroundChoices = (role, genre) => {
        const backgrounds = {
            protagonist: {
                drama: ['Troubled childhood in small town', 'Former military service', 'Academic background'],
                action: ['Special forces training', 'Law enforcement background', 'Martial arts expertise'],
                comedy: ['Failed comedian turned office worker', 'Overprotective parent', 'Aspiring influencer'],
                thriller: ['Former intelligence operative', 'Witness protection program', 'Investigative journalist'],
                'sci-fi': ['Space colony researcher', 'AI developer', 'Time travel experiment subject'],
                fantasy: ['Chosen one prophecy', 'Royal bloodline secret', 'Ancient magic wielder']
            },
            antagonist: {
                drama: ['Corrupt corporate executive', 'Manipulative family member', 'Fallen mentor figure'],
                action: ['International arms dealer', 'Rogue government agent', 'Criminal mastermind'],
                comedy: ['Uptight boss', 'Rival love interest', 'Overzealous HOA president'],
                thriller: ['Serial killer with pattern', 'Government conspiracy leader', 'Blackmail specialist'],
                'sci-fi': ['AI overlord', 'Alien invasion commander', 'Mad scientist'],
                fantasy: ['Dark lord seeking power', 'Corrupted wizard', 'Ancient evil awakening']
            }
        };
        const roleBackgrounds = backgrounds[role];
        const genreBackgrounds = roleBackgrounds?.[genre] || ['Mysterious past', 'Hidden identity', 'Secret motivation'];
        return genreBackgrounds.map((bg, index) => ({
            text: bg,
            weight: 100 - (index * 15)
        }));
    };
    const generateDialogueChoices = (genre, traits) => {
        const baseStyles = {
            drama: ['Introspective and thoughtful', 'Emotionally charged', 'Philosophical undertones'],
            action: ['Short, punchy statements', 'Action-focused commands', 'Witty one-liners'],
            comedy: ['Self-deprecating humor', 'Timing-based delivery', 'Absurd observations'],
            thriller: ['Cryptic and mysterious', 'Tension-building questions', 'Paranoid implications'],
            'sci-fi': ['Technical jargon usage', 'Future-oriented thinking', 'Scientific speculation'],
            fantasy: ['Archaic speech patterns', 'Mystical references', 'Honor-based declarations']
        };
        const genreStyles = baseStyles[genre] || ['Natural conversation', 'Character-driven speech', 'Situation-appropriate tone'];
        return genreStyles.map((style, index) => ({
            text: `${style} dialogue`,
            weight: 100 - (index * 12)
        }));
    };
    const generateDialogueStylesForTone = (tone) => {
        const toneStyles = {
            dramatic: [
                'Intense, emotional exchanges with subtext',
                'Characters reveal deep truths about themselves',
                'Conflict-driven conversation with high stakes',
                'Moments of vulnerable honesty'
            ],
            comedic: [
                'Witty banter and clever wordplay',
                'Misunderstandings that escalate humor',
                'Characters interrupt each other frequently',
                'Physical comedy enhanced by dialogue'
            ],
            tense: [
                'Short, clipped sentences building suspense',
                'Characters speak in coded language',
                'Uncomfortable silences between words',
                'Information revealed slowly and reluctantly'
            ],
            romantic: [
                'Flirtatious subtext in seemingly casual conversation',
                'Characters finish each others thoughts',
                'Meaningful looks accompanying dialogue',
                'Past relationship references create tension'
            ],
            action: [
                'Rapid-fire commands and status updates',
                'Dialogue interrupted by physical action',
                'Characters communicate through shorthand',
                'Urgency drives every exchange'
            ],
            emotional: [
                'Characters struggle to find the right words',
                'Dialogue reveals character growth and change',
                'Honest admissions of fear or hope',
                'Conversations that heal or wound deeply'
            ]
        };
        return toneStyles[tone] || [
            'Natural, character-appropriate dialogue',
            'Situation-driven conversation',
            'Authentic character voices',
            'Purpose-driven exchanges'
        ];
    };
    // Enhanced custom actions for film industry
    const filmIndustryActions = [
        {
            id: 'quick-character',
            title: 'Quick Character Generator',
            description: 'Rapidly generate a basic character with random traits',
            category: 'generation',
            icon: '⚡',
            keywords: ['quick', 'character', 'random', 'fast'],
            action: async () => {
                const quickCharacterData = {
                    'character-name': `Character ${Math.floor(Math.random() * 1000)}`,
                    'character-role': 'protagonist',
                    'genre': 'drama',
                    'personality-traits': ['brave', 'intelligent'],
                    'complexity-level': 'simple'
                };
                await handleGenerationStart({
                    id: 'character-development',
                    name: 'Quick Character',
                    description: 'Fast character generation',
                    icon: '⚡',
                    category: 'Character',
                    estimatedTime: '30 seconds',
                    complexity: 'simple',
                    outputType: 'node_chain',
                    steps: []
                }, quickCharacterData);
            }
        },
        {
            id: 'scene-starter',
            title: 'Scene Starter Pack',
            description: 'Generate a complete scene setup with location, characters, and conflict',
            category: 'generation',
            icon: '🎬',
            keywords: ['scene', 'setup', 'location', 'conflict'],
            action: () => {
                // This would open a simplified scene generation flow
                console.log('Scene starter pack generation');
            }
        },
        {
            id: 'export-screenplay',
            title: 'Export as Screenplay Format',
            description: 'Export the generated content in standard screenplay format',
            category: 'export',
            icon: '📝',
            keywords: ['screenplay', 'format', 'industry', 'standard'],
            action: () => {
                onExport?.('pdf'); // Assuming PDF export formats as screenplay
            }
        }
    ];
    const allCustomActions = [...customActions, ...filmIndustryActions];
    if (!isOpen) {
        return null;
    }
    return (_jsx(CommandPalette, { isOpen: isOpen, onClose: handleClose, nodes: nodes, edges: edges, selectedNodes: selectedNodes, onGenerationStart: handleGenerationStart, onNodeCreate: onNodeCreate || (() => { }), onNodeDelete: onNodesDelete || (() => { }), onExport: onExport || (() => { }), onTemplateApply: onTemplateApply || (() => { }), theme: theme, recentCommands: recentCommands, customActions: allCustomActions }));
};
export default CommandPaletteIntegration;
