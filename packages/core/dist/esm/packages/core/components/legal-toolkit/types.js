/**
 * Legal & Regulatory Toolkit - Type Definitions
 * Epic 28.3 - Legal document processing and compliance components
 */
content: string;
metadata: LegalDocumentMetadata;
status: 'draft' | 'under_review' | 'approved' | 'archived';
createdAt: Date;
updatedAt: Date;
version: string;
;
description: string;
remediation ?  : string;
affectedSections: number;
supportedTypes: LegalDocument['type'][];
maxFileSize ?  : number;
className ?  : string;
onAnalysisComplete: (analysis) => void ;
analysisType ?  : 'basic' | 'detailed' | 'comprehensive';
className ?  : string;
likelihood: 'low' | 'medium' | 'high';
mitigation: string;
citationStyle: Citation['type'];
className ?  : string;
position: {
    start: number;
    end: number;
}
;
isValid: boolean;
suggestions: LegalTerminology;
confidence: number;
context: string;
tags: string;
description: string;
export {};
