/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Panel
 * 
 * Professional film industry collaboration interface for advanced prompting
 * methodologies, combining MARS framework, Zada patterns, and VFX integration.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  AdvancedPromptingCollaborationService,
  PromptingMethodologySession,
  FilmIndustryUser,
  MARSRegionTemplate,
  ZadaPromptPattern,
  FilmIndustryRole,
  PromptingMethodology,
  FilmIndustryWorkflowTemplate
} from '../../services/AdvancedPromptingCollaborationService';

interface AdvancedPromptingCollaborationPanelProps {
  collaborationService: AdvancedPromptingCollaborationService;
  currentUser: FilmIndustryUser;
  onMARSRegionCreate?: (region: MARSRegionTemplate) => void;
  onZadaPatternCreate?: (pattern: ZadaPromptPattern) => void;
  onVFXExport?: (exportData: any) => void;
  className?: string;
}

export const AdvancedPromptingCollaborationPanel: React.FC<AdvancedPromptingCollaborationPanelProps> = ({ 
  currentUser,
  onMARSRegionCreate, 
  onZadaPatternCreate,
  onVFXExport, 
  className 
}) => {
  const [currentSession, setCurrentSession] = useState<PromptingMethodologySession | null>(null);
  const [sessions, setSessions] = useState<PromptingMethodologySession[]>([]);
  const [marsTemplates, setMarsTemplates] = useState<MARSRegionTemplate[]>([]);
  const [zadaPatterns, setZadaPatterns] = useState<ZadaPromptPattern[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<FilmIndustryWorkflowTemplate[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [selectedMethodology, setSelectedMethodology] = useState<PromptingMethodology>('hybrid');

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      setSessions(collaborationService.getActiveSessions());
      setMarsTemplates(collaborationService.getMARSRegionTemplates());
      setZadaPatterns(collaborationService.getZadaPatterns());
      setWorkflowTemplates(collaborationService.getWorkflowTemplates(currentUser.role));
    };

    loadData();

    // Set up event listeners
    const handleSessionCreated = (session: PromptingMethodologySession) => {
      setSessions(prev => [...prev, session]);
    };

    const handleMARSRegionCreated = ({ region }: { region: MARSRegionTemplate }) => {
      setMarsTemplates(prev => [...prev, region]);
      onMARSRegionCreate?.(region);
    };

    const handleZadaPatternCreated = ({ pattern }: { pattern: ZadaPromptPattern }) => {
      setZadaPatterns(prev => [...prev, pattern]);
      onZadaPatternCreate?.(pattern);
    };

    collaborationService.on('session_created', handleSessionCreated);
    collaborationService.on('mars_region_created', handleMARSRegionCreated);
    collaborationService.on('zada_pattern_created', handleZadaPatternCreated);

    return () => {
      collaborationService.off('session_created', handleSessionCreated);
      collaborationService.off('mars_region_created', handleMARSRegionCreated);
      collaborationService.off('zada_pattern_created', handleZadaPatternCreated);
    };
  }, [collaborationService, currentUser.role, onMARSRegionCreate, onZadaPatternCreate]);

  // Session management
  const handleCreateSession = useCallback(async () => {
    if (!newSessionTitle.trim()) return;

    try {
      const session = await collaborationService.createCollaborationSession(
        newSessionTitle,
        selectedMethodology,
        currentUser.id
      );
      setCurrentSession(session);
      setIsCreatingSession(false);
      setNewSessionTitle('');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, [newSessionTitle, selectedMethodology, currentUser.id, collaborationService]);

  const handleJoinSession = useCallback(async (sessionId: string) => {
    try {
      const success = await collaborationService.joinCollaborationSession(sessionId, currentUser.id);
      if (success) {
        const session = collaborationService.getSessionById(sessionId);
        setCurrentSession(session || null);
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  }, [currentUser.id, collaborationService]);

  // VFX Export
  const handleVFXExport = useCallback(async () => {
    if (!currentSession) return;

    try {
      const exportData = await collaborationService.generateVFXExport(
        currentSession.sessionId,
        currentUser.id
      );
      onVFXExport?.(exportData);
    } catch (error) {
      console.error('Failed to generate VFX export:', error);
    }
  }, [currentSession, currentUser.id, collaborationService, onVFXExport]);

  // Role-based UI customization
  const getRoleIcon = (role: FilmIndustryRole): string => {
    const icons = {
      director: '🎬',
      vfx_supervisor: '✨',
      pipeline_td: '⚙️',
      vfx_artist: '🎨',
      cinematographer: '📹',
      producer: '💼',
      script_supervisor: '📝'
    };
    return icons[role] || '👤';
  };

  const getMethodologyColor = (methodology: PromptingMethodology): string => {
    const colors = {
      zada: '#10b981', // Green - Natural language
      mars: '#3b82f6', // Blue - Technical
      hybrid: '#8b5cf6', // Purple - Combined
      custom: '#f59e0b' // Orange - Custom
    };
    return colors[methodology];
  };

      return compatibility[role]?.includes(methodology) || false;
  };

  const SessionsTab = () => (
    <div style={{ padding: 20 }}>
      {/* Session Creation */}
      <div style={{ 
        marginBottom: 24,
        padding: 16,
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 8,
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }}>
          {getRoleIcon(currentUser.role)} Create New Collaboration Session
        </h4>
        
        {!isCreatingSession ? (
          <button
            onClick={() => setIsCreatingSession(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            + New Collaboration Session
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Session title..."
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
            />
            
            <select
              value={selectedMethodology}
              onChange={(e) => setSelectedMethodology(e.target.value as PromptingMethodology)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
            >
              <option value="hybrid">🔄 Hybrid (MARS + Zada)</option>
              <option value="zada">💬 Zada Natural Language</option>
              <option value="mars">🏷️ MARS Framework</option>
              <option value="custom">⚙️ Custom Methodology</option>
            </select>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionTitle.trim()}
                style={{
                  background: newSessionTitle.trim() 
                    ? 'linear-gradient(135deg, #10b981, #047857)'
                    : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: newSessionTitle.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Create Session
              </button>
              <button
                onClick={() => {
                  setIsCreatingSession(false);
                  setNewSessionTitle('');
                }}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  color: '#6b7280',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
          Active Collaboration Sessions
        </h4>
        
        {sessions.length === 0 ? (
          <div style={{
            padding: 24,
            textAlign: 'center',
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px dashed #d1d5db'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤝</div>
            <div>No active collaboration sessions</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Create a new session to start collaborating with your team
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map(session => (
              <div
                key={session.sessionId}
                style={{
                  background: currentSession?.sessionId === session.sessionId 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'white',
                  border: `1px solid ${currentSession?.sessionId === session.sessionId 
                    ? '#3b82f6' 
                    : '#e5e7eb'}`,
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleJoinSession(session.sessionId)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: '#1e293b',
                      marginBottom: 4
                    }}>
                      {session.title}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ 
                        color: getMethodologyColor(session.methodology),
                        fontWeight: 500
                      }}>
                        {session.methodology.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{session.collaborativeEdits.length} edit{session.collaborativeEdits.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {session.participants.slice(0, 3).map(participant => (
                      <div
                        key={participant.id}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 500,
                          title: `${participant.name} (${participant.role})`
                        }}
                      >
                        {getRoleIcon(participant.role)}
                      </div>
                    ))}
                    {session.participants.length > 3 && (
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#6b7280'
                      }}>
                        +{session.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const MARSTab = () => (
    <div style={{ padding: 20 }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
        🏷️ MARS Region Templates
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16
      }}>
        {marsTemplates.map(template => (
          <div
            key={template.id}
            style={{
              background: 'white',
              border: `2px solid ${template.color}20`,
              borderRadius: 8,
              padding: 16,
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: -1,
              right: -1,
              background: template.color,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '0 6px 0 6px',
              fontSize: 10,
              fontWeight: 600
            }}>
              {template.marsParameters.category}
            </div>
            
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              {template.title}
            </div>
            
            <div style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 12,
              lineHeight: 1.4
            }}>
              {template.description}
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginBottom: 12
            }}>
              {template.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: `${template.color}15`,
                    color: template.color,
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 500
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {template.vfxCompatible && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: '#10b981',
                fontWeight: 500
              }}>
                ✅ VFX Pipeline Compatible
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ZadaTab = () => (
    <div style={{ padding: 20 }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
        💬 Zada Prompt Patterns
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {zadaPatterns.map(pattern => (
          <div
            key={pattern.id}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 20,
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                background: getMethodologyColor(pattern.methodology),
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 600
              }}>
                {pattern.methodology.toUpperCase()}
              </span>
              <span style={{
                background: pattern.complexity === 'simple' ? '#10b981' 
                         : pattern.complexity === 'intermediate' ? '#f59e0b' 
                         : '#ef4444',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 500
              }}>
                {pattern.complexity.toUpperCase()}
              </span>
            </div>
            
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              {pattern.name}
            </div>
            
            <div style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 12,
              lineHeight: 1.4
            }}>
              {pattern.description}
            </div>
            
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 12,
              marginBottom: 12,
              fontSize: 14,
              lineHeight: 1.5,
              fontFamily: 'monospace',
              color: '#1e293b'
            }}>
              {pattern.pattern}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span>Director Friendly: {pattern.accessibility.directorFriendly ? '✅' : '❌'}</span>
                <span>Technical Level: {pattern.accessibility.technicalLevel}/10</span>
                <span>Readability: {pattern.accessibility.humanReadableScore}/10</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {pattern.filmGenre.map(genre => (
                  <span
                    key={genre}
                    style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      textTransform: 'capitalize'
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WorkflowsTab = () => (
    <div style={{ padding: 20 }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
        🎬 Film Industry Workflows
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {workflowTemplates.map(workflow => (
          <div
            key={workflow.id}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 20
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: 4
                }}>
                  {workflow.name}
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 1.4
                }}>
                  {workflow.description}
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
                gap: 4
              }}>
                <span style={{
                  background: getMethodologyColor(workflow.methodology),
                  color: 'white',
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontWeight: 500
                }}>
                  {workflow.methodology.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 12,
                  color: '#6b7280'
                }}>
                  ~{workflow.estimatedDuration}min
                </span>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 16
            }}>
              {workflow.phases.map((phase, index) => (
                <div
                  key={phase.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: getMethodologyColor(phase.methodology),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {index + 1}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#1e293b'
                    }}>
                      {phase.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      {phase.description}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 4
                  }}>
                    {phase.requiredRoles.map(role => (
                      <span
                        key={role}
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        {getRoleIcon(role)}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{
                    fontSize: 12,
                    color: '#6b7280',
                    minWidth: '50px',
                    textAlign: 'right'
                  }}>
                    {phase.duration}min
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExportTab = () => (
    <div style={{ padding: 20 }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
        🚀 VFX Pipeline Export
      </h4>
      
      {!currentSession ? (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: 8,
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🤝</div>
          <div>No active session</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Join or create a collaboration session to enable VFX export
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
              Active Session: {currentSession.title}
            </h5>
            <div style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: '#6b7280'
            }}>
              <span>Methodology: {currentSession.methodology}</span>
              <span>Participants: {currentSession.participants.length}</span>
              <span>MARS Regions: {currentSession.marsRegions.length}</span>
              <span>Edits: {currentSession.collaborativeEdits.length}</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 20
          }}>
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16
            }}>
              <h6 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
                Export Configuration
              </h6>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                <div>Format: {currentSession.vfxExportConfig.exportFormat}</div>
                <div>Include MARS: {currentSession.vfxExportConfig.includeMarsStructure ? '✅' : '❌'}</div>
                <div>Include Zada: {currentSession.vfxExportConfig.includeZadaPatterns ? '✅' : '❌'}</div>
                <div>Include Annotations: {currentSession.vfxExportConfig.includeAnnotations ? '✅' : '❌'}</div>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16
            }}>
              <h6 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
                Pipeline Integration
              </h6>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                <div>Project: {currentSession.vfxExportConfig.pipelineMetadata.project}</div>
                <div>Sequence: {currentSession.vfxExportConfig.pipelineMetadata.sequence}</div>
                <div>Shot: {currentSession.vfxExportConfig.pipelineMetadata.shot}</div>
                <div>Version: {currentSession.vfxExportConfig.pipelineMetadata.version}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleVFXExport}
            style={{
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            🚀 Generate VFX Pipeline Export
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`advanced-prompting-collaboration-panel ${className}`} style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 20,
        borderBottom: '1px solid #e2e8f0',
        background: 'rgba(255, 255, 255, 0.8)'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🤝 Advanced Prompting Collaboration
        </h3>
        <div style={{
          fontSize: 14,
          color: '#64748b',
          marginTop: 4
        }}>
          {getRoleIcon(currentUser.role)} {currentUser.name} ({currentUser.role.replace('_', ' ')})
          {currentSession && (
            <span style={{ color: '#10b981', fontWeight: 500, marginLeft: 8 }}>
              • Connected to "{currentSession.title}"
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        background: 'rgba(255, 255, 255, 0.6)'
      }}>
        {[
          { id: 'sessions', label: '🤝 Sessions', icon: '🤝' },
          { id: 'mars', label: '🏷️ MARS Regions', icon: '🏷️' },
          { id: 'zada', label: '💬 Zada Patterns', icon: '💬' },
          { id: 'workflows', label: '🎬 Workflows', icon: '🎬' },
          { id: 'export', label: '🚀 VFX Export', icon: '🚀' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: 12,
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#64748b',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: 400, overflowY: 'auto' }}>
        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'mars' && <MARSTab />}
        {activeTab === 'zada' && <ZadaTab />}
        {activeTab === 'workflows' && <WorkflowsTab />}
        {activeTab === 'export' && <ExportTab />}
      </div>
    </div>
  );
};

export default AdvancedPromptingCollaborationPanel;