/**
 * Custom hook for managing unsaved changes - Story 6.1 (AC: 5)
 * Handles beforeunload events and confirmation dialogs
 */
interface UseUnsavedChangesOptions {
    hasUnsavedChanges: boolean;
    projectName?: string;
    onSave?: () => Promise<boolean> | boolean;
}
interface UseUnsavedChangesReturn {
    showUnsavedDialog: boolean;
    dialogAction: string;
    confirmNavigation: (action: string, callback: () => void) => void;
    handleSave: () => void;
    handleDontSave: () => void;
    handleCancel: () => void;
}
export declare const useUnsavedChanges: (
  { hasUnsavedChanges,
  projectName,
  onSave }: UseUnsavedChangesOptions
) => UseUnsavedChangesReturn;
export {};
//# sourceMappingURL=useUnsavedChanges.d.ts.map