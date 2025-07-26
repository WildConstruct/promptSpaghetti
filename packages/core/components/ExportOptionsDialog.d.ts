/**
 * Export Options Dialog Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 *
 * Professional export dialog with format selection, options configuration,
 * and size estimation for individual and batch result exports.
 */
import React from 'react';
import { ExportFormat, ResultExportOptions } from '../services/ResultExportService';
import { PreviewResultWithPath } from '../types/ExecutionPath';
interface ExportOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    results: PreviewResultWithPath[];
    selectedIndices?: number[];
    exportType: 'individual' | 'batch' | 'comparison';
    individualIndex?: number;
    onExport: (format: ExportFormat, options: ResultExportOptions) => Promise<void>;
    sourceGraph?: unknown;
}
export declare const ExportOptionsDialog: React.FC<ExportOptionsDialogProps>;
export {};
//# sourceMappingURL=ExportOptionsDialog.d.ts.map