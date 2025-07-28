/**
 * AdminTable - Reusable table component with sorting, filtering, and pagination
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides consistent table functionality across admin interfaces
 */
import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import { LoadingSpinner, EmptyState } from './LoadingStates';
import './AdminTable.css';

export interface TableColumn<T = any> {
  key: string;,
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: Array<{ label: string; value: any }>;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';

export interface TableAction<T = any> {
  key: string;,
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  danger?: boolean;
  confirmation?: {
  title: string;,
  description: string;
};
interface AdminTableProps<T = any> {
  columns: TableColumn<T>[];,
  data: T;
  loading?: boolean;
  error?: string | null;
  rowKey?: keyof T | ((record: T) => string);
  // Selection
  selectable?: boolean;
  selectedRows?: T;
  onSelectionChange?: (selectedRows: T) => void;
  // Pagination
  pagination?: {,
  current: number;,
  pageSize: number;
  total: number;,
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number;
};
  // Sorting
  sortable?: boolean;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  // Filtering
  filterable?: boolean;
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  // Actions
  actions?: TableAction<T>[];
  bulkActions?: Array<{
    key: string;,
  label: string;
    icon?: React.ComponentType<{ size?: number }>;
    onClick: (selectedRows: T) => void;
    danger?: boolean;
  }>;
  // Styling
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  striped?: boolean;
  sticky?: boolean;
  // Empty state
  emptyText?: string;
  emptyAction?: {
  label: string;,
  onClick: () => void;
};
  className?: string;

export const AdminTable = <T extends Record<string, any> = any>({)
  columns,
  data,
  loading = false,
  error = null,
  rowKey = 'id',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  sortable = true,
  defaultSort,
  onSort,
  filterable = true,
  filters = {},
  onFilterChange,
  actions = [],
  bulkActions = [],
  size = 'medium',
  bordered = true,
  striped = true,
  sticky = false,
  emptyText = 'No data available',
  emptyAction,
  className = ''
}: AdminTableProps<T>) => {
  const [localSort, setLocalSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>()
    defaultSort || null
  );
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
  const [showFilters, setShowFilters] = useState(false);
  // Get row key value
  const getRowKey = useCallback((record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    return String(record[rowKey] || index);
  }, [rowKey]);
  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!sortable) return;
    const newDirection = ;
      localSort?.key === columnKey && localSort.direction === 'asc' ? 'desc' : 'asc';
    const newSort = { key: columnKey, direction: newDirection };
    setLocalSort(newSort);
    if (onSort) {
      onSort(columnKey, newDirection);
  }, [sortable, localSort, onSort]);
  // Handle filter change
  const handleFilterChange = useCallback((columnKey: string, value: any) => {
    const newFilters = { ...localFilters, [columnKey]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);
  // Handle selection
  const handleRowSelect = useCallback((record: T, selected: boolean) => {
  if (!onSelectionChange) return;
  const recordKey = getRowKey(record, 0);
  let newSelection: T;
  if (selected) {
  newSelection = [...selectedRows, record];
} else {
      newSelection = selectedRows.filter(row => getRowKey(row, 0) !== recordKey);
    onSelectionChange(newSelection);
  }, [selectedRows, onSelectionChange, getRowKey]);
  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!onSelectionChange) return;
    if (selected) {
      onSelectionChange(data);
    } else {
      onSelectionChange([]);
  }, [data, onSelectionChange]);
  // Check if row is selected
  const isRowSelected = useCallback((record: T): boolean => {
    const recordKey = getRowKey(record, 0);
    return selectedRows.some(row => getRowKey(row, 0) === recordKey);
  }, [selectedRows, getRowKey]);
  // Filter and sort data locally if no external handlers
  const processedData = useMemo(() => {
    let result = [...data];
    // Apply filters if no external filter handler
    if (!onFilterChange && Object.keys(localFilters).length > 0) {
      result = result.filter(record => {)
  return Object.entries(localFilters).every(([key, value]) => {
          if (!value) return true;
          const recordValue = record[key];
          if (typeof value === 'string') {
            return String(recordValue).toLowerCase().includes(value.toLowerCase());
          return recordValue === value;
        });
      });
    // Apply sorting if no external sort handler
    if (!onSort && localSort) {
  result.sort((a, b) => {
  const aValue = a[localSort.key];
  const bValue = b[localSort.key];
  if (aValue < bValue) return localSort.direction === 'asc' ? -1 : 1;
  if (aValue > bValue) return localSort.direction === 'asc' ? 1 : -1;
  return 0;
});
    return result;
  }, [data, localFilters, localSort, onFilterChange, onSort]);
  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (!sortable) return null;
    const isActive = localSort?.key === columnKey;
    const direction = localSort?.direction;
    return;
      <span className="sort-icon">
        {isActive ? ()
          direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : ()
          <span className="sort-icon-inactive">
            <ChevronUp size={12} />
            <ChevronDown size={12} />
          </span>
        )}
      </span>
    );
  };
  // Render filter input
  const renderFilter = (column: TableColumn<T>) => {
    if (!column.filterable) return null;
    const value = localFilters[column.key] || '';
    if (column.filterType === 'select' && column.filterOptions) {
      return;
        <select
          value={value}
          onChange={(e) => handleFilterChange(column.key, e.target.value)}
          className="filter-select"
        >
          <option value="">All</option>
          {column.filterOptions.map(option => ()
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    return;
      <input
        type={column.filterType === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => handleFilterChange(column.key, e.target.value)}
        placeholder={`Filter ${column.title.toLowerCase()}...`}
        className="filter-input"
      />
    );
  };
  // Loading state
  if (loading && data.length === 0) {
    return;
      <div className={`admin-table-container ${className}`}>}
        <LoadingSpinner message="Loading data..." />
      </div>
    );
  // Error state
  if (error && data.length === 0) {
    return;
      <div className={`admin-table-container ${className}`}>}
        <div className="table-error">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  // Empty state
  if (processedData.length === 0 && !loading) {
    return;
      <div className={`admin-table-container ${className}`}>}
        <EmptyState
          title={emptyText}
          description="Try adjusting your filters or search criteria."
          action={emptyAction}
        />
      </div>
    );
  const hasSelection = selectable && selectedRows.length > 0;
  const allSelected = selectedRows.length === data.length;
  const indeterminate = selectedRows.length > 0 && selectedRows.length < data.length;
  return;
    <div className={`admin-table-container ${className}`}>}
      {/* Bulk Actions */}
      {hasSelection && bulkActions.length > 0 && ()
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="bulk-action-buttons">
            {bulkActions.map(action => ()
              <button
                key={action.key}
                onClick={() => action.onClick(selectedRows)}
                className={`bulk-action-btn ${action.danger ? 'danger' : ''}`}
              >
                {action.icon && <action.icon size={16} />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Filters Toggle */}
      {filterable && ()
        <div className="table-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      )}
      {/* Table */}
      <div className={`table-wrapper ${sticky ? 'sticky' : ''}`}>}
        <table 
          className={`admin-table size-${size} ${bordered ? 'bordered' : ''} ${striped ? 'striped' : ''}`}
        >
          <thead>
            {/* Filter Row */}
            {showFilters && filterable && ()
              <tr className="filter-row">
                {selectable && <th className="select-cell"></th>}
                {columns.map(column => ()
                  <th key={column.key} className="filter-cell">
                    {renderFilter(column)}
                  </th>
                ))}
                {actions.length > 0 && <th className="actions-cell"></th>}
              </tr>
            )}
            {/* Header Row */}
            <tr>
              {selectable && ()
                <th className="select-cell">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = indeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map(column => ()
                <th
                  key={column.key}
                  className={`column-header ${column.sortable && sortable ? 'sortable' : ''} ${column.align ? `align-${column.align}` : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable ? handleSort(column.key) : undefined}
                >
                  <div className="header-content">
                    <span>{column.title}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && ()
                <th className="actions-cell">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {processedData.map((record, index) => ()
              <tr key={getRowKey(record, index)} className="table-row">
                {selectable && ()
                  <td className="select-cell">
                    <input
                      type="checkbox"
                      checked={isRowSelected(record)}
                      onChange={(e) => handleRowSelect(record, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map(column => ()
                  <td
                    key={column.key}
                    className={`table-cell ${column.align ? `align-${column.align}` : ''}`}
                  >
                    {column.render
                      ? column.render()
                          column.dataIndex ? record[column.dataIndex] : record,
                          record,
                          index
                      : column.dataIndex
                      ? String(record[column.dataIndex] || '')
                      : ''
                  </td>
                ))}
                {actions.length > 0 && ()
                  <td className="actions-cell">
                    <div className="row-actions">
                      {actions.map(action => ()
                        <button
                          key={action.key}
                          onClick={() => action.onClick(record)}
                          disabled={action.disabled?.(record)}
                          className={`action-btn ${action.danger ? 'danger' : ''}`}
                          title={action.label}
                        >
                          {action.icon ? <action.icon size={16} /> : action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && ()
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => pagination.onChange(1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="pagination-btn"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="page-info">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => pagination.onChange(Math.ceil(pagination.total / pagination.pageSize), pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="pagination-btn"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
          {pagination.showSizeChanger && pagination.pageSizeOptions && ()
            <div className="page-size-selector">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onChange(1, Number(e.target.value))}
              >
                {pagination.pageSizeOptions.map(size => ()
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTable;