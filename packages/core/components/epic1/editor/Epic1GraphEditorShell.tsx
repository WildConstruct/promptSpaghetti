/**
 * Epic1GraphEditor presentation shell (C3c).
 * Pure render tree — all state/handlers come from props.
 */
import React from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  SelectionMode,
  type Edge,
  type Node,
  type ReactFlowInstance
} from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { CanvasContextMenu } from '../nodes/CanvasContextMenu';
import { NodeContextMenu } from '../nodes/NodeContextMenu';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';
import { edgeTypes } from '../EdgeRenderingFix';
import { PanZoomControls } from '../PanZoomControls';
import { EdgeRoutingControls } from '../EdgeRoutingControls';
import { MagneticSnapHandler } from '../interactions/MagneticSnapHandler';
import {
  SelectionFeedback
} from '../interactions/NodeInteractionEnhancer';
import { ConnectionFeedback } from '../ConnectionFeedback';
import {
  MicroInteraction
} from '../animations/MicroInteractions';
import { CanvasTipPanel } from '../onboarding/CanvasTipPanel';
import { NodePalette } from '../NodePalette';
import { GraphModals, type WizardPreviewResult } from '../components/GraphModals';
import { ComponentSaveDialog, type ComponentSaveDraft } from '../ComponentSaveDialog';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { ConnectionToast } from '../ConnectionToast';
import { GraphCommander, type GraphCommanderCommand } from '../GraphCommander';
import { PreviewTray } from '../../PreviewTray/PreviewTray';
import { NodeTetris } from '../NodeTetris';
import {
  TabbedSidePanel,
  type SidePanelTabDefinition
} from '../TabbedSidePanel';
import type { DocumentSummary } from '../DocumentLibraryPanel';
import { DocumentTabs } from '../DocumentTabs';
import { epic1MinimapProps } from '../nodeVisualTheme';
import { getSupabase } from '../../../utils/supabaseClient';
import { useTutorial } from '../onboarding/TutorialContext';

// No-op history palette (same as prior editor-local stub)
const HistoryPalette = () => null;

