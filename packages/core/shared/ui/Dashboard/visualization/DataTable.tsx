/**
 * DataTable - Advanced table component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides sorting, filtering, pagination, and selection
 */
import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, Eye, MoreHorizontal } from 'lucide-react';
import './DataTable.css';

}
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;

}
export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onClick: (record: T, index: number) => void;
  disabled?: (record: T) => boolean;
  variant?: 'default' | 'primary' | 'danger';

}
export interface DataTableProps<T = any> {
  // Core data
  data: T;
  columns: TableColumn<T>[];
  // Pagination
  pagination?: {
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
} | false;
  // Selection
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: React.Key;
    onChange?: (selectedRowKeys: React.Key, selectedRows: T) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  // Actions
  actions?: TableAction<T>[];
  // Styling and behavior
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  // Row properties
  rowKey?: keyof T | ((record: T) => React.Key);
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T, index: number) => void;
  // Filtering and search
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilter?: boolean;
  // Export
  exportable?: boolean;
  exportFileName?: string;
  // Empty state
  emptyText?: string;
  className?: string;
type SortDirection = 'asc' | 'desc' | null;
}
interface SortConfig {
  key: string;
  direction: SortDirection;

export const DataTable = <T extends Record<string, any>>({)
  data,
  columns,
}
  pagination = { pageSize: 10 },
  rowSelection,
  actions,
  size = 'medium',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  rowKey = 'id',
  rowClassName,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search...',
  globalFilter = true,
  exportable = false,
  exportFileName = 'table-data',
  emptyText = 'No data available',
  className = ''
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination ? pagination.pageSize || 10 : data.length);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<React.Key>(rowSelection?.selectedRowKeys || []);
  // Get row key
  const getRowKey = (record: T, index: number): React.Key => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    return record[rowKey] || index;
  };
  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
  let filtered = [...data];
  // Global search
  if (searchTerm && globalFilter) {
  filtered = filtered.filter(record =>)
  Object.values(record).some(value =>)
  String(value).toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Column filters
  Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
  if (filterValue) {
  filtered = filtered.filter(record => {)
  const column = columns.find(col => col.key === columnKey);
  const value = column?.dataIndex ? record[column.dataIndex] : record[columnKey];
  return String(value).toLowerCase().includes(filterValue.toLowerCase());
});
    });
    return filtered;
  }, [data, searchTerm, columnFilters, globalFilter, columns]);
  // Sort data
  const sortedData = useMemo(() => {
  if (!sortConfig.key || !sortConfig.direction) {
  return filteredData;
  return [...filteredData].sort((a, b) => {
  const column = columns.find(col => col.key === sortConfig.key);
  const aValue = column?.dataIndex ? a[column.dataIndex] : a[sortConfig.key];
  const bValue = column?.dataIndex ? b[column.dataIndex] : b[sortConfig.key];
  if (aValue < bValue) {
  return sortConfig.direction === 'asc' ? -1 : 1;
  if (aValue > bValue) {
  return sortConfig.direction === 'asc' ? 1 : -1;
  return 0;
});
  }, [filteredData, sortConfig, columns]);
  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);
  // Pagination info
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;
  const startItem = pagination ? (currentPage - 1) * pageSize + 1 : 1;
  const endItem = pagination ? Math.min(currentPage * pageSize, sortedData.length) : sortedData.length;
  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;
    setSortConfig(current => {)
  if (current.key === columnKey) {
        if (current.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else if (current.direction === 'desc') {
          return { key: '', direction: null };
      return { key: columnKey, direction: 'asc' };
    });
  };
  // Handle row selection
  const handleRowSelection = (recordKey: React.Key, checked: boolean) => {
  if (!rowSelection) return;
  const newSelectedRows = checked;
  ? [...selectedRows, recordKey]
  : selectedRows.filter(key => key !== recordKey);
  setSelectedRows(newSelectedRows);
  if (rowSelection.onChange) {
  const selectedRecords = data.filter(record => ;);
  newSelectedRows.includes(getRowKey(record, data.indexOf(record)))
  );
  rowSelection.onChange(newSelectedRows, selectedRecords);
};
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
  if (!rowSelection) return;
  const allKeys = paginatedData.map((record, index) => getRowKey(record, index));
  const newSelectedRows = checked ? allKeys : [];
  setSelectedRows(newSelectedRows);
  if (rowSelection.onChange) {
  const selectedRecords = checked ? paginatedData : [];
  rowSelection.onChange(newSelectedRows, selectedRecords);
};
  // Export data
  const handleExport = () => {
    const csvContent = [;
      columns.map(col => col.title).join(','),
      ...sortedData.map(record =>)
        columns.map(col => {)
  const value = col.dataIndex ? record[col.dataIndex] : record[col.key];
          return `"${String(value).replace(/"/g, '""')}"`;}
        }).join(',')
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}.csv`;}
    link.click();
    URL.revokeObjectURL(url);
  };
  const isAllSelected = paginatedData.length > 0 && ;
    paginatedData.every(record => selectedRows.includes(getRowKey(record, data.indexOf(record))));
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;
  return;
    <div className={`data-table data-table-${size} ${className}`}>}
      {/* Toolbar */}
      {(searchable || exportable) && ()
        <div className="table-toolbar">
          <div className="toolbar-left">
            {searchable && ()
              <div className="search-input">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="toolbar-right">
            {exportable && ()
              <button 
                className="export-button"
                onClick={handleExport}
                disabled={sortedData.length === 0}
              >
                <Download size={16} />
                Export
              </button>
            )}
          </div>
        </div>
      )}
      {/* Table */}
      <div className={`table-container ${bordered ? 'bordered' : ''}`}>}
        <table className={`table ${striped ? 'striped' : ''} ${hoverable ? 'hoverable' : ''}`}>}
          <thead>
            <tr>
              {rowSelection && ()
                <th className="selection-column">
                  {rowSelection.type === 'checkbox' && ()
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  )}
                </th>
              )}
              {columns.map(column => ()
                <th
                  key={column.key}
                  className={`${column.className || ''} ${column.align ? `text-${column.align}` : ''}`}
                  style={{ width: column.width }}
                >
                  <div className="column-header">
                    <span className="column-title">{column.title}</span>
                    {column.sortable && ()
                      <button
                        className="sort-button"
                        onClick={() => handleSort(column.key)}
                      >
                        <ChevronUp 
                          size={14} 
                          className={sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'active' : ''} 
                        />
                        <ChevronDown 
                          size={14} 
                          className={sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'active' : ''} 
                        />
                      </button>
                    )}
                    {column.filterable && ()
                      <div className="filter-input">
                        <Filter size={14} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters[column.key] || ''}
                          onChange={(e) => setColumnFilters(prev => ({)
  ...prev,
  [column.key]: e.target.value,
}))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && ()
                <th className="actions-column">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? ()
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? ()
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="empty-state">{emptyText}</div>
                </td>
              </tr>
            ) : ()
              paginatedData.map((record, index) => {
                const recordKey = getRowKey(record, index);
                const isSelected = selectedRows.includes(recordKey);
                return;
                  <tr
                    key={recordKey}
                    className={`
                      ${isSelected ? 'selected' : ''}
                      ${rowClassName ? rowClassName(record, index) : ''}
                    `}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {rowSelection && ()
                      <td className="selection-column">
                        <input
                          type={rowSelection.type || 'checkbox'}
                          name={rowSelection.type === 'radio' ? 'row-selection' : undefined}
                          checked={isSelected}
                          onChange={(e) => handleRowSelection(recordKey, e.target.checked)}
                          disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                        />
                      </td>
                    )}
                    {columns.map(column => {)
  const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                      const cellContent = column.render ? column.render(value, record, index) : value;
                      return;
                        <td
                          key={column.key}
                          className={`${column.className || ''} ${column.align ? `text-${column.align}` : ''}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                    {actions && actions.length > 0 && ()
                      <td className="actions-column">
                        <div className="row-actions">
                          {actions.map(action => {)
  const Icon = action.icon;
                            const isDisabled = action.disabled?.(record);
                            return;
                              <button
                                key={action.key}
                                className={`action-button ${action.variant || 'default'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(record, index);
                                }}
                                disabled={isDisabled}
                                title={action.label}
                              >
                                {Icon ? <Icon size={16} /> : action.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
  }
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && totalPages > 1 && ()
        <div className="table-pagination">
          <div className="pagination-info">
            {pagination.showTotal && ()
              <span>
                Showing {startItem}-{endItem} of {sortedData.length} items
              </span>
            )}
          </div>
          <div className="pagination-controls">
            <button
              className="page-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => )
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 2
              .map((page, index, visiblePages) => ()
                <React.Fragment key={page}>
                  {index > 0 && visiblePages[index - 1] < page - 1 && ()
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`page-button ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="page-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
          {pagination.showSizeChanger && ()
            <div className="page-size-selector">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 20, 50, 100].map(size => ()
                  <option key={size} value={size}>
                    {size} per page
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

export default DataTable;