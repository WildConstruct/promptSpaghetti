import React from 'react';
import { QueryResult } from '../../external-data/DataSourceManager';
export interface HistoricalDataImportPanelProps {
    visible: boolean;
    onClose: () => void;
    onDataImported?: (results: QueryResult[]) => void;
    onError?: (error: Error) => void;
}
export declare const HistoricalDataImportPanel: React.FC<HistoricalDataImportPanelProps>;
//# sourceMappingURL=HistoricalDataImportPanel.d.ts.map