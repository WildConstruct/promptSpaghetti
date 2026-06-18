import React, { useMemo, useState } from 'react';
import './DocumentLibraryPanel.css';

/**
 * A full PSG-document the user can open from the in-editor "Explore" tab.
 * This is the document-level counterpart to the fragment Library — Library
 * holds reusable phrases/sentences; Explore holds whole graphs.
 */
export interface DocumentSummary {
  id: string;
  title: string;
  description: string;
  /** Category key used for the folder tree. */
  category: string;
  /** Human-readable category label (falls back to the key). */
  categoryLabel?: string;
  branching?: boolean;
  nodeCount?: number;
}

export interface DocumentLibraryPanelProps {
  documents: DocumentSummary[];
  onOpenDocument?: (id: string) => void;
}

const ALL = '__all__';

/**
 * Kontakt-style document browser: a category folder tree on top, a Name list
 * in the middle, and a description pane at the bottom. Single-click selects a
 * row (populating the description); double-click or the Open button loads it.
 */
export const DocumentLibraryPanel: React.FC<DocumentLibraryPanelProps> = ({
  documents,
  onOpenDocument
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    documents.forEach(doc => {
      if (!seen.has(doc.category)) {
        seen.set(doc.category, doc.categoryLabel ?? doc.category);
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [documents]);

  const visible = useMemo(
    () =>
      activeCategory === ALL
        ? documents
        : documents.filter(doc => doc.category === activeCategory),
    [documents, activeCategory]
  );

  const selectedDoc = useMemo(
    () => documents.find(doc => doc.id === selectedId) ?? null,
    [documents, selectedId]
  );

  if (documents.length === 0) {
    return (
      <div className="doc-browser">
        <div className="doc-browser-empty">
          <strong className="doc-browser-empty-title">
            No documents available
          </strong>
          <span>
            Full PSG-document templates will appear here — the same examples you
            see on the launch screen, ready to open without leaving the editor.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-browser">
      {/* Folder tree */}
      <div className="doc-browser-tree" role="tree" aria-label="Document folders">
        <button
          type="button"
          role="treeitem"
          aria-selected={activeCategory === ALL}
          className={`doc-tree-item doc-tree-root ${
            activeCategory === ALL ? 'active' : ''
          }`}
          onClick={() => setActiveCategory(ALL)}
        >
          <span className="doc-tree-icon" aria-hidden>
            ▾
          </span>
          <span className="doc-tree-label">All Documents</span>
          <span className="doc-tree-count">{documents.length}</span>
        </button>
        {categories.map(cat => {
          const count = documents.filter(d => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              role="treeitem"
              aria-selected={activeCategory === cat.id}
              className={`doc-tree-item doc-tree-child ${
                activeCategory === cat.id ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="doc-tree-icon" aria-hidden>
                🗀
              </span>
              <span className="doc-tree-label">{cat.label}</span>
              <span className="doc-tree-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* File list */}
      <div className="doc-browser-list-wrap">
        <div className="doc-browser-list-head">
          <span className="doc-col-name">Name</span>
          <span className="doc-col-type">Type</span>
        </div>
        <div className="doc-browser-list" role="listbox" aria-label="Documents">
          {visible.map(doc => {
            const isSelected = selectedId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`doc-row ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedId(doc.id)}
                onDoubleClick={() => onOpenDocument?.(doc.id)}
                title={`Double-click to open “${doc.title}”`}
                data-testid={`explore-document-${doc.id}`}
              >
                <span className="doc-row-icon" aria-hidden>
                  ▤
                </span>
                <span className="doc-row-name">{doc.title}</span>
                <span className="doc-row-tags">
                  {doc.branching && (
                    <span className="doc-tag doc-tag-branching">⑂</span>
                  )}
                  {typeof doc.nodeCount === 'number' && (
                    <span className="doc-tag">{doc.nodeCount}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description pane */}
      <div className="doc-browser-detail">
        {selectedDoc ? (
          <>
            <div className="doc-detail-head">
              <span className="doc-detail-title">{selectedDoc.title}</span>
              <span className="doc-detail-meta">
                {selectedDoc.categoryLabel ?? selectedDoc.category}
                {selectedDoc.branching ? ' · Branching' : ''}
                {typeof selectedDoc.nodeCount === 'number'
                  ? ` · ${selectedDoc.nodeCount} nodes`
                  : ''}
              </span>
            </div>
            <p className="doc-detail-desc">{selectedDoc.description}</p>
            <button
              type="button"
              className="doc-detail-open"
              onClick={() => onOpenDocument?.(selectedDoc.id)}
            >
              Open in editor<span aria-hidden> →</span>
            </button>
          </>
        ) : (
          <p className="doc-detail-empty">
            Select a document to preview its description, then double-click the
            row or press <strong>Open in editor</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default DocumentLibraryPanel;
