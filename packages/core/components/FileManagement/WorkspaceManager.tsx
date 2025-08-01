/**
 * Workspace Manager Component  
 * Epic 3 Story 3.3: Recent Files & Workspace Management
 * 
 * Manages workspace state, sessions, and project organization
 */
import React, { useState, useCallback, useEffect } from 'react';
import { PSGFile } from '../../projectManager';

export interface WorkspaceSession { id: string;
  name: string;
  description?: string;
  openFiles: PSGFile;
  activeFile?: string;
  timestamp: Date;
  autoSaved: boolean }


export interface WorkspaceManagerProps { currentSession?: WorkspaceSession;
  onSessionLoad?: (session: WorkspaceSession) => void;
  onSessionSave?: (session: WorkspaceSession) => void;
  onSessionDelete?: (sessionId: string) => void;
  theme?: 'light' | 'dark' | 'cinema';
  maxSessions?: number }

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ currentSession
  onSessionLoad
  onSessionSave
  onSessionDelete
  theme = 'cinema' }
  maxSessions = 10
}) => { const [sessions, setSessions] = useState<WorkspaceSession>([]);
  const [selectedSession, setSelectedSession] = useState<WorkspaceSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  // Theme styles
  const getThemeStyles = () => {
  const themes = {
  light: {
  background: '#ffffff'
  secondary: '#f8fafc'
  tertiary: '#f1f5f9'
  border: '#e5e7eb'
  text: '#374151'
  textSecondary: '#6b7280'
  accent: '#3b82f6'
  hover: '#f3f4f6'
  selection: '#dbeafe'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444' }

  dark: { 
  background: '#1f2937'
  secondary: '#111827'
  tertiary: '#0f172a'
  border: '#4b5563'
  text: '#f9fafb'
  textSecondary: '#9ca3af'
  accent: '#60a5fa'
  hover: '#374151'
  selection: '#1e3a8a'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444' }

  cinema: { 
  background: 'var(--color-bg-primary, #1e1e1e)'
  secondary: 'var(--color-bg-secondary, #2a2a2a)'
  tertiary: 'var(--color-bg-tertiary, #353535)'
  border: 'var(--color-ui-border, #404040)'
  text: 'var(--color-text-primary, #e8e8e8)'
  textSecondary: 'var(--color-text-secondary, #b8b8b8)'
  accent: 'var(--color-accent-orange, #ff7c00)'
  hover: 'var(--color-ui-hover, #2d2d2d)'
  selection: 'var(--color-ui-selection, #ff7c0040)'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444' }

};
    return themes[theme];
  };
  const styles = getThemeStyles();
  // Load sessions from localStorage
  useEffect(() => { loadSessions() }, []);
  const loadSessions = useCallback(() => { try {
  const stored = localStorage.getItem('workspaceSessions');
  if (stored) {
  const parsedSessions = JSON.parse(stored).map((session: any) => ({
  ...session
  timestamp: new Date(session.timestamp) }
}));
        setSessions(parsedSessions);

 catch (error) { console.warn('Failed to load workspace sessions:', error) }
  }, []);
  const saveSessions = useCallback((updatedSessions: WorkspaceSession) => { try {
      localStorage.setItem('workspaceSessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions) } catch (error) { console.warn('Failed to save workspace sessions:', error) }
  }, []);
  // Session actions
  const handleCreateSession = useCallback(() => { if (!newSessionName.trim()) return;
    const newSession: WorkspaceSession = { }
  id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      name: newSessionName.trim()
      description: newSessionDescription.trim() || undefined
      openFiles: currentSession?.openFiles || []
      activeFile: currentSession?.activeFile
      timestamp: new Date()
      autoSaved: false;
  };
    const updatedSessions = [newSession, ...sessions.slice(0, maxSessions - 1)];
    saveSessions(updatedSessions);
    setNewSessionName('');
    setNewSessionDescription('');
    setShowCreateDialog(false);
    onSessionSave?.(newSession);
  }, [newSessionName, newSessionDescription, currentSession, sessions, maxSessions, saveSessions, onSessionSave]);
  const handleLoadSession = useCallback((session: WorkspaceSession) => { setSelectedSession(session);
    onSessionLoad?.(session) }, [onSessionLoad]);
  const handleDeleteSession = useCallback((sessionId: string) => { if (confirm('Are you sure you want to delete this workspace session? This action cannot be undone.')) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      saveSessions(updatedSessions);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null) }
      onSessionDelete?.(sessionId);

  }, [sessions, selectedSession, saveSessions, onSessionDelete]);
  const handleSaveCurrentSession = useCallback(() => { if (!currentSession) return;
  const updatedSession = {
  ...currentSession
  timestamp: new Date()
  autoSaved: false }
};
    const existingIndex = sessions.findIndex(s => s.id === currentSession.id);
    let updatedSessions: WorkspaceSession;
    if (existingIndex >= 0) { updatedSessions = [...sessions];
      updatedSessions[existingIndex] = updatedSession } else { updatedSessions = [updatedSession, ...sessions.slice(0, maxSessions - 1)] }
    saveSessions(updatedSessions);
    onSessionSave?.(updatedSessions);
  }, [currentSession, sessions, maxSessions, saveSessions, onSessionSave]);
  const formatDate = (date: Date): string => { const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) {
      return 'Just now' } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
 else if (diffHours < 24) {
      return `${diffHours}h ago`;
 else if (diffDays < 7) {
      return `${diffDays}d ago`;
 else { return new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric' }
}).format(date);

  };
  return (
    <div style={ {
  backgroundColor: styles.background
  color: styles.text
  fontFamily: 'Inter, system-ui, sans-serif'
  fontSize: '14px'
  height: '100%'
  display: 'flex'
  flexDirection: 'column' }
}>
      {/* Header */}
      <div style={ {
        display: 'flex'
        alignItems: 'center'
        justifyContent: 'space-between'
        padding: '16px' }
        borderBottom: `1px solid ${styles.border}`
}>
        <h2 style={ {
  margin: 0
  fontSize: '18px'
  fontWeight: '600'
  color: styles.text }
}>
          Workspace Sessions
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Save Current Session */}
          {currentSession && (
            <button
              onClick={handleSaveCurrentSession}
              style={ {
  padding: '6px 12px'
  backgroundColor: styles.success
  border: 'none'
  borderRadius: '4px'
  color: 'white'
  fontSize: '12px'
  fontWeight: '500'
  cursor: 'pointer'
  display: 'flex'
  alignItems: 'center'
  gap: '4px' }

            >
              💾 Save Current
            </button>
          )}
          {/* Create Session */}
          <button
            onClick={() => setShowCreateDialog(true)}
            style={ {
  padding: '6px 12px'
  backgroundColor: styles.accent
  border: 'none'
  borderRadius: '4px'
  color: styles.background
  fontSize: '12px'
  fontWeight: '500'
  cursor: 'pointer'
  display: 'flex'
  alignItems: 'center'
  gap: '4px' }

          >
            ➕ New Session
          </button>
        </div>
      </div>
      {/* Current Session Info */}
      { currentSession && (
        <div style={{
          padding: '16px'
          backgroundColor: styles.secondary }
          borderBottom: `1px solid ${styles.border}`
}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{ fontWeight: '600' }}>Current Session: {currentSession.name}</span>
            { currentSession.autoSaved && (
              <span style={{
  padding: '2px 6px'
  backgroundColor: styles.success
  color: 'white'
  fontSize: '10px'
  borderRadius: '4px' }
}>
                AUTO-SAVED
              </span>
            )}
          </div>
          {currentSession.description && (
            <div style={{ color: styles.textSecondary, fontSize: '12px', marginBottom: '8px' }}>
              {currentSession.description}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: styles.textSecondary }}>
            <span>{currentSession.openFiles.length} files open</span>
            <span>Last updated: {formatDate(currentSession.timestamp)}</span>
          </div>
        </div>
      )}
      {/* Sessions List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        { sessions.length === 0 ? (
          <div style={{
  textAlign: 'center'
  padding: '40px 20px'
  color: styles.textSecondary }
}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No saved sessions</div>
            <div style={{ fontSize: '14px' }}>
              Create a session to save your current workspace
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(session => (
              <div
                key={session.id}
                style={ {
                  padding: '16px'
                  backgroundColor: selectedSession?.id === session.id ? styles.selection : styles.secondary }
                  border: `1px solid ${selectedSession?.id === session.id ? styles.accent : styles.border}`
                  borderRadius: '8px'
                  cursor: 'pointer'
                  transition: 'all 0.15s ease';

                onClick={() => setSelectedSession(session)}
                onDoubleClick={() => handleLoadSession(session)}
                onMouseOver={ (e) => {
                  if (selectedSession?.id !== session.id) {
                    e.currentTarget.style.backgroundColor = styles.hover }
}
                onMouseOut={ (e) => {
                  if (selectedSession?.id !== session.id) {
                    e.currentTarget.style.backgroundColor = styles.secondary }

              >
                <div style={ {
  display: 'flex'
  alignItems: 'flex-start'
  justifyContent: 'space-between'
  marginBottom: '8px' }
}>
                  <div style={{ flex: 1 }}>
                    <div style={ {
  fontWeight: '600'
  fontSize: '14px'
  marginBottom: '4px'
  display: 'flex'
  alignItems: 'center'
  gap: '8px' }
}>
                      {session.name}
                      { session.autoSaved && (
                        <span style={{
  padding: '2px 4px'
  backgroundColor: styles.success
  color: 'white'
  fontSize: '9px'
  borderRadius: '2px' }
}>
                          AUTO
                        </span>
                      )}
                    </div>
                    { session.description && (
                      <div style={{
  color: styles.textSecondary
  fontSize: '12px'
  marginBottom: '8px' }
}>
                        {session.description}
                      </div>
                    )}
                    <div style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '16px'
  fontSize: '11px'
  color: styles.textSecondary }
}>
                      <span>{session.openFiles.length} files</span>
                      <span>{formatDate(session.timestamp)}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={ (e) => {
                        e.stopPropagation();
                        handleLoadSession(session) }}
                      style={ {
  padding: '4px 8px'
  backgroundColor: styles.accent
  border: 'none'
  borderRadius: '4px'
  color: styles.background
  fontSize: '11px'
  cursor: 'pointer' }

                      title="Load session"
                    >
                      Load
                    </button>
                    <button
                      onClick={ (e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id) }}
                      style={ {
  padding: '4px'
  backgroundColor: 'transparent'
  border: 'none'
  color: styles.danger
  fontSize: '12px'
  cursor: 'pointer' }

                      title="Delete session"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Create Session Dialog */}
      { showCreateDialog && (
        <div style={{
  position: 'fixed'
  top: 0
  left: 0
  right: 0
  bottom: 0
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  zIndex: 10000 }
}>
          <div style={ {
            backgroundColor: styles.background }
            border: `1px solid ${styles.border}`
            borderRadius: '12px'
            padding: '24px'
            width: '400px'
            maxWidth: '90vw';
}>
            <h3 style={ {
  margin: '0 0 16px 0'
  fontSize: '18px'
  fontWeight: '600'
  color: styles.text }
}>
              Create New Session
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={ {
  display: 'block'
  marginBottom: '6px'
  fontSize: '14px'
  fontWeight: '500'
  color: styles.text }
}>
                Session Name *
              </label>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter session name..."
                style={ {
                  width: '100%'
                  padding: '8px 12px'
                  backgroundColor: styles.secondary }
                  border: `1px solid ${styles.border}`
                  borderRadius: '6px'
                  color: styles.text
                  fontSize: '14px'
                  outline: 'none';

              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={ {
  display: 'block'
  marginBottom: '6px'
  fontSize: '14px'
  fontWeight: '500'
  color: styles.text }
}>
                Description (optional)
              </label>
              <textarea
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                placeholder="Describe this session..."
                rows={3}
                style={ {
                  width: '100%'
                  padding: '8px 12px'
                  backgroundColor: styles.secondary }
                  border: `1px solid ${styles.border}`
                  borderRadius: '6px'
                  color: styles.text
                  fontSize: '14px'
                  outline: 'none'
                  resize: 'vertical'
                  fontFamily: 'inherit';

              />
            </div>
            <div style={ {
  display: 'flex'
  justifyContent: 'flex-end'
  gap: '12px' }
}>
              <button
                onClick={ () => {
                  setShowCreateDialog(false);
                  setNewSessionName('');
                  setNewSessionDescription('') }}
                style={ {
                  padding: '8px 16px'
                  backgroundColor: 'transparent' }
                  border: `1px solid ${styles.border}`
                  borderRadius: '6px'
                  color: styles.text
                  fontSize: '14px'
                  cursor: 'pointer';

              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                style={ {
  padding: '8px 16px'
  backgroundColor: newSessionName.trim() ? styles.accent : styles.textSecondary
  border: 'none'
  borderRadius: '6px'
  color: styles.background
  fontSize: '14px'
  fontWeight: '500'
  cursor: newSessionName.trim() ? 'pointer' : 'not-allowed' }

              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;