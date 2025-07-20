import React from 'react';
export interface ConflictData {
    id: string;
    type: string;
    description: string;
    operations: Array<{
        id: string;
        userId: string;
        userName?: string;
        timestamp: number;
        oldValue: any;
        newValue: any;
    }>;
    nodeId?: string;
    edgeId?: string;
    property?: string;
    detectedAt: number;
    autoResolved: boolean;
}
export interface ConflictPanelProps {
    conflicts: ConflictData[];
    onResolveConflict: (conflictId: string, strategy: string, userSelection?: any) => void;
    onViewConflict: (conflictId: string) => void;
    currentUserId: string;
    className?: string;
}
export declare const ConflictPanel: React.FC<ConflictPanelProps>;
export declare const ConflictNotification: React.FC<{
    conflict: ConflictData;
    onResolve: () => void;
    onDismiss: () => void;
}>;
//# sourceMappingURL=ConflictPanel.d.ts.map