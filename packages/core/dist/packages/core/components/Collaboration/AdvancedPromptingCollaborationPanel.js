import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Panel
 *
 * Professional film industry collaboration interface for advanced prompting
 * methodologies, combining MARS framework, Zada patterns, and VFX integration.
 */
import { useState, useCallback, useEffect } from 'react';
const AdvancedPromptingCollaborationPanel = ({ collaborationService, currentUser, onMARSRegionCreate, onZadaPatternCreate, onVFXExport, className }) => {
    const [currentSession, setCurrentSession] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [marsTemplates, setMarsTemplates] = useState([]);
    const [zadaPatterns, setZadaPatterns] = useState([]);
    const [workflowTemplates, setWorkflowTemplates] = useState([]);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [selectedMethodology, setSelectedMethodology] = useState('hybrid');
    const [activeTab, setActiveTab] = useState('sessions');
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
        const handleSessionCreated = (session) => {
            setSessions(prev => [...prev, session]);
        };
        const handleMARSRegionCreated = ({ region }) => {
            setMarsTemplates(prev => [...prev, region]);
            onMARSRegionCreate?.(region);
        };
        const handleZadaPatternCreated = ({ pattern }) => {
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
        if (!newSessionTitle.trim())
            return;
        try {
            const session = await collaborationService.createCollaborationSession(newSessionTitle, selectedMethodology, currentUser.id);
            setCurrentSession(session);
            setIsCreatingSession(false);
            setNewSessionTitle('');
        }
        catch (error) {
            console.error('Failed to create session:', error);
        }
    }, [newSessionTitle, selectedMethodology, currentUser.id, collaborationService]);
    const handleJoinSession = useCallback(async (sessionId) => {
        try {
            const success = await collaborationService.joinCollaborationSession(sessionId, currentUser.id);
            if (success) {
                const session = collaborationService.getSessionById(sessionId);
                setCurrentSession(session || null);
            }
        }
        catch (error) {
            console.error('Failed to join session:', error);
        }
    }, [currentUser.id, collaborationService]);
    // VFX Export
    const handleVFXExport = useCallback(async () => {
        if (!currentSession)
            return;
        try {
            const exportData = await collaborationService.generateVFXExport(currentSession.sessionId, currentUser.id);
            onVFXExport?.(exportData);
        }
        catch (error) {
            console.error('Failed to generate VFX export:', error);
        }
    }, [currentSession, currentUser.id, collaborationService, onVFXExport]);
    // Role-based UI customization
    const getRoleIcon = (role) => {
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
    const getMethodologyColor = (methodology) => {
        const colors = {
            zada: '#10b981', // Green - Natural language
            mars: '#3b82f6', // Blue - Technical
            hybrid: '#8b5cf6', // Purple - Combined
            custom: '#f59e0b' // Orange - Custom
        };
        return colors[methodology];
    };
    const isMethodologyCompatible = (role, methodology) => {
        const compatibility = {
            director: ['zada', 'hybrid'],
            vfx_supervisor: ['mars', 'hybrid'],
            pipeline_td: ['mars', 'custom'],
            vfx_artist: ['zada', 'mars', 'hybrid'],
            cinematographer: ['zada', 'hybrid'],
            producer: ['hybrid'],
            script_supervisor: ['zada']
        };
        return compatibility[role]?.includes(methodology) || false;
    };
    const SessionsTab = () => (_jsxs("div", { style: { padding: 20 }, children: [_jsxs("div", { style: {
                    marginBottom: 24,
                    padding: 16,
                    background: 'rgba(59, 130, 246, 0.05)',
                    borderRadius: 8,
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }, children: [_jsxs("h4", { style: { margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }, children: [getRoleIcon(currentUser.role), " Create New Collaboration Session"] }), !isCreatingSession ? (_jsx("button", { onClick: () => setIsCreatingSession(true), style: {
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                        }, children: "+ New Collaboration Session" })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx("input", { type: "text", placeholder: "Session title...", value: newSessionTitle, onChange: (e) => setNewSessionTitle(e.target.value), style: {
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 6,
                                    fontSize: 14
                                } }), _jsxs("select", { value: selectedMethodology, onChange: (e) => setSelectedMethodology(e.target.value), style: {
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 6,
                                    fontSize: 14
                                }, children: [_jsx("option", { value: "hybrid", children: "\uD83D\uDD04 Hybrid (MARS + Zada)" }), _jsx("option", { value: "zada", children: "\uD83D\uDCAC Zada Natural Language" }), _jsx("option", { value: "mars", children: "\uD83C\uDFF7\uFE0F MARS Framework" }), _jsx("option", { value: "custom", children: "\u2699\uFE0F Custom Methodology" })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleCreateSession, disabled: !newSessionTitle.trim(), style: {
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
                                        }, children: "Create Session" }), _jsx("button", { onClick: () => {
                                            setIsCreatingSession(false);
                                            setNewSessionTitle('');
                                        }, style: {
                                            background: 'none',
                                            border: '1px solid #d1d5db',
                                            color: '#6b7280',
                                            padding: '8px 16px',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 13
                                        }, children: "Cancel" })] })] }))] }), _jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }, children: "Active Collaboration Sessions" }), sessions.length === 0 ? (_jsxs("div", { style: {
                            padding: 24,
                            textAlign: 'center',
                            color: '#6b7280',
                            background: '#f9fafb',
                            borderRadius: 8,
                            border: '1px dashed #d1d5db'
                        }, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 8 }, children: "\uD83E\uDD1D" }), _jsx("div", { children: "No active collaboration sessions" }), _jsx("div", { style: { fontSize: 12, marginTop: 4 }, children: "Create a new session to start collaborating with your team" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: sessions.map(session => (_jsx("div", { style: {
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
                            }, onClick: () => handleJoinSession(session.sessionId), children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    marginBottom: 4
                                                }, children: session.title }), _jsxs("div", { style: {
                                                    fontSize: 12,
                                                    color: '#6b7280',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }, children: [_jsx("span", { style: {
                                                            color: getMethodologyColor(session.methodology),
                                                            fontWeight: 500
                                                        }, children: session.methodology.toUpperCase() }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [session.participants.length, " participant", session.participants.length !== 1 ? 's' : ''] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [session.collaborativeEdits.length, " edit", session.collaborativeEdits.length !== 1 ? 's' : ''] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [session.participants.slice(0, 3).map(participant => (_jsx("div", { style: {
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
                                                }, children: getRoleIcon(participant.role) }, participant.id))), session.participants.length > 3 && (_jsxs("div", { style: {
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
                                                }, children: ["+", session.participants.length - 3] }))] })] }) }, session.sessionId))) }))] })] }));
    const MARSTab = () => (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h4", { style: { margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }, children: "\uD83C\uDFF7\uFE0F MARS Region Templates" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16
                }, children: marsTemplates.map(template => (_jsxs("div", { style: {
                        background: 'white',
                        border: `2px solid ${template.color}20`,
                        borderRadius: 8,
                        padding: 16,
                        position: 'relative'
                    }, children: [_jsx("div", { style: {
                                position: 'absolute',
                                top: -1,
                                right: -1,
                                background: template.color,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '0 6px 0 6px',
                                fontSize: 10,
                                fontWeight: 600
                            }, children: template.marsParameters.category }), _jsx("div", { style: {
                                fontSize: 16,
                                fontWeight: 600,
                                color: '#1e293b',
                                marginBottom: 8
                            }, children: template.title }), _jsx("div", { style: {
                                fontSize: 14,
                                color: '#6b7280',
                                marginBottom: 12,
                                lineHeight: 1.4
                            }, children: template.description }), _jsx("div", { style: {
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 4,
                                marginBottom: 12
                            }, children: template.tags.map(tag => (_jsx("span", { style: {
                                    background: `${template.color}15`,
                                    color: template.color,
                                    fontSize: 11,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontWeight: 500
                                }, children: tag }, tag))) }), template.vfxCompatible && (_jsx("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                color: '#10b981',
                                fontWeight: 500
                            }, children: "\u2705 VFX Pipeline Compatible" }))] }, template.id))) })] }));
    const ZadaTab = () => (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h4", { style: { margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }, children: "\uD83D\uDCAC Zada Prompt Patterns" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: zadaPatterns.map(pattern => (_jsxs("div", { style: {
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: 20,
                        position: 'relative'
                    }, children: [_jsxs("div", { style: {
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }, children: [_jsx("span", { style: {
                                        background: getMethodologyColor(pattern.methodology),
                                        color: 'white',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        fontWeight: 600
                                    }, children: pattern.methodology.toUpperCase() }), _jsx("span", { style: {
                                        background: pattern.complexity === 'simple' ? '#10b981'
                                            : pattern.complexity === 'intermediate' ? '#f59e0b'
                                                : '#ef4444',
                                        color: 'white',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        fontWeight: 500
                                    }, children: pattern.complexity.toUpperCase() })] }), _jsx("div", { style: {
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1e293b',
                                marginBottom: 8
                            }, children: pattern.name }), _jsx("div", { style: {
                                fontSize: 14,
                                color: '#6b7280',
                                marginBottom: 12,
                                lineHeight: 1.4
                            }, children: pattern.description }), _jsx("div", { style: {
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                padding: 12,
                                marginBottom: 12,
                                fontSize: 14,
                                lineHeight: 1.5,
                                fontFamily: 'monospace',
                                color: '#1e293b'
                            }, children: pattern.pattern }), _jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                                color: '#6b7280'
                            }, children: [_jsxs("div", { style: { display: 'flex', gap: 16 }, children: [_jsxs("span", { children: ["Director Friendly: ", pattern.accessibility.directorFriendly ? '✅' : '❌'] }), _jsxs("span", { children: ["Technical Level: ", pattern.accessibility.technicalLevel, "/10"] }), _jsxs("span", { children: ["Readability: ", pattern.accessibility.humanReadableScore, "/10"] })] }), _jsx("div", { style: { display: 'flex', gap: 4 }, children: pattern.filmGenre.map(genre => (_jsx("span", { style: {
                                            background: '#e5e7eb',
                                            color: '#374151',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: 10,
                                            textTransform: 'capitalize'
                                        }, children: genre }, genre))) })] })] }, pattern.id))) })] }));
    const WorkflowsTab = () => (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h4", { style: { margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }, children: "\uD83C\uDFAC Film Industry Workflows" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: workflowTemplates.map(workflow => (_jsxs("div", { style: {
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: 20
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                fontSize: 18,
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                marginBottom: 4
                                            }, children: workflow.name }), _jsx("div", { style: {
                                                fontSize: 14,
                                                color: '#6b7280',
                                                lineHeight: 1.4
                                            }, children: workflow.description })] }), _jsxs("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'end',
                                        gap: 4
                                    }, children: [_jsx("span", { style: {
                                                background: getMethodologyColor(workflow.methodology),
                                                color: 'white',
                                                fontSize: 12,
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                fontWeight: 500
                                            }, children: workflow.methodology.toUpperCase() }), _jsxs("span", { style: {
                                                fontSize: 12,
                                                color: '#6b7280'
                                            }, children: ["~", workflow.estimatedDuration, "min"] })] })] }), _jsx("div", { style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                marginTop: 16
                            }, children: workflow.phases.map((phase, index) => (_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                    background: '#f8fafc',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0'
                                }, children: [_jsx("div", { style: {
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
                                        }, children: index + 1 }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#1e293b'
                                                }, children: phase.name }), _jsx("div", { style: {
                                                    fontSize: 12,
                                                    color: '#6b7280'
                                                }, children: phase.description })] }), _jsx("div", { style: {
                                            display: 'flex',
                                            gap: 4
                                        }, children: phase.requiredRoles.map(role => (_jsx("span", { style: {
                                                fontSize: 10,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background: '#e5e7eb',
                                                color: '#374151'
                                            }, children: getRoleIcon(role) }, role))) }), _jsxs("div", { style: {
                                            fontSize: 12,
                                            color: '#6b7280',
                                            minWidth: '50px',
                                            textAlign: 'right'
                                        }, children: [phase.duration, "min"] })] }, phase.id))) })] }, workflow.id))) })] }));
    const ExportTab = () => (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h4", { style: { margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }, children: "\uD83D\uDE80 VFX Pipeline Export" }), !currentSession ? (_jsxs("div", { style: {
                    padding: 24,
                    textAlign: 'center',
                    color: '#6b7280',
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px dashed #d1d5db'
                }, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 8 }, children: "\uD83E\uDD1D" }), _jsx("div", { children: "No active session" }), _jsx("div", { style: { fontSize: 12, marginTop: 4 }, children: "Join or create a collaboration session to enable VFX export" })] })) : (_jsxs("div", { children: [_jsxs("div", { style: {
                            background: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 20
                        }, children: [_jsxs("h5", { style: { margin: '0 0 8px 0', color: '#1e293b' }, children: ["Active Session: ", currentSession.title] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    gap: 16,
                                    fontSize: 12,
                                    color: '#6b7280'
                                }, children: [_jsxs("span", { children: ["Methodology: ", currentSession.methodology] }), _jsxs("span", { children: ["Participants: ", currentSession.participants.length] }), _jsxs("span", { children: ["MARS Regions: ", currentSession.marsRegions.length] }), _jsxs("span", { children: ["Edits: ", currentSession.collaborativeEdits.length] })] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: 16,
                            marginBottom: 20
                        }, children: [_jsxs("div", { style: {
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: 16
                                }, children: [_jsx("h6", { style: { margin: '0 0 8px 0', color: '#1e293b' }, children: "Export Configuration" }), _jsxs("div", { style: { fontSize: 12, color: '#6b7280' }, children: [_jsxs("div", { children: ["Format: ", currentSession.vfxExportConfig.exportFormat] }), _jsxs("div", { children: ["Include MARS: ", currentSession.vfxExportConfig.includeMarsStructure ? '✅' : '❌'] }), _jsxs("div", { children: ["Include Zada: ", currentSession.vfxExportConfig.includeZadaPatterns ? '✅' : '❌'] }), _jsxs("div", { children: ["Include Annotations: ", currentSession.vfxExportConfig.includeAnnotations ? '✅' : '❌'] })] })] }), _jsxs("div", { style: {
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: 16
                                }, children: [_jsx("h6", { style: { margin: '0 0 8px 0', color: '#1e293b' }, children: "Pipeline Integration" }), _jsxs("div", { style: { fontSize: 12, color: '#6b7280' }, children: [_jsxs("div", { children: ["Project: ", currentSession.vfxExportConfig.pipelineMetadata.project] }), _jsxs("div", { children: ["Sequence: ", currentSession.vfxExportConfig.pipelineMetadata.sequence] }), _jsxs("div", { children: ["Shot: ", currentSession.vfxExportConfig.pipelineMetadata.shot] }), _jsxs("div", { children: ["Version: ", currentSession.vfxExportConfig.pipelineMetadata.version] })] })] })] }), _jsx("button", { onClick: handleVFXExport, style: {
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
                        }, children: "\uD83D\uDE80 Generate VFX Pipeline Export" })] }))] }));
    return (_jsxs("div", { className: `advanced-prompting-collaboration-panel ${className}`, style: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
        }, children: [_jsxs("div", { style: {
                    padding: 20,
                    borderBottom: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.8)'
                }, children: [_jsx("h3", { style: {
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }, children: "\uD83E\uDD1D Advanced Prompting Collaboration" }), _jsxs("div", { style: {
                            fontSize: 14,
                            color: '#64748b',
                            marginTop: 4
                        }, children: [getRoleIcon(currentUser.role), " ", currentUser.name, " (", currentUser.role.replace('_', ' '), ")", currentSession && (_jsxs("span", { style: { color: '#10b981', fontWeight: 500, marginLeft: 8 }, children: ["\u2022 Connected to \"", currentSession.title, "\""] }))] })] }), _jsx("div", { style: {
                    display: 'flex',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.6)'
                }, children: [
                    { id: 'sessions', label: '🤝 Sessions', icon: '🤝' },
                    { id: 'mars', label: '🏷️ MARS Regions', icon: '🏷️' },
                    { id: 'zada', label: '💬 Zada Patterns', icon: '💬' },
                    { id: 'workflows', label: '🎬 Workflows', icon: '🎬' },
                    { id: 'export', label: '🚀 VFX Export', icon: '🚀' }
                ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.id), style: {
                        flex: 1,
                        padding: 12,
                        border: 'none',
                        background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#64748b',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }, children: tab.label }, tab.id))) }), _jsxs("div", { style: { minHeight: 400, overflowY: 'auto' }, children: [activeTab === 'sessions' && _jsx(SessionsTab, {}), activeTab === 'mars' && _jsx(MARSTab, {}), activeTab === 'zada' && _jsx(ZadaTab, {}), activeTab === 'workflows' && _jsx(WorkflowsTab, {}), activeTab === 'export' && _jsx(ExportTab, {})] })] }));
};
export default AdvancedPromptingCollaborationPanel;
