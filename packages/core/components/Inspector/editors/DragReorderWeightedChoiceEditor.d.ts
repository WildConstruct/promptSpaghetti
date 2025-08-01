/**
 * Drag-to-Reorder Weighted Choice Editor
 * Epic 8.3 Task 3 - Integration with Weighted Choice Nodes (E8.3-3-drag-reorder)
 * Epic 8.4 - Three-Tier Progressive Disclosure System
 *
 * Professional weighted choice editor with drag-and-drop weight management
 * and three-tier progressive disclosure for filmmaker-friendly UI
 */
import React from 'react';

}
}
export interface WeightedChoiceData { choices?: Array<{
        text: string;
        weight: number }
}
    }>;
    [key: string]: unknown;

}
}
export interface DragReorderWeightedChoiceEditorProps {
    data: WeightedChoiceData;
    onChange: (data: Partial<WeightedChoiceData>) => void;
    nodeId?: string;
    disabled?: boolean;
    theme?: 'light' | 'dark' | 'cinema';
    showPreview?: boolean;
    showAnalytics?: boolean;


/**
 * Enhanced WeightedChoice editor with professional drag-to-reorder interface
 */
export declare const DragReorderWeightedChoiceEditor: React.FC<DragReorderWeightedChoiceEditorProps>;
export default DragReorderWeightedChoiceEditor;
//# sourceMappingURL=DragReorderWeightedChoiceEditor.d.ts.map
}
}