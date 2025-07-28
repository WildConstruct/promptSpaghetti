/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Demo
 * 
 * Demonstration component showing how to integrate advanced prompting
 * collaboration features into the Wild Construct film industry demo.
 */
import React, { useState } from 'react';
import { AdvancedPromptingCollaborationPanel } from './AdvancedPromptingCollaborationPanel';
import { useAdvancedPromptingCollaboration } from '../../hooks/useAdvancedPromptingCollaboration';
import { 
  FilmIndustryUser, 
  FilmIndustryRole,
  MARSRegionTemplate,
  ZadaPromptPattern
} from '../../services/AdvancedPromptingCollaborationService';
interface AdvancedPromptingCollaborationDemoProps {
  className?: string;
}

export const AdvancedPromptingCollaborationDemo: React.FC<AdvancedPromptingCollaborationDemoProps> = ({ className }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [exportData, setExportData] = useState<unknown>(null);
  const collaboration = useAdvancedPromptingCollaboration();
  // Demo users for film industry roles
  const demoUsers: FilmIndustryUser[] = [
    {
      id: 'user_director_001',
      name: 'Sarah Chen',
      role: 'director',
      department: 'Creative',
      permissions: ['create_sessions', 'approve_patterns', 'export_vfx'],
      isOnline: true,
    },
    {
      id: 'user_vfx_supervisor_001',
      name: 'Marcus Rodriguez',
      role: 'vfx_supervisor',
      department: 'VFX',
      permissions: ['create_mars_regions', 'technical_review', 'pipeline_export'],
      isOnline: true,
    },
    {
      id: 'user_pipeline_td_001',
      name: 'Jennifer Kim',
      role: 'pipeline_td',
      department: 'Technical',
      permissions: ['system_config', 'pipeline_export', 'technical_integration'],
      isOnline: true,
    },
    {
      id: 'user_cinematographer_001',
      name: 'David Thompson',
      role: 'cinematographer',
      department: 'Camera',
      permissions: ['camera_patterns', 'visual_review', 'creative_input'],
      isOnline: true,
    }
  ];
  const getRoleDescription = (role: FilmIndustryRole): string => {
    const descriptions = {
      director: 'Creative visionary who works with natural language Zada patterns to express artistic intent',
      vfx_supervisor: 'Technical leader who translates creative vision into structured MARS framework elements',
      pipeline_td: 'Technical expert who ensures VFX pipeline integration and export compatibility',
      vfx_artist: 'Creative artist who implements VFX work using MARS-structured technical specifications',
      cinematographer: 'Visual storyteller who bridges creative vision with technical camera requirements',
      producer: 'Project manager who oversees workflow coordination and resource allocation',
      script_supervisor: 'Continuity expert who ensures narrative consistency across scenes'
    };
    return descriptions[role] || 'Film industry professional';
  };
  const getRoleColor = (role: FilmIndustryRole): string => {
    const colors = {
      director: '#8b5cf6', // Purple - Creative leadership
      vfx_supervisor: '#3b82f6', // Blue - Technical leadership
      pipeline_td: '#10b981', // Green - Technical implementation
      vfx_artist: '#f59e0b', // Orange - Creative implementation
      cinematographer: '#ef4444', // Red - Visual storytelling
      producer: '#6b7280', // Gray - Management
      script_supervisor: '#14b8a6' // Teal - Continuity
    };
    return colors[role] || '#6b7280';
  };
  const handleUserSelect = async (user: FilmIndustryUser) => {
    setSelectedUser(user);
    try {
      await collaboration.initializeCollaboration(user, {)
        enableRealTimeSync: true,
        enableMARSRegions: true,
        enableZadaPatterns: true,
        enableVFXExport: true,
        autoSaveInterval: 30,
        maxCollaborators: 10,
      });
      setShowPanel(true);
      setDemoStep(1);
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
    }
  };
  const handleMARSRegionCreate = (region: MARSRegionTemplate) => {
    console.log('MARS region created in demo:', region);
    setDemoStep(prev => Math.max(prev, 2));
  };
  const handleZadaPatternCreate = (pattern: ZadaPromptPattern) => {
    console.log('Zada pattern created in demo:', pattern);
    setDemoStep(prev => Math.max(prev, 3));
  };
  const handleVFXExport = (data: Record<string, unknown>) => {
    setExportData(data);
    setDemoStep(prev => Math.max(prev, 4));
    console.log('VFX export generated in demo:', data);
  };
  const demoSteps = [;
    'Select your film industry role to begin',
    'Initialize collaboration service and explore features',
    'Create MARS regions for technical VFX structure',
    'Develop Zada patterns for natural language creativity',
    'Generate VFX pipeline export for production handoff'
  ];
  return ()
    <div className={`advanced-prompting-collaboration-demo ${className}`} style={{}
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: 16,
      padding: 24,
      color: '#ffffff',
      minHeight: 600,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: 24,
          fontWeight: 600,
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🎬 Advanced Prompting Collaboration Demo
        </h2>
        <div style={{
          fontSize: 16,
          color: '#94a3b8',
          marginBottom: 16,
        }}>
          Wild Construct $2.3B Film Industry Ecosystem - Epic 8.7 Task 7
        </div>
        {/* Progress Indicator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: 14,
            color: '#e2e8f0',
            marginBottom: 8,
            fontWeight: 500,
          }}>
            Demo Progress: Step {demoStep + 1} of {demoSteps.length}
          </div>
          <div style={{
            fontSize: 13,
            color: '#94a3b8',
            lineHeight: 1.4,
          }}>
            {demoSteps[demoStep]}
          </div>
          {/* Progress bar */}
          <div style={{
            marginTop: 12,
            height: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              width: `${((demoStep + 1) / demoSteps.length) * 100}%`,}
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>
      {!showPanel ? ()
        /* Role Selection */
        <div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 16,
          }}>
            Choose Your Film Industry Role
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {demoUsers.map(user => ()
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = getRoleColor(user.role);
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Role indicator */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: getRoleColor(user.role),
                  color: 'white',
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: '0 12px 0 12px',
                  textTransform: 'uppercase',
                }}>
                  {user.role.replace('_', ' ')}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}CC)`,}
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {user.role === 'director' ? '🎬' :
                      user.role === 'vfx_supervisor' ? '✨' :
                        user.role === 'pipeline_td' ? '⚙️' :
                          user.role === 'cinematographer' ? '📹' : '👤'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#e2e8f0',
                      marginBottom: 2,
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#94a3b8',
                    }}>
                      {user.department} Department
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#cbd5e1',
                  lineHeight: 1.4,
                  marginBottom: 12,
                }}>
                  {getRoleDescription(user.role)}
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                }}>
                  {user.permissions.slice(0, 2).map(permission => ()
                    <span
                      key={permission}
                      style={{
                        background: `${getRoleColor(user.role)}20`,}
                        color: getRoleColor(user.role),
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                  {user.permissions.length > 2 && ()
                    <span style={{
                      fontSize: 10,
                      color: '#94a3b8',
                    }}>
                      +{user.permissions.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : ()
        /* Collaboration Panel */
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#e2e8f0',
                margin: 0,
              }}>
                Collaboration Dashboard
              </h3>
              {selectedUser && ()
                <div style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  marginTop: 4,
                }}>
                  Logged in as {selectedUser.name} ({selectedUser.role.replace('_', ' ')})
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowPanel(false);
                setSelectedUser(null);
                setDemoStep(0);
                setExportData(null);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e2e8f0',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              ← Back to Role Selection
            </button>
          </div>
          {selectedUser && collaboration.collaborationService && ()
            <AdvancedPromptingCollaborationPanel
              collaborationService={collaboration.collaborationService}
              currentUser={selectedUser}
              onMARSRegionCreate={handleMARSRegionCreate}
              onZadaPatternCreate={handleZadaPatternCreate}
              onVFXExport={handleVFXExport}
            />
          )}
          {/* Export Data Display */}
          {exportData && ()
            <div style={{
              marginTop: 20,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 8,
              padding: 16,
            }}>
              <h4 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#10b981',
                margin: '0 0 12px 0'
              }}>
                🚀 VFX Pipeline Export Generated
              </h4>
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 6,
                padding: 12,
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#e2e8f0',
                maxHeight: 200,
                overflow: 'auto',
              }}>
                <pre>{JSON.stringify(exportData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Demo Information */}
      <div style={{
        marginTop: 32,
        padding: 16,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#e2e8f0',
          margin: '0 0 8px 0'
        }}>
          💡 Demo Features
        </h4>
        <div style={{
          fontSize: 12,
          color: '#94a3b8',
          lineHeight: 1.5,
        }}>
          • <strong>MARS Framework:</strong> Structured technical regions for VFX professionals ()
            [CAM],
            [SUBJ],
            [FX],
            !FOCAL
          )<br/>
          • <strong>Zada Patterns:</strong> Natural language templates for directors and creative teams<br/>
          • <strong>Hybrid Methodology:</strong> Combines technical precision with creative accessibility<br/>
          • <strong>VFX Pipeline Export:</strong> Industry-standard formats for production handoff<br/>
          • <strong>Role-Based UI:</strong> Customized interface based on film industry role<br/>
          • <strong>Real-Time Collaboration:</strong> Multi-user sessions with live sync capabilities
        </div>
      </div>
    </div>
  );
};