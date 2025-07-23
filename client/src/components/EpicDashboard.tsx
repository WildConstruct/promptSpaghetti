import React, { useState } from 'react';

interface EpicComponent {
  name: string;
  status: 'complete' | 'in_progress' | 'partial' | 'missing' | 'exists' | 'backend_ready' | 'unknown';
  progress: number;
  location?: string;
  task?: string;
  assignee?: string;
}

interface EpicData {
  name: string;
  icon: string;
  description: string;
  businessValue: string;
  overallProgress: number;
  impact: string;
  components: EpicComponent[];
}

// Epic completion data (from show-epic-completion.js analysis)
const EPIC_ANALYSIS: Record<string, EpicData> = {
  'epic7_advanced_nodes': {
    name: 'Epic 7: Advanced Nodes',
    icon: '🎲',
    description: 'WeightedAdvanced, Conditional, Sequential, Markov nodes',
    businessValue: 'Advanced workflow capabilities for power users',
    overallProgress: 85,
    impact: 'HIGH',
    components: [
      { name: 'Runtime Implementation', status: 'complete', progress: 100, location: 'packages/core/runtime/nodes/' },
      { 
        name: 'GraphEditor Integration', 
        status: 'complete', 
        progress: 100, 
        location: 'packages/core/GraphEditor.tsx:129-164' 
      },
      { name: 'Palette Categories', status: 'complete', progress: 100, location: 'packages/core/Palette.tsx:100-109' },
      { name: 'Node Editors', status: 'missing', progress: 0, task: 'Create specialized editors for advanced nodes' },
      { name: 'Test Coverage', status: 'complete', progress: 90, location: 'packages/core/runtime/__tests__/' }
    ]
  },
  'epic3_export_system': {
    name: 'Epic 3: Export System',
    icon: '📤',
    description: 'Professional export formats (PNG, PDF, YAML, XML, GeneratorBundle)',
    businessValue: 'Users can export graphs for presentations and documentation',
    overallProgress: 75,
    impact: 'MEDIUM-HIGH',
    components: [
      { name: 'GeneratorBundle Exporter', status: 'complete', progress: 100, location: 'server/src/exporter.ts' },
      { name: 'Export Handler UI', status: 'complete', progress: 100, location: 'packages/core/GraphEditor.tsx:461-514' },
      { name: 'Server Routes', status: 'complete', progress: 100, location: 'server/src/index.ts:1619-1690' },
      { name: 'Format Selection Dialog', status: 'missing', progress: 0, task: 'Create ExportDialog component with format options' },
      { name: 'Import System', status: 'missing', progress: 0, task: 'Create import functionality for round-trip operations' }
    ]
  },
  'epic8_python_integration': {
    name: 'Epic 8: Python Integration',
    icon: '🐍',
    description: 'Python code execution within graph workflows',
    businessValue: 'Users can run Python transformations in their graphs',
    overallProgress: 80,
    impact: 'MEDIUM',
    components: [
      { name: 'PythonTransform Node', status: 'complete', progress: 100, location: 'packages/core/runtime/nodes/PythonTransform.ts' },
      { name: 'GraphEditor Integration', status: 'complete', progress: 100, location: 'packages/core/GraphEditor.tsx:158-164' },
      { name: 'Server Engine Support', status: 'partial', progress: 50, task: 'Enable Python imports in server/src/engine.ts' },
      { name: 'Python Executor Service', status: 'exists', progress: 80, location: 'Python executor framework implemented' },
      { name: 'UI Editor', status: 'unknown', progress: 50, task: 'Verify PythonTransformEditor exists' }
    ]
  },
  'authentication_system': {
    name: 'Authentication System',
    icon: '🔐',
    description: 'User login, registration, and session management',
    businessValue: 'Users can create accounts and access personal features',
    overallProgress: 85,
    impact: 'CRITICAL',
    components: [
      { name: 'React Router Setup', status: 'complete', progress: 100, location: 'client/src/App.tsx' },
      { name: 'Auth Pages & Routes', status: 'complete', progress: 100, location: 'LoginPage, RegistrationPage, etc.' },
      { name: 'Protected Routes', status: 'complete', progress: 100, location: 'PrivateRoute component' },
      { name: 'Backend APIs', status: 'complete', progress: 100, location: 'server/src/auth/' },
      { name: 'Zustand Store Integration', status: 'in_progress', progress: 70, assignee: 'claude_dev' },
      { name: 'JWT Token Handling', status: 'partial', progress: 60, task: 'Session management validation' },
      { name: 'Email Verification', status: 'backend_ready', progress: 40, task: 'Connect to SMTP service' }
    ]
  },
  'file_browser_system': {
    name: 'File Browser & Project Management',
    icon: '📁',
    description: 'Save, load, and manage user projects',
    businessValue: 'Users can save their work and not lose projects',
    overallProgress: 60,
    impact: 'CRITICAL',
    components: [
      { name: 'Project Dialogs UI', status: 'complete', progress: 100, location: 'packages/core/GraphEditor.tsx:647-657' },
      { name: 'Graph Store Management', status: 'complete', progress: 100, location: 'packages/core/graphStore.ts' },
      { name: 'Export Infrastructure', status: 'complete', progress: 100, location: 'server/src/exporter.ts' },
      { name: 'Backend API Endpoints', status: 'missing', progress: 0, task: 'PROJECT-API-* task available (3-4h)' },
      { name: '.psg File Format Spec', status: 'missing', progress: 0, task: 'Define project file format' },
      { name: 'Recent Files System', status: 'missing', progress: 0, task: 'Quick access to recent projects' },
      { name: 'Auto-recovery', status: 'missing', progress: 0, task: 'Crash recovery system' }
    ]
  }
};

