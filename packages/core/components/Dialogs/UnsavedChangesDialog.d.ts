/**
 * Unsaved Changes Confirmation Dialog - Story 6.1 (AC: 5)
 * Shows confirmation dialog with Save/Don't Save/Cancel options
 */
import React from 'react';
interface UnsavedChangesDialogProps {
    isOpen: boolean;
    projectName?: string;
    onSave: () => void;
    onDontSave: () => void;
    onCancel: () => void;
    actionDescription?: string;
}
export declare const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps>;
export {};
//# sourceMappingURL=UnsavedChangesDialog.d.ts.map