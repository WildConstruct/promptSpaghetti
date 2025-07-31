/**
 * Custom hook for managing unsaved changes - Story 6.1 (AC: 5)
 * Handles beforeunload events and confirmation dialogs
 */

import { useEffect, useCallback, useState } from 'react';

}
interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  projectName?: string;
  onSave?: () => Promise<boolean> | boolean; // Returns true if save was successful,
  interface UseUnsavedChangesReturn {
  showUnsavedDialog: boolean;
  dialogAction: string;
  confirmNavigation: (action: string, callback: () => void) => void;
  handleSave: () => void;
  handleDontSave: () => void;
  handleCancel: () => void;
  export function useUnsavedChanges(hasUnsavedChanges: boolean): UseUnsavedChangesReturn {,
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  // Handle beforeunload event for browser close/refresh
  useEffect(() => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {,
  if (hasUnsavedChanges) {
  // Standard way to show browser confirmation dialog
  const message = 'You have unsaved changes. Are you sure you want to leave?';
  event.preventDefault();
  event.returnValue = message; // For Chrome
  return message; // For other browsers
}
};

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Function to show confirmation dialog before navigation
  const confirmNavigation = useCallback((action: string, callback: () => void) => {
    if (hasUnsavedChanges) {
      setDialogAction(action);
      setPendingCallback(() => callback);
      setShowUnsavedDialog(true);
    } else {
      // No unsaved changes, proceed immediately
      callback();

  }, [hasUnsavedChanges]);

  // Handle save and continue
  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        const saveSuccessful = await onSave();
        if (saveSuccessful && pendingCallback) {
          // Save was successful, proceed with the pending action
          pendingCallback();
          setPendingCallback(null);
          setShowUnsavedDialog(false);
        } else if (!saveSuccessful) {
          // Save failed, keep dialog open
          console.warn('Save operation failed');

      } catch (error) {
  console.error('Error during save operation:', error);
  // Keep dialog open on error
} else {
      // No save handler provided, just proceed
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);

      setShowUnsavedDialog(false);

  }, [onSave, pendingCallback]);

  // Handle don't save and continue
  const handleDontSave = useCallback(() => {
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);

    setShowUnsavedDialog(false);
  }, [pendingCallback]);

  // Handle cancel (stay on current page)
  const handleCancel = useCallback(() => {
    setPendingCallback(null);
    setShowUnsavedDialog(false);
  }, []);

  return {
    showUnsavedDialog,
    dialogAction,
    confirmNavigation,
    handleSave,
    handleDontSave,
    handleCancel
  };
};