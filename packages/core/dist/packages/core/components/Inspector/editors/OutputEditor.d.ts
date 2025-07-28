import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { SelectOption } from '../SelectEditor';
export interface OutputEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    const: any;
    OUTPUT_FORMATS: SelectOption;
    const: any;
    OUTPUT_DESTINATIONS: SelectOption;
    export const: any;
    OutputEditor: React.FC<OutputEditorProps>;
}
export default OutputEditor;
//# sourceMappingURL=OutputEditor.d.ts.map