/**
 * Custom hook for managing unsaved changes - Story 6.1 (AC: 5)
 * Handles beforeunload events and confirmation dialogs
 */
interface UseUnsavedChangesReturn {
    showUnsavedDialog: boolean;
    dialogAction: string;
    confirmNavigation: (action: string, callback: () => void) => void;
    handleSave: () => void;
    handleDontSave: () => void;
    handleCancel: () => void;
}
export declare function useUnsavedChanges(hasUnsavedChanges: boolean): UseUnsavedChangesReturn;
export {};
//# sourceMappingURL=useUnsavedChanges.d.ts.map