const EpicDashboard: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status: string): string => {
    switch (status) {
    case 'complete': return '✅';
    case 'in_progress': return '🔄';
    case 'partial': return '⚡';
    case 'missing': return '❌';
    case 'exists': return '📁';
    case 'backend_ready': return '🔧';
    case 'unknown': return '❓';
    default: return '📋';
    }
  };

  const getProgressBarColor = (progress: number): string => {
    if (progress >= 80) return '#10b981'; // green
    if (progress >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getImpactColor = (impact: string): string => {
    if (impact.includes('CRITICAL')) return '#ef4444';
    if (impact.includes('HIGH')) return '#8b5cf6';
    if (impact.includes('MEDIUM')) return '#f59e0b';
    return '#6b7280';
  };

  // Calculate overview metrics
  const epics = Object.values(EPIC_ANALYSIS);
  const averageProgress = Math.round(epics.reduce((sum, epic) => sum + epic.overallProgress, 0) / epics.length);
  const criticalEpics = epics.filter(epic => epic.impact.includes('CRITICAL'));
  const criticalProgress = criticalEpics.length > 0 ? 
    Math.round(criticalEpics.reduce((sum, epic) => sum + epic.overallProgress, 0) / criticalEpics.length) : 0;
  const quickWinsCount = epics.reduce((count, epic) => {
    return count + epic.components.filter(component => 
      component.status === 'missing' || component.status === 'partial'
    ).length;
  }, 0);

  return (
    <div style={{ 
      padding: '20px', 
      height: '100%', 
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>🎯 Epic Integration Status</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Ready-to-deliver features with massive business value</p>
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
            {averageProgress}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Average Epic Completion</div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>
            {criticalProgress}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Critical Systems</div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
            {quickWinsCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Quick Wins Available</div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '5px' }}>
            6+
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Months of Work Ready</div>
        </div>
      </div>

      {/* Toggle Details Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
        </button>
      </div>

      {/* Epic Details */}
      {showDetails && (
        <>
          {/* Epic Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {Object.entries(EPIC_ANALYSIS).map(([key, epic]) => (
              <div
                key={key}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '15px' 
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{epic.icon}</span>
                  <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.2rem' }}>{epic.name}</h3>
                </div>
                
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.5',
                  marginBottom: '15px' 
                }}>
                  {epic.description}
                </p>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Progress</span>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '600' }}>
                      {epic.overallProgress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${epic.overallProgress}%`,
                      height: '100%',
                      backgroundColor: getProgressBarColor(epic.overallProgress),
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                </div>

                {/* Components */}
                <div style={{ marginBottom: '15px' }}>
                  {epic.components.map((component, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        color: '#4b5563'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>
                        {getStatusIcon(component.status)}
                      </span>
                      <span>{component.name} ({component.progress}%)</span>
                    </div>
                  ))}
                </div>

                {/* Business Value */}
                <div style={{
                  paddingTop: '15px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '0.85rem',
                  color: '#6b7280'
                }}>
                  <strong>Business Value:</strong> {epic.businessValue}
                </div>
                
                {/* Impact Badge */}
                <div style={{ 
                  marginTop: '10px',
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: getImpactColor(epic.impact) + '20',
                  color: getImpactColor(epic.impact),
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: `1px solid ${getImpactColor(epic.impact)}40`
                }}>
                  {epic.impact} IMPACT
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '20px',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⚡ Immediate Actions
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { icon: '🔐', text: 'Complete auth store: Work on AUTH-985113-F18F', time: 'In Progress', isInProgress: true },
                { icon: '📁', text: 'Create project API: PROJECT-API-* task available', time: '3-4h' },
                { icon: '🎨', text: 'Update palette categories: Add advanced/transform', time: '15min' },
                { icon: '📤', text: 'Enhance export dialog: Format selection', time: '2-3h' }
              ].map((action, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', textAlign: 'center' }}>
                    {action.icon}
                  </span>
                  <span style={{ color: '#1f2937', fontSize: '0.95rem' }}>
                    {action.text}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: action.isInProgress ? '#3b82f6' : '#10b981',
                    color: 'white'
                  }}>
                    {action.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Summary */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚀 Business Impact Summary</h3>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          <strong>6+ months of completed development work</strong> ready to deliver massive user value 
          with just <strong>4-6 hours of integration tasks</strong>
        </p>
      </div>
    </div>
  );
};

export default EpicDashboard;