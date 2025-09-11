import React from 'react';
import { ParseMode } from '../hooks/useParsingEngine';

interface ToolbarProps {
  llmMode: ParseMode;
  onModeChange: (mode: ParseMode) => void;
  isLLMParsing: boolean;
  hasBeenAnalyzed: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReparse: () => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  llmMode,
  onModeChange,
  isLLMParsing,
  hasBeenAnalyzed,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReparse,
  isEditMode,
  onEditModeToggle
}) => {
  return (
    <div className="prompt-dissector-toolbar">
      <div className="toolbar-group">
        <button
          className={`mode-button ${llmMode === 'standard' ? 'active' : ''}`}
          onClick={() => onModeChange('standard')}
          disabled={isLLMParsing}
          title="Standard parsing mode"
        >
          Standard
        </button>
        <button
          className={`mode-button ${llmMode === 'llm-enhanced' ? 'active' : ''}`}
          onClick={() => onModeChange('llm-enhanced')}
          disabled={isLLMParsing}
          title="LLM-enhanced parsing mode"
        >
          LLM Enhanced
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="toolbar-button"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="toolbar-button"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={onEditModeToggle}
          className={`toolbar-button ${isEditMode ? 'active' : ''}`}
          title="Toggle edit mode"
        >
          {isEditMode ? '✏️ Edit' : '👁️ View'}
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={onReparse}
          disabled={isLLMParsing}
          className="toolbar-button parse-button"
          title="Parse the prompt"
        >
          {isLLMParsing ? 'Parsing...' : hasBeenAnalyzed ? 'Re-parse' : 'Parse'}
        </button>
      </div>

      {isLLMParsing && (
        <div className="parsing-indicator">
          <span className="spinner">⟳</span> Analyzing with LLM...
        </div>
      )}
    </div>
  );
};
