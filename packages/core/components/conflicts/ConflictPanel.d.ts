import React from 'react';

}
export interface ConflictData {
    id: string;
    type: string;
    description: string;
    operations: Array<{
        id: string;
        userId: string;
        userName?: string;
        timestamp: number;
        oldValue: Error;
        newValue: Error;
}
    }>;
    nodeId?: string;
    edgeId?: string;
    property?: string;
    detectedAt: number;
    autoResolved: boolean;

}
export interface ConflictPanelProps {
    conflicts: ConflictData[];
    onResolveConflict: (conflictId: string, strategy: string, userSelection?: Record<string, unknown>) => void;
    onViewConflict: (conflictId: string) => void;
    currentUserId: string;
    className?: string;

export declare const ConflictPanel: React.FC<ConflictPanelProps>;
export default ConflictPanel;
}
interface ConflictNotificationProps {
    conflict: ConflictData;
    onResolve: (conflict: ConflictData) => void;
    onDismiss: () => void;

export declare const ConflictNotification: React.FC<ConflictNotificationProps>;
//# sourceMappingURL=ConflictPanel.d.ts.map
}