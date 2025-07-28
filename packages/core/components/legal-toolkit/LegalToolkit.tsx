/**
 * Legal Toolkit - Main component integrating all legal tools
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Comprehensive legal document processing toolkit with integrated workflow
 * for document parsing, analysis, compliance checking, and citation management
 */
import React, { useState, useCallback } from 'react';
import { LegalDocumentParser } from './LegalDocumentParser';
import { ContractAnalyzer } from './ContractAnalyzer';
import { ComplianceChecker } from './ComplianceChecker';
import { CitationManager } from './CitationManager';
import { TerminologyValidator } from './TerminologyValidator';
import { 
  LegalDocument, 
  ContractAnalysis, 
  ContractClause, 
  ComplianceCheck, 
  Citation,
  TermValidationResult 
} from './types';
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
}
type ToolkitView = 'upload' | 'analyze' | 'compliance' | 'citations' | 'terminology' | 'summary';

export const LegalToolkit: React.FC<LegalToolkitProps> = ({)
  className = '',
  initialDocument,
  onWorkflowComplete
}) => {
  const [currentView, setCurrentView] = useState<ToolkitView>(initialDocument ? 'analyze' : 'upload');
  const [document, setDocument] = useState<LegalDocument | null>(initialDocument || null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [complianceResults, setComplianceResults] = useState<ComplianceCheck[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [terminologyResults, setTerminologyResults] = useState<TermValidationResult[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const calculateProgress = useCallback(() => {
    let completed = 0;
    const total = 5; // upload, analyze, compliance, citations, terminology;
    if (document) completed++;
    if (analysis) completed++;
    if (complianceResults.length > 0) completed++;
    if (citations.length > 0) completed++;
    if (terminologyResults.length > 0) completed++;
    const progress = (completed / total) * 100;
    setWorkflowProgress(progress);
    return progress;
  }, [document, analysis, complianceResults, citations, terminologyResults]);
  React.useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);
  const handleDocumentParsed = (parsedDocument: LegalDocument) => {
    setDocument(parsedDocument);
    setCurrentView('analyze');
  };
  const handleAnalysisComplete = (contractAnalysis: ContractAnalysis) => {
    setAnalysis(contractAnalysis);
  };
  const handleComplianceResults = (results: ComplianceCheck[]) => {
    setComplianceResults(results);
  };
  const handleCitationAdd = (citation: Citation) => {
    setCitations(prev => [...prev, citation]);
  };
  const handleCitationEdit = (id: string, updatedCitation: Citation) => {
    setCitations(prev => prev.map(c => c.id === id ? updatedCitation : c));
  };
  const handleCitationDelete = (id: string) => {
    setCitations(prev => prev.filter(c => c.id !== id));
  };
  const handleTerminologyResults = (results: TermValidationResult[]) => {
    setTerminologyResults(results);
  };
  const handleCompleteWorkflow = () => {
    if (document && onWorkflowComplete) {
      const results: LegalToolkitResults = {
        document,
        analysis: analysis || undefined,
        complianceResults: complianceResults.length > 0 ? complianceResults : undefined,
        citations,
        terminologyResults: terminologyResults.length > 0 ? terminologyResults : undefined
      };
      onWorkflowComplete(results);
    }
  };
  const getViewIcon = (view: ToolkitView) => {
    switch (view) {
    case 'upload': return '📄';
    case 'analyze': return '🔍';
    case 'compliance': return '✅';
    case 'citations': return '📚';
    case 'terminology': return '📖';
    case 'summary': return '📊';
    default: return '📄';
    }
  };
  const getViewTitle = (view: ToolkitView) => {
    switch (view) {
    case 'upload': return 'Upload Document';
    case 'analyze': return 'Analyze Contract';
    case 'compliance': return 'Check Compliance';
    case 'citations': return 'Manage Citations';
    case 'terminology': return 'Validate Terminology';
    case 'summary': return 'Review Summary';
    default: return 'Legal Toolkit';
    }
  };
  const getHeaderTitle = (view: ToolkitView) => {
    switch (view) {
    case 'upload': return 'Document Upload & Parsing';
    case 'analyze': return 'Contract Analysis';
    case 'compliance': return 'Compliance Review';
    case 'citations': return 'Citation Management';
    case 'terminology': return 'Terminology Validation';
    case 'summary': return 'Results Summary';
    default: return 'Legal Toolkit';
    }
  };
  const isViewEnabled = (view: ToolkitView) => {
    switch (view) {
    case 'upload': return true;
    case 'analyze': return !!document;
    case 'compliance': return !!document;
    case 'citations': return true; // Always available
    case 'terminology': return !!document;
    case 'summary': return !!document && workflowProgress > 20;
    default: return false;
    }
  };
  const getViewCompletionStatus = (view: ToolkitView) => {
    switch (view) {
    case 'upload': return !!document;
    case 'analyze': return !!analysis;
    case 'compliance': return complianceResults.length > 0;
    case 'citations': return citations.length > 0;
    case 'terminology': return terminologyResults.length > 0;
    case 'summary': return workflowProgress >= 100;
    default: return false;
    }
  };
  return ()
    <div className={`legal-toolkit ${className}`}>}
      <style>
        {`
          .legal-toolkit {
            background: white;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            min-height: 700px;
            display: flex;
            flex-direction: column;
          }
          .toolkit-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 2rem;
            text-align: center;
          }
          .toolkit-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }
          .toolkit-subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0;
          }
          .progress-section {
            background: #f8fafc;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .progress-label {
            font-size: 0.9rem;
            font-weight: 600;
            color: #374151;
          }
          .progress-percentage {
            font-size: 0.9rem;
            color: #4b5563;
          }
          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #34d399);
            border-radius: 4px;
            transition: width 0.5s ease;
          }
          .toolkit-navigation {
            display: flex;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            overflow-x: auto;
          }
          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            color: #6b7280;
            transition: all 0.2s;
            white-space: nowrap;
            position: relative;
          }
          .nav-item:hover {
            background: #f3f4f6;
            color: #374151;
          }
          .nav-item.active {
            background: white;
            color: #1e40af;
            font-weight: 600;
            border-bottom: 3px solid #3b82f6;
          }
          .nav-item.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .nav-item.disabled:hover {
            background: transparent;
            color: #6b7280;
          }
          .nav-icon {
            font-size: 1.1rem;
          }
          .nav-status {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
          }
          .nav-status.incomplete {
            background: #e5e7eb;
          }
          .toolkit-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .view-header {
            background: #fefefe;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .view-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin: 0 0 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .view-description {
            color: #6b7280;
            font-size: 0.95rem;
            margin: 0;
          }
          .view-content {
            flex: 1;
            padding: 0;
            overflow: auto;
          }
          .summary-view {
            padding: 2rem;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          }
          .summary-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .summary-card-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .summary-items {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
          }
          .summary-label {
            color: #374151;
          }
          .summary-value {
            font-weight: 600;
            color: #1f2937;
          }
          .workflow-actions {
            background: #f9fafb;
            padding: 1.5rem 2rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .workflow-info {
            font-size: 0.9rem;
            color: #6b7280;
          }
          .workflow-buttons {
            display: flex;
            gap: 1rem;
          }
          .workflow-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }
          .workflow-btn.primary {
            background: #3b82f6;
            color: white;
          }
          .workflow-btn.primary:hover {
            background: #2563eb;
          }
          .workflow-btn.secondary {
            background: #e5e7eb;
            color: #374151;
          }
          .workflow-btn.secondary:hover {
            background: #d1d5db;
          }
          @media (max-width: 768px) {
            .toolkit-navigation {
              flex-wrap: wrap;
            }
            .summary-grid {
              grid-template-columns: 1fr;
            }
            .workflow-actions {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }
            .workflow-buttons {
              justify-content: center;
            }
          }
        `}
      </style>
      <div className="toolkit-header">
        <h1 className="toolkit-title">Legal & Regulatory Toolkit</h1>
        <p className="toolkit-subtitle">
          Comprehensive document analysis, compliance checking, and legal workflow management
        </p>
      </div>
      <div className="progress-section">
        <div className="progress-header">
          <div className="progress-label">Workflow Progress</div>
          <div className="progress-percentage">{Math.round(workflowProgress)}%</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${workflowProgress}%` }}
          ></div>
        </div>
      </div>
      <nav className="toolkit-navigation">
        {(['upload', 'analyze', 'compliance', 'citations', 'terminology', 'summary'] as ToolkitView[]).map(view => ()
          <button
            key={view}
            className={`nav-item ${currentView === view ? 'active' : ''} ${!isViewEnabled(view) ? 'disabled' : ''}`}
            onClick={() => isViewEnabled(view) && setCurrentView(view)}
            disabled={!isViewEnabled(view)}
            data-testid={`nav-${view}-tab`}
          >
            <span className="nav-icon">{getViewIcon(view)}</span>
            <span data-testid={`nav-${view}-title`}>{getViewTitle(view)}</span>}
            <div className={`nav-status ${getViewCompletionStatus(view) ? '' : 'incomplete'}`}></div>}
          </button>
        ))}
      </nav>
      <div className="toolkit-content">
        <div className="view-header">
          <h2 className="view-title" data-testid={`header-${currentView}-title`}>}
            <span>{getViewIcon(currentView)}</span>
            {getHeaderTitle(currentView)}
          </h2>
          <p className="view-description">
            {currentView === 'upload' && 'Upload and parse your legal document to begin analysis'}
            {currentView === 'analyze' && 'Analyze contract clauses, risks, and structure'}
            {currentView === 'compliance' && 'Check document compliance against regulatory frameworks'}
            {currentView === 'citations' && 'Manage legal citations and references'}
            {currentView === 'terminology' && 'Validate legal terminology and language usage'}
            {currentView === 'summary' && 'Review complete analysis and export results'}
          </p>
        </div>
        <div className="view-content">
          {currentView === 'upload' && ()
            <LegalDocumentParser
              onDocumentParsed={handleDocumentParsed}
              supportedTypes={['contract', 'policy', 'regulation', 'agreement', 'statute']}
            />
          )}
          {currentView === 'analyze' && document && ()
            <ContractAnalyzer
              document={document}
              onClauseIdentified={(_____clauses: ContractClause[]) => {}}
              onAnalysisComplete={handleAnalysisComplete}
              analysisType="comprehensive"
            />
          )}
          {currentView === 'compliance' && document && ()
            <ComplianceChecker
              document={document}
              regulations={['gdpr', 'ccpa']}
              onComplianceResults={handleComplianceResults}
              autoCheck={true}
            />
          )}
          {currentView === 'citations' && ()
            <CitationManager
              citations={citations}
              onCitationAdd={handleCitationAdd}
              onCitationEdit={handleCitationEdit}
              onCitationDelete={handleCitationDelete}
              citationStyle="bluebook"
            />
          )}
          {currentView === 'terminology' && document && ()
            <TerminologyValidator
              text={document.content}
              onValidationResults={handleTerminologyResults}
              jurisdiction={document.metadata.jurisdiction}
              practiceArea={document.metadata.practiceArea[0]}
              autoValidate={true}
            />
          )}
          {currentView === 'summary' && document && ()
            <div className="summary-view">
              <div className="summary-grid">
                <div className="summary-card">
                  <h3 className="summary-card-title">📄 Document Summary</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span className="summary-label">Document Type:</span>
                      <span className="summary-value">{document.type}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Jurisdiction:</span>
                      <span className="summary-value">{document.metadata.jurisdiction}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Practice Areas:</span>
                      <span className="summary-value">{document.metadata.practiceArea.join(', ')}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Status:</span>
                      <span className="summary-value">{document.status}</span>
                    </div>
                  </div>
                </div>
                {analysis && ()
                  <div className="summary-card">
                    <h3 className="summary-card-title">🔍 Analysis Results</h3>
                    <div className="summary-items">
                      <div className="summary-item">
                        <span className="summary-label">Clauses Identified:</span>
                        <span className="summary-value">{analysis.clauses.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Risk Level:</span>
                        <span className="summary-value">{analysis.riskAssessment.overallRisk.toUpperCase()}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Risk Score:</span>
                        <span className="summary-value">{analysis.riskAssessment.score}/100</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Confidence:</span>
                        <span className="summary-value">{analysis.confidence}%</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="summary-card">
                  <h3 className="summary-card-title">✅ Compliance Status</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span className="summary-label">Checks Performed:</span>
                      <span className="summary-value">{complianceResults.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Compliant:</span>
                      <span className="summary-value">
                        {complianceResults.filter(r => r.status === 'compliant').length}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Issues Found:</span>
                      <span className="summary-value">
                        {complianceResults.filter(r => r.status === 'non_compliant').length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <h3 className="summary-card-title">📚 Citations & Terminology</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span className="summary-label">Citations Managed:</span>
                      <span className="summary-value">{citations.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Terms Validated:</span>
                      <span className="summary-value">{terminologyResults.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Term Accuracy:</span>
                      <span className="summary-value">
                        {terminologyResults.length > 0 
                          ? Math.round((terminologyResults.filter(r => r.isValid).length / terminologyResults.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="workflow-actions">
        <div className="workflow-info">
          {workflowProgress < 100 
            ? 'Complete all sections to finish the legal document workflow'
            : 'Legal document analysis complete - ready to export results'
          }
        </div>
        <div className="workflow-buttons">
          {workflowProgress >= 100 && ()
            <button 
              className="workflow-btn primary"
              onClick={handleCompleteWorkflow}
            >
              Export Results
            </button>
          )}
          <button 
            className="workflow-btn secondary"
            onClick={() => setCurrentView('upload')}
          >
            Start New Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalToolkit;