import React from 'react';
import { ExportTemplate, CreateExportJob } from '../../types/export';

}
}
interface ExportWizardProps {
    projectId: string;
    template?: ExportTemplate | null;
    onComplete: (exportData: CreateExportJob) => void;
    onCancel: () => void;

export declare const ExportWizard: React.FC<ExportWizardProps>;
export default ExportWizard;
//# sourceMappingURL=ExportWizard.d.ts.map
}
}