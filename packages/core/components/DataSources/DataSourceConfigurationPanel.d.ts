import React from 'react';
import { DataSource } from '../../external-data/DataSourceManager';

}
}
export interface DataSourceConfigurationPanelProps {
    visible: boolean;
    onClose: () => void;
    onSave: (dataSources: DataSource[]) => void;
    initialDataSources?: DataSource[];

export declare const DataSourceConfigurationPanel: React.FC<DataSourceConfigurationPanelProps>;
//# sourceMappingURL=DataSourceConfigurationPanel.d.ts.map
}
}