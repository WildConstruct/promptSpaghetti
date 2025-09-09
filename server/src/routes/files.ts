import { FastifyInstance } from 'fastify';
import { getSupabaseAdmin } from '../services/supabase';

export async function filesRoutes(app: FastifyInstance) {
  app.get('/api/files/list', async (req, reply) => {
    const admin = getSupabaseAdmin();
    if (!admin) return reply.status(501).send({ error: 'Supabase not configured on server' });
    // Basic user scoping by header (JWT from client). In real app, verify JWT and extract user id.
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    const bucket = process.env.SUPABASE_BUCKET || 'graphs';
    const path = `${userId}/`;
    const { data, error } = await admin.storage.from(bucket).list(path, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/api/files/upload', async (req, reply) => {
    const admin = getSupabaseAdmin();
    if (!admin) return reply.status(501).send({ error: 'Supabase not configured on server' });
    const body = (req as any).body as { filename: string; content: string; userId?: string };
    if (!body || !body.filename || !body.content) return reply.status(400).send({ error: 'filename and content required' });
    const userId = body.userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const bucket = process.env.SUPABASE_BUCKET || 'graphs';
    const path = `${userId}/${body.filename}`;
    const { error } = await admin.storage.from(bucket).upload(path, Buffer.from(body.content, 'utf-8'), { upsert: true, contentType: 'application/json' });
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true, path };
  });

  app.get('/api/files/download', async (req, reply) => {
    const admin = getSupabaseAdmin();
    if (!admin) return reply.status(501).send({ error: 'Supabase not configured on server' });
    const query = (req as any).query as { filename: string; userId?: string };
    if (!query || !query.filename) return reply.status(400).send({ error: 'filename required' });
    const userId = query.userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const bucket = process.env.SUPABASE_BUCKET || 'graphs';
    const path = `${userId}/${query.filename}`;
    const { data, error } = await admin.storage.from(bucket).download(path);
    if (error || !data) return reply.status(404).send({ error: error?.message || 'Not found' });
    reply.header('Content-Type', 'application/json');
    return await data.text();
  });

  app.delete('/api/files/delete', async (req, reply) => {
    const admin = getSupabaseAdmin();
    if (!admin) return reply.status(501).send({ error: 'Supabase not configured on server' });
    const body = (req as any).body as { filename: string; userId?: string };
    if (!body || !body.filename) return reply.status(400).send({ error: 'filename required' });
    const userId = body.userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const bucket = process.env.SUPABASE_BUCKET || 'graphs';
    const path = `${userId}/${body.filename}`;
    const { error } = await admin.storage.from(bucket).remove([path]);
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });
}

