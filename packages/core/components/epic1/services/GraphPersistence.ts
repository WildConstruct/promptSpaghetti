import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { GraphConverter } from './GraphConverter';

const STORAGE_KEY = 'epic1-graph';
const AUTOSAVE_KEY = 'epic1-graph-autosave';
const HISTORY_KEY = 'epic1-graph-history';
const MAX_HISTORY_SIZE = 10;

export class GraphPersistence {
  /**
   * Save graph to localStorage
   */
  static save(nodes: Node<EditableNodeData>[], edges: Edge[]): boolean {
    try {
      const graphData = { nodes, edges, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(graphData));
      return true;
    } catch (error) {
      console.error('GraphPersistence: Failed to save graph:', error);
      return false;
    }
  }

  /**
   * Load graph from localStorage
   */
  static load(): { nodes: Node<EditableNodeData>[]; edges: Edge[] } | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);
      return { nodes: data.nodes, edges: data.edges };
    } catch (error) {
      console.error('GraphPersistence: Failed to load graph:', error);
      return null;
    }
  }

  /**
   * Auto-save graph (separate from manual save)
   */
  static autoSave(nodes: Node<EditableNodeData>[], edges: Edge[]): void {
    try {
      const graphData = { nodes, edges, timestamp: Date.now() };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(graphData));
    } catch (error) {
      console.error('GraphPersistence: Autosave failed:', error);
    }
  }

  /**
   * Load auto-saved graph
   */
  static loadAutoSave(): {
    nodes: Node<EditableNodeData>[];
    edges: Edge[];
  } | null {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);
      return { nodes: data.nodes, edges: data.edges };
    } catch (error) {
      console.error('GraphPersistence: Failed to load autosave:', error);
      return null;
    }
  }

  /**
   * Export graph to file
   */
  static exportToFile(
    nodes: Node<EditableNodeData>[],
    edges: Edge[],
    filename?: string
  ): void {
    const graphJson = GraphConverter.exportGraph(nodes, edges);
    const blob = new Blob([graphJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import graph from file
   */
  static async importFromFile(file: File): Promise<{
    nodes: Node<EditableNodeData>[];
    edges: Edge[];
  } | null> {
    try {
      const text = await file.text();
      return GraphConverter.importGraph(text);
    } catch (error) {
      console.error('GraphPersistence: Failed to import from file:', error);
      return null;
    }
  }

  /**
   * Save to history (for undo/redo)
   */
  static saveToHistory(nodes: Node<EditableNodeData>[], edges: Edge[]): void {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      const history = historyStr ? JSON.parse(historyStr) : [];

      // Add new state to history
      history.push({ nodes, edges, timestamp: Date.now() });

      // Keep only last N states
      if (history.length > MAX_HISTORY_SIZE) {
        history.shift();
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('GraphPersistence: Failed to save to history:', error);
    }
  }

  /**
   * Get history states
   */
  static getHistory(): Array<{
    nodes: Node<EditableNodeData>[];
    edges: Edge[];
    timestamp: number;
  }> {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error('GraphPersistence: Failed to get history:', error);
      return [];
    }
  }

  /**
   * Clear all saved data
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(HISTORY_KEY);
  }
}
