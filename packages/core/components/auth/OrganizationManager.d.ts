import React from 'react';

}
interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    logoUrl?: string;
    branding: Record<string, unknown>;
    settings: Record<string, unknown>;
    plan: 'free' | 'pro' | 'enterprise';
    maxUsers: number;
    createdAt: Date;
    updatedAt: Date;


}
interface OrganizationManagerProps {
    currentUser?: {
        id: string;
        name: string;
        email: string;
        role: string;

}
    };
    onOrganizationChange?: (org: Organization) => void;
    onInvitationSent?: (invitation: {)
        id: string;
        email: string;
        role: string;
    }) => void;
    onMembershipUpdated?: (membership: {)
        id: string;
        userId: string;
        role: string;
    }) => void;

export declare const OrganizationManager: React.FC<OrganizationManagerProps>;
export {};
//# sourceMappingURL=OrganizationManager.d.ts.map