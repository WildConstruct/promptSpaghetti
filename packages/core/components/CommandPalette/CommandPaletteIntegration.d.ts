/**
 * Command Palette Integration
 * Task T-1752989144320-364: Complete integration with GraphEditor
 *
 * Seamless integration of command palette with the main graph editor
 */
import React from 'react';
import { Node } from 'reactflow';
import { CommandPaletteAction } from './CommandPalette';

}
}
export interface CommandPaletteIntegrationProps { theme?: 'light' | 'dark' | 'cinema';
    onNodeCreate?: (nodeType: string, position: {)
        x: number;
        y: number }
}
    }, data?: any) => void;
    onNodesDelete?: (nodeIds: string[]) => void;
    onExport?: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
    onTemplateApply?: (templateId: string) => void;
    onSave?: () => void;
    selectedNodes?: Node[];
    customActions?: CommandPaletteAction[];
    disabled?: boolean;

/**
 * Command palette integration component for the graph editor
 */
export declare const CommandPaletteIntegration: React.FC<CommandPaletteIntegrationProps>;
export default CommandPaletteIntegration;
//# sourceMappingURL=CommandPaletteIntegration.d.ts.map