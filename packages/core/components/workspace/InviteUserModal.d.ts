/**
 * Epic 9.2.1 - Invite User Modal Component
 * Modal for inviting users to workspaces
 */
import React from 'react';
interface InviteUserModalProps {
    workspaceId: string;
    workspaceName: string;
    onSubmit: (data: {),
        userId: string;
        role: string;
    }) => void;
    onCancel: () => void;
}
export declare const InviteUserModal: React.FC<InviteUserModalProps>;
export default InviteUserModal;
//# sourceMappingURL=InviteUserModal.d.ts.map