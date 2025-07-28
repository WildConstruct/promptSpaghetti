/**
 * Project Management API Routes
 * 
 * Server-side endpoints for project save/load/management system
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

// Reuse the same schemas from the client-side ProjectManager
const ProjectMetadataSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  fileFormatVersion: z.string().default('1.0.0')
});

const PSGFileSchema = z.object({
  metadata: ProjectMetadataSchema,
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    meta: z.object({
      version: z.string()
    }).optional()
  }),
  settings: z.object({
    autoSave: z.boolean().default(true),
    autoSaveInterval: z.number().default(5000),
    theme: z.enum(['light', 'dark']).default('light'),
    gridVisible: z.boolean().default(true),
    snapToGrid: z.boolean().default(false),
    miniMapVisible: z.boolean().default(true)
  }).default({})
});

const SaveProjectRequestSchema = z.object({
  project: PSGFileSchema,
  userId: z.number().optional() // Optional for anonymous saves
});

const UpdateProjectRequestSchema = z.object({
  projectId: z.string(),
  project: PSGFileSchema,
  userId: z.number().optional()
});

const ProjectQuerySchema = z.object({
  userId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['createdAt', 'lastModified', 'name']).default('lastModified'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

}
interface DatabaseProject {
  id: string;
  user_id?: number;
  name: string;
  description?: string;
  version: string;
  created_at: string;
  last_modified: string;
  author?: string;
  tags: string[];
  file_format_version: string;
  graph_data: any;
  settings: any;
}
}

/**
 * Initialize projects table if it doesn't exist
 */
function initializeProjectsTable() {
  const db = getDatabase();
  
  // Create projects table
  const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT DEFAULT '1.0.0',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_modified TEXT NOT NULL DEFAULT (datetime('now')),
      author TEXT,
      tags TEXT DEFAULT '[]',
      file_format_version TEXT DEFAULT '1.0.0',
      graph_data TEXT NOT NULL,
      settings TEXT DEFAULT '{}',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;
  
  // Create indexes for better query performance
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_projects_last_modified ON projects(last_modified);',
    'CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);',
    'CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);'
  ];
  
  try {
    db.exec(createProjectsTable);
    createIndexes.forEach(indexSQL => db.exec(indexSQL));
    console.log('Projects table and indexes initialized successfully');
  } catch (error) {
    console.error('Failed to initialize projects table:', error);
    throw error;
  }
}

/**
 * Convert database row to API format
 */
function dbProjectToAPI(dbProject: DatabaseProject): any {
  return {
    id: dbProject.id,
    userId: dbProject.user_id,
    metadata: {
      name: dbProject.name,
      description: dbProject.description,
      version: dbProject.version,
      createdAt: dbProject.created_at,
      lastModified: dbProject.last_modified,
      author: dbProject.author,
      tags: typeof dbProject.tags === 'string' ? JSON.parse(dbProject.tags || '[]') : (dbProject.tags || []),
      fileFormatVersion: dbProject.file_format_version
  }
    graph: JSON.parse(dbProject.graph_data),
    settings: JSON.parse(dbProject.settings || '{}')
  };
}

