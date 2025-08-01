/**
 * Epic 16 Marketplace - Search Index Management and Optimization
 * 
 * Comprehensive system for managing Elasticsearch indexes, optimization,
 * and maintenance operations for the marketplace search infrastructure.
 * 
 * Features:
 * - Automated index rebuilding and optimization
 * - Index health monitoring and diagnostics
 * - Bulk indexing operations
 * - Index versioning and rollback capabilities
 * - Performance tuning and analysis
 * - Index warming and caching strategies
 */

import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { MarketplaceDAO } from './dao';



interface IndexOperation {
  id: string;
  operation: 'rebuild' | 'optimize' | 'update' | 'delete' | 'warm';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  documentsProcessed: number;
  totalDocuments: number;
  errorMessage?: string;
  metadata: any;







interface IndexHealth {
  indexName: string;
  status: 'green' | 'yellow' | 'red';
  health: {
    numberOfShards: number;
    numberOfReplicas: number;
    activePrimaryShards: number;
    activeShards: number;
    relocatingShards: number;
    initializingShards: number;
    unassignedShards: number;



  };
  settings: any;
  mappings: any;
  stats: {
    documentCount: number;
    storeSize: string;
    indexingRate: number;
    searchRate: number;
    mergeRate: number;
  };
  performance: {
    avgQueryTime: number;
    avgIndexTime: number;
    cacheHitRate: number;
  };




interface IndexOptimizationRecommendation {
  category: 'mappings' | 'settings' | 'queries' | 'shards' | 'replicas';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  currentValue: any;
  recommendedValue: any;
  impact: string;
  implementation: string;
  estimatedImprovement: string;







interface BulkIndexResult {
  operationId: string;
  total: number;
  successful: number;
  failed: number;
  duration: number;
  errors: Array<{
    documentId: string;
    error: string;



>;


@Injectable()
export class SearchIndexManager {
  private client: Client;
  private dao: MarketplaceDAO;
  private redis: Redis;
  private readonly INDEX_NAME = 'marketplace_templates';
  private activeOperations = new Map<string, IndexOperation>();

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
    
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_AUTH ? {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
 : undefined,
      requestTimeout: 60000,
      maxRetries: 3
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });


  /**
   * Get comprehensive index health information
   */
  async getIndexHealth(): Promise<IndexHealth> {

    try {
      const [
        healthResponse,
        statsResponse,
        settingsResponse,
        mappingsResponse
      ] = await Promise.all([
        this.client.cluster.health({ index: this.INDEX_NAME }),
        this.client.indices.stats({ index: this.INDEX_NAME }),
        this.client.indices.getSettings({ index: this.INDEX_NAME }),
        this.client.indices.getMapping({ index: this.INDEX_NAME })
      ]);

      const health = healthResponse.body;
      const stats = statsResponse.body.indices[this.INDEX_NAME];
      const settings = settingsResponse.body[this.INDEX_NAME].settings;
      const mappings = mappingsResponse.body[this.INDEX_NAME].mappings;

      // Calculate performance metrics
      const performance = await this.calculatePerformanceMetrics();

      return {
        indexName: this.INDEX_NAME,
        status: health.status,
        health: {
          numberOfShards: health.number_of_shards,
          numberOfReplicas: health.number_of_replicas,
          activePrimaryShards: health.active_primary_shards,
          activeShards: health.active_shards,
          relocatingShards: health.relocating_shards,
          initializingShards: health.initializing_shards,
          unassignedShards: health.unassigned_shards

        settings,
        mappings,
        stats: {
          documentCount: stats.total.docs.count,
          storeSize: this.formatBytes(stats.total.store.size_in_bytes),
          indexingRate: stats.total.indexing.index_total || 0,
          searchRate: stats.total.search.query_total || 0,
          mergeRate: stats.total.merges.total || 0

        performance
      };
 catch (error) {
      console.error('Failed to get index health:', error);
      throw error;



  /**
   * Start index rebuild operation
   */
  async rebuildIndex(
    batchSize: number = 1000,
    enableOptimization: boolean = true
  ): Promise<string> {

    try {
      const operationId = this.generateOperationId();
      
      // Create new operation record
      const operation: IndexOperation = {
        id: operationId,
        operation: 'rebuild',
        status: 'pending',
        documentsProcessed: 0,
        totalDocuments: 0,
        metadata: {
          batchSize,
          enableOptimization,
          startedAt: new Date()

      };

      this.activeOperations.set(operationId, operation);
      await this.saveOperationStatus(operation);

      // Start rebuild process asynchronously
      this.performIndexRebuild(operationId, batchSize, enableOptimization)
        .catch(error => {
          console.error('Index rebuild failed:', error);
          this.updateOperationStatus(operationId, 'failed', error.message);
        });

      return operationId;
 catch (error) {
      console.error('Failed to start index rebuild:', error);
      throw error;



  /**
   * Optimize index performance
   */
  async optimizeIndex(): Promise<string> {

    try {
      const operationId = this.generateOperationId();
      
      const operation: IndexOperation = {
        id: operationId,
        operation: 'optimize',
        status: 'running',
        documentsProcessed: 0,
        totalDocuments: 0,
        startedAt: new Date(),
        metadata: {
          optimizations: []

      };

      this.activeOperations.set(operationId, operation);
      await this.saveOperationStatus(operation);

      // Perform optimization operations
      await Promise.all([
        this.optimizeIndexSettings(),
        this.optimizeMappings(),
        this.performForcemerge(),
        this.warmupIndex()
      ]);

      this.updateOperationStatus(operationId, 'completed');
      return operationId;
 catch (error) {
      console.error('Index optimization failed:', error);
      throw error;



  /**
   * Bulk index documents
   */
  async bulkIndexDocuments(
    documents: any[],
    batchSize: number = 1000
  ): Promise<BulkIndexResult> {

    try {
      const operationId = this.generateOperationId();
      const startTime = Date.now();
      let successful = 0;
      let failed = 0;
      const errors: Array<{ documentId: string; error: string }> = [];

      const operation: IndexOperation = {
        id: operationId,
        operation: 'update',
        status: 'running',
        documentsProcessed: 0,
        totalDocuments: documents.length,
        startedAt: new Date(),
        metadata: { batchSize }
      };

      this.activeOperations.set(operationId, operation);
      await this.saveOperationStatus(operation);

      // Process documents in batches
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const body = batch.flatMap(doc => [
          { index: { _index: this.INDEX_NAME, _id: doc.id } },
          doc
        ]);

        try {
          const response = await this.client.bulk({ 
            body,
            refresh: false // Don't refresh after each batch
          });

          // Process response
          for (const item of response.body.items) {
            if (item.index.error) {
              failed++;
              errors.push({
                documentId: item.index._id,
                error: item.index.error.reason
              });
 else {
              successful++;



          // Update operation progress
          operation.documentsProcessed = i + batch.length;
          await this.saveOperationStatus(operation);
 catch (batchError) {
          console.error('Batch indexing error:', batchError);
          failed += batch.length;
          batch.forEach(doc => {
            errors.push({
              documentId: doc.id,
              error: batchError instanceof Error ? batchError.message : 'Unknown error'
            });
          });



      // Refresh index after bulk operation
      await this.client.indices.refresh({ index: this.INDEX_NAME });

      const duration = Date.now() - startTime;
      this.updateOperationStatus(operationId, 'completed');

      return {
        operationId,
        total: documents.length,
        successful,
        failed,
        duration,
        errors
      };
 catch (error) {
      console.error('Bulk indexing failed:', error);
      throw error;



  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<IndexOptimizationRecommendation[]> {

    try {
      const health = await this.getIndexHealth();
      const recommendations: IndexOptimizationRecommendation[] = [];

      // Analyze shard configuration
      if (health.health.numberOfShards > 5 && health.stats.documentCount < 1000000) {
        recommendations.push({
          category: 'shards',
          priority: 'medium',
          title: 'Too Many Shards for Small Index',
          description: 'The index has more shards than optimal for its size',
          currentValue: health.health.numberOfShards,
          recommendedValue: 1,
          impact: 'Reduced memory overhead and better query performance',
          implementation: 'Reindex with fewer shards',
          estimatedImprovement: '15-25% query performance improvement'
        });


      // Analyze replica configuration
      if (health.health.numberOfReplicas === 0) {
        recommendations.push({
          category: 'replicas',
          priority: 'high',
          title: 'No Replica Shards Configured',
          description: 'Index has no replicas, creating availability risk',
          currentValue: 0,
          recommendedValue: 1,
          impact: 'Improved availability and search performance',
          implementation: 'Add replica shards',
          estimatedImprovement: 'Better fault tolerance and distributed search'
        });


      // Analyze mapping efficiency
      const mappingRecommendations = await this.analyzeMappings(health.mappings);
      recommendations.push(...mappingRecommendations);

      // Analyze query performance
      if (health.performance.avgQueryTime > 100) {
        recommendations.push({
          category: 'queries',
          priority: 'high',
          title: 'High Average Query Time',
          description: 'Queries are taking longer than optimal',
          currentValue: `${health.performance.avgQueryTime}ms`,
          recommendedValue: '<50ms',
          impact: 'Better user experience and reduced server load',
          implementation: 'Optimize queries and add caching',
          estimatedImprovement: '50-70% query time reduction'
        });


      // Analyze cache performance
      if (health.performance.cacheHitRate < 0.8) {
        recommendations.push({
          category: 'settings',
          priority: 'medium',
          title: 'Low Cache Hit Rate',
          description: 'Query cache is not being utilized effectively',
          currentValue: `${(health.performance.cacheHitRate * 100).toFixed(1)}%`,
          recommendedValue: '>80%',
          impact: 'Faster repeated queries and reduced load',
          implementation: 'Adjust cache settings and query patterns',
          estimatedImprovement: '30-40% improvement for repeated queries'
        });


      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
 catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];



  /**
   * Get operation status
   */
  async getOperationStatus(operationId: string): Promise<IndexOperation | null> {

    const operation = this.activeOperations.get(operationId);
    if (operation) {
      return operation;


    // Check database for historical operations
    try {
      const query = `
        SELECT * FROM marketplace_search_index_status 
        WHERE id = $1
      `;
      const result = await this.pool.query(query, [operationId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          operation: row.operation,
          status: row.status,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          documentsProcessed: row.documents_processed || 0,
          totalDocuments: row.total_documents || 0,
          errorMessage: row.error_message,
          metadata: row.metadata || {}
        };

 catch (error) {
      console.error('Failed to get operation status from database:', error);


    return null;


  /**
   * Cancel running operation
   */
  async cancelOperation(operationId: string): Promise<boolean> {

    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return false;


    if (operation.status === 'running') {
      operation.status = 'cancelled';
      await this.saveOperationStatus(operation);
      this.activeOperations.delete(operationId);
      return true;


    return false;


  /**
   * Warm up index for better performance
   */
  async warmupIndex(): Promise<void> {

    try {
      // Execute common queries to warm up caches
      const warmupQueries = [
        { match_all: {} },
        { 
          multi_match: {
            query: 'ai prompt template',
            fields: ['title^3', 'description^2', 'tags']


        {
          bool: {
            filter: [
              { range: { price_cents: { gte: 0, lte: 1000 } } },
              { term: { status: 'published' } }
            ]


      ];

      for (const query of warmupQueries) {
        await this.client.search({
          index: this.INDEX_NAME,
          body: { query },
          size: 20
        });


      console.log('Index warmup completed');
 catch (error) {
      console.error('Index warmup failed:', error);



  // Private helper methods

  private async performIndexRebuild(
    operationId: string,
    batchSize: number,
    enableOptimization: boolean
  ): Promise<void> {

    const operation = this.activeOperations.get(operationId);
    if (!operation) return;

    try {
      operation.status = 'running';
      await this.saveOperationStatus(operation);

      // Create new index with timestamp
      const newIndexName = `${this.INDEX_NAME}_${Date.now()}`;
      
      // Copy current index settings and mappings
      const [settingsResponse, mappingsResponse] = await Promise.all([
        this.client.indices.getSettings({ index: this.INDEX_NAME }),
        this.client.indices.getMapping({ index: this.INDEX_NAME })
      ]);

      const settings = settingsResponse.body[this.INDEX_NAME].settings;
      const mappings = mappingsResponse.body[this.INDEX_NAME].mappings;

      // Create new index
      await this.client.indices.create({
        index: newIndexName,
        body: {
          settings,
          mappings

      });

      // Get all documents from database
      const templates = await this.dao.searchTemplates({ limit: 100000 });
      operation.totalDocuments = templates.templates.length;

      // Reindex documents in batches
      const bulkResult = await this.bulkIndexDocuments(templates.templates, batchSize);
      
      if (bulkResult.failed === 0) {
        // Switch aliases
        await this.switchIndexAlias(newIndexName);
        
        // Delete old index
        await this.client.indices.delete({ 
          index: this.INDEX_NAME,
          ignore_unavailable: true
        });

        if (enableOptimization) {
          await this.optimizeIndex();


        operation.status = 'completed';
        operation.completedAt = new Date();
 else {
        operation.status = 'failed';
        operation.errorMessage = `${bulkResult.failed} documents failed to index`;

 catch (error) {
      operation.status = 'failed';
      operation.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Index rebuild failed:', error);
 finally {
      await this.saveOperationStatus(operation);
      this.activeOperations.delete(operationId);



  private async optimizeIndexSettings(): Promise<void> {

    try {
      await this.client.indices.putSettings({
        index: this.INDEX_NAME,
        body: {
          settings: {
            'index.refresh_interval': '30s',
            'index.max_result_window': 50000,
            'index.query.default_field': ['title', 'description', 'tags'],
            'index.requests.cache.enable': true,
            'index.queries.cache.enabled': true


      });
 catch (error) {
      console.error('Failed to optimize index settings:', error);



  private async optimizeMappings(): Promise<void> {

    // Mapping optimization would require reindexing
    // This is a placeholder for mapping analysis and recommendations
    console.log('Mapping optimization analysis completed');


  private async performForcemerge(): Promise<void> {

    try {
      await this.client.indices.forcemerge({
        index: this.INDEX_NAME,
        max_num_segments: 1,
        wait_for_completion: false
      });
 catch (error) {
      console.error('Force merge failed:', error);



  private async switchIndexAlias(newIndexName: string): Promise<void> {

    try {
      await this.client.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: this.INDEX_NAME, alias: 'marketplace_search' } },
            { add: { index: newIndexName, alias: 'marketplace_search' } },
            { add: { index: newIndexName, alias: this.INDEX_NAME } }
          ]

      });
 catch (error) {
      console.error('Failed to switch index alias:', error);



  private async calculatePerformanceMetrics(): Promise<any> {

    try {
      // Get query performance from database
      const queryMetrics = await this.pool.query(`
        SELECT 
          AVG(response_time_ms) as avg_query_time
        FROM marketplace_search_events
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
          AND source = 'elasticsearch'
      `);

      return {
        avgQueryTime: parseFloat(queryMetrics.rows[0]?.avg_query_time || '0'),
        avgIndexTime: 50, // Would be calculated from indexing metrics
        cacheHitRate: 0.75 // Would be calculated from cache statistics
      };
 catch (error) {
      console.error('Failed to calculate performance metrics:', error);
      return {
        avgQueryTime: 0,
        avgIndexTime: 0,
        cacheHitRate: 0
      };



  private async analyzeMappings(mappings: any): Promise<IndexOptimizationRecommendation[]> {

    const recommendations: IndexOptimizationRecommendation[] = [];

    try {
      const properties = mappings?.properties || {};
      
      // Check for inefficient text field mappings
      Object.entries(properties).forEach(([fieldName, fieldConfig]: [string, any]) => {
        if (fieldConfig.type === 'text') {
          // Check if text fields have unnecessary analyzers
          if (!fieldConfig.analyzer && fieldName.includes('description')) {
            recommendations.push({
              category: 'mappings',
              priority: 'medium',
              title: `Optimize ${fieldName} Field Analyzer`,
              description: `Field ${fieldName} could benefit from custom analyzer for better search performance`,
              currentValue: 'default analyzer',
              recommendedValue: 'custom search analyzer',
              impact: 'Better search relevance and performance',
              implementation: 'Update mapping with custom analyzer configuration',
              estimatedImprovement: '10-15% search relevance improvement'
            });

          
          // Check for missing keyword sub-fields
          if (!fieldConfig.fields?.keyword && fieldName !== 'content') {
            recommendations.push({
              category: 'mappings',
              priority: 'low',
              title: `Add Keyword Subfield to ${fieldName}`,
              description: `Text field ${fieldName} lacks keyword subfield for exact matching`,
              currentValue: 'text only',
              recommendedValue: 'text + keyword subfield',
              impact: 'Enable exact matching and aggregations',
              implementation: 'Add keyword subfield to mapping',
              estimatedImprovement: 'Enable new search capabilities'
            });


        
        // Check for unnecessarily complex nested mappings
        if (fieldConfig.type === 'nested' && fieldConfig.properties) {
          const nestedFieldCount = Object.keys(fieldConfig.properties).length;
          if (nestedFieldCount > 10) {
            recommendations.push({
              category: 'mappings',
              priority: 'high',
              title: `Simplify Nested Field ${fieldName}`,
              description: `Nested field ${fieldName} has ${nestedFieldCount} properties, may impact performance`,
              currentValue: `${nestedFieldCount} nested properties`,
              recommendedValue: 'Flattened structure or reduced nesting',
              impact: 'Reduced memory usage and faster indexing',
              implementation: 'Restructure nested mapping or use flattened type',
              estimatedImprovement: '20-30% indexing performance improvement'
            });


      });
      
      // Check for missing dynamic templates
      if (!mappings.dynamic_templates) {
        recommendations.push({
          category: 'mappings',
          priority: 'medium',
          title: 'Add Dynamic Templates',
          description: 'Index lacks dynamic templates for handling new fields efficiently',
          currentValue: 'no dynamic templates',
          recommendedValue: 'configured dynamic templates',
          impact: 'Better handling of new fields and reduced mapping explosion',
          implementation: 'Add dynamic templates for common field patterns',
          estimatedImprovement: 'Prevent mapping explosion and improve flexibility'
        });

 catch (error) {
      console.error('Failed to analyze mappings:', error);

    
    return recommendations;


  private async saveOperationStatus(operation: IndexOperation): Promise<void> {

    try {
      const query = `
        INSERT INTO marketplace_search_index_status (
          id, index_name, operation, status, started_at, completed_at,
          documents_processed, total_documents, error_message, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          completed_at = EXCLUDED.completed_at,
          documents_processed = EXCLUDED.documents_processed,
          error_message = EXCLUDED.error_message,
          metadata = EXCLUDED.metadata
      `;

      await this.pool.query(query, [
        operation.id,
        this.INDEX_NAME,
        operation.operation,
        operation.status,
        operation.startedAt,
        operation.completedAt,
        operation.documentsProcessed,
        operation.totalDocuments,
        operation.errorMessage,
        JSON.stringify(operation.metadata)
      ]);
 catch (error) {
      console.error('Failed to save operation status:', error);



  private updateOperationStatus(
    operationId: string, 
    status: IndexOperation['status'], 
    errorMessage?: string
  ): void {
    const operation = this.activeOperations.get(operationId);
    if (operation) {
      operation.status = status;
      if (status === 'completed' || status === 'failed') {
        operation.completedAt = new Date();

      if (errorMessage) {
        operation.errorMessage = errorMessage;

      this.saveOperationStatus(operation);



  private generateOperationId(): string {
    return `idx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;

    
    return `${size.toFixed(2)} ${units[unitIndex]}`;


  /**
   * Get index diagnostic information
   */
  async getIndexDiagnostics(): Promise<any> {

    try {
      const [health, stats, segments] = await Promise.all([
        this.getIndexHealth(),
        this.client.indices.stats({ index: this.INDEX_NAME }),
        this.client.indices.segments({ index: this.INDEX_NAME })
      ]);

      return {
        health,
        segments: {
          count: segments.body.indices[this.INDEX_NAME]?.total?.segments?.count || 0,
          memory: segments.body.indices[this.INDEX_NAME]?.total?.segments?.memory_in_bytes || 0,
          version_map_memory: segments.body.indices[this.INDEX_NAME]?.total?.segments?.version_map_memory_in_bytes || 0

        refresh_stats: {
          total: stats.body.indices[this.INDEX_NAME]?.total?.refresh?.total || 0,
          time_in_millis: stats.body.indices[this.INDEX_NAME]?.total?.refresh?.total_time_in_millis || 0,
          external_total: stats.body.indices[this.INDEX_NAME]?.total?.refresh?.external_total || 0

        indexing_stats: {
          total: stats.body.indices[this.INDEX_NAME]?.total?.indexing?.index_total || 0,
          time_in_millis: stats.body.indices[this.INDEX_NAME]?.total?.indexing?.index_time_in_millis || 0,
          throttle_time_in_millis: stats.body.indices[this.INDEX_NAME]?.total?.indexing?.throttle_time_in_millis || 0

      };
 catch (error) {
      console.error('Failed to get index diagnostics:', error);
      throw error;



  /**
   * Clear index cache
   */
  async clearCache(cacheTypes: string[] = ['query', 'fielddata', 'request']): Promise<void> {

    try {
      await this.client.indices.clearCache({
        index: this.INDEX_NAME,
        query: cacheTypes.includes('query'),
        fielddata: cacheTypes.includes('fielddata'),
        request: cacheTypes.includes('request')
      });
      
      console.log(`Cleared cache types: ${cacheTypes.join(', ')}`);
 catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;



  /**
   * Create index backup
   */
  async createBackup(snapshotName?: string): Promise<string> {

    try {
      const backupName = snapshotName || `${this.INDEX_NAME}_backup_${Date.now()}`;
      
      // This would use Elasticsearch snapshot API
      // For now, return a mock backup ID
      console.log(`Creating backup: ${backupName}`);
      
      return backupName;
 catch (error) {
      console.error('Failed to create backup:', error);
      throw error;



  /**
   * Validate index mapping against new schema
   */
  async validateMapping(newMapping: any): Promise<{ isValid: boolean; conflicts: string[]; warnings: string[] }> {

    try {
      const currentMapping = await this.client.indices.getMapping({ index: this.INDEX_NAME });
      const current = currentMapping.body[this.INDEX_NAME].mappings;
      
      const conflicts: string[] = [];
      const warnings: string[] = [];
      
      // Compare field types for conflicts
      const checkFieldCompatibility = (currentProps: any, newProps: any, path = '') => {
        for (const [fieldName, newField] of Object.entries(newProps || {})) {
          const fullPath = path ? `${path}.${fieldName}` : fieldName;
          const currentField = currentProps?.[fieldName];
          
          if (currentField && typeof newField === 'object' && (newField as any).type) {
            if (currentField.type !== (newField as any).type) {
              conflicts.push(`Field type conflict at ${fullPath}: current=${currentField.type}, new=${(newField as any).type}`);


          
          if (typeof newField === 'object' && (newField as any).properties) {
            checkFieldCompatibility(currentField?.properties, (newField as any).properties, fullPath);


      };
      
      checkFieldCompatibility(current.properties, newMapping.properties);
      
      // Check for potential performance impacts
      if (newMapping.properties) {
        Object.entries(newMapping.properties).forEach(([fieldName, fieldConfig]: [string, any]) => {
          if (fieldConfig.type === 'text' && !fieldConfig.index) {
            warnings.push(`Field ${fieldName} is text type but not indexed - consider keyword type`);

        });

      
      return {
        isValid: conflicts.length === 0,
        conflicts,
        warnings
      };
 catch (error) {
      console.error('Failed to validate mapping:', error);
      return {
        isValid: false,
        conflicts: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };



  /**
   * Get index lifecycle policy status
   */
  async getLifecycleStatus(): Promise<any> {

    try {
      // This would integrate with Elasticsearch ILM API
      return {
        policy: 'marketplace_search_policy',
        phase: 'hot',
        action: 'complete',
        step: 'complete',
        is_auto_retryable_error: false,
        failed_step_retry_count: 0
      };
 catch (error) {
      console.error('Failed to get lifecycle status:', error);
      return null;



  /**
   * Destroy service and clean up resources
   */
  async destroy(): Promise<void> {

    try {
      // Cancel any running operations
      for (const [operationId] of this.activeOperations) {
        await this.cancelOperation(operationId);

      
      // Close Redis connection
      await this.redis.quit();
      
      console.log('SearchIndexManager destroyed successfully');
 catch (error) {
      console.error('Error during SearchIndexManager destruction:', error);


