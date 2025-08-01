// Visual Diff Service - Orchestrates graph comparison and diff sessions
// Story 9.3.2 - Visual Diff Tool

import { ComparisonDAO } from '../database/comparison-dao.js';
import { VersionHistoryDAO } from '../database/version-dao.js';
import { GraphComparisonService } from './graph-comparison-service.js';
import {
  GraphComparison,
  VisualDiffSession,
  DetailedComparison,
  CompareVersionsRequest,
  CreateDiffSessionRequest,
  UpdateDiffSessionRequest,
  ComparisonConfig,
  GraphData
 from '../database/comparison-models.js';



export interface VisualDiffServiceOptions {
  comparisonConfig?: Partial<ComparisonConfig>;
  enableCaching?: boolean;
  maxCacheSize?: number;





export class VisualDiffService {
  private comparisonService: GraphComparisonService;
  private config: ComparisonConfig;

  constructor(
    private comparisonDAO: ComparisonDAO,
    private versionDAO: VersionHistoryDAO,
    options: VisualDiffServiceOptions = {}
  ) {
    this.config = {
      node_similarity_threshold: 0.8,
      edge_similarity_threshold: 0.9,
      structural_weight: 0.6,
      semantic_weight: 0.3,
      visual_weight: 0.1,
      max_comparison_time_ms: 30000,
      enable_caching: true,
      cache_ttl_hours: 24,
      ...options.comparisonConfig
    };

    this.comparisonService = new GraphComparisonService(this.config);


  /**
   * Compare two graph versions with caching support
   */
  async compareVersions(request: CompareVersionsRequest, userId?: string): Promise<DetailedComparison> {

    const { source_version_id, target_version_id, comparison_type = 'structural', include_details = true } = request;

    try {
      // Check for cached comparison first
      if (this.config.enable_caching) {
        const cached = await this.comparisonDAO.getComparisonByVersions(
          source_version_id,
          target_version_id,
          comparison_type
        );

        if (cached) {
          // Check if cache is still valid
          const cacheAge = Date.now() - cached.created_at.getTime();
          const maxAge = this.config.cache_ttl_hours * 60 * 60 * 1000;

          if (cacheAge < maxAge) {
            return await this.enrichComparisonWithDetails(cached, include_details);




      // Fetch version data
      const [sourceVersion, targetVersion] = await Promise.all([
        this.versionDAO.getVersion(source_version_id),
        this.versionDAO.getVersion(target_version_id)
      ]);

      if (!sourceVersion || !targetVersion) {
        throw new Error('One or both versions not found');


      // Convert version data to GraphData format
      const sourceData = this.convertVersionToGraphData(sourceVersion);
      const targetData = this.convertVersionToGraphData(targetVersion);

      // Perform comparison
      const _____startTime = Date.now();
      const detailedComparison = await this.comparisonService.compareGraphs(
        sourceData,
        targetData,
        comparison_type
      );

      // Save comparison result
      const savedComparison = await this.comparisonDAO.createComparison({
        source_version_id,
        target_version_id,
        comparison_type,
        similarity_score: detailedComparison.similarity_score,
        changes_summary: detailedComparison.changes_summary,
        added_nodes: detailedComparison.added_nodes,
        removed_nodes: detailedComparison.removed_nodes,
        modified_nodes: detailedComparison.modified_nodes,
        added_edges: detailedComparison.added_edges,
        removed_edges: detailedComparison.removed_edges,
        modified_edges: detailedComparison.modified_edges,
        node_diffs: detailedComparison.node_diffs,
        edge_diffs: detailedComparison.edge_diffs,
        property_diffs: detailedComparison.property_diffs,
        comparison_duration_ms: detailedComparison.comparison_duration_ms,
        created_by: userId
      });

      // Save detailed match results if requested
      if (include_details) {
        await Promise.all([
          this.comparisonDAO.createNodeMatchResults(savedComparison.id, detailedComparison.node_matches),
          this.comparisonDAO.createEdgeMatchResults(savedComparison.id, detailedComparison.edge_matches)
        ]);


      return {
        ...detailedComparison,
        id: savedComparison.id
      };
 catch (error) {
      throw new Error(`Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Create a new visual diff session
   */
  async createDiffSession(request: CreateDiffSessionRequest, userId: string): Promise<VisualDiffSession> {

    try {
      // First ensure we have a comparison
      const comparison = await this.compareVersions({
        source_version_id: request.source_version_id,
        target_version_id: request.target_version_id,
        comparison_type: 'structural',
        include_details: true
      }, userId);

      // Create session with 24-hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const session = await this.comparisonDAO.createDiffSession({
        user_id: userId,
        graph_id: request.graph_id,
        comparison_id: comparison.id,
        view_mode: request.view_mode || 'side-by-side',
        highlight_mode: request.highlight_mode || 'changes',
        zoom_level: 1.0,
        viewport_state: {},
        show_unchanged: true,
        show_metadata: false,
        filter_options: {},
        expires_at: expiresAt
      });

      return session;
 catch (error) {
      throw new Error(`Failed to create diff session: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Get diff session with comparison data
   */
  async getDiffSession(sessionId: string, userId: string): Promise<{
    session: VisualDiffSession;
    comparison: DetailedComparison;
 | null> {

    try {
      const session = await this.comparisonDAO.getDiffSession(sessionId);
      if (!session || session.user_id !== userId) {
        return null;


      if (!session.comparison_id) {
        throw new Error('Session has no associated comparison');


      const comparison = await this.comparisonDAO.getComparison(session.comparison_id);
      if (!comparison) {
        throw new Error('Comparison not found');


      const detailedComparison = await this.enrichComparisonWithDetails(comparison, true);

      // Update last accessed time
      await this.comparisonDAO.updateDiffSession(sessionId, {});

      return {
        session,
        comparison: detailedComparison
      };
 catch (error) {
      throw new Error(`Failed to get diff session: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Update diff session settings
   */
  async updateDiffSession(
    sessionId: string,
    updates: UpdateDiffSessionRequest,
    userId: string
  ): Promise<VisualDiffSession | null> {

    try {
      // Verify session belongs to user
      const session = await this.comparisonDAO.getDiffSession(sessionId);
      if (!session || session.user_id !== userId) {
        return null;


      const success = await this.comparisonDAO.updateDiffSession(sessionId, updates);
      if (!success) {
        return null;


      return await this.comparisonDAO.getDiffSession(sessionId);
 catch (error) {
      throw new Error(`Failed to update diff session: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Delete diff session
   */
  async deleteDiffSession(sessionId: string, userId: string): Promise<boolean> {

    try {
      // Verify session belongs to user
      const session = await this.comparisonDAO.getDiffSession(sessionId);
      if (!session || session.user_id !== userId) {
        return false;


      return await this.comparisonDAO.deleteDiffSession(sessionId);
 catch (error) {
      throw new Error(`Failed to delete diff session: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Get user's active diff sessions
   */
  async getUserDiffSessions(userId: string): Promise<VisualDiffSession[]> {

    try {
      return await this.comparisonDAO.getUserDiffSessions(userId);
 catch (error) {
      throw new Error(`Failed to get user sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Get comparison history for a graph
   */
  async getComparisonHistory(
    graphId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    comparisons: GraphComparison[];
    total: number;
    page: number;
    total_pages: number;
> {

    try {
      // Get versions for this graph
      const versions = await this.versionDAO.getVersionHistory(graphId, { page: 1, limit: 1000 });
      const versionIds = versions.data.map(v => v.id);

      if (versionIds.length === 0) {
        return { comparisons: [], total: 0, page, total_pages: 0 };


      // Get comparisons involving these versions
      const result = await this.comparisonDAO.getComparisons({}, { page, limit });

      // Filter to only include comparisons for this graph
      const filteredComparisons = result.data.filter(comp => 
        versionIds.includes(comp.source_version_id) || versionIds.includes(comp.target_version_id)
      );

      return {
        comparisons: filteredComparisons,
        total: filteredComparisons.length,
        page,
        total_pages: Math.ceil(filteredComparisons.length / limit)
      };
 catch (error) {
      throw new Error(`Failed to get comparison history: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Get comparison statistics
   */
  async getComparisonStatistics(graphId?: string): Promise<{
    total_comparisons: number;
    avg_similarity: number;
    comparison_types: Record<string, number>;
    recent_comparisons: number;
    similarity_distribution: {
      high: number; // > 0.8
      medium: number; // 0.5 - 0.8
      low: number; // < 0.5
    };
> {
    try {
      const stats = await this.comparisonDAO.getComparisonStatistics(graphId);

      // Calculate similarity distribution
      const comparisons = await this.comparisonDAO.getComparisons(
        graphId ? { graph_id: graphId } : {},
        { page: 1, limit: 1000 }
      );

      const distribution = { high: 0, medium: 0, low: 0 };
      comparisons.data.forEach(comp => {
        if (comp.similarity_score > 0.8) {
          distribution.high++;
 else if (comp.similarity_score >= 0.5) {
          distribution.medium++;
 else {
          distribution.low++;

      });

      return {
        ...stats,
        similarity_distribution: distribution
      };
 catch (error) {
      throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Clean up expired sessions and old comparisons
   */
  async cleanup(): Promise<{
    expired_sessions_removed: number;
    old_comparisons_removed: number;
> {

    try {
      const expiredSessions = await this.comparisonDAO.cleanupExpiredSessions();

      // Remove comparisons older than configured TTL
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.config.cache_ttl_hours);

      const oldComparisons = await this.comparisonDAO.getComparisons({
        created_before: cutoffDate
      }, { page: 1, limit: 1000 });

      let removedComparisons = 0;
      for (const comparison of oldComparisons.data) {
        await this.comparisonDAO.deleteComparison(comparison.id);
        removedComparisons++;


      return {
        expired_sessions_removed: expiredSessions,
        old_comparisons_removed: removedComparisons
      };
 catch (error) {
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);



  /**
   * Convert version data to GraphData format for comparison
   */
  private convertVersionToGraphData(version: unknown): GraphData {
    const graphData = JSON.parse(version.graph_data);
    
    return {
      id: version.graph_id,
      nodes: graphData.nodes || [],
      edges: graphData.edges || [],
      metadata: {
        version_id: version.id,
        version_number: version.version_number,
        created_at: version.created_at,
        description: version.description

    };


  /**
   * Enrich comparison with detailed match results
   */
  private async enrichComparisonWithDetails(
    comparison: GraphComparison,
    includeDetails: boolean
  ): Promise<DetailedComparison> {

    if (!includeDetails) {
      return {
        ...comparison,
        source_data: { id: '', nodes: [], edges: [] },
        target_data: { id: '', nodes: [], edges: [] },
        node_matches: [],
        edge_matches: [],
        algorithm_metadata: {
          steps_executed: [],
          performance_metrics: {},
          confidence_distribution: {}

      };


    try {
      const [nodeMatches, edgeMatches, sourceVersion, targetVersion] = await Promise.all([
        this.comparisonDAO.getNodeMatchResults(comparison.id),
        this.comparisonDAO.getEdgeMatchResults(comparison.id),
        this.versionDAO.getVersion(comparison.source_version_id),
        this.versionDAO.getVersion(comparison.target_version_id)
      ]);

      const sourceData = sourceVersion ? this.convertVersionToGraphData(sourceVersion) : { id: '', nodes: [], edges: [] };
      const targetData = targetVersion ? this.convertVersionToGraphData(targetVersion) : { id: '', nodes: [], edges: [] };

      // Calculate confidence distribution
      const allMatches = [...nodeMatches, ...edgeMatches];
      const confidenceDistribution = { high: 0, medium: 0, low: 0 };
      allMatches.forEach(match => {
        if (match.confidence_score > 0.8) {
          confidenceDistribution.high++;
 else if (match.confidence_score >= 0.5) {
          confidenceDistribution.medium++;
 else {
          confidenceDistribution.low++;

      });

      return {
        ...comparison,
        source_data: sourceData,
        target_data: targetData,
        node_matches: nodeMatches,
        edge_matches: edgeMatches,
        algorithm_metadata: {
          steps_executed: ['Database retrieval', 'Match result assembly'],
          performance_metrics: {
            total_duration_ms: comparison.comparison_duration_ms || 0,
            node_match_count: nodeMatches.length,
            edge_match_count: edgeMatches.length,
            similarity_score: comparison.similarity_score

          confidence_distribution: confidenceDistribution

      };
 catch (error) {
      throw new Error(`Failed to enrich comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);


