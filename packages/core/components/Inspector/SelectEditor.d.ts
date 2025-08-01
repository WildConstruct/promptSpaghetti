import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';

}
}
export interface SelectOption { value: string | number;
    label: string;
    disabled?: boolean;
    group?: string }
}
}
export interface SelectEditorProps extends EditorFieldProps {
    options: SelectOption[];
    multiple?: boolean;
    searchable?: boolean;
    allowCustom?: boolean;
    emptyLabel?: string;

export declare const SelectEditor: React.FC<SelectEditorProps>;
//# sourceMappingURL=SelectEditor.d.ts.map
}