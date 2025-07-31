// Epic 16 Story 16.2 - Creator Management Service
import { Pool, PoolClient } from 'pg';

}
}
interface CreatorStats {
  total_templates: number;
  active_templates: number;
  total_revenue_cents: number;
  total_purchases: number;
  avg_rating: number;
  total_reviews: number;
  total_views: number;
  conversion_rate: number;
}
}
}

}
}
interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  website?: string;
  social_links: Record<string, string>;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  creator_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: string[];
  public_profile: boolean;
  created_at: Date;
  updated_at: Date;
}
}
}

}
}
interface MonetizationSettings {
  creator_id: string;
  payout_threshold_cents: number;
  payout_schedule: 'weekly' | 'monthly';
  payment_method: 'stripe' | 'paypal' | 'bank_transfer';
  stripe_account_id?: string;
  paypal_email?: string;
  bank_details?: Record<string, any>;
  tax_settings: {
    tax_id?: string;
    business_name?: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    tax_exempt: boolean;
}
}
  };
  auto_payout_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

}
}
interface CreatorPayoutHistory {
  id: string;
  creator_id: string;
  amount_cents: number;
  currency: string;
  payout_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_payout_id?: string;
  failure_reason?: string;
  processed_at?: Date;
  created_at: Date;
}
}
}

}
}
interface CreatorTemplate {
  id: string;
  title: string;
  status: 'draft' | 'listed' | 'blocked' | 'archived';
  price_cents: number;
  total_purchases: number;
  total_revenue: number;
  avg_rating: number;
  total_reviews: number;
  total_views: number;
  conversion_rate: number;
  created_at: Date;
  updated_at: Date;
}
}
}

}
}
interface PerformanceMetrics {
  period_start: Date;
  period_end: Date;
}
}
  revenue_trend: Array<{ date: string; revenue_cents: number; purchases: number }>;
  top_templates: CreatorTemplate[];
  category_performance: Array<{ category: string; revenue_cents: number; templates: number }>;
  geographic_sales: Array<{ country: string; revenue_cents: number; purchases: number }>;  
}

}
}
interface CreatorTierRequirements {
  bronze: { min_revenue: 0; min_rating: 0; min_templates: 0; min_reviews: 0 };
  silver: { min_revenue: 50000; min_rating: 4.0; min_templates: 5; min_reviews: 25 };
  gold: { min_revenue: 200000; min_rating: 4.3; min_templates: 15; min_reviews: 100 };
  platinum: { min_revenue: 500000; min_rating: 4.5; min_templates: 25; min_reviews: 250 };
}

export class CreatorManagementService {
  private tierRequirements: CreatorTierRequirements = {
    bronze: { min_revenue: 0, min_rating: 0, min_templates: 0, min_reviews: 0 },
    silver: { min_revenue: 50000, min_rating: 4.0, min_templates: 5, min_reviews: 25 },
    gold: { min_revenue: 200000, min_rating: 4.3, min_templates: 15, min_reviews: 100 },
    platinum: { min_revenue: 500000, min_rating: 4.5, min_templates: 25, min_reviews: 250 }
  };

  constructor(private db: Pool) {}

