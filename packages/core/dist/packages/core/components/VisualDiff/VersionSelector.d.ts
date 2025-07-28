import React from 'react';
export interface Version {
    id: string;
    version_number: number;
    description: string;
    created_at: Date;
    created_by?: string;
    is_current?: boolean;
}
export interface VersionSelectorProps {
    graphId: string;
    versions: Version;
    sourceVersionId: string;
    targetVersionId: string;
    onVersionChange: (sourceId: string, targetId: string) => void;
    className?: string;
}
export declare const VersionSelector: React.FC<VersionSelectorProps>;
//# sourceMappingURL=VersionSelector.d.ts.map