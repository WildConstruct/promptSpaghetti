import React, { useState, useCallback } from 'react';
import { quickStartTemplates } from '../../templates/quickStartTemplates';
import type { LaunchPayload } from './LaunchScreen';
import './CompactLaunchDialog.css';

interface CompactLaunchDialogProps {
  onLaunch: (payload: LaunchPayload) => void;
  onClose?: () => void;
}

type TabType = 'new' | 'templates' | 'recent';

export const CompactLaunchDialog: React.FC<CompactLaunchDialogProps> = ({
  onLaunch,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [promptText, setPromptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleNewProject = useCallback(() => {
    onLaunch({ kind: 'empty' });
  }, [onLaunch]);

  const handlePromptLaunch = useCallback(() => {
    if (promptText.trim()) {
      // Parse the prompt and launch with analysis
      // For now, just launch empty
      onLaunch({ kind: 'empty' });
    }
  }, [promptText, onLaunch]);

  const handleTemplateLaunch = useCallback(() => {
    if (selectedTemplate) {
      const template = quickStartTemplates[selectedTemplate];
      if (template) {
        onLaunch({
          kind: 'template',
          graph: { nodes: template.nodes, edges: template.edges }
        });
      }
    }
  }, [selectedTemplate, onLaunch]);

  return (
    <div className="launch-dialog-overlay" onClick={onClose}>
      <div className="launch-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="launch-dialog-header">
          <h2>New Project</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="launch-tabs">
          <button
            className={`tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Composition
          </button>
          <button
            className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Files
          </button>
        </div>

        {/* Tab Content */}
        <div className="launch-dialog-content">
          {activeTab === 'new' && (
            <div className="new-project-tab">
              <div className="option-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="Untitled Project"
                  className="project-name-input"
                />
              </div>

              <div className="option-group">
                <label>Start With</label>
                <div className="start-options">
                  <button className="start-option" onClick={handleNewProject}>
                    <div className="option-icon">📄</div>
                    <div className="option-text">
                      <div className="option-title">Blank Canvas</div>
                      <div className="option-desc">
                        Start with an empty graph
                      </div>
                    </div>
                  </button>

                  <button
                    className="start-option"
                    onClick={() => setActiveTab('templates')}
                  >
                    <div className="option-icon">📚</div>
                    <div className="option-text">
                      <div className="option-title">From Template</div>
                      <div className="option-desc">
                        Choose a pre-built template
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label>Quick Start from Prompt</label>
                <textarea
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Enter your prompt to generate a graph..."
                  className="prompt-input"
                  rows={3}
                />
                <button
                  className="generate-button"
                  onClick={handlePromptLaunch}
                  disabled={!promptText.trim()}
                >
                  Generate from Prompt
                </button>
              </div>

              <div className="preset-settings">
                <div className="setting-row">
                  <label>Canvas Size</label>
                  <select defaultValue="auto">
                    <option value="auto">Auto (Responsive)</option>
                    <option value="1920x1080">1920×1080 (HD)</option>
                    <option value="1280x720">1280×720</option>
                  </select>
                </div>
                <div className="setting-row">
                  <label>Grid Snap</label>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="templates-tab">
              <div className="template-grid">
                {Object.keys(quickStartTemplates).map(id => (
                  <button
                    key={id}
                    className={`template-card ${selectedTemplate === id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(id)}
                    onDoubleClick={handleTemplateLaunch}
                  >
                    <div className="template-icon">📚</div>
                    <div className="template-name">{id}</div>
                  </button>
                ))}
              </div>
              <div className="template-actions">
                <button
                  className="primary-button"
                  onClick={handleTemplateLaunch}
                  disabled={!selectedTemplate}
                >
                  Use Template
                </button>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="recent-tab">
              <div className="recent-list">
                <div className="empty-recent">
                  <div className="empty-icon">📁</div>
                  <p>No recent files</p>
                  <p className="empty-hint">
                    Your recent projects will appear here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="launch-dialog-footer">
          <div className="footer-left">
            <button className="help-button" title="Help">
              ?
            </button>
          </div>
          <div className="footer-right">
            {activeTab === 'new' && (
              <button className="primary-button" onClick={handleNewProject}>
                Create New Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
