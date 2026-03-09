import React, { useMemo, useState } from 'react';
import {
  ApiPsgClient,
  type PsgCrowdArchetype,
  type PsgCrowdMember,
  type PsgSceneAssemblyPlan
} from '@promptscape/core/services/psg';

interface PsgCrowdExpansionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  psgAccessMode: 'offline' | 'local' | 'cloud';
  hostedUpgradeOperations: string[];
  onApply: (payload: { crowdMembers: PsgCrowdMember[] }) => void;
  existingScene: PsgSceneAssemblyPlan | null;
}

function parseArchetypes(input: string): PsgCrowdArchetype[] {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, weight] = line.split('|').map(part => part.trim());
      return {
        id: id || `archetype-${index + 1}`,
        label: label || id || `Archetype ${index + 1}`,
        weight: weight ? Number(weight) : undefined
      };
    });
}

export const PsgCrowdExpansionDialog: React.FC<PsgCrowdExpansionDialogProps> = ({
  isOpen,
  onClose,
  psgAccessMode,
  hostedUpgradeOperations,
  onApply,
  existingScene
}) => {
  const [count, setCount] = useState('12');
  const [variationAxes, setVariationAxes] = useState('emotion,motion,outfit');
  const [zones, setZones] = useState('foreground,midground,background');
  const [density, setDensity] = useState<'sparse' | 'medium' | 'dense'>('medium');
  const [archetypesText, setArchetypesText] = useState(
    'merchant|Merchant|2\nguard|Guard|1\ncivilian|Civilian|3'
  );
  const [members, setMembers] = useState<PsgCrowdMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseHostedExpansion =
    psgAccessMode === 'cloud' &&
    hostedUpgradeOperations.includes('expand-crowd');

  const parsedArchetypes = useMemo(
    () => parseArchetypes(archetypesText),
    [archetypesText]
  );

  if (!isOpen) {
    return null;
  }

  const handleGenerate = async () => {
    if (!canUseHostedExpansion) {
      setError('Hosted crowd expansion is not available in this runtime mode.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = new ApiPsgClient();
      const result = await client.expandCrowd({
        version: 'psg/1',
        kind: 'crowd-plan',
        metadata: {
          name: 'Hosted Crowd Expansion'
        },
        crowd: {
          count: Math.max(1, Number(count) || 1),
          archetypes: parsedArchetypes,
          variationAxes: variationAxes
            .split(',')
            .map(value => value.trim())
            .filter(Boolean),
          placement: {
            zones: zones
              .split(',')
              .map(value => value.trim())
              .filter(Boolean),
            density
          }
        }
      });
      setMembers(result.members);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Failed to expand crowd'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply({ crowdMembers: members });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={event => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Hosted Crowd Expansion</h2>
            <p style={styles.subtitle}>
              Generate weighted crowd members through the hosted PSG path and
              save them into the scene sidecar.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>

        <div style={styles.note}>
          {canUseHostedExpansion
            ? 'This is a hosted PSG feature. It previews structured crowd members before you save them into the scene manifest.'
            : 'Hosted crowd expansion is currently unavailable. Local PSG can still author/export, but expansion is a hosted upgrade path.'}
        </div>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span>Count</span>
            <input
              value={count}
              onChange={event => setCount(event.target.value)}
              style={styles.input}
            />
          </label>
          <label style={styles.field}>
            <span>Density</span>
            <select
              value={density}
              onChange={event =>
                setDensity(event.target.value as 'sparse' | 'medium' | 'dense')
              }
              style={styles.input}
            >
              <option value="sparse">sparse</option>
              <option value="medium">medium</option>
              <option value="dense">dense</option>
            </select>
          </label>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Variation axes</span>
            <input
              value={variationAxes}
              onChange={event => setVariationAxes(event.target.value)}
              style={styles.input}
            />
          </label>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Zones</span>
            <input
              value={zones}
              onChange={event => setZones(event.target.value)}
              style={styles.input}
            />
          </label>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Archetypes (`id|label|weight` per line)</span>
            <textarea
              value={archetypesText}
              onChange={event => setArchetypesText(event.target.value)}
              style={styles.textarea}
            />
          </label>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.summary}>
          <div>
            Existing sidecar crowd members: {existingScene?.crowdMembers.length || 0}
          </div>
          <div>Preview members: {members.length}</div>
        </div>

        <div style={styles.memberList}>
          {members.map(member => (
            <div key={member.id} style={styles.memberCard}>
              <strong>{member.label}</strong>
              <div style={styles.muted}>
                {member.archetypeId} · {member.zone || 'unassigned'} ·{' '}
                {member.density || 'n/a'}
              </div>
              <div style={styles.muted}>{member.promptHints.join(', ')}</div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            style={styles.secondaryButton}
          >
            {isLoading ? 'Generating...' : 'Generate Preview'}
          </button>
          <button
            onClick={handleApply}
            disabled={members.length === 0}
            style={styles.primaryButton}
          >
            Save Crowd to Scene
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 12, 16, 0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1450,
    padding: '24px'
  },
  dialog: {
    width: 'min(920px, 100%)',
    maxHeight: '90vh',
    overflow: 'auto',
    background: '#fcfaf5',
    borderRadius: '22px',
    padding: '22px',
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px'
  },
  title: { margin: 0 },
  subtitle: { margin: '8px 0 0', color: '#6b7280' },
  closeButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  note: {
    background: '#eef6ff',
    color: '#25425f',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  field: {
    display: 'grid',
    gap: '6px'
  },
  input: {
    border: '1px solid #d6d3d1',
    borderRadius: '12px',
    padding: '10px 12px'
  },
  textarea: {
    minHeight: '120px',
    border: '1px solid #d6d3d1',
    borderRadius: '12px',
    padding: '10px 12px',
    fontFamily: 'monospace'
  },
  error: {
    marginTop: '12px',
    background: '#fff1f2',
    color: '#9f1239',
    borderRadius: '12px',
    padding: '12px'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '18px 0 12px',
    color: '#4b5563'
  },
  memberList: {
    display: 'grid',
    gap: '10px',
    maxHeight: '240px',
    overflow: 'auto'
  },
  memberCard: {
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '12px'
  },
  muted: {
    color: '#6b7280',
    fontSize: '0.92rem',
    marginTop: '4px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '18px'
  },
  secondaryButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  primaryButton: {
    border: 0,
    background: '#1d4ed8',
    color: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  }
};

export default PsgCrowdExpansionDialog;
