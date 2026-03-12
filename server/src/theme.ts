import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getSupabaseAdmin } from './services/supabase';
import { rateLimiter } from './utils/rateLimit';
import { requireAdminAuth } from './utils/adminAuth';
import { Pool } from 'pg';
import multipart from '@fastify/multipart';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function themeRoutes(app: FastifyInstance) {
  app.register(multipart);
  const adminAuthHandler = (request, reply, done) => {
    if (!requireAdminAuth(request, reply)) {
      return;
    }
    done();
  };

  app.get(
    '/api/admin/theme',
    {
      preHandler: [
        adminAuthHandler,
        rateLimiter({ key: 'admin:theme', limitPerMinute: 60 })
      ]
    },
    async (req, reply) => {
      try {
        const result = await pool.query(
          'SELECT * FROM theme_config ORDER BY created_at DESC LIMIT 1'
        );
        return result.rows[0] || { colors: {}, typography: {}, branding: {} };
      } catch (error) {
        app.log.error(error);
        const message =
          error instanceof Error ? error.message : 'Failed to get theme';
        return reply.status(500).send({ error: message });
      }
    }
  );

  app.put(
    '/api/admin/theme',
    {
      preHandler: [
        adminAuthHandler,
        rateLimiter({ key: 'admin:theme:update', limitPerMinute: 30 })
      ]
    },
    async (req, reply) => {
      const schema = z.object({
        colors: z.record(z.unknown()).optional(),
        typography: z.record(z.unknown()).optional(),
        branding: z.record(z.unknown()).optional()
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        {return reply.status(400).send({ error: 'Invalid payload' });}
      const { colors, typography, branding } = parsed.data;
      try {
        await pool.query(
          'INSERT INTO theme_config (colors, typography, branding) VALUES ($1, $2, $3)',
          [colors, typography, branding]
        );
        return { success: true };
      } catch (error) {
        app.log.error(error);
        const message =
          error instanceof Error ? error.message : 'Failed to update theme';
        return reply.status(500).send({ error: message });
      }
    }
  );

  const admin = getSupabaseAdmin();
  if (admin) {
    app.post(
      '/api/admin/fonts',
      {
        preHandler: [
          adminAuthHandler,
          rateLimiter({
            key: 'admin:fonts:upload',
            limitPerMinute: 30
          })
        ]
      },
      async (req, reply) => {
        try {
          const data = await req.file();
          if (!data)
            {return reply.status(400).send({ error: 'No file uploaded' });}
          const admin = getSupabaseAdmin();
          if (admin) {
            const bucket = 'fonts';
            const path = `font-${Date.now()}-${data.filename}`;
            const { error } = await admin.storage
              .from(bucket)
              .upload(path, data.file);
            if (!error) {
              const result = await pool.query(
                'INSERT INTO uploaded_fonts (filename, original_name, file_path, font_family) VALUES ($1, $2, $3, $4) RETURNING id, font_family',
                [
                  data.filename,
                  data.filename,
                  path,
                  data.filename.replace(/\.[^/.]+$/, '')
                ]
              );
              return {
                success: true,
                path,
                id: result.rows[0].id,
                fontFamily: result.rows[0].font_family
              };
            } else {
              return { error: error.message };
            }
          } else {
            return { error: 'Supabase not configured' };
          }
        } catch (error) {
          app.log.error(error);
          const message =
            error instanceof Error ? error.message : 'Failed to upload font';
          return reply.status(500).send({ error: message });
        }
      }
    );

    app.delete(
      '/api/admin/fonts/:id',
      {
        preHandler: [
          adminAuthHandler,
          rateLimiter({
            key: 'admin:fonts:delete',
            limitPerMinute: 30
          })
        ]
      },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
          // Get font details from database
          const fontResult = await pool.query(
            'SELECT * FROM uploaded_fonts WHERE id = $1',
            [id]
          );
          if (fontResult.rows.length === 0) {
            return reply.status(404).send({ error: 'Font not found' });
          }

          const font = fontResult.rows[0];

          // Delete from storage if Supabase is configured
          const admin = getSupabaseAdmin();
          if (admin && font.file_path) {
            const { error } = await admin.storage
              .from('fonts')
              .remove([font.file_path]);
            if (error) {
              app.log.error('Failed to delete font from storage:', error);
            }
          }

          // Delete from database
          await pool.query('DELETE FROM uploaded_fonts WHERE id = $1', [id]);

          return { success: true };
        } catch (error) {
          app.log.error(error);
          const message =
            error instanceof Error ? error.message : 'Failed to delete font';
          return reply.status(500).send({ error: message });
        }
      }
    );

    app.post(
      '/api/admin/logo',
      {
        preHandler: [
          adminAuthHandler,
          rateLimiter({
            key: 'admin:logo:upload',
            limitPerMinute: 30
          })
        ]
      },
      async (req, reply) => {
        try {
          const data = await req.file();
          if (!data)
            {return reply.status(400).send({ error: 'No file uploaded' });}

          const admin = getSupabaseAdmin();
          if (admin) {
            const bucket = 'logos';
            const path = `logo-${Date.now()}-${data.filename}`;
            const fileBuffer = await data.toBuffer();

            const { error } = await admin.storage
              .from(bucket)
              .upload(path, fileBuffer, {
                contentType: data.mimetype,
                upsert: true
              });

            if (!error) {
              // Delete old logo if exists
              const oldLogoResult = await pool.query(
                'SELECT * FROM logo ORDER BY uploaded_at DESC LIMIT 1'
              );
              if (oldLogoResult.rows.length > 0) {
                const oldLogo = oldLogoResult.rows[0];
                await admin.storage.from(bucket).remove([oldLogo.file_path]);
                await pool.query('DELETE FROM logo WHERE id = $1', [
                  oldLogo.id
                ]);
              }

              // Insert new logo
              await pool.query(
                'INSERT INTO logo (filename, file_path) VALUES ($1, $2)',
                [data.filename, path]
              );

              return { success: true, filename: data.filename, path };
            } else {
              return reply.status(500).send({ error: error.message });
            }
          } else {
            // Fallback: Store path reference only
            await pool.query(
              'INSERT INTO logo (filename, file_path) VALUES ($1, $2)',
              [data.filename, `local/${data.filename}`]
            );
            return { success: true, filename: data.filename };
          }
        } catch (error) {
          app.log.error(error);
          const message =
            error instanceof Error ? error.message : 'Failed to upload logo';
          return reply.status(500).send({ error: message });
        }
      }
    );

    app.delete(
      '/api/admin/logo',
      {
        preHandler: [
          adminAuthHandler,
          rateLimiter({
            key: 'admin:logo:delete',
            limitPerMinute: 30
          })
        ]
      },
      async (req, reply) => {
        try {
          // Get current logo from database
          const logoResult = await pool.query(
            'SELECT * FROM logo ORDER BY uploaded_at DESC LIMIT 1'
          );
          if (logoResult.rows.length === 0) {
            return reply.status(404).send({ error: 'No logo found' });
          }

          const logo = logoResult.rows[0];

          // Delete from storage if Supabase is configured
          const admin = getSupabaseAdmin();
          if (admin && logo.file_path && !logo.file_path.startsWith('local/')) {
            const { error } = await admin.storage
              .from('logos')
              .remove([logo.file_path]);
            if (error) {
              app.log.error('Failed to delete logo from storage:', error);
            }
          }

          // Delete from database
          await pool.query('DELETE FROM logo WHERE id = $1', [logo.id]);

          return { success: true };
        } catch (error) {
          app.log.error(error);
          const message =
            error instanceof Error ? error.message : 'Failed to delete logo';
          return reply.status(500).send({ error: message });
        }
      }
    );
  } else {
    app.log.warn('Supabase not configured, file uploads disabled');
  }
}
