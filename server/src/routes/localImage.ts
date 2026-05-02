import path from 'node:path';

import { FastifyInstance } from 'fastify';
import {
  LocalImageBatchRequestSchema
} from '../../../packages/core/services/localImage/contracts';
import { LocalImageSandboxService } from '../services/LocalImageSandboxService';
import { metrics } from '../utils/metrics';

export async function localImageRoutes(
  app: FastifyInstance,
  service = new LocalImageSandboxService()
) {
  app.get('/api/local-image/status', async () => {
    metrics.mark('local-image.status');
    return await service.getStatus();
  });

  app.post('/api/local-image/batch', async (req, reply) => {
    const parsed = LocalImageBatchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      metrics.markError('local-image.batch.invalid');
      return reply
        .status(400)
        .send({ error: 'Invalid local image batch payload' });
    }

    try {
      metrics.mark('local-image.batch');
      return await service.generateBatch(parsed.data);
    } catch (error) {
      metrics.markError('local-image.batch.error');
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to generate local image batch';
      const status =
        message.includes('not available') ||
        message.includes('disabled') ||
        message.includes('LOCAL_IMAGE_COMFY_CHECKPOINT') ||
        message.includes('checkpoint') ||
        message.includes('unreachable') ||
        message.includes('not writable')
          ? 503
          : 500;
      return reply.status(status).send({ error: message });
    }
  });

  app.get<{
    Params: {
      runId: string;
      filename: string;
    };
  }>('/api/local-image/files/:runId/:filename', async (req, reply) => {
    try {
      const buffer = await service.readGeneratedFile(
        req.params.runId,
        req.params.filename
      );
      reply.header('Content-Type', 'image/png');
      reply.header(
        'Content-Disposition',
        `inline; filename="${path.basename(req.params.filename)}"`
      );
      return reply.send(buffer);
    } catch (error) {
      metrics.markError('local-image.files.error');
      const message =
        error instanceof Error ? error.message : 'Generated file not found';
      return reply.status(404).send({ error: message });
    }
  });
}
