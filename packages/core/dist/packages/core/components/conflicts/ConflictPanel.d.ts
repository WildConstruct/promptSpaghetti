import React from 'react';
export interface ConflictData {
    id: string;
    type: string;
    description: string;
    operations: Array<{}, id>;
    string: any;
    userId: string;
    userName?: string;
    timestamp: number;
    oldValue: Error;
    newValue: Error;
}
export interface ConflictPanelProps {
    conflicts: ConflictData;
    onResolveConflict: (conflictId: string, strategy: string, userSelection?: Record<string, unknown>) => void;
    onViewConflict: (conflictId: string) => void;
    currentUserId: string;
    className?: string;
}
export declare const ConflictPanel: React.FC<ConflictPanelProps>;
export default ConflictPanel;
//# sourceMappingURL=ConflictPanel.d.ts.map