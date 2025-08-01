/**
 * Epic 9.3.3 - Version Restore Dialog Component
 * UI for version restoration with conflict resolution, preview, and progress tracking
 */
import React from 'react';
import { VersionRestoreManager, RestoreResult } from '../../version-history/VersionRestoreManager';
import { VersionSnapshot } from '../../version-history/VersionHistoryManager';

}
}
interface VersionRestoreDialogProps { snapshot: VersionSnapshot;
    currentGraphData: unknown;
    restoreManager: VersionRestoreManager;
    isOpen: boolean;
    onClose: () => void;
    onRestoreComplete: (result: RestoreResult) => void;
    className?: string;

export declare const VersionRestoreDialog: React.FC<VersionRestoreDialogProps> }
}
export {};
//# sourceMappingURL=VersionRestoreDialog.d.ts.map