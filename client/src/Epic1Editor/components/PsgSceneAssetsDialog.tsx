import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  PsgAssetRef,
  PsgAssembleSceneResponse,
  PsgSceneCrowdMember,
  PsgSceneAssemblyPlan
} from '@promptscape/core/services/psg';

type AssetKind = PsgAssetRef['kind'];
type StorageProvider = PsgAssetRef['storage']['provider'];
type AssetSource = PsgAssetRef['provenance']['source'];

interface PsgSceneAssetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assets: PsgAssetRef[];
  scene: PsgSceneAssemblyPlan | null;
  cloudAssetReady: boolean;
  onSave: (payload: { assets: PsgAssetRef[]; scene: PsgSceneAssemblyPlan }) => void;
  onExportManifest: () => void;
  onAssembleScene: () => Promise<PsgAssembleSceneResponse>;
  onDownloadAssembly: (
    response: PsgAssembleSceneResponse,
    filenameBase?: string
  ) => void;
}

const assetKinds: AssetKind[] = [
  'reference-still',
  'style-reference',
  'pose-reference',
  'character-sheet',
  'motion-plate',
  'alpha-sequence',
  'depth-pass',
  'mask',
  'comfy-workflow',
  'render-output'
];

const storageProviders: StorageProvider[] = ['local', 'supabase', 's3', 'blob'];
const assetSources: AssetSource[] = ['upload', 'generated', 'derived'];

function createEmptyScene(): PsgSceneAssemblyPlan {
  return {
    stillAssetIds: [],
    motionAssetIds: [],
    placements: [],
    crowdMembers: [],
    renderTargets: []
  };
}

