/**
 * Epic 28.1 - Healthcare Service
 * Core service for healthcare data processing, clinical workflows, and medical content generation
 * 
 * Provides HIPAA-compliant medical text processing, clinical workflow generation,
 * and healthcare data validation with integrated medical terminology support
 */

import { z } from 'zod';
import { MedicalTerminologyService } from './medical-terminology-service';
import { HIPAAComplianceService } from './hipaa-compliance-service';

// Healthcare data types and schemas
const MedicalEntitySchema = z.object({
  text: z.string(),
  label: z.enum(
    ['PERSON',
    'DATE',
    'PHONE',
    'EMAIL',
    'SSN',
    'MEDICAL_RECORD_NUMBER',
    'DIAGNOSIS',
    'MEDICATION',
    'PROCEDURE',
    'ANATOMY',
    'DOSAGE']
  ),
  start: z.number(),
  end: z.number(),
  confidence: z.number().min(0).max(1),
  conceptId: z.string().optional()
});

const TerminologyMappingSchema = z.object({
  originalTerm: z.string(),
  mappedConcept: z.string(),
  vocabularySource: z.enum(['umls', 'loinc', 'snomed', 'icd10', 'cpt', 'rxnorm']),
  confidence: z.number().min(0).max(1)
});

const ValidationResultSchema = z.object({
  field: z.string(),
  isValid: z.boolean(),
  errors: z.array(z.string())
});

const ClinicalWorkflowSchema = z.object({
  id: z.string(),
  type: z.enum(['clinical_note', 'patient_summary', 'discharge_summary', 'care_plan', 'medication_reconciliation']),
  content: z.string(),
  templateId: z.string().optional(),
  hipaaCompliant: z.boolean(),
  metadata: z.record(z.unknown()).default({})
});

const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['clinical_note', 'patient_summary', 'discharge_summary', 'care_plan', 'medication_reconciliation']),
  hipaaCompliant: z.boolean(),
  requiredFields: z.array(z.string()),
  template: z.string(),
  version: z.string()
});

// Type definitions
type MedicalEntity = z.infer<typeof MedicalEntitySchema>;
type TerminologyMapping = z.infer<typeof TerminologyMappingSchema>;
type ValidationResult = z.infer<typeof ValidationResultSchema>;
type ClinicalWorkflow = z.infer<typeof ClinicalWorkflowSchema>;
type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

interface MedicalTextProcessingOptions {
  deidentify?: boolean;
  mapTerminology?: boolean;
  extractEntities?: boolean;
  validateCodes?: boolean;
}

interface ProcessedMedicalText {
  original: string;
  deidentified?: string;
  entities: MedicalEntity[];
  terminologyMappings: TerminologyMapping[];
  validationResults: ValidationResult[];
}

interface HealthcareDataValidationOptions {
  version?: string;
  strict?: boolean;
}

interface HealthcareDataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: string[];
  detectedVersion?: string;
}

interface ClinicalWorkflowOptions {
  templateId?: string;
  customizations?: Record<string, unknown>;
}

export class HealthcareService {
  private medicalTermService: MedicalTerminologyService;
  private hipaaService: HIPAAComplianceService;
  private workflowTemplates: WorkflowTemplate[];

  constructor() {
    this.medicalTermService = new MedicalTerminologyService();
    this.hipaaService = new HIPAAComplianceService();
    this.workflowTemplates = this.initializeWorkflowTemplates();
  }

