/**
 * Legal & Regulatory Toolkit - Type Definitions
 * Epic 28.3 - Legal document processing and compliance components
 */

export interface LegalDocument {
    id: string;
    title: string;
    type: 'contract' | 'policy' | 'regulation' | 'agreement' | 'statute' | 'case_law';
    content: string;
    metadata: LegalDocumentMetadata;
    status: 'draft' | 'under_review' | 'approved' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    version: string;

export interface LegalDocumentMetadata {
    jurisdiction: string;
    practiceArea: string[];
    parties?: string[];
    effectiveDate?: Date;
    expirationDate?: Date;
    references: LegalReference[];
    tags: string[];
    confidentialityLevel: 'public' | 'confidential' | 'attorney_client' | 'work_product';

export interface LegalReference {
    id: string;
    type: 'statute' | 'regulation' | 'case' | 'treaty' | 'article';
    citation: string;
    title: string;
    url?: string;
    jurisdiction: string;
    year?: number;

export interface ContractClause {
    id: string;
    type: string;
    title: string;
    content: string;
    category: 'termination' | 'payment' | 'liability' | 'confidentiality' | 'dispute_resolution' | 'other';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    standardCompliance: boolean;
    suggestions?: string[];
    position: {,
        start: number;
        end: number;
    };

export interface ComplianceCheck {
    id: string;
    regulation: string;
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
    severity: 'info' | 'warning' | 'error' | 'critical';
    description: string;
    remediation?: string[];
    affectedSections: number[];

export interface LegalTerminology {
    term: string;
    definition: string;
    context: string;
    jurisdiction: string;
    source: string;
    alternatives?: string[];

export interface Citation {
    id: string;
    type: 'bluebook' | 'alwd' | 'chicago' | 'mla' | 'apa';
    shortForm: string;
    longForm: string;
    pinpoint?: string;
    volume?: string;
    reporter?: string;
    page?: string;
    court?: string;
    date?: string;
    url?: string;

export interface LegalDocumentParserProps {
    onDocumentParsed: (document: LegalDocument) => void;
    supportedTypes: LegalDocument['type'][];
    maxFileSize?: number;
    className?: string;

export interface ContractAnalyzerProps {
    document: LegalDocument;
    onClauseIdentified: (clauses: ContractClause[]) => void;
    onAnalysisComplete: (analysis: ContractAnalysis) => void;
    analysisType?: 'basic' | 'detailed' | 'comprehensive';
    className?: string;

export interface ContractAnalysis {
    documentId: string;
    clauses: ContractClause[];
    riskAssessment: RiskAssessment;
    complianceChecks: ComplianceCheck[];
    recommendations: string[];
    confidence: number;
    processingTime: number;

export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: RiskFactor[];
    mitigation: string[];
    score: number;

export interface RiskFactor {
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    likelihood: 'low' | 'medium' | 'high';
    mitigation: string[];

export interface ComplianceCheckerProps {
    document: LegalDocument;
    regulations: string[];
    onComplianceResults: (results: ComplianceCheck[]) => void;
    autoCheck?: boolean;
    className?: string;

export interface CitationManagerProps {
    citations: Citation[];
    onCitationAdd: (citation: Citation) => void;
    onCitationEdit: (id: string, citation: Citation) => void;
    onCitationDelete: (id: string) => void;
    citationStyle: Citation['type'];
    className?: string;

export interface TerminologyValidatorProps {
    text: string;
    onValidationResults: (results: TermValidationResult[]) => void;
    jurisdiction?: string;
    practiceArea?: string;
    autoValidate?: boolean;
    className?: string;

export interface TermValidationResult {
    term: string;
    position: {,
        start: number;
        end: number;
    };
    isValid: boolean;
    suggestions: LegalTerminology[];
    confidence: number;
    context: string;

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    type: 'gdpr_dsar' | 'policy_comparison' | 'contract_review' | 'compliance_audit' | 'due_diligence';
    steps: WorkflowStep[];
    estimatedTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];

export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    type: 'document_upload' | 'analysis' | 'review' | 'validation' | 'export';
    required: boolean;
    inputs: WorkflowInput[];
    outputs: WorkflowOutput[];
    automationLevel: 'manual' | 'assisted' | 'automated';

export interface WorkflowInput {
    name: string;
    type: 'document' | 'text' | 'selection' | 'boolean' | 'date';
    required: boolean;
    validation?: string;
    options?: string[];

export interface WorkflowOutput {
    name: string;
    type: 'document' | 'report' | 'checklist' | 'recommendation';
    format: 'pdf' | 'docx' | 'json' | 'html';
    description: string;

//# sourceMappingURL=types.d.ts.map