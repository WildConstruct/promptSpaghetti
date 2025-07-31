/**
 * Legal Toolkit - Main component integrating all legal tools
 * Epic 28.3 - Legal & Regulatory Toolkit
 *
 * Comprehensive legal document processing toolkit with integrated workflow
 * for document parsing, analysis, compliance checking, and citation management
 */
import React from 'react';
import { LegalDocument, ContractAnalysis, ComplianceCheck, Citation, TermValidationResult } from './types';

}
interface LegalToolkitProps {
    className?: string;
    initialDocument?: LegalDocument;
    onWorkflowComplete?: (results: LegalToolkitResults) => void;


}
interface LegalToolkitResults {
    document: LegalDocument;
    analysis?: ContractAnalysis;
    complianceResults?: ComplianceCheck[];
    citations: Citation[];
    terminologyResults?: TermValidationResult[];

export declare const LegalToolkit: React.FC<LegalToolkitProps>;
export default LegalToolkit;
//# sourceMappingURL=LegalToolkit.d.ts.map
}