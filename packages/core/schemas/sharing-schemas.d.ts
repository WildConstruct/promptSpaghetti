/**
 * Sharing Data Validation Schemas - Epic 16 Implementation
 * Comprehensive Zod schemas for runtime validation of sharing data
 */
import { z } from 'zod';
export declare const ShareAccessLevelSchema: z.ZodEnum<["public", "restricted", "private"]>;
export declare const SharePermissionSchema: z.ZodEnum<["view", "comment", "edit", "admin"]>;
export declare const ShareStatusSchema: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
export declare const ContentTypeSchema: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
export declare const UserInfoSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
    avatar?: string | undefined;
}, {
    id: string;
    name: string;
    email: string;
    avatar?: string | undefined;
}>;
export declare const CollaboratorSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
} & {
    role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
    addedAt: z.ZodDate;
    permissions: z.ZodArray<z.ZodString, "many">;
    invitedBy: z.ZodString;
    acceptedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
    role: "view" | "edit" | "admin" | "comment";
    permissions: string[];
    addedAt: Date;
    invitedBy: string;
    avatar?: string | undefined;
    acceptedAt?: Date | undefined;
}, {
    id: string;
    name: string;
    email: string;
    role: "view" | "edit" | "admin" | "comment";
    permissions: string[];
    addedAt: Date;
    invitedBy: string;
    avatar?: string | undefined;
    acceptedAt?: Date | undefined;
}>;
export declare const ShareSecurityConfigSchema: z.ZodObject<{
    dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
    encryptionRequired: z.ZodBoolean;
    auditingEnabled: z.ZodBoolean;
    retentionPolicy: z.ZodObject<{
        maxShareDuration: z.ZodNumber;
        autoExpire: z.ZodBoolean;
        dataRetentionDays: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        maxShareDuration: number;
        autoExpire: boolean;
        dataRetentionDays: number;
    }, {
        maxShareDuration: number;
        autoExpire: boolean;
        dataRetentionDays: number;
    }>;
    accessControls: z.ZodObject<{
        ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        requireAuthentication: z.ZodBoolean;
        maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
        sessionTimeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requireAuthentication: boolean;
        ipWhitelist: string[];
        geoRestrictions: string[];
        sessionTimeout?: number | undefined;
        maxConcurrentUsers?: number | undefined;
    }, {
        requireAuthentication: boolean;
        sessionTimeout?: number | undefined;
        ipWhitelist?: string[] | undefined;
        geoRestrictions?: string[] | undefined;
        maxConcurrentUsers?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    dataClassification: "public" | "internal" | "restricted" | "confidential";
    retentionPolicy: {
        maxShareDuration: number;
        autoExpire: boolean;
        dataRetentionDays: number;
    };
    encryptionRequired: boolean;
    auditingEnabled: boolean;
    accessControls: {
        requireAuthentication: boolean;
        ipWhitelist: string[];
        geoRestrictions: string[];
        sessionTimeout?: number | undefined;
        maxConcurrentUsers?: number | undefined;
    };
}, {
    dataClassification: "public" | "internal" | "restricted" | "confidential";
    retentionPolicy: {
        maxShareDuration: number;
        autoExpire: boolean;
        dataRetentionDays: number;
    };
    encryptionRequired: boolean;
    auditingEnabled: boolean;
    accessControls: {
        requireAuthentication: boolean;
        sessionTimeout?: number | undefined;
        ipWhitelist?: string[] | undefined;
        geoRestrictions?: string[] | undefined;
        maxConcurrentUsers?: number | undefined;
    };
}>;
export declare const SharingConfigSchema: z.ZodObject<{
    accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
    permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    } & {
        role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        addedAt: z.ZodDate;
        permissions: z.ZodArray<z.ZodString, "many">;
        invitedBy: z.ZodString;
        acceptedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }>, "many">>;
    shareUrl: z.ZodString;
    shareToken: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodDate>;
    passwordProtected: z.ZodDefault<z.ZodBoolean>;
    allowDownload: z.ZodDefault<z.ZodBoolean>;
    allowCopy: z.ZodDefault<z.ZodBoolean>;
    trackAnalytics: z.ZodDefault<z.ZodBoolean>;
    notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    permissions: "view" | "edit" | "admin" | "comment";
    collaborators: {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }[];
    accessLevel: "private" | "public" | "restricted";
    shareUrl: string;
    shareToken: string;
    passwordProtected: boolean;
    allowDownload: boolean;
    allowCopy: boolean;
    trackAnalytics: boolean;
    notifyOnAccess: boolean;
    expiresAt?: Date | undefined;
}, {
    permissions: "view" | "edit" | "admin" | "comment";
    accessLevel: "private" | "public" | "restricted";
    shareUrl: string;
    shareToken: string;
    expiresAt?: Date | undefined;
    collaborators?: {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }[] | undefined;
    passwordProtected?: boolean | undefined;
    allowDownload?: boolean | undefined;
    allowCopy?: boolean | undefined;
    trackAnalytics?: boolean | undefined;
    notifyOnAccess?: boolean | undefined;
}>;
export declare const ContentVersionSchema: z.ZodObject<{
    version: z.ZodString;
    timestamp: z.ZodDate;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    changes: z.ZodArray<z.ZodString, "many">;
    size: z.ZodNumber;
    checksum: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    size: number;
    timestamp: Date;
    checksum: string;
    changes: string[];
}, {
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    size: number;
    timestamp: Date;
    checksum: string;
    changes: string[];
}>;
export declare const MergeConflictSchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodEnum<["content", "metadata", "permissions"]>;
    conflictingVersions: z.ZodArray<z.ZodString, "many">;
    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "content" | "metadata" | "permissions";
    conflictingVersions: string[];
    resolution?: "auto" | "manual" | undefined;
}, {
    path: string;
    type: "content" | "metadata" | "permissions";
    conflictingVersions: string[];
    resolution?: "auto" | "manual" | undefined;
}>;
export declare const VersionControlSchema: z.ZodObject<{
    currentVersion: z.ZodString;
    versions: z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        timestamp: z.ZodDate;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        changes: z.ZodArray<z.ZodString, "many">;
        size: z.ZodNumber;
        checksum: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        size: number;
        timestamp: Date;
        checksum: string;
        changes: string[];
    }, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        size: number;
        timestamp: Date;
        checksum: string;
        changes: string[];
    }>, "many">;
    isLatest: z.ZodBoolean;
    changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<["content", "metadata", "permissions"]>;
        conflictingVersions: z.ZodArray<z.ZodString, "many">;
        resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "content" | "metadata" | "permissions";
        conflictingVersions: string[];
        resolution?: "auto" | "manual" | undefined;
    }, {
        path: string;
        type: "content" | "metadata" | "permissions";
        conflictingVersions: string[];
        resolution?: "auto" | "manual" | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    versions: {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        size: number;
        timestamp: Date;
        checksum: string;
        changes: string[];
    }[];
    currentVersion: string;
    isLatest: boolean;
    changesFromPrevious?: string[] | undefined;
    mergeConflicts?: {
        path: string;
        type: "content" | "metadata" | "permissions";
        conflictingVersions: string[];
        resolution?: "auto" | "manual" | undefined;
    }[] | undefined;
}, {
    versions: {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        size: number;
        timestamp: Date;
        checksum: string;
        changes: string[];
    }[];
    currentVersion: string;
    isLatest: boolean;
    changesFromPrevious?: string[] | undefined;
    mergeConflicts?: {
        path: string;
        type: "content" | "metadata" | "permissions";
        conflictingVersions: string[];
        resolution?: "auto" | "manual" | undefined;
    }[] | undefined;
}>;
export declare const ConnectionLabelSchema: z.ZodObject<{
    id: z.ZodString;
    sourceNodeId: z.ZodString;
    targetNodeId: z.ZodString;
    label: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    label: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    sourceNodeId: string;
    targetNodeId: string;
    color?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    label: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    sourceNodeId: string;
    targetNodeId: string;
    color?: string | undefined;
}>;
export declare const StickyNoteSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    content: z.ZodString;
    color: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}>;
export declare const AnnotationRegionSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    title: string;
    description?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    title: string;
    description?: string | undefined;
}>;
export declare const ShareCommentSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodOptional<z.ZodDate>;
    parentId: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    resolved: z.ZodDefault<z.ZodBoolean>;
    resolvedBy: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>>;
    resolvedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    content: string;
    resolved: boolean;
    updatedAt?: Date | undefined;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    resolvedAt?: Date | undefined;
    resolvedBy?: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    content: string;
    updatedAt?: Date | undefined;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    resolved?: boolean | undefined;
    resolvedAt?: Date | undefined;
    resolvedBy?: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    } | undefined;
}>;
export declare const ContentAnnotationsSchema: z.ZodObject<{
    connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceNodeId: z.ZodString;
        targetNodeId: z.ZodString;
        label: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        label: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        sourceNodeId: string;
        targetNodeId: string;
        color?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        label: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        sourceNodeId: string;
        targetNodeId: string;
        color?: string | undefined;
    }>, "many">>;
    stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        content: z.ZodString;
        color: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }>, "many">>;
    regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
        title: string;
        description?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
        title: string;
        description?: string | undefined;
    }>, "many">>;
    comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodOptional<z.ZodDate>;
        parentId: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>>;
        resolved: z.ZodDefault<z.ZodBoolean>;
        resolvedBy: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>>;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        resolved: boolean;
        updatedAt?: Date | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        parentId?: string | undefined;
        resolvedAt?: Date | undefined;
        resolvedBy?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }, {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        updatedAt?: Date | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        parentId?: string | undefined;
        resolved?: boolean | undefined;
        resolvedAt?: Date | undefined;
        resolvedBy?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    stickyNotes: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }[];
    connectionLabels: {
        id: string;
        createdAt: Date;
        label: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        sourceNodeId: string;
        targetNodeId: string;
        color?: string | undefined;
    }[];
    regions: {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
        title: string;
        description?: string | undefined;
    }[];
    comments: {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        resolved: boolean;
        updatedAt?: Date | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        parentId?: string | undefined;
        resolvedAt?: Date | undefined;
        resolvedBy?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }[];
}, {
    stickyNotes?: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }[] | undefined;
    connectionLabels?: {
        id: string;
        createdAt: Date;
        label: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        sourceNodeId: string;
        targetNodeId: string;
        color?: string | undefined;
    }[] | undefined;
    regions?: {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
        title: string;
        description?: string | undefined;
    }[] | undefined;
    comments?: {
        id: string;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        content: string;
        updatedAt?: Date | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        parentId?: string | undefined;
        resolved?: boolean | undefined;
        resolvedAt?: Date | undefined;
        resolvedBy?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }[] | undefined;
}>;
export declare const SharedContentMetadataSchema: z.ZodObject<{
    exportId: z.ZodString;
    version: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    contentSize: z.ZodNumber;
    checksumMd5: z.ZodString;
    versionControl: z.ZodObject<{
        currentVersion: z.ZodString;
        versions: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            timestamp: z.ZodDate;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            changes: z.ZodArray<z.ZodString, "many">;
            size: z.ZodNumber;
            checksum: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }>, "many">;
        isLatest: z.ZodBoolean;
        changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodEnum<["content", "metadata", "permissions"]>;
            conflictingVersions: z.ZodArray<z.ZodString, "many">;
            resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }, {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    }, {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    }>;
    annotations: z.ZodObject<{
        connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceNodeId: z.ZodString;
            targetNodeId: z.ZodString;
            label: z.ZodString;
            color: z.ZodOptional<z.ZodString>;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }, {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }>, "many">>;
        stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            content: z.ZodString;
            color: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }>, "many">>;
        regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }>, "many">>;
        comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodOptional<z.ZodDate>;
            parentId: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>>;
            resolved: z.ZodDefault<z.ZodBoolean>;
            resolvedBy: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>>;
            resolvedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            resolved: boolean;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolved?: boolean | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[];
        connectionLabels: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[];
        regions: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            resolved: boolean;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[];
    }, {
        stickyNotes?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[] | undefined;
        connectionLabels?: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[] | undefined;
        regions?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[] | undefined;
        comments?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolved?: boolean | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    annotations: {
        stickyNotes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[];
        connectionLabels: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[];
        regions: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            resolved: boolean;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[];
    };
    exportId: string;
    contentSize: number;
    checksumMd5: string;
    versionControl: {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    };
    category?: string | undefined;
    language?: string | undefined;
}, {
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    annotations: {
        stickyNotes?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[] | undefined;
        connectionLabels?: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[] | undefined;
        regions?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[] | undefined;
        comments?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolved?: boolean | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[] | undefined;
    };
    exportId: string;
    contentSize: number;
    checksumMd5: string;
    versionControl: {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    };
    category?: string | undefined;
    tags?: string[] | undefined;
    language?: string | undefined;
}>;
export declare const GeoLocationSchema: z.ZodObject<{
    country: z.ZodString;
    region: z.ZodString;
    city: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
}, "strip", z.ZodTypeAny, {
    region: string;
    country: string;
    city: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}, {
    region: string;
    country: string;
    city: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}>;
