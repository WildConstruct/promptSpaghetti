import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const LegalToolkit = ({ className = '', initialDocument, onWorkflowComplete }) => {
    const [currentView, setCurrentView] = useState(initialDocument ? 'analyze' : 'upload');
    const [document, setDocument] = useState(initialDocument || null);
    const [analysis, setAnalysis] = useState(null);
    const [complianceResults, setComplianceResults] = useState([]);
    const [citations, setCitations] = useState([]);
    const [terminologyResults, setTerminologyResults] = useState([]);
    const [workflowProgress, setWorkflowProgress] = useState(0);
    const calculateProgress = useCallback(() => {
        let completed = 0;
        const total = 5; // upload, analyze, compliance, citations, terminology
        if (document)
            completed++;
        if (analysis)
            completed++;
        if (complianceResults.length > 0)
            completed++;
        if (citations.length > 0)
            completed++;
        if (terminologyResults.length > 0)
            completed++;
        const progress = (completed / total) * 100;
        setWorkflowProgress(progress);
        return progress;
    }, [document, analysis, complianceResults, citations, terminologyResults]);
    React.useEffect(() => {
        calculateProgress();
    }, [calculateProgress]);
    const handleDocumentParsed = (parsedDocument) => {
        setDocument(parsedDocument);
        setCurrentView('analyze');
    };
    const handleAnalysisComplete = (contractAnalysis) => {
        setAnalysis(contractAnalysis);
    };
    const handleComplianceResults = (results) => {
        setComplianceResults(results);
    };
    const handleCitationAdd = (citation) => {
        setCitations(prev => [...prev, citation]);
    };
    const handleCitationEdit = (id, updatedCitation) => {
        setCitations(prev => prev.map(c => c.id === id ? updatedCitation : c));
    };
    const handleCitationDelete = (id) => {
        setCitations(prev => prev.filter(c => c.id !== id));
    };
    const handleTerminologyResults = (results) => {
        setTerminologyResults(results);
    };
    const handleCompleteWorkflow = () => {
        if (document && onWorkflowComplete) {
            const results = {
                document,
                analysis: analysis || undefined,
                complianceResults: complianceResults.length > 0 ? complianceResults : undefined,
                citations,
                terminologyResults: terminologyResults.length > 0 ? terminologyResults : undefined
            };
            onWorkflowComplete(results);
        }
    };
    const getViewIcon = (view) => {
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
    const getViewTitle = (view) => {
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
    const isViewEnabled = (view) => {
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
    const getViewCompletionStatus = (view) => {
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
    return (_jsxs("div", { className: `legal-toolkit ${className}`, children: [_jsx("style", { children: `
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
        ` }), _jsxs("div", { className: "toolkit-header", children: [_jsx("h1", { className: "toolkit-title", children: "Legal & Regulatory Toolkit" }), _jsx("p", { className: "toolkit-subtitle", children: "Comprehensive document analysis, compliance checking, and legal workflow management" })] }), _jsxs("div", { className: "progress-section", children: [_jsxs("div", { className: "progress-header", children: [_jsx("div", { className: "progress-label", children: "Workflow Progress" }), _jsxs("div", { className: "progress-percentage", children: [Math.round(workflowProgress), "%"] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${workflowProgress}%` } }) })] }), _jsx("nav", { className: "toolkit-navigation", children: ['upload', 'analyze', 'compliance', 'citations', 'terminology', 'summary'].map(view => (_jsxs("button", { className: `nav-item ${currentView === view ? 'active' : ''} ${!isViewEnabled(view) ? 'disabled' : ''}`, onClick: () => isViewEnabled(view) && setCurrentView(view), disabled: !isViewEnabled(view), children: [_jsx("span", { className: "nav-icon", children: getViewIcon(view) }), _jsx("span", { children: getViewTitle(view) }), _jsx("div", { className: `nav-status ${getViewCompletionStatus(view) ? '' : 'incomplete'}` })] }, view))) }), _jsxs("div", { className: "toolkit-content", children: [_jsxs("div", { className: "view-header", children: [_jsxs("h2", { className: "view-title", children: [_jsx("span", { children: getViewIcon(currentView) }), getViewTitle(currentView)] }), _jsxs("p", { className: "view-description", children: [currentView === 'upload' && 'Upload and parse your legal document to begin analysis', currentView === 'analyze' && 'Analyze contract clauses, risks, and structure', currentView === 'compliance' && 'Check document compliance against regulatory frameworks', currentView === 'citations' && 'Manage legal citations and references', currentView === 'terminology' && 'Validate legal terminology and language usage', currentView === 'summary' && 'Review complete analysis and export results'] })] }), _jsxs("div", { className: "view-content", children: [currentView === 'upload' && (_jsx(LegalDocumentParser, { onDocumentParsed: handleDocumentParsed, supportedTypes: ['contract', 'policy', 'regulation', 'agreement', 'statute'] })), currentView === 'analyze' && document && (_jsx(ContractAnalyzer, { document: document, onClauseIdentified: (clauses) => { }, onAnalysisComplete: handleAnalysisComplete, analysisType: "comprehensive" })), currentView === 'compliance' && document && (_jsx(ComplianceChecker, { document: document, regulations: ['gdpr', 'ccpa'], onComplianceResults: handleComplianceResults, autoCheck: true })), currentView === 'citations' && (_jsx(CitationManager, { citations: citations, onCitationAdd: handleCitationAdd, onCitationEdit: handleCitationEdit, onCitationDelete: handleCitationDelete, citationStyle: "bluebook" })), currentView === 'terminology' && document && (_jsx(TerminologyValidator, { text: document.content, onValidationResults: handleTerminologyResults, jurisdiction: document.metadata.jurisdiction, practiceArea: document.metadata.practiceArea[0], autoValidate: true })), currentView === 'summary' && document && (_jsx("div", { className: "summary-view", children: _jsxs("div", { className: "summary-grid", children: [_jsxs("div", { className: "summary-card", children: [_jsx("h3", { className: "summary-card-title", children: "\uD83D\uDCC4 Document Summary" }), _jsxs("div", { className: "summary-items", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Document Type:" }), _jsx("span", { className: "summary-value", children: document.type })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Jurisdiction:" }), _jsx("span", { className: "summary-value", children: document.metadata.jurisdiction })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Practice Areas:" }), _jsx("span", { className: "summary-value", children: document.metadata.practiceArea.join(', ') })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Status:" }), _jsx("span", { className: "summary-value", children: document.status })] })] })] }), analysis && (_jsxs("div", { className: "summary-card", children: [_jsx("h3", { className: "summary-card-title", children: "\uD83D\uDD0D Analysis Results" }), _jsxs("div", { className: "summary-items", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Clauses Identified:" }), _jsx("span", { className: "summary-value", children: analysis.clauses.length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Risk Level:" }), _jsx("span", { className: "summary-value", children: analysis.riskAssessment.overallRisk.toUpperCase() })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Risk Score:" }), _jsxs("span", { className: "summary-value", children: [analysis.riskAssessment.score, "/100"] })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Confidence:" }), _jsxs("span", { className: "summary-value", children: [analysis.confidence, "%"] })] })] })] })), _jsxs("div", { className: "summary-card", children: [_jsx("h3", { className: "summary-card-title", children: "\u2705 Compliance Status" }), _jsxs("div", { className: "summary-items", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Checks Performed:" }), _jsx("span", { className: "summary-value", children: complianceResults.length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Compliant:" }), _jsx("span", { className: "summary-value", children: complianceResults.filter(r => r.status === 'compliant').length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Issues Found:" }), _jsx("span", { className: "summary-value", children: complianceResults.filter(r => r.status === 'non_compliant').length })] })] })] }), _jsxs("div", { className: "summary-card", children: [_jsx("h3", { className: "summary-card-title", children: "\uD83D\uDCDA Citations & Terminology" }), _jsxs("div", { className: "summary-items", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Citations Managed:" }), _jsx("span", { className: "summary-value", children: citations.length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Terms Validated:" }), _jsx("span", { className: "summary-value", children: terminologyResults.length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Term Accuracy:" }), _jsxs("span", { className: "summary-value", children: [terminologyResults.length > 0
                                                                            ? Math.round((terminologyResults.filter(r => r.isValid).length / terminologyResults.length) * 100)
                                                                            : 0, "%"] })] })] })] })] }) }))] })] }), _jsxs("div", { className: "workflow-actions", children: [_jsx("div", { className: "workflow-info", children: workflowProgress < 100
                            ? 'Complete all sections to finish the legal document workflow'
                            : 'Legal document analysis complete - ready to export results' }), _jsxs("div", { className: "workflow-buttons", children: [workflowProgress >= 100 && (_jsx("button", { className: "workflow-btn primary", onClick: handleCompleteWorkflow, children: "Export Results" })), _jsx("button", { className: "workflow-btn secondary", onClick: () => setCurrentView('upload'), children: "Start New Document" })] })] })] }));
};
export default LegalToolkit;
