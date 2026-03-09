import { FastifyInstance } from 'fastify';
import {
  PsgAssembleSceneRequestSchema,
  PsgDeriveAssetRequestSchema,
  PsgExpandCrowdRequestSchema,
  PsgExportComfyRequestSchema,
  PsgNormalizeRequestSchema,
  PsgRegisterAssetsRequestSchema,
  PsgValidateRequestSchema
} from '../../../packages/core/services/psg/contracts';
import { PsgService } from '../services/PsgService';
import { metrics } from '../utils/metrics';
import { requireRouteAccess } from '../utils/routeAccess';
import {
  assertPsgDocumentWithinLimits,
  assertPsgRequestWithinLimits
} from '../utils/psgLimits';
import { rateLimiter } from '../utils/rateLimit';

export async function psgRoutes(app: FastifyInstance) {
  const psgService = new PsgService();
  const protectedPsgRoutePreHandler = [
        requireRouteAccess({
          access: 'authenticated-user',
          capability: 'cloud-psg',
          quotaBucket: 'cloud-psg'
        }),
    rateLimiter({
      key: 'psg:route',
      limitPerMinute: Number(process.env.PSG_RATE_LIMIT_PER_MINUTE || 30)
    })
  ];

  app.get('/api/psg/capabilities', async () => {
    metrics.mark('psg.capabilities');
    return psgService.getCapabilities();
  });

  app.post(
    '/api/psg/validate',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgValidateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.validate.invalid');
        return reply.status(400).send({ error: 'Invalid PSG validate payload' });
      }

      metrics.mark('psg.validate');
      assertPsgDocumentWithinLimits(parsed.data.document);
      return psgService.validateDocument(parsed.data.document);
    }
  );

  app.post(
    '/api/psg/normalize',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgNormalizeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.normalize.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG normalize payload' });
      }

      try {
        metrics.mark('psg.normalize');
        assertPsgDocumentWithinLimits(parsed.data.document);
        const normalized = psgService.normalizeDocument(parsed.data.document);
        return {
          ok: true,
          changed: normalized.changed,
          document: normalized.document,
          issues: normalized.issues
        };
      } catch (error) {
        metrics.markError('psg.normalize.error');
        const message =
          error instanceof Error ? error.message : 'Failed to normalize PSG';
        return reply.status(400).send({ error: message });
      }
    }
  );

  app.post(
    '/api/psg/assets/register',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgRegisterAssetsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.assets-register.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG asset registration payload' });
      }

      try {
        metrics.mark('psg.assets-register');
        assertPsgDocumentWithinLimits(parsed.data.document);
        return psgService.registerAssets(parsed.data.document, parsed.data.assets);
      } catch (error) {
        metrics.markError('psg.assets-register.error');
        const message =
          error instanceof Error ? error.message : 'Failed to register PSG assets';
        return reply.status(400).send({ error: message });
      }
    }
  );

  app.post(
    '/api/psg/assets/derive',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgDeriveAssetRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.assets-derive.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG asset derivation payload' });
      }

      try {
        metrics.mark('psg.assets-derive');
        assertPsgDocumentWithinLimits(parsed.data.document);
        return psgService.deriveAsset(parsed.data.document, parsed.data.asset);
      } catch (error) {
        metrics.markError('psg.assets-derive.error');
        const message =
          error instanceof Error ? error.message : 'Failed to derive PSG asset';
        return reply.status(400).send({ error: message });
      }
    }
  );

  app.post(
    '/api/psg/expand-crowd',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgExpandCrowdRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.expand.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG crowd expansion payload' });
      }

      try {
        metrics.mark('psg.expand');
        assertPsgDocumentWithinLimits(parsed.data.document);
        return psgService.expandCrowd(parsed.data.document);
      } catch (error) {
        metrics.markError('psg.expand.error');
        const message =
          error instanceof Error ? error.message : 'Failed to expand crowd plan';
        return reply.status(400).send({ error: message });
      }
    }
  );

  app.post(
    '/api/psg/scene/assemble',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgAssembleSceneRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.scene-assemble.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG scene assembly payload' });
      }

      try {
        metrics.mark('psg.scene-assemble');
        assertPsgDocumentWithinLimits(parsed.data.document);
        return psgService.assembleScene(parsed.data.document);
      } catch (error) {
        metrics.markError('psg.scene-assemble.error');
        const message =
          error instanceof Error ? error.message : 'Failed to assemble PSG scene';
        return reply.status(400).send({ error: message });
      }
    }
  );

  app.post(
    '/api/psg/export/comfy',
    {
      preHandler: protectedPsgRoutePreHandler
    },
    async (req, reply) => {
      try {
        assertPsgRequestWithinLimits(req.body);
      } catch (error) {
        return reply.status(413).send({
          error: error instanceof Error ? error.message : 'PSG payload too large'
        });
      }

      const parsed = PsgExportComfyRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        metrics.markError('psg.export.invalid');
        return reply
          .status(400)
          .send({ error: 'Invalid PSG Comfy export payload' });
      }

      try {
        metrics.mark('psg.export.comfy');
        assertPsgDocumentWithinLimits(parsed.data.document);
        return psgService.exportComfy(parsed.data.document);
      } catch (error) {
        metrics.markError('psg.export.error');
        const message =
          error instanceof Error ? error.message : 'Failed to export PSG to Comfy';
        return reply.status(400).send({ error: message });
      }
    }
  );
}
