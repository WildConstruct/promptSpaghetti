import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getSupabaseAdmin, verifySupabaseToken } from '../services/supabase';
import { rateLimiter } from '../utils/rateLimit';
import { metrics } from '../utils/metrics';

export async function filesRoutes(app: FastifyInstance) {
  app.get(
    '/api/files/list',
    { preHandler: rateLimiter({ key: 'files:list', limitPerMinute: 120 }) },
    async (req, reply) => {
      const admin = getSupabaseAdmin();
      if (!admin)
        {return reply
          .status(501)
          .send({ error: 'Supabase not configured on server' });}
      const authHeader = req.headers['authorization'];
      const auth = typeof authHeader === 'string' ? authHeader : '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
      const userId = await verifySupabaseToken(token);
      if (!userId) {return reply.status(401).send({ error: 'Unauthorized' });}
      const bucket = process.env.SUPABASE_BUCKET || 'graphs';
      const path = `${userId}/`;
      metrics.mark('files.list');
      const { data, error } = await admin.storage.from(bucket).list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
      if (error) {return reply.status(500).send({ error: error.message });}
      return data;
    }
  );

  app.post(
    '/api/files/upload',
    { preHandler: rateLimiter({ key: 'files:upload', limitPerMinute: 60 }) },
    async (req, reply) => {
      const admin = getSupabaseAdmin();
      if (!admin)
        {return reply
          .status(501)
          .send({ error: 'Supabase not configured on server' });}
      const authHeader = req.headers['authorization'];
      const auth = typeof authHeader === 'string' ? authHeader : '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
      const userId = await verifySupabaseToken(token);
      if (!userId) {return reply.status(401).send({ error: 'Unauthorized' });}

      const schema = z.object({
        filename: z.string().min(1).max(200),
        content: z.string().min(1)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        {return reply.status(400).send({ error: 'Invalid payload' });}
      const { filename, content } = parsed.data;
      // sanitize filename: allow letters, numbers, . _ -
      if (!/^[a-zA-Z0-9._-]+$/.test(filename))
        {return reply.status(400).send({ error: 'Invalid filename' });}
      const bucket = process.env.SUPABASE_BUCKET || 'graphs';
      const path = `${userId}/${filename}`;
      metrics.mark('files.upload');
      const { error } = await admin.storage
        .from(bucket)
        .upload(path, Buffer.from(content, 'utf-8'), {
          upsert: true,
          contentType: 'application/json'
        });
      if (error) {return reply.status(500).send({ error: error.message });}
      return { success: true, path };
    }
  );

  app.get(
    '/api/files/download',
    { preHandler: rateLimiter({ key: 'files:download', limitPerMinute: 120 }) },
    async (req, reply) => {
      const admin = getSupabaseAdmin();
      if (!admin)
        {return reply
          .status(501)
          .send({ error: 'Supabase not configured on server' });}
      const authHeader = req.headers['authorization'];
      const auth = typeof authHeader === 'string' ? authHeader : '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
      const userId = await verifySupabaseToken(token);
      if (!userId) {return reply.status(401).send({ error: 'Unauthorized' });}
      const qs = z
        .object({ filename: z.string().min(1).max(200) })
        .safeParse(req.query);
      if (!qs.success)
        {return reply.status(400).send({ error: 'Invalid query' });}
      const { filename } = qs.data;
      if (!/^[a-zA-Z0-9._-]+$/.test(filename))
        {return reply.status(400).send({ error: 'Invalid filename' });}
      const bucket = process.env.SUPABASE_BUCKET || 'graphs';
      const path = `${userId}/${filename}`;
      metrics.mark('files.download');
      const { data, error } = await admin.storage.from(bucket).download(path);
      if (error || !data)
        {return reply.status(404).send({ error: error?.message || 'Not found' });}
      reply.header('Content-Type', 'application/json');
      return await data.text();
    }
  );

  app.delete(
    '/api/files/delete',
    { preHandler: rateLimiter({ key: 'files:delete', limitPerMinute: 60 }) },
    async (req, reply) => {
      const admin = getSupabaseAdmin();
      if (!admin)
        {return reply
          .status(501)
          .send({ error: 'Supabase not configured on server' });}
      const authHeader = req.headers['authorization'];
      const auth = typeof authHeader === 'string' ? authHeader : '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
      const userId = await verifySupabaseToken(token);
      if (!userId) {return reply.status(401).send({ error: 'Unauthorized' });}
      const schema = z.object({ filename: z.string().min(1).max(200) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        {return reply.status(400).send({ error: 'Invalid payload' });}
      const { filename } = parsed.data;
      if (!/^[a-zA-Z0-9._-]+$/.test(filename))
        {return reply.status(400).send({ error: 'Invalid filename' });}
      const bucket = process.env.SUPABASE_BUCKET || 'graphs';
      const path = `${userId}/${filename}`;
      metrics.mark('files.delete');
      const { error } = await admin.storage.from(bucket).remove([path]);
      if (error) {return reply.status(500).send({ error: error.message });}
      return { success: true };
    }
  );
}