export async function projectRoutes(fastify: FastifyInstance) {
  // Initialize the projects table on startup
  initializeProjectsTable();
  
  // Save new project
  fastify.post<{
    Body: z.infer<typeof SaveProjectRequestSchema>;
  }>('/projects', {
    schema: {
      body: {
        type: 'object',
        properties: {
          project: { type: 'object' },
          userId: { type: 'number' }
  }
        required: ['project']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            projectId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
  }
    handler: async (request, reply) => {
      try {
        const { project, userId } = SaveProjectRequestSchema.parse(request.body);
        const db = getDatabase();
        
        // Generate unique project ID
        const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const insertProject = db.prepare(`
          INSERT INTO projects (
            id, user_id, name, description, version, created_at, last_modified,
            author, tags, file_format_version, graph_data, settings
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertProject.run(
          projectId,
          userId || null,
          project.metadata.name,
          project.metadata.description || null,
          project.metadata.version,
          project.metadata.createdAt,
          project.metadata.lastModified,
          project.metadata.author || null,
          JSON.stringify(project.metadata.tags || []),
          project.metadata.fileFormatVersion,
          JSON.stringify(project.graph),
          JSON.stringify(project.settings)
        );
        
        return {
          success: true,
          projectId,
          message: 'Project saved successfully'
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: `Failed to save project: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });

  // Get user's projects with pagination and filtering
  fastify.get<{
    Querystring: z.infer<typeof ProjectQuerySchema>;
  }>('/projects', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
          search: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          sortBy: { type: 'string', enum: ['createdAt', 'lastModified', 'name'], default: 'lastModified' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            projects: { type: 'array' },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        }
      }
  }
    handler: async (request, reply) => {
      try {
        const query = ProjectQuerySchema.parse(request.query);
        const db = getDatabase();
        
        let whereClause = '1=1';
        const params: any[] = [];
        
        // Filter by user ID (including anonymous projects)
        if (query.userId) {
          whereClause += ' AND user_id = ?';
          params.push(query.userId);
        } else {
          // For anonymous users, only show projects without user_id
          whereClause += ' AND user_id IS NULL';
        }
        
        // Search functionality
        if (query.search) {
          whereClause += ' AND (name LIKE ? OR description LIKE ? OR author LIKE ?)';
          const searchTerm = `%${query.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Tag filtering
        if (query.tags && query.tags.length > 0) {
          const tagConditions = query.tags.map(() => 'tags LIKE ?').join(' OR ');
          whereClause += ` AND (${tagConditions})`;
          query.tags.forEach(tag => params.push(`%"${tag}"%`));
        }
        
        // Map sort fields to database columns
        const sortFieldMap = {
          createdAt: 'created_at',
          lastModified: 'last_modified',
          name: 'name'
        };
        const sortField = sortFieldMap[query.sortBy];
        
        // Get total count
        const countQuery = `SELECT COUNT(*) as count FROM projects WHERE ${whereClause}`;
        const countResult = db.prepare(countQuery).get(...params) as { count: number };
        
        // Get projects with pagination
        const projectsQuery = `
          SELECT * FROM projects 
          WHERE ${whereClause}
          ORDER BY ${sortField} ${query.sortOrder.toUpperCase()}
          LIMIT ? OFFSET ?
        `;
        
        const projects = db.prepare(projectsQuery)
          .all(...params, query.limit, query.offset) as DatabaseProject[];
        
        return {
          projects: projects.map(dbProjectToAPI),
          total: countResult.count,
          limit: query.limit,
          offset: query.offset
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          error: `Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });

  // Get specific project by ID
  fastify.get<{
    Params: { projectId: string };
    Querystring: { userId?: number };
  }>('/projects/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string' }
  }
        required: ['projectId']
  }
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' }
        }
  }
      response: {
        200: { type: 'object' }
      }
  }
    handler: async (request, reply) => {
      try {
        const { projectId } = request.params;
        const { userId } = request.query;
        const db = getDatabase();
        
        let whereClause = 'id = ?';
        const params: any[] = [projectId];
        
        // Ensure user can only access their own projects
        if (userId) {
          whereClause += ' AND user_id = ?';
          params.push(userId);
        } else {
          whereClause += ' AND user_id IS NULL';
        }
        
        const project = db.prepare(`SELECT * FROM projects WHERE ${whereClause}`)
          .get(...params) as DatabaseProject | undefined;
        
        if (!project) {
          reply.status(404).send({
            error: 'Project not found or access denied'
          });
          return;
        }
        
        return dbProjectToAPI(project);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          error: `Failed to fetch project: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });

  // Update existing project
  fastify.put<{
    Params: { projectId: string };
    Body: z.infer<typeof UpdateProjectRequestSchema>;
  }>('/projects/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string' }
  }
        required: ['projectId']
  }
      body: {
        type: 'object',
        properties: {
          project: { type: 'object' },
          userId: { type: 'number' }
  }
        required: ['project']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
  }
    handler: async (request, reply) => {
      try {
        const { projectId } = request.params;
        const { project, userId } = UpdateProjectRequestSchema.parse({
          projectId,
          ...request.body
        });
        const db = getDatabase();
        
        // Update last_modified timestamp
        const updatedProject = {
          ...project,
          metadata: {
            ...project.metadata,
            lastModified: new Date().toISOString()
          }
        };
        
        let whereClause = 'id = ?';
        const params: any[] = [projectId];
        
        if (userId) {
          whereClause += ' AND user_id = ?';
          params.push(userId);
        } else {
          whereClause += ' AND user_id IS NULL';
        }
        
        const updateProject = db.prepare(`
          UPDATE projects SET
            name = ?, description = ?, version = ?, last_modified = ?,
            author = ?, tags = ?, graph_data = ?, settings = ?
          WHERE ${whereClause}
        `);
        
        const result = updateProject.run(
          updatedProject.metadata.name,
          updatedProject.metadata.description || null,
          updatedProject.metadata.version,
          updatedProject.metadata.lastModified,
          updatedProject.metadata.author || null,
          JSON.stringify(updatedProject.metadata.tags || []),
          JSON.stringify(updatedProject.graph),
          JSON.stringify(updatedProject.settings),
          ...params
        );
        
        if (result.changes === 0) {
          reply.status(404).send({
            success: false,
            error: 'Project not found or access denied'
          });
          return;
        }
        
        return {
          success: true,
          message: 'Project updated successfully'
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: `Failed to update project: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });

  // Delete project
  fastify.delete<{
    Params: { projectId: string };
    Querystring: { userId?: number };
  }>('/projects/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string' }
  }
        required: ['projectId']
  }
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
  }
    handler: async (request, reply) => {
      try {
        const { projectId } = request.params;
        const { userId } = request.query;
        const db = getDatabase();
        
        let whereClause = 'id = ?';
        const params: any[] = [projectId];
        
        if (userId) {
          whereClause += ' AND user_id = ?';
          params.push(userId);
        } else {
          whereClause += ' AND user_id IS NULL';
        }
        
        const deleteProject = db.prepare(`DELETE FROM projects WHERE ${whereClause}`);
        const result = deleteProject.run(...params);
        
        if (result.changes === 0) {
          reply.status(404).send({
            success: false,
            error: 'Project not found or access denied'
          });
          return;
        }
        
        return {
          success: true,
          message: 'Project deleted successfully'
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });

  // Get recent projects for user
  fastify.get<{
    Querystring: { userId?: number; limit?: number };
  }>('/projects/recent', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            projects: { type: 'array' }
          }
        }
      }
  }
    handler: async (request, reply) => {
      try {
        const { userId, limit = 10 } = request.query;
        const db = getDatabase();
        
        let whereClause = '1=1';
        const params: any[] = [];
        
        if (userId) {
          whereClause += ' AND user_id = ?';
          params.push(userId);
        } else {
          whereClause += ' AND user_id IS NULL';
        }
        
        const recentProjects = db.prepare(`
          SELECT * FROM projects 
          WHERE ${whereClause}
          ORDER BY last_modified DESC
          LIMIT ?
        `).all(...params, limit) as DatabaseProject[];
        
        return {
          projects: recentProjects.map(dbProjectToAPI)
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          error: `Failed to fetch recent projects: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
}

export default projectRoutes;