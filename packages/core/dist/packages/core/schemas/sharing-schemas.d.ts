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
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
}, {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
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
    id?: string;
    name?: string;
    email?: string;
    role?: "view" | "edit" | "admin" | "comment";
    permissions?: string[];
    avatar?: string;
    addedAt?: Date;
    invitedBy?: string;
    acceptedAt?: Date;
}, {
    id?: string;
    name?: string;
    email?: string;
    role?: "view" | "edit" | "admin" | "comment";
    permissions?: string[];
    avatar?: string;
    addedAt?: Date;
    invitedBy?: string;
    acceptedAt?: Date;
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
        maxShareDuration?: number;
        autoExpire?: boolean;
        dataRetentionDays?: number;
    }, {
        maxShareDuration?: number;
        autoExpire?: boolean;
        dataRetentionDays?: number;
    }>;
    accessControls: z.ZodObject<{
        ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        requireAuthentication: z.ZodBoolean;
        maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
        sessionTimeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requireAuthentication?: boolean;
        sessionTimeout?: number;
        ipWhitelist?: string[];
        geoRestrictions?: string[];
        maxConcurrentUsers?: number;
    }, {
        requireAuthentication?: boolean;
        sessionTimeout?: number;
        ipWhitelist?: string[];
        geoRestrictions?: string[];
        maxConcurrentUsers?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    dataClassification?: "public" | "internal" | "restricted" | "confidential";
    retentionPolicy?: {
        maxShareDuration?: number;
        autoExpire?: boolean;
        dataRetentionDays?: number;
    };
    accessControls?: {
        requireAuthentication?: boolean;
        sessionTimeout?: number;
        ipWhitelist?: string[];
        geoRestrictions?: string[];
        maxConcurrentUsers?: number;
    };
    encryptionRequired?: boolean;
    auditingEnabled?: boolean;
}, {
    dataClassification?: "public" | "internal" | "restricted" | "confidential";
    retentionPolicy?: {
        maxShareDuration?: number;
        autoExpire?: boolean;
        dataRetentionDays?: number;
    };
    accessControls?: {
        requireAuthentication?: boolean;
        sessionTimeout?: number;
        ipWhitelist?: string[];
        geoRestrictions?: string[];
        maxConcurrentUsers?: number;
    };
    encryptionRequired?: boolean;
    auditingEnabled?: boolean;
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
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
    }, {
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
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
    permissions?: "view" | "edit" | "admin" | "comment";
    expiresAt?: Date;
    collaborators?: {
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
    }[];
    accessLevel?: "private" | "public" | "restricted";
    shareUrl?: string;
    shareToken?: string;
    passwordProtected?: boolean;
    allowDownload?: boolean;
    allowCopy?: boolean;
    trackAnalytics?: boolean;
    notifyOnAccess?: boolean;
}, {
    permissions?: "view" | "edit" | "admin" | "comment";
    expiresAt?: Date;
    collaborators?: {
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
    }[];
    accessLevel?: "private" | "public" | "restricted";
    shareUrl?: string;
    shareToken?: string;
    passwordProtected?: boolean;
    allowDownload?: boolean;
    allowCopy?: boolean;
    trackAnalytics?: boolean;
    notifyOnAccess?: boolean;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    changes: z.ZodArray<z.ZodString, "many">;
    size: z.ZodNumber;
    checksum: z.ZodString;
}, "strip", z.ZodTypeAny, {
    size?: number;
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    timestamp?: Date;
    checksum?: string;
    changes?: string[];
}, {
    size?: number;
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    timestamp?: Date;
    checksum?: string;
    changes?: string[];
}>;
export declare const MergeConflictSchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodEnum<["content", "metadata", "permissions"]>;
    conflictingVersions: z.ZodArray<z.ZodString, "many">;
    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
}, "strip", z.ZodTypeAny, {
    path?: string;
    type?: "content" | "metadata" | "permissions";
    resolution?: "auto" | "manual";
    conflictingVersions?: string[];
}, {
    path?: string;
    type?: "content" | "metadata" | "permissions";
    resolution?: "auto" | "manual";
    conflictingVersions?: string[];
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        changes: z.ZodArray<z.ZodString, "many">;
        size: z.ZodNumber;
        checksum: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        size?: number;
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        timestamp?: Date;
        checksum?: string;
        changes?: string[];
    }, {
        size?: number;
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        timestamp?: Date;
        checksum?: string;
        changes?: string[];
    }>, "many">;
    isLatest: z.ZodBoolean;
    changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<["content", "metadata", "permissions"]>;
        conflictingVersions: z.ZodArray<z.ZodString, "many">;
        resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        type?: "content" | "metadata" | "permissions";
        resolution?: "auto" | "manual";
        conflictingVersions?: string[];
    }, {
        path?: string;
        type?: "content" | "metadata" | "permissions";
        resolution?: "auto" | "manual";
        conflictingVersions?: string[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    versions?: {
        size?: number;
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        timestamp?: Date;
        checksum?: string;
        changes?: string[];
    }[];
    currentVersion?: string;
    isLatest?: boolean;
    changesFromPrevious?: string[];
    mergeConflicts?: {
        path?: string;
        type?: "content" | "metadata" | "permissions";
        resolution?: "auto" | "manual";
        conflictingVersions?: string[];
    }[];
}, {
    versions?: {
        size?: number;
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        timestamp?: Date;
        checksum?: string;
        changes?: string[];
    }[];
    currentVersion?: string;
    isLatest?: boolean;
    changesFromPrevious?: string[];
    mergeConflicts?: {
        path?: string;
        type?: "content" | "metadata" | "permissions";
        resolution?: "auto" | "manual";
        conflictingVersions?: string[];
    }[];
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    label?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    color?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
}, {
    id?: string;
    createdAt?: Date;
    label?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    color?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    content?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    content?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    description?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    title?: string;
}, {
    id?: string;
    createdAt?: Date;
    description?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    title?: string;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodOptional<z.ZodDate>;
    parentId: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x?: number;
        y?: number;
    }, {
        x?: number;
        y?: number;
    }>>;
    resolved: z.ZodDefault<z.ZodBoolean>;
    resolvedBy: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>>;
    resolvedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    position?: {
        x?: number;
        y?: number;
    };
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    content?: string;
    parentId?: string;
    resolved?: boolean;
    resolvedAt?: Date;
    resolvedBy?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    position?: {
        x?: number;
        y?: number;
    };
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    content?: string;
    parentId?: string;
    resolved?: boolean;
    resolvedAt?: Date;
    resolvedBy?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        label?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        color?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
    }, {
        id?: string;
        createdAt?: Date;
        label?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        color?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        description?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
        title?: string;
    }, {
        id?: string;
        createdAt?: Date;
        description?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
        title?: string;
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodOptional<z.ZodDate>;
        parentId: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x?: number;
            y?: number;
        }, {
            x?: number;
            y?: number;
        }>>;
        resolved: z.ZodDefault<z.ZodBoolean>;
        resolvedBy: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>>;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        position?: {
            x?: number;
            y?: number;
        };
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        parentId?: string;
        resolved?: boolean;
        resolvedAt?: Date;
        resolvedBy?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        position?: {
            x?: number;
            y?: number;
        };
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        parentId?: string;
        resolved?: boolean;
        resolvedAt?: Date;
        resolvedBy?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    stickyNotes?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
    }[];
    connectionLabels?: {
        id?: string;
        createdAt?: Date;
        label?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        color?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
    }[];
    regions?: {
        id?: string;
        createdAt?: Date;
        description?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
        title?: string;
    }[];
    comments?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        position?: {
            x?: number;
            y?: number;
        };
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        parentId?: string;
        resolved?: boolean;
        resolvedAt?: Date;
        resolvedBy?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
    }[];
}, {
    stickyNotes?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
    }[];
    connectionLabels?: {
        id?: string;
        createdAt?: Date;
        label?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        color?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
    }[];
    regions?: {
        id?: string;
        createdAt?: Date;
        description?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
        title?: string;
    }[];
    comments?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        position?: {
            x?: number;
            y?: number;
        };
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        content?: string;
        parentId?: string;
        resolved?: boolean;
        resolvedAt?: Date;
        resolvedBy?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
    }[];
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            changes: z.ZodArray<z.ZodString, "many">;
            size: z.ZodNumber;
            checksum: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }, {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }>, "many">;
        isLatest: z.ZodBoolean;
        changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodEnum<["content", "metadata", "permissions"]>;
            conflictingVersions: z.ZodArray<z.ZodString, "many">;
            resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }, {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
    }, {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }, {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }, {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodOptional<z.ZodDate>;
            parentId: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x?: number;
                y?: number;
            }, {
                x?: number;
                y?: number;
            }>>;
            resolved: z.ZodDefault<z.ZodBoolean>;
            resolvedBy: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>>;
            resolvedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
    }, {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    category?: string;
    tags?: string[];
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    annotations?: {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
    };
    language?: string;
    exportId?: string;
    contentSize?: number;
    checksumMd5?: string;
    versionControl?: {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
    };
}, {
    category?: string;
    tags?: string[];
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    annotations?: {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
    };
    language?: string;
    exportId?: string;
    contentSize?: number;
    checksumMd5?: string;
    versionControl?: {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
    };
}>;
export declare const GeoLocationSchema: z.ZodObject<{
    country: z.ZodString;
    region: z.ZodString;
    city: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat?: number;
        lng?: number;
    }, {
        lat?: number;
        lng?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    region?: string;
    country?: string;
    city?: string;
    coordinates?: {
        lat?: number;
        lng?: number;
    };
}, {
    region?: string;
    country?: string;
    city?: string;
    coordinates?: {
        lat?: number;
        lng?: number;
    };
}>;
export declare const ViewerInfoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isAuthenticated: z.ZodBoolean;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    email?: string;
    sessionId?: string;
    isAuthenticated?: boolean;
}, {
    id?: string;
    name?: string;
    email?: string;
    sessionId?: string;
    isAuthenticated?: boolean;
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
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    }, {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
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
            lat?: number;
            lng?: number;
        }, {
            lat?: number;
            lng?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        region?: string;
        country?: string;
        city?: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    }, {
        region?: string;
        country?: string;
        city?: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    timestamp?: Date;
    duration?: number;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    geolocation?: {
        region?: string;
        country?: string;
        city?: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    };
    viewerInfo?: {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    };
}, {
    id?: string;
    timestamp?: Date;
    duration?: number;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    geolocation?: {
        region?: string;
        country?: string;
        city?: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    };
    viewerInfo?: {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    };
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
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    }, {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    }>;
    timestamp: z.ZodDate;
    format: z.ZodString;
    size: z.ZodNumber;
    ipAddress: z.ZodString;
    success: z.ZodBoolean;
    errorReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    format?: string;
    size?: number;
    timestamp?: Date;
    success?: boolean;
    ipAddress?: string;
    downloadedBy?: {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    };
    errorReason?: string;
}, {
    id?: string;
    format?: string;
    size?: number;
    timestamp?: Date;
    success?: boolean;
    ipAddress?: string;
    downloadedBy?: {
        id?: string;
        name?: string;
        email?: string;
        sessionId?: string;
        isAuthenticated?: boolean;
    };
    errorReason?: string;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>;
    timestamp: z.ZodDate;
    details: z.ZodAny;
    impact: z.ZodEnum<["minor", "major", "breaking"]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "edit" | "comment" | "annotation" | "permission_change";
    timestamp?: Date;
    details?: any;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    impact?: "major" | "minor" | "breaking";
}, {
    id?: string;
    type?: "edit" | "comment" | "annotation" | "permission_change";
    timestamp?: Date;
    details?: any;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    impact?: "major" | "minor" | "breaking";
}>;
export declare const GeographicStatsSchema: z.ZodObject<{
    country: z.ZodString;
    views: z.ZodNumber;
    uniqueViewers: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    country?: string;
    views?: number;
    uniqueViewers?: number;
}, {
    country?: string;
    views?: number;
    uniqueViewers?: number;
}>;
export declare const DeviceStatsSchema: z.ZodObject<{
    deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
    operatingSystem: z.ZodString;
    browser: z.ZodString;
    views: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    browser?: string;
    deviceType?: "mobile" | "desktop" | "tablet";
    views?: number;
    operatingSystem?: string;
}, {
    browser?: string;
    deviceType?: "mobile" | "desktop" | "tablet";
    views?: number;
    operatingSystem?: string;
}>;
export declare const ConversionMetricsSchema: z.ZodObject<{
    viewToDownload: z.ZodNumber;
    viewToCollaboration: z.ZodNumber;
    viewToSignup: z.ZodNumber;
    averageTimeToAction: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    viewToDownload?: number;
    viewToCollaboration?: number;
    viewToSignup?: number;
    averageTimeToAction?: number;
}, {
    viewToDownload?: number;
    viewToCollaboration?: number;
    viewToSignup?: number;
    averageTimeToAction?: number;
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
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }, {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
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
                lat?: number;
                lng?: number;
            }, {
                lat?: number;
                lng?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        }, {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
    }, {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
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
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }, {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }>;
        timestamp: z.ZodDate;
        format: z.ZodString;
        size: z.ZodNumber;
        ipAddress: z.ZodString;
        success: z.ZodBoolean;
        errorReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
    }, {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        timestamp: z.ZodDate;
        details: z.ZodAny;
        impact: z.ZodEnum<["minor", "major", "breaking"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
    }, {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
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
        country?: string;
        views?: number;
        uniqueViewers?: number;
    }, {
        country?: string;
        views?: number;
        uniqueViewers?: number;
    }>, "many">>;
    deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
        deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
        operatingSystem: z.ZodString;
        browser: z.ZodString;
        views: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        browser?: string;
        deviceType?: "mobile" | "desktop" | "tablet";
        views?: number;
        operatingSystem?: string;
    }, {
        browser?: string;
        deviceType?: "mobile" | "desktop" | "tablet";
        views?: number;
        operatingSystem?: string;
    }>, "many">>;
    conversionMetrics: z.ZodObject<{
        viewToDownload: z.ZodNumber;
        viewToCollaboration: z.ZodNumber;
        viewToSignup: z.ZodNumber;
        averageTimeToAction: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        viewToDownload?: number;
        viewToCollaboration?: number;
        viewToSignup?: number;
        averageTimeToAction?: number;
    }, {
        viewToDownload?: number;
        viewToCollaboration?: number;
        viewToSignup?: number;
        averageTimeToAction?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    views?: {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
    }[];
    downloads?: {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
    }[];
    conversionMetrics?: {
        viewToDownload?: number;
        viewToCollaboration?: number;
        viewToSignup?: number;
        averageTimeToAction?: number;
    };
    collaborations?: {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
    }[];
    totalViews?: number;
    averageViewDuration?: number;
    uniqueViewers?: number;
    peakConcurrentUsers?: number;
    geographicDistribution?: {
        country?: string;
        views?: number;
        uniqueViewers?: number;
    }[];
    deviceStats?: {
        browser?: string;
        deviceType?: "mobile" | "desktop" | "tablet";
        views?: number;
        operatingSystem?: string;
    }[];
}, {
    views?: {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
    }[];
    downloads?: {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
    }[];
    conversionMetrics?: {
        viewToDownload?: number;
        viewToCollaboration?: number;
        viewToSignup?: number;
        averageTimeToAction?: number;
    };
    collaborations?: {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
    }[];
    totalViews?: number;
    averageViewDuration?: number;
    uniqueViewers?: number;
    peakConcurrentUsers?: number;
    geographicDistribution?: {
        country?: string;
        views?: number;
        uniqueViewers?: number;
    }[];
    deviceStats?: {
        browser?: string;
        deviceType?: "mobile" | "desktop" | "tablet";
        views?: number;
        operatingSystem?: string;
    }[];
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                changes: z.ZodArray<z.ZodString, "many">;
                size: z.ZodNumber;
                checksum: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }, {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }>, "many">;
            isLatest: z.ZodBoolean;
            changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                type: z.ZodEnum<["content", "metadata", "permissions"]>;
                conflictingVersions: z.ZodArray<z.ZodString, "many">;
                resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
            }, "strip", z.ZodTypeAny, {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }, {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        }, {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }, {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }, {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodOptional<z.ZodDate>;
                parentId: z.ZodOptional<z.ZodString>;
                position: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x?: number;
                    y?: number;
                }, {
                    x?: number;
                    y?: number;
                }>>;
                resolved: z.ZodDefault<z.ZodBoolean>;
                resolvedBy: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>>;
                resolvedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        }, {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
    }, {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
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
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }, {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
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
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
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
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }, {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }>;
        accessControls: z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
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
                    lat?: number;
                    lng?: number;
                }, {
                    lat?: number;
                    lng?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
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
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }, {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    }, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "active" | "expired" | "pending" | "revoked";
    type?: "template" | "bundle" | "graph" | "dataset";
    content?: any;
    metadata?: {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
    };
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    analytics?: {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    };
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "active" | "expired" | "pending" | "revoked";
    type?: "template" | "bundle" | "graph" | "dataset";
    content?: any;
    metadata?: {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
    };
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    analytics?: {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    };
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
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
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }, {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
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
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
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
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }, {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }>>;
        accessControls: z.ZodOptional<z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }>>;
    collaborators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    contentType?: "template" | "bundle" | "graph" | "dataset";
    collaborators?: string[];
    contentId?: string;
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
}, {
    description?: string;
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    contentType?: "template" | "bundle" | "graph" | "dataset";
    collaborators?: string[];
    contentId?: string;
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
}>;
export declare const CreateShareResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    shareId: z.ZodString;
    shareUrl: z.ZodString;
    shareToken: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    expiresAt?: Date;
    shareUrl?: string;
    shareToken?: string;
    shareId?: string;
}, {
    error?: string;
    success?: boolean;
    expiresAt?: Date;
    shareUrl?: string;
    shareToken?: string;
    shareId?: string;
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
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }, {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
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
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
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
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }, {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }>>;
        accessControls: z.ZodOptional<z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
}, {
    description?: string;
    title?: string;
    security?: {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    };
    sharing?: {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    };
}>;
export declare const ShareAccessRequestSchema: z.ZodObject<{
    shareToken: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodString;
    ipAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password?: string;
    ipAddress?: string;
    userAgent?: string;
    shareToken?: string;
}, {
    password?: string;
    ipAddress?: string;
    userAgent?: string;
    shareToken?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    changes: z.ZodArray<z.ZodString, "many">;
                    size: z.ZodNumber;
                    checksum: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }, {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }>, "many">;
                isLatest: z.ZodBoolean;
                changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    type: z.ZodEnum<["content", "metadata", "permissions"]>;
                    conflictingVersions: z.ZodArray<z.ZodString, "many">;
                    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                }, "strip", z.ZodTypeAny, {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }, {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            }, {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodOptional<z.ZodDate>;
                    parentId: z.ZodOptional<z.ZodString>;
                    position: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x?: number;
                        y?: number;
                    }, {
                        x?: number;
                        y?: number;
                    }>>;
                    resolved: z.ZodDefault<z.ZodBoolean>;
                    resolvedBy: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>>;
                    resolvedAt: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            }, {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            }>;
        }, "strip", z.ZodTypeAny, {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        }, {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
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
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }, {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
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
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
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
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }, {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }>;
            accessControls: z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
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
                        lat?: number;
                        lng?: number;
                    }, {
                        lat?: number;
                        lng?: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
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
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }, {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }>>;
    permissions: z.ZodArray<z.ZodEnum<["view", "comment", "edit", "admin"]>, "many">;
    requiresPassword: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    analytics: z.ZodOptional<z.ZodObject<{
        viewCount: z.ZodNumber;
        lastAccessed: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        viewCount?: number;
        lastAccessed?: Date;
    }, {
        viewCount?: number;
        lastAccessed?: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    content?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    };
    success?: boolean;
    permissions?: ("view" | "edit" | "admin" | "comment")[];
    analytics?: {
        viewCount?: number;
        lastAccessed?: Date;
    };
    requiresPassword?: boolean;
}, {
    error?: string;
    content?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    };
    success?: boolean;
    permissions?: ("view" | "edit" | "admin" | "comment")[];
    analytics?: {
        viewCount?: number;
        lastAccessed?: Date;
    };
    requiresPassword?: boolean;
}>;
export declare const SharePermissionRequestSchema: z.ZodObject<{
    shareId: z.ZodString;
    userId: z.ZodString;
    permission: z.ZodEnum<["view", "comment", "edit", "admin"]>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    userId?: string;
    permission?: "view" | "edit" | "admin" | "comment";
    shareId?: string;
}, {
    message?: string;
    userId?: string;
    permission?: "view" | "edit" | "admin" | "comment";
    shareId?: string;
}>;
export declare const ShareAnalyticsRequestSchema: z.ZodObject<{
    shareId: z.ZodString;
    timeRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start?: Date;
        end?: Date;
    }, {
        start?: Date;
        end?: Date;
    }>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["views", "downloads", "collaborations"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    metrics?: ("views" | "downloads" | "collaborations")[];
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    shareId?: string;
}, {
    metrics?: ("views" | "downloads" | "collaborations")[];
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    shareId?: string;
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
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
                    lat?: number;
                    lng?: number;
                }, {
                    lat?: number;
                    lng?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
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
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }, {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    }, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    }>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    analytics?: {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    };
}, {
    error?: string;
    success?: boolean;
    analytics?: {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    };
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
    maxCollaborators?: number;
    encryptionRequired?: boolean;
    maxShareDuration?: number;
    defaultAccessLevel?: "private" | "public" | "restricted";
    allowAnonymousSharing?: boolean;
    requireEmailVerification?: boolean;
    allowPasswordProtection?: boolean;
    trackAnalyticsByDefault?: boolean;
    defaultRetentionDays?: number;
    maxFileSizeForSharing?: number;
    supportedFormats?: string[];
}, {
    maxCollaborators?: number;
    encryptionRequired?: boolean;
    maxShareDuration?: number;
    defaultAccessLevel?: "private" | "public" | "restricted";
    allowAnonymousSharing?: boolean;
    requireEmailVerification?: boolean;
    allowPasswordProtection?: boolean;
    trackAnalyticsByDefault?: boolean;
    defaultRetentionDays?: number;
    maxFileSizeForSharing?: number;
    supportedFormats?: string[];
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }>>;
    data: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    data?: any;
    type?: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
    timestamp?: Date;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    shareId?: string;
}, {
    data?: any;
    type?: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
    timestamp?: Date;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    };
    shareId?: string;
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
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    }, {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string;
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
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
    }, {
        id?: string;
        name?: string;
        email?: string;
        role?: "view" | "edit" | "admin" | "comment";
        permissions?: string[];
        avatar?: string;
        addedAt?: Date;
        invitedBy?: string;
        acceptedAt?: Date;
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
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }, {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
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
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
    }, {
        permissions?: "view" | "edit" | "admin" | "comment";
        expiresAt?: Date;
        collaborators?: {
            id?: string;
            name?: string;
            email?: string;
            role?: "view" | "edit" | "admin" | "comment";
            permissions?: string[];
            avatar?: string;
            addedAt?: Date;
            invitedBy?: string;
            acceptedAt?: Date;
        }[];
        accessLevel?: "private" | "public" | "restricted";
        shareUrl?: string;
        shareToken?: string;
        passwordProtected?: boolean;
        allowDownload?: boolean;
        allowCopy?: boolean;
        trackAnalytics?: boolean;
        notifyOnAccess?: boolean;
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
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }, {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        }>;
        accessControls: z.ZodObject<{
            ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            requireAuthentication: z.ZodBoolean;
            maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
            sessionTimeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }, {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
    }, {
        dataClassification?: "public" | "internal" | "restricted" | "confidential";
        retentionPolicy?: {
            maxShareDuration?: number;
            autoExpire?: boolean;
            dataRetentionDays?: number;
        };
        accessControls?: {
            requireAuthentication?: boolean;
            sessionTimeout?: number;
            ipWhitelist?: string[];
            geoRestrictions?: string[];
            maxConcurrentUsers?: number;
        };
        encryptionRequired?: boolean;
        auditingEnabled?: boolean;
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
        maxCollaborators?: number;
        encryptionRequired?: boolean;
        maxShareDuration?: number;
        defaultAccessLevel?: "private" | "public" | "restricted";
        allowAnonymousSharing?: boolean;
        requireEmailVerification?: boolean;
        allowPasswordProtection?: boolean;
        trackAnalyticsByDefault?: boolean;
        defaultRetentionDays?: number;
        maxFileSizeForSharing?: number;
        supportedFormats?: string[];
    }, {
        maxCollaborators?: number;
        encryptionRequired?: boolean;
        maxShareDuration?: number;
        defaultAccessLevel?: "private" | "public" | "restricted";
        allowAnonymousSharing?: boolean;
        requireEmailVerification?: boolean;
        allowPasswordProtection?: boolean;
        trackAnalyticsByDefault?: boolean;
        defaultRetentionDays?: number;
        maxFileSizeForSharing?: number;
        supportedFormats?: string[];
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    changes: z.ZodArray<z.ZodString, "many">;
                    size: z.ZodNumber;
                    checksum: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }, {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }>, "many">;
                isLatest: z.ZodBoolean;
                changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    type: z.ZodEnum<["content", "metadata", "permissions"]>;
                    conflictingVersions: z.ZodArray<z.ZodString, "many">;
                    resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                }, "strip", z.ZodTypeAny, {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }, {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            }, {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }, {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    createdAt: z.ZodDate;
                    updatedAt: z.ZodOptional<z.ZodDate>;
                    parentId: z.ZodOptional<z.ZodString>;
                    position: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x?: number;
                        y?: number;
                    }, {
                        x?: number;
                        y?: number;
                    }>>;
                    resolved: z.ZodDefault<z.ZodBoolean>;
                    resolvedBy: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        email: z.ZodString;
                        name: z.ZodString;
                        avatar: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>>;
                    resolvedAt: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }, {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            }, {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            }>;
        }, "strip", z.ZodTypeAny, {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        }, {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
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
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }, {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
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
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
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
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }, {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }>;
            accessControls: z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
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
                        lat?: number;
                        lng?: number;
                    }, {
                        lat?: number;
                        lng?: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
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
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }, {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "active" | "expired" | "pending" | "revoked";
        type?: "template" | "bundle" | "graph" | "dataset";
        content?: any;
        metadata?: {
            category?: string;
            tags?: string[];
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            annotations?: {
                stickyNotes?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                }[];
                connectionLabels?: {
                    id?: string;
                    createdAt?: Date;
                    label?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    color?: string;
                    sourceNodeId?: string;
                    targetNodeId?: string;
                }[];
                regions?: {
                    id?: string;
                    createdAt?: Date;
                    description?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    color?: string;
                    title?: string;
                }[];
                comments?: {
                    id?: string;
                    createdAt?: Date;
                    updatedAt?: Date;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    content?: string;
                    parentId?: string;
                    resolved?: boolean;
                    resolvedAt?: Date;
                    resolvedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                }[];
            };
            language?: string;
            exportId?: string;
            contentSize?: number;
            checksumMd5?: string;
            versionControl?: {
                versions?: {
                    size?: number;
                    version?: string;
                    author?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    timestamp?: Date;
                    checksum?: string;
                    changes?: string[];
                }[];
                currentVersion?: string;
                isLatest?: boolean;
                changesFromPrevious?: string[];
                mergeConflicts?: {
                    path?: string;
                    type?: "content" | "metadata" | "permissions";
                    resolution?: "auto" | "manual";
                    conflictingVersions?: string[];
                }[];
            };
        };
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                changes: z.ZodArray<z.ZodString, "many">;
                size: z.ZodNumber;
                checksum: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }, {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }>, "many">;
            isLatest: z.ZodBoolean;
            changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                type: z.ZodEnum<["content", "metadata", "permissions"]>;
                conflictingVersions: z.ZodArray<z.ZodString, "many">;
                resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
            }, "strip", z.ZodTypeAny, {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }, {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        }, {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }, {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }, {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                createdAt: z.ZodDate;
                updatedAt: z.ZodOptional<z.ZodDate>;
                parentId: z.ZodOptional<z.ZodString>;
                position: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x?: number;
                    y?: number;
                }, {
                    x?: number;
                    y?: number;
                }>>;
                resolved: z.ZodDefault<z.ZodBoolean>;
                resolvedBy: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>>;
                resolvedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }, {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        }, {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
    }, {
        category?: string;
        tags?: string[];
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        annotations?: {
            stickyNotes?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
            }[];
            connectionLabels?: {
                id?: string;
                createdAt?: Date;
                label?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                color?: string;
                sourceNodeId?: string;
                targetNodeId?: string;
            }[];
            regions?: {
                id?: string;
                createdAt?: Date;
                description?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                color?: string;
                title?: string;
            }[];
            comments?: {
                id?: string;
                createdAt?: Date;
                updatedAt?: Date;
                position?: {
                    x?: number;
                    y?: number;
                };
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                content?: string;
                parentId?: string;
                resolved?: boolean;
                resolvedAt?: Date;
                resolvedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
            }[];
        };
        language?: string;
        exportId?: string;
        contentSize?: number;
        checksumMd5?: string;
        versionControl?: {
            versions?: {
                size?: number;
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                timestamp?: Date;
                checksum?: string;
                changes?: string[];
            }[];
            currentVersion?: string;
            isLatest?: boolean;
            changesFromPrevious?: string[];
            mergeConflicts?: {
                path?: string;
                type?: "content" | "metadata" | "permissions";
                resolution?: "auto" | "manual";
                conflictingVersions?: string[];
            }[];
        };
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            changes: z.ZodArray<z.ZodString, "many">;
            size: z.ZodNumber;
            checksum: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }, {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }>, "many">;
        isLatest: z.ZodBoolean;
        changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodEnum<["content", "metadata", "permissions"]>;
            conflictingVersions: z.ZodArray<z.ZodString, "many">;
            resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }, {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
    }, {
        versions?: {
            size?: number;
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            timestamp?: Date;
            checksum?: string;
            changes?: string[];
        }[];
        currentVersion?: string;
        isLatest?: boolean;
        changesFromPrevious?: string[];
        mergeConflicts?: {
            path?: string;
            type?: "content" | "metadata" | "permissions";
            resolution?: "auto" | "manual";
            conflictingVersions?: string[];
        }[];
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }, {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }, {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodOptional<z.ZodDate>;
            parentId: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x?: number;
                y?: number;
            }, {
                x?: number;
                y?: number;
            }>>;
            resolved: z.ZodDefault<z.ZodBoolean>;
            resolvedBy: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>>;
            resolvedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
    }, {
        stickyNotes?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
        }[];
        connectionLabels?: {
            id?: string;
            createdAt?: Date;
            label?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            color?: string;
            sourceNodeId?: string;
            targetNodeId?: string;
        }[];
        regions?: {
            id?: string;
            createdAt?: Date;
            description?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            color?: string;
            title?: string;
        }[];
        comments?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            position?: {
                x?: number;
                y?: number;
            };
            author?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            content?: string;
            parentId?: string;
            resolved?: boolean;
            resolvedAt?: Date;
            resolvedBy?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
        }[];
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
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
                    lat?: number;
                    lng?: number;
                }, {
                    lat?: number;
                    lng?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }, {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }, {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
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
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }, {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            }>;
            timestamp: z.ZodDate;
            format: z.ZodString;
            size: z.ZodNumber;
            ipAddress: z.ZodString;
            success: z.ZodBoolean;
            errorReason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }, {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
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
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }, {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            }>;
            timestamp: z.ZodDate;
            details: z.ZodAny;
            impact: z.ZodEnum<["minor", "major", "breaking"]>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }, {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
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
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }, {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }>, "many">>;
        deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
            deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
            operatingSystem: z.ZodString;
            browser: z.ZodString;
            views: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }, {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }>, "many">>;
        conversionMetrics: z.ZodObject<{
            viewToDownload: z.ZodNumber;
            viewToCollaboration: z.ZodNumber;
            viewToSignup: z.ZodNumber;
            averageTimeToAction: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }, {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
    }, {
        views?: {
            id?: string;
            timestamp?: Date;
            duration?: number;
            ipAddress?: string;
            userAgent?: string;
            referrer?: string;
            geolocation?: {
                region?: string;
                country?: string;
                city?: string;
                coordinates?: {
                    lat?: number;
                    lng?: number;
                };
            };
            viewerInfo?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
        }[];
        downloads?: {
            id?: string;
            format?: string;
            size?: number;
            timestamp?: Date;
            success?: boolean;
            ipAddress?: string;
            downloadedBy?: {
                id?: string;
                name?: string;
                email?: string;
                sessionId?: string;
                isAuthenticated?: boolean;
            };
            errorReason?: string;
        }[];
        conversionMetrics?: {
            viewToDownload?: number;
            viewToCollaboration?: number;
            viewToSignup?: number;
            averageTimeToAction?: number;
        };
        collaborations?: {
            id?: string;
            type?: "edit" | "comment" | "annotation" | "permission_change";
            timestamp?: Date;
            details?: any;
            user?: {
                id?: string;
                name?: string;
                email?: string;
                avatar?: string;
            };
            impact?: "major" | "minor" | "breaking";
        }[];
        totalViews?: number;
        averageViewDuration?: number;
        uniqueViewers?: number;
        peakConcurrentUsers?: number;
        geographicDistribution?: {
            country?: string;
            views?: number;
            uniqueViewers?: number;
        }[];
        deviceStats?: {
            browser?: string;
            deviceType?: "mobile" | "desktop" | "tablet";
            views?: number;
            operatingSystem?: string;
        }[];
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
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }, {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
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
                lat?: number;
                lng?: number;
            }, {
                lat?: number;
                lng?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        }, {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
    }, {
        id?: string;
        timestamp?: Date;
        duration?: number;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        geolocation?: {
            region?: string;
            country?: string;
            city?: string;
            coordinates?: {
                lat?: number;
                lng?: number;
            };
        };
        viewerInfo?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
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
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }, {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        }>;
        timestamp: z.ZodDate;
        format: z.ZodString;
        size: z.ZodNumber;
        ipAddress: z.ZodString;
        success: z.ZodBoolean;
        errorReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
    }, {
        id?: string;
        format?: string;
        size?: number;
        timestamp?: Date;
        success?: boolean;
        ipAddress?: string;
        downloadedBy?: {
            id?: string;
            name?: string;
            email?: string;
            sessionId?: string;
            isAuthenticated?: boolean;
        };
        errorReason?: string;
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>;
        timestamp: z.ZodDate;
        details: z.ZodAny;
        impact: z.ZodEnum<["minor", "major", "breaking"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
    }, {
        id?: string;
        type?: "edit" | "comment" | "annotation" | "permission_change";
        timestamp?: Date;
        details?: any;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        impact?: "major" | "minor" | "breaking";
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
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }, {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
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
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
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
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }, {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }>>;
            accessControls: z.ZodOptional<z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }>>;
        collaborators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        contentType?: "template" | "bundle" | "graph" | "dataset";
        collaborators?: string[];
        contentId?: string;
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }, {
        description?: string;
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        contentType?: "template" | "bundle" | "graph" | "dataset";
        collaborators?: string[];
        contentId?: string;
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }>;
    CreateShareResponse: z.ZodObject<{
        success: z.ZodBoolean;
        shareId: z.ZodString;
        shareUrl: z.ZodString;
        shareToken: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodDate>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        success?: boolean;
        expiresAt?: Date;
        shareUrl?: string;
        shareToken?: string;
        shareId?: string;
    }, {
        error?: string;
        success?: boolean;
        expiresAt?: Date;
        shareUrl?: string;
        shareToken?: string;
        shareId?: string;
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
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }, {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
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
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        }, {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
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
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }, {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            }>>;
            accessControls: z.ZodOptional<z.ZodObject<{
                ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                requireAuthentication: z.ZodBoolean;
                maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                sessionTimeout: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }, {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }, {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }, {
        description?: string;
        title?: string;
        security?: {
            dataClassification?: "public" | "internal" | "restricted" | "confidential";
            retentionPolicy?: {
                maxShareDuration?: number;
                autoExpire?: boolean;
                dataRetentionDays?: number;
            };
            accessControls?: {
                requireAuthentication?: boolean;
                sessionTimeout?: number;
                ipWhitelist?: string[];
                geoRestrictions?: string[];
                maxConcurrentUsers?: number;
            };
            encryptionRequired?: boolean;
            auditingEnabled?: boolean;
        };
        sharing?: {
            permissions?: "view" | "edit" | "admin" | "comment";
            expiresAt?: Date;
            collaborators?: {
                id?: string;
                name?: string;
                email?: string;
                role?: "view" | "edit" | "admin" | "comment";
                permissions?: string[];
                avatar?: string;
                addedAt?: Date;
                invitedBy?: string;
                acceptedAt?: Date;
            }[];
            accessLevel?: "private" | "public" | "restricted";
            shareUrl?: string;
            shareToken?: string;
            passwordProtected?: boolean;
            allowDownload?: boolean;
            allowCopy?: boolean;
            trackAnalytics?: boolean;
            notifyOnAccess?: boolean;
        };
    }>;
    ShareAccessRequest: z.ZodObject<{
        shareToken: z.ZodString;
        password: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodString;
        ipAddress: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password?: string;
        ipAddress?: string;
        userAgent?: string;
        shareToken?: string;
    }, {
        password?: string;
        ipAddress?: string;
        userAgent?: string;
        shareToken?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
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
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>;
                        changes: z.ZodArray<z.ZodString, "many">;
                        size: z.ZodNumber;
                        checksum: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }, {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }>, "many">;
                    isLatest: z.ZodBoolean;
                    changesFromPrevious: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    mergeConflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        path: z.ZodString;
                        type: z.ZodEnum<["content", "metadata", "permissions"]>;
                        conflictingVersions: z.ZodArray<z.ZodString, "many">;
                        resolution: z.ZodOptional<z.ZodEnum<["auto", "manual"]>>;
                    }, "strip", z.ZodTypeAny, {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }, {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                }, {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
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
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>;
                        createdAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }, {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
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
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>;
                        createdAt: z.ZodDate;
                        updatedAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }, {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
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
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>;
                        createdAt: z.ZodDate;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }, {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
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
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>;
                        createdAt: z.ZodDate;
                        updatedAt: z.ZodOptional<z.ZodDate>;
                        parentId: z.ZodOptional<z.ZodString>;
                        position: z.ZodOptional<z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            x?: number;
                            y?: number;
                        }, {
                            x?: number;
                            y?: number;
                        }>>;
                        resolved: z.ZodDefault<z.ZodBoolean>;
                        resolvedBy: z.ZodOptional<z.ZodObject<{
                            id: z.ZodString;
                            email: z.ZodString;
                            name: z.ZodString;
                            avatar: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }, {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        }>>;
                        resolvedAt: z.ZodOptional<z.ZodDate>;
                    }, "strip", z.ZodTypeAny, {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }, {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                }, {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                }>;
            }, "strip", z.ZodTypeAny, {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
            }, {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
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
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
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
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
            }, {
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
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
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                }, {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                }>;
                accessControls: z.ZodObject<{
                    ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    geoRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    requireAuthentication: z.ZodBoolean;
                    maxConcurrentUsers: z.ZodOptional<z.ZodNumber>;
                    sessionTimeout: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                }, {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
            }, {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
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
                            lat?: number;
                            lng?: number;
                        }, {
                            lat?: number;
                            lng?: number;
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    }, {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }, {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
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
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    }>;
                    timestamp: z.ZodDate;
                    format: z.ZodString;
                    size: z.ZodNumber;
                    ipAddress: z.ZodString;
                    success: z.ZodBoolean;
                    errorReason: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }, {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
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
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }, {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    }>;
                    timestamp: z.ZodDate;
                    details: z.ZodAny;
                    impact: z.ZodEnum<["minor", "major", "breaking"]>;
                }, "strip", z.ZodTypeAny, {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }, {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
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
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }, {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }>, "many">>;
                deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                    operatingSystem: z.ZodString;
                    browser: z.ZodString;
                    views: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }, {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }>, "many">>;
                conversionMetrics: z.ZodObject<{
                    viewToDownload: z.ZodNumber;
                    viewToCollaboration: z.ZodNumber;
                    viewToSignup: z.ZodNumber;
                    averageTimeToAction: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                }, {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            }, {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            status: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            description?: string;
            status?: "active" | "expired" | "pending" | "revoked";
            type?: "template" | "bundle" | "graph" | "dataset";
            content?: any;
            metadata?: {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
            };
            title?: string;
            security?: {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
            };
            analytics?: {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            };
            sharing?: {
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
            };
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            description?: string;
            status?: "active" | "expired" | "pending" | "revoked";
            type?: "template" | "bundle" | "graph" | "dataset";
            content?: any;
            metadata?: {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
            };
            title?: string;
            security?: {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
            };
            analytics?: {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            };
            sharing?: {
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
            };
        }>>;
        permissions: z.ZodArray<z.ZodEnum<["view", "comment", "edit", "admin"]>, "many">;
        requiresPassword: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
        analytics: z.ZodOptional<z.ZodObject<{
            viewCount: z.ZodNumber;
            lastAccessed: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            viewCount?: number;
            lastAccessed?: Date;
        }, {
            viewCount?: number;
            lastAccessed?: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        content?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            description?: string;
            status?: "active" | "expired" | "pending" | "revoked";
            type?: "template" | "bundle" | "graph" | "dataset";
            content?: any;
            metadata?: {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
            };
            title?: string;
            security?: {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
            };
            analytics?: {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            };
            sharing?: {
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
            };
        };
        success?: boolean;
        permissions?: ("view" | "edit" | "admin" | "comment")[];
        analytics?: {
            viewCount?: number;
            lastAccessed?: Date;
        };
        requiresPassword?: boolean;
    }, {
        error?: string;
        content?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            description?: string;
            status?: "active" | "expired" | "pending" | "revoked";
            type?: "template" | "bundle" | "graph" | "dataset";
            content?: any;
            metadata?: {
                category?: string;
                tags?: string[];
                version?: string;
                author?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                annotations?: {
                    stickyNotes?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                    }[];
                    connectionLabels?: {
                        id?: string;
                        createdAt?: Date;
                        label?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        color?: string;
                        sourceNodeId?: string;
                        targetNodeId?: string;
                    }[];
                    regions?: {
                        id?: string;
                        createdAt?: Date;
                        description?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        color?: string;
                        title?: string;
                    }[];
                    comments?: {
                        id?: string;
                        createdAt?: Date;
                        updatedAt?: Date;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        content?: string;
                        parentId?: string;
                        resolved?: boolean;
                        resolvedAt?: Date;
                        resolvedBy?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    }[];
                };
                language?: string;
                exportId?: string;
                contentSize?: number;
                checksumMd5?: string;
                versionControl?: {
                    versions?: {
                        size?: number;
                        version?: string;
                        author?: {
                            id?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                        timestamp?: Date;
                        checksum?: string;
                        changes?: string[];
                    }[];
                    currentVersion?: string;
                    isLatest?: boolean;
                    changesFromPrevious?: string[];
                    mergeConflicts?: {
                        path?: string;
                        type?: "content" | "metadata" | "permissions";
                        resolution?: "auto" | "manual";
                        conflictingVersions?: string[];
                    }[];
                };
            };
            title?: string;
            security?: {
                dataClassification?: "public" | "internal" | "restricted" | "confidential";
                retentionPolicy?: {
                    maxShareDuration?: number;
                    autoExpire?: boolean;
                    dataRetentionDays?: number;
                };
                accessControls?: {
                    requireAuthentication?: boolean;
                    sessionTimeout?: number;
                    ipWhitelist?: string[];
                    geoRestrictions?: string[];
                    maxConcurrentUsers?: number;
                };
                encryptionRequired?: boolean;
                auditingEnabled?: boolean;
            };
            analytics?: {
                views?: {
                    id?: string;
                    timestamp?: Date;
                    duration?: number;
                    ipAddress?: string;
                    userAgent?: string;
                    referrer?: string;
                    geolocation?: {
                        region?: string;
                        country?: string;
                        city?: string;
                        coordinates?: {
                            lat?: number;
                            lng?: number;
                        };
                    };
                    viewerInfo?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                }[];
                downloads?: {
                    id?: string;
                    format?: string;
                    size?: number;
                    timestamp?: Date;
                    success?: boolean;
                    ipAddress?: string;
                    downloadedBy?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        sessionId?: string;
                        isAuthenticated?: boolean;
                    };
                    errorReason?: string;
                }[];
                conversionMetrics?: {
                    viewToDownload?: number;
                    viewToCollaboration?: number;
                    viewToSignup?: number;
                    averageTimeToAction?: number;
                };
                collaborations?: {
                    id?: string;
                    type?: "edit" | "comment" | "annotation" | "permission_change";
                    timestamp?: Date;
                    details?: any;
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        avatar?: string;
                    };
                    impact?: "major" | "minor" | "breaking";
                }[];
                totalViews?: number;
                averageViewDuration?: number;
                uniqueViewers?: number;
                peakConcurrentUsers?: number;
                geographicDistribution?: {
                    country?: string;
                    views?: number;
                    uniqueViewers?: number;
                }[];
                deviceStats?: {
                    browser?: string;
                    deviceType?: "mobile" | "desktop" | "tablet";
                    views?: number;
                    operatingSystem?: string;
                }[];
            };
            sharing?: {
                permissions?: "view" | "edit" | "admin" | "comment";
                expiresAt?: Date;
                collaborators?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: "view" | "edit" | "admin" | "comment";
                    permissions?: string[];
                    avatar?: string;
                    addedAt?: Date;
                    invitedBy?: string;
                    acceptedAt?: Date;
                }[];
                accessLevel?: "private" | "public" | "restricted";
                shareUrl?: string;
                shareToken?: string;
                passwordProtected?: boolean;
                allowDownload?: boolean;
                allowCopy?: boolean;
                trackAnalytics?: boolean;
                notifyOnAccess?: boolean;
            };
        };
        success?: boolean;
        permissions?: ("view" | "edit" | "admin" | "comment")[];
        analytics?: {
            viewCount?: number;
            lastAccessed?: Date;
        };
        requiresPassword?: boolean;
    }>;
    SharePermissionRequest: z.ZodObject<{
        shareId: z.ZodString;
        userId: z.ZodString;
        permission: z.ZodEnum<["view", "comment", "edit", "admin"]>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        userId?: string;
        permission?: "view" | "edit" | "admin" | "comment";
        shareId?: string;
    }, {
        message?: string;
        userId?: string;
        permission?: "view" | "edit" | "admin" | "comment";
        shareId?: string;
    }>;
    ShareAnalyticsRequest: z.ZodObject<{
        shareId: z.ZodString;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodDate;
            end: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            start?: Date;
            end?: Date;
        }, {
            start?: Date;
            end?: Date;
        }>>;
        metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["views", "downloads", "collaborations"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        metrics?: ("views" | "downloads" | "collaborations")[];
        timeRange?: {
            start?: Date;
            end?: Date;
        };
        shareId?: string;
    }, {
        metrics?: ("views" | "downloads" | "collaborations")[];
        timeRange?: {
            start?: Date;
            end?: Date;
        };
        shareId?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
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
                        lat?: number;
                        lng?: number;
                    }, {
                        lat?: number;
                        lng?: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }, {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }, {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
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
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                }>;
                timestamp: z.ZodDate;
                format: z.ZodString;
                size: z.ZodNumber;
                ipAddress: z.ZodString;
                success: z.ZodBoolean;
                errorReason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }, {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
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
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }, {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                }>;
                timestamp: z.ZodDate;
                details: z.ZodAny;
                impact: z.ZodEnum<["minor", "major", "breaking"]>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }, {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
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
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }, {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }>, "many">>;
            deviceStats: z.ZodDefault<z.ZodArray<z.ZodObject<{
                deviceType: z.ZodEnum<["desktop", "tablet", "mobile"]>;
                operatingSystem: z.ZodString;
                browser: z.ZodString;
                views: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }, {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }>, "many">>;
            conversionMetrics: z.ZodObject<{
                viewToDownload: z.ZodNumber;
                viewToCollaboration: z.ZodNumber;
                viewToSignup: z.ZodNumber;
                averageTimeToAction: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }, {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }, {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        }>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        success?: boolean;
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
    }, {
        error?: string;
        success?: boolean;
        analytics?: {
            views?: {
                id?: string;
                timestamp?: Date;
                duration?: number;
                ipAddress?: string;
                userAgent?: string;
                referrer?: string;
                geolocation?: {
                    region?: string;
                    country?: string;
                    city?: string;
                    coordinates?: {
                        lat?: number;
                        lng?: number;
                    };
                };
                viewerInfo?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
            }[];
            downloads?: {
                id?: string;
                format?: string;
                size?: number;
                timestamp?: Date;
                success?: boolean;
                ipAddress?: string;
                downloadedBy?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    sessionId?: string;
                    isAuthenticated?: boolean;
                };
                errorReason?: string;
            }[];
            conversionMetrics?: {
                viewToDownload?: number;
                viewToCollaboration?: number;
                viewToSignup?: number;
                averageTimeToAction?: number;
            };
            collaborations?: {
                id?: string;
                type?: "edit" | "comment" | "annotation" | "permission_change";
                timestamp?: Date;
                details?: any;
                user?: {
                    id?: string;
                    name?: string;
                    email?: string;
                    avatar?: string;
                };
                impact?: "major" | "minor" | "breaking";
            }[];
            totalViews?: number;
            averageViewDuration?: number;
            uniqueViewers?: number;
            peakConcurrentUsers?: number;
            geographicDistribution?: {
                country?: string;
                views?: number;
                uniqueViewers?: number;
            }[];
            deviceStats?: {
                browser?: string;
                deviceType?: "mobile" | "desktop" | "tablet";
                views?: number;
                operatingSystem?: string;
            }[];
        };
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
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }, {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        }>>;
        data: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        data?: any;
        type?: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
        timestamp?: Date;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        shareId?: string;
    }, {
        data?: any;
        type?: "comment_added" | "share_created" | "share_accessed" | "share_downloaded" | "share_expired" | "share_revoked" | "collaborator_added" | "collaborator_removed" | "permission_changed" | "content_updated" | "annotation_added";
        timestamp?: Date;
        user?: {
            id?: string;
            name?: string;
            email?: string;
            avatar?: string;
        };
        shareId?: string;
    }>;
};
//# sourceMappingURL=sharing-schemas.d.ts.map