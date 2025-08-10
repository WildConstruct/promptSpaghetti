import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import './SupabaseDialogs.css';

interface SupabaseGraph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_public: boolean;
  tags?: string[];
  description?: string;
}

interface SupabaseOpenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  graphs: SupabaseGraph[];
  onLoad: (graph: SupabaseGraph) => void;
  onDelete?: (graphId: string) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  onLocalOpen: () => void;
}

export const SupabaseOpenDialog: React.FC<SupabaseOpenDialogProps> = ({
  isOpen,
  onClose,
  graphs,
  onLoad,
  onDelete,
  isLoading,
  isAuthenticated,
  onLocalOpen
}) => {
  const [selectedGraph, setSelectedGraph] = useState<SupabaseGraph | null>(
    null
  );
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGraphs = graphs.filter(graph => {
    // Apply filter
    if (filter === 'mine' && !graph.user_id) return false;
    if (filter === 'public' && !graph.is_public) return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        graph.name.toLowerCase().includes(query) ||
        graph.description?.toLowerCase().includes(query) ||
        graph.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="supabase-dialog-overlay" onClick={onClose}>
      <div className="supabase-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Open Graph</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-tabs">
          <button
            className={`tab-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Graphs
          </button>
          {isAuthenticated && (
            <button
              className={`tab-button ${filter === 'mine' ? 'active' : ''}`}
              onClick={() => setFilter('mine')}
            >
              My Graphs
            </button>
          )}
          <button
            className={`tab-button ${filter === 'public' ? 'active' : ''}`}
            onClick={() => setFilter('public')}
          >
            Community
          </button>
        </div>

        <div className="dialog-search">
          <input
            type="text"
            placeholder="Search graphs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="dialog-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading graphs...</p>
            </div>
          ) : filteredGraphs.length === 0 ? (
            <div className="empty-state">
              <p>No graphs found</p>
              {!isAuthenticated && (
                <p className="hint">Sign in to access your saved graphs</p>
              )}
            </div>
          ) : (
            <div className="graph-list">
              {filteredGraphs.map(graph => (
                <div
                  key={graph.id}
                  className={`graph-item ${selectedGraph?.id === graph.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGraph(graph)}
                  onDoubleClick={() => onLoad(graph)}
                >
                  <div className="graph-info">
                    <h3>{graph.name}</h3>
                    {graph.description && (
                      <p className="graph-description">{graph.description}</p>
                    )}
                    <div className="graph-meta">
                      <span className="date">
                        {new Date(graph.updated_at).toLocaleDateString()}
                      </span>
                      {graph.is_public && (
                        <span className="badge public">Public</span>
                      )}
                      {graph.user_id && isAuthenticated && (
                        <span className="badge mine">Mine</span>
                      )}
                      <span className="node-count">
                        {graph.nodes.length} nodes, {graph.edges.length} edges
                      </span>
                    </div>
                    {graph.tags && graph.tags.length > 0 && (
                      <div className="graph-tags">
                        {graph.tags.map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isAuthenticated && graph.user_id && onDelete && (
                    <button
                      className="delete-button"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(graph.id);
                      }}
                      title="Delete graph"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="button secondary" onClick={onLocalOpen}>
            Open Local File
          </button>
          <div className="footer-actions">
            <button className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() => selectedGraph && onLoad(selectedGraph)}
              disabled={!selectedGraph}
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
