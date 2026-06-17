import { useState, useEffect } from 'react';
import React from 'react';
import type { NodeProps } from 'reactflow';
import type { EditableNodeData } from '../nodes/BaseEditableNode';

type MetadataFlipProps = Pick<
  NodeProps<EditableNodeData>,
  'selected' | 'data'
>;

interface MetadataRow {
  label: string;
  value: string;
}

interface MetadataSummary {
  title: string;
  nodeType?: string;
  lastModified: string;
  rows: MetadataRow[];
}

/**
 * Build node-type-aware metadata rows. The old version showed Word/Character
 * count for every node, which is only meaningful on a TextBlock — on a Merge
 * or Variable it was noise. Each node type now surfaces fields that actually
 * describe it.
 */
function buildMetadataRows(data: Record<string, unknown>): { title: string; rows: MetadataRow[] } {
  const nodeType = data.nodeType as string | undefined;
  const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

  switch (nodeType) {
    case 'textBlock': {
      const text = str(data.value);
      return {
        title: 'Text Block',
        rows: [
          { label: 'Words', value: String(text.split(/\s+/).filter(Boolean).length) },
          { label: 'Characters', value: String(text.length) }
        ]
      };
    }
    case 'concat': {
      const joinStyle = str(data.joinStyle);
      const rows: MetadataRow[] = [
        { label: 'Join style', value: joinStyle || 'Separator' }
      ];
      if (!joinStyle) {
        const sep = data.separator ?? data.value ?? '';
        rows.push({ label: 'Separator', value: sep === '' ? '(none)' : JSON.stringify(sep) });
      }
      rows.push({ label: 'Dedupe', value: data.dedupe ? 'On' : 'Off' });
      return { title: 'Merge', rows };
    }
    case 'variable':
    case 'setVariable':
    case 'getVariable': {
      const isGetter = (data.isGetter as boolean) ?? nodeType === 'getVariable';
      const rows: MetadataRow[] = [
        { label: 'Name', value: str(data.value) || '(unnamed)' },
        { label: 'Mode', value: isGetter ? 'Get' : 'Set' }
      ];
      if (data.dataSource) {
        rows.push({ label: 'Data source', value: str(data.dataSource) });
      }
      return { title: isGetter ? 'Get Variable' : 'Set Variable', rows };
    }
    case 'weightedChoice':
    case 'enhancedBranching': {
      const options = Array.isArray(data.options) ? (data.options as Array<Record<string, unknown>>) : [];
      const branched = options.filter(o => o?.hasBranch).length;
      const rows: MetadataRow[] = [{ label: 'Options', value: String(options.length) }];
      if (branched) {
        rows.push({ label: 'Branches', value: String(branched) });
      }
      const weights = data.weightMode ?? data.distribution;
      if (weights) {
        rows.push({ label: 'Weights', value: str(weights) });
      }
      return { title: 'Weighted Choice', rows };
    }
    default: {
      const rows: MetadataRow[] = [];
      const value = str(data.value);
      if (value) {
        rows.push({ label: 'Value', value });
      }
      return { title: str(data.label) || 'Node', rows };
    }
  }
}

/**
 * Hook for adding metadata flip functionality to any node
 */
export const useMetadataFlip = (props: MetadataFlipProps) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<MetadataSummary | null>(null);

  // Keyboard handler for metadata toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if THIS node is selected
      if (e.key === 'm' && (e.metaKey || e.ctrlKey) && props.selected) {
        e.preventDefault();
        setShowMetadata(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.selected]);

  // Extract node-type-aware metadata when the back-face is shown
  useEffect(() => {
    if (showMetadata && props.data) {
      const { title, rows } = buildMetadataRows(props.data as unknown as Record<string, unknown>);
      setMetadata({
        title,
        nodeType: props.data.nodeType,
        lastModified: new Date().toLocaleString(),
        rows,
      });
    }
  }, [showMetadata, props.data]);

  return {
    showMetadata,
    setShowMetadata,
    metadata,
    flipClassName: `flippable ${showMetadata ? 'node-flipped' : ''}`,
  };
};

/**
 * Reusable metadata display component
 */
export const MetadataDisplay: React.FC<{
  metadata: MetadataSummary | null;
  onClose: () => void;
}> = ({ metadata, onClose }) => {
  return (
    <div className="card-face metadata-view">
      {/* Small circular red close tucked into the top-right corner */}
      <button
        className="metadata-close-btn nodrag"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Close metadata"
        aria-label="Close metadata"
        style={{
          position: 'absolute',
          top: '7px',
          right: '7px',
          width: '18px',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          borderRadius: '50%',
          background: '#ef4444',
          border: '1px solid rgba(0, 0, 0, 0.35)',
          color: '#fff',
          fontSize: '10px',
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
          transition: 'background 0.15s, transform 0.1s',
          zIndex: 11
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#dc2626';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ✕
      </button>
      <h3
        style={{
          margin: '0 0 10px',
          paddingRight: '22px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#10b981'
        }}
      >
        {metadata?.title ?? 'Details'}
      </h3>

      {metadata ? (
        <div style={{ fontSize: '12px' }}>
          {metadata.rows.map((row, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <strong>{row.label}:</strong> {row.value}
            </div>
          ))}
          <div style={{ marginBottom: '8px', opacity: 0.7 }}>
            <strong>Modified:</strong> {metadata.lastModified}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          No metadata available
        </div>
      )}
    </div>
  );
};

/**
 * Metadata toggle button component
 */
export const MetadataToggleButton: React.FC<{
  showMetadata: boolean;
  onClick: () => void;
}> = ({ showMetadata, onClick }) => {
  return (
    <button
      className="metadata-toggle-btn nodrag"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: showMetadata ? '#10b981' : '#374151',
        border: '1px solid #4b5563',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s',
        zIndex: 10,
      }}
      title="Toggle metadata view (Ctrl+M)"
    >
      {showMetadata ? '📝' : '🔍'}
    </button>
  );
};
