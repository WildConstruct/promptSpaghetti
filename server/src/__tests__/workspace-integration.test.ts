/**
 * Comprehensive Workspace Integration Tests
 * Tests the full workspace CRUD system with authentication and RBAC
 */

import { Database } from 'better-sqlite3';
import { AuthService } from '../services/auth-service';
import { WorkspaceService } from '../services/workspace-service';
import { WorkspaceDAO } from '../database/workspace-dao';
import { AuthMiddleware } from '../middleware/auth';
import { 
  PERMISSIONS, 
  CreateWorkspace, 
  CreateProject, 
  CreateUser,
  ROLE_PERMISSIONS
} from '../database/workspace-models';

// Mock database setup
const mockDb = {
  prepare: jest.fn().mockReturnValue({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn()
  }),
  exec: jest.fn(),
  close: jest.fn()
} as unknown as Database;

// Mock request/reply objects
const createMockRequest = (user?: any, params?: any, body?: any, query?: any) => ({
  user,
  params: params || {},
  body: body || {},
  query: query || {},
  headers: {
    authorization: user ? `Bearer mock-token-${user.id}` : undefined
  }
} as any);

const createMockReply = () => {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  };
  return reply as any;
};

describe('Workspace Integration Tests', () => {
  let authService: AuthService;
  let workspaceDAO: WorkspaceDAO;
  let workspaceService: WorkspaceService;
  let authMiddleware: AuthMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize services
    workspaceDAO = new WorkspaceDAO(mockDb);
    authService = new AuthService(workspaceDAO, 'test-secret');
    workspaceService = new WorkspaceService(workspaceDAO);
    authMiddleware = new AuthMiddleware(authService, workspaceDAO);
  });

  describe('Authentication Integration', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'mock-hash',
      auth_provider: 'local',
      email_verified: true,
      mfa_enabled: false,
      created_at: new Date(),
      updated_at: new Date(),
      deactivated_at: null,
      last_login_at: new Date()
    };

    beforeEach(() => {
      // Mock database responses
      jest.spyOn(workspaceDAO, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(workspaceDAO, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(workspaceDAO, 'createUserSession').mockResolvedValue({
        id: 'session-123',
        user_id: mockUser.id,
        session_token: 'mock-token',
        expires_at: new Date(Date.now() + 86400000),
        created_at: new Date(),
        last_active_at: new Date()
      });
      jest.spyOn(authService, 'verifyJWT').mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
        sessionId: 'session-123'
      });
    });

    it('should authenticate user with valid JWT token', async () => {
      const request = createMockRequest(null, {}, {}, {});
      const reply = createMockReply();
      
      request.headers.authorization = 'Bearer valid-jwt-token';

      await authMiddleware.authenticate(request, reply);

      expect(request.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        sessionId: 'session-123'
      });
      expect(reply.status).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const request = createMockRequest(null, {}, {}, {});
      const reply = createMockReply();
      
      request.headers.authorization = 'Bearer invalid-token';
      jest.spyOn(authService, 'verifyJWT').mockResolvedValue(null);

      await authMiddleware.authenticate(request, reply);

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });

    it('should reject request without authorization header', async () => {
      const request = createMockRequest(null, {}, {}, {});
      const reply = createMockReply();

      await authMiddleware.authenticate(request, reply);

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Missing or invalid authorization header'
      });
    });
  });

  describe('Workspace Authorization', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User', sessionId: 'session-123' };
    const workspaceId = 'workspace-456';

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'getUserPermissions').mockResolvedValue({
        permissions: PERMISSIONS.WORKSPACE_READ | PERMISSIONS.PROJECT_READ,
        roles: [{ 
          id: 'role-1', 
          name: 'viewer', 
          workspace_id: workspaceId,
          description: 'Viewer role',
          permissions: ROLE_PERMISSIONS.VIEWER,
          is_system_role: true,
          created_at: new Date(),
          updated_at: new Date()
        }]
      });
    });

    it('should authorize user with correct workspace permissions', async () => {
      const request = createMockRequest(mockUser, { workspaceId }, {}, {});
      const reply = createMockReply();

      await authMiddleware.authorizeWorkspace(PERMISSIONS.WORKSPACE_READ)(request, reply);

      expect(request.workspace).toEqual({
        id: workspaceId,
        permissions: PERMISSIONS.WORKSPACE_READ | PERMISSIONS.PROJECT_READ,
        roles: ['viewer']
      });
      expect(reply.status).not.toHaveBeenCalled();
    });

    it('should reject user without required permission', async () => {
      const request = createMockRequest(mockUser, { workspaceId }, {}, {});
      const reply = createMockReply();

      await authMiddleware.authorizeWorkspace(PERMISSIONS.WORKSPACE_ADMIN)(request, reply);

      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Insufficient permissions for this operation'
      });
    });

    it('should reject user without workspace access', async () => {
      const request = createMockRequest(mockUser, { workspaceId }, {}, {});
      const reply = createMockReply();

      jest.spyOn(workspaceDAO, 'getUserPermissions').mockResolvedValue(null);

      await authMiddleware.authorizeWorkspace()(request, reply);

      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Access denied to workspace'
      });
    });
  });

  describe('Workspace CRUD Operations', () => {
    const mockUser = 'user-123';
    const mockWorkspace = {
      id: 'workspace-456',
      owner_id: mockUser,
      name: 'Test Workspace',
      description: 'A test workspace',
      settings: {},
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null
    };

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'createWorkspace').mockResolvedValue(mockWorkspace);
      jest.spyOn(workspaceDAO, 'getWorkspace').mockResolvedValue(mockWorkspace);
      jest.spyOn(workspaceDAO, 'updateWorkspace').mockResolvedValue(mockWorkspace);
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(true);
      jest.spyOn(workspaceDAO, 'createActivityEvent').mockResolvedValue({
        id: 'activity-123',
        workspace_id: mockWorkspace.id,
        actor_id: mockUser,
        event_type: 'workspace.created',
        event_data: {},
        created_at: new Date()
      });
    });

    it('should create workspace successfully', async () => {
      const workspaceData: CreateWorkspace = {
        name: 'New Workspace',
        description: 'A new workspace for testing'
      };

      const result = await workspaceService.createWorkspace(workspaceData, mockUser);

      expect(workspaceDAO.createWorkspace).toHaveBeenCalledWith(workspaceData, mockUser);
      expect(result).toEqual(mockWorkspace);
    });

    it('should get workspace with proper access control', async () => {
      const result = await workspaceService.getWorkspace(mockWorkspace.id, mockUser);

      expect(workspaceDAO.getWorkspace).toHaveBeenCalledWith(mockWorkspace.id);
      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        mockWorkspace.id, 
        PERMISSIONS.WORKSPACE_READ
      );
      expect(result).toEqual(mockWorkspace);
    });

    it('should reject workspace access without permission', async () => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      await expect(
        workspaceService.getWorkspace(mockWorkspace.id, mockUser)
      ).rejects.toThrow('Access denied to workspace');
    });

    it('should update workspace with proper permission check', async () => {
      const updateData = { name: 'Updated Workspace' };

      const result = await workspaceService.updateWorkspace(
        mockWorkspace.id, 
        updateData, 
        mockUser
      );

      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        mockWorkspace.id, 
        PERMISSIONS.WORKSPACE_WRITE
      );
      expect(workspaceDAO.updateWorkspace).toHaveBeenCalledWith(mockWorkspace.id, updateData);
      expect(result).toEqual(mockWorkspace);
    });

    it('should reject workspace update without permission', async () => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      await expect(
        workspaceService.updateWorkspace(mockWorkspace.id, { name: 'Updated' }, mockUser)
      ).rejects.toThrow('Insufficient permissions to update workspace');
    });
  });

  describe('Project Management', () => {
    const mockUser = 'user-123';
    const workspaceId = 'workspace-456';
    const mockProject = {
      id: 'project-789',
      workspace_id: workspaceId,
      name: 'Test Project',
      description: 'A test project',
      status: 'active' as const,
      metadata: {},
      created_by: mockUser,
      created_at: new Date(),
      updated_at: new Date()
    };

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'createProject').mockResolvedValue(mockProject);
      jest.spyOn(workspaceDAO, 'getProject').mockResolvedValue(mockProject);
      jest.spyOn(workspaceDAO, 'updateProject').mockResolvedValue(mockProject);
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(true);
    });

    it('should create project with proper permissions', async () => {
      const projectData: CreateProject = {
        workspace_id: workspaceId,
        name: 'New Project',
        description: 'A new test project'
      };

      const result = await workspaceService.createProject(projectData, mockUser);

      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        workspaceId, 
        PERMISSIONS.PROJECT_CREATE
      );
      expect(workspaceDAO.createProject).toHaveBeenCalledWith(projectData, mockUser);
      expect(result).toEqual(mockProject);
    });

    it('should get project with access control', async () => {
      const result = await workspaceService.getProject(mockProject.id, mockUser);

      expect(workspaceDAO.getProject).toHaveBeenCalledWith(mockProject.id);
      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        workspaceId, 
        PERMISSIONS.PROJECT_READ
      );
      expect(result).toEqual(mockProject);
    });

    it('should reject project creation without permission', async () => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      const projectData: CreateProject = {
        workspace_id: workspaceId,
        name: 'New Project'
      };

      await expect(
        workspaceService.createProject(projectData, mockUser)
      ).rejects.toThrow('Insufficient permissions to create projects');
    });
  });

  describe('Comment System', () => {
    const mockUser = 'user-123';
    const workspaceId = 'workspace-456';
    const resourceId = 'resource-789';
    const mockComment = {
      id: 'comment-123',
      resource_id: resourceId,
      author_id: mockUser,
      content_markdown: 'Test comment',
      content_html: '<p>Test comment</p>',
      status: 'active' as const,
      created_at: new Date(),
      updated_at: new Date(),
      workspace_id: workspaceId
    };

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'createComment').mockResolvedValue(mockComment);
      jest.spyOn(workspaceDAO, 'getComment').mockResolvedValue(mockComment);
      jest.spyOn(workspaceDAO, 'updateComment').mockResolvedValue(mockComment);
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(true);
    });

    it('should create comment with proper permissions', async () => {
      const commentData = {
        resource_id: resourceId,
        author_id: mockUser,
        content_markdown: 'Test comment',
        workspace_id: workspaceId
      };

      const result = await workspaceService.createComment(commentData);

      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        workspaceId, 
        PERMISSIONS.COMMENT_WRITE
      );
      expect(workspaceDAO.createComment).toHaveBeenCalledWith(commentData);
      expect(result).toEqual(mockComment);
    });

    it('should validate comment content', async () => {
      const commentData = {
        resource_id: resourceId,
        author_id: mockUser,
        content_markdown: '',
        workspace_id: workspaceId
      };

      await expect(
        workspaceService.createComment(commentData)
      ).rejects.toThrow('Comment content is required');
    });

    it('should update comment with author or admin permissions', async () => {
      const updateData = { content_markdown: 'Updated comment' };

      const result = await workspaceService.updateComment(
        mockComment.id, 
        updateData, 
        mockUser
      );

      expect(workspaceDAO.getComment).toHaveBeenCalledWith(mockComment.id);
      expect(workspaceDAO.updateComment).toHaveBeenCalledWith(
        mockComment.id, 
        mockUser, 
        updateData
      );
      expect(result).toEqual(mockComment);
    });

    it('should reject comment update by non-author without admin permission', async () => {
      const differentUser = 'user-456';
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      await expect(
        workspaceService.updateComment(
          mockComment.id, 
          { content_markdown: 'Updated' }, 
          differentUser
        )
      ).rejects.toThrow('Insufficient permissions to edit this comment');
    });
  });

  describe('Activity Tracking', () => {
    const mockUser = 'user-123';
    const workspaceId = 'workspace-456';

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(true);
      jest.spyOn(workspaceDAO, 'getActivityFeed').mockResolvedValue({
        data: [{
          id: 'activity-123',
          workspace_id: workspaceId,
          actor_id: mockUser,
          event_type: 'workspace.updated',
          event_data: {},
          created_at: new Date(),
          actor_name: 'Test User',
          actor_avatar: undefined
        }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      });
    });

    it('should get activity feed with proper permissions', async () => {
      const result = await workspaceService.getActivityFeed(workspaceId, mockUser);

      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        workspaceId, 
        PERMISSIONS.ACTIVITY_READ
      );
      expect(workspaceDAO.getActivityFeed).toHaveBeenCalledWith(
        workspaceId, 
        {}, 
        {}
      );
      expect(result.data).toHaveLength(1);
    });

    it('should reject activity feed access without permission', async () => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      await expect(
        workspaceService.getActivityFeed(workspaceId, mockUser)
      ).rejects.toThrow('Access denied to activity feed');
    });
  });

  describe('User Invitation System', () => {
    const mockUser = 'user-123';
    const workspaceId = 'workspace-456';
    const inviteeId = 'user-789';

    beforeEach(() => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(true);
      jest.spyOn(workspaceDAO, 'getRole').mockResolvedValue({
        id: 'role-123',
        workspace_id: workspaceId,
        name: 'editor',
        description: 'Editor role',
        permissions: ROLE_PERMISSIONS.EDITOR,
        is_system_role: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      jest.spyOn(workspaceDAO, 'createUserMembership').mockResolvedValue({
        id: 'membership-123',
        user_id: inviteeId,
        workspace_id: workspaceId,
        status: 'active',
        invited_by: mockUser,
        joined_at: new Date(),
        last_active_at: new Date()
      });
      jest.spyOn(workspaceDAO, 'createACLAssignment').mockResolvedValue({
        id: 'assignment-123',
        user_id: inviteeId,
        role_id: 'role-123',
        scope_type: 'workspace',
        scope_id: workspaceId,
        granted_by: mockUser,
        granted_at: new Date()
      });
      jest.spyOn(workspaceDAO, 'createActivityEvent').mockResolvedValue({
        id: 'activity-123',
        workspace_id: workspaceId,
        actor_id: mockUser,
        event_type: 'user.invited',
        event_data: { invited_user: inviteeId, role: 'editor' },
        created_at: new Date()
      });
    });

    it('should invite user with proper permissions', async () => {
      await workspaceService.inviteUserToWorkspace(
        workspaceId, 
        inviteeId, 
        'editor', 
        mockUser
      );

      expect(workspaceDAO.hasPermissions).toHaveBeenCalledWith(
        mockUser, 
        workspaceId, 
        PERMISSIONS.USER_INVITE
      );
      expect(workspaceDAO.createUserMembership).toHaveBeenCalled();
      expect(workspaceDAO.createACLAssignment).toHaveBeenCalled();
      expect(workspaceDAO.createActivityEvent).toHaveBeenCalled();
    });

    it('should reject invitation without permission', async () => {
      jest.spyOn(workspaceDAO, 'hasPermissions').mockResolvedValue(false);

      await expect(
        workspaceService.inviteUserToWorkspace(
          workspaceId, 
          inviteeId, 
          'editor', 
          mockUser
        )
      ).rejects.toThrow('Insufficient permissions to invite users');
    });

    it('should reject invitation with invalid role', async () => {
      jest.spyOn(workspaceDAO, 'getRole').mockResolvedValue(null);

      await expect(
        workspaceService.inviteUserToWorkspace(
          workspaceId, 
          inviteeId, 
          'invalid-role', 
          mockUser
        )
      ).rejects.toThrow('Role \'invalid-role\' not found');
    });
  });
});

// Test helper functions
export const createTestUser = (overrides: Partial<CreateUser> = {}): CreateUser => ({
  email: 'test@example.com',
  name: 'Test User',
  auth_provider: 'local',
  ...overrides
});

export const createTestWorkspace = (overrides: Partial<CreateWorkspace> = {}): CreateWorkspace => ({
  name: 'Test Workspace',
  description: 'A test workspace',
  ...overrides
});

export const createTestProject = (
  workspaceId: string, 
  overrides: Partial<CreateProject> = {}
): CreateProject => ({
  workspace_id: workspaceId,
  name: 'Test Project',
  description: 'A test project',
  ...overrides
});