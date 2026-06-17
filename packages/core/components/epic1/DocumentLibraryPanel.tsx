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
  /** Category key used for the filter chips. */
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

export const DocumentLibraryPanel: React.FC<DocumentLibraryPanelProps> = ({
  documents,
  onOpenDocument
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

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

  if (documents.length === 0) {
    return (
      <div className="document-library">
        <div className="document-library-empty">
          <strong className="document-library-empty-title">No documents available</strong>
          <span>
            Full PSG-document templates will appear here — the same examples you
            see on the launch screen, ready to open without leaving the editor.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="document-library">
      <div className="document-library-intro">
        Open a full PSG document. This replaces the current graph, so you’ll be
        asked to confirm if you have unsaved work.
      </div>

      <div className="document-library-nav" role="tablist" aria-label="Document categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === ALL}
          className={`document-library-chip ${activeCategory === ALL ? 'active' : ''}`}
          onClick={() => setActiveCategory(ALL)}
        >
          All
          <span className="document-library-count">{documents.length}</span>
        </button>
        {categories.map(cat => {
          const count = documents.filter(d => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`document-library-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              <span className="document-library-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="document-library-list">
        {visible.map(doc => (
          <button
            key={doc.id}
            type="button"
            className={`document-library-card ${doc.branching ? 'is-branching' : ''}`}
            onClick={() => onOpenDocument?.(doc.id)}
            title={`Open “${doc.title}”`}
            data-testid={`explore-document-${doc.id}`}
          >
            <span className="document-library-card-title">{doc.title}</span>
            <span className="document-library-card-description">{doc.description}</span>
            <span className="document-library-card-meta">
              {doc.branching && (
                <span className="document-library-tag document-library-tag-branching">
                  ⑂ Branching
                </span>
              )}
              {typeof doc.nodeCount === 'number' && (
                <span className="document-library-tag">{doc.nodeCount} nodes</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentLibraryPanel;
