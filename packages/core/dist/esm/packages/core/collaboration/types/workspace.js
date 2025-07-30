export var WorkspaceRole;
(function (WorkspaceRole) {
    WorkspaceRole["OWNER"] = "owner";
    WorkspaceRole["ADMIN"] = "admin";
    WorkspaceRole["COLLABORATOR"] = "collaborator";
    WorkspaceRole["VIEWER"] = "viewer";
    WorkspaceRole[WorkspaceRole["export"] = void 0] = "export";
    WorkspaceRole[WorkspaceRole["enum"] = void 0] = "enum";
    WorkspaceRole[WorkspaceRole["ProjectRole"] = void 0] = "ProjectRole";
})(WorkspaceRole || (WorkspaceRole = {}));
{
    OWNER = 'owner',
        EDITOR = 'editor',
        VIEWER = 'viewer';
    export let ResourceType;
    (function (ResourceType) {
        ResourceType["GRAPH"] = "graph";
        ResourceType["TEMPLATE"] = "template";
        ResourceType["ASSET"] = "asset";
        ResourceType["DOCUMENT"] = "document";
        ResourceType[ResourceType["export"] = void 0] = "export";
        ResourceType[ResourceType["enum"] = void 0] = "enum";
        ResourceType[ResourceType["ActivityType"] = void 0] = "ActivityType";
    })(ResourceType || (ResourceType = {}));
    {
        WORKSPACE_CREATE = 'workspace.create',
            WORKSPACE_UPDATE = 'workspace.update',
            WORKSPACE_DELETE = 'workspace.delete',
            PROJECT_CREATE = 'project.create',
            PROJECT_UPDATE = 'project.update',
            PROJECT_DELETE = 'project.delete',
            RESOURCE_CREATE = 'resource.create',
            RESOURCE_UPDATE = 'resource.update',
            RESOURCE_DELETE = 'resource.delete',
            USER_INVITE = 'user.invite',
            USER_JOIN = 'user.join',
            USER_LEAVE = 'user.leave',
            USER_ROLE_CHANGE = 'user.role_change';
        export let NotificationType;
        (function (NotificationType) {
            NotificationType["WORKSPACE_INVITE"] = "workspace.invite";
            NotificationType["PROJECT_INVITE"] = "project.invite";
            NotificationType["COMMENT_MENTION"] = "comment.mention";
            NotificationType["COMMENT_REPLY"] = "comment.reply";
            NotificationType["RESOURCE_SHARED"] = "resource.shared";
            NotificationType["ROLE_CHANGED"] = "role.changed";
            NotificationType["ACTIVITY_DIGEST"] = "activity.digest";
            NotificationType[NotificationType["export"] = void 0] = "export";
            NotificationType[NotificationType["interface"] = void 0] = "interface";
            NotificationType[NotificationType["NotificationData"] = void 0] = "NotificationData";
        })(NotificationType || (NotificationType = {}));
        {
            action_url ?  : string;
            actor_user_id ?  : UserId;
            target_type ?  : string;
            target_id ?  : string;
            metadata ?  : Record;
            // Workspace operations interface
        }
    }
}
