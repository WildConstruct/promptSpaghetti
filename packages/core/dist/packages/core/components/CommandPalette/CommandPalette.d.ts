/**
 * Graph Editor Command Palette
 * Task T-1752989144320-364: Integrate generation flow into editor command palette
 *
 * Professional command palette with generation flow integration for Wild Construct
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
export interface CommandPaletteAction {
    id: string;
    title: string;
    description: string;
    category: 'generation' | 'editing' | 'navigation' | 'export' | 'templates' | 'workflow';
    icon: string;
    shortcut?: string;
    keywords: string[];
    action: () => void | Promise<void>;
    requiresSelection?: boolean;
    requiresNodes?: boolean;
    disabled?: boolean;
    premium?: boolean;
}
export interface GenerationFlow {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    steps: GenerationStep[];
    estimatedTime: string;
    complexity: 'simple' | 'moderate' | 'advanced';
    outputType: 'single_node' | 'node_chain' | 'complete_graph';
}
export interface GenerationStep {
    id: string;
    title: string;
    description: string;
    type: 'input' | 'selection' | 'configuration' | 'execution' | 'review';
    required: boolean;
    fields?: GenerationField[];
}
export interface GenerationField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean';
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
    };
    defaultValue?: unknown;
}
export interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
    selectedNodes: Node[];
    onGenerationStart: (flow: GenerationFlow, params: Record<string, any>) => Promise<void>;
    onNodeCreate: (nodeType: string, position: {
        x: number;
        y: number;
    }, data?: any) => void;
    onNodeDelete: (nodeIds: string[]) => void;
    onExport: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
    onTemplateApply: (templateId: string) => void;
    theme?: 'light' | 'dark' | 'cinema';
    recentCommands?: string[];
    customActions?: CommandPaletteAction[];
}
/**
 * Professional command palette for graph editor with generation flow integration
 */
export declare const CommandPalette: React.FC<CommandPaletteProps>;
export default CommandPalette;
//# sourceMappingURL=CommandPalette.d.ts.map