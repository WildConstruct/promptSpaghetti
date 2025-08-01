/**
 * Epic 16 Marketplace Leaderboard Service
 * Task: E16-1753114247137-1F7DE2 - Implement leaderboards
 * 
 * Comprehensive leaderboard system for marketplace templates, creators, categories,
 * and user engagement with real-time rankings and performance tracking.
 */

import { Database } from '../database/connection';
import { EventEmitter } from 'events';
import { BadgeSystem } from '../../../packages/core/gamification/BadgeSystem';

// =============================================================================
// Leaderboard Types and Interfaces
// =============================================================================



export interface LeaderboardEntry {
  id: string;
  name: string;
  rank: number;
  score: number;
  change: number; // Position change from previous period
  metadata: Record<string, any>;
  lastUpdated: Date;







export interface TemplateLeaderboardEntry extends LeaderboardEntry {
  templateId: string;
  title: string;
  creatorId: string;
  creatorName: string;
  totalPurchases: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  categoryName: string;
  createdAt: Date;




export interface CreatorLeaderboardEntry extends LeaderboardEntry {
  creatorId: string;
  displayName: string;
  totalRevenue: number;
  templateCount: number;
  averageRating: number;
  totalReviews: number;
  badgeCount: number;
  verificationBadges: string[];
  joinedAt: Date;




export interface CategoryLeaderboardEntry extends LeaderboardEntry {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  templateCount: number;
  totalPurchases: number;
  averageRating: number;
  growthRate: number;
  topTemplate: {
    id: string;
    title: string;
    revenue: number;
  };




export interface UserEngagementEntry extends LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  badgeCount: number;
  level: number;
  reviewsWritten: number;
  helpfulVotes: number;
  templatesCreated: number;
  achievements: string[];




export interface LeaderboardQuery {
  type: 'templates' | 'creators' | 'categories' | 'engagement';
  metric: string;
  timeframe: '24h' | '7d' | '30d' | '90d' | 'all';
  category?: string;
  limit: number;
  offset: number;
  includeHistory?: boolean;







export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: Date;
  timeframe: string;
  metadata: {
    averageScore: number;
    topScore: number;
    totalParticipants: number;
    updateFrequency: string;



  };


// =============================================================================
// Marketplace Leaderboard Service
// =============================================================================

export class MarketplaceLeaderboardService extends EventEmitter {
  private database: Database;
  private badgeSystem: BadgeSystem;
  private leaderboardCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(database: Database, badgeSystem: BadgeSystem) {
    super();
    this.database = database;
    this.badgeSystem = badgeSystem;

    // Set up periodic cache refresh
    setInterval(() => this.refreshCaches(), 10 * 60 * 1000); // Every 10 minutes


  // =============================================================================
  // Template Leaderboards
  // =============================================================================

  async getTemplateLeaderboard(
    metric: 'revenue' | 'purchases' | 'rating' | 'trending',
    timeframe: string = 'all',
    categoryId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TemplateLeaderboardEntry[]> {

    try {
      const cacheKey = `templates_${metric}_${timeframe}_${categoryId || 'all'}_${limit}_${offset}`;
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;


      let orderBy: string;
      let whereClause = 'WHERE mt.status = \'listed\'';
      const queryParams: any[] = [];

      // Add timeframe filter
      if (timeframe !== 'all') {
        const timeFilter = this.getTimeFilter(timeframe);
        whereClause += ` AND mt.created_at >= $${queryParams.length + 1}`;
        queryParams.push(timeFilter);


      // Add category filter
      if (categoryId) {
        whereClause += ` AND tc.id = $${queryParams.length + 1}`;
        queryParams.push(categoryId);


      // Set ordering based on metric
      switch (metric) {
      case 'revenue':
        orderBy = 'total_revenue DESC, total_purchases DESC';
        break;
      case 'purchases':
        orderBy = 'total_purchases DESC, total_revenue DESC';
        break;
      case 'rating':
        orderBy = 'avg_rating DESC, total_reviews DESC';
        whereClause += ' AND total_reviews >= 5'; // Minimum reviews for rating leaderboard
        break;
      case 'trending':
        // Trending based on recent purchase velocity
        const trendingTimeFilter = this.getTimeFilter('7d');
        whereClause += ` AND EXISTS (
            SELECT 1 FROM marketplace_purchases mp 
            WHERE mp.template_id = mt.id 
            AND mp.created_at >= $${queryParams.length + 1}
            AND mp.status = 'succeeded'
          )`;
        queryParams.push(trendingTimeFilter);
        orderBy = 'total_purchases DESC, total_revenue DESC';
        break;
      default:
        orderBy = 'total_revenue DESC';


      const query = `
        WITH ranked_templates AS (
          SELECT 
            mt.id as template_id,
            mt.title,
            mt.owner_id as creator_id,
            u.name as creator_name,
            stats.total_purchases,
            stats.total_revenue,
            stats.avg_rating,
            stats.total_reviews,
            COALESCE(tc.name, 'Uncategorized') as category_name,
            mt.created_at,
            ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
          FROM marketplace_templates mt
          JOIN users u ON mt.owner_id = u.id
          LEFT JOIN marketplace_template_stats stats ON mt.id = stats.id
          LEFT JOIN template_category_mappings tcm ON mt.id = tcm.template_id
          LEFT JOIN template_categories tc ON tcm.category_id = tc.id
          ${whereClause}
          ORDER BY ${orderBy}
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}

        SELECT * FROM ranked_templates
      `;

      queryParams.push(limit, offset);
      const result = await this.database.query(query, queryParams);

      const leaderboard: TemplateLeaderboardEntry[] = result.rows.map((row, index) => ({
        id: row.template_id,
        name: row.title,
        rank: row.rank || (offset + index + 1),
        score: this.calculateTemplateScore(row, metric),
        change: 0, // Would calculate from historical data
        metadata: {
          metric,
          timeframe,
          category: row.category_name

        lastUpdated: new Date(),
        templateId: row.template_id,
        title: row.title,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        totalPurchases: parseInt(row.total_purchases) || 0,
        totalRevenue: parseInt(row.total_revenue) || 0,
        averageRating: parseFloat(row.avg_rating) || 0,
        totalReviews: parseInt(row.total_reviews) || 0,
        categoryName: row.category_name,
        createdAt: new Date(row.created_at)
      }));

      // Cache the result
      this.setCache(cacheKey, leaderboard);

      return leaderboard;
 catch (error) {
      console.error('Failed to get template leaderboard:', error);
      return [];



  // =============================================================================
  // Creator Leaderboards
  // =============================================================================

  async getCreatorLeaderboard(
    metric: 'revenue' | 'templates' | 'rating' | 'badges',
    timeframe: string = 'all',
    limit: number = 50,
    offset: number = 0
  ): Promise<CreatorLeaderboardEntry[]> {

    try {
      const cacheKey = `creators_${metric}_${timeframe}_${limit}_${offset}`;
      
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;


      let orderBy: string;
      let selectFields = '';
            let whereClause = 'WHERE mt.status = \'listed\'';
      const queryParams: any[] = [];

      // Add timeframe filter
      if (timeframe !== 'all') {
        const timeFilter = this.getTimeFilter(timeframe);
        whereClause += ` AND mt.created_at >= $${queryParams.length + 1}`;
        queryParams.push(timeFilter);


      // Set fields and ordering based on metric
      switch (metric) {
      case 'revenue':
        selectFields = `
            SUM(stats.total_revenue) as total_revenue,
            COUNT(mt.id) as template_count,
            AVG(stats.avg_rating) as avg_rating,
            SUM(stats.total_reviews) as total_reviews
          `;
        orderBy = 'total_revenue DESC, template_count DESC';
        break;
      case 'templates':
        selectFields = `
            COUNT(mt.id) as template_count,
            SUM(stats.total_revenue) as total_revenue,
            AVG(stats.avg_rating) as avg_rating,
            SUM(stats.total_reviews) as total_reviews
          `;
        orderBy = 'template_count DESC, total_revenue DESC';
        break;
      case 'rating':
        selectFields = `
            AVG(stats.avg_rating) as avg_rating,
            SUM(stats.total_reviews) as total_reviews,
            COUNT(mt.id) as template_count,
            SUM(stats.total_revenue) as total_revenue
          `;
        whereClause += ' AND stats.total_reviews >= 10'; // Minimum reviews threshold
        orderBy = 'avg_rating DESC, total_reviews DESC';
        break;
      case 'badges':
        // Would integrate with badge system
        selectFields = `
            COUNT(mt.id) as template_count,
            SUM(stats.total_revenue) as total_revenue,
            AVG(stats.avg_rating) as avg_rating,
            SUM(stats.total_reviews) as total_reviews
          `;
        orderBy = 'template_count DESC'; // Simplified for now
        break;
      default:
        selectFields = `
            SUM(stats.total_revenue) as total_revenue,
            COUNT(mt.id) as template_count,
            AVG(stats.avg_rating) as avg_rating,
            SUM(stats.total_reviews) as total_reviews
          `;
        orderBy = 'total_revenue DESC';


      const query = `
        WITH ranked_creators AS (
          SELECT 
            u.id as creator_id,
            u.name as display_name,
            ${selectFields},
            u.created_at as joined_at,
            ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
          FROM users u
          JOIN marketplace_templates mt ON u.id = mt.owner_id
          LEFT JOIN marketplace_template_stats stats ON mt.id = stats.id
          ${whereClause}
          GROUP BY u.id, u.name, u.created_at
          ORDER BY ${orderBy}
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}

        SELECT * FROM ranked_creators
      `;

      queryParams.push(limit, offset);
      const result = await this.database.query(query, queryParams);

      const leaderboard: CreatorLeaderboardEntry[] = await Promise.all(
        result.rows.map(async (row, index) => {
          // Get badge information from BadgeSystem
          const badgeInfo = await this.badgeSystem.getUserBadges(row.creator_id);
          
          return {
            id: row.creator_id,
            name: row.display_name,
            rank: row.rank || (offset + index + 1),
            score: this.calculateCreatorScore(row, metric),
            change: 0, // Would calculate from historical data
            metadata: {
              metric,
              timeframe

            lastUpdated: new Date(),
            creatorId: row.creator_id,
            displayName: row.display_name,
            totalRevenue: parseInt(row.total_revenue) || 0,
            templateCount: parseInt(row.template_count) || 0,
            averageRating: parseFloat(row.avg_rating) || 0,
            totalReviews: parseInt(row.total_reviews) || 0,
            badgeCount: badgeInfo.totalCount || 0,
            verificationBadges: badgeInfo.badges?.filter((b: any) => b.category === 'verification').map((b: any) => b.name) || [],
            joinedAt: new Date(row.joined_at)
          };

      );

      this.setCache(cacheKey, leaderboard);
      return leaderboard;
 catch (error) {
      console.error('Failed to get creator leaderboard:', error);
      return [];



  // =============================================================================
  // Category Leaderboards
  // =============================================================================

  async getCategoryLeaderboard(
    metric: 'revenue' | 'templates' | 'growth',
    timeframe: string = 'all',
    limit: number = 20,
    offset: number = 0
  ): Promise<CategoryLeaderboardEntry[]> {

    try {
      const cacheKey = `categories_${metric}_${timeframe}_${limit}_${offset}`;
      
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;


      let orderBy: string;
      let whereClause = 'WHERE mt.status = \'listed\'';
      const queryParams: any[] = [];

      // Add timeframe filter
      if (timeframe !== 'all') {
        const timeFilter = this.getTimeFilter(timeframe);
        whereClause += ` AND mt.created_at >= $${queryParams.length + 1}`;
        queryParams.push(timeFilter);


      switch (metric) {
      case 'revenue':
        orderBy = 'total_revenue DESC, template_count DESC';
        break;
      case 'templates':
        orderBy = 'template_count DESC, total_revenue DESC';
        break;
      case 'growth':
        orderBy = 'growth_rate DESC, total_revenue DESC';
        break;
      default:
        orderBy = 'total_revenue DESC';


      const query = `
        WITH category_stats AS (
          SELECT 
            tc.id as category_id,
            tc.name as category_name,
            COUNT(mt.id) as template_count,
            SUM(stats.total_revenue) as total_revenue,
            SUM(stats.total_purchases) as total_purchases,
            AVG(stats.avg_rating) as avg_rating,
            -- Simple growth calculation (would be more sophisticated in real implementation)
            CASE 
              WHEN COUNT(mt.id) > 0 THEN 
                (COUNT(CASE WHEN mt.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::float / COUNT(mt.id)) * 100
              ELSE 0 
            END as growth_rate
          FROM template_categories tc
          LEFT JOIN template_category_mappings tcm ON tc.id = tcm.category_id
          LEFT JOIN marketplace_templates mt ON tcm.template_id = mt.id
          LEFT JOIN marketplace_template_stats stats ON mt.id = stats.id
          ${whereClause}
          GROUP BY tc.id, tc.name
        ),
        top_templates AS (
          SELECT DISTINCT ON (tc.id)
            tc.id as category_id,
            mt.id as top_template_id,
            mt.title as top_template_title,
            stats.total_revenue as top_template_revenue
          FROM template_categories tc
          LEFT JOIN template_category_mappings tcm ON tc.id = tcm.category_id
          LEFT JOIN marketplace_templates mt ON tcm.template_id = mt.id
          LEFT JOIN marketplace_template_stats stats ON mt.id = stats.id
          WHERE mt.status = 'listed'
          ORDER BY tc.id, stats.total_revenue DESC
        ),
        ranked_categories AS (
          SELECT 
            cs.*,
            tt.top_template_id,
            tt.top_template_title,
            tt.top_template_revenue,
            ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
          FROM category_stats cs
          LEFT JOIN top_templates tt ON cs.category_id = tt.category_id
          WHERE cs.template_count > 0
          ORDER BY ${orderBy}
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}

        SELECT * FROM ranked_categories
      `;

      queryParams.push(limit, offset);
      const result = await this.database.query(query, queryParams);

      const leaderboard: CategoryLeaderboardEntry[] = result.rows.map((row, index) => ({
        id: row.category_id,
        name: row.category_name,
        rank: row.rank || (offset + index + 1),
        score: this.calculateCategoryScore(row, metric),
        change: 0,
        metadata: {
          metric,
          timeframe

        lastUpdated: new Date(),
        categoryId: row.category_id,
        categoryName: row.category_name,
        totalRevenue: parseInt(row.total_revenue) || 0,
        templateCount: parseInt(row.template_count) || 0,
        totalPurchases: parseInt(row.total_purchases) || 0,
        averageRating: parseFloat(row.avg_rating) || 0,
        growthRate: parseFloat(row.growth_rate) || 0,
        topTemplate: {
          id: row.top_template_id || '',
          title: row.top_template_title || '',
          revenue: parseInt(row.top_template_revenue) || 0

      }));

      this.setCache(cacheKey, leaderboard);
      return leaderboard;
 catch (error) {
      console.error('Failed to get category leaderboard:', error);
      return [];



  // =============================================================================
  // User Engagement Leaderboards
  // =============================================================================

  async getUserEngagementLeaderboard(
    metric: 'points' | 'badges' | 'reviews' | 'contributions',
    limit: number = 50,
    offset: number = 0
  ): Promise<UserEngagementEntry[]> {

    try {
      const cacheKey = `engagement_${metric}_${limit}_${offset}`;
      
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;


      // Get badge system leaderboard as base
      const badgeLeaderboard = await this.badgeSystem.getLeaderboard();

      // Enhance with additional marketplace data
      const leaderboard: UserEngagementEntry[] = await Promise.all(
        badgeLeaderboard.slice(offset, offset + limit).map(async (entry, index) => {
          // Get additional user engagement data
          const engagementQuery = `
            SELECT 
              COUNT(DISTINCT tr.id) as reviews_written,
              COUNT(DISTINCT mt.id) as templates_created,
              -- Would add helpful votes calculation here
              0 as helpful_votes
            FROM users u
            LEFT JOIN template_reviews tr ON u.id = tr.buyer_id
            LEFT JOIN marketplace_templates mt ON u.id = mt.owner_id
            WHERE u.id = $1
            GROUP BY u.id
          `;

          const engagementResult = await this.database.query(engagementQuery, [entry.userId]);
          const engagementData = engagementResult.rows[0] || {
            reviews_written: 0,
            templates_created: 0,
            helpful_votes: 0
          };

          return {
            id: entry.userId,
            name: entry.userName,
            rank: offset + index + 1,
            score: this.calculateEngagementScore(entry, metric),
            change: 0,
            metadata: {
              metric

            lastUpdated: new Date(),
            userId: entry.userId,
            userName: entry.userName,
            totalPoints: entry.totalPoints,
            badgeCount: entry.badgeCount,
            level: entry.level,
            reviewsWritten: parseInt(engagementData.reviews_written) || 0,
            helpfulVotes: parseInt(engagementData.helpful_votes) || 0,
            templatesCreated: parseInt(engagementData.templates_created) || 0,
            achievements: entry.recentBadges || []
          };

      );

      this.setCache(cacheKey, leaderboard);
      return leaderboard;
 catch (error) {
      console.error('Failed to get user engagement leaderboard:', error);
      return [];



  // =============================================================================
  // General Leaderboard Query Method
  // =============================================================================

  async queryLeaderboard(query: LeaderboardQuery): Promise<LeaderboardResponse> {

    try {
      let leaderboard: LeaderboardEntry[];

      switch (query.type) {
      case 'templates':
        leaderboard = await this.getTemplateLeaderboard(
            query.metric as any,
            query.timeframe,
            query.category,
            query.limit,
            query.offset
        );
        break;
      case 'creators':
        leaderboard = await this.getCreatorLeaderboard(
            query.metric as any,
            query.timeframe,
            query.limit,
            query.offset
        );
        break;
      case 'categories':
        leaderboard = await this.getCategoryLeaderboard(
            query.metric as any,
            query.timeframe,
            query.limit,
            query.offset
        );
        break;
      case 'engagement':
        leaderboard = await this.getUserEngagementLeaderboard(
            query.metric as any,
            query.limit,
            query.offset
        );
        break;
      default:
        throw new Error(`Unknown leaderboard type: ${query.type}`);


      // Calculate metadata
      const scores = leaderboard.map(entry => entry.score);
      const metadata = {
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        topScore: scores.length > 0 ? Math.max(...scores) : 0,
        totalParticipants: leaderboard.length,
        updateFrequency: '10 minutes'
      };

      return {
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: query.timeframe,
        metadata
      };
 catch (error) {
      console.error('Failed to query leaderboard:', error);
      return {
        success: false,
        leaderboard: [],
        totalEntries: 0,
        lastUpdated: new Date(),
        timeframe: query.timeframe,
        metadata: {
          averageScore: 0,
          topScore: 0,
          totalParticipants: 0,
          updateFrequency: '10 minutes'

      };



  // =============================================================================
  // Helper Methods
  // =============================================================================

  private getTimeFilter(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // Beginning of time



  private calculateTemplateScore(row: any, metric: string): number {
    switch (metric) {
    case 'revenue':
      return parseInt(row.total_revenue) || 0;
    case 'purchases':
      return parseInt(row.total_purchases) || 0;
    case 'rating':
      return parseFloat(row.avg_rating) || 0;
    case 'trending':
      // Combine purchases and recency for trending score
      const purchases = parseInt(row.total_purchases) || 0;
      const rating = parseFloat(row.avg_rating) || 0;
      return purchases * (rating / 5) * 100;
    default:
      return parseInt(row.total_revenue) || 0;



  private calculateCreatorScore(row: any, metric: string): number {
    switch (metric) {
    case 'revenue':
      return parseInt(row.total_revenue) || 0;
    case 'templates':
      return parseInt(row.template_count) || 0;
    case 'rating':
      return parseFloat(row.avg_rating) || 0;
    case 'badges':
      return parseInt(row.template_count) || 0; // Simplified
    default:
      return parseInt(row.total_revenue) || 0;



  private calculateCategoryScore(row: any, metric: string): number {
    switch (metric) {
    case 'revenue':
      return parseInt(row.total_revenue) || 0;
    case 'templates':
      return parseInt(row.template_count) || 0;
    case 'growth':
      return parseFloat(row.growth_rate) || 0;
    default:
      return parseInt(row.total_revenue) || 0;



  private calculateEngagementScore(entry: any, metric: string): number {
    switch (metric) {
    case 'points':
      return entry.totalPoints || 0;
    case 'badges':
      return entry.badgeCount || 0;
    case 'reviews':
      return entry.reviewsWritten || 0;
    case 'contributions':
      return (entry.reviewsWritten || 0) + (entry.helpfulVotes || 0);
    default:
      return entry.totalPoints || 0;



  private getFromCache(key: string): any {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key);
    
    if (expiry && now < expiry) {
      return this.leaderboardCache.get(key);

    
    // Clean up expired cache
    this.leaderboardCache.delete(key);
    this.cacheExpiry.delete(key);
    return null;


  private setCache(key: string, data: any): void {
    this.leaderboardCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);


  private async refreshCaches(): Promise<void> {

    // Clear expired caches
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.leaderboardCache.delete(key);
        this.cacheExpiry.delete(key);



    // Emit cache refresh event
    this.emit('cache_refreshed', {
      timestamp: new Date(),
      cacheSize: this.leaderboardCache.size
    });


  // =============================================================================
  // Public Utility Methods
  // =============================================================================

  async clearCache(): Promise<void> {

    this.leaderboardCache.clear();
    this.cacheExpiry.clear();


  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.leaderboardCache.size,
      entries: Array.from(this.leaderboardCache.keys())
    };



export default MarketplaceLeaderboardService;