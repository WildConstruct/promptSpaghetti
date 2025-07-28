/**
 * Epic 28.1 - Medical Terminology Service
 * Service for medical terminology integration with UMLS, LOINC, SNOMED, and other healthcare vocabularies
 * 
 * Provides terminology search, concept mapping, validation, and vocabulary integration
 * for healthcare applications requiring standardized medical terminology
 */

import { z } from 'zod';

// Medical terminology schemas
const MedicalConceptSchema = z.object({
  conceptId: z.string(),
  preferredName: z.string(),
  synonyms: z.array(z.string()),
  definition: z.string().optional(),
  vocabulary: z.enum(['umls', 'loinc', 'snomed', 'icd10', 'cpt', 'rxnorm']),
  semanticType: z.string().optional(),
  relationships: z.array(z.object({
    relationshipType: z.string(),
    relatedConceptId: z.string(),
    relatedConceptName: z.string()
  })).default([])
});

const TerminologySearchOptionsSchema = z.object({
  vocabularies: z.array(z.enum(['umls', 'loinc', 'snomed', 'icd10', 'cpt', 'rxnorm'])).default(['umls']),
  limit: z.number().min(1).max(100).default(20),
  includeDefinitions: z.boolean().default(true),
  includeSynonyms: z.boolean().default(true),
  exactMatch: z.boolean().default(false),
  semanticTypes: z.array(z.string()).optional()
});

const ConceptValidationSchema = z.object({
  conceptId: z.string(),
  vocabulary: z.enum(['umls', 'loinc', 'snomed', 'icd10', 'cpt', 'rxnorm']),
  isValid: z.boolean(),
  validationErrors: z.array(z.string()).default([]),
  alternativeConcepts: z.array(z.string()).default([])
});

// Type definitions
type MedicalConcept = z.infer<typeof MedicalConceptSchema>;
type TerminologySearchOptions = z.infer<typeof TerminologySearchOptionsSchema>;
type ConceptValidation = z.infer<typeof ConceptValidationSchema>;

}
interface TerminologySearchResult {
  concepts: MedicalConcept[];
  total: number;
  searchTime: number;
}
}

}
interface VocabularyInfo {
  name: string;
  version: string;
  description: string;
  totalConcepts: number;
  lastUpdated: string;
}
}

export class MedicalTerminologyService {
  private vocabularyData: Map<string, Map<string, MedicalConcept>>;
  private vocabularyInfo: Map<string, VocabularyInfo>;

  constructor() {
    this.vocabularyData = new Map();
    this.vocabularyInfo = new Map();
    this.initializeVocabularies();
  }