export declare const ViewerInfoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isAuthenticated: z.ZodBoolean;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    isAuthenticated: boolean;
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}, {
    sessionId: string;
    isAuthenticated: boolean;
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}>;
export declare const ShareViewSchema: z.ZodObject<{
    id: z.ZodString;
    viewerInfo: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        isAuthenticated: z.ZodBoolean;
        sessionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    }, {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    }>;
    timestamp: z.ZodDate;
    duration: z.ZodNumber;
    ipAddress: z.ZodString;
    userAgent: z.ZodString;
    referrer: z.ZodOptional<z.ZodString>;
    geolocation: z.ZodOptional<z.ZodObject<{
        country: z.ZodString;
        region: z.ZodString;
        city: z.ZodString;
        coordinates: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        region: string;
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }, {
        region: string;
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: Date;
    duration: number;
    ipAddress: string;
    userAgent: string;
    viewerInfo: {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    };
    referrer?: string | undefined;
    geolocation?: {
        region: string;
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    } | undefined;
}, {
    id: string;
    timestamp: Date;
    duration: number;
    ipAddress: string;
    userAgent: string;
    viewerInfo: {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    };
    referrer?: string | undefined;
    geolocation?: {
        region: string;
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    } | undefined;
}>;
export declare const ShareDownloadSchema: z.ZodObject<{
    id: z.ZodString;
    downloadedBy: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        isAuthenticated: z.ZodBoolean;
        sessionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    }, {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    }>;
    timestamp: z.ZodDate;
    format: z.ZodString;
    size: z.ZodNumber;
    ipAddress: z.ZodString;
    success: z.ZodBoolean;
    errorReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    success: boolean;
    format: string;
    size: number;
    timestamp: Date;
    ipAddress: string;
    downloadedBy: {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    };
    errorReason?: string | undefined;
}, {
    id: string;
    success: boolean;
    format: string;
    size: number;
    timestamp: Date;
    ipAddress: string;
    downloadedBy: {
        sessionId: string;
        isAuthenticated: boolean;
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
    };
    errorReason?: string | undefined;
}>;
export declare const CollaborationEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    timestamp: z.ZodDate;
    details: z.ZodAny;
    impact: z.ZodEnum<["minor", "major", "breaking"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "edit" | "comment" | "annotation" | "permission_change";
    timestamp: Date;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    impact: "major" | "minor" | "breaking";
    details?: any;
}, {
    id: string;
    type: "edit" | "comment" | "annotation" | "permission_change";
    timestamp: Date;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    };
    impact: "major" | "minor" | "breaking";
    details?: any;
}>;
export declare const GeographicStatsSchema: z.ZodObject<{
    country: z.ZodString;
    views: z.ZodNumber;
    uniqueViewers: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    country: string;
    views: number;
    uniqueViewers: number;
}, {
    country: string;
    views: number;
    uniqueViewers: number;
}>;
export declare const DeviceStatsSchema: z.ZodObject<{
    deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
    operatingSystem: z.ZodString;
    browser: z.ZodString;
    views: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    browser: string;
    deviceType: "mobile" | "desktop" | "tablet";
    views: number;
    operatingSystem: string;
}, {
    browser: string;
    deviceType: "mobile" | "desktop" | "tablet";
    views: number;
    operatingSystem: string;
}>;
export declare const ConversionMetricsSchema: z.ZodObject<{
    viewToDownload: z.ZodNumber;
    viewToCollaboration: z.ZodNumber;
    viewToSignup: z.ZodNumber;
    averageTimeToAction: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    viewToDownload: number;
    viewToCollaboration: number;
    viewToSignup: number;
    averageTimeToAction: number;
}, {
    viewToDownload: number;
    viewToCollaboration: number;
    viewToSignup: number;
    averageTimeToAction: number;
}>;
export declare const ShareAnalyticsSchema: z.ZodObject<{
    views: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        viewerInfo: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            isAuthenticated: z.ZodBoolean;
            sessionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        duration: z.ZodNumber;
        ipAddress: z.ZodString;
        userAgent: z.ZodString;
        referrer: z.ZodOptional<z.ZodString>;
        geolocation: z.ZodOptional<z.ZodObject<{
            country: z.ZodString;
            region: z.ZodString;
            city: z.ZodString;
            coordinates: z.ZodObject<{
                lat: z.ZodNumber;
                lng: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                lat: number;
                lng: number;
            }, {
                lat: number;
                lng: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }, {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }, {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }>, "many">>;
    downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        downloadedBy: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            isAuthenticated: z.ZodBoolean;
            sessionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        format: z.ZodString;
        size: z.ZodNumber;
        ipAddress: z.ZodString;
        success: z.ZodBoolean;
        errorReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }, {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }>, "many">>;
    collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        details: z.ZodAny;
        impact: z.ZodEnum<["minor", "major", "breaking"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }, {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }>, "many">>;
    totalViews: z.ZodNumber;
    uniqueViewers: z.ZodNumber;
    averageViewDuration: z.ZodNumber;
    peakConcurrentUsers: z.ZodNumber;
    geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
        country: z.ZodString;
        views: z.ZodNumber;
        uniqueViewers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        country: string;
        views: number;
        uniqueViewers: number;
    }, {
        country: string;
        views: number;
        uniqueViewers: number;
    }>, "many">>;
    deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
        deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
        operatingSystem: z.ZodString;
        browser: z.ZodString;
        views: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        browser: string;
        deviceType: "mobile" | "desktop" | "tablet";
        views: number;
        operatingSystem: string;
    }, {
        browser: string;
        deviceType: "mobile" | "desktop" | "tablet";
        views: number;
        operatingSystem: string;
    }>, "many">>;
    conversionMetrics: z.ZodObject<{
        viewToDownload: z.ZodNumber;
        viewToCollaboration: z.ZodNumber;
        viewToSignup: z.ZodNumber;
        averageTimeToAction: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        viewToDownload: number;
        viewToCollaboration: number;
        viewToSignup: number;
        averageTimeToAction: number;
    }, {
        viewToDownload: number;
        viewToCollaboration: number;
        viewToSignup: number;
        averageTimeToAction: number;
    }>;
}, "strip", z.ZodTypeAny, {
    views: {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }[];
    downloads: {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }[];
    conversionMetrics: {
        viewToDownload: number;
        viewToCollaboration: number;
        viewToSignup: number;
        averageTimeToAction: number;
    };
    collaborations: {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }[];
    totalViews: number;
    averageViewDuration: number;
    uniqueViewers: number;
    peakConcurrentUsers: number;
    geographicDistribution: {
        country: string;
        views: number;
        uniqueViewers: number;
    }[];
    deviceStats: {
        browser: string;
        deviceType: "mobile" | "desktop" | "tablet";
        views: number;
        operatingSystem: string;
    }[];
}, {
    conversionMetrics: {
        viewToDownload: number;
        viewToCollaboration: number;
        viewToSignup: number;
        averageTimeToAction: number;
    };
    totalViews: number;
    averageViewDuration: number;
    uniqueViewers: number;
    peakConcurrentUsers: number;
    views?: {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }[] | undefined;
    downloads?: {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }[] | undefined;
    collaborations?: {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }[] | undefined;
    geographicDistribution?: {
        country: string;
        views: number;
        uniqueViewers: number;
    }[] | undefined;
    deviceStats?: {
        browser: string;
        deviceType: "mobile" | "desktop" | "tablet";
        views: number;
        operatingSystem: string;
    }[] | undefined;
}>;
export declare const SharedContentSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodAny;
    metadata: z.ZodObject<{
        exportId: z.ZodString;
        version: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        category: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        contentSize: z.ZodNumber;
        checksumMd5: z.ZodString;
        versionControl: z.ZodObject<{
            currentVersion: z.ZodString;
            versions: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                timestamp: z.ZodDate;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                changes: z.ZodArray<z.ZodString, "many">;
                size: z.ZodNumber;
                checksum: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }, {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }>, "many">;
            isLatest: z.ZodBoolean;
            changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                type: z.ZodEnum<["content", "metadata", "permissions"]>;
                conflictingVersions: z.ZodArray<z.ZodString, "many">;
                resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }, {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        }, {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        }>;
        annotations: z.ZodObject<{
            connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                sourceNodeId: z.ZodString;
                targetNodeId: z.ZodString;
                label: z.ZodString;
                color: z.ZodOptional<z.ZodString>;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }, {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }>, "many">>;
            stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                content: z.ZodString;
                color: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }, {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }>, "many">>;
            regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                color: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }>, "many">>;
            comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodOptional<z.ZodDate>;
                parentId: z.ZodOptional<z.ZodString>;
                position: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                }, {
                    x: number;
                    y: number;
                }>>;
                resolved: z.ZodDefault<z.ZodBoolean>;
                resolvedBy: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>>;
                resolvedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            stickyNotes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[];
            connectionLabels: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[];
            regions: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[];
            comments: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[];
        }, {
            stickyNotes?: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[] | undefined;
            connectionLabels?: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[] | undefined;
            regions?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[] | undefined;
            comments?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[];
            connectionLabels: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[];
            regions: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[];
            comments: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[];
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        language?: string | undefined;
    }, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes?: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[] | undefined;
            connectionLabels?: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[] | undefined;
            regions?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[] | undefined;
            comments?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        tags?: string[] | undefined;
        language?: string | undefined;
    }>;
    sharing: z.ZodObject<{
        accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
        permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        } & {
            role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            addedAt: z.ZodDate;
            permissions: z.ZodArray<z.ZodString, "many">;
            invitedBy: z.ZodString;
            acceptedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }>, "many">>;
        shareUrl: z.ZodString;
        shareToken: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodDate>;
        passwordProtected: z.ZodDefault<z.ZodBoolean>;
        allowDownload: z.ZodDefault<z.ZodBoolean>;
        allowCopy: z.ZodDefault<z.ZodBoolean>;
        trackAnalytics: z.ZodDefault<z.ZodBoolean>;
        notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        permissions: "view" | "edit" | "admin" | "comment";
        collaborators: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[];
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        passwordProtected: boolean;
        allowDownload: boolean;
        allowCopy: boolean;
        trackAnalytics: boolean;
        notifyOnAccess: boolean;
        expiresAt?: Date | undefined;
    }, {
        permissions: "view" | "edit" | "admin" | "comment";
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }>;
    security: z.ZodObject<{
        dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
        encryptionRequired: z.ZodBoolean;
        auditingEnabled: z.ZodBoolean;
        retentionPolicy: z.ZodObject<{
            maxShareDuration: z.ZodNumber;
            autoExpire: z.ZodBoolean;
            dataRetentionDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }>;
        accessControls: z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        }, {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    }, {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    }>;
    analytics: z.ZodObject<{
        views: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            viewerInfo: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            duration: z.ZodNumber;
            ipAddress: z.ZodString;
            userAgent: z.ZodString;
            referrer: z.ZodOptional<z.ZodString>;
            geolocation: z.ZodOptional<z.ZodObject<{
                country: z.ZodString;
                region: z.ZodString;
                city: z.ZodString;
                coordinates: z.ZodObject<{
                    lat: z.ZodNumber;
                    lng: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    lat: number;
                    lng: number;
                }, {
                    lat: number;
                    lng: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }>, "many">>;
        downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            downloadedBy: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }>, "many">>;
        collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
            user: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }>, "many">>;
        totalViews: z.ZodNumber;
        uniqueViewers: z.ZodNumber;
        averageViewDuration: z.ZodNumber;
        peakConcurrentUsers: z.ZodNumber;
        geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            views: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            country: string;
            views: number;
            uniqueViewers: number;
        }, {
            country: string;
            views: number;
            uniqueViewers: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[];
        downloads: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[];
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        collaborations: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[];
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        geographicDistribution: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[];
        deviceStats: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[];
    }, {
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        views?: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[] | undefined;
        downloads?: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[] | undefined;
        collaborations?: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[] | undefined;
        geographicDistribution?: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[] | undefined;
        deviceStats?: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[] | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "active" | "expired" | "pending" | "revoked";
    type: "template" | "bundle" | "graph" | "dataset";
    metadata: {
        tags: string[];
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[];
            connectionLabels: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[];
            regions: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[];
            comments: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[];
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        language?: string | undefined;
    };
    title: string;
    security: {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    };
    analytics: {
        views: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[];
        downloads: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[];
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        collaborations: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[];
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        geographicDistribution: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[];
        deviceStats: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[];
    };
    sharing: {
        permissions: "view" | "edit" | "admin" | "comment";
        collaborators: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[];
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        passwordProtected: boolean;
        allowDownload: boolean;
        allowCopy: boolean;
        trackAnalytics: boolean;
        notifyOnAccess: boolean;
        expiresAt?: Date | undefined;
    };
    description?: string | undefined;
    content?: any;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "active" | "expired" | "pending" | "revoked";
    type: "template" | "bundle" | "graph" | "dataset";
    metadata: {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes?: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[] | undefined;
            connectionLabels?: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[] | undefined;
            regions?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[] | undefined;
            comments?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        tags?: string[] | undefined;
        language?: string | undefined;
    };
    title: string;
    security: {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    };
    analytics: {
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        views?: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[] | undefined;
        downloads?: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[] | undefined;
        collaborations?: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[] | undefined;
        geographicDistribution?: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[] | undefined;
        deviceStats?: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[] | undefined;
    };
    sharing: {
        permissions: "view" | "edit" | "admin" | "comment";
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    };
    description?: string | undefined;
    content?: any;
}>;
export declare const CreateShareRequestSchema: z.ZodObject<{
    contentId: z.ZodString;
    contentType: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sharing: z.ZodObject<{
        accessLevel: z.ZodOptional<z.ZodEnum<["public", "restricted", "private"]>>;
        permissions: z.ZodOptional<z.ZodEnum<["view", "comment", "edit", "admin"]>>;
        collaborators: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        } & {
            role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            addedAt: z.ZodDate;
            permissions: z.ZodArray<z.ZodString, "many">;
            invitedBy: z.ZodString;
            acceptedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }>, "many">>>;
        shareUrl: z.ZodOptional<z.ZodString>;
        shareToken: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
        passwordProtected: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowDownload: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowCopy: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        trackAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        notifyOnAccess: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }>;
    security: z.ZodOptional<z.ZodObject<{
        dataClassification: z.ZodOptional<z.ZodEnum<["public", "internal", "confidential", "restricted"]>>;
        encryptionRequired: z.ZodOptional<z.ZodBoolean>;
        auditingEnabled: z.ZodOptional<z.ZodBoolean>;
        retentionPolicy: z.ZodOptional<z.ZodObject<{
            maxShareDuration: z.ZodNumber;
            autoExpire: z.ZodBoolean;
            dataRetentionDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }>>;
        accessControls: z.ZodOptional<z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        }, {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    }>>;
    collaborators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    contentType: "template" | "bundle" | "graph" | "dataset";
    contentId: string;
    sharing: {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    };
    description?: string | undefined;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    } | undefined;
    collaborators?: string[] | undefined;
}, {
    title: string;
    contentType: "template" | "bundle" | "graph" | "dataset";
    contentId: string;
    sharing: {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    };
    description?: string | undefined;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    } | undefined;
    collaborators?: string[] | undefined;
}>;
export declare const CreateShareResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    shareId: z.ZodString;
    shareUrl: z.ZodString;
    shareToken: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    shareUrl: string;
    shareToken: string;
    shareId: string;
    error?: string | undefined;
    expiresAt?: Date | undefined;
}, {
    success: boolean;
    shareUrl: string;
    shareToken: string;
    shareId: string;
    error?: string | undefined;
    expiresAt?: Date | undefined;
}>;
export declare const UpdateShareRequestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    sharing: z.ZodOptional<z.ZodObject<{
        accessLevel: z.ZodOptional<z.ZodEnum<["public", "restricted", "private"]>>;
        permissions: z.ZodOptional<z.ZodEnum<["view", "comment", "edit", "admin"]>>;
        collaborators: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        } & {
            role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            addedAt: z.ZodDate;
            permissions: z.ZodArray<z.ZodString, "many">;
            invitedBy: z.ZodString;
            acceptedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }>, "many">>>;
        shareUrl: z.ZodOptional<z.ZodString>;
        shareToken: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
        passwordProtected: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowDownload: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowCopy: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        trackAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        notifyOnAccess: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        dataClassification: z.ZodOptional<z.ZodEnum<["public", "internal", "confidential", "restricted"]>>;
        encryptionRequired: z.ZodOptional<z.ZodBoolean>;
        auditingEnabled: z.ZodOptional<z.ZodBoolean>;
        retentionPolicy: z.ZodOptional<z.ZodObject<{
            maxShareDuration: z.ZodNumber;
            autoExpire: z.ZodBoolean;
            dataRetentionDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }>>;
        accessControls: z.ZodOptional<z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        }, {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    } | undefined;
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    } | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
        retentionPolicy?: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        } | undefined;
        encryptionRequired?: boolean | undefined;
        auditingEnabled?: boolean | undefined;
        accessControls?: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        } | undefined;
    } | undefined;
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment" | undefined;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        accessLevel?: "private" | "public" | "restricted" | undefined;
        shareUrl?: string | undefined;
        shareToken?: string | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    } | undefined;
}>;
export declare const ShareAccessRequestSchema: z.ZodObject<{
    shareToken: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodString;
    ipAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ipAddress: string;
    userAgent: string;
    shareToken: string;
    password?: string | undefined;
}, {
    ipAddress: string;
    userAgent: string;
    shareToken: string;
    password?: string | undefined;
}>;
export declare const ShareAccessResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    content: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        content: z.ZodAny;
        metadata: z.ZodObject<{
            exportId: z.ZodString;
            version: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            category: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            contentSize: z.ZodNumber;
            checksumMd5: z.ZodString;
            versionControl: z.ZodObject<{
                currentVersion: z.ZodString;
                versions: z.ZodArray<z.ZodObject<{
                    version: z.ZodString;
                    timestamp: z.ZodDate;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    changes: z.ZodArray<z.ZodString, "many">;
                    size: z.ZodNumber;
                    checksum: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }, {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }>, "many">;
                isLatest: z.ZodBoolean;
                changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    type: z.ZodEnum<["content", "metadata", "permissions"]>;
                    conflictingVersions: z.ZodArray<z.ZodString, "many">;
                    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                }, "strip", z.ZodTypeAny, {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }, {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            }, {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            }>;
            annotations: z.ZodObject<{
                connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    sourceNodeId: z.ZodString;
                    targetNodeId: z.ZodString;
                    label: z.ZodString;
                    color: z.ZodOptional<z.ZodString>;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }>, "many">>;
                stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                    content: z.ZodString;
                    color: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }, {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }>, "many">>;
                regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                    title: z.ZodString;
                    description: z.ZodOptional<z.ZodString>;
                    color: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }>, "many">>;
                comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    content: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodOptional<z.ZodDate>;
                    parentId: z.ZodOptional<z.ZodString>;
                    position: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                    }, {
                        x: number;
                        y: number;
                    }>>;
                    resolved: z.ZodDefault<z.ZodBoolean>;
                    resolvedBy: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>>;
                    resolvedAt: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            }, {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            tags: string[];
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            language?: string | undefined;
        }, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            tags?: string[] | undefined;
            language?: string | undefined;
        }>;
        sharing: z.ZodObject<{
            accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
            permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            } & {
                role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                addedAt: z.ZodDate;
                permissions: z.ZodArray<z.ZodString, "many">;
                invitedBy: z.ZodString;
                acceptedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }>, "many">>;
            shareUrl: z.ZodString;
            shareToken: z.ZodString;
            expiresAt: z.ZodOptional<z.ZodDate>;
            passwordProtected: z.ZodDefault<z.ZodBoolean>;
            allowDownload: z.ZodDefault<z.ZodBoolean>;
            allowCopy: z.ZodDefault<z.ZodBoolean>;
            trackAnalytics: z.ZodDefault<z.ZodBoolean>;
            notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            permissions: "view" | "edit" | "admin" | "comment";
            collaborators: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[];
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            passwordProtected: boolean;
            allowDownload: boolean;
            allowCopy: boolean;
            trackAnalytics: boolean;
            notifyOnAccess: boolean;
            expiresAt?: Date | undefined;
        }, {
            permissions: "view" | "edit" | "admin" | "comment";
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }>;
        security: z.ZodObject<{
            dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
            encryptionRequired: z.ZodBoolean;
            auditingEnabled: z.ZodBoolean;
            retentionPolicy: z.ZodObject<{
                maxShareDuration: z.ZodNumber;
                autoExpire: z.ZodBoolean;
                dataRetentionDays: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }>;
            accessControls: z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            }, {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        }, {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        }>;
        analytics: z.ZodObject<{
            views: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                viewerInfo: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                duration: z.ZodNumber;
                ipAddress: z.ZodString;
                userAgent: z.ZodString;
                referrer: z.ZodOptional<z.ZodString>;
                geolocation: z.ZodOptional<z.ZodObject<{
                    country: z.ZodString;
                    region: z.ZodString;
                    city: z.ZodString;
                    coordinates: z.ZodObject<{
                        lat: z.ZodNumber;
                        lng: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        lat: number;
                        lng: number;
                    }, {
                        lat: number;
                        lng: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }>, "many">>;
            downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                downloadedBy: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }>, "many">>;
            collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }>, "many">>;
            totalViews: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
            averageViewDuration: z.ZodNumber;
            peakConcurrentUsers: z.ZodNumber;
            geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
                country: z.ZodString;
                views: z.ZodNumber;
                uniqueViewers: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                country: string;
                views: number;
                uniqueViewers: number;
            }, {
                country: string;
                views: number;
                uniqueViewers: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        }, {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            tags: string[];
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            collaborators: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[];
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            passwordProtected: boolean;
            allowDownload: boolean;
            allowCopy: boolean;
            trackAnalytics: boolean;
            notifyOnAccess: boolean;
            expiresAt?: Date | undefined;
        };
        description?: string | undefined;
        content?: any;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            tags?: string[] | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        };
        description?: string | undefined;
        content?: any;
    }>>;
    permissions: z.ZodArray<z.ZodEnum<["view", "comment", "edit", "admin"]>, "many">;
    requiresPassword: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    analytics: z.ZodOptional<z.ZodObject<{
        viewCount: z.ZodNumber;
        lastAccessed: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        viewCount: number;
        lastAccessed: Date;
    }, {
        viewCount: number;
        lastAccessed: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    permissions: ("view" | "edit" | "admin" | "comment")[];
    requiresPassword: boolean;
    error?: string | undefined;
    content?: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            tags: string[];
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            collaborators: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[];
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            passwordProtected: boolean;
            allowDownload: boolean;
            allowCopy: boolean;
            trackAnalytics: boolean;
            notifyOnAccess: boolean;
            expiresAt?: Date | undefined;
        };
        description?: string | undefined;
        content?: any;
    } | undefined;
    analytics?: {
        viewCount: number;
        lastAccessed: Date;
    } | undefined;
}, {
    success: boolean;
    permissions: ("view" | "edit" | "admin" | "comment")[];
    requiresPassword: boolean;
    error?: string | undefined;
    content?: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            tags?: string[] | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        };
        description?: string | undefined;
        content?: any;
    } | undefined;
    analytics?: {
        viewCount: number;
        lastAccessed: Date;
    } | undefined;
}>;
export declare const SharePermissionRequestSchema: z.ZodObject<{
    shareId: z.ZodString;
    userId: z.ZodString;
    permission: z.ZodEnum<["view", "comment", "edit", "admin"]>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    permission: "view" | "edit" | "admin" | "comment";
    shareId: string;
    message?: string | undefined;
}, {
    userId: string;
    permission: "view" | "edit" | "admin" | "comment";
    shareId: string;
    message?: string | undefined;
}>;
export declare const ShareAnalyticsRequestSchema: z.ZodObject<{
    shareId: z.ZodString;
    timeRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["views", "downloads", "collaborations"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    shareId: string;
    metrics?: ("views" | "downloads" | "collaborations")[] | undefined;
    timeRange?: {
        start: Date;
        end: Date;
    } | undefined;
}, {
    shareId: string;
    metrics?: ("views" | "downloads" | "collaborations")[] | undefined;
    timeRange?: {
        start: Date;
        end: Date;
    } | undefined;
}>;
export declare const ShareAnalyticsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    analytics: z.ZodObject<{
        views: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            viewerInfo: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            duration: z.ZodNumber;
            ipAddress: z.ZodString;
            userAgent: z.ZodString;
            referrer: z.ZodOptional<z.ZodString>;
            geolocation: z.ZodOptional<z.ZodObject<{
                country: z.ZodString;
                region: z.ZodString;
                city: z.ZodString;
                coordinates: z.ZodObject<{
                    lat: z.ZodNumber;
                    lng: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    lat: number;
                    lng: number;
                }, {
                    lat: number;
                    lng: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }>, "many">>;
        downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            downloadedBy: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }>, "many">>;
        collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
            user: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }>, "many">>;
        totalViews: z.ZodNumber;
        uniqueViewers: z.ZodNumber;
        averageViewDuration: z.ZodNumber;
        peakConcurrentUsers: z.ZodNumber;
        geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            views: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            country: string;
            views: number;
            uniqueViewers: number;
        }, {
            country: string;
            views: number;
            uniqueViewers: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[];
        downloads: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[];
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        collaborations: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[];
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        geographicDistribution: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[];
        deviceStats: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[];
    }, {
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        views?: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[] | undefined;
        downloads?: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[] | undefined;
        collaborations?: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[] | undefined;
        geographicDistribution?: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[] | undefined;
        deviceStats?: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[] | undefined;
    }>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    analytics: {
        views: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[];
        downloads: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[];
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        collaborations: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[];
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        geographicDistribution: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[];
        deviceStats: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[];
    };
    error?: string | undefined;
}, {
    success: boolean;
    analytics: {
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        views?: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[] | undefined;
        downloads?: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[] | undefined;
        collaborations?: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[] | undefined;
        geographicDistribution?: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[] | undefined;
        deviceStats?: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[] | undefined;
    };
    error?: string | undefined;
}>;
export declare const SharingSystemConfigSchema: z.ZodObject<{
    maxShareDuration: z.ZodNumber;
    defaultAccessLevel: z.ZodEnum<["public", "restricted", "private"]>;
    allowAnonymousSharing: z.ZodBoolean;
    requireEmailVerification: z.ZodBoolean;
    maxCollaborators: z.ZodNumber;
    allowPasswordProtection: z.ZodBoolean;
    trackAnalyticsByDefault: z.ZodBoolean;
    defaultRetentionDays: z.ZodNumber;
    maxFileSizeForSharing: z.ZodNumber;
    supportedFormats: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    encryptionRequired: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    encryptionRequired: boolean;
    maxCollaborators: number;
    maxShareDuration: number;
    defaultAccessLevel: "private" | "public" | "restricted";
    allowAnonymousSharing: boolean;
    requireEmailVerification: boolean;
    allowPasswordProtection: boolean;
    trackAnalyticsByDefault: boolean;
    defaultRetentionDays: number;
    maxFileSizeForSharing: number;
    supportedFormats: string[];
}, {
    encryptionRequired: boolean;
    maxCollaborators: number;
    maxShareDuration: number;
    defaultAccessLevel: "private" | "public" | "restricted";
    allowAnonymousSharing: boolean;
    requireEmailVerification: boolean;
    allowPasswordProtection: boolean;
    trackAnalyticsByDefault: boolean;
    defaultRetentionDays: number;
    maxFileSizeForSharing: number;
    supportedFormats?: string[] | undefined;
}>;
export declare const ShareEventSchema: z.ZodObject<{
    type: z.ZodEnum<["share_created", "share_accessed", "share_downloaded", "share_expired", "share_revoked", "collaborator_added", "collaborator_removed", "permission_changed", "comment_added", "content_updated", "annotation_added"]>;
    shareId: z.ZodString;
    timestamp: z.ZodDate;
    user: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>>;
    data: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
    timestamp: Date;
    shareId: string;
    data?: any;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    } | undefined;
}, {
    type: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
    timestamp: Date;
    shareId: string;
    data?: any;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    } | undefined;
}>;
export declare function validateShareContent(content: unknown, type: string): boolean;
export declare function validateShareToken(token: string): boolean;
export declare function validatePassword(password: string): {
    valid: boolean;
    strength: 'weak' | 'medium' | 'strong';
};
export declare const SharingSchemas: {
    ShareAccessLevel: z.ZodEnum<["public", "restricted", "private"]>;
    SharePermission: z.ZodEnum<["view", "comment", "edit", "admin"]>;
    ShareStatus: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
    ContentType: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
    UserInfo: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        avatar?: string | undefined;
    }>;
    Collaborator: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    } & {
        role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        addedAt: z.ZodDate;
        permissions: z.ZodArray<z.ZodString, "many">;
        invitedBy: z.ZodString;
        acceptedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }, {
        id: string;
        name: string;
        email: string;
        role: "view" | "edit" | "admin" | "comment";
        permissions: string[];
        addedAt: Date;
        invitedBy: string;
        avatar?: string | undefined;
        acceptedAt?: Date | undefined;
    }>;
    SharingConfig: z.ZodObject<{
        accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
        permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        } & {
            role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            addedAt: z.ZodDate;
            permissions: z.ZodArray<z.ZodString, "many">;
            invitedBy: z.ZodString;
            acceptedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }>, "many">>;
        shareUrl: z.ZodString;
        shareToken: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodDate>;
        passwordProtected: z.ZodDefault<z.ZodBoolean>;
        allowDownload: z.ZodDefault<z.ZodBoolean>;
        allowCopy: z.ZodDefault<z.ZodBoolean>;
        trackAnalytics: z.ZodDefault<z.ZodBoolean>;
        notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        permissions: "view" | "edit" | "admin" | "comment";
        collaborators: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[];
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        passwordProtected: boolean;
        allowDownload: boolean;
        allowCopy: boolean;
        trackAnalytics: boolean;
        notifyOnAccess: boolean;
        expiresAt?: Date | undefined;
    }, {
        permissions: "view" | "edit" | "admin" | "comment";
        accessLevel: "private" | "public" | "restricted";
        shareUrl: string;
        shareToken: string;
        expiresAt?: Date | undefined;
        collaborators?: {
            id: string;
            name: string;
            email: string;
            role: "view" | "edit" | "admin" | "comment";
            permissions: string[];
            addedAt: Date;
            invitedBy: string;
            avatar?: string | undefined;
            acceptedAt?: Date | undefined;
        }[] | undefined;
        passwordProtected?: boolean | undefined;
        allowDownload?: boolean | undefined;
        allowCopy?: boolean | undefined;
        trackAnalytics?: boolean | undefined;
        notifyOnAccess?: boolean | undefined;
    }>;
    ShareSecurityConfig: z.ZodObject<{
        dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
        encryptionRequired: z.ZodBoolean;
        auditingEnabled: z.ZodBoolean;
        retentionPolicy: z.ZodObject<{
            maxShareDuration: z.ZodNumber;
            autoExpire: z.ZodBoolean;
            dataRetentionDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }, {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        }>;
        accessControls: z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        }, {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            ipWhitelist: string[];
            geoRestrictions: string[];
            sessionTimeout?: number | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    }, {
        dataClassification: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy: {
            maxShareDuration: number;
            autoExpire: boolean;
            dataRetentionDays: number;
        };
        encryptionRequired: boolean;
        auditingEnabled: boolean;
        accessControls: {
            requireAuthentication: boolean;
            sessionTimeout?: number | undefined;
            ipWhitelist?: string[] | undefined;
            geoRestrictions?: string[] | undefined;
            maxConcurrentUsers?: number | undefined;
        };
    }>;
    SharingSystemConfig: z.ZodObject<{
        maxShareDuration: z.ZodNumber;
        defaultAccessLevel: z.ZodEnum<["public", "restricted", "private"]>;
        allowAnonymousSharing: z.ZodBoolean;
        requireEmailVerification: z.ZodBoolean;
        maxCollaborators: z.ZodNumber;
        allowPasswordProtection: z.ZodBoolean;
        trackAnalyticsByDefault: z.ZodBoolean;
        defaultRetentionDays: z.ZodNumber;
        maxFileSizeForSharing: z.ZodNumber;
        supportedFormats: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        encryptionRequired: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        encryptionRequired: boolean;
        maxCollaborators: number;
        maxShareDuration: number;
        defaultAccessLevel: "private" | "public" | "restricted";
        allowAnonymousSharing: boolean;
        requireEmailVerification: boolean;
        allowPasswordProtection: boolean;
        trackAnalyticsByDefault: boolean;
        defaultRetentionDays: number;
        maxFileSizeForSharing: number;
        supportedFormats: string[];
    }, {
        encryptionRequired: boolean;
        maxCollaborators: number;
        maxShareDuration: number;
        defaultAccessLevel: "private" | "public" | "restricted";
        allowAnonymousSharing: boolean;
        requireEmailVerification: boolean;
        allowPasswordProtection: boolean;
        trackAnalyticsByDefault: boolean;
        defaultRetentionDays: number;
        maxFileSizeForSharing: number;
        supportedFormats?: string[] | undefined;
    }>;
    SharedContent: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        content: z.ZodAny;
        metadata: z.ZodObject<{
            exportId: z.ZodString;
            version: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            category: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            contentSize: z.ZodNumber;
            checksumMd5: z.ZodString;
            versionControl: z.ZodObject<{
                currentVersion: z.ZodString;
                versions: z.ZodArray<z.ZodObject<{
                    version: z.ZodString;
                    timestamp: z.ZodDate;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    changes: z.ZodArray<z.ZodString, "many">;
                    size: z.ZodNumber;
                    checksum: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }, {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }>, "many">;
                isLatest: z.ZodBoolean;
                changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    type: z.ZodEnum<["content", "metadata", "permissions"]>;
                    conflictingVersions: z.ZodArray<z.ZodString, "many">;
                    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                }, "strip", z.ZodTypeAny, {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }, {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            }, {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            }>;
            annotations: z.ZodObject<{
                connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    sourceNodeId: z.ZodString;
                    targetNodeId: z.ZodString;
                    label: z.ZodString;
                    color: z.ZodOptional<z.ZodString>;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }>, "many">>;
                stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                    content: z.ZodString;
                    color: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }, {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }>, "many">>;
                regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                    title: z.ZodString;
                    description: z.ZodOptional<z.ZodString>;
                    color: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }>, "many">>;
                comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    content: z.ZodString;
                    author: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodOptional<z.ZodDate>;
                    parentId: z.ZodOptional<z.ZodString>;
                    position: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                    }, {
                        x: number;
                        y: number;
                    }>>;
                    resolved: z.ZodDefault<z.ZodBoolean>;
                    resolvedBy: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>>;
                    resolvedAt: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }, {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            }, {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            tags: string[];
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            language?: string | undefined;
        }, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            tags?: string[] | undefined;
            language?: string | undefined;
        }>;
        sharing: z.ZodObject<{
            accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
            permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
            collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            } & {
                role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                addedAt: z.ZodDate;
                permissions: z.ZodArray<z.ZodString, "many">;
                invitedBy: z.ZodString;
                acceptedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }>, "many">>;
            shareUrl: z.ZodString;
            shareToken: z.ZodString;
            expiresAt: z.ZodOptional<z.ZodDate>;
            passwordProtected: z.ZodDefault<z.ZodBoolean>;
            allowDownload: z.ZodDefault<z.ZodBoolean>;
            allowCopy: z.ZodDefault<z.ZodBoolean>;
            trackAnalytics: z.ZodDefault<z.ZodBoolean>;
            notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            permissions: "view" | "edit" | "admin" | "comment";
            collaborators: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[];
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            passwordProtected: boolean;
            allowDownload: boolean;
            allowCopy: boolean;
            trackAnalytics: boolean;
            notifyOnAccess: boolean;
            expiresAt?: Date | undefined;
        }, {
            permissions: "view" | "edit" | "admin" | "comment";
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }>;
        security: z.ZodObject<{
            dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
            encryptionRequired: z.ZodBoolean;
            auditingEnabled: z.ZodBoolean;
            retentionPolicy: z.ZodObject<{
                maxShareDuration: z.ZodNumber;
                autoExpire: z.ZodBoolean;
                dataRetentionDays: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }>;
            accessControls: z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            }, {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        }, {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        }>;
        analytics: z.ZodObject<{
            views: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                viewerInfo: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                duration: z.ZodNumber;
                ipAddress: z.ZodString;
                userAgent: z.ZodString;
                referrer: z.ZodOptional<z.ZodString>;
                geolocation: z.ZodOptional<z.ZodObject<{
                    country: z.ZodString;
                    region: z.ZodString;
                    city: z.ZodString;
                    coordinates: z.ZodObject<{
                        lat: z.ZodNumber;
                        lng: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        lat: number;
                        lng: number;
                    }, {
                        lat: number;
                        lng: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }>, "many">>;
            downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                downloadedBy: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }>, "many">>;
            collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }>, "many">>;
            totalViews: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
            averageViewDuration: z.ZodNumber;
            peakConcurrentUsers: z.ZodNumber;
            geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
                country: z.ZodString;
                views: z.ZodNumber;
                uniqueViewers: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                country: string;
                views: number;
                uniqueViewers: number;
            }, {
                country: string;
                views: number;
                uniqueViewers: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        }, {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            tags: string[];
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[];
                connectionLabels: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[];
                regions: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[];
                comments: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    resolved: boolean;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[];
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            collaborators: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[];
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            passwordProtected: boolean;
            allowDownload: boolean;
            allowCopy: boolean;
            trackAnalytics: boolean;
            notifyOnAccess: boolean;
            expiresAt?: Date | undefined;
        };
        description?: string | undefined;
        content?: any;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "active" | "expired" | "pending" | "revoked";
        type: "template" | "bundle" | "graph" | "dataset";
        metadata: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            annotations: {
                stickyNotes?: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                }[] | undefined;
                connectionLabels?: {
                    id: string;
                    createdAt: Date;
                    label: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    sourceNodeId: string;
                    targetNodeId: string;
                    color?: string | undefined;
                }[] | undefined;
                regions?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    color: string;
                    title: string;
                    description?: string | undefined;
                }[] | undefined;
                comments?: {
                    id: string;
                    createdAt: Date;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    content: string;
                    updatedAt?: Date | undefined;
                    position?: {
                        x: number;
                        y: number;
                    } | undefined;
                    parentId?: string | undefined;
                    resolved?: boolean | undefined;
                    resolvedAt?: Date | undefined;
                    resolvedBy?: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    } | undefined;
                }[] | undefined;
            };
            exportId: string;
            contentSize: number;
            checksumMd5: string;
            versionControl: {
                versions: {
                    version: string;
                    author: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    size: number;
                    timestamp: Date;
                    checksum: string;
                    changes: string[];
                }[];
                currentVersion: string;
                isLatest: boolean;
                changesFromPrevious?: string[] | undefined;
                mergeConflicts?: {
                    path: string;
                    type: "content" | "metadata" | "permissions";
                    conflictingVersions: string[];
                    resolution?: "auto" | "manual" | undefined;
                }[] | undefined;
            };
            category?: string | undefined;
            tags?: string[] | undefined;
            language?: string | undefined;
        };
        title: string;
        security: {
            dataClassification: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            };
            encryptionRequired: boolean;
            auditingEnabled: boolean;
            accessControls: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            };
        };
        analytics: {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        };
        sharing: {
            permissions: "view" | "edit" | "admin" | "comment";
            accessLevel: "private" | "public" | "restricted";
            shareUrl: string;
            shareToken: string;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        };
        description?: string | undefined;
        content?: any;
    }>;
    SharedContentMetadata: z.ZodObject<{
        exportId: z.ZodString;
        version: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        category: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        contentSize: z.ZodNumber;
        checksumMd5: z.ZodString;
        versionControl: z.ZodObject<{
            currentVersion: z.ZodString;
            versions: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                timestamp: z.ZodDate;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                changes: z.ZodArray<z.ZodString, "many">;
                size: z.ZodNumber;
                checksum: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }, {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }>, "many">;
            isLatest: z.ZodBoolean;
            changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                type: z.ZodEnum<["content", "metadata", "permissions"]>;
                conflictingVersions: z.ZodArray<z.ZodString, "many">;
                resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }, {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        }, {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        }>;
        annotations: z.ZodObject<{
            connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                sourceNodeId: z.ZodString;
                targetNodeId: z.ZodString;
                label: z.ZodString;
                color: z.ZodOptional<z.ZodString>;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }, {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }>, "many">>;
            stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                content: z.ZodString;
                color: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }, {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }>, "many">>;
            regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                color: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }>, "many">>;
            comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodOptional<z.ZodDate>;
                parentId: z.ZodOptional<z.ZodString>;
                position: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                }, {
                    x: number;
                    y: number;
                }>>;
                resolved: z.ZodDefault<z.ZodBoolean>;
                resolvedBy: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>>;
                resolvedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }, {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            stickyNotes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[];
            connectionLabels: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[];
            regions: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[];
            comments: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[];
        }, {
            stickyNotes?: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[] | undefined;
            connectionLabels?: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[] | undefined;
            regions?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[] | undefined;
            comments?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[];
            connectionLabels: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[];
            regions: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[];
            comments: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                resolved: boolean;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[];
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        language?: string | undefined;
    }, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        annotations: {
            stickyNotes?: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
            }[] | undefined;
            connectionLabels?: {
                id: string;
                createdAt: Date;
                label: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                sourceNodeId: string;
                targetNodeId: string;
                color?: string | undefined;
            }[] | undefined;
            regions?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                title: string;
                description?: string | undefined;
            }[] | undefined;
            comments?: {
                id: string;
                createdAt: Date;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                content: string;
                updatedAt?: Date | undefined;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                resolved?: boolean | undefined;
                resolvedAt?: Date | undefined;
                resolvedBy?: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        };
        exportId: string;
        contentSize: number;
        checksumMd5: string;
        versionControl: {
            versions: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                size: number;
                timestamp: Date;
                checksum: string;
                changes: string[];
            }[];
            currentVersion: string;
            isLatest: boolean;
            changesFromPrevious?: string[] | undefined;
            mergeConflicts?: {
                path: string;
                type: "content" | "metadata" | "permissions";
                conflictingVersions: string[];
                resolution?: "auto" | "manual" | undefined;
            }[] | undefined;
        };
        category?: string | undefined;
        tags?: string[] | undefined;
        language?: string | undefined;
    }>;
    VersionControl: z.ZodObject<{
        currentVersion: z.ZodString;
        versions: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            timestamp: z.ZodDate;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            changes: z.ZodArray<z.ZodString, "many">;
            size: z.ZodNumber;
            checksum: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }>, "many">;
        isLatest: z.ZodBoolean;
        changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodEnum<["content", "metadata", "permissions"]>;
            conflictingVersions: z.ZodArray<z.ZodString, "many">;
            resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }, {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    }, {
        versions: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            size: number;
            timestamp: Date;
            checksum: string;
            changes: string[];
        }[];
        currentVersion: string;
        isLatest: boolean;
        changesFromPrevious?: string[] | undefined;
        mergeConflicts?: {
            path: string;
            type: "content" | "metadata" | "permissions";
            conflictingVersions: string[];
            resolution?: "auto" | "manual" | undefined;
        }[] | undefined;
    }>;
    ContentAnnotations: z.ZodObject<{
        connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceNodeId: z.ZodString;
            targetNodeId: z.ZodString;
            label: z.ZodString;
            color: z.ZodOptional<z.ZodString>;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }, {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }>, "many">>;
        stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            content: z.ZodString;
            color: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }>, "many">>;
        regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }>, "many">>;
        comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodOptional<z.ZodDate>;
            parentId: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>>;
            resolved: z.ZodDefault<z.ZodBoolean>;
            resolvedBy: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>>;
            resolvedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            resolved: boolean;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }, {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolved?: boolean | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[];
        connectionLabels: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[];
        regions: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            resolved: boolean;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[];
    }, {
        stickyNotes?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[] | undefined;
        connectionLabels?: {
            id: string;
            createdAt: Date;
            label: string;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            sourceNodeId: string;
            targetNodeId: string;
            color?: string | undefined;
        }[] | undefined;
        regions?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            title: string;
            description?: string | undefined;
        }[] | undefined;
        comments?: {
            id: string;
            createdAt: Date;
            author: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            content: string;
            updatedAt?: Date | undefined;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            resolved?: boolean | undefined;
            resolvedAt?: Date | undefined;
            resolvedBy?: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            } | undefined;
        }[] | undefined;
    }>;
    ShareAnalytics: z.ZodObject<{
        views: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            viewerInfo: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            duration: z.ZodNumber;
            ipAddress: z.ZodString;
            userAgent: z.ZodString;
            referrer: z.ZodOptional<z.ZodString>;
            geolocation: z.ZodOptional<z.ZodObject<{
                country: z.ZodString;
                region: z.ZodString;
                city: z.ZodString;
                coordinates: z.ZodObject<{
                    lat: z.ZodNumber;
                    lng: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    lat: number;
                    lng: number;
                }, {
                    lat: number;
                    lng: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }, {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }, {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }>, "many">>;
        downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            downloadedBy: z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                isAuthenticated: z.ZodBoolean;
                sessionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }, {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }>, "many">>;
        collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
            user: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }, {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }>, "many">>;
        totalViews: z.ZodNumber;
        uniqueViewers: z.ZodNumber;
        averageViewDuration: z.ZodNumber;
        peakConcurrentUsers: z.ZodNumber;
        geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            views: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            country: string;
            views: number;
            uniqueViewers: number;
        }, {
            country: string;
            views: number;
            uniqueViewers: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }, {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }, {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[];
        downloads: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[];
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        collaborations: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[];
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        geographicDistribution: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[];
        deviceStats: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[];
    }, {
        conversionMetrics: {
            viewToDownload: number;
            viewToCollaboration: number;
            viewToSignup: number;
            averageTimeToAction: number;
        };
        totalViews: number;
        averageViewDuration: number;
        uniqueViewers: number;
        peakConcurrentUsers: number;
        views?: {
            id: string;
            timestamp: Date;
            duration: number;
            ipAddress: string;
            userAgent: string;
            viewerInfo: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            referrer?: string | undefined;
            geolocation?: {
                region: string;
                country: string;
                city: string;
                coordinates: {
                    lat: number;
                    lng: number;
                };
            } | undefined;
        }[] | undefined;
        downloads?: {
            id: string;
            success: boolean;
            format: string;
            size: number;
            timestamp: Date;
            ipAddress: string;
            downloadedBy: {
                sessionId: string;
                isAuthenticated: boolean;
                id?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            };
            errorReason?: string | undefined;
        }[] | undefined;
        collaborations?: {
            id: string;
            type: "edit" | "comment" | "annotation" | "permission_change";
            timestamp: Date;
            user: {
                id: string;
                name: string;
                email: string;
                avatar?: string | undefined;
            };
            impact: "major" | "minor" | "breaking";
            details?: any;
        }[] | undefined;
        geographicDistribution?: {
            country: string;
            views: number;
            uniqueViewers: number;
        }[] | undefined;
        deviceStats?: {
            browser: string;
            deviceType: "mobile" | "desktop" | "tablet";
            views: number;
            operatingSystem: string;
        }[] | undefined;
    }>;
    ShareView: z.ZodObject<{
        id: z.ZodString;
        viewerInfo: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            isAuthenticated: z.ZodBoolean;
            sessionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        duration: z.ZodNumber;
        ipAddress: z.ZodString;
        userAgent: z.ZodString;
        referrer: z.ZodOptional<z.ZodString>;
        geolocation: z.ZodOptional<z.ZodObject<{
            country: z.ZodString;
            region: z.ZodString;
            city: z.ZodString;
            coordinates: z.ZodObject<{
                lat: z.ZodNumber;
                lng: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                lat: number;
                lng: number;
            }, {
                lat: number;
                lng: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }, {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }, {
        id: string;
        timestamp: Date;
        duration: number;
        ipAddress: string;
        userAgent: string;
        viewerInfo: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        referrer?: string | undefined;
        geolocation?: {
            region: string;
            country: string;
            city: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        } | undefined;
    }>;
    ShareDownload: z.ZodObject<{
        id: z.ZodString;
        downloadedBy: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            isAuthenticated: z.ZodBoolean;
            sessionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }, {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        format: z.ZodString;
        size: z.ZodNumber;
        ipAddress: z.ZodString;
        success: z.ZodBoolean;
        errorReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }, {
        id: string;
        success: boolean;
        format: string;
        size: number;
        timestamp: Date;
        ipAddress: string;
        downloadedBy: {
            sessionId: string;
            isAuthenticated: boolean;
            id?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
        };
        errorReason?: string | undefined;
    }>;
    CollaborationEvent: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>;
        timestamp: z.ZodDate;
        details: z.ZodAny;
        impact: z.ZodEnum<["minor", "major", "breaking"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }, {
        id: string;
        type: "edit" | "comment" | "annotation" | "permission_change";
        timestamp: Date;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        };
        impact: "major" | "minor" | "breaking";
        details?: any;
    }>;
    CreateShareRequest: z.ZodObject<{
        contentId: z.ZodString;
        contentType: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sharing: z.ZodObject<{
            accessLevel: z.ZodOptional<z.ZodEnum<["public", "restricted", "private"]>>;
            permissions: z.ZodOptional<z.ZodEnum<["view", "comment", "edit", "admin"]>>;
            collaborators: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            } & {
                role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                addedAt: z.ZodDate;
                permissions: z.ZodArray<z.ZodString, "many">;
                invitedBy: z.ZodString;
                acceptedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }>, "many">>>;
            shareUrl: z.ZodOptional<z.ZodString>;
            shareToken: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
            passwordProtected: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            allowDownload: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            allowCopy: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            trackAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            notifyOnAccess: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }>;
        security: z.ZodOptional<z.ZodObject<{
            dataClassification: z.ZodOptional<z.ZodEnum<["public", "internal", "confidential", "restricted"]>>;
            encryptionRequired: z.ZodOptional<z.ZodBoolean>;
            auditingEnabled: z.ZodOptional<z.ZodBoolean>;
            retentionPolicy: z.ZodOptional<z.ZodObject<{
                maxShareDuration: z.ZodNumber;
                autoExpire: z.ZodBoolean;
                dataRetentionDays: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }>>;
            accessControls: z.ZodOptional<z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            }, {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        }>>;
        collaborators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        contentType: "template" | "bundle" | "graph" | "dataset";
        contentId: string;
        sharing: {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        };
        description?: string | undefined;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        } | undefined;
        collaborators?: string[] | undefined;
    }, {
        title: string;
        contentType: "template" | "bundle" | "graph" | "dataset";
        contentId: string;
        sharing: {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        };
        description?: string | undefined;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        } | undefined;
        collaborators?: string[] | undefined;
    }>;
    CreateShareResponse: z.ZodObject<{
        success: z.ZodBoolean;
        shareId: z.ZodString;
        shareUrl: z.ZodString;
        shareToken: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodDate>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        success: boolean;
        shareUrl: string;
        shareToken: string;
        shareId: string;
        error?: string | undefined;
        expiresAt?: Date | undefined;
    }, {
        success: boolean;
        shareUrl: string;
        shareToken: string;
        shareId: string;
        error?: string | undefined;
        expiresAt?: Date | undefined;
    }>;
    UpdateShareRequest: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        sharing: z.ZodOptional<z.ZodObject<{
            accessLevel: z.ZodOptional<z.ZodEnum<["public", "restricted", "private"]>>;
            permissions: z.ZodOptional<z.ZodEnum<["view", "comment", "edit", "admin"]>>;
            collaborators: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            } & {
                role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                addedAt: z.ZodDate;
                permissions: z.ZodArray<z.ZodString, "many">;
                invitedBy: z.ZodString;
                acceptedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }, {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }>, "many">>>;
            shareUrl: z.ZodOptional<z.ZodString>;
            shareToken: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
            passwordProtected: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            allowDownload: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            allowCopy: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            trackAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            notifyOnAccess: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        }>>;
        security: z.ZodOptional<z.ZodObject<{
            dataClassification: z.ZodOptional<z.ZodEnum<["public", "internal", "confidential", "restricted"]>>;
            encryptionRequired: z.ZodOptional<z.ZodBoolean>;
            auditingEnabled: z.ZodOptional<z.ZodBoolean>;
            retentionPolicy: z.ZodOptional<z.ZodObject<{
                maxShareDuration: z.ZodNumber;
                autoExpire: z.ZodBoolean;
                dataRetentionDays: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }, {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            }>>;
            accessControls: z.ZodOptional<z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            }, {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        title?: string | undefined;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                ipWhitelist: string[];
                geoRestrictions: string[];
                sessionTimeout?: number | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        } | undefined;
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        } | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential" | undefined;
            retentionPolicy?: {
                maxShareDuration: number;
                autoExpire: boolean;
                dataRetentionDays: number;
            } | undefined;
            encryptionRequired?: boolean | undefined;
            auditingEnabled?: boolean | undefined;
            accessControls?: {
                requireAuthentication: boolean;
                sessionTimeout?: number | undefined;
                ipWhitelist?: string[] | undefined;
                geoRestrictions?: string[] | undefined;
                maxConcurrentUsers?: number | undefined;
            } | undefined;
        } | undefined;
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment" | undefined;
            expiresAt?: Date | undefined;
            collaborators?: {
                id: string;
                name: string;
                email: string;
                role: "view" | "edit" | "admin" | "comment";
                permissions: string[];
                addedAt: Date;
                invitedBy: string;
                avatar?: string | undefined;
                acceptedAt?: Date | undefined;
            }[] | undefined;
            accessLevel?: "private" | "public" | "restricted" | undefined;
            shareUrl?: string | undefined;
            shareToken?: string | undefined;
            passwordProtected?: boolean | undefined;
            allowDownload?: boolean | undefined;
            allowCopy?: boolean | undefined;
            trackAnalytics?: boolean | undefined;
            notifyOnAccess?: boolean | undefined;
        } | undefined;
    }>;
    ShareAccessRequest: z.ZodObject<{
        shareToken: z.ZodString;
        password: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodString;
        ipAddress: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ipAddress: string;
        userAgent: string;
        shareToken: string;
        password?: string | undefined;
    }, {
        ipAddress: string;
        userAgent: string;
        shareToken: string;
        password?: string | undefined;
    }>;
    ShareAccessResponse: z.ZodObject<{
        success: z.ZodBoolean;
        content: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            content: z.ZodAny;
            metadata: z.ZodObject<{
                exportId: z.ZodString;
                version: z.ZodString;
                author: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                category: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                contentSize: z.ZodNumber;
                checksumMd5: z.ZodString;
                versionControl: z.ZodObject<{
                    currentVersion: z.ZodString;
                    versions: z.ZodArray<z.ZodObject<{
                        version: z.ZodString;
                        timestamp: z.ZodDate;
                        author: z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>;
                        changes: z.ZodArray<z.ZodString, "many">;
                        size: z.ZodNumber;
                        checksum: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }, {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }>, "many">;
                    isLatest: z.ZodBoolean;
                    changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        path: z.ZodString;
                        type: z.ZodEnum<["content", "metadata", "permissions"]>;
                        conflictingVersions: z.ZodArray<z.ZodString, "many">;
                        resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                    }, "strip", z.ZodTypeAny, {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }, {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                }, {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                }>;
                annotations: z.ZodObject<{
                    connectionLabels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        sourceNodeId: z.ZodString;
                        targetNodeId: z.ZodString;
                        label: z.ZodString;
                        color: z.ZodOptional<z.ZodString>;
                        author: z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>;
                        createdAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }, {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }>, "many">>;
                    stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                        content: z.ZodString;
                        color: z.ZodString;
                        author: z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>;
                        createdAt: z.ZodDate;
                        updatedAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }, {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }>, "many">>;
                    regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                        title: z.ZodString;
                        description: z.ZodOptional<z.ZodString>;
                        color: z.ZodString;
                        author: z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>;
                        createdAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }, {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }>, "many">>;
                    comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        content: z.ZodString;
                        author: z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>;
                        createdAt: z.ZodDate;
                        updatedAt: z.ZodOptional<z.ZodDate>;
                        parentId: z.ZodOptional<z.ZodString>;
                        position: z.ZodOptional<z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            x: number;
                            y: number;
                        }, {
                            x: number;
                            y: number;
                        }>>;
                        resolved: z.ZodDefault<z.ZodBoolean>;
                        resolvedBy: z.ZodOptional<z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }, {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        }>>;
                        resolvedAt: z.ZodOptional<z.ZodDate>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        resolved: boolean;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }, {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolved?: boolean | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    stickyNotes: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[];
                    connectionLabels: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[];
                    regions: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[];
                    comments: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        resolved: boolean;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[];
                }, {
                    stickyNotes?: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[] | undefined;
                    connectionLabels?: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[] | undefined;
                    regions?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[] | undefined;
                    comments?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolved?: boolean | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[] | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                tags: string[];
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[];
                    connectionLabels: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[];
                    regions: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[];
                    comments: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        resolved: boolean;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[];
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                language?: string | undefined;
            }, {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes?: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[] | undefined;
                    connectionLabels?: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[] | undefined;
                    regions?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[] | undefined;
                    comments?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolved?: boolean | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[] | undefined;
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                tags?: string[] | undefined;
                language?: string | undefined;
            }>;
            sharing: z.ZodObject<{
                accessLevel: z.ZodEnum<["public", "restricted", "private"]>;
                permissions: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                } & {
                    role: z.ZodEnum<["view", "comment", "edit", "admin"]>;
                    addedAt: z.ZodDate;
                    permissions: z.ZodArray<z.ZodString, "many">;
                    invitedBy: z.ZodString;
                    acceptedAt: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }>, "many">>;
                shareUrl: z.ZodString;
                shareToken: z.ZodString;
                expiresAt: z.ZodOptional<z.ZodDate>;
                passwordProtected: z.ZodDefault<z.ZodBoolean>;
                allowDownload: z.ZodDefault<z.ZodBoolean>;
                allowCopy: z.ZodDefault<z.ZodBoolean>;
                trackAnalytics: z.ZodDefault<z.ZodBoolean>;
                notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                permissions: "view" | "edit" | "admin" | "comment";
                collaborators: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[];
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                passwordProtected: boolean;
                allowDownload: boolean;
                allowCopy: boolean;
                trackAnalytics: boolean;
                notifyOnAccess: boolean;
                expiresAt?: Date | undefined;
            }, {
                permissions: "view" | "edit" | "admin" | "comment";
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                expiresAt?: Date | undefined;
                collaborators?: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[] | undefined;
                passwordProtected?: boolean | undefined;
                allowDownload?: boolean | undefined;
                allowCopy?: boolean | undefined;
                trackAnalytics?: boolean | undefined;
                notifyOnAccess?: boolean | undefined;
            }>;
            security: z.ZodObject<{
                dataClassification: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
                encryptionRequired: z.ZodBoolean;
                auditingEnabled: z.ZodBoolean;
                retentionPolicy: z.ZodObject<{
                    maxShareDuration: z.ZodNumber;
                    autoExpire: z.ZodBoolean;
                    dataRetentionDays: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                }, {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                }>;
                accessControls: z.ZodObject<{
                    ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    requireAuthentication: z.ZodBoolean;
                    maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                    sessionTimeout: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    requireAuthentication: boolean;
                    ipWhitelist: string[];
                    geoRestrictions: string[];
                    sessionTimeout?: number | undefined;
                    maxConcurrentUsers?: number | undefined;
                }, {
                    requireAuthentication: boolean;
                    sessionTimeout?: number | undefined;
                    ipWhitelist?: string[] | undefined;
                    geoRestrictions?: string[] | undefined;
                    maxConcurrentUsers?: number | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    ipWhitelist: string[];
                    geoRestrictions: string[];
                    sessionTimeout?: number | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            }, {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    sessionTimeout?: number | undefined;
                    ipWhitelist?: string[] | undefined;
                    geoRestrictions?: string[] | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            }>;
            analytics: z.ZodObject<{
                views: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    viewerInfo: z.ZodObject<{
                        id: z.ZodOptional<z.ZodString>;
                        email: z.ZodOptional<z.ZodString>;
                        name: z.ZodOptional<z.ZodString>;
                        isAuthenticated: z.ZodBoolean;
                        sessionId: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    }, {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    }>;
                    timestamp: z.ZodDate;
                    duration: z.ZodNumber;
                    ipAddress: z.ZodString;
                    userAgent: z.ZodString;
                    referrer: z.ZodOptional<z.ZodString>;
                    geolocation: z.ZodOptional<z.ZodObject<{
                        country: z.ZodString;
                        region: z.ZodString;
                        city: z.ZodString;
                        coordinates: z.ZodObject<{
                            lat: z.ZodNumber;
                            lng: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            lat: number;
                            lng: number;
                        }, {
                            lat: number;
                            lng: number;
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    }, {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }, {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }>, "many">>;
                downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    downloadedBy: z.ZodObject<{
                        id: z.ZodOptional<z.ZodString>;
                        email: z.ZodOptional<z.ZodString>;
                        name: z.ZodOptional<z.ZodString>;
                        isAuthenticated: z.ZodBoolean;
                        sessionId: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    }, {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    }>;
                    timestamp: z.ZodDate;
                    format: z.ZodString;
                    size: z.ZodNumber;
                    ipAddress: z.ZodString;
                    success: z.ZodBoolean;
                    errorReason: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }, {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }>, "many">>;
                collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
                    user: z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }, {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    }>;
                    timestamp: z.ZodDate;
                    details: z.ZodAny;
                    impact: z.ZodEnum<["minor", "major", "breaking"]>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }, {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }>, "many">>;
                totalViews: z.ZodNumber;
                uniqueViewers: z.ZodNumber;
                averageViewDuration: z.ZodNumber;
                peakConcurrentUsers: z.ZodNumber;
                geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    country: z.ZodString;
                    views: z.ZodNumber;
                    uniqueViewers: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }, {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }>, "many">>;
                deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                    operatingSystem: z.ZodString;
                    browser: z.ZodString;
                    views: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }, {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }>, "many">>;
                conversionMetrics: z.ZodObject<{
                    viewToDownload: z.ZodNumber;
                    viewToCollaboration: z.ZodNumber;
                    viewToSignup: z.ZodNumber;
                    averageTimeToAction: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                }, {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                views: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[];
                downloads: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[];
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                collaborations: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[];
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                geographicDistribution: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[];
                deviceStats: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[];
            }, {
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                views?: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[] | undefined;
                downloads?: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[] | undefined;
                collaborations?: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[] | undefined;
                geographicDistribution?: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[] | undefined;
                deviceStats?: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[] | undefined;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: "active" | "expired" | "pending" | "revoked";
            type: "template" | "bundle" | "graph" | "dataset";
            metadata: {
                tags: string[];
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[];
                    connectionLabels: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[];
                    regions: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[];
                    comments: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        resolved: boolean;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[];
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                language?: string | undefined;
            };
            title: string;
            security: {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    ipWhitelist: string[];
                    geoRestrictions: string[];
                    sessionTimeout?: number | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            };
            analytics: {
                views: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[];
                downloads: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[];
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                collaborations: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[];
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                geographicDistribution: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[];
                deviceStats: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[];
            };
            sharing: {
                permissions: "view" | "edit" | "admin" | "comment";
                collaborators: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[];
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                passwordProtected: boolean;
                allowDownload: boolean;
                allowCopy: boolean;
                trackAnalytics: boolean;
                notifyOnAccess: boolean;
                expiresAt?: Date | undefined;
            };
            description?: string | undefined;
            content?: any;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: "active" | "expired" | "pending" | "revoked";
            type: "template" | "bundle" | "graph" | "dataset";
            metadata: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes?: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[] | undefined;
                    connectionLabels?: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[] | undefined;
                    regions?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[] | undefined;
                    comments?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolved?: boolean | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[] | undefined;
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                tags?: string[] | undefined;
                language?: string | undefined;
            };
            title: string;
            security: {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    sessionTimeout?: number | undefined;
                    ipWhitelist?: string[] | undefined;
                    geoRestrictions?: string[] | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            };
            analytics: {
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                views?: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[] | undefined;
                downloads?: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[] | undefined;
                collaborations?: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[] | undefined;
                geographicDistribution?: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[] | undefined;
                deviceStats?: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[] | undefined;
            };
            sharing: {
                permissions: "view" | "edit" | "admin" | "comment";
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                expiresAt?: Date | undefined;
                collaborators?: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[] | undefined;
                passwordProtected?: boolean | undefined;
                allowDownload?: boolean | undefined;
                allowCopy?: boolean | undefined;
                trackAnalytics?: boolean | undefined;
                notifyOnAccess?: boolean | undefined;
            };
            description?: string | undefined;
            content?: any;
        }>>;
        permissions: z.ZodArray<z.ZodEnum<["view", "comment", "edit", "admin"]>, "many">;
        requiresPassword: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
        analytics: z.ZodOptional<z.ZodObject<{
            viewCount: z.ZodNumber;
            lastAccessed: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            viewCount: number;
            lastAccessed: Date;
        }, {
            viewCount: number;
            lastAccessed: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        success: boolean;
        permissions: ("view" | "edit" | "admin" | "comment")[];
        requiresPassword: boolean;
        error?: string | undefined;
        content?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: "active" | "expired" | "pending" | "revoked";
            type: "template" | "bundle" | "graph" | "dataset";
            metadata: {
                tags: string[];
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[];
                    connectionLabels: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[];
                    regions: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[];
                    comments: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        resolved: boolean;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[];
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                language?: string | undefined;
            };
            title: string;
            security: {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    ipWhitelist: string[];
                    geoRestrictions: string[];
                    sessionTimeout?: number | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            };
            analytics: {
                views: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[];
                downloads: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[];
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                collaborations: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[];
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                geographicDistribution: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[];
                deviceStats: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[];
            };
            sharing: {
                permissions: "view" | "edit" | "admin" | "comment";
                collaborators: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[];
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                passwordProtected: boolean;
                allowDownload: boolean;
                allowCopy: boolean;
                trackAnalytics: boolean;
                notifyOnAccess: boolean;
                expiresAt?: Date | undefined;
            };
            description?: string | undefined;
            content?: any;
        } | undefined;
        analytics?: {
            viewCount: number;
            lastAccessed: Date;
        } | undefined;
    }, {
        success: boolean;
        permissions: ("view" | "edit" | "admin" | "comment")[];
        requiresPassword: boolean;
        error?: string | undefined;
        content?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: "active" | "expired" | "pending" | "revoked";
            type: "template" | "bundle" | "graph" | "dataset";
            metadata: {
                version: string;
                author: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                annotations: {
                    stickyNotes?: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                    }[] | undefined;
                    connectionLabels?: {
                        id: string;
                        createdAt: Date;
                        label: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        sourceNodeId: string;
                        targetNodeId: string;
                        color?: string | undefined;
                    }[] | undefined;
                    regions?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        color: string;
                        title: string;
                        description?: string | undefined;
                    }[] | undefined;
                    comments?: {
                        id: string;
                        createdAt: Date;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        content: string;
                        updatedAt?: Date | undefined;
                        position?: {
                            x: number;
                            y: number;
                        } | undefined;
                        parentId?: string | undefined;
                        resolved?: boolean | undefined;
                        resolvedAt?: Date | undefined;
                        resolvedBy?: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        } | undefined;
                    }[] | undefined;
                };
                exportId: string;
                contentSize: number;
                checksumMd5: string;
                versionControl: {
                    versions: {
                        version: string;
                        author: {
                            id: string;
                            name: string;
                            email: string;
                            avatar?: string | undefined;
                        };
                        size: number;
                        timestamp: Date;
                        checksum: string;
                        changes: string[];
                    }[];
                    currentVersion: string;
                    isLatest: boolean;
                    changesFromPrevious?: string[] | undefined;
                    mergeConflicts?: {
                        path: string;
                        type: "content" | "metadata" | "permissions";
                        conflictingVersions: string[];
                        resolution?: "auto" | "manual" | undefined;
                    }[] | undefined;
                };
                category?: string | undefined;
                tags?: string[] | undefined;
                language?: string | undefined;
            };
            title: string;
            security: {
                dataClassification: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy: {
                    maxShareDuration: number;
                    autoExpire: boolean;
                    dataRetentionDays: number;
                };
                encryptionRequired: boolean;
                auditingEnabled: boolean;
                accessControls: {
                    requireAuthentication: boolean;
                    sessionTimeout?: number | undefined;
                    ipWhitelist?: string[] | undefined;
                    geoRestrictions?: string[] | undefined;
                    maxConcurrentUsers?: number | undefined;
                };
            };
            analytics: {
                conversionMetrics: {
                    viewToDownload: number;
                    viewToCollaboration: number;
                    viewToSignup: number;
                    averageTimeToAction: number;
                };
                totalViews: number;
                averageViewDuration: number;
                uniqueViewers: number;
                peakConcurrentUsers: number;
                views?: {
                    id: string;
                    timestamp: Date;
                    duration: number;
                    ipAddress: string;
                    userAgent: string;
                    viewerInfo: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    referrer?: string | undefined;
                    geolocation?: {
                        region: string;
                        country: string;
                        city: string;
                        coordinates: {
                            lat: number;
                            lng: number;
                        };
                    } | undefined;
                }[] | undefined;
                downloads?: {
                    id: string;
                    success: boolean;
                    format: string;
                    size: number;
                    timestamp: Date;
                    ipAddress: string;
                    downloadedBy: {
                        sessionId: string;
                        isAuthenticated: boolean;
                        id?: string | undefined;
                        name?: string | undefined;
                        email?: string | undefined;
                    };
                    errorReason?: string | undefined;
                }[] | undefined;
                collaborations?: {
                    id: string;
                    type: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp: Date;
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        avatar?: string | undefined;
                    };
                    impact: "major" | "minor" | "breaking";
                    details?: any;
                }[] | undefined;
                geographicDistribution?: {
                    country: string;
                    views: number;
                    uniqueViewers: number;
                }[] | undefined;
                deviceStats?: {
                    browser: string;
                    deviceType: "mobile" | "desktop" | "tablet";
                    views: number;
                    operatingSystem: string;
                }[] | undefined;
            };
            sharing: {
                permissions: "view" | "edit" | "admin" | "comment";
                accessLevel: "private" | "public" | "restricted";
                shareUrl: string;
                shareToken: string;
                expiresAt?: Date | undefined;
                collaborators?: {
                    id: string;
                    name: string;
                    email: string;
                    role: "view" | "edit" | "admin" | "comment";
                    permissions: string[];
                    addedAt: Date;
                    invitedBy: string;
                    avatar?: string | undefined;
                    acceptedAt?: Date | undefined;
                }[] | undefined;
                passwordProtected?: boolean | undefined;
                allowDownload?: boolean | undefined;
                allowCopy?: boolean | undefined;
                trackAnalytics?: boolean | undefined;
                notifyOnAccess?: boolean | undefined;
            };
            description?: string | undefined;
            content?: any;
        } | undefined;
        analytics?: {
            viewCount: number;
            lastAccessed: Date;
        } | undefined;
    }>;
    SharePermissionRequest: z.ZodObject<{
        shareId: z.ZodString;
        userId: z.ZodString;
        permission: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        permission: "view" | "edit" | "admin" | "comment";
        shareId: string;
        message?: string | undefined;
    }, {
        userId: string;
        permission: "view" | "edit" | "admin" | "comment";
        shareId: string;
        message?: string | undefined;
    }>;
    ShareAnalyticsRequest: z.ZodObject<{
        shareId: z.ZodString;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodDate;
            end: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            start: Date;
            end: Date;
        }, {
            start: Date;
            end: Date;
        }>>;
        metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["views", "downloads", "collaborations"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        shareId: string;
        metrics?: ("views" | "downloads" | "collaborations")[] | undefined;
        timeRange?: {
            start: Date;
            end: Date;
        } | undefined;
    }, {
        shareId: string;
        metrics?: ("views" | "downloads" | "collaborations")[] | undefined;
        timeRange?: {
            start: Date;
            end: Date;
        } | undefined;
    }>;
    ShareAnalyticsResponse: z.ZodObject<{
        success: z.ZodBoolean;
        analytics: z.ZodObject<{
            views: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                viewerInfo: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                duration: z.ZodNumber;
                ipAddress: z.ZodString;
                userAgent: z.ZodString;
                referrer: z.ZodOptional<z.ZodString>;
                geolocation: z.ZodOptional<z.ZodObject<{
                    country: z.ZodString;
                    region: z.ZodString;
                    city: z.ZodString;
                    coordinates: z.ZodObject<{
                        lat: z.ZodNumber;
                        lng: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        lat: number;
                        lng: number;
                    }, {
                        lat: number;
                        lng: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }, {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }, {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }>, "many">>;
            downloads: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                downloadedBy: z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    email: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                    isAuthenticated: z.ZodBoolean;
                    sessionId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }, {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }, {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }>, "many">>;
            collaborations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["comment", "edit", "annotation", "permission_change"]>;
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }, {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }, {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }>, "many">>;
            totalViews: z.ZodNumber;
            uniqueViewers: z.ZodNumber;
            averageViewDuration: z.ZodNumber;
            peakConcurrentUsers: z.ZodNumber;
            geographicDistribution: z.ZodDefault<z.ZodArray<z.ZodObject<{
                country: z.ZodString;
                views: z.ZodNumber;
                uniqueViewers: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                country: string;
                views: number;
                uniqueViewers: number;
            }, {
                country: string;
                views: number;
                uniqueViewers: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }, {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }, {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        }, {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        }>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        success: boolean;
        analytics: {
            views: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[];
            downloads: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[];
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            collaborations: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[];
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            geographicDistribution: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[];
            deviceStats: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[];
        };
        error?: string | undefined;
    }, {
        success: boolean;
        analytics: {
            conversionMetrics: {
                viewToDownload: number;
                viewToCollaboration: number;
                viewToSignup: number;
                averageTimeToAction: number;
            };
            totalViews: number;
            averageViewDuration: number;
            uniqueViewers: number;
            peakConcurrentUsers: number;
            views?: {
                id: string;
                timestamp: Date;
                duration: number;
                ipAddress: string;
                userAgent: string;
                viewerInfo: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                referrer?: string | undefined;
                geolocation?: {
                    region: string;
                    country: string;
                    city: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                } | undefined;
            }[] | undefined;
            downloads?: {
                id: string;
                success: boolean;
                format: string;
                size: number;
                timestamp: Date;
                ipAddress: string;
                downloadedBy: {
                    sessionId: string;
                    isAuthenticated: boolean;
                    id?: string | undefined;
                    name?: string | undefined;
                    email?: string | undefined;
                };
                errorReason?: string | undefined;
            }[] | undefined;
            collaborations?: {
                id: string;
                type: "edit" | "comment" | "annotation" | "permission_change";
                timestamp: Date;
                user: {
                    id: string;
                    name: string;
                    email: string;
                    avatar?: string | undefined;
                };
                impact: "major" | "minor" | "breaking";
                details?: any;
            }[] | undefined;
            geographicDistribution?: {
                country: string;
                views: number;
                uniqueViewers: number;
            }[] | undefined;
            deviceStats?: {
                browser: string;
                deviceType: "mobile" | "desktop" | "tablet";
                views: number;
                operatingSystem: string;
            }[] | undefined;
        };
        error?: string | undefined;
    }>;
    ShareEvent: z.ZodObject<{
        type: z.ZodEnum<["share_created", "share_accessed", "share_downloaded", "share_expired", "share_revoked", "collaborator_added", "collaborator_removed", "permission_changed", "comment_added", "content_updated", "annotation_added"]>;
        shareId: z.ZodString;
        timestamp: z.ZodDate;
        user: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }, {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        }>>;
        data: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        type: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
        timestamp: Date;
        shareId: string;
        data?: any;
        user?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }, {
        type: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
        timestamp: Date;
        shareId: string;
        data?: any;
        user?: {
            id: string;
            name: string;
            email: string;
            avatar?: string | undefined;
        } | undefined;
    }>;
};
//# sourceMappingURL=sharing-schemas.d.ts.map