import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface WeightedChoiceEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    onGlobalPreviewRequest?: () => void;
}
export declare const WeightedChoiceEditor: React.FC<WeightedChoiceEditorProps>;
//# sourceMappingURL=WeightedChoiceEditor.d.ts.map