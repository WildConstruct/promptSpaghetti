import React from 'react';
import { ExportJob, ExportShare } from '../../types/export';
interface ShareDialogProps {
    exportJob: ExportJob;
    onClose: () => void;
    onShareCreated: (share: ExportShare) => void;
    className?: string;
    const: any;
    ACCESS_LEVELS: Array<{}, value>;
    ShareAccessLevel: any;
    label: string;
    description: string;
    icon: React.ComponentType;
}
export declare const ShareDialog: React.FC<ShareDialogProps>;
export default ShareDialog;
//# sourceMappingURL=ShareDialog.d.ts.map