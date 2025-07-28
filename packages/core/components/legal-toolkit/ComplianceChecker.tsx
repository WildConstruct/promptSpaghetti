/**
 * Compliance Checker - Regulatory compliance checking for legal documents
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Checks documents against various regulatory frameworks including GDPR,
 * CCPA, SOX, HIPAA, and other compliance standards
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ComplianceCheckerProps, ComplianceCheck, LegalDocument } from './types';
interface ComplianceFramework {
  id: string;,
  name: string;
  description: string;,
  jurisdiction: string;
  categories: ComplianceCategory;,
  enabled: boolean;
  interface ComplianceCategory {
  id: string;,
  name: string;
  requirements: ComplianceRequirement;
  interface ComplianceRequirement {
  id: string;,
  title: string;
  description: string;,
  severity: 'critical' | 'high' | 'medium' | 'low';
  keywords: string;,
  patterns: RegExp;
  const COMPLIANCE_FRAMEWORKS: ComplianceFramework = [
  {
  id: 'gdpr',
  name: 'GDPR (General Data Protection Regulation)',
  description: 'EU data protection and privacy regulation',
  jurisdiction: 'European Union',
  enabled: true,
  categories: [,
  {
  id: 'data_processing',
  name: 'Data Processing',
  requirements: [,
  {
  id: 'lawful_basis',
  title: 'Lawful Basis for Processing',
  description: 'Must specify lawful basis for data processing',
  severity: 'critical',
  keywords: ['consent', 'contract', 'legal obligation', 'vital interests', 'public task', 'legitimate interests'],
  patterns: [/lawful\s+basis/gi, /consent/gi, /data\s+processing/gi],
}
          {
  id: 'data_subject_rights',
  title: 'Data Subject Rights',
  description: 'Must include provisions for data subject rights',
  severity: 'high',
  keywords: ['right to access', 'right to rectification', 'right to erasure', 'data portability'],
  patterns: [/data\s+subject\s+rights/gi, /right\s+to\s+access/gi, /right\s+to\s+erasure/gi]]
  ]
}
  {
  id: 'ccpa',
  name: 'CCPA (California Consumer Privacy Act)',
  description: 'California state privacy law',
  jurisdiction: 'California, USA',
  enabled: true,
  categories: [,
  {
  id: 'consumer_rights',
  name: 'Consumer Rights',
  requirements: [,
  {
  id: 'right_to_know',
  title: 'Right to Know',
  description: 'Must inform consumers about data collection',
  severity: 'high',
  keywords: ['right to know', 'personal information', 'data collection'],
  patterns: [/right\s+to\s+know/gi, /personal\s+information/gi]]
  ]
}
  {
  id: 'hipaa',
  name: 'HIPAA (Health Insurance Portability and Accountability Act)',
  description: 'US healthcare privacy and security regulation',
  jurisdiction: 'United States',
  enabled: false,
  categories: [,
  {
  id: 'phi_protection',
  name: 'PHI Protection',
  requirements: [,
  {
  id: 'phi_safeguards',
  title: 'Protected Health Information Safeguards',
  description: 'Must include safeguards for PHI',
  severity: 'critical',
  keywords: ['protected health information', 'PHI', 'healthcare', 'medical records'],
  patterns: [/protected\s+health\s+information/gi, /\bPHI\b/gi, /medical\s+records/gi]]
  ]
  ];
  export const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({,)
  document,
  regulations = ['gdpr', 'ccpa'],
  onComplianceResults,
  autoCheck = true,
  className = ''
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [complianceResults, setComplianceResults] = useState<ComplianceCheck>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string>(regulations);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const runComplianceCheck = useCallback(async () => {
  if (!document || !document.content) return;
  setIsChecking(true);
  setCheckProgress(0);
  const results: ComplianceCheck = [];
  const frameworks = COMPLIANCE_FRAMEWORKS.filter(f => selectedFrameworks.includes(f.id));
  let totalRequirements = 0;
  frameworks.forEach(framework => {)
  framework.categories.forEach(category => {)
  totalRequirements += category.requirements.length;
});
    });
    let checkedRequirements = 0;
    for (const framework of frameworks) {
      for (const category of framework.categories) {
        for (const requirement of category.requirements) {
          const checkResult = await checkRequirement(;);
            document, 
            framework, 
            category, 
            requirement
          );
          if (checkResult) {
            results.push(checkResult);
          checkedRequirements++;
          setCheckProgress((checkedRequirements / totalRequirements) * 100);
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
    setComplianceResults(results);
    onComplianceResults(results);
    setIsChecking(false);
  }, [document, selectedFrameworks, onComplianceResults]);
  const checkRequirement = async (;);
    doc: LegalDocument,
    framework: ComplianceFramework,
    category: ComplianceCategory,
    requirement: ComplianceRequirement): Promise<ComplianceCheck | null> => {,
    const content = doc.content.toLowerCase();
    // Check for keyword matches
    const keywordMatches = requirement.keywords.filter(keyword => ;);
      content.includes(keyword.toLowerCase())
    );
    // Check for pattern matches
    const patternMatches = requirement.patterns.some(pattern => ;);
      pattern.test(doc.content)
    );
    // Determine compliance status
    let status: ComplianceCheck['status'];
    let description: string;
    let remediation: string = [];
    if (keywordMatches.length > 0 || patternMatches) {
      if (keywordMatches.length >= requirement.keywords.length * 0.7) {
        status = 'compliant';
        description = `Document appears to address ${requirement.title} requirements`;}
      } else {
        status = 'partial';
        description = `Document partially addresses ${requirement.title} but may be missing some requirements`;}
        remediation = [
          `Review ${requirement.title} requirements`}
}
          'Consider adding missing provisions',
          'Consult with legal counsel for completeness'
        ];
    } else {
      status = 'non_compliant';
      description = `Document does not appear to address ${requirement.title} requirements`;}
      remediation = [
        `Add provisions for ${requirement.title}`}
}
        `Include relevant ${framework.name} clauses`}
}
        'Review regulatory requirements with legal team'
      ];
    return {
      id: `${framework.id}_${requirement.id}`}
},
  regulation: `${framework.name} - ${requirement.title}`}
},
  requirement: requirement.description,
      status,
      severity: requirement.severity === 'critical' ? 'critical' : ,
        requirement.severity === 'high' ? 'error' :
          requirement.severity === 'medium' ? 'warning' : 'info',
      description,
      remediation: remediation.length > 0 ? remediation : undefined,
      affectedSections: [] // Would be populated with actual section analysis;
  };
  };
  useEffect(() => {
    if (autoCheck && document && document.content) {
      runComplianceCheck();
  }, [autoCheck, document, runComplianceCheck]);
  const toggleFramework = (frameworkId: string) => {
  setSelectedFrameworks(prev => )
  prev.includes(frameworkId)
  ? prev.filter(id => id !== frameworkId)
  : [...prev, frameworkId]);
};
  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev => {)
  const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      return newSet;
    });
  };
  const filteredResults = complianceResults.filter(result => {)
  if (filterSeverity !== 'all' && result.severity !== filterSeverity) {
      return false;
    if (filterStatus !== 'all' && result.status !== filterStatus) {
      return false;
    return true;
  });
  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical': return '#e53e3e';
  case 'error': return '#f56565';
  case 'warning': return '#ed8936';
  case 'info': return '#4299e1';
  default: return '#718096';
};
  const getStatusColor = (status: string) => {
  switch (status) {
  case 'compliant': return '#48bb78';
  case 'partial': return '#ed8936';
  case 'non_compliant': return '#f56565';
  case 'unknown': return '#718096';
  default: return '#718096';
};
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'compliant': return '✅';
  case 'partial': return '⚠️';
  case 'non_compliant': return '❌';
  case 'unknown': return '❓';
  default: return '❓';
};
  return;
    <div className={`compliance-checker ${className}`}>}
      <style>
        {`
          .compliance-checker {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          .checker-header {
            background: #f7fafc;,
  padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          .checker-title {
            font-size: 1.5rem;
            font-weight: 600;,
  color: #2d3748;
            margin: 0 0 1rem 0;
          .framework-selector {
            display: flex;
            flex-wrap: wrap;,
  gap: 0.75rem;
            margin-bottom: 1rem;
          .framework-toggle {
            display: flex;
            align-items: center;,
  gap: 0.5rem;
            padding: 0.5rem 1rem;,
  background: white;
            border: 1px solid #cbd5e0;
            border-radius: 6px;,
  cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
          .framework-toggle:hover {,
  background: #f7fafc;
            border-color: #a0aec0;
          .framework-toggle.selected {
            background: #ebf8ff;
            border-color: #4299e1;,
  color: #2b6cb0;
          .framework-checkbox {
            margin: 0;
          .check-controls {
            display: flex;,
  gap: 1rem;
            align-items: center;
          .check-button {
            background: #4299e1;,
  color: white;
            border: none;,
  padding: 0.5rem 1rem;
            border-radius: 6px;,
  cursor: pointer;
            font-weight: 500;,
  transition: background 0.2s;
          .check-button:hover:not(:disabled) {,
  background: #3182ce;
          .check-button:disabled {,
  background: #cbd5e0;
            cursor: not-allowed;
          .progress-container {
            flex: 1;
            margin-left: 1rem;
          .progress-bar {
            width: 100%;,
  height: 6px;
            background: #e2e8f0;
            border-radius: 3px;,
  overflow: hidden;
          .progress-fill {
            height: 100%;,
  background: #4299e1;
            border-radius: 3px;,
  transition: width 0.3s ease;
          .results-section {
            padding: 1.5rem;
          .results-filters {
            display: flex;,
  gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
          .filter-group {
            display: flex;
            align-items: center;,
  gap: 0.5rem;
          .filter-select {
            padding: 0.25rem 0.5rem;,
  border: 1px solid #cbd5e0;
            border-radius: 4px;
            font-size: 0.9rem;
          .results-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          .summary-card {
            background: #f7fafc;,
  padding: 1rem;
            border-radius: 6px;
            text-align: center;,
  border: 1px solid #e2e8f0;
          .summary-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
          .summary-label {
            font-size: 0.8rem;,
  color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          .results-list {
            display: flex;
            flex-direction: column;,
  gap: 1rem;
          .result-item {
            border: 1px solid #e2e8f0;
            border-radius: 6px;,
  overflow: hidden;
          .result-header {
            padding: 1rem;,
  background: #f7fafc;
            cursor: pointer;,
  display: flex;
            justify-content: space-between;
            align-items: center;,
  transition: background 0.2s;
          .result-header:hover {,
  background: #edf2f7;
          .result-title-section {
            display: flex;
            align-items: center;,
  gap: 1rem;
            flex: 1;
          .result-icon {
            font-size: 1.2rem;
          .result-title {
            font-weight: 600;,
  color: #2d3748;
            margin: 0 0 0.25rem 0;
          .result-regulation {
            font-size: 0.9rem;,
  color: #718096;
          .result-badges {
            display: flex;,
  gap: 0.5rem;
            align-items: center;
          .result-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;,
  color: white;
          .expand-icon {
            margin-left: 1rem;,
  color: #718096;
            transition: transform 0.2s;
          .expand-icon.expanded {
            transform: rotate(180deg);
          .result-details {
            padding: 1rem;
            border-top: 1px solid #e2e8f0;,
  background: white;
          .result-description {
            font-size: 0.9rem;,
  color: #4a5568;
            margin-bottom: 1rem;
            line-height: 1.5;
          .remediation-section {
            margin-top: 1rem;
          .remediation-title {
            font-weight: 600;,
  color: #2d3748;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          .remediation-list {
            list-style: none;,
  padding: 0;
            margin: 0;
          .remediation-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9rem;,
  color: #4a5568;
            display: flex;
            align-items: flex-start;,
  gap: 0.5rem;
          .remediation-item:last-child {
            border-bottom: none;
          .remediation-item:before {,
  content: "→";
            color: #4299e1;
            font-weight: bold;
          .no-results {
            text-align: center;,
  padding: 3rem 2rem;
            color: #718096;
          .no-results-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        `}
      </style>
      <div className="checker-header">
        <h2 className="checker-title">Regulatory Compliance Check</h2>
        <div className="framework-selector">
          {COMPLIANCE_FRAMEWORKS.map(framework => ()
            <label 
              key={framework.id} 
              className={`framework-toggle ${selectedFrameworks.includes(framework.id) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                className="framework-checkbox"
                checked={selectedFrameworks.includes(framework.id)}
                onChange={() => toggleFramework(framework.id)}
              />
              <span>{framework.name}</span>
            </label>
          ))}
        </div>
        <div className="check-controls">
          <button
            className="check-button"
            onClick={runComplianceCheck}
            disabled={isChecking || selectedFrameworks.length === 0}
          >
            {isChecking ? 'Checking...' : 'Run Compliance Check'}
          </button>
          {isChecking && ()
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${checkProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="results-section">
        {complianceResults.length > 0 && ()
          <>
            <div className="results-filters">
              <div className="filter-group">
                <label>Severity:</label>
                <select 
                  className="filter-select"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="error">High</option>
                  <option value="warning">Medium</option>
                  <option value="info">Low</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="compliant">Compliant</option>
                  <option value="partial">Partial</option>
                  <option value="non_compliant">Non-Compliant</option>
                </select>
              </div>
            </div>
            <div className="results-summary">
              <div className="summary-card">
                <div className="summary-number" style={{ color: getStatusColor('compliant') }}>
                  {complianceResults.filter(r => r.status === 'compliant').length}
                </div>
                <div className="summary-label">Compliant</div>
              </div>
              <div className="summary-card">
                <div className="summary-number" style={{ color: getStatusColor('partial') }}>
                  {complianceResults.filter(r => r.status === 'partial').length}
                </div>
                <div className="summary-label">Partial</div>
              </div>
              <div className="summary-card">
                <div className="summary-number" style={{ color: getStatusColor('non_compliant') }}>
                  {complianceResults.filter(r => r.status === 'non_compliant').length}
                </div>
                <div className="summary-label">Non-Compliant</div>
              </div>
              <div className="summary-card">
                <div className="summary-number" style={{ color: '#4299e1' }}>
                  {complianceResults.length}
                </div>
                <div className="summary-label">Total Checks</div>
              </div>
            </div>
          </>
        )}
        {filteredResults.length > 0 ? ()
          <div className="results-list">
            {filteredResults.map(result => ()
              <div key={result.id} className="result-item">
                <div 
                  className="result-header"
                  onClick={() => toggleExpanded(result.id)}
                >
                  <div className="result-title-section">
                    <div className="result-icon">
                      {getStatusIcon(result.status)}
                    </div>
                    <div>
                      <div className="result-title">{result.regulation}</div>
                      <div className="result-regulation">{result.requirement}</div>
                    </div>
                  </div>
                  <div className="result-badges">
                    <div 
                      className="result-badge"
                      style={{ backgroundColor: getStatusColor(result.status) }}
                    >
                      {result.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div 
                      className="result-badge"
                      style={{ backgroundColor: getSeverityColor(result.severity) }}
                    >
                      {result.severity.toUpperCase()}
                    </div>
                    <div className={`expand-icon ${expandedResults.has(result.id) ? 'expanded' : ''}`}>}
                      ▼
                    </div>
                  </div>
                </div>
                {expandedResults.has(result.id) && ()
                  <div className="result-details">
                    <div className="result-description">
                      {result.description}
                    </div>
                    {result.remediation && result.remediation.length > 0 && ()
                      <div className="remediation-section">
                        <div className="remediation-title">Recommended Actions:</div>
                        <ul className="remediation-list">
                          {result.remediation.map((action, index) => ()
                            <li key={index} className="remediation-item">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : complianceResults.length > 0 ? ()
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div>No results match your current filters.</div>
          </div>
        ) : !isChecking ? ()
          <div className="no-results">
            <div className="no-results-icon">📋</div>
            <div>No compliance check results yet. Click "Run Compliance Check" to begin.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ComplianceChecker;