import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import './NodeReplacementModal.css';
import '../epic1/nodes/VisualFeedbackEnhancements.css';
import '../epic1/animations/EditTransitions.css';

const ANIMATION_DURATION_MS = 280;
const SEARCH_DEBOUNCE_MS = 200;

const useModalCallbacks = () => {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuedCallback = useRef<(() => void) | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    queuedCallback.current = null;
  }, []);

  const runAfterAnimation = useCallback((callback: () => void) => {
    queuedCallback.current = callback;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      queuedCallback.current?.();
      queuedCallback.current = null;
      setIsClosing(false);
      closeTimerRef.current = null;
    }, ANIMATION_DURATION_MS);
  }, []);

  const cancelPendingAnimation = useCallback(() => {
    clearCloseTimer();
    setIsClosing(false);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  return { isClosing, runAfterAnimation, cancelPendingAnimation };
};

type LegacyReplacementInfo = {
  targetNode: {
    id: string;
    type: string;
    label: string;
  };
  newAsset: {
    id: string;
    name: string;
    type: string;
  };
  connectionImpact: {
    preserved: number;
    lost: number;
    incompatible: string[];
  };
};

type LegacyProps = {
  info: LegacyReplacementInfo;
  onReplace: () => void;
  onCancel: () => void;
  isVisible: boolean;
  advancedActions?: {
    onMergeChoices?: () => void;
    onCreateVariant?: () => void;
    onSmartSwap?: () => void;
    onReplaceAllSimilar?: () => void;
    onReplaceAllSelected?: () => void;
  };
};

type ReplacementNode = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

type ReplacementNodeType = {
  type: string;
  label: string;
  icon?: string;
};

type ReplacementOptions = {
  preserveData?: boolean;
  dataMapping?: Record<string, string>;
  batch?: boolean;
};

type ModernProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: ReplacementNode;
  availableNodeTypes: ReplacementNodeType[];
  onReplace: (
    nodeId: string,
    newType: string,
    options: ReplacementOptions
  ) => void;
  onBatchReplace?: (
    currentType: string,
    newType: string,
    options: ReplacementOptions
  ) => void;
  onSearch?: (query: string) => void;
  showHistory?: boolean;
};

type NodeReplacementModalProps = LegacyProps | ModernProps;

export const NodeReplacementModal: React.FC<
  NodeReplacementModalProps
> = props => {
  if ('info' in props) {
    return <LegacyNodeReplacementModal {...props} />;
  }
  return <ModernNodeReplacementModal {...props} />;
};

// -------------------------------
// Modern modal implementation
// -------------------------------

const CATEGORY_CONFIG: Array<{
  id: string;
  label: string;
  match: (type: string) => boolean;
}> = [
  {
    id: 'basic',
    label: 'Basic Nodes',
    match: type =>
      ['textBlock', 'variable', 'output', 'concat', 'setVariable'].includes(
        type
      )
  },
  {
    id: 'flow',
    label: 'Flow Control',
    match: type => ['weightedChoice', 'branch', 'condition'].includes(type)
  },
  {
    id: 'other',
    label: 'Other',
    match: () => false
  }
];

const getCategoryForType = (type: string): string => {
  const match = CATEGORY_CONFIG.find(cat => cat.match(type));
  return match?.id ?? 'other';
};

const formatNodeTypeLabel = (type: string, fallback?: string) => {
  if (fallback) {
    return fallback;
  }
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, s => s.toUpperCase());
};

const getCompatibility = (
  selectedNode: ReplacementNode,
  targetType: string
): { status: 'compatible' | 'incompatible'; message?: string } => {
  const outputs = selectedNode?.data?.outputs;
  const hasOutgoing = Array.isArray(outputs) && outputs.length > 0;
  if (targetType === 'output' && hasOutgoing) {
    return {
      status: 'incompatible',
      message: 'Cannot replace with output while existing outputs are connected'
    };
  }
  return { status: 'compatible' };
};

