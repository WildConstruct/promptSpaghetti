import { FastifyInstance } from 'fastify';
import {
  DraftGraphFromPromptRequestSchema,
  type DraftGraphFromPromptResponse
} from '../../../packages/core/services/agenticGraph';
import { AgentDraftService } from '../services/AgentDraftService';
import { metrics } from '../utils/metrics';
import { rateLimiter } from '../utils/rateLimit';
import { requireRouteAccess } from '../utils/routeAccess';

export async function agentRoutes(app: FastifyInstance) {
  const draftService = new AgentDraftService();

  app.post(
    '/api/agent/draft-graph',
    {
      preHandler: [
        requireRouteAccess({
          access: 'authenticated-user',
          capability: 'cloud-agent',
          quotaBucket: 'cloud-agent'
        }),
        rateLimiter({
          key: 'agent:draft-graph',
          limitPerMinute: Number(process.env.LLM_RATE_LIMIT_PER_MINUTE || 30)
        })
      ]
    },
    async (req, reply) => {
      const parsed = DraftGraphFromPromptRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('agent.draft.invalid');
        return reply.status(400).send({
          ok: false,
          summary: 'Invalid draftGraphFromPrompt request',
          operations: [{ kind: 'warning', message: 'Invalid request payload.' }],
          notes: parsed.error.issues.map(issue => issue.message),
          fallback: true
        } satisfies DraftGraphFromPromptResponse);
      }

      try {
        metrics.mark('agent.draft.request');
        const response = await draftService.draftGraphFromPrompt(parsed.data);
        if (response.fallback) {
          metrics.mark('agent.draft.fallback');
        } else {
          metrics.mark('agent.draft.model');
        }
        return reply.send(response);
      } catch (error) {
        metrics.markError('agent.draft.error');
        const message =
          error instanceof Error ? error.message : 'Agent draft failed';

        return reply.status(500).send({
          ok: false,
          summary: 'Agent draft failed',
          operations: [{ kind: 'warning', message }],
          notes: [message],
          fallback: true
        } satisfies DraftGraphFromPromptResponse);
      }
    }
  );
}
