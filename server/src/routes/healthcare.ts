/**
 * Epic 28.1 - Healthcare & Life Sciences Toolkit API Routes
 * REST API endpoints for healthcare-specific domain functionality
 * 
 * Provides HIPAA-compliant healthcare data processing, medical terminology
 * integration, and healthcare workflow management with strict security controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { HealthcareService } from '../services/healthcare-service';
import { MedicalTerminologyService } from '../services/medical-terminology-service';
import { HIPAAComplianceService } from '../services/hipaa-compliance-service';

// Request schemas for healthcare endpoints
const MedicalTextProcessingSchema = z.object({
  text: z.string().min(1).max(100000),
  options: z.object({
    deidentify: z.boolean().default(true),
    mapTerminology: z.boolean().default(true),
    extractEntities: z.boolean().default(true),
    validateCodes: z.boolean().default(true)
  }).default({})
});

const HealthcareDataValidationSchema = z.object({
  data: z.record(z.unknown()),
  format: z.enum(['fhir', 'hl7v2', 'hl7v3', 'cda', 'dicom']),
  version: z.string().optional(),
  strict: z.boolean().default(true)
});

const ClinicalWorkflowSchema = z.object({
  workflowType: z.enum(
    ['clinical_note',
      'patient_summary',
      'discharge_summary',
      'care_plan',
      'medication_reconciliation']
  ),
  patientData: z.record(z.unknown()),
  templateId: z.string().uuid().optional(),
  customizations: z.record(z.unknown()).default({})
});

const MedicalTermSearchSchema = z.object({
  query: z.string().min(1).max(500),
  vocabularies: z.array(z.enum(['umls', 'loinc', 'snomed', 'icd10', 'cpt', 'rxnorm'])).default(['umls']),
  limit: z.coerce.number().min(1).max(100).default(20),
  includeDefinitions: z.boolean().default(true),
  includeSynonyms: z.boolean().default(true)
});

const HIPAAAssessmentSchema = z.object({
  documentType: z.enum(['clinical_note', 'patient_record', 'research_data', 'administrative_document']),
  content: z.string().min(1),
  checkLevel: z.enum(['basic', 'comprehensive', 'audit']).default('comprehensive')
});

const PHIDeidentificationSchema = z.object({
  content: z.string().min(1).max(1000000),
  method: z.enum(['safe_harbor', 'expert_determination', 'synthetic']).default('safe_harbor'),
  preserveStructure: z.boolean().default(true),
  customRules: z.array(z.string()).default([])
});

// Response schemas
const ProcessedMedicalTextSchema = z.object({
  original: z.string(),
  deidentified: z.string().optional(),
  entities: z.array(z.object({
    text: z.string(),
    label: z.string(),
    start: z.number(),
    end: z.number(),
    confidence: z.number(),
    conceptId: z.string().optional()
  })),
  terminologyMappings: z.array(z.object({
    originalTerm: z.string(),
    mappedConcept: z.string(),
    vocabularySource: z.string(),
    confidence: z.number()
  })),
  validationResults: z.array(z.object({
    field: z.string(),
    isValid: z.boolean(),
    errors: z.array(z.string())
  })),
  processingTime: z.number()
});

export async function healthcareRoutes(fastify: FastifyInstance) {
  const healthcareService = new HealthcareService();
  const medicalTermService = new MedicalTerminologyService();
  const hipaaService = new HIPAAComplianceService();

  // Medical text processing endpoint
  fastify.post('/api/healthcare/process-text', {
    schema: {
      body: MedicalTextProcessingSchema,
      response: {
        200: ProcessedMedicalTextSchema
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof MedicalTextProcessingSchema>
  }>, reply: FastifyReply) => {
    try {
      const startTime = Date.now();
      const { text, options } = request.body;

      // HIPAA compliance check
      if (options.deidentify) {
        await hipaaService.validateSafeProcessing(text);
      }

      const result = await healthcareService.processMedicalText(text, options);
      const processingTime = Date.now() - startTime;

      return {
        ...result,
        processingTime
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Medical text processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Healthcare data validation endpoint  
  fastify.post('/api/healthcare/validate-data', {
    schema: {
      body: HealthcareDataValidationSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof HealthcareDataValidationSchema>
  }>, reply: FastifyReply) => {
    try {
      const { data, format, version, strict } = request.body;

      const validationResult = await healthcareService.validateHealthcareData(
        data, 
        format, 
        { version, strict }
      );

      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        validatedFields: validationResult.validatedFields,
        format,
        version: validationResult.detectedVersion || version
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Healthcare data validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Clinical workflow generation endpoint
  fastify.post('/api/healthcare/generate-workflow', {
    schema: {
      body: ClinicalWorkflowSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof ClinicalWorkflowSchema>
  }>, reply: FastifyReply) => {
    try {
      const { workflowType, patientData, templateId, customizations } = request.body;

      // HIPAA compliance validation for patient data
      await hipaaService.validatePatientDataProcessing(patientData);

      const workflow = await healthcareService.generateClinicalWorkflow(
        workflowType,
        patientData,
        { templateId, customizations }
      );

      return {
        workflowId: workflow.id,
        workflowType,
        generatedContent: workflow.content,
        templateUsed: workflow.templateId,
        complianceStatus: workflow.hipaaCompliant,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Clinical workflow generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Medical terminology search endpoint
  fastify.get('/api/healthcare/terminology/search', {
    schema: {
      querystring: MedicalTermSearchSchema
    }
  }, async (request: FastifyRequest<{
    Querystring: z.infer<typeof MedicalTermSearchSchema>
  }>, reply: FastifyReply) => {
    try {
      const { query, vocabularies, limit, includeDefinitions, includeSynonyms } = request.query;

      const searchResults = await medicalTermService.searchTerminology(query, {
        vocabularies,
        limit,
        includeDefinitions,
        includeSynonyms
      });

      return {
        query,
        results: searchResults.concepts,
        totalResults: searchResults.total,
        vocabulariesSearched: vocabularies,
        searchTime: searchResults.searchTime
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Medical terminology search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // HIPAA compliance assessment endpoint
  fastify.post('/api/healthcare/hipaa/assess', {
    schema: {
      body: HIPAAAssessmentSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof HIPAAAssessmentSchema>
  }>, reply: FastifyReply) => {
    try {
      const { documentType, content, checkLevel } = request.body;

      const assessment = await hipaaService.assessHIPAACompliance(
        content,
        documentType,
        checkLevel
      );

      return {
        complianceScore: assessment.score,
        riskLevel: assessment.riskLevel,
        findings: assessment.findings,
        recommendations: assessment.recommendations,
        phiDetected: assessment.phiElements,
        assessmentLevel: checkLevel,
        assessedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'HIPAA compliance assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // PHI de-identification endpoint
  fastify.post('/api/healthcare/deidentify', {
    schema: {
      body: PHIDeidentificationSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof PHIDeidentificationSchema>
  }>, reply: FastifyReply) => {
    try {
      const { content, method, preserveStructure, customRules } = request.body;

      const deidentificationResult = await hipaaService.deidentifyContent(
        content,
        { method, preserveStructure, customRules }
      );

      return {
        originalLength: content.length,
        deidentifiedContent: deidentificationResult.content,
        deidentifiedLength: deidentificationResult.content.length,
        elementsRemoved: deidentificationResult.removedElements,
        method,
        confidence: deidentificationResult.confidence,
        warnings: deidentificationResult.warnings,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'PHI de-identification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Healthcare workflow templates endpoint
  fastify.get('/api/healthcare/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templates = await healthcareService.getWorkflowTemplates();
      
      return {
        templates: templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          workflowType: template.type,
          hipaaCompliant: template.hipaaCompliant,
          requiredFields: template.requiredFields,
          version: template.version
        }))
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to fetch healthcare templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Health check endpoint for healthcare services
  fastify.get('/api/healthcare/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthStatus = await Promise.all([
        healthcareService.getHealthStatus(),
        medicalTermService.getHealthStatus(),
        hipaaService.getHealthStatus()
      ]);

      return {
        status: 'healthy',
        services: {
          healthcareService: healthStatus[0],
          medicalTerminology: healthStatus[1],
          hipaaCompliance: healthStatus[2]
        },
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date().toISOString()
      };
    }
  });
}