/** Local TutorialButton — same as previous file-level helper */
const TutorialButton: React.FC = () => {
  const { startTutorial } = useTutorial();
  return (
    <button
      className="palette-footer-button"
      data-tutorial-anchor="tutorial-button"
      onClick={() => startTutorial()}
      style={{
        padding: '10px 12px',
        background:
          'linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.25) 100%)',
        border: '1px solid rgba(230, 162, 60, 0.3)',
        borderRadius: '6px',
        color: '#e0e0e0',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        boxShadow:
          '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        style={{ opacity: 0.6 }}
      >
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z" />
      </svg>
      Tutorial
    </button>
  );
};

export type Epic1GraphEditorShellProps = Record<string, any>;

/**
 * Renders the full editor chrome. Props are intentionally wide (orchestrator
 * pass-through) to keep this extraction mechanical.
 */
export function Epic1GraphEditorShell(props: Epic1GraphEditorShellProps) {
  const {
    isDraggingOver,
    showPreview,
    assetLibraryPosition,
    previewEngine,
    sidePanelTabDefinitions,
    exploreDocuments,
    onOpenDocument,
    handleFocusNode,
    nodes,
    edges,
    selectedNodeId,
    handleAssetInsert,
    componentDefinitions,
    graphReferences,
    insertComponentDefinition,
    saveSelectionAsComponent,
    detachSelectedComponentInstance,
    refreshSelectedComponentInstance,
    refreshOutdatedComponentInstances,
    dropTarget,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave,
    edgeInsertIndicator,
    replaceNodeIndicator,
    containerDropIndicator,
    enhancedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    handleNodeClick,
    handlePaneClick,
    setPaneContextMenu,
    setNodes,
    setNodeContextMenu,
    onNodesDelete,
    onEdgesDelete,
    nodeTypes,
    isValidConnection,
    handleExecute,
    togglePreview,
    previewTrayIsOpen,
    interactions,
    paneContextMenu,
    reactFlowInstance,
    handleOrganizeNodes,
    createNode,
    nodeContextMenu,
    setSaveAsPresetNodeId,
    duplicateNodes,
    disconnectNodes,
    deleteSelectedNodes,
    canvasTipsForceKey,
    setCanvasTipsForceKey,
    setIsCommanderOpen,
    startTutorial,
    nodePaletteCollapsed,
    setNodePaletteCollapsed,
    currentUser,
    setIsAuthModalOpen,
    setIsPromptWizardOpen,
    isPromptWizardOpen,
    isAuthModalOpen,
    saveAsPresetNodeId,
    pendingWizardNodes,
    setPendingWizardNodes,
    setCustomPresets,
    setCurrentUser,
    pendingComponentDraft,
    setPendingComponentDraft,
    setPendingComponentSelection,
    handleSaveComponentDraft,
    historyVisible,
    activeToast,
    dismissToast,
    isCommanderOpen,
    commandPaletteCommands,
    previewResults,
    isPreviewExecuting,
    previewError,
    currentSeeds,
    updateSeeds,
    executePreview,
    exportPreviewResults,
    tetrisMode,
    setTetrisMode,
    showToast,
    showAssetLibrary
  } = props;

  return (
    <div
      className={`epic1-graph-editor ${isDraggingOver ? 'drag-over' : ''}`}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Main horizontal container for everything except preview tray */}
      <div
        style={{
          flex: showPreview ? '1 1 auto' : '1',
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* Tabbed Side Panel with Asset Library */}
        {showAssetLibrary && (
          <TabbedSidePanel
            position={assetLibraryPosition}
            previewEngine={previewEngine}
            defaultTab="assets"
            showAssets={true}
            showPreview={showPreview}
            tabDefinitions={sidePanelTabDefinitions}
            exploreDocuments={exploreDocuments}
            onOpenDocument={onOpenDocument}
            onFocusNode={handleFocusNode}
            selectedNode={nodes.find(n => n.id === selectedNodeId)}
            nodes={nodes}
            edges={edges}
            onInsert={handleAssetInsert}
            componentDefinitions={componentDefinitions}
            componentReferences={graphReferences}
            onComponentInsert={insertComponentDefinition}
            onSaveSelectionAsComponent={saveSelectionAsComponent}
            onDetachSelectedComponent={detachSelectedComponentInstance}
            onRefreshSelectedComponent={refreshSelectedComponentInstance}
            onRefreshOutdatedComponents={refreshOutdatedComponentInstances}
          />
        )}

        {/* Main Graph Canvas */}
        <div
          className="graph-canvas-container"
          data-tutorial-anchor="canvas"
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
        >
          <DocumentTabs />
          {isDraggingOver && (
            <div className="drop-indicator" aria-live="polite">
              {dropTarget?.kind === 'replace-node'
                ? 'Drop to replace node'
                : dropTarget?.kind === 'insert-edge'
                  ? 'Drop to insert on edge'
                  : 'Drop to insert'}
            </div>
          )}
          {edgeInsertIndicator && (
            <div
              className="edge-insert-indicator"
              aria-hidden="true"
              style={{
                left: `${edgeInsertIndicator.left}px`,
                top: `${edgeInsertIndicator.top}px`
              }}
            >
              +
            </div>
          )}
          {replaceNodeIndicator && (
            <div
              className="node-replace-indicator"
              aria-hidden="true"
              style={{
                left: `${replaceNodeIndicator.left}px`,
                top: `${replaceNodeIndicator.top}px`,
                width: `${replaceNodeIndicator.width}px`,
                height: `${replaceNodeIndicator.height}px`
              }}
            >
              <span className="node-replace-indicator__label">Replace</span>
            </div>
          )}
          {containerDropIndicator && (
            <div
              className="node-replace-indicator"
              aria-hidden="true"
              style={{
                left: `${containerDropIndicator.left}px`,
                top: `${containerDropIndicator.top}px`,
                width: `${containerDropIndicator.width}px`,
                height: `${containerDropIndicator.height}px`
              }}
            >
              <span className="node-replace-indicator__label">Drop In Region</span>
            </div>
          )}
          <SafeReactFlowWrapper>
            <ReactFlow
              nodes={enhancedNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onPaneContextMenu={event => {
                event.preventDefault();
                setPaneContextMenu({ x: event.clientX, y: event.clientY });
              }}
              onNodeContextMenu={(event, node) => {
                event.preventDefault();
                // Select the right-clicked node so selection-based ops
                // (duplicate / disconnect / delete) act on it.
                setNodes(nds =>
                  nds.map(n => ({ ...n, selected: n.id === node.id }))
                );
                setNodeContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  nodeId: node.id
                });
              }}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDragEnter={onDragEnter}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionMode={ConnectionMode.Loose}
              connectionLineType={ConnectionLineType.SmoothStep}
              selectionMode={SelectionMode.Partial}
              fitView
              fitViewOptions={{ padding: 0.2, minZoom: 0.02, maxZoom: 2 }}
              minZoom={0.02}
              maxZoom={4}
              snapToGrid
              snapGrid={[15, 15]}
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
              panOnScroll={false}
              // Left button selects (click) / marquee (drag); pan with
              // middle/right drag or Space+drag. Previously panOnDrag={true}
              // made every small left-drag a pan, so clicks-with-motion never
              // registered as a select, and empty-pane clicks never deselected.
              panOnDrag={[1, 2]}
              selectionOnDrag
              selectNodesOnDrag={false}
              panActivationKeyCode="Space"
              zoomOnScroll={true}
              zoomOnDoubleClick
              isValidConnection={isValidConnection}
            >
              <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                {...epic1MinimapProps}
              />

              {/* Additional UI Elements moved outside due to React Flow rendering issues */}

              <Panel position="top-right">
                <div className="panel-controls">
                  <button onClick={handleExecute} className="execute-button">
                    Simulate
                  </button>
                  <button
                    onClick={togglePreview}
                    className="preview-button"
                    data-tutorial-anchor="preview-button"
                  >
                    {previewTrayIsOpen ? 'Hide Output' : 'Test Output'}
                  </button>
                </div>
              </Panel>

              <Panel position="bottom-left">
                <PanZoomControls />
              </Panel>

              <Panel position="bottom-right">
                <EdgeRoutingControls />
              </Panel>

              {/* Magnetic Snap Handler */}
              <MagneticSnapHandler />

              {/* Selection Feedback */}
              <SelectionFeedback />

              {/* Connection Feedback */}
              <ConnectionFeedback nodes={nodes} edges={edges} />

              {/* Micro Interactions */}
              {interactions.map(interaction => (
                <MicroInteraction key={interaction.id} {...interaction} />
              ))}
            </ReactFlow>

            {paneContextMenu && (
              <CanvasContextMenu
                position={paneContextMenu}
                onClose={() => setPaneContextMenu(null)}
                onLayoutCleanup={handleOrganizeNodes}
                onAddNote={() => {
                  const flow = reactFlowInstance
                    ? reactFlowInstance.screenToFlowPosition({
                        x: paneContextMenu.x,
                        y: paneContextMenu.y
                      })
                    : { x: 0, y: 0 };
                  createNode('postItNote', flow);
                }}
                onAddBoundingBox={() => {
                  const flow = reactFlowInstance
                    ? reactFlowInstance.screenToFlowPosition({
                        x: paneContextMenu.x,
                        y: paneContextMenu.y
                      })
                    : { x: 0, y: 0 };
                  // Center the default 400x300 region box on the click point.
                  createNode('enhancedBoundingBox', {
                    x: flow.x - 200,
                    y: flow.y - 150
                  });
                }}
              />
            )}

            {nodeContextMenu && (
              <NodeContextMenu
                nodeType={
                  nodes.find(n => n.id === nodeContextMenu.nodeId)?.type ||
                  'textBlock'
                }
                position={{ x: nodeContextMenu.x, y: nodeContextMenu.y }}
                onClose={() => setNodeContextMenu(null)}
                onSaveAsPreset={() =>
                  setSaveAsPresetNodeId(nodeContextMenu.nodeId)
                }
                onDuplicate={() => duplicateNodes()}
                onDisconnect={() => disconnectNodes([nodeContextMenu.nodeId])}
                onDelete={() => deleteSelectedNodes()}
              />
            )}
          </SafeReactFlowWrapper>

          <CanvasTipPanel
            key={canvasTipsForceKey}
            forceOpen={canvasTipsForceKey > 0}
            onDismiss={() => setCanvasTipsForceKey(0)}
            onOpenCommander={() => setIsCommanderOpen(true)}
            onStartTutorial={startTutorial}
          />

          {/* NodePalette - positioned outside ReactFlow */}
          <div style={{            position: 'absolute',            top: 0,            left: 0,            bottom: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'stretch'
          }}>
            <NodePalette
              collapsed={nodePaletteCollapsed}
              onCollapsedChange={setNodePaletteCollapsed}
            >
              {/* Footer buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {currentUser ? (
                  <button
                    className="palette-footer-button"
                    onClick={async () => {
                      const sb = getSupabase();
                      if (!sb) { return; }
                      await sb.auth.signOut();
                    }}
                    style={{
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.25) 100%)',
                      border: '1px solid rgba(230, 162, 60, 0.3)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                    title={currentUser?.email || ''}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M3 8a.5.5 0 0 1 .5-.5H10V5.707a.5.5 0 0 1 .854-.353l3 3a.5.5 0 0 1 0 .707l-3 3A.5.5 0 0 1 10 11.707V9.5H3.5A.5.5 0 0 1 3 9V8z"/>
                    </svg>
                    Sign out
                  </button>
                ) : (
                  <button
                    className="palette-footer-button"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                    }}
                    style={{
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.25) 100%)',
                      border: '1px solid rgba(230, 162, 60, 0.3)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Login
                  </button>
                )}
                <button
                  className="palette-footer-button prompt-wizard-button"
                  data-tutorial-anchor="wizard-button"
                  onClick={() => setIsPromptWizardOpen(true)}
                  style={{
                    padding: '10px 12px',
                    background: 'linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.25) 100%)',
                    border: '1px solid rgba(230, 162, 60, 0.3)',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                    <path d="M9.5 1L8 2.5 6.5 1 5 2.5 3.5 1 2 2.5 0.5 1v14l1.5-1.5L3.5 15 5 13.5 6.5 15 8 13.5 9.5 15l1.5-1.5L12.5 15l1.5-1.5L15.5 15V1l-1.5 1.5L12.5 1 11 2.5 9.5 1zM3 4h10v1H3V4zm0 3h10v1H3V7zm0 3h7v1H3v-1z"/>
                  </svg>
                  Wizard
                </button>
                <TutorialButton />
              </div>
            </NodePalette>
          </div>

          {/* Modals */}
          <GraphModals
            isPromptWizardOpen={isPromptWizardOpen}
            setIsPromptWizardOpen={setIsPromptWizardOpen}
            isAuthModalOpen={isAuthModalOpen}
            setIsAuthModalOpen={setIsAuthModalOpen}
            saveAsPresetNodeId={saveAsPresetNodeId}
            setSaveAsPresetNodeId={setSaveAsPresetNodeId}
            pendingWizardNodes={pendingWizardNodes}
            setPendingWizardNodes={setPendingWizardNodes}
            nodes={nodes}
            setNodes={setNodes}
            setEdges={setEdges}
            setCustomPresets={setCustomPresets}
            setCurrentUser={setCurrentUser}
          />

          <ComponentSaveDialog
            isOpen={Boolean(pendingComponentDraft)}
            draft={pendingComponentDraft}
            onClose={() => {
              setPendingComponentDraft(null);
              setPendingComponentSelection(null);
            }}
            onSave={handleSaveComponentDraft}
          />

          {/* Keyboard Shortcuts Display */}
          <KeyboardShortcuts />

          {/* History Palette */}
          {historyVisible && <HistoryPalette />}

          {/* Connection Toast */}
          <ConnectionToast
            message={activeToast}
            onDismiss={() => {
              if (activeToast) {
                dismissToast(activeToast.id);
              }
            }}
          />
        </div>
      </div>

      <GraphCommander
        isOpen={isCommanderOpen}
        onClose={() => setIsCommanderOpen(false)}
        commands={commandPaletteCommands}
      />

      {/* Preview Tray - As proper sibling that pushes content up */}
      {showPreview && (
        <div style={{ flexShrink: 0 }}>
          <PreviewTray
            results={previewResults}
            isExecuting={isPreviewExecuting}
            error={previewError}
            seeds={currentSeeds}
            onSeedsChange={updateSeeds}
            onExecute={() => {
              void executePreview();
            }}
            onExport={exportPreviewResults}
          />
        </div>
      )}

      {/* Tetris Mode */}
      {tetrisMode && (
        <NodeTetris
          onExit={() => {
            setTetrisMode(false);
            showToast('info', 'Exited Tetris mode');
          }}
          onScoreUpdate={() => void 0}
        />
      )}
    </div>
  );
}
