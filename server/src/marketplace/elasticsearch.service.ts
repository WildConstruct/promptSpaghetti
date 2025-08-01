// Epic 16 Marketplace - Elasticsearch Integration Service
import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { SearchFilters, TemplateWithStats } from './types';
import { MarketplaceDAO } from './dao';
import { Pool } from 'pg';



interface ElasticsearchTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price_cents: number;
  avg_rating: number;
  total_reviews: number;
  total_purchases: number;
  categories: string[];
  owner_name: string;
  owner_verified: boolean;
  is_ai_generated: boolean;
  claude_compat: string[];
  featured_at?: string;
  created_at: string;
  updated_at: string;







interface SearchResponse {
  templates: TemplateWithStats[];
  total: number;
  aggregations?: {



    categories: Array<{ name: string; count: number }>;
    price_ranges: Array<{ min: number; max: number; count: number }>;
    avg_ratings: Array<{ rating: number; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };


@Injectable()
export class ElasticsearchService {
  private client: Client;
  private dao: MarketplaceDAO;
  private readonly INDEX_NAME = 'marketplace_templates';

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
    
    // Initialize Elasticsearch client
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_AUTH ? {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
 : undefined,
      requestTimeout: 30000,
      maxRetries: 3
    });

    this.initializeIndex();


  /**
   * Advanced search with Elasticsearch
   */
  async searchTemplates(filters: SearchFilters): Promise<SearchResponse> {

    try {
      const query = this.buildElasticsearchQuery(filters);
      const response = await this.client.search({
        index: this.INDEX_NAME,
        body: query,
        size: filters.limit || 20,
        from: ((filters.page || 1) - 1) * (filters.limit || 20)
      });

      const templates = await this.processSearchResults(response.body);
      const aggregations = this.processAggregations(response.body.aggregations);

      return {
        templates,
        total: response.body.hits.total.value,
        aggregations
      };
 catch (error) {
      console.error('Elasticsearch search error:', error);
      // Fallback to PostgreSQL search
      return this.fallbackToPostgresSearch(filters);



  /**
   * Get search suggestions and autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {

    try {
      const response = await this.client.search({
        index: this.INDEX_NAME,
        body: {
          suggest: {
            title_suggest: {
              prefix: query,
              completion: {
                field: 'title_suggest',
                size: limit,
                skip_duplicates: true


            tag_suggest: {
              prefix: query,
              completion: {
                field: 'tags_suggest',
                size: limit,
                skip_duplicates: true




      });

      const suggestions = new Set<string>();
      
      // Add title suggestions
      response.body.suggest.title_suggest[0].options.forEach((option: any) => {
        suggestions.add(option.text);
      });

      // Add tag suggestions
      response.body.suggest.tag_suggest[0].options.forEach((option: any) => {
        suggestions.add(option.text);
      });

      return Array.from(suggestions).slice(0, limit);
 catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];



  /**
   * Index a template in Elasticsearch
   */
  async indexTemplate(template: TemplateWithStats): Promise<void> {

    try {
      const doc: ElasticsearchTemplate = {
        id: template.id,
        title: template.title,
        description: template.description || '',
        tags: template.tags,
        price_cents: template.price_cents,
        avg_rating: template.avg_rating,
        total_reviews: template.total_reviews,
        total_purchases: template.total_purchases,
        categories: template.categories || [],
        owner_name: template.owner?.name || '',
        owner_verified: template.owner?.verified || false,
        is_ai_generated: template.is_ai_generated || false,
        claude_compat: template.claude_compat,
        featured_at: template.featured_at,
        created_at: template.created_at,
        updated_at: template.updated_at
      };

      await this.client.index({
        index: this.INDEX_NAME,
        id: template.id,
        body: doc
      });
 catch (error) {
      console.error('Error indexing template:', error);



  /**
   * Remove a template from Elasticsearch
   */
  async removeTemplate(templateId: string): Promise<void> {

    try {
      await this.client.delete({
        index: this.INDEX_NAME,
        id: templateId
      });
 catch (error) {
      console.error('Error removing template from index:', error);



  /**
   * Reindex all templates from database
   */
  async reindexAllTemplates(): Promise<void> {

    try {
      // Delete existing index
      await this.client.indices.delete({
        index: this.INDEX_NAME,
        ignore_unavailable: true
      });

      // Recreate index
      await this.initializeIndex();

      // Get all templates from database
      const templates = await this.dao.searchTemplates({ limit: 10000 });
      
      // Bulk index templates
      if (templates.templates.length > 0) {
        const body = templates.templates.flatMap(template => [
          { index: { _index: this.INDEX_NAME, _id: template.id } },
          this.templateToElasticsearchDoc(template)
        ]);

        await this.client.bulk({ body });


      console.log(`Reindexed ${templates.templates.length} templates`);
 catch (error) {
      console.error('Error reindexing templates:', error);
      throw error;



  /**
   * Get search analytics
   */
  async getSearchAnalytics(timeRange: string = '7d'): Promise<any> {

    try {
      const response = await this.client.search({
        index: this.INDEX_NAME,
        body: {
          size: 0,
          query: {
            range: {
              created_at: {
                gte: `now-${timeRange}`



          aggs: {
            popular_searches: {
              terms: {
                field: 'title.keyword',
                size: 10


            category_distribution: {
              terms: {
                field: 'categories.keyword',
                size: 20


            price_distribution: {
              histogram: {
                field: 'price_cents',
                interval: 500


            rating_distribution: {
              histogram: {
                field: 'avg_rating',
                interval: 0.5




      });

      return response.body.aggregations;
 catch (error) {
      console.error('Error getting search analytics:', error);
      return {};



  /**
   * Initialize Elasticsearch index with proper mappings
   */
  private async initializeIndex(): Promise<void> {

    try {
      const indexExists = await this.client.indices.exists({
        index: this.INDEX_NAME
      });

      if (!indexExists.body) {
        await this.client.indices.create({
          index: this.INDEX_NAME,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              analysis: {
                analyzer: {
                  custom_text: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'stemmer']




            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: {
                  type: 'text',
                  analyzer: 'custom_text',
                  fields: {
                    keyword: { type: 'keyword' },
                    suggest: { type: 'completion' }


                description: {
                  type: 'text',
                  analyzer: 'custom_text'

                tags: {
                  type: 'keyword',
                  fields: {
                    suggest: { type: 'completion' }


                price_cents: { type: 'integer' },
                avg_rating: { type: 'float' },
                total_reviews: { type: 'integer' },
                total_purchases: { type: 'integer' },
                categories: { type: 'keyword' },
                owner_name: {
                  type: 'text',
                  fields: {
                    keyword: { type: 'keyword' }


                owner_verified: { type: 'boolean' },
                is_ai_generated: { type: 'boolean' },
                claude_compat: { type: 'keyword' },
                featured_at: { type: 'date' },
                created_at: { type: 'date' },
                updated_at: { type: 'date' }



        });

        console.log('Elasticsearch index created successfully');

 catch (error) {
      console.error('Error initializing Elasticsearch index:', error);



  /**
   * Build Elasticsearch query from filters
   */
  private buildElasticsearchQuery(filters: SearchFilters): any {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (filters.query) {
      must.push({
        multi_match: {
          query: filters.query,
          fields: ['title^3', 'description^2', 'tags^2', 'categories', 'owner_name'],
          type: 'best_fields',
          fuzziness: 'AUTO'

      });


    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filter.push({
        terms: {
          categories: filters.categories

      });


    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      filter.push({
        terms: {
          tags: filters.tags

      });


    // Price filters
    if (filters.price_min !== undefined || filters.price_max !== undefined) {
      const range: any = {};
      if (filters.price_min !== undefined) range.gte = filters.price_min;
      if (filters.price_max !== undefined) range.lte = filters.price_max;
      
      filter.push({
        range: {
          price_cents: range

      });


    // Rating filter
    if (filters.rating_min !== undefined) {
      filter.push({
        range: {
          avg_rating: {
            gte: filters.rating_min


      });


    // Free/paid filter
    if (filters.is_free === true) {
      filter.push({
        term: {
          price_cents: 0

      });
 else if (filters.is_free === false) {
      filter.push({
        range: {
          price_cents: {
            gt: 0


      });


    // Featured filter
    if (filters.is_featured === true) {
      filter.push({
        exists: {
          field: 'featured_at'

      });


    // Claude model compatibility
    if (filters.claude_models && filters.claude_models.length > 0) {
      filter.push({
        terms: {
          claude_compat: filters.claude_models

      });


    // Build sort
    const sort = this.buildElasticsearchSort(filters.sort_by, !!filters.query);

    // Build aggregations
    const aggs = {
      categories: {
        terms: {
          field: 'categories',
          size: 50


      price_ranges: {
        range: {
          field: 'price_cents',
          ranges: [
            { key: 'free', to: 1 },
            { key: 'low', from: 1, to: 1000 },
            { key: 'medium', from: 1000, to: 5000 },
            { key: 'high', from: 5000 }
          ]


      avg_ratings: {
        histogram: {
          field: 'avg_rating',
          interval: 1,
          min_doc_count: 1


      tags: {
        terms: {
          field: 'tags',
          size: 20


    };

    return {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter


      sort,
      aggs
    };


  /**
   * Build Elasticsearch sort
   */
  private buildElasticsearchSort(sortBy?: string, hasQuery: boolean = false): any[] {
    switch (sortBy) {
    case 'price_asc':
      return [{ price_cents: { order: 'asc' } }];
    case 'price_desc':
      return [{ price_cents: { order: 'desc' } }];
    case 'rating':
      return [
        { avg_rating: { order: 'desc' } },
        { total_reviews: { order: 'desc' } }
      ];
    case 'popularity':
      return [
        { total_purchases: { order: 'desc' } },
        { avg_rating: { order: 'desc' } }
      ];
    case 'newest':
      return [{ created_at: { order: 'desc' } }];
    case 'oldest':
      return [{ created_at: { order: 'asc' } }];
    case 'relevance':
    default:
      if (hasQuery) {
        return [
          '_score',
          { featured_at: { order: 'desc', missing: '_last' } },
          { avg_rating: { order: 'desc' } }
        ];
 else {
        return [
          { featured_at: { order: 'desc', missing: '_last' } },
          { avg_rating: { order: 'desc' } },
          { total_purchases: { order: 'desc' } }
        ];




  /**
   * Process Elasticsearch search results
   */
  private async processSearchResults(esResponse: any): Promise<TemplateWithStats[]> {

    const templateIds = esResponse.hits.hits.map((hit: any) => hit._id);
    
    if (templateIds.length === 0) return [];

    // Get full template data from PostgreSQL to ensure data consistency
    const placeholders = templateIds.map((_: any, i: number) => `$${i + 1}`).join(', ');
    const query = `
      SELECT 
        t.*,
        stats.total_purchases,
        stats.total_reviews,
        stats.avg_rating,
        stats.total_revenue,
        stats.last_purchase_at,
        stats.total_views,
        stats.total_previews,
        array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories,
        u.name as owner_name,
        u.email as owner_email
      FROM marketplace_templates t
      LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
      LEFT JOIN template_category_mappings tcm ON t.id = tcm.template_id
      LEFT JOIN template_categories c ON tcm.category_id = c.id
      LEFT JOIN users u ON t.owner_id = u.id
      WHERE t.id IN (${placeholders}) AND t.status = 'listed'
      GROUP BY t.id, stats.total_purchases, stats.total_reviews, stats.avg_rating, 
               stats.total_revenue, stats.last_purchase_at, stats.total_views, 
               stats.total_previews, u.name, u.email
    `;

    const result = await this.pool.query(query, templateIds);
    
    // Preserve Elasticsearch order
    const templateMap = new Map(result.rows.map(row => [row.id, {
      ...row,
      categories: row.categories || [],
      total_purchases: row.total_purchases || 0,
      total_reviews: row.total_reviews || 0,
      avg_rating: parseFloat(row.avg_rating) || 0,
      total_revenue: row.total_revenue || 0,
      total_views: row.total_views || 0,
      total_previews: row.total_previews || 0,
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email,
        verified: true

]));

    return templateIds.map((id: string) => templateMap.get(id)).filter(Boolean);


  /**
   * Process Elasticsearch aggregations
   */
  private processAggregations(aggs: any): any {
    if (!aggs) return undefined;

    return {
      categories: aggs.categories?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count
      })) || [],
      price_ranges: aggs.price_ranges?.buckets?.map((bucket: any) => ({
        min: bucket.from || 0,
        max: bucket.to || Infinity,
        count: bucket.doc_count
      })) || [],
      avg_ratings: aggs.avg_ratings?.buckets?.map((bucket: any) => ({
        rating: bucket.key,
        count: bucket.doc_count
      })) || [],
      tags: aggs.tags?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count
      })) || []
    };


  /**
   * Fallback to PostgreSQL search when Elasticsearch fails
   */
  private async fallbackToPostgresSearch(filters: SearchFilters): Promise<SearchResponse> {

    const result = await this.dao.searchTemplates(filters);
    return {
      templates: result.templates,
      total: result.total
    };


  /**
   * Convert template to Elasticsearch document
   */
  private templateToElasticsearchDoc(template: TemplateWithStats): ElasticsearchTemplate {
    return {
      id: template.id,
      title: template.title,
      description: template.description || '',
      tags: template.tags,
      price_cents: template.price_cents,
      avg_rating: template.avg_rating,
      total_reviews: template.total_reviews,
      total_purchases: template.total_purchases,
      categories: template.categories || [],
      owner_name: template.owner?.name || '',
      owner_verified: template.owner?.verified || false,
      is_ai_generated: template.is_ai_generated || false,
      claude_compat: template.claude_compat,
      featured_at: template.featured_at,
      created_at: template.created_at,
      updated_at: template.updated_at
    };

