/**
 * Audit Evidence Mapping API Routes
 * 
 * RESTful API endpoints for managing audit evidence mappings,
 * compliance frameworks, and evidence collection.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import AuditEvidenceMapper from '../services/AuditEvidenceMapper.js';
import { getMergedConfig } from '../config/evidence-mapping-config.js';

// Request/Response schemas



interface EvidenceMappingRequest {
  Params: {
    frameworkId?: string;
    requirementId?: string;
    evidenceTypeId?: string;



  };
  Querystring: {
    framework?: string;
    includeGaps?: boolean;
    format?: 'json' | 'pdf' | 'csv' | 'xml';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  Body: {
    evidence_type_id?: string;
    audit_requirement_id?: string;
    mapping_type?: 'direct' | 'supporting' | 'corroborating';
    coverage_level?: 'full' | 'partial' | 'supplemental';
    collection_priority?: number;
    validation_rules?: string[];
  };




interface EvidenceCollectionRequest {
  Body: {
    evidence_type_id: string;
    collector_id: string;
    evidence_location: string;
    integrity_hash: string;
    signature: string;



  };


export async function auditEvidenceRoutes(fastify: FastifyInstance) {
  // Initialize the audit evidence mapper
  const evidenceMapper = new AuditEvidenceMapper();

  /**
   * GET /api/evidence-mapping/frameworks
   * Get all compliance frameworks or a specific framework
   */
  fastify.get('/frameworks/:frameworkId?', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { frameworkId } = request.params;
      const report = evidenceMapper.generateEvidenceMappingReport(frameworkId);
      
      if (frameworkId && report.frameworks.length === 0) {
        return reply.status(404).send({
          error: 'Framework not found',
          framework_id: frameworkId
        });


      return reply.send({
        success: true,
        data: {
          frameworks: report.frameworks,
          config: getMergedConfig(frameworkId)

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/evidence-types
   * Get all evidence types or filtered by category
   */
  fastify.get('/evidence-types', async (
    request: FastifyRequest<{
      Querystring: { category?: string; sensitivity?: string; }
>,
    reply: FastifyReply
  ) => {
    try {
      const { category, sensitivity } = request.query;
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      let evidenceTypes = report.evidence_types;
      
      if (category) {
        evidenceTypes = evidenceTypes.filter(type => type.category === category);

      
      if (sensitivity) {
        evidenceTypes = evidenceTypes.filter(type => type.sensitivity === sensitivity);


      return reply.send({
        success: true,
        data: {
          evidence_types: evidenceTypes,
          total: evidenceTypes.length,
          filters: { category, sensitivity }

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/requirements/:frameworkId
   * Get audit requirements for a specific framework
   */
  fastify.get('/requirements/:frameworkId', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { frameworkId } = request.params;
      const requirements = evidenceMapper.getRequirementsForFramework(frameworkId);
      
      if (requirements.length === 0) {
        return reply.status(404).send({
          error: 'Framework not found or has no requirements',
          framework_id: frameworkId
        });


      // Enrich requirements with evidence type details
      const enrichedRequirements = requirements.map(requirement => ({
        ...requirement,
        evidence_types_details: evidenceMapper.getEvidenceTypesForRequirement(requirement.id),
        mappings: evidenceMapper.getEvidenceMappingForRequirement(requirement.id)
      }));

      return reply.send({
        success: true,
        data: {
          framework_id: frameworkId,
          requirements: enrichedRequirements,
          total: enrichedRequirements.length

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/mappings/:requirementId
   * Get evidence mappings for a specific audit requirement
   */
  fastify.get('/mappings/:requirementId', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { requirementId } = request.params;
      const mappings = evidenceMapper.getEvidenceMappingForRequirement(requirementId);
      const evidenceTypes = evidenceMapper.getEvidenceTypesForRequirement(requirementId);
      
      return reply.send({
        success: true,
        data: {
          requirement_id: requirementId,
          mappings: mappings,
          evidence_types: evidenceTypes,
          total_mappings: mappings.length

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/gaps/:frameworkId
   * Identify evidence gaps for a compliance framework
   */
  fastify.get('/gaps/:frameworkId', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { frameworkId } = request.params;
      const { severity } = request.query;
      
      let gaps = evidenceMapper.identifyEvidenceGaps(frameworkId);
      
      if (severity) {
        gaps = gaps.filter(gap => gap.risk_level === severity);


      // Sort by risk level (critical first)
      const riskOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      gaps.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

      return reply.send({
        success: true,
        data: {
          framework_id: frameworkId,
          evidence_gaps: gaps,
          total_gaps: gaps.length,
          risk_summary: {
            critical: gaps.filter(g => g.risk_level === 'critical').length,
            high: gaps.filter(g => g.risk_level === 'high').length,
            medium: gaps.filter(g => g.risk_level === 'medium').length,
            low: gaps.filter(g => g.risk_level === 'low').length


      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/report/:frameworkId?
   * Generate comprehensive evidence mapping report
   */
  fastify.get('/report/:frameworkId?', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { frameworkId } = request.params;
      const { format = 'json', includeGaps = true } = request.query;
      
      const report = evidenceMapper.generateEvidenceMappingReport(frameworkId);
      
      // Add gaps if requested
      if (includeGaps) {
        const gaps = frameworkId 
          ? evidenceMapper.identifyEvidenceGaps(frameworkId)
          : report.frameworks.flatMap(f => evidenceMapper.identifyEvidenceGaps(f.id));
        
        (report as any).evidence_gaps = gaps;


      // Format response based on requested format
      if (format === 'json') {
        return reply.send({
          success: true,
          data: report,
          generated_at: new Date().toISOString(),
          framework_filter: frameworkId || 'all'
        });
 else {
        // For other formats, return a structured response indicating format support
        return reply.send({
          success: true,
          message: `Report generated in ${format} format`,
          data: {
            download_url: `/api/evidence-mapping/download/${format}/${frameworkId || 'all'}`,
            expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour

        });

 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/validation/:frameworkId
   * Validate evidence mapping completeness for a framework
   */
  fastify.get('/validation/:frameworkId', async (
    request: FastifyRequest<EvidenceMappingRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { frameworkId } = request.params;
      const validation = evidenceMapper.validateMappingCompleteness(frameworkId);
      
      return reply.send({
        success: true,
        data: {
          framework_id: frameworkId,
          validation_result: validation,
          recommendations: validation.is_complete 
            ? ['Evidence mapping is complete for this framework']
            : [
              'Review missing mappings and create appropriate evidence collection processes',
              'Validate evidence types are properly configured',
              'Ensure all audit requirements have adequate evidence coverage'
            ]

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * POST /api/evidence-mapping/evidence/collect
   * Record evidence collection in audit trail
   */
  fastify.post('/evidence/collect', async (
    request: FastifyRequest<EvidenceCollectionRequest>,
    reply: FastifyReply
  ) => {
    try {
      const {
        evidence_type_id,
        collector_id,
        evidence_location,
        integrity_hash,
        signature
 = request.body;

      // Validate required fields
      if (!evidence_type_id || !collector_id || !evidence_location || !integrity_hash) {
        return reply.status(400).send({
          error: 'Missing required fields',
          required: ['evidence_type_id', 'collector_id', 'evidence_location', 'integrity_hash']
        });


      const trailId = evidenceMapper.recordEvidenceCollection(
        evidence_type_id,
        collector_id,
        evidence_location,
        integrity_hash,
        signature || ''
      );

      return reply.status(201).send({
        success: true,
        data: {
          trail_id: trailId,
          evidence_type_id: evidence_type_id,
          collection_timestamp: new Date().toISOString(),
          status: 'recorded'

      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/stats
   * Get overall evidence mapping statistics
   */
  fastify.get('/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      const stats = {
        frameworks: {
          total: report.frameworks.length,
          enabled: report.frameworks.length // All loaded frameworks are considered enabled

        evidence_types: {
          total: report.evidence_types.length,
          by_category: report.evidence_types.reduce((acc, type) => {
            acc[type.category] = (acc[type.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_sensitivity: report.evidence_types.reduce((acc, type) => {
            acc[type.sensitivity] = (acc[type.sensitivity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)

        audit_requirements: {
          total: report.audit_requirements.length,
          by_framework: report.audit_requirements.reduce((acc, req) => {
            acc[req.framework_id] = (acc[req.framework_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_criticality: report.audit_requirements.reduce((acc, req) => {
            acc[req.criticality] = (acc[req.criticality] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)

        evidence_mappings: {
          total: report.evidence_mappings.length,
          by_type: report.evidence_mappings.reduce((acc, mapping) => {
            acc[mapping.mapping_type] = (acc[mapping.mapping_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_coverage: report.evidence_mappings.reduce((acc, mapping) => {
            acc[mapping.coverage_level] = (acc[mapping.coverage_level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)

        coverage_summary: report.coverage_analysis
      };

      return reply.send({
        success: true,
        data: stats,
        generated_at: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /api/evidence-mapping/health
   * Health check for evidence mapping service
   */
  fastify.get('/health', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const report = evidenceMapper.generateEvidenceMappingReport();
      const totalGaps = report.frameworks.reduce((total, framework) => {
        const gaps = evidenceMapper.identifyEvidenceGaps(framework.id);
        return total + gaps.length;
      }, 0);

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'audit-evidence-mapper',
        version: '1.0.0',
        metrics: {
          frameworks_loaded: report.frameworks.length,
          evidence_types_loaded: report.evidence_types.length,
          audit_requirements_loaded: report.audit_requirements.length,
          evidence_mappings_loaded: report.evidence_mappings.length,
          total_evidence_gaps: totalGaps

        checks: {
          frameworks_available: report.frameworks.length > 0,
          evidence_types_available: report.evidence_types.length > 0,
          mappings_available: report.evidence_mappings.length > 0,
          validation_passing: totalGaps === 0

      };

      const overallHealth = Object.values(health.checks).every(check => check);
      
      return reply.status(overallHealth ? 200 : 503).send({
        success: overallHealth,
        data: health
      });
 catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });


export default auditEvidenceRoutes;