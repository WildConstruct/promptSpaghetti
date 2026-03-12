import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';
import { exportGraphToPSG } from '@promptscape/core/fileFormats/psg';
import { loadReactFlowFromAnyPsgContent } from '../utils/psgDocument';
import { validateEditorGraphPayload } from '../utils/graphValidation';

interface FileOperationsConfig {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onEditorKeyChange: (updater: (prev: number) => number) => void;
  showToast: ReturnType<typeof useToast>['showToast'];
}

export const useFileOperations = ({
  onNodesChange,
  onEdgesChange,
  onEditorKeyChange,
  showToast
}: FileOperationsConfig) => {
  const exportPsg = useCallback(
    (nodes: Node[], edges: Edge[], name = 'Prompt Spaghetti Graph') => {
      const psg = exportGraphToPSG(nodes, edges, { name });
      const blob = new Blob([JSON.stringify(psg, null, 2)], {
        type: 'application/x-promptspaghetti-graph'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9._-]+/gi, '_')}.psg`;
      a.click();
      URL.revokeObjectURL(url);
      return psg;
    },
    []
  );

  const handleNew = useCallback(
    (demoNodes: Node[], demoEdges: Edge[]) => {
      // Create custom modal dialog
      const modal = document.createElement('div');
      modal.className = 'confirm-modal-overlay';
      modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    `;

      const dialog = document.createElement('div');
      dialog.className = 'confirm-modal-dialog';
      dialog.style.cssText = `
      background: #242424;
      border: 1px solid #404040;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease-out;
    `;

      dialog.innerHTML = `
      <h3 style="color: #e8e8e8; margin: 0 0 16px 0; font-size: 18px;">Create New Document</h3>
      <p style="color: #b8b8b8; margin: 0 0 24px 0; font-size: 14px;">Any unsaved changes will be lost. Do you want to continue?</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-btn" style="
          padding: 8px 16px;
          background: #333;
          border: 1px solid #404040;
          color: #e8e8e8;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        ">Cancel</button>
        <button id="confirm-btn" style="
          padding: 8px 16px;
          background: #ff7c00;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        ">Create New Document</button>
      </div>
    `;

      // Add animations
      const style = document.createElement('style');
      style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
    `;
      document.head.appendChild(style);

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      // Focus confirm button for keyboard navigation
      const confirmBtn = dialog.querySelector(
        '#confirm-btn'
      ) as HTMLButtonElement;
      const cancelBtn = dialog.querySelector(
        '#cancel-btn'
      ) as HTMLButtonElement;
      confirmBtn?.focus();

      const handleClose = (confirmed: boolean) => {
        // Animate out
        modal.style.animation = 'fadeOut 0.2s ease-out';
        dialog.style.animation = 'slideOut 0.2s ease-out';

        setTimeout(() => {
          document.body.removeChild(modal);
          document.head.removeChild(style);

          if (confirmed) {
            onNodesChange(demoNodes);
            onEdgesChange(demoEdges);
            onEditorKeyChange(prev => prev + 1);
            localStorage.removeItem('epic1-graph');
            showToast('New graph created', 'success');
          }
        }, 200);
      };

      // Event handlers
      confirmBtn?.addEventListener('click', () => handleClose(true));
      cancelBtn?.addEventListener('click', () => handleClose(false));
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          handleClose(false);
        }
      });

      // Keyboard handling
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose(false);
        } else if (e.key === 'Enter') {
          handleClose(true);
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      // Clean up keyboard handler on close
      const originalClose = handleClose;
      const wrappedClose = (confirmed: boolean) => {
        document.removeEventListener('keydown', handleKeyDown);
        originalClose(confirmed);
      };
      confirmBtn?.removeEventListener('click', () => handleClose(true));
      cancelBtn?.removeEventListener('click', () => handleClose(false));
      confirmBtn?.addEventListener('click', () => wrappedClose(true));
      cancelBtn?.addEventListener('click', () => wrappedClose(false));
    },
    [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]
  );

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.psg';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = evt => {
          try {
            const raw = String(evt.target?.result || '');
            const isPsg = file.name.toLowerCase().endsWith('.psg');
            const data = isPsg ? null : JSON.parse(raw);

            if (isPsg) {
              try {
                const loaded = loadReactFlowFromAnyPsgContent(raw);
                const { nodes, edges } = loaded;
                onNodesChange(nodes);
                onEdgesChange(edges);
                onEditorKeyChange(prev => prev + 1);
                localStorage.setItem(
                  'epic1-graph',
                  JSON.stringify({ nodes, edges })
                );
                showToast(
                  loaded.source === 'legacy'
                    ? 'Legacy PSG loaded via compatibility path'
                    : 'PSG document loaded successfully',
                  'success'
                );
                return;
              } catch {
                // Fall through to generic JSON handling below.
              }
            }

            if (data.nodes && data.edges) {
              const validated = validateEditorGraphPayload(data);
              if (!validated.ok) {
                throw new Error(validated.error);
              }
              onNodesChange(validated.data.nodes);
              onEdgesChange(validated.data.edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem(
                'epic1-graph',
                JSON.stringify(validated.data)
              );
              showToast(
                'Legacy JSON graph loaded via compatibility path',
                'success'
              );
            }
          } catch {
            showToast('Failed to load file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]);

  const handleSave = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      localStorage.setItem(
        'epic1-graph',
        JSON.stringify({ nodes: currentNodes, edges: currentEdges })
      );
      const psg = exportPsg(currentNodes, currentEdges);
      showToast(`Exported "${psg.name}" as PSG`, 'success');
    },
    [exportPsg, showToast]
  );

  const handleSaveAs = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      // eslint-disable-next-line no-alert
      const name = prompt('Enter a name for this PSG document:');
      if (name) {
        exportPsg(currentNodes, currentEdges, name);
        showToast(`Exported "${name}" as PSG`, 'success');
      }
    },
    [exportPsg, showToast]
  );

  const handleQuit = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      const graphData = { nodes: currentNodes, edges: currentEdges };
      localStorage.setItem('epic1-graph-autosave', JSON.stringify(graphData));

      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          'Are you sure you want to quit? Any unsaved changes will be auto-saved.'
        )
      ) {
        window.close();

        setTimeout(() => {
          document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            flex-direction: column;
            gap: 20px;
            background: #1a1a1a;
            color: #e0e0e0;
          ">
            <h2>Thank you for using Prompt Spaghetti!</h2>
            <p>You can now safely close this tab.</p>
            <p style="color: #888; font-size: 14px;">Your work has been auto-saved.</p>
          </div>
        `;
        }, 100);
      }
    },
    []
  );

  return {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleQuit
  };
};
