/**
 * ExportBundleDialog - Dialog for exporting graphs as GeneratorBundle files
 */
import React from 'react';
import { Node, Edge } from 'reactflow';

interface ExportBundleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
    onExport?: (result: {)
        success: boolean;
        error?: string;

    }) => void;

export declare const ExportBundleDialog: React.FC<ExportBundleDialogProps>;
export default ExportBundleDialog;
//# sourceMappingURL=ExportBundleDialog.d.ts.map