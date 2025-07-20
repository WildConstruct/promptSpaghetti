/**
 * Epic 9.2.1 - Workspace List Component
 * Displays list of user's workspaces with search and filtering
 */

import React, { useState, useMemo } from 'react';
import { WorkspaceWithMembership } from '../../types/workspace';

interface WorkspaceListProps {
  workspaces: WorkspaceWithMembership[];
  selectedWorkspace: WorkspaceWithMembership | null;
  onWorkspaceSelect: (workspace: WorkspaceWithMembership) => void;
  loading?: boolean;
}

export const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  selectedWorkspace,
  onWorkspaceSelect,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'owner' | 'member'>('all');

  const filteredWorkspaces = useMemo(() => {
    let filtered = workspaces;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(workspace =>
        workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(workspace => {
        if (filterBy === 'owner') {
          return workspace.owner_id === workspace.membership?.user_id;
        } else if (filterBy === 'member') {
          return workspace.owner_id !== workspace.membership?.user_id;
        }
        return true;
      });
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [workspaces, searchTerm, filterBy]);

  if (loading) {
    return (
      <div className="workspace-list workspace-list--loading">
        <div className="workspace-list__header">
          <h3>Loading workspaces...</h3>
        </div>
        <div className="workspace-list__skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="workspace-item workspace-item--skeleton">
              <div className="workspace-item__avatar"></div>
              <div className="workspace-item__content">
                <div className="workspace-item__name"></div>
                <div className="workspace-item__description"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-list">
      <div className="workspace-list__header">
        <h3>Your Workspaces ({workspaces.length})</h3>
        
        <div className="workspace-list__search">
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="workspace-list__filters">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All workspaces</option>
            <option value="owner">Owned by me</option>
            <option value="member">Member of</option>
          </select>
        </div>
      </div>

      <div className="workspace-list__items">
        {filteredWorkspaces.length === 0 ? (
          <div className="workspace-list__empty">
            {searchTerm || filterBy !== 'all' ? (
              <p>No workspaces match your filters.</p>
            ) : (
              <p>You don't have any workspaces yet. Create one to get started!</p>
            )}
          </div>
        ) : (
          filteredWorkspaces.map(workspace => (
            <WorkspaceItem
              key={workspace.id}
              workspace={workspace}
              isSelected={selectedWorkspace?.id === workspace.id}
              onSelect={() => onWorkspaceSelect(workspace)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface WorkspaceItemProps {
  workspace: WorkspaceWithMembership;
  isSelected: boolean;
  onSelect: () => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  isSelected,
  onSelect
}) => {
  const isOwner = workspace.owner_id === workspace.membership?.user_id;
  const memberCount = 1; // TODO: Get actual member count from API

  return (
    <div
      className={`workspace-item ${isSelected ? 'workspace-item--selected' : ''}`}
      onClick={onSelect}
    >
      <div className="workspace-item__avatar">
        {workspace.name.charAt(0).toUpperCase()}
      </div>
      
      <div className="workspace-item__content">
        <div className="workspace-item__header">
          <h4 className="workspace-item__name">{workspace.name}</h4>
          <div className="workspace-item__badges">
            {isOwner && (
              <span className="badge badge--owner">Owner</span>
            )}
          </div>
        </div>
        
        {workspace.description && (
          <p className="workspace-item__description">
            {workspace.description.length > 60
              ? `${workspace.description.substring(0, 60)}...`
              : workspace.description
            }
          </p>
        )}
        
        <div className="workspace-item__meta">
          <span className="workspace-item__members">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
          <span className="workspace-item__activity">
            Updated {new Date(workspace.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceList;