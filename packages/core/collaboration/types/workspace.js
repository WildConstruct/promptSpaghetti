export var WorkspaceRole;
(function (WorkspaceRole) {
    WorkspaceRole["OWNER"] = "owner";
    WorkspaceRole["ADMIN"] = "admin";
    WorkspaceRole["COLLABORATOR"] = "collaborator";
    WorkspaceRole["VIEWER"] = "viewer";
})(WorkspaceRole || (WorkspaceRole = {}));
export var ProjectRole;
(function (ProjectRole) {
    ProjectRole["OWNER"] = "owner";
    ProjectRole["EDITOR"] = "editor";
    ProjectRole["VIEWER"] = "viewer";
})(ProjectRole || (ProjectRole = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["GRAPH"] = "graph";
    ResourceType["TEMPLATE"] = "template";
    ResourceType["ASSET"] = "asset";
    ResourceType["DOCUMENT"] = "document";
})(ResourceType || (ResourceType = {}));
export var ActivityType;
(function (ActivityType) {
    ActivityType["WORKSPACE_CREATE"] = "workspace.create";
    ActivityType["WORKSPACE_UPDATE"] = "workspace.update";
    ActivityType["WORKSPACE_DELETE"] = "workspace.delete";
    ActivityType["PROJECT_CREATE"] = "project.create";
    ActivityType["PROJECT_UPDATE"] = "project.update";
    ActivityType["PROJECT_DELETE"] = "project.delete";
    ActivityType["RESOURCE_CREATE"] = "resource.create";
    ActivityType["RESOURCE_UPDATE"] = "resource.update";
    ActivityType["RESOURCE_DELETE"] = "resource.delete";
    ActivityType["USER_INVITE"] = "user.invite";
    ActivityType["USER_JOIN"] = "user.join";
    ActivityType["USER_LEAVE"] = "user.leave";
    ActivityType["USER_ROLE_CHANGE"] = "user.role_change";
})(ActivityType || (ActivityType = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["WORKSPACE_INVITE"] = "workspace.invite";
    NotificationType["PROJECT_INVITE"] = "project.invite";
    NotificationType["COMMENT_MENTION"] = "comment.mention";
    NotificationType["COMMENT_REPLY"] = "comment.reply";
    NotificationType["RESOURCE_SHARED"] = "resource.shared";
    NotificationType["ROLE_CHANGED"] = "role.changed";
    NotificationType["ACTIVITY_DIGEST"] = "activity.digest";
})(NotificationType || (NotificationType = {}));
