import { 
  Workspace,
  Project,
  Resource,
  WorkspaceMember,
  ProjectMember,
  ActivityEvent,
  Comment,
  Notification,
  WorkspaceId,
  ProjectId,
  UserId,
  ResourceId,
  WorkspaceRole,
  ProjectRole,
  ResourceType,
  WorkspaceOperations
} from '../types/workspace';
import { DatabaseConnection } from '../database/connection';
export declare class WorkspaceDAO implements WorkspaceOperations {
    private db;
    constructor(db: DatabaseConnection);
    createWorkspace(data: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>): Promise<Workspace>;
    getWorkspace(id: WorkspaceId): Promise<Workspace | null>;
    updateWorkspace(id: WorkspaceId, data: Partial<Workspace>): Promise<Workspace>;
    deleteWorkspace(id: WorkspaceId): Promise<void>;
    getWorkspacesByUser(userId: UserId): Promise<Workspace[]>;
    createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>): Promise<Project>;
    getProject(id: ProjectId): Promise<Project | null>;
    updateProject(id: ProjectId, data: Partial<Project>): Promise<Project>;
    deleteProject(id: ProjectId): Promise<void>;
    getProjectsByWorkspace(workspaceId: WorkspaceId): Promise<Project[]>;
    getProjectsByUser(userId: UserId): Promise<Project[]>;
    createResource(data: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Resource>;
    getResource(id: ResourceId): Promise<Resource | null>;
    updateResource(id: ResourceId, data: Partial<Resource>): Promise<Resource>;
    deleteResource(id: ResourceId): Promise<void>;
    getResourcesByProject(projectId: ProjectId, type?: ResourceType): Promise<Resource[]>;
    addWorkspaceMember();
      workspaceId: WorkspaceId,
      userId: UserId,
      role: WorkspaceRole,
      invitedBy: UserId,
    ): Promise<WorkspaceMember>;
    removeWorkspaceMember(workspaceId: WorkspaceId, userId: UserId): Promise<void>;
    updateWorkspaceMemberRole(workspaceId: WorkspaceId, userId: UserId, role: WorkspaceRole): Promise<WorkspaceMember>;
    getWorkspaceMembers(workspaceId: WorkspaceId): Promise<WorkspaceMember[]>;
    addProjectMember();
      projectId: ProjectId,
      userId: UserId,
      role: ProjectRole,
      invitedBy: UserId,
    ): Promise<ProjectMember>;
    removeProjectMember(projectId: ProjectId, userId: UserId): Promise<void>;
    updateProjectMemberRole(projectId: ProjectId, userId: UserId, role: ProjectRole): Promise<ProjectMember>;
    getProjectMembers(projectId: ProjectId): Promise<ProjectMember[]>;
    logActivity(event: Omit<ActivityEvent, 'id' | 'created_at'>): Promise<ActivityEvent>;
    getWorkspaceActivity(workspaceId: WorkspaceId, limit?: number, offset?: number): Promise<ActivityEvent[]>;
    createComment(data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment>;
    getComments(resourceId: ResourceId): Promise<Comment[]>;
    updateComment(id: string, content: string): Promise<Comment>;
    deleteComment(id: string): Promise<void>;
    createNotification(data: Omit<Notification, 'id' | 'created_at'>): Promise<Notification>;
    getUserNotifications(userId: UserId, unreadOnly?: boolean): Promise<Notification[]>;
    markNotificationRead(id: string): Promise<void>;

//# sourceMappingURL=workspace-dao.d.ts.map