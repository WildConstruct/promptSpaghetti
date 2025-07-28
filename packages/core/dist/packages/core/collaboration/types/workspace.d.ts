export interface WorkspaceId extends String {
    readonly __brand: 'WorkspaceId';
}
export interface ProjectId extends String {
    readonly __brand: 'ProjectId';
}
export interface UserId extends String {
    readonly __brand: 'UserId';
}
export interface ResourceId extends String {
    readonly __brand: 'ResourceId';
}
export declare enum WorkspaceRole {
    OWNER = "owner",
    ADMIN = "admin",
    COLLABORATOR = "collaborator",
    VIEWER = "viewer",
    export,
    enum,
    ProjectRole
}
//# sourceMappingURL=workspace.d.ts.map