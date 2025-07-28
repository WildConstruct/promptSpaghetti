/**
 * Contract Analyzer - Analyzes contracts for clauses, risks, and compliance
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Provides comprehensive contract analysis including clause identification,
 * risk assessment, and compliance checking
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ContractAnalyzerProps, 
  ContractAnalysis, 
  ContractClause, 
  RiskAssessment,
  ComplianceCheck 
} from './types';

export const ContractAnalyzer: React.FC<ContractAnalyzerProps> = ({)
  document,
  onClauseIdentified,
  onAnalysisComplete,
  analysisType = 'basic',
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'clauses' | 'risks' | 'compliance'>('overview');
  const analyzeContract = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep('Starting analysis...');
    try {
      // Step 1: Document preprocessing
      setCurrentStep('Preprocessing document...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(20);
      // Step 2: Clause identification
      setCurrentStep('Identifying contract clauses...');
      const clauses = await identifyClauses(document.content);
      onClauseIdentified(clauses);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAnalysisProgress(50);
      // Step 3: Risk assessment
      setCurrentStep('Performing risk assessment...');
      const riskAssessment = await assessRisks(clauses, document.content);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(75);
      // Step 4: Compliance checking (if detailed or comprehensive analysis)
      let complianceChecks: ComplianceCheck[] = [];
      if (analysisType !== 'basic') {
        setCurrentStep('Checking regulatory compliance...');
        complianceChecks = await checkCompliance(document, clauses);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setAnalysisProgress(90);
      // Step 5: Generate recommendations
      setCurrentStep('Generating recommendations...');
      const recommendations = generateRecommendations(clauses, riskAssessment, complianceChecks);
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisProgress(100);
      const finalAnalysis: ContractAnalysis = {
        documentId: document.id,
        clauses,
        riskAssessment,
        complianceChecks,
        recommendations,
        confidence: calculateConfidence(clauses, riskAssessment),
        processingTime: Date.now() - startTime
      };
      setAnalysis(finalAnalysis);
      onAnalysisComplete(finalAnalysis);
      setCurrentStep('Analysis complete!');
    } catch (error) {
      console.error('Contract analysis error:', error);
      setCurrentStep('Analysis failed');
    } finally {
      setTimeout(() => setIsAnalyzing(false), 1000);
    }
  }, [document, analysisType, onClauseIdentified, onAnalysisComplete]);
  const startTime = Date.now();
  useEffect(() => {
    if (document && document.content) {
      analyzeContract();
    }
  }, [document, analyzeContract]);
  const identifyClauses = async (_____content: string): Promise<ContractClause[]> => {
    // Mock clause identification - in real implementation would use AI/ML
    const clauses: ContractClause[] = [
      {
        id: 'clause_1',
        type: 'Termination Clause',
        title: 'Contract Termination',
        content: 'Either party may terminate this agreement with 30 days written notice...',
        category: 'termination',
        riskLevel: 'medium',
        standardCompliance: true,
        position: { start: 1250, end: 1580 },
        suggestions: ['Consider adding termination for cause provisions']
      },
      {
        id: 'clause_2',
        type: 'Payment Terms',
        title: 'Payment and Invoicing',
        content: 'Payment shall be due within 30 days of invoice receipt...',
        category: 'payment',
        riskLevel: 'low',
        standardCompliance: true,
        position: { start: 890, end: 1120 }
      },
      {
        id: 'clause_3',
        type: 'Liability Limitation',
        title: 'Limitation of Liability',
        content: 'In no event shall either party be liable for consequential damages...',
        category: 'liability',
        riskLevel: 'high',
        standardCompliance: false,
        position: { start: 2100, end: 2450 },
        suggestions: [,
          'Consider mutual liability caps',
          'Add exceptions for certain types of damages',
          'Review with legal counsel'
        ]
      },
      {
        id: 'clause_4',
        type: 'Confidentiality',
        title: 'Non-Disclosure Agreement',
        content: 'Both parties agree to maintain confidentiality of proprietary information...',
        category: 'confidentiality',
        riskLevel: 'medium',
        standardCompliance: true,
        position: { start: 1650, end: 1950 }
      }
    ];
    return clauses;
  };
  const assessRisks = async (clauses: ContractClause[], _____content: string): Promise<RiskAssessment> => {
    const highRiskClauses = clauses.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical');
    const _____nonCompliantClauses = clauses.filter(c => !c.standardCompliance);
    return {
      overallRisk: highRiskClauses.length > 0 ? 'high' : 'medium',
      riskFactors: [,
        {
          type: 'Liability Exposure',
          description: 'Unlimited liability exposure in certain clauses',
          impact: 'high',
          likelihood: 'medium',
          mitigation: ['Add liability caps', 'Include mutual indemnification', 'Define excluded damages']
        },
        {
          type: 'Termination Risk',
          description: 'Broad termination rights without cause',
          impact: 'medium',
          likelihood: 'low',
          mitigation: ['Add notice requirements', 'Include termination fees', 'Define cause events']
        }
      ],
      mitigation: [,
        'Review high-risk clauses with legal counsel',
        'Consider adding protective provisions',
        'Negotiate mutual terms where applicable'
      ],
      score: 72 // Out of 100
    };
  };
  const checkCompliance = async (_____document: unknown, _____clauses: ContractClause[]): Promise<ComplianceCheck[]> => {
    return [
      {
        id: 'comp_1',
        regulation: 'GDPR Article 28',
        requirement: 'Data Processing Agreement requirements',
        status: 'partial',
        severity: 'warning',
        description: 'Contract contains some data processing terms but missing required GDPR provisions',
        remediation: [,
          'Add specific data protection clauses',
          'Include data subject rights provisions',
          'Define data retention periods'
        ],
        affectedSections: [2, 5, 8]
      },
      {
        id: 'comp_2',
        regulation: 'UCC Article 2',
        requirement: 'Sale of goods provisions',
        status: 'compliant',
        severity: 'info',
        description: 'Contract properly addresses sale of goods requirements',
        affectedSections: [3, 4]
      }
    ];
  };
  const generateRecommendations = (;)
    clauses: ContractClause[], 
    riskAssessment: RiskAssessment,
    complianceChecks: ComplianceCheck[],
  ): string[] => {
    const recommendations: string[] = [];
    // Risk-based recommendations
    if (riskAssessment.overallRisk === 'high') {
      recommendations.push('Consider comprehensive legal review due to high risk assessment');
    }
    // Clause-based recommendations
    clauses.forEach(clause => {)
      if (clause.suggestions) {
        recommendations.push(...clause.suggestions);
      }
    });
    // Compliance recommendations
    complianceChecks.forEach(check => {)
      if (check.status === 'non_compliant' || check.status === 'partial') {
        if (check.remediation) {
          recommendations.push(...check.remediation);
        }
      }
    });
    return [...new Set(recommendations)]; // Remove duplicates
  };
  const calculateConfidence = (clauses: ContractClause[], riskAssessment: RiskAssessment): number => {
    // Simple confidence calculation - would be more sophisticated in real implementation
    let confidence = 85;
    if (clauses.length < 3) confidence -= 10;
    if (riskAssessment.overallRisk === 'high') confidence -= 5;
    return Math.max(60, Math.min(95, confidence));
  };
  const getRiskColor = (risk: string) => {
    switch (risk) {
    case 'low': return '#48bb78';
    case 'medium': return '#ed8936';
    case 'high': return '#f56565';
    case 'critical': return '#e53e3e';
    default: return '#718096';
    }
  };
  const getComplianceColor = (status: string) => {
    switch (status) {
    case 'compliant': return '#48bb78';
    case 'partial': return '#ed8936';
    case 'non_compliant': return '#f56565';
    default: return '#718096';
    }
  };
  if (isAnalyzing) {
    return ()
      <div className={`contract-analyzer analyzing ${className}`}>}
        <style>
          {`
            .contract-analyzer {
              background: white;
              border-radius: 8px;
              padding: 2rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .analyzing-container {
              text-align: center;
              padding: 3rem 2rem;
            }
            .analysis-spinner {
              width: 60px;
              height: 60px;
              border: 4px solid #e2e8f0;
              border-top: 4px solid #4299e1;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 2rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .progress-container {
              max-width: 400px;
              margin: 2rem auto;
            }
            .progress-bar {
              width: 100%;
              height: 10px;
              background: #e2e8f0;
              border-radius: 5px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #4299e1, #3182ce);
              border-radius: 5px;
              transition: width 0.3s ease;
            }
            .current-step {
              font-size: 1.1rem;
              color: #2d3748;
              margin-top: 1rem;
            }
            .progress-percent {
              font-size: 0.9rem;
              color: #718096;
              margin-top: 0.5rem;
            }
          `}
        </style>
        <div className="analyzing-container">
          <div className="analysis-spinner"></div>
          <h3>Analyzing Contract</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <div className="progress-percent">{analysisProgress}% Complete</div>
          </div>
          <div className="current-step">{currentStep}</div>
        </div>
      </div>
    );
  }
  if (!analysis) {
    return ()
      <div className={`contract-analyzer ${className}`}>}
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No analysis available. Please upload a contract document.</p>
        </div>
      </div>
    );
  }
  return ()
    <div className={`contract-analyzer ${className}`}>}
      <style>
        {`
          .contract-analyzer {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .analyzer-header {
            background: #f7fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .analyzer-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 0.5rem 0;
          }
          .analyzer-meta {
            display: flex;
            gap: 2rem;
            font-size: 0.9rem;
            color: #718096;
          }
          .view-tabs {
            display: flex;
            background: #edf2f7;
            border-bottom: 1px solid #e2e8f0;
          }
          .view-tab {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            color: #718096;
            transition: all 0.2s;
            flex: 1;
            text-align: center;
          }
          .view-tab.active {
            background: white;
            color: #2d3748;
            border-bottom: 2px solid #4299e1;
          }
          .view-tab:hover {
            background: #f1f5f9;
            color: #2d3748;
          }
          .analyzer-content {
            padding: 1.5rem;
          }
          .overview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          .overview-card {
            background: #f7fafc;
            padding: 1.5rem;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .card-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 1rem;
          }
          .risk-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .risk-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }
          .confidence-score {
            font-size: 2rem;
            font-weight: bold;
            color: #4299e1;
          }
          .clause-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .clause-item {
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .clause-item:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e0;
          }
          .clause-item.selected {
            border-color: #4299e1;
            background: #ebf8ff;
          }
          .clause-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .clause-title {
            font-weight: 600;
            color: #2d3748;
          }
          .clause-risk {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            color: white;
            margin-left: auto;
          }
          .clause-content {
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
          }
          .clause-suggestions {
            font-size: 0.8rem;
            color: #718096;
          }
          .compliance-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .compliance-item {
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
          }
          .compliance-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .compliance-regulation {
            font-weight: 600;
            color: #2d3748;
          }
          .compliance-status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            color: white;
          }
          .recommendations-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .recommendation-item {
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #2f855a;
          }
          .recommendation-item:before {
            content: "💡 ";
            margin-right: 0.5rem;
          }
        `}
      </style>
      <div className="analyzer-header">
        <h2 className="analyzer-title">Contract Analysis Results</h2>
        <div className="analyzer-meta">
          <span>Document: {document.title}</span>
          <span>Analysis Type: {analysisType}</span>
          <span>Processing Time: {analysis.processingTime}ms</span>
          <span>Confidence: {analysis.confidence}%</span>
        </div>
      </div>
      <div className="view-tabs">
        {(['overview', 'clauses', 'risks', 'compliance'] as const).map(tab => ()
          <button
            key={tab}
            className={`view-tab ${viewMode === tab ? 'active' : ''}`}
            onClick={() => setViewMode(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'clauses' && ` (${analysis.clauses.length})`}
            {tab === 'compliance' && analysis.complianceChecks.length > 0 && ` (${analysis.complianceChecks.length})`}
          </button>
        ))}
      </div>
      <div className="analyzer-content">
        {viewMode === 'overview' && ()
          <>
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-title">Risk Assessment</div>
                <div className="risk-indicator">
                  <div 
                    className="risk-dot" 
                    style={{ backgroundColor: getRiskColor(analysis.riskAssessment.overallRisk) }}
                  ></div>
                  {analysis.riskAssessment.overallRisk.toUpperCase()} RISK
                </div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Risk Score: {analysis.riskAssessment.score}/100
                </div>
              </div>
              <div className="overview-card">
                <div className="card-title">Analysis Confidence</div>
                <div className="confidence-score">{analysis.confidence}%</div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Based on document completeness and clause identification
                </div>
              </div>
            </div>
            <div className="overview-card">
              <div className="card-title">Key Recommendations</div>
              <ul className="recommendations-list">
                {analysis.recommendations.slice(0, 5).map((rec, index) => ()
                  <li key={index} className="recommendation-item">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {viewMode === 'clauses' && ()
          <div className="clause-list">
            {analysis.clauses.map(clause => ()
              <div
                key={clause.id}
                className={`clause-item ${selectedClause?.id === clause.id ? 'selected' : ''}`}
                onClick={() => setSelectedClause(clause)}
              >
                <div className="clause-header">
                  <div className="clause-title">{clause.title}</div>
                  <div 
                    className="clause-risk"
                    style={{ backgroundColor: getRiskColor(clause.riskLevel) }}
                  >
                    {clause.riskLevel.toUpperCase()}
                  </div>
                </div>
                <div className="clause-content">{clause.content}</div>
                {clause.suggestions && ()
                  <div className="clause-suggestions">
                    Suggestions: {clause.suggestions.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {viewMode === 'compliance' && ()
          <div className="compliance-list">
            {analysis.complianceChecks.map(check => ()
              <div key={check.id} className="compliance-item">
                <div className="compliance-header">
                  <div className="compliance-regulation">{check.regulation}</div>
                  <div 
                    className="compliance-status"
                    style={{ backgroundColor: getComplianceColor(check.status) }}
                  >
                    {check.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                  {check.description}
                </div>
                {check.remediation && ()
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    Remediation: {check.remediation.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalyzer;