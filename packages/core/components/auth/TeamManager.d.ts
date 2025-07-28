import React from 'react';
interface Team {
    id: string;
    organizationId: string;
    parentTeamId?: string;
    name: string;
    description?: string;
    settings: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    level?: number;
    path?: string[];
}
interface TeamManagerProps {
    organizationId: string;
    currentUser?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    onTeamChange?: (team: Team) => void;
    onMembershipUpdated?: (membership: {)
        id: string;
        userId: string;
        teamId: string;
        role: string;
    }) => void;
}
export declare const TeamManager: React.FC<TeamManagerProps>;
export {};
//# sourceMappingURL=TeamManager.d.ts.map