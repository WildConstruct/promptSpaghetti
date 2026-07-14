/**
 * Document tabs for nested PSG precomps (After Effects-style compositions).
 * Reads/writes useDocumentProjectStore; switching dispatches epic1:switchDocument.
 */
import React, { useCallback } from 'react';
import {
  MAIN_DOCUMENT_ID,
  useDocumentProjectStore
} from '../../stores/documentProjectStore';
import './DocumentTabs.css';

export const DocumentTabs: React.FC = () => {
  const mainDocumentId = useDocumentProjectStore(s => s.mainDocumentId);
  const activeDocumentId = useDocumentProjectStore(s => s.activeDocumentId);
  const openDocumentIds = useDocumentProjectStore(s => s.openDocumentIds);
  const documents = useDocumentProjectStore(s => s.documents);
  const closeDocument = useDocumentProjectStore(s => s.closeDocument);

  // Only show when there is more than the main tab, or nested docs exist.
  const nestedCount = Object.keys(documents).filter(
    id => id !== mainDocumentId
  ).length;
  if (openDocumentIds.length <= 1 && nestedCount === 0) {
    return null;
  }

  // Tab chrome only dispatches; the editor container owns graph save + store
  // active id so the previous composition is not overwritten mid-switch.
  const handleSelect = useCallback(
    (documentId: string) => {
      if (documentId === activeDocumentId) {
        return;
      }
      window.dispatchEvent(
        new CustomEvent('epic1:switchDocument', {
          detail: { documentId }
        })
      );
    },
    [activeDocumentId]
  );

  const handleClose = useCallback(
    (event: React.MouseEvent, documentId: string) => {
      event.stopPropagation();
      if (documentId === mainDocumentId) {
        return;
      }
      const store = useDocumentProjectStore.getState();
      const wasActive = store.activeDocumentId === documentId;
      closeDocument(documentId);
      if (wasActive) {
        const nextActive =
          useDocumentProjectStore.getState().activeDocumentId;
        window.dispatchEvent(
          new CustomEvent('epic1:switchDocument', {
            detail: { documentId: nextActive }
          })
        );
      }
    },
    [closeDocument, mainDocumentId]
  );

  return (
    <div className="document-tabs" role="tablist" aria-label="Document compositions">
      {openDocumentIds.map(id => {
        const doc = documents[id];
        if (!doc) {
          return null;
        }
        const isActive = id === activeDocumentId;
        const isMain = id === mainDocumentId || id === MAIN_DOCUMENT_ID;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`document-tab${isActive ? ' active' : ''}${isMain ? ' main' : ''}`}
            onClick={() => handleSelect(id)}
            title={doc.name}
          >
            <span className="document-tab-label">{doc.name}</span>
            {!isMain && (
              <span
                className="document-tab-close"
                role="button"
                tabIndex={0}
                aria-label={`Close ${doc.name}`}
                onClick={e => handleClose(e, id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClose(e as unknown as React.MouseEvent, id);
                  }
                }}
              >
                ×
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
