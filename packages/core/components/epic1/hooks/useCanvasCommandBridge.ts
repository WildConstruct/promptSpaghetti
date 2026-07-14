/**
 * Canvas command bridge: commander open state, spawn position, window hooks (C3d).
 */
import { useCallback, useEffect, useState } from 'react';
import type { ReactFlowInstance } from 'reactflow';
import type { Preset } from '@prompt/asset-browser';

type Epic1Window = typeof window & {
  __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
  __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
  __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
  __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
  __EPIC1_ORGANIZE_NODES__?: (() => void) | null;
  __EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__?: (() => Promise<void>) | null;
};

export type UseCanvasCommandBridgeArgs = {
  reactFlowInstance: ReactFlowInstance | null;
  executePresetWithTarget: (preset: Preset) => void;
  getFragmentSuggestions: () => Promise<unknown[]>;
  handleOrganizeNodes: () => void;
  saveSelectedRegionBoxAsUserFragment: () => Promise<void>;
};

export function useCanvasCommandBridge({
  reactFlowInstance,
  executePresetWithTarget,
  getFragmentSuggestions,
  handleOrganizeNodes,
  saveSelectedRegionBoxAsUserFragment
}: UseCanvasCommandBridgeArgs) {
  const [isCommanderOpen, setIsCommanderOpen] = useState(false);

  const getCommandSpawnPosition = useCallback(() => {
    return reactFlowInstance
      ? reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        })
      : { x: 250, y: 250 };
  }, [reactFlowInstance]);

  useEffect(() => {
    const handleCommanderKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'c'
      ) {
        event.preventDefault();
        setIsCommanderOpen(true);
      }
    };

    window.addEventListener('keydown', handleCommanderKeyDown);
    return () => window.removeEventListener('keydown', handleCommanderKeyDown);
  }, []);

  useEffect(() => {
    const handleOpenCommander = () => setIsCommanderOpen(true);
    window.addEventListener('epic1:openCommander', handleOpenCommander);
    return () =>
      window.removeEventListener('epic1:openCommander', handleOpenCommander);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const win = window as Epic1Window;
    win.__EPIC1_REACT_FLOW__ = reactFlowInstance;
    win.__EPIC1_INSERT_PRESET__ = async (preset: unknown) => {
      executePresetWithTarget(preset as Preset);
    };
    win.__EPIC1_GET_FRAGMENT_SUGGESTIONS__ = getFragmentSuggestions;
    win.__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__ = null;

    return () => {
      if (win.__EPIC1_REACT_FLOW__ === reactFlowInstance) {
        win.__EPIC1_REACT_FLOW__ = null;
        win.__EPIC1_INSERT_PRESET__ = null;
        win.__EPIC1_GET_FRAGMENT_SUGGESTIONS__ = null;
        win.__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__ = null;
      }
    };
  }, [
    executePresetWithTarget,
    getFragmentSuggestions,
    reactFlowInstance
  ]);

  useEffect(() => {
    const win = window as Epic1Window;
    win.__EPIC1_ORGANIZE_NODES__ = handleOrganizeNodes;
    return () => {
      win.__EPIC1_ORGANIZE_NODES__ = null;
    };
  }, [handleOrganizeNodes]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const win = window as Epic1Window;
    win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ =
      saveSelectedRegionBoxAsUserFragment;

    return () => {
      if (
        win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ ===
        saveSelectedRegionBoxAsUserFragment
      ) {
        win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ = null;
      }
    };
  }, [saveSelectedRegionBoxAsUserFragment]);

  return {
    isCommanderOpen,
    setIsCommanderOpen,
    getCommandSpawnPosition
  };
}
