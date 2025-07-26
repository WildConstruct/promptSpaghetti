import React from 'react';
import { VFXValidationResult } from '../../types/VFXExport';
import { CreateExportJob } from '../../types/export';
interface VFXExportPreviewProps {
    exportData: CreateExportJob;
    onValidationComplete?: (isValid: boolean, results: VFXValidationResult | null) => void;
}
export declare const VFXExportPreview: React.FC<VFXExportPreviewProps>;
export default VFXExportPreview;
//# sourceMappingURL=VFXExportPreview.d.ts.map