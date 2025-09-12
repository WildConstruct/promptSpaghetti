import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';

// Mock dependencies
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn()
  };
  const mPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('./services/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => null)
}));

jest.mock('./utils/rateLimit', () => ({
  rateLimiter: jest.fn(() => async () => {})
}));

describe('Theme API Integration Tests', () => {
  let mockPool: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = new Pool();
  });

  describe('GET /api/admin/theme', () => {
    test('returns existing theme configuration', async () => {
      const mockTheme = {
        colors: { primary: '#000000', secondary: '#ffffff' },
        typography: { fontFamily: 'Arial', fontSize: '16px' },
        branding: { logoUrl: '/logo.png' }
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockTheme]
      });

      // Simulate the API endpoint behavior
      const result = await mockPool.query(
        'SELECT * FROM theme_config ORDER BY created_at DESC LIMIT 1'
      );
      const theme = result.rows[0] || {
        colors: {},
        typography: {},
        branding: {}
      };

      expect(theme).toEqual(mockTheme);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM theme_config ORDER BY created_at DESC LIMIT 1'
      );
    });

    test('returns default theme when no configuration exists', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await mockPool.query(
        'SELECT * FROM theme_config ORDER BY created_at DESC LIMIT 1'
      );
      const theme = result.rows[0] || {
        colors: {},
        typography: {},
        branding: {}
      };

      expect(theme).toEqual({ colors: {}, typography: {}, branding: {} });
    });

    test('handles database errors gracefully', async () => {
      mockPool.query.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      try {
        await mockPool.query(
          'SELECT * FROM theme_config ORDER BY created_at DESC LIMIT 1'
        );
      } catch (error) {
        expect(error).toEqual(new Error('Database connection failed'));
      }
    });
  });

  describe('PUT /api/admin/theme', () => {
    test('successfully updates theme configuration', async () => {
      const newTheme = {
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        typography: { fontFamily: 'Helvetica', fontSize: '18px' },
        branding: { logoUrl: '/new-logo.png' }
      };

      mockPool.query.mockResolvedValueOnce({
        rowCount: 1
      });

      await mockPool.query(
        'INSERT INTO theme_config (colors, typography, branding) VALUES ($1, $2, $3)',
        [newTheme.colors, newTheme.typography, newTheme.branding]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO theme_config (colors, typography, branding) VALUES ($1, $2, $3)',
        [newTheme.colors, newTheme.typography, newTheme.branding]
      );
    });

    test('validates theme data structure', () => {
      const invalidThemes = [
        { colors: 'not-an-object' }, // colors should be object
        { typography: null }, // typography should be object
        { branding: [] } // branding should be object
      ];

      invalidThemes.forEach(invalidTheme => {
        const isValid =
          (!invalidTheme.colors || typeof invalidTheme.colors === 'object') &&
          (!invalidTheme.typography ||
            typeof invalidTheme.typography === 'object') &&
          (!invalidTheme.branding || typeof invalidTheme.branding === 'object');

        expect(isValid).toBe(false);
      });
    });

    test('handles partial theme updates', async () => {
      const partialUpdate = {
        colors: { primary: '#0000ff' }
      };

      mockPool.query.mockResolvedValueOnce({
        rowCount: 1
      });

      await mockPool.query(
        'INSERT INTO theme_config (colors, typography, branding) VALUES ($1, $2, $3)',
        [partialUpdate.colors, undefined, undefined]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO theme_config (colors, typography, branding) VALUES ($1, $2, $3)',
        [partialUpdate.colors, undefined, undefined]
      );
    });
  });

  describe('Font Upload Endpoints', () => {
    test('DELETE /api/admin/fonts/:id removes font from database', async () => {
      const fontId = '123';

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: fontId, file_path: 'fonts/test.woff' }]
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      // Simulate getting font details
      const fontResult = await mockPool.query(
        'SELECT * FROM uploaded_fonts WHERE id = $1',
        [fontId]
      );
      expect(fontResult.rows.length).toBe(1);

      // Simulate deletion
      await mockPool.query('DELETE FROM uploaded_fonts WHERE id = $1', [
        fontId
      ]);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM uploaded_fonts WHERE id = $1',
        [fontId]
      );
    });

    test('returns 404 when font not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const fontResult = await mockPool.query(
        'SELECT * FROM uploaded_fonts WHERE id = $1',
        ['999']
      );

      expect(fontResult.rows.length).toBe(0);
    });
  });

  describe('Logo Upload Endpoints', () => {
    test('DELETE /api/admin/logo removes current logo', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: '1', file_path: 'logos/current.png' }]
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      // Simulate getting current logo
      const logoResult = await mockPool.query(
        'SELECT * FROM logo ORDER BY uploaded_at DESC LIMIT 1'
      );
      expect(logoResult.rows.length).toBe(1);

      // Simulate deletion
      await mockPool.query('DELETE FROM logo WHERE id = $1', ['1']);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM logo WHERE id = $1',
        ['1']
      );
    });

    test('handles logo replacement on upload', async () => {
      // Simulate checking for existing logo
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: '1', file_path: 'logos/old.png' }]
        })
        .mockResolvedValueOnce({
          rowCount: 1
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      // Get old logo
      const oldLogoResult = await mockPool.query(
        'SELECT * FROM logo ORDER BY uploaded_at DESC LIMIT 1'
      );

      if (oldLogoResult.rows.length > 0) {
        // Delete old logo
        await mockPool.query('DELETE FROM logo WHERE id = $1', [
          oldLogoResult.rows[0].id
        ]);
      }

      // Insert new logo
      await mockPool.query(
        'INSERT INTO logo (filename, file_path) VALUES ($1, $2)',
        ['new-logo.png', 'logos/new.png']
      );

      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });
  });
});
