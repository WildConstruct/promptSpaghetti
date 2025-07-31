import React from 'react';

}
interface LockRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRequest: (resourceId: string, lockType: string, reason?: string) => void;
    resourceId?: string | null;
    userId: string;

export declare const LockRequestDialog: React.FC<LockRequestDialogProps>;
}
export {};
//# sourceMappingURL=LockRequestDialog.d.ts.map