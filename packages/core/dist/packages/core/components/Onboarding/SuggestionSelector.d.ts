/**
 * Suggestion Selector Component
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * UI component for selecting which analyzed suggestions to implement as nodes
 * with enhanced accessibility, security validation, and modern design
 */
import React from 'react';
import { NodeSuggestion, GenerationOptions } from '../../types/NodeGenerationTypes';
export interface SuggestionSelectorProps {
    suggestions: NodeSuggestion[];
    onGenerate: (selectedSuggestions: NodeSuggestion[], options: GenerationOptions) => void;
    onCancel: () => void;
    isGenerating?: boolean;
    theme?: 'light' | 'dark' | 'cinema';
}
/**
 * Component for selecting suggestions and configuring generation options
 */
export declare const generationOptions: GenerationOptions, setGenerationOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
//# sourceMappingURL=SuggestionSelector.d.ts.map