export const PsgSceneAssetsDialog: React.FC<PsgSceneAssetsDialogProps> = ({
  isOpen,
  onClose,
  assets,
  scene,
  cloudAssetReady,
  onSave,
  onExportManifest,
  onAssembleScene,
  onDownloadAssembly
}) => {
  const [draftAssets, setDraftAssets] = useState<PsgAssetRef[]>(assets);
  const [draftScene, setDraftScene] = useState<PsgSceneAssemblyPlan>(
    scene || createEmptyScene()
  );
  const [assetId, setAssetId] = useState('');
  const [assetKind, setAssetKind] = useState<AssetKind>('reference-still');
  const [assetRole, setAssetRole] = useState('');
  const [assetProvider, setAssetProvider] = useState<StorageProvider>('local');
  const [assetUri, setAssetUri] = useState('');
  const [assetSource, setAssetSource] = useState<AssetSource>('upload');
  const [assetVendor, setAssetVendor] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [parentAssetIds, setParentAssetIds] = useState('');
  const [assetNotes, setAssetNotes] = useState('');
  const [assetContentType, setAssetContentType] = useState('');
  const [placementAssetId, setPlacementAssetId] = useState('');
  const [placementZone, setPlacementZone] = useState('');
  const [placementX, setPlacementX] = useState('');
  const [placementY, setPlacementY] = useState('');
  const [placementDepth, setPlacementDepth] = useState('');
  const [draftPreviewUrls, setDraftPreviewUrls] = useState<Record<string, string>>({});
  const [pendingAttachmentAssetId, setPendingAttachmentAssetId] = useState<string | null>(
    null
  );
  const [assemblyPreview, setAssemblyPreview] = useState<PsgAssembleSceneResponse | null>(
    null
  );
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyError, setAssemblyError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftAssets(assets);
    setDraftScene(scene || createEmptyScene());
    setAssemblyPreview(null);
    setAssemblyError(null);
  }, [assets, isOpen, scene]);

  useEffect(() => {
    return () => {
      Object.values(draftPreviewUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [draftPreviewUrls]);

  const summary = useMemo(() => {
    const stillAssetIds = draftAssets
      .filter(asset =>
        asset.kind === 'reference-still' ||
        asset.kind === 'style-reference' ||
        asset.kind === 'pose-reference' ||
        asset.kind === 'character-sheet' ||
        asset.kind === 'render-output'
      )
      .map(asset => asset.id);
    const motionAssetIds = draftAssets
      .filter(asset =>
        asset.kind === 'motion-plate' || asset.kind === 'alpha-sequence'
      )
      .map(asset => asset.id);

    return {
      stillAssetIds,
      motionAssetIds
    };
  }, [draftAssets]);

  const createReferenceAssetFromMember = (member: PsgSceneCrowdMember) => {
    const nextAssetId = `${member.id}-reference`;
    const exists = draftAssets.some(asset => asset.id === nextAssetId);
    const nextAsset: PsgAssetRef = {
      id: nextAssetId,
      kind: 'reference-still',
      role: `${member.label} reference`,
      storage: {
        provider: 'local',
        uri: `local-draft://scene-assets/${nextAssetId}.png`,
        contentType: 'image/png'
      },
      provenance: {
        source: 'derived',
        workflowId: member.id,
        parentAssetIds: undefined
      },
      metadata: {
        memberId: member.id,
        archetypeId: member.archetypeId,
        promptHints: member.promptHints,
        notes: `${member.label} reference draft; replace with generated or uploaded media before production handoff`
      },
      tags: ['draft-reference', 'needs-media']
    };

    setDraftAssets(prev => {
      const filtered = prev.filter(asset => asset.id !== nextAssetId);
      return [...filtered, nextAsset];
    });

    if (!exists) {
      setDraftScene(prev => ({
        ...prev,
        placements: prev.placements.some(
          placement => placement.assetId === nextAssetId && placement.memberId === member.id
        )
          ? prev.placements
          : [
              ...prev.placements,
              {
                id: `placement-${prev.placements.length + 1}`,
                assetId: nextAssetId,
                memberId: member.id,
                zone: member.zone,
                depthLayer:
                  member.density === 'dense'
                    ? 3
                    : member.density === 'medium'
                      ? 2
                      : 1
              }
            ]
      }));
    }
  };

  if (!isOpen) {
    return null;
  }

  const getAssetPreviewUrl = (asset: PsgAssetRef) => {
    if (draftPreviewUrls[asset.id]) {
      return draftPreviewUrls[asset.id];
    }

    return typeof asset.metadata?.localPreviewUrl === 'string'
      ? asset.metadata.localPreviewUrl
      : null;
  };

  const loadAssetIntoForm = (asset: PsgAssetRef) => {
    setAssetId(asset.id);
    setAssetKind(asset.kind);
    setAssetRole(asset.role || '');
    setAssetProvider(asset.storage.provider);
    setAssetUri(asset.storage.uri);
    setAssetSource(asset.provenance.source);
    setAssetVendor(asset.provenance.vendor || '');
    setAssetModel(asset.provenance.model || '');
    setParentAssetIds((asset.provenance.parentAssetIds || []).join(', '));
    setAssetNotes(
      typeof asset.metadata?.notes === 'string' ? asset.metadata.notes : ''
    );
    setAssetContentType(asset.storage.contentType || '');
  };

  const openAttachmentPicker = (assetIdToAttach: string) => {
    setPendingAttachmentAssetId(assetIdToAttach);
    fileInputRef.current?.click();
  };

  const handleReferenceFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !pendingAttachmentAssetId) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setDraftPreviewUrls(prev => {
      const existing = prev[pendingAttachmentAssetId];
      if (existing) {
        URL.revokeObjectURL(existing);
      }
      return {
        ...prev,
        [pendingAttachmentAssetId]: previewUrl
      };
    });

    setDraftAssets(prev =>
      prev.map(asset =>
        asset.id === pendingAttachmentAssetId
          ? {
              ...asset,
              storage: {
                provider: 'local',
                uri: `local://${file.name}`,
                contentType: file.type || asset.storage.contentType
              },
              metadata: {
                ...(asset.metadata || {}),
                localFileName: file.name,
                localPreviewAvailable: true
              }
            }
          : asset
      )
    );

    const attachedAsset = draftAssets.find(asset => asset.id === pendingAttachmentAssetId);
    if (attachedAsset) {
      loadAssetIntoForm({
        ...attachedAsset,
        storage: {
          provider: 'local',
          uri: `local://${file.name}`,
          contentType: file.type || attachedAsset.storage.contentType
        },
        metadata: {
          ...(attachedAsset.metadata || {}),
          localFileName: file.name,
          localPreviewAvailable: true
        }
      });
    }

    setPendingAttachmentAssetId(null);
    event.target.value = '';
  };

  const promoteAssetToCloudReady = (assetIdToPromote: string) => {
    setDraftAssets(prev =>
      prev.map(asset => {
        if (asset.id !== assetIdToPromote) {
          return asset;
        }

        const fileName =
          typeof asset.metadata?.localFileName === 'string'
            ? asset.metadata.localFileName
            : `${asset.id}.png`;

        return {
          ...asset,
          storage: {
            provider: 'supabase',
            uri: `supabase://scene-assets/${fileName}`,
            contentType: asset.storage.contentType
          },
          metadata: {
            ...(asset.metadata || {}),
            cloudReady: true,
            promotedFromLocal: true
          }
        };
      })
    );
  };

  const handleAddAsset = () => {
    const nextId = assetId.trim();
    const nextUri = assetUri.trim();
    if (!nextId || !nextUri) {
      return;
    }

    const nextAsset: PsgAssetRef = {
      id: nextId,
      kind: assetKind,
      role: assetRole.trim() || undefined,
      storage: {
        provider: assetProvider,
        uri: nextUri,
        contentType: assetContentType.trim() || undefined
      },
      provenance: {
        source: assetSource,
        vendor: assetVendor.trim() || undefined,
        model: assetModel.trim() || undefined,
        parentAssetIds:
          parentAssetIds
            .split(',')
            .map(value => value.trim())
            .filter(Boolean).length > 0
            ? parentAssetIds
                .split(',')
                .map(value => value.trim())
                .filter(Boolean)
            : undefined
      },
      metadata: assetNotes.trim() ? { notes: assetNotes.trim() } : undefined
    };

    setDraftAssets(prev => {
      const filtered = prev.filter(asset => asset.id !== nextAsset.id);
      return [...filtered, nextAsset];
    });
    setAssetId('');
    setAssetRole('');
    setAssetUri('');
    setAssetVendor('');
    setAssetModel('');
    setParentAssetIds('');
    setAssetNotes('');
    setAssetContentType('');
  };

  const handleAddPlacement = () => {
    const assetIdValue = placementAssetId.trim();
    if (!assetIdValue) {
      return;
    }

    setDraftScene(prev => ({
      ...prev,
      placements: [
        ...prev.placements,
        {
          id: `placement-${prev.placements.length + 1}`,
          assetId: assetIdValue,
          zone: placementZone.trim() || undefined,
          x: placementX.trim() ? Number(placementX) : undefined,
          y: placementY.trim() ? Number(placementY) : undefined,
          depthLayer: placementDepth.trim()
            ? Number(placementDepth)
            : undefined
        }
      ]
    }));

    setPlacementAssetId('');
    setPlacementZone('');
    setPlacementX('');
    setPlacementY('');
    setPlacementDepth('');
  };

  const handleSave = () => {
    onSave({
      assets: draftAssets,
      scene: {
        ...draftScene,
        stillAssetIds: summary.stillAssetIds,
        motionAssetIds: summary.motionAssetIds
      }
    });
    onClose();
  };

  const handleAssembleScene = async () => {
    setIsAssembling(true);
    setAssemblyError(null);
    try {
      const response = await onAssembleScene();
      setAssemblyPreview(response);
    } catch (error) {
      setAssemblyError(
        error instanceof Error ? error.message : 'Failed to assemble scene'
      );
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true">
      <div style={styles.dialog}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>PSG Scene Assets</h2>
            <p style={styles.subtitle}>
              Keep `.psg` portable and JSON-first. Use this sidecar layer for
              reference assets, derived media, and placements.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReferenceFileSelected}
          style={styles.hiddenInput}
        />

        <div style={styles.columns}>
          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Add Asset</h3>
            <div style={styles.grid}>
              <input
                placeholder="asset id"
                value={assetId}
                onChange={event => setAssetId(event.target.value)}
                style={styles.input}
              />
              <select
                value={assetKind}
                onChange={event => setAssetKind(event.target.value as AssetKind)}
                style={styles.input}
              >
                {assetKinds.map(kind => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
              <input
                placeholder="role"
                value={assetRole}
                onChange={event => setAssetRole(event.target.value)}
                style={styles.input}
              />
              <select
                value={assetProvider}
                onChange={event =>
                  setAssetProvider(event.target.value as StorageProvider)
                }
                style={styles.input}
              >
                {storageProviders.map(provider => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              <input
                placeholder="storage uri"
                value={assetUri}
                onChange={event => setAssetUri(event.target.value)}
                style={{ ...styles.input, gridColumn: '1 / -1' }}
              />
              <input
                placeholder="content type"
                value={assetContentType}
                onChange={event => setAssetContentType(event.target.value)}
                style={styles.input}
              />
              <select
                value={assetSource}
                onChange={event =>
                  setAssetSource(event.target.value as AssetSource)
                }
                style={styles.input}
              >
                {assetSources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <input
                placeholder="vendor"
                value={assetVendor}
                onChange={event => setAssetVendor(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="model"
                value={assetModel}
                onChange={event => setAssetModel(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="parent asset ids, comma separated"
                value={parentAssetIds}
                onChange={event => setParentAssetIds(event.target.value)}
                style={{ ...styles.input, gridColumn: '1 / -1' }}
              />
              <textarea
                placeholder="notes"
                value={assetNotes}
                onChange={event => setAssetNotes(event.target.value)}
                style={{ ...styles.input, ...styles.notesInput, gridColumn: '1 / -1' }}
              />
            </div>
            <button onClick={handleAddAsset} style={styles.primaryButton}>
              Add or Update Asset
            </button>

            <div style={styles.list}>
              {draftAssets.map(asset => (
                <div key={asset.id} style={styles.listItem}>
                  <div>
                    <strong>{asset.id}</strong>
                    <div style={styles.muted}>
                      {asset.kind} · {asset.storage.provider} · {asset.storage.uri}
                    </div>
                    {getAssetPreviewUrl(asset) && (
                      <img
                        src={getAssetPreviewUrl(asset) || undefined}
                        alt={`${asset.id} preview`}
                        style={styles.assetPreview}
                      />
                    )}
                    {typeof asset.metadata?.localFileName === 'string' && (
                      <div style={styles.muted}>
                        attached file: {asset.metadata.localFileName}
                      </div>
                    )}
                    {asset.metadata?.cloudReady === true && (
                      <div style={styles.muted}>cloud-ready reference</div>
                    )}
                    {typeof asset.metadata?.notes === 'string' &&
                      asset.metadata.notes.length > 0 && (
                        <div style={styles.muted}>{asset.metadata.notes}</div>
                      )}
                    {typeof asset.metadata?.localSandboxManifestPath === 'string' && (
                      <div style={styles.muted}>
                        sandbox manifest: {asset.metadata.localSandboxManifestPath}
                      </div>
                    )}
                  </div>
                  <div style={styles.assetActions}>
                    <button
                      onClick={() => openAttachmentPicker(asset.id)}
                      style={styles.secondaryButton}
                    >
                      Attach File
                    </button>
                    {cloudAssetReady && asset.storage.provider === 'local' && (
                      <button
                        onClick={() => promoteAssetToCloudReady(asset.id)}
                        style={styles.secondaryButton}
                      >
                        Promote to Cloud
                      </button>
                    )}
                    <button
                      onClick={() => loadAssetIntoForm(asset)}
                      style={styles.secondaryButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDraftAssets(prev =>
                          prev.filter(entry => entry.id !== asset.id)
                        )
                      }
                      style={styles.secondaryButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Scene Placements</h3>
            <div style={styles.grid}>
              <input
                placeholder="asset id"
                value={placementAssetId}
                onChange={event => setPlacementAssetId(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="zone"
                value={placementZone}
                onChange={event => setPlacementZone(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="x"
                value={placementX}
                onChange={event => setPlacementX(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="y"
                value={placementY}
                onChange={event => setPlacementY(event.target.value)}
                style={styles.input}
              />
              <input
                placeholder="depth"
                value={placementDepth}
                onChange={event => setPlacementDepth(event.target.value)}
                style={styles.input}
              />
            </div>
            <button onClick={handleAddPlacement} style={styles.primaryButton}>
              Add Placement
            </button>

            <div style={styles.list}>
              {draftScene.placements.map(placement => (
                <div key={placement.id} style={styles.listItem}>
                  <div>
                    <strong>{placement.assetId}</strong>
                    <div style={styles.muted}>
                      {placement.zone || 'unassigned'} · x:{placement.x ?? '-'} ·
                      y:{placement.y ?? '-'} · depth:{placement.depthLayer ?? '-'}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setDraftScene(prev => ({
                        ...prev,
                        placements: prev.placements.filter(
                          entry => entry.id !== placement.id
                        )
                      }))
                    }
                    style={styles.secondaryButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryRow}>
                <span>Still assets</span>
                <strong>{summary.stillAssetIds.length}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Motion assets</span>
                <strong>{summary.motionAssetIds.length}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Placements</span>
                <strong>{draftScene.placements.length}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Crowd members</span>
                <strong>{draftScene.crowdMembers.length}</strong>
              </div>
            </div>
          </section>
        </div>

        <section style={{ ...styles.card, marginTop: '20px' }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Crowd Members</h3>
            {draftScene.crowdMembers.length > 0 && (
              <button
                onClick={() =>
                  setDraftScene(prev => ({
                    ...prev,
                    crowdMembers: []
                  }))
                }
                style={styles.secondaryButton}
              >
                Clear Crowd
              </button>
            )}
          </div>

          {draftScene.crowdMembers.length === 0 ? (
            <p style={styles.emptyState}>
              No crowd members saved yet. Use Hosted Crowd Expansion to generate
              them, then review and trim them here.
            </p>
          ) : (
            <div style={styles.crowdGrid}>
              {draftScene.crowdMembers.map(member => (
                <div key={member.id} style={styles.crowdCard}>
                  <div>
                    <strong>{member.label}</strong>
                    <div style={styles.muted}>
                      {member.archetypeId} · {member.zone || 'unassigned'} ·{' '}
                      {member.density || 'n/a'}
                    </div>
                    <div style={styles.muted}>
                      {member.promptHints.join(', ')}
                    </div>
                  </div>
                  <div style={styles.crowdActions}>
                    <button
                      onClick={() => createReferenceAssetFromMember(member)}
                      style={styles.secondaryButton}
                    >
                      Create Reference Asset
                    </button>
                    <button
                      onClick={() =>
                        setDraftScene(prev => ({
                          ...prev,
                          crowdMembers: prev.crowdMembers.filter(
                            entry => entry.id !== member.id
                          )
                        }))
                      }
                      style={styles.secondaryButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ ...styles.card, marginTop: '20px' }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Scene Assembly Output</h3>
            <div style={styles.assetActions}>
              <button
                onClick={() => void handleAssembleScene()}
                style={styles.secondaryButton}
              >
                {isAssembling ? 'Assembling…' : 'Assemble Scene JSON'}
              </button>
              {assemblyPreview && (
                <button
                  onClick={() =>
                    onDownloadAssembly(
                      assemblyPreview,
                      assemblyPreview.document.metadata.name
                    )
                  }
                  style={styles.secondaryButton}
                >
                  Download Assembly
                </button>
              )}
            </div>
          </div>

          {assemblyError && <div style={styles.errorBox}>{assemblyError}</div>}

          {assemblyPreview ? (
            <pre style={styles.codePreview}>
              {JSON.stringify(assemblyPreview.assembly, null, 2)}
            </pre>
          ) : (
            <p style={styles.emptyState}>
              Assemble the current PSG scene through the API to preview the
              structured output that downstream tools can consume.
            </p>
          )}
        </section>

        <div style={styles.footer}>
          <button onClick={onExportManifest} style={styles.secondaryButton}>
            Export Scene Manifest
          </button>
          <button onClick={handleSave} style={styles.primaryButton}>
            Save Scene Assets
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 12, 16, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1400,
    padding: '24px'
  },
  dialog: {
    width: 'min(1080px, 100%)',
    maxHeight: '90vh',
    overflow: 'auto',
    background: '#f7f5ef',
    color: '#1c1e21',
    borderRadius: '24px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '1.6rem'
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#5f6368',
    maxWidth: '760px'
  },
  closeButton: {
    border: '1px solid #c8c4b8',
    background: '#fffdf8',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  hiddenInput: {
    display: 'none'
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  card: {
    background: '#fffdf8',
    border: '1px solid #e6e0d4',
    borderRadius: '18px',
    padding: '18px'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '12px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '14px'
  },
  input: {
    border: '1px solid #d8d1c3',
    borderRadius: '12px',
    padding: '10px 12px',
    background: '#ffffff'
  },
  assetPreview: {
    display: 'block',
    width: '96px',
    height: '96px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginTop: '10px',
    border: '1px solid #e6e0d4'
  },
  notesInput: {
    minHeight: '72px',
    resize: 'vertical'
  },
  primaryButton: {
    border: 0,
    borderRadius: '999px',
    padding: '10px 16px',
    background: '#1b5e20',
    color: '#fff',
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #d8d1c3',
    borderRadius: '999px',
    padding: '8px 14px',
    background: '#fff',
    cursor: 'pointer'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '16px'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    border: '1px solid #ece5d7',
    borderRadius: '14px',
    padding: '12px'
  },
  muted: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginTop: '4px'
  },
  summaryCard: {
    marginTop: '18px',
    background: '#f2eee4',
    borderRadius: '14px',
    padding: '14px'
  },
  emptyState: {
    color: '#6b7280',
    margin: 0
  },
  crowdGrid: {
    display: 'grid',
    gap: '10px'
  },
  crowdCard: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
    border: '1px solid #ece5d7',
    borderRadius: '14px',
    padding: '12px',
    background: '#fffdfa'
  },
  crowdActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  assetActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  errorBox: {
    background: '#fff1f2',
    color: '#9f1239',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '12px'
  },
  codePreview: {
    margin: 0,
    padding: '14px',
    borderRadius: '14px',
    background: '#111827',
    color: '#e5eefb',
    overflow: 'auto',
    fontSize: '12px',
    lineHeight: 1.5
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px'
  }
};

export default PsgSceneAssetsDialog;