const ModernNodeReplacementModal: React.FC<ModernProps> = ({
  isOpen,
  onClose,
  selectedNode,
  availableNodeTypes,
  onReplace,
  onBatchReplace,
  onSearch,
  showHistory
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [batchMode, setBatchMode] = useState(false);
  const [preserveData, setPreserveData] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(
    null
  );
  const [history, setHistory] = useState<
    Array<{ nodeId: string; type: string }>
  >([]);

  const optionRefs = useRef<HTMLButtonElement[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isClosing, runAfterAnimation, cancelPendingAnimation } =
    useModalCallbacks();

  const resetInteractiveState = useCallback(() => {
    setSelectedType(null);
    setBatchMode(false);
    setPreserveData(false);
    setConnectionMessage(null);
    setSearchQuery('');
    setCategoryFilter('all');
  }, []);

  useEffect(() => {
    if (isOpen) {
      cancelPendingAnimation();
      resetInteractiveState();
    }
  }, [isOpen, cancelPendingAnimation, resetInteractiveState]);

  useEffect(() => {
    resetInteractiveState();
  }, [selectedNode?.id, resetInteractiveState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!onSearch) {
      return;
    }
    if (!isOpen && !isClosing) {
      return;
    }
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      onSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [searchQuery, onSearch, isOpen, isClosing]);

  const enhancedNodeTypes = useMemo(
    () =>
      availableNodeTypes.map(option => ({
        ...option,
        category: getCategoryForType(option.type),
        displayLabel: formatNodeTypeLabel(option.type, option.label)
      })),
    [availableNodeTypes]
  );

  const filteredNodeTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return enhancedNodeTypes.filter(option => {
      if (categoryFilter !== 'all' && option.category !== categoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        option.type.toLowerCase().includes(query) ||
        option.displayLabel.toLowerCase().includes(query)
      );
    });
  }, [enhancedNodeTypes, categoryFilter, searchQuery]);

  const batches = selectedNode?.data?.batchCount ?? 3;

  const handleSelect = (option: ReplacementNodeType) => {
    if (isClosing) {
      return;
    }
    const compatibility = getCompatibility(selectedNode, option.type);
    if (compatibility.status === 'incompatible') {
      setConnectionMessage(compatibility.message || 'Incompatible node type');
      return;
    }
    setSelectedType(option.type);
    setConnectionMessage(
      option.type === 'output'
        ? 'Connections may be adjusted to fit the new Output node.'
        : 'Connections will be preserved where possible.'
    );
  };

  const handleKeyboardNavigation = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    option: ReplacementNodeType
  ) => {
    if (isClosing) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const buttons = optionRefs.current.filter(Boolean);
      const currentIndex = buttons.indexOf(
        event.currentTarget as HTMLButtonElement
      );
      if (currentIndex === -1 || buttons.length === 0) {
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(option);
    }
  };

  const handleReplace = () => {
    if (!selectedType || isClosing) {
      return;
    }
    const options: ReplacementOptions = {
      preserveData,
      dataMapping: {
        from: selectedNode.id,
        to: selectedType
      },
      batch: batchMode
    };

    setHistory(prev => [
      ...prev,
      { nodeId: selectedNode.id, type: selectedType }
    ]);
    runAfterAnimation(() => {
      if (batchMode && onBatchReplace) {
        onBatchReplace(selectedNode.type, selectedType, options);
      } else {
        onReplace(selectedNode.id, selectedType, options);
      }
      onClose();
      resetInteractiveState();
    });
  };

  const handleCancel = () => {
    if (isClosing) {
      return;
    }
    runAfterAnimation(() => {
      onClose();
      resetInteractiveState();
    });
  };

  if (!isOpen && !isClosing) {
    return null;
  }

  optionRefs.current = [];

  return (
    <div
      className="node-replacement-modal-wrapper"
      data-testid="node-replacement-modal"
      data-state={isClosing ? 'closing' : 'open'}
    >
      <div
        className="node-replacement-modal-content"
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <h3>Replace Node</h3>
          <p className="modal-context">
            Replacing {formatNodeTypeLabel(selectedNode.type)} node
            {selectedNode.data?.content
              ? ` "${selectedNode.data.content}"`
              : ''}
          </p>
          <button
            className="modal-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <section className="modal-summary">
          <div className="summary-block">
            <span className="summary-label">Current:</span>
            <span className="summary-type">
              {formatNodeTypeLabel(selectedNode.type)}
            </span>
            {selectedNode.data?.content && (
              <span className="summary-name">{selectedNode.data.content}</span>
            )}
          </div>
          <div className="summary-arrow">→</div>
          <div className="summary-block">
            <span className="summary-label">New:</span>
            <span className="summary-type">
              {selectedType
                ? formatNodeTypeLabel(selectedType)
                : 'Select a node'}
            </span>
          </div>
        </section>

        <section className="modal-controls">
          <div className="search-control">
            <label htmlFor="node-search" className="sr-only">
              Search node types
            </label>
            <input
              id="node-search"
              type="search"
              placeholder="Search node types"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="category-control">
            <label htmlFor="category-filter">Filter by category</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={event => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {CATEGORY_CONFIG.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="modal-body">
          {CATEGORY_CONFIG.map(category => {
            const options = filteredNodeTypes.filter(
              opt => opt.category === category.id
            );
            return (
              <div key={category.id} className="category-group">
                <h4>{category.label}</h4>
                <div className="node-options">
                  {options.length === 0 && (
                    <div className="empty-category">
                      No nodes in this category.
                    </div>
                  )}
                  {options.map(option => {
                    const compatibility = getCompatibility(
                      selectedNode,
                      option.type
                    );
                    const isSelected = selectedType === option.type;
                    const classNames = [
                      'node-type-option',
                      compatibility.status,
                      isSelected ? 'selected' : ''
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <button
                        key={option.type}
                        type="button"
                        ref={el => {
                          if (el) {
                            optionRefs.current.push(el);
                          }
                        }}
                        data-testid={`node-type-${option.type}`}
                        className={classNames}
                        disabled={compatibility.status === 'incompatible'}
                        title={compatibility.message}
                        onClick={() => handleSelect(option)}
                        onKeyDown={event =>
                          handleKeyboardNavigation(event, option)
                        }
                      >
                        <span className="node-label">
                          {option.displayLabel}
                        </span>
                        {option.icon && (
                          <span className="node-icon">{option.icon}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {connectionMessage && (
            <div
              className="connection-message"
              data-testid="connection-message"
            >
              {connectionMessage}
            </div>
          )}

          {selectedType && (
            <div className="preview-pane" data-testid="replacement-preview">
              <h4>Preview</h4>
              <div className="preview-content">
                {formatNodeTypeLabel(selectedType)} node will replace the
                current node.
              </div>
            </div>
          )}

          {selectedType === 'variable' && (
            <div className="data-migration">
              <h4>Migrate Data</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preserveData}
                  onChange={event => setPreserveData(event.target.checked)}
                />
                Preserve content during replacement
              </label>
            </div>
          )}

          <div className="undo-hint">
            This action can be undone with Ctrl+Z.
          </div>

          {showHistory && history.length > 0 && (
            <div className="replacement-history">
              <h4>Recent replacements</h4>
              <ul>
                {history.map(entry => (
                  <li key={`${entry.nodeId}-${entry.type}`}>
                    {formatNodeTypeLabel(entry.type)} for node {entry.nodeId}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <footer className="modal-footer">
          {onBatchReplace && (
            <label className="batch-toggle">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={event => setBatchMode(event.target.checked)}
                aria-label={`Replace all ${formatNodeTypeLabel(selectedNode.type).toLowerCase()} nodes`}
              />
              Replace all {formatNodeTypeLabel(selectedNode.type).toLowerCase()}{' '}
              nodes
            </label>
          )}

          {batchMode && (
            <div className="batch-warning">
              This will replace {batches} nodes of type{' '}
              {formatNodeTypeLabel(selectedNode.type)}.
            </div>
          )}

          {selectedType === 'output' && (
            <div className="warning-message">
              Warning: Some connections may be lost when converting to an Output
              node.
            </div>
          )}

          <div className="modal-actions">
            <button
              className="modal-button cancel"
              onClick={handleCancel}
              disabled={isClosing}
            >
              Cancel
            </button>
            <button
              className="modal-button primary"
              disabled={!selectedType || isClosing}
              onClick={handleReplace}
            >
              {batchMode && onBatchReplace ? 'Replace All' : 'Replace Node'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

// -------------------------------
// Legacy modal implementation
// -------------------------------

const LegacyNodeReplacementModal: React.FC<LegacyProps> = ({
  info,
  onReplace,
  onCancel,
  isVisible,
  advancedActions
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible && !isAnimating) {
    return null;
  }

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onCancel, 300);
  };

  const handleReplace = () => {
    setIsAnimating(false);
    setTimeout(onReplace, 300);
  };

  const hasConnectionLoss = info.connectionImpact.lost > 0;
  const allConnectionsPreserved =
    info.connectionImpact.lost === 0 && info.connectionImpact.preserved > 0;

  return (
    <>
      <div
        className={`modal-backdrop ${isAnimating ? 'visible' : ''}`}
        onClick={handleClose}
      />
      <div className={`node-replacement-modal ${isAnimating ? 'visible' : ''}`}>
        <div className="modal-header">
          <h3>Replace Node</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="replacement-summary">
            <div className="node-info current">
              <span className="node-label">Current:</span>
              <span className="node-type">{info.targetNode.type}</span>
              <span className="node-name">{info.targetNode.label}</span>
            </div>
            <div className="replacement-arrow">→</div>
            <div className="node-info new">
              <span className="node-label">New:</span>
              <span className="node-type">{info.newAsset.type}</span>
              <span className="node-name">{info.newAsset.name}</span>
            </div>
          </div>

          <div className="connection-impact">
            <h4>Connection Impact</h4>

            {allConnectionsPreserved && (
              <div className="impact-item success">
                <span className="impact-icon">✓</span>
                <span>
                  All {info.connectionImpact.preserved} connections will be
                  preserved
                </span>
              </div>
            )}

            {info.connectionImpact.preserved > 0 && hasConnectionLoss && (
              <div className="impact-item success">
                <span className="impact-icon">✓</span>
                <span>
                  {info.connectionImpact.preserved} connections will be
                  preserved
                </span>
              </div>
            )}

            {hasConnectionLoss && (
              <div className="impact-item warning">
                <span className="impact-icon">⚠️</span>
                <span>
                  {info.connectionImpact.lost} connections will be lost
                </span>
                {info.connectionImpact.incompatible.length > 0 && (
                  <ul className="incompatible-list">
                    {info.connectionImpact.incompatible.map(conn => (
                      <li key={conn}>{conn}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {info.connectionImpact.preserved === 0 &&
              info.connectionImpact.lost === 0 && (
                <div className="impact-item info">
                  <span className="impact-icon">ℹ️</span>
                  <span>This node has no connections</span>
                </div>
              )}
          </div>

          <div className="modal-hint">
            <span className="hint-icon">💡</span>
            <span>Tip: You can undo this action with Ctrl+Z</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={`modal-button replace ${hasConnectionLoss ? 'warning' : 'success'}`}
            onClick={handleReplace}
          >
            {hasConnectionLoss ? 'Replace Anyway' : 'Replace Node'}
          </button>
        </div>
        <div
          className="modal-advanced"
          style={{
            padding: '12px 16px',
            borderTop: '1px dashed rgba(255,255,255,0.15)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          {advancedActions?.onMergeChoices && (
            <button
              className="modal-button"
              onClick={advancedActions.onMergeChoices}
            >
              Merge Choices
            </button>
          )}
          {advancedActions?.onCreateVariant && (
            <button
              className="modal-button"
              onClick={advancedActions.onCreateVariant}
            >
              Create Variant
            </button>
          )}
          {advancedActions?.onSmartSwap && (
            <button
              className="modal-button"
              onClick={advancedActions.onSmartSwap}
            >
              Smart Swap
            </button>
          )}
          {advancedActions?.onReplaceAllSimilar && (
            <button
              className="modal-button"
              onClick={advancedActions.onReplaceAllSimilar}
            >
              Replace All Similar
            </button>
          )}
          {advancedActions?.onReplaceAllSelected && (
            <button
              className="modal-button"
              onClick={advancedActions.onReplaceAllSelected}
            >
              Replace All Selected
            </button>
          )}
        </div>
      </div>
    </>
  );
};
