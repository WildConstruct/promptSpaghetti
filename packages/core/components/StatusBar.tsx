import React from "react";
import { Edge, Node } from "reactflow";
import { ValidationError } from "../validation";

interface StatusBarProps {
  statusMessage: string;
  errors: ValidationError[];
  onPreview: () => void;
  onSaveJson: () => void;
  onCorrections?: () => void;
  correctionsEnabled?: boolean;
  correctionsOpen?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  statusMessage,
  errors,
  onPreview,
  onSaveJson,
  onCorrections,
  correctionsEnabled = false,
  correctionsOpen = false,
}) => {
  const errorCount = errors.length;

  return (
    <div style={{ 
      position: "absolute", 
      bottom: 0, 
      left: 0, 
      right: 0, 
      background: "#fff", 
      borderTop: "1px solid #eee", 
      padding: 8, 
      fontSize: 14, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div aria-live="polite">
        {statusMessage && <span style={{ marginRight: 16 }}>{statusMessage}</span>}
        
        <button
          onClick={onPreview}
          style={{ 
            marginRight: 16, 
            padding: '6px 16px', 
            background: '#eee', 
            color: '#23272f', 
            border: '1px solid #ccc', 
            borderRadius: 4, 
            fontWeight: 500, 
            cursor: 'pointer' 
          }}
        >
          Preview
        </button>
        
        <button
          onClick={onSaveJson}
          style={{ 
            marginRight: 16, 
            padding: '6px 16px', 
            background: '#eee', 
            color: '#23272f', 
            border: '1px solid #ccc', 
            borderRadius: 4, 
            fontWeight: 500, 
            cursor: 'pointer' 
          }}
        >
          Save as JSON
        </button>
        
        {correctionsEnabled && onCorrections && (
          <button
            onClick={onCorrections}
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: correctionsOpen ? '#4a5568' : '#eee', 
              color: correctionsOpen ? '#fff' : '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            Corrections
          </button>
        )}
        
        {errorCount === 0 ? "No errors" : `${errorCount} error${errorCount > 1 ? "s" : ""}`}
        
        {errorCount > 0 && (
          <span style={{ marginLeft: 16 }}>
            {errors.map((err) => (
              <span 
                key={err.edgeId} 
                style={{ color: "#f00", marginRight: 8 }} 
                title={err.message}
              >
                {err.message}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};