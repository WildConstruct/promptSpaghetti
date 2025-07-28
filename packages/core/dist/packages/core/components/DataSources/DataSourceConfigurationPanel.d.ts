import { DataSource } from '../../external-data/DataSourceManager';
export interface DataSourceConfigurationPanelProps {
    visible: boolean;
    onClose: () => void;
    onSave: (dataSources: DataSource) => void;
    initialDataSources?: DataSource;
}
declare const DataSource: any;
export {};
//# sourceMappingURL=DataSourceConfigurationPanel.d.ts.map