  /**
   * Search medical terminology across specified vocabularies
   */
  async searchTerminology(
    query: string,
    options: TerminologySearchOptions = {}
  ): Promise<TerminologySearchResult> {

    const startTime = Date.now();
    const {
      vocabularies,
      limit,
      includeDefinitions,
      includeSynonyms,
      exactMatch,
      semanticTypes
    } = { ...TerminologySearchOptionsSchema.parse({}), ...options };

    try {
      const allResults: MedicalConcept[] = [];

      // Search across specified vocabularies
      for (const vocabulary of vocabularies) {
        const vocabResults = await this.searchInVocabulary(
          query,
          vocabulary,
          { exactMatch, semanticTypes }
        );
        allResults.push(...vocabResults);
      }

      // Sort by relevance (mock scoring based on query similarity)
      const scoredResults = allResults.map(concept => ({
        concept,
        score: this.calculateRelevanceScore(query, concept)
      }));

      scoredResults.sort((a, b) => b.score - a.score);

      // Apply limit and format results
      const limitedResults = scoredResults.slice(0, limit).map(({ concept }) => ({
        ...concept,
        synonyms: includeSynonyms ? concept.synonyms : [],
        definition: includeDefinitions ? concept.definition : undefined
      }));

      const searchTime = Date.now() - startTime;

      return {
        concepts: limitedResults,
        total: allResults.length,
        searchTime
      };

    } catch (error) {
      throw new Error(`Terminology search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a medical concept ID against its vocabulary
   */
  async validateConcept(
    conceptId: string,
    vocabulary: ConceptValidation['vocabulary']
  ): Promise<ConceptValidation> {

    try {
      const vocabData = this.vocabularyData.get(vocabulary);
      if (!vocabData) {
        return {
          conceptId,
          vocabulary,
          isValid: false,
          validationErrors: [`Vocabulary '${vocabulary}' not available`],
          alternativeConcepts: []
        };
      }

      const concept = vocabData.get(conceptId);
      const isValid = !!concept;

      const alternativeConcepts = isValid ? [] : await this.findSimilarConcepts(conceptId, vocabulary);

      return {
        conceptId,
        vocabulary,
        isValid,
        validationErrors: isValid ? [] : [`Concept ID '${conceptId}' not found in ${vocabulary}`],
        alternativeConcepts
      };

    } catch (error) {
      return {
        conceptId,
        vocabulary,
        isValid: false,
        validationErrors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        alternativeConcepts: []
      };
    }
  }

  /**
   * Get concept details by ID and vocabulary
   */
  async getConceptDetails(conceptId: string, vocabulary: string): Promise<MedicalConcept | null> {

    try {
      const vocabData = this.vocabularyData.get(vocabulary);
      if (!vocabData) {
        return null;
      }

      return vocabData.get(conceptId) || null;

    } catch (error) {
      throw new Error(`Failed to get concept details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map terms to standardized concepts
   */
  async mapTermsToConcepts(
    terms: string[],
    targetVocabularies: string[] = ['umls']
  ): Promise<Array<{ term: string; mappedConcepts: MedicalConcept[] }>> {
    try {
      const mappingResults = [];

      for (const term of terms) {
        const searchResult = await this.searchTerminology(term, {
          vocabularies: targetVocabularies as any[],
          limit: 3,
          exactMatch: false
        });

        mappingResults.push({
          term,
          mappedConcepts: searchResult.concepts
        });
      }

      return mappingResults;

    } catch (error) {
      throw new Error(`Term mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available vocabulary information
   */
  async getVocabularyInfo(): Promise<VocabularyInfo[]> {

    return Array.from(this.vocabularyInfo.values());
  }

  /**
   * Get concept relationships (hierarchical and associative)
   */
  async getConceptRelationships(
    conceptId: string,
    vocabulary: string
  ): Promise<MedicalConcept['relationships']> {

    try {
      const concept = await this.getConceptDetails(conceptId, vocabulary);
      return concept?.relationships || [];
    } catch (error) {
      throw new Error(`Failed to get concept relationships: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ status: string; details?: Record<string, unknown> }> {
    try {
      const vocabularyStatuses = Array.from(this.vocabularyInfo.entries()).map(([vocab, info]) => ({
        vocabulary: vocab,
        available: this.vocabularyData.has(vocab),
        conceptCount: this.vocabularyData.get(vocab)?.size || 0,
        version: info.version
      }));

      const allHealthy = vocabularyStatuses.every(v => v.available && v.conceptCount > 0);

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          vocabularies: vocabularyStatuses,
          totalConcepts: Array.from(this.vocabularyData.values())
            .reduce((total, vocab) => total + vocab.size, 0)
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

  private async searchInVocabulary(
    query: string,
    vocabulary: string,
    options: { exactMatch?: boolean; semanticTypes?: string[] }
  ): Promise<MedicalConcept[]> {

    const vocabData = this.vocabularyData.get(vocabulary);
    if (!vocabData) {
      return [];
    }

    const results: MedicalConcept[] = [];
    const lowerQuery = query.toLowerCase();

    for (const concept of vocabData.values()) {
      let matches = false;

      if (options.exactMatch) {
        // Exact match against preferred name and synonyms
        matches = concept.preferredName.toLowerCase() === lowerQuery ||
          concept.synonyms.some(syn => syn.toLowerCase() === lowerQuery);
      } else {
        // Partial match against preferred name and synonyms
        matches = concept.preferredName.toLowerCase().includes(lowerQuery) ||
          concept.synonyms.some(syn => syn.toLowerCase().includes(lowerQuery));
      }

      // Filter by semantic types if specified
      if (matches && options.semanticTypes && concept.semanticType) {
        matches = options.semanticTypes.includes(concept.semanticType);
      }

      if (matches) {
        results.push(concept);
      }
    }

    return results;
  }

  private calculateRelevanceScore(query: string, concept: MedicalConcept): number {
    const lowerQuery = query.toLowerCase();
    const lowerName = concept.preferredName.toLowerCase();

    let score = 0;

    // Exact match gets highest score
    if (lowerName === lowerQuery) {
      score += 100;
    } 
    // Starts with query gets high score
    else if (lowerName.startsWith(lowerQuery)) {
      score += 80;
    }
    // Contains query gets medium score
    else if (lowerName.includes(lowerQuery)) {
      score += 60;
    }

    // Check synonyms for additional scoring
    for (const synonym of concept.synonyms) {
      const lowerSyn = synonym.toLowerCase();
      if (lowerSyn === lowerQuery) {
        score += 90;
        break;
      } else if (lowerSyn.startsWith(lowerQuery)) {
        score += 70;
        break;
      } else if (lowerSyn.includes(lowerQuery)) {
        score += 50;
        break;
      }
    }

    return score;
  }

  private async findSimilarConcepts(conceptId: string, vocabulary: string): Promise<string[]> {

    // Mock implementation - in production would use similarity algorithms
    const vocabData = this.vocabularyData.get(vocabulary);
    if (!vocabData) {
      return [];
    }

    // Return first 3 concept IDs as alternatives (simplified)
    return Array.from(vocabData.keys()).slice(0, 3);
  }

  private initializeVocabularies(): void {
    // Initialize mock vocabulary data
    this.initializeUMLS();
    this.initializeLOINC();
    this.initializeSNOMED();
    this.initializeICD10();
    this.initializeCPT();
    this.initializeRxNorm();
  }

  private initializeUMLS(): void {
    const umlsConcepts = new Map<string, MedicalConcept>();

    // Sample UMLS concepts
    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: 'C0020538',
        preferredName: 'Hypertensive disease',
        synonyms: ['High blood pressure', 'Hypertension', 'HTN'],
        definition: 'Persistently high arterial blood pressure',
        vocabulary: 'umls',
        semanticType: 'Disease or Syndrome',
        relationships: [
          {
            relationshipType: 'isa',
            relatedConceptId: 'C0007222',
            relatedConceptName: 'Cardiovascular Diseases'
          }
        ]
  }
      {
        conceptId: 'C0011847',
        preferredName: 'Diabetes',
        synonyms: ['Diabetes mellitus', 'DM'],
        definition: 'A group of metabolic disorders characterized by high blood sugar',
        vocabulary: 'umls',
        semanticType: 'Disease or Syndrome',
        relationships: []
  }
      {
        conceptId: 'C0004057',
        preferredName: 'Aspirin',
        synonyms: ['Acetylsalicylic acid', 'ASA'],
        definition: 'A medication used to reduce pain, fever, or inflammation',
        vocabulary: 'umls',
        semanticType: 'Pharmacologic Substance',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      umlsConcepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('umls', umlsConcepts);
    this.vocabularyInfo.set('umls', {
      name: 'Unified Medical Language System',
      version: '2023AA',
      description: 'Comprehensive medical terminology system',
      totalConcepts: umlsConcepts.size,
      lastUpdated: '2023-05-01'
    });
  }

  private initializeLOINC(): void {
    const loincConcepts = new Map<string, MedicalConcept>();

    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: '85354-9',
        preferredName: 'Blood pressure panel with all children optional',
        synonyms: ['BP panel', 'Blood pressure measurement'],
        definition: 'Panel for measuring systolic and diastolic blood pressure',
        vocabulary: 'loinc',
        semanticType: 'Laboratory or Test Result',
        relationships: []
  }
      {
        conceptId: '33747-0',
        preferredName: 'General appearance of patient',
        synonyms: ['Patient appearance', 'Physical appearance'],
        definition: 'Observable characteristics of patient appearance',
        vocabulary: 'loinc',
        semanticType: 'Clinical Observation',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      loincConcepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('loinc', loincConcepts);
    this.vocabularyInfo.set('loinc', {
      name: 'Logical Observation Identifiers Names and Codes',
      version: '2.74',
      description: 'Database and universal standard for identifying medical laboratory observations',
      totalConcepts: loincConcepts.size,
      lastUpdated: '2023-06-01'
    });
  }

  private initializeSNOMED(): void {
    const snomedConcepts = new Map<string, MedicalConcept>();

    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: '38341003',
        preferredName: 'Hypertensive disorder',
        synonyms: ['High blood pressure disorder', 'Hypertension'],
        definition: 'Disorder characterized by persistently elevated blood pressure',
        vocabulary: 'snomed',
        semanticType: 'Clinical Finding',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      snomedConcepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('snomed', snomedConcepts);
    this.vocabularyInfo.set('snomed', {
      name: 'Systematized Nomenclature of Medicine Clinical Terms',
      version: '2023-07-31',
      description: 'Comprehensive clinical terminology',
      totalConcepts: snomedConcepts.size,
      lastUpdated: '2023-07-31'
    });
  }

  private initializeICD10(): void {
    const icd10Concepts = new Map<string, MedicalConcept>();

    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: 'I10',
        preferredName: 'Essential hypertension',
        synonyms: ['Primary hypertension', 'Idiopathic hypertension'],
        definition: 'High blood pressure of unknown cause',
        vocabulary: 'icd10',
        semanticType: 'Disease Code',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      icd10Concepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('icd10', icd10Concepts);
    this.vocabularyInfo.set('icd10', {
      name: 'International Classification of Diseases, 10th Revision',
      version: '2023',
      description: 'Global health information standard for mortality and morbidity statistics',
      totalConcepts: icd10Concepts.size,
      lastUpdated: '2023-01-01'
    });
  }

  private initializeCPT(): void {
    const cptConcepts = new Map<string, MedicalConcept>();

    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: '99213',
        preferredName: 'Office or other outpatient visit for evaluation and management',
        synonyms: ['E&M visit', 'Outpatient consultation'],
        definition: 'Established patient office visit, low to moderate complexity',
        vocabulary: 'cpt',
        semanticType: 'Procedure Code',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      cptConcepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('cpt', cptConcepts);
    this.vocabularyInfo.set('cpt', {
      name: 'Current Procedural Terminology',
      version: '2023',
      description: 'Medical procedural coding system',
      totalConcepts: cptConcepts.size,
      lastUpdated: '2023-01-01'
    });
  }

  private initializeRxNorm(): void {
    const rxnormConcepts = new Map<string, MedicalConcept>();

    const sampleConcepts: MedicalConcept[] = [
      {
        conceptId: '1191',
        preferredName: 'Aspirin',
        synonyms: ['Acetylsalicylic acid', 'ASA'],
        definition: 'Nonsteroidal anti-inflammatory drug',
        vocabulary: 'rxnorm',
        semanticType: 'Clinical Drug',
        relationships: []
      }
    ];

    sampleConcepts.forEach(concept => {
      rxnormConcepts.set(concept.conceptId, concept);
    });

    this.vocabularyData.set('rxnorm', rxnormConcepts);
    this.vocabularyInfo.set('rxnorm', {
      name: 'RxNorm',
      version: '2023-07',
      description: 'Normalized naming system for generic and branded drugs',
      totalConcepts: rxnormConcepts.size,
      lastUpdated: '2023-07-01'
    });
  }
}