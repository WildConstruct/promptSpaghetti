import React from 'react';
import '../professional-theme.css';

export const SimpleGraphEditor: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'var(--color-text-primary, #e8e8e8)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", system-ui, sans-serif'
      }}
    >
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: 'var(--color-accent-orange, #ff7c00)'
      }}>
        🎨 Prompt Spaghetti
      </h1>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'normal', 
        marginBottom: '40px',
        color: 'var(--color-text-secondary, #b8b8b8)' 
      }}>
        Epic 1: Inline Node Editing MVP
      </h2>
      <div style={{
        padding: '40px',
        backgroundColor: 'var(--color-bg-secondary, #2a2a2a)',
        borderRadius: '12px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.45)'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Key Features:</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '1.8'
        }}>
          <li>✨ Direct inline editing within the graph</li>
          <li>🎯 Visual node-based prompt manipulation</li>
          <li>🔄 Deterministic variation generation</li>
          <li>⚡ Real-time preview system</li>
          <li>📚 Asset library with presets</li>
          <li>🎬 Professional Cinema 4D-inspired UI</li>
        </ul>
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
          borderRadius: '8px',
          border: '1px solid var(--color-accent-orange, #ff7c00)40'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            The full graph editor is being optimized for deployment.
            Check back soon for the complete inline editing experience!
          </p>
        </div>
      </div>
      <div style={{
        marginTop: '40px',
        fontSize: '12px',
        color: 'var(--color-text-secondary, #666)'
      }}>
        Epic 1 MVP • Inline Editing Innovation
      </div>
    </div>
  );
};

export default SimpleGraphEditor;
