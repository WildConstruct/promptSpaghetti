/**
 * DataTable - Advanced table component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides sorting, filtering, pagination, and selection
 */
import React from 'react';
import './DataTable.css';
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
    icon?: React.ComponentType<{
        size?: number;
        className?: string;
    }>;
    onClick: (record: T, index: number) => void;
    disabled?: (record: T) => boolean;
    variant?: 'default' | 'primary' | 'danger';
}
export interface DataTableProps<T = any> {
    data: T;
    columns: TableColumn<T>[];
    pagination?: {
        pageSize?: number;
        showSizeChanger?: boolean;
        showQuickJumper?: boolean;
        showTotal?: boolean;
    } | false;
    rowSelection?: {
        type?: 'checkbox' | 'radio';
        selectedRowKeys?: React.Key;
        onChange?: (selectedRowKeys: React.Key, selectedRows: T) => void;
        getCheckboxProps?: (record: T) => {
            disabled?: boolean;
        };
    };
    actions?: TableAction<T>[];
    size?: 'small' | 'medium' | 'large';
    bordered?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    loading?: boolean;
    rowKey?: keyof T | ((record: T) => React.Key);
    rowClassName?: (record: T, index: number) => string;
    onRowClick?: (record: T, index: number) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    globalFilter?: boolean;
    exportable?: boolean;
    exportFileName?: string;
    emptyText?: string;
    className?: string;
}
export declare const DataTable: <T extends Record<string, any>>({}: {}) => any, columns: any, pagination: {
    pageSize: number;
}, rowSelection: any, actions: any, size = "medium", bordered = false, striped = false, hoverable = true, loading = false, rowKey = "id", rowClassName: any, onRowClick: any, searchable = true, searchPlaceholder = "Search...", globalFilter = true, exportable = false, exportFileName = "table-data", emptyText = "No data available", className = "";
export default DataTable;
//# sourceMappingURL=DataTable.d.ts.map