  /**
   * Process medical text with optional de-identification, entity extraction, and terminology mapping
   */
  async processMedicalText(
    text: string, 
    options: MedicalTextProcessingOptions = {}
  ): Promise<ProcessedMedicalText> {
    const {
      deidentify = true,
      mapTerminology = true,
      extractEntities = true,
      validateCodes = true
    } = options;

    let processedText = text;
    const entities: MedicalEntity[] = [];
    const terminologyMappings: TerminologyMapping[] = [];
    const validationResults: ValidationResult[] = [];

    try {
      // Step 1: Extract medical entities
      if (extractEntities) {
        const extractedEntities = await this.extractMedicalEntities(text);
        entities.push(...extractedEntities);
      }

      // Step 2: De-identify PHI if requested
      if (deidentify) {
        const deidentificationResult = await this.hipaaService.deidentifyContent(text, {
          method: 'safe_harbor',
          preserveStructure: true
        });
        processedText = deidentificationResult.content;
      }

      // Step 3: Map medical terminology
      if (mapTerminology) {
        const mappings = await this.mapMedicalTerminology(text);
        terminologyMappings.push(...mappings);
      }

      // Step 4: Validate medical codes
      if (validateCodes) {
        const validation = await this.validateMedicalCodes(text);
        validationResults.push(...validation);
      }

      return {
        original: text,
        deidentified: deidentify ? processedText : undefined,
        entities,
        terminologyMappings,
        validationResults
      };

    } catch (error) {
      throw new Error(`Medical text processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate healthcare data against standard formats (FHIR, HL7, etc.)
   */
  async validateHealthcareData(
    data: Record<string, unknown>,
    format: 'fhir' | 'hl7v2' | 'hl7v3' | 'cda' | 'dicom',
    options: HealthcareDataValidationOptions = {}
  ): Promise<HealthcareDataValidationResult> {
    const { version, strict = true } = options;
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedFields: string[] = [];

    try {
      switch (format) {
        case 'fhir':
          return await this.validateFHIRData(data, { version, strict });
        case 'hl7v2':
          return await this.validateHL7v2Data(data, { version, strict });
        case 'hl7v3':
          return await this.validateHL7v3Data(data, { version, strict });
        case 'cda':
          return await this.validateCDAData(data, { version, strict });
        case 'dicom':
          return await this.validateDICOMData(data, { version, strict });
        default:
          throw new Error(`Unsupported healthcare data format: ${format}`);
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings,
        validatedFields
      };
    }
  }

  /**
   * Generate clinical workflow content based on patient data and templates
   */
  async generateClinicalWorkflow(
    workflowType: ClinicalWorkflow['type'],
    patientData: Record<string, unknown>,
    options: ClinicalWorkflowOptions = {}
  ): Promise<ClinicalWorkflow> {
    const { templateId, customizations = {} } = options;

    try {
      // Find or use default template
      let template = templateId 
        ? this.workflowTemplates.find(t => t.id === templateId)
        : this.workflowTemplates.find(t => t.type === workflowType);

      if (!template) {
        throw new Error(`No template found for workflow type: ${workflowType}`);
      }

      // Validate required fields
      const missingFields = template.requiredFields.filter(field => !(field in patientData));
      if (missingFields.length > 0) {
        throw new Error(`Missing required patient data fields: ${missingFields.join(', ')}`);
      }

      // Generate workflow content
      const workflowContent = await this.generateWorkflowContent(template, patientData, customizations);

      // Ensure HIPAA compliance
      const hipaaAssessment = await this.hipaaService.assessHIPAACompliance(
        workflowContent,
        'clinical_note',
        'comprehensive'
      );

      const workflow: ClinicalWorkflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: workflowType,
        content: workflowContent,
        templateId: template.id,
        hipaaCompliant: hipaaAssessment.score >= 85, // Minimum compliance threshold
        metadata: {
          generatedAt: new Date().toISOString(),
          templateVersion: template.version,
          customizations,
          complianceScore: hipaaAssessment.score
        }
      };

      return workflow;

    } catch (error) {
      throw new Error(`Clinical workflow generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available workflow templates
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return this.workflowTemplates;
  }

  /**
   * Get health status of the healthcare service
   */
  async getHealthStatus(): Promise<{ status: string; details?: Record<string, unknown> }> {
    try {
      const medicalTermServiceHealth = await this.medicalTermService.getHealthStatus();
      const hipaaServiceHealth = await this.hipaaService.getHealthStatus();

      const allHealthy = medicalTermServiceHealth.status === 'healthy' && hipaaServiceHealth.status === 'healthy';

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          terminologyService: medicalTermServiceHealth,
          hipaaService: hipaaServiceHealth,
          templatesLoaded: this.workflowTemplates.length
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Private helper methods

  private async extractMedicalEntities(text: string): Promise<MedicalEntity[]> {
    // Mock implementation - in production would use NLP models like spaCy or Transformers
    const entities: MedicalEntity[] = [];
    
    // Simple regex-based entity extraction for demo purposes
    const patterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, label: 'SSN' as const },
      { pattern: /\b\d{10,}\b/g, label: 'MEDICAL_RECORD_NUMBER' as const },
      { pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, label: 'DATE' as const },
      { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, label: 'PHONE' as const },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: 'EMAIL' as const }
    ];

    patterns.forEach(({ pattern, label }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          text: match[0],
          label,
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.9 // Mock confidence
        });
      }
    });

    return entities;
  }

  private async mapMedicalTerminology(text: string): Promise<TerminologyMapping[]> {
    // Mock terminology mapping - would integrate with actual UMLS/LOINC services
    const commonMedicalTerms = [
      { term: 'hypertension', concept: 'C0020538', vocabulary: 'umls' as const },
      { term: 'diabetes', concept: 'C0011847', vocabulary: 'umls' as const },
      { term: 'aspirin', concept: 'C0004057', vocabulary: 'rxnorm' as const },
      { term: 'blood pressure', concept: '85354-9', vocabulary: 'loinc' as const }
    ];

    const mappings: TerminologyMapping[] = [];
    const lowerText = text.toLowerCase();

    commonMedicalTerms.forEach(({ term, concept, vocabulary }) => {
      if (lowerText.includes(term)) {
        mappings.push({
          originalTerm: term,
          mappedConcept: concept,
          vocabularySource: vocabulary,
          confidence: 0.85
        });
      }
    });

    return mappings;
  }

  private async validateMedicalCodes(text: string): Promise<ValidationResult[]> {
    // Mock medical code validation
    const results: ValidationResult[] = [];
    
    // Check for ICD-10 codes
    const icd10Pattern = /[A-TV-Z][0-9][A-Z0-9](\.[A-Z0-9]{1,4})?/g;
    const icd10Matches = text.match(icd10Pattern) || [];
    
    results.push({
      field: 'icd10_codes',
      isValid: icd10Matches.length === 0 || icd10Matches.every(code => this.isValidICD10Code(code)),
      errors: icd10Matches.filter(code => !this.isValidICD10Code(code)).map(code => `Invalid ICD-10 code: ${code}`)
    });

    return results;
  }

  private isValidICD10Code(code: string): boolean {
    // Simplified ICD-10 validation - in production would use official code sets
    return /^[A-TV-Z][0-9][A-Z0-9](\.[A-Z0-9]{1,4})?$/.test(code);
  }

  private async validateFHIRData(
    data: Record<string, unknown>,
    options: HealthcareDataValidationOptions
  ): Promise<HealthcareDataValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedFields: string[] = [];

    // Mock FHIR validation
    if (!data.resourceType) {
      errors.push('Missing required field: resourceType');
    } else {
      validatedFields.push('resourceType');
    }

    if (!data.id) {
      warnings.push('Recommended field missing: id');
    } else {
      validatedFields.push('id');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedFields,
      detectedVersion: '4.0.1'
    };
  }

  private async validateHL7v2Data(
    data: Record<string, unknown>,
    options: HealthcareDataValidationOptions
  ): Promise<HealthcareDataValidationResult> {
    // Mock HL7v2 validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      validatedFields: Object.keys(data),
      detectedVersion: '2.5.1'
    };
  }

  private async validateHL7v3Data(
    data: Record<string, unknown>,
    options: HealthcareDataValidationOptions
  ): Promise<HealthcareDataValidationResult> {
    // Mock HL7v3 validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      validatedFields: Object.keys(data),
      detectedVersion: '3.0'
    };
  }

  private async validateCDAData(
    data: Record<string, unknown>,
    options: HealthcareDataValidationOptions
  ): Promise<HealthcareDataValidationResult> {
    // Mock CDA validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      validatedFields: Object.keys(data),
      detectedVersion: 'R2'
    };
  }

  private async validateDICOMData(
    data: Record<string, unknown>,
    options: HealthcareDataValidationOptions
  ): Promise<HealthcareDataValidationResult> {
    // Mock DICOM validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      validatedFields: Object.keys(data),
      detectedVersion: '3.0'
    };
  }

  private async generateWorkflowContent(
    template: WorkflowTemplate,
    patientData: Record<string, unknown>,
    customizations: Record<string, unknown>
  ): Promise<string> {
    let content = template.template;

    // Simple template variable replacement
    Object.entries(patientData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Apply customizations
    Object.entries(customizations).forEach(([key, value]) => {
      const placeholder = `{{custom_${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return content;
  }

  private initializeWorkflowTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'clinical_note_basic',
        name: 'Basic Clinical Note',
        description: 'Standard clinical documentation template',
        type: 'clinical_note',
        hipaaCompliant: true,
        requiredFields: ['patientName', 'dateOfService', 'chiefComplaint'],
        template: `CLINICAL NOTE

Patient: {{patientName}}
Date of Service: {{dateOfService}}
Chief Complaint: {{chiefComplaint}}

History of Present Illness:
{{historyPresentIllness}}

Assessment and Plan:
{{assessmentPlan}}

Provider: {{providerName}}
Date: {{documentDate}}`,
        version: '1.0'
      },
      {
        id: 'discharge_summary_standard',
        name: 'Standard Discharge Summary',
        description: 'Hospital discharge summary template',
        type: 'discharge_summary',
        hipaaCompliant: true,
        requiredFields: ['patientName', 'admissionDate', 'dischargeDate', 'primaryDiagnosis'],
        template: `DISCHARGE SUMMARY

Patient: {{patientName}}
Admission Date: {{admissionDate}}
Discharge Date: {{dischargeDate}}

Primary Diagnosis: {{primaryDiagnosis}}
Secondary Diagnoses: {{secondaryDiagnoses}}

Hospital Course:
{{hospitalCourse}}

Discharge Instructions:
{{dischargeInstructions}}

Follow-up: {{followUpInstructions}}

Attending Physician: {{attendingPhysician}}`,
        version: '1.0'
      }
    ];
  }
}