import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LocalFragmentSaveRequestSchema = z.object({
  folderPath: z.string().min(1),
  filename: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9._-]*\.psg$/i),
  content: z.string().min(1).max(1_000_000)
});

const LocalFragmentListQuerySchema = z.object({
  folderPath: z.string().min(1)
});

const createFragmentId = (filename: string): string => {
  const base = filename
    .replace(/\.psg$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `user-${base || 'fragment'}`;
};

export async function localFragmentRoutes(app: FastifyInstance) {
  app.get('/api/local-fragments/list', async (req, reply) => {
    const parsed = LocalFragmentListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: 'Invalid local fragment list payload' });
    }

    const root = path.resolve(parsed.data.folderPath);
    if (!path.isAbsolute(root)) {
      return reply
        .status(400)
        .send({ error: 'Folder path must be absolute' });
    }

    const fragmentsDir = path.join(root, 'fragments');

    try {
      const files = (await readdir(fragmentsDir))
        .filter(file => /^[a-z0-9][a-z0-9._-]*\.psg$/i.test(file))
        .sort((left, right) => left.localeCompare(right));

      const fragments = [];
      for (const file of files) {
        const raw = await readFile(path.join(fragmentsDir, file), 'utf8');
        const parsedContent = JSON.parse(raw) as {
          name?: unknown;
          nodes?: unknown;
        };
        const prettyContent = JSON.stringify(parsedContent, null, 2);
        const name =
          typeof parsedContent.name === 'string' &&
          parsedContent.name.trim().length > 0
            ? parsedContent.name.trim()
            : file.replace(/\.psg$/i, '');
        const nodeCount = Array.isArray(parsedContent.nodes)
          ? parsedContent.nodes.length
          : 0;

        fragments.push({
          id: createFragmentId(file),
          name,
          file,
          type: 'MULTI-ASPECT',
          nodes: nodeCount,
          region: 'User Fragments',
          collapsible: true,
          content: prettyContent
        });
      }

      return {
        ok: true,
        fragments
      };
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return {
          ok: true,
          fragments: []
        };
      }

      return reply.status(400).send({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to list local fragments'
      });
    }
  });

  app.post('/api/local-fragments/save', async (req, reply) => {
    const parsed = LocalFragmentSaveRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: 'Invalid local fragment save payload' });
    }

    try {
      JSON.parse(parsed.data.content);
    } catch {
      return reply.status(400).send({ error: 'Fragment content must be JSON' });
    }

    const root = path.resolve(parsed.data.folderPath);
    if (!path.isAbsolute(root)) {
      return reply
        .status(400)
        .send({ error: 'Folder path must be absolute' });
    }

    const fragmentsDir = path.join(root, 'fragments');
    const outputPath = path.join(fragmentsDir, parsed.data.filename);

    if (path.dirname(outputPath) !== fragmentsDir) {
      return reply
        .status(400)
        .send({ error: 'Invalid local fragment save payload' });
    }

    await mkdir(fragmentsDir, { recursive: true });
    await writeFile(outputPath, parsed.data.content, 'utf8');

    return {
      ok: true,
      filename: parsed.data.filename,
      savedPath: outputPath
    };
  });
}
