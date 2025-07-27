import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DataTable - Advanced table component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides sorting, filtering, pagination, and selection
 */
import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download } from 'lucide-react';
import './DataTable.css';
export const DataTable = ({ data, columns, pagination = { pageSize: 10 }, rowSelection, actions, size = 'medium', bordered = false, striped = false, hoverable = true, loading = false, rowKey = 'id', rowClassName, onRowClick, searchable = true, searchPlaceholder = 'Search...', globalFilter = true, exportable = false, exportFileName = 'table-data', emptyText = 'No data available', className = '' }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(pagination ? pagination.pageSize || 10 : data.length);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [columnFilters, setColumnFilters] = useState({});
    const [selectedRows, setSelectedRows] = useState(rowSelection?.selectedRowKeys || []);
    // Get row key
    const getRowKey = (record, index) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return record[rowKey] || index;
    };
    // Filter data based on search and column filters
    const filteredData = useMemo(() => {
        let filtered = [...data];
        // Global search
        if (searchTerm && globalFilter) {
            filtered = filtered.filter(record => Object.values(record).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase())));
        }
        // Column filters
        Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
            if (filterValue) {
                filtered = filtered.filter(record => {
                    const column = columns.find(col => col.key === columnKey);
                    const value = column?.dataIndex ? record[column.dataIndex] : record[columnKey];
                    return String(value).toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });
        return filtered;
    }, [data, searchTerm, columnFilters, globalFilter, columns]);
    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) {
            return filteredData;
        }
        return [...filteredData].sort((a, b) => {
            const column = columns.find(col => col.key === sortConfig.key);
            const aValue = column?.dataIndex ? a[column.dataIndex] : a[sortConfig.key];
            const bValue = column?.dataIndex ? b[column.dataIndex] : b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredData, sortConfig, columns]);
    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination)
            return sortedData;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize, pagination]);
    // Pagination info
    const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;
    const startItem = pagination ? (currentPage - 1) * pageSize + 1 : 1;
    const endItem = pagination ? Math.min(currentPage * pageSize, sortedData.length) : sortedData.length;
    // Handle sorting
    const handleSort = (columnKey) => {
        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable)
            return;
        setSortConfig(current => {
            if (current.key === columnKey) {
                if (current.direction === 'asc') {
                    return { key: columnKey, direction: 'desc' };
                }
                else if (current.direction === 'desc') {
                    return { key: '', direction: null };
                }
            }
            return { key: columnKey, direction: 'asc' };
        });
    };
    // Handle row selection
    const handleRowSelection = (recordKey, checked) => {
        if (!rowSelection)
            return;
        const newSelectedRows = checked
            ? [...selectedRows, recordKey]
            : selectedRows.filter(key => key !== recordKey);
        setSelectedRows(newSelectedRows);
        if (rowSelection.onChange) {
            const selectedRecords = data.filter(record => newSelectedRows.includes(getRowKey(record, data.indexOf(record))));
            rowSelection.onChange(newSelectedRows, selectedRecords);
        }
    };
    // Handle select all
    const handleSelectAll = (checked) => {
        if (!rowSelection)
            return;
        const allKeys = paginatedData.map((record, index) => getRowKey(record, index));
        const newSelectedRows = checked ? allKeys : [];
        setSelectedRows(newSelectedRows);
        if (rowSelection.onChange) {
            const selectedRecords = checked ? paginatedData : [];
            rowSelection.onChange(newSelectedRows, selectedRecords);
        }
    };
    // Export data
    const handleExport = () => {
        const csvContent = [
            columns.map(col => col.title).join(','),
            ...sortedData.map(record => columns.map(col => {
                const value = col.dataIndex ? record[col.dataIndex] : record[col.key];
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exportFileName}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };
    const isAllSelected = paginatedData.length > 0 &&
        paginatedData.every(record => selectedRows.includes(getRowKey(record, data.indexOf(record))));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;
    return (_jsxs("div", { className: `data-table data-table-${size} ${className}`, children: [(searchable || exportable) && (_jsxs("div", { className: "table-toolbar", children: [_jsx("div", { className: "toolbar-left", children: searchable && (_jsxs("div", { className: "search-input", children: [_jsx(Search, { size: 16, className: "search-icon" }), _jsx("input", { type: "text", placeholder: searchPlaceholder, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })) }), _jsx("div", { className: "toolbar-right", children: exportable && (_jsxs("button", { className: "export-button", onClick: handleExport, disabled: sortedData.length === 0, children: [_jsx(Download, { size: 16 }), "Export"] })) })] })), _jsx("div", { className: `table-container ${bordered ? 'bordered' : ''}`, children: _jsxs("table", { className: `table ${striped ? 'striped' : ''} ${hoverable ? 'hoverable' : ''}`, children: [_jsx("thead", { children: _jsxs("tr", { children: [rowSelection && (_jsx("th", { className: "selection-column", children: rowSelection.type === 'checkbox' && (_jsx("input", { type: "checkbox", checked: isAllSelected, ref: input => {
                                                if (input)
                                                    input.indeterminate = isIndeterminate;
                                            }, onChange: (e) => handleSelectAll(e.target.checked) })) })), columns.map(column => (_jsx("th", { className: `${column.className || ''} ${column.align ? `text-${column.align}` : ''}`, style: { width: column.width }, children: _jsxs("div", { className: "column-header", children: [_jsx("span", { className: "column-title", children: column.title }), column.sortable && (_jsxs("button", { className: "sort-button", onClick: () => handleSort(column.key), children: [_jsx(ChevronUp, { size: 14, className: sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'active' : '' }), _jsx(ChevronDown, { size: 14, className: sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'active' : '' })] })), column.filterable && (_jsxs("div", { className: "filter-input", children: [_jsx(Filter, { size: 14 }), _jsx("input", { type: "text", placeholder: "Filter...", value: columnFilters[column.key] || '', onChange: (e) => setColumnFilters(prev => ({
                                                                ...prev,
                                                                [column.key]: e.target.value
                                                            })), onClick: (e) => e.stopPropagation() })] }))] }) }, column.key))), actions && actions.length > 0 && (_jsx("th", { className: "actions-column", children: "Actions" }))] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (rowSelection ? 1 : 0) + (actions ? 1 : 0), children: _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "loading-spinner" }), _jsx("span", { children: "Loading..." })] }) }) })) : paginatedData.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (rowSelection ? 1 : 0) + (actions ? 1 : 0), children: _jsx("div", { className: "empty-state", children: emptyText }) }) })) : (paginatedData.map((record, index) => {
                                const recordKey = getRowKey(record, index);
                                const isSelected = selectedRows.includes(recordKey);
                                return (_jsxs("tr", { className: `
                      ${isSelected ? 'selected' : ''}
                      ${rowClassName ? rowClassName(record, index) : ''}
                    `, onClick: () => onRowClick?.(record, index), children: [rowSelection && (_jsx("td", { className: "selection-column", children: _jsx("input", { type: rowSelection.type || 'checkbox', name: rowSelection.type === 'radio' ? 'row-selection' : undefined, checked: isSelected, onChange: (e) => handleRowSelection(recordKey, e.target.checked), disabled: rowSelection.getCheckboxProps?.(record)?.disabled }) })), columns.map(column => {
                                            const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                                            const cellContent = column.render ? column.render(value, record, index) : value;
                                            return (_jsx("td", { className: `${column.className || ''} ${column.align ? `text-${column.align}` : ''}`, children: cellContent }, column.key));
                                        }), actions && actions.length > 0 && (_jsx("td", { className: "actions-column", children: _jsx("div", { className: "row-actions", children: actions.map(action => {
                                                    const Icon = action.icon;
                                                    const isDisabled = action.disabled?.(record);
                                                    return (_jsx("button", { className: `action-button ${action.variant || 'default'}`, onClick: (e) => {
                                                            e.stopPropagation();
                                                            action.onClick(record, index);
                                                        }, disabled: isDisabled, title: action.label, children: Icon ? _jsx(Icon, { size: 16 }) : action.label }, action.key));
                                                }) }) }))] }, recordKey));
                            })) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "table-pagination", children: [_jsx("div", { className: "pagination-info", children: pagination.showTotal && (_jsxs("span", { children: ["Showing ", startItem, "-", endItem, " of ", sortedData.length, " items"] })) }), _jsxs("div", { className: "pagination-controls", children: [_jsx("button", { className: "page-button", onClick: () => setCurrentPage(1), disabled: currentPage === 1, children: "First" }), _jsx("button", { className: "page-button", onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)), disabled: currentPage === 1, children: "Previous" }), Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 2)
                                .map((page, index, visiblePages) => (_jsxs(React.Fragment, { children: [index > 0 && visiblePages[index - 1] < page - 1 && (_jsx("span", { className: "pagination-ellipsis", children: "..." })), _jsx("button", { className: `page-button ${page === currentPage ? 'active' : ''}`, onClick: () => setCurrentPage(page), children: page })] }, page))), _jsx("button", { className: "page-button", onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)), disabled: currentPage === totalPages, children: "Next" }), _jsx("button", { className: "page-button", onClick: () => setCurrentPage(totalPages), disabled: currentPage === totalPages, children: "Last" })] }), pagination.showSizeChanger && (_jsx("div", { className: "page-size-selector", children: _jsx("select", { value: pageSize, onChange: (e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }, children: [10, 20, 50, 100].map(size => (_jsxs("option", { value: size, children: [size, " per page"] }, size))) }) }))] }))] }));
};
export default DataTable;
