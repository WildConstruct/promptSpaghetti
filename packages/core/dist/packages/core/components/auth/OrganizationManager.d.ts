import React from 'react';
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
export declare const selectedOrg: Organization, setSelectedOrg: React.Dispatch<React.SetStateAction<Organization>>;
export {};
//# sourceMappingURL=OrganizationManager.d.ts.map