  async getCreatorStats(userId: string, startDate?: Date, endDate?: Date): Promise<CreatorStats> {

    const client = await this.db.connect();
    try {
      const dateFilter = startDate && endDate 
        ? 'AND t.created_at BETWEEN $2 AND $3'
        : '';
      const params = startDate && endDate ? [userId, startDate, endDate] : [userId];

      const result = await client.query(`
        WITH creator_metrics AS (
          SELECT 
            COUNT(DISTINCT t.id) as total_templates,
            COUNT(DISTINCT CASE WHEN t.status = 'listed' THEN t.id END) as active_templates,
            COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) as total_revenue_cents,
            COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p.id END) as total_purchases,
            COALESCE(AVG(CASE WHEN r.moderation_status = 'approved' THEN r.stars END), 0) as avg_rating,
            COUNT(DISTINCT CASE WHEN r.moderation_status = 'approved' THEN r.id END) as total_reviews,
            COALESCE(SUM(
              (SELECT COUNT(*) FROM marketplace_events e 
               WHERE e.template_id = t.id AND e.event_type = 'view')
            ), 0) as total_views
          FROM marketplace_templates t
          LEFT JOIN marketplace_purchases p ON t.id = p.template_id
          LEFT JOIN template_reviews r ON t.id = r.template_id
          WHERE t.owner_id = $1 ${dateFilter}

        SELECT 
          *,
          CASE 
            WHEN total_views > 0 
            THEN total_purchases::FLOAT / total_views 
            ELSE 0 
          END as conversion_rate
        FROM creator_metrics
      `, params);

      const stats = result.rows[0];
      return {
        total_templates: parseInt(stats.total_templates) || 0,
        active_templates: parseInt(stats.active_templates) || 0,
        total_revenue_cents: parseInt(stats.total_revenue_cents) || 0,
        total_purchases: parseInt(stats.total_purchases) || 0,
        avg_rating: parseFloat(stats.avg_rating) || 0,
        total_reviews: parseInt(stats.total_reviews) || 0,
        total_views: parseInt(stats.total_views) || 0,
        conversion_rate: parseFloat(stats.conversion_rate) || 0
      };
    } finally {
      client.release();
    }
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {

    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT * FROM creator_profiles 
        WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        // Create default profile if none exists
        return await this.createCreatorProfile(userId, {
          display_name: 'Creator',
          bio: '',
          website: '',
          social_links: {},
          public_profile: false
        });
      }

      const profile = result.rows[0];
      return {
        ...profile,
        social_links: profile.social_links || {},
        badges: profile.badges || []
      };
    } finally {
      client.release();
    }
  }

  async createCreatorProfile(userId: string, profileData: Partial<CreatorProfile>): Promise<CreatorProfile> {

    const client = await this.db.connect();
    try {
      const result = await client.query(`
        INSERT INTO creator_profiles (
          user_id, display_name, bio, website, social_links, 
          verification_status, creator_tier, badges, public_profile
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        userId,
        profileData.display_name || 'Creator',
        profileData.bio || '',
        profileData.website || '',
        JSON.stringify(profileData.social_links || {}),
        'unverified',
        'bronze',
        JSON.stringify(profileData.badges || []),
        profileData.public_profile || false
      ]);

      const profile = result.rows[0];
      return {
        ...profile,
        social_links: profile.social_links || {},
        badges: profile.badges || []
      };
    } finally {
      client.release();
    }
  }

  async updateCreatorProfile(userId: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile | null> {

    const client = await this.db.connect();
    try {
      const setClauses = [];
      const values = [userId];
      let paramCount = 1;

      if (updates.display_name !== undefined) {
        setClauses.push(`display_name = $${++paramCount}`);
        values.push(updates.display_name);
      }
      if (updates.bio !== undefined) {
        setClauses.push(`bio = $${++paramCount}`);
        values.push(updates.bio);
      }
      if (updates.website !== undefined) {
        setClauses.push(`website = $${++paramCount}`);
        values.push(updates.website);
      }
      if (updates.social_links !== undefined) {
        setClauses.push(`social_links = $${++paramCount}`);
        values.push(JSON.stringify(updates.social_links));
      }
      if (updates.public_profile !== undefined) {
        setClauses.push(`public_profile = $${++paramCount}`);
        values.push(updates.public_profile);
      }

      if (setClauses.length === 0) {
        return this.getCreatorProfile(userId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

      const result = await client.query(`
        UPDATE creator_profiles 
        SET ${setClauses.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      return {
        ...profile,
        social_links: profile.social_links || {},
        badges: profile.badges || []
      };
    } finally {
      client.release();
    }
  }

  async getCreatorTemplates(userId: string): Promise<CreatorTemplate[]> {

    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT 
          t.*,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) as total_revenue,
          COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p.id END) as total_purchases,
          COALESCE(AVG(CASE WHEN r.moderation_status = 'approved' THEN r.stars END), 0) as avg_rating,
          COUNT(DISTINCT CASE WHEN r.moderation_status = 'approved' THEN r.id END) as total_reviews,
          COALESCE((
            SELECT COUNT(*) FROM marketplace_events e 
            WHERE e.template_id = t.id AND e.event_type = 'view'
          ), 0) as total_views
        FROM marketplace_templates t
        LEFT JOIN marketplace_purchases p ON t.id = p.template_id
        LEFT JOIN template_reviews r ON t.id = r.template_id
        WHERE t.owner_id = $1
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        status: row.status,
        price_cents: row.price_cents,
        total_purchases: parseInt(row.total_purchases) || 0,
        total_revenue: parseInt(row.total_revenue) || 0,
        avg_rating: parseFloat(row.avg_rating) || 0,
        total_reviews: parseInt(row.total_reviews) || 0,
        total_views: parseInt(row.total_views) || 0,
        conversion_rate: row.total_views > 0 ? parseInt(row.total_purchases) / parseInt(row.total_views) : 0,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } finally {
      client.release();
    }
  }

  async getMonetizationSettings(userId: string): Promise<MonetizationSettings | null> {

    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT * FROM creator_monetization_settings 
        WHERE creator_id = (SELECT id FROM creator_profiles WHERE user_id = $1)
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const settings = result.rows[0];
      return {
        ...settings,
        tax_settings: settings.tax_settings || {},
        bank_details: settings.bank_details || {}
      };
    } finally {
      client.release();
    }
  }

  async updateMonetizationSettings(
    userId: string,
    settings: Partial<MonetizationSettings>
  ): Promise<MonetizationSettings> {

    const client = await this.db.connect();
    try {
      // First get creator profile ID
      const profileResult = await client.query(`
        SELECT id FROM creator_profiles WHERE user_id = $1
      `, [userId]);

      if (profileResult.rows.length === 0) {
        throw new Error('Creator profile not found');
      }

      const creatorId = profileResult.rows[0].id;

      // Upsert monetization settings
      const result = await client.query(`
        INSERT INTO creator_monetization_settings (
          creator_id, payout_threshold_cents, payout_schedule, payment_method,
          stripe_account_id, paypal_email, bank_details, tax_settings, auto_payout_enabled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (creator_id) DO UPDATE SET
          payout_threshold_cents = EXCLUDED.payout_threshold_cents,
          payout_schedule = EXCLUDED.payout_schedule,
          payment_method = EXCLUDED.payment_method,
          stripe_account_id = EXCLUDED.stripe_account_id,
          paypal_email = EXCLUDED.paypal_email,
          bank_details = EXCLUDED.bank_details,
          tax_settings = EXCLUDED.tax_settings,
          auto_payout_enabled = EXCLUDED.auto_payout_enabled,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        creatorId,
        settings.payout_threshold_cents || 5000,
        settings.payout_schedule || 'monthly',
        settings.payment_method || 'stripe',
        settings.stripe_account_id,
        settings.paypal_email,
        JSON.stringify(settings.bank_details || {}),
        JSON.stringify(settings.tax_settings || {}),
        settings.auto_payout_enabled || false
      ]);

      const updatedSettings = result.rows[0];
      return {
        ...updatedSettings,
        tax_settings: updatedSettings.tax_settings || {},
        bank_details: updatedSettings.bank_details || {}
      };
    } finally {
      client.release();
    }
  }

  async getPerformanceMetrics(userId: string, startDate: Date, endDate: Date): Promise<PerformanceMetrics> {

    const client = await this.db.connect();
    try {
      // Revenue trend over time
      const trendResult = await client.query(`
        SELECT 
          DATE(p.created_at) as date,
          COALESCE(SUM(p.amount_cents), 0) as revenue_cents,
          COUNT(p.id) as purchases
        FROM marketplace_purchases p
        JOIN marketplace_templates t ON p.template_id = t.id
        WHERE t.owner_id = $1 
          AND p.status = 'succeeded'
          AND p.created_at BETWEEN $2 AND $3
        GROUP BY DATE(p.created_at)
        ORDER BY date
      `, [userId, startDate, endDate]);

      // Top performing templates
      const topTemplatesResult = await client.query(`
        SELECT 
          t.id, t.title, t.status, t.price_cents, t.created_at, t.updated_at,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) as total_revenue,
          COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p.id END) as total_purchases,
          COALESCE(AVG(CASE WHEN r.moderation_status = 'approved' THEN r.stars END), 0) as avg_rating,
          COUNT(DISTINCT CASE WHEN r.moderation_status = 'approved' THEN r.id END) as total_reviews,
          COALESCE((
            SELECT COUNT(*) FROM marketplace_events e 
            WHERE e.template_id = t.id AND e.event_type = 'view'
              AND e.created_at BETWEEN $2 AND $3
          ), 0) as total_views
        FROM marketplace_templates t
        LEFT JOIN marketplace_purchases p ON t.id = p.template_id 
          AND p.created_at BETWEEN $2 AND $3
        LEFT JOIN template_reviews r ON t.id = r.template_id 
          AND r.created_at BETWEEN $2 AND $3
        WHERE t.owner_id = $1
        GROUP BY t.id, t.title, t.status, t.price_cents, t.created_at, t.updated_at
        ORDER BY total_revenue DESC
        LIMIT 10
      `, [userId, startDate, endDate]);

      // Category performance
      const categoryResult = await client.query(`
        SELECT 
          c.name as category,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) as revenue_cents,
          COUNT(DISTINCT t.id) as templates
        FROM template_categories c
        JOIN template_category_mappings tcm ON c.id = tcm.category_id
        JOIN marketplace_templates t ON tcm.template_id = t.id AND t.owner_id = $1
        LEFT JOIN marketplace_purchases p ON t.id = p.template_id 
          AND p.created_at BETWEEN $2 AND $3
        GROUP BY c.id, c.name
        ORDER BY revenue_cents DESC
      `, [userId, startDate, endDate]);

      return {
        period_start: startDate,
        period_end: endDate,
        revenue_trend: trendResult.rows.map(row => ({
          date: row.date,
          revenue_cents: parseInt(row.revenue_cents),
          purchases: parseInt(row.purchases)
        })),
        top_templates: topTemplatesResult.rows.map(row => ({
          id: row.id,
          title: row.title,
          status: row.status,
          price_cents: row.price_cents,
          total_purchases: parseInt(row.total_purchases) || 0,
          total_revenue: parseInt(row.total_revenue) || 0,
          avg_rating: parseFloat(row.avg_rating) || 0,
          total_reviews: parseInt(row.total_reviews) || 0,
          total_views: parseInt(row.total_views) || 0,
          conversion_rate: row.total_views > 0 ? parseInt(row.total_purchases) / parseInt(row.total_views) : 0,
          created_at: row.created_at,
          updated_at: row.updated_at
        })),
        category_performance: categoryResult.rows.map(row => ({
          category: row.category,
          revenue_cents: parseInt(row.revenue_cents),
          templates: parseInt(row.templates)
        })),
        geographic_sales: [] // Would need additional geo data tracking
      };
    } finally {
      client.release();
    }
  }

  async calculateCreatorTier(userId: string): Promise<keyof CreatorTierRequirements> {

    const stats = await this.getCreatorStats(userId);

    const tiers: Array<keyof CreatorTierRequirements> = ['platinum', 'gold', 'silver', 'bronze'];
    
    for (const tier of tiers) {
      const requirements = this.tierRequirements[tier];
      if (
        stats.total_revenue_cents >= requirements.min_revenue &&
        stats.avg_rating >= requirements.min_rating &&
        stats.total_templates >= requirements.min_templates &&
        stats.total_reviews >= requirements.min_reviews
      ) {
        return tier;
      }
    }

    return 'bronze';
  }

  async updateCreatorTier(userId: string): Promise<void> {

    const newTier = await this.calculateCreatorTier(userId);
    
    const client = await this.db.connect();
    try {
      await client.query(`
        UPDATE creator_profiles 
        SET creator_tier = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [newTier, userId]);
    } finally {
      client.release();
    }
  }

  async getPayoutHistory(userId: string, limit: number = 50): Promise<CreatorPayoutHistory[]> {

    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT * FROM creator_payout_history cph
        JOIN creator_profiles cp ON cph.creator_id = cp.id
        WHERE cp.user_id = $1
        ORDER BY cph.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async initiatePayout(userId: string): Promise<CreatorPayoutHistory> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get creator's current balance and settings
      const balanceResult = await client.query(`
        SELECT 
          cp.id as creator_id,
          cms.payout_threshold_cents,
          cms.payment_method,
          cms.stripe_account_id,
          cms.paypal_email,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) as total_earned,
          COALESCE(SUM(CASE WHEN ph.status = 'completed' THEN ph.amount_cents END), 0) as total_paid
        FROM creator_profiles cp
        JOIN creator_monetization_settings cms ON cp.id = cms.creator_id
        LEFT JOIN marketplace_templates t ON t.owner_id = cp.user_id
        LEFT JOIN marketplace_purchases p ON p.template_id = t.id
        LEFT JOIN creator_payout_history ph ON ph.creator_id = cp.id
        WHERE cp.user_id = $1
        GROUP BY cp.id, cms.payout_threshold_cents, cms.payment_method, cms.stripe_account_id, cms.paypal_email
      `, [userId]);

      if (balanceResult.rows.length === 0) {
        throw new Error('Creator profile or monetization settings not found');
      }

      const balance = balanceResult.rows[0];
      const availableBalance = balance.total_earned - balance.total_paid;

      if (availableBalance < balance.payout_threshold_cents) {
        throw new Error(
          `Insufficient balance for payout. Available: $${availableBalance/100},
          Threshold: $${balance.payout_threshold_cents/100}`
        );
      }

      // Create payout record
      const payoutResult = await client.query(`
        INSERT INTO creator_payout_history (
          creator_id, amount_cents, currency, payout_method, status
        ) VALUES ($1, $2, 'USD', $3, 'pending')
        RETURNING *
      `, [balance.creator_id, availableBalance, balance.payment_method]);

      await client.query('COMMIT');
      return payoutResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}