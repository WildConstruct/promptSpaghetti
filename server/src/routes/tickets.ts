/**
 * Ticket Management API Routes
 * Handles ticket CRUD operations and status transitions
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TicketDAO } from '../database/ticket-dao';
import {
  TicketSchema,
  TicketStatus,
  TicketStatusType,
  TicketPriority,
  GitHubAutomationConfigSchema,
} from '../database/ticket-models';
import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';

// Request schemas
const CreateTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.CRITICAL]),
  epic_id: z.string().optional(),
  story_id: z.string().optional(),
  assigned_to: z.string().optional(),
  created_by: z.string(),
  labels: z.array(z.string()).optional(),
});

const UpdateTicketStatusSchema = z.object({
  status: z.enum([
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_REVIEW,
    TicketStatus.APPROVED,
    TicketStatus.MERGED,
    TicketStatus.CLOSED,
    TicketStatus.BLOCKED,
  ]),
  changed_by: z.string(),
});

const TrackCommitSchema = z.object({
  commit_sha: z.string(),
  commit_message: z.string(),
  files_changed: z.array(z.string()),
  lines_added: z.number(),
  lines_deleted: z.number(),
  author: z.string(),
  committed_at: z.string(),
});

const GetTicketsQuerySchema = z.object({
  status: z.string().optional(),
  assigned_to: z.string().optional(),
  epic_id: z.string().optional(),
});

export async function ticketRoutes(fastify: FastifyInstance) {
  const db = getDatabase();
  const ticketDAO = new TicketDAO(db);

  // Create a new ticket
  fastify.post<{
    Body: z.infer<typeof CreateTicketSchema>;
  }>(
    '/tickets',
    {
      schema: {
        body: CreateTicketSchema,
        response: {
          200: TicketSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const ticket = ticketDAO.createTicket({
          ...request.body,
          status: TicketStatus.OPEN,
          files_changed: [],
          labels: request.body.labels || [],
        });

        reply.send(ticket);
      } catch (error) {
        logger.error('Failed to create ticket:', error);
        reply.status(500).send({ error: 'Failed to create ticket' });
      }
    }
  );

  // Get all tickets with optional filters
  fastify.get<{
    Querystring: z.infer<typeof GetTicketsQuerySchema>;
  }>(
    '/tickets',
    {
      schema: {
        querystring: GetTicketsQuerySchema,
        response: {
          200: z.array(TicketSchema),
        },
      },
    },
    async (request, reply) => {
      try {
        const filters =
          request.query.status || request.query.assigned_to || request.query.epic_id
            ? {
                status: request.query.status as TicketStatusType,
                assigned_to: request.query.assigned_to,
                epic_id: request.query.epic_id,
              }
            : undefined;

        const tickets = ticketDAO.getTickets(filters);
        reply.send(tickets);
      } catch (error) {
        logger.error('Failed to get tickets:', error);
        reply.status(500).send({ error: 'Failed to get tickets' });
      }
    }
  );

  // Get a single ticket
  fastify.get<{
    Params: { id: string };
  }>(
    '/tickets/:id',
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: TicketSchema,
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const ticket = ticketDAO.getTicket(request.params.id);

        if (!ticket) {
          return reply.status(404).send({ error: 'Ticket not found' });
        }

        reply.send(ticket);
      } catch (error) {
        logger.error('Failed to get ticket:', error);
        reply.status(500).send({ error: 'Failed to get ticket' });
      }
    }
  );

  // Update ticket status (this is the key endpoint for QA approval)
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof UpdateTicketStatusSchema>;
  }>(
    '/tickets/:id/status',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: UpdateTicketStatusSchema,
        response: {
          200: TicketSchema,
          400: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { status, changed_by } = request.body;

        const updatedTicket = await ticketDAO.updateTicketStatus(request.params.id, status, changed_by);

        if (!updatedTicket) {
          return reply.status(404).send({ error: 'Ticket not found' });
        }

        reply.send(updatedTicket);
      } catch (error) {
        logger.error('Failed to update ticket status:', error);

        if (error instanceof Error && error.message.includes('Cannot transition')) {
          return reply.status(400).send({ error: error.message });
        }

        reply.status(500).send({ error: 'Failed to update ticket status' });
      }
    }
  );

  // Track a commit for a ticket
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof TrackCommitSchema>;
  }>(
    '/tickets/:id/commits',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: TrackCommitSchema,
      },
    },
    async (request, reply) => {
      try {
        await ticketDAO.trackCommit(request.params.id, {
          ...request.body,
          ticket_id: request.params.id,
          pushed: false,
        });

        reply.send({ success: true });
      } catch (error) {
        logger.error('Failed to track commit:', error);
        reply.status(500).send({ error: 'Failed to track commit' });
      }
    }
  );

  // Get ticket history
  fastify.get<{
    Params: { id: string };
  }>(
    '/tickets/:id/history',
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      try {
        const history = ticketDAO.getTicketHistory(request.params.id);
        reply.send(history);
      } catch (error) {
        logger.error('Failed to get ticket history:', error);
        reply.status(500).send({ error: 'Failed to get ticket history' });
      }
    }
  );

  // Get unpushed commits for a ticket
  fastify.get<{
    Params: { id: string };
  }>(
    '/tickets/:id/commits/unpushed',
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      try {
        const commits = ticketDAO.getUnpushedCommits(request.params.id);
        reply.send(commits);
      } catch (error) {
        logger.error('Failed to get unpushed commits:', error);
        reply.status(500).send({ error: 'Failed to get unpushed commits' });
      }
    }
  );

  // GitHub automation configuration endpoints

  // Get GitHub automation config
  fastify.get(
    '/tickets/config/github',
    {
      schema: {
        response: {
          200: GitHubAutomationConfigSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const config = ticketDAO.getGitHubAutomationConfig();
        reply.send(config);
      } catch (error) {
        logger.error('Failed to get GitHub config:', error);
        reply.status(500).send({ error: 'Failed to get GitHub config' });
      }
    }
  );

  // Update GitHub automation config
  fastify.put<{
    Body: Partial<z.infer<typeof GitHubAutomationConfigSchema>>;
  }>(
    '/tickets/config/github',
    {
      schema: {
        body: GitHubAutomationConfigSchema.partial(),
      },
    },
    async (request, reply) => {
      try {
        ticketDAO.updateGitHubConfig(request.body);
        const updatedConfig = ticketDAO.getGitHubAutomationConfig();
        reply.send(updatedConfig);
      } catch (error) {
        logger.error('Failed to update GitHub config:', error);
        reply.status(500).send({ error: 'Failed to update GitHub config' });
      }
    }
  );

  // Manual trigger for pushing commits (useful for testing)
  fastify.post<{
    Params: { id: string };
  }>(
    '/tickets/:id/push',
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      try {
        const ticket = ticketDAO.getTicket(request.params.id);
        if (!ticket) {
          return reply.status(404).send({ error: 'Ticket not found' });
        }

        const config = ticketDAO.getGitHubAutomationConfig();
        if (!config) {
          return reply.status(500).send({ error: 'GitHub automation not configured' });
        }

        const { executeGitHubAutomation } = await import('../services/github-automation-service');
        await executeGitHubAutomation(ticket, config, 'push_commits');

        reply.send({ success: true, message: 'Commits pushed successfully' });
      } catch (error) {
        logger.error('Failed to push commits:', error);
        reply.status(500).send({ error: 'Failed to push commits' });
      }
    }
  );
}
