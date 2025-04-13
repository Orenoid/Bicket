'use client';

import { useMemo } from 'react';
import React from 'react';
import {
    Column,
    ColumnDef,
    Row
} from '@tanstack/react-table';
import { SystemPropertyId } from '@/app/property/constants';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Text } from 'lucide-react';
import { DataTableToolbar } from '@/components/data-table-toolbar';

export interface TableColumn {
    id: string;
    title: string;
    width?: number;
}

export interface IssueTableProps {
    columns: TableColumn[];
    data: Record<string, unknown>[];
    renderHeader?: (column: TableColumn) => React.ReactNode;
    renderCell?: (column: TableColumn, rowData: Record<string, unknown>, rowIndex: number) => React.ReactNode;
    onRowClick?: (rowData: Record<string, unknown>) => void;
}

// 表格框架组件
export const IssueTable: React.FC<IssueTableProps> = ({
    columns,
    data,
    renderCell = () => <span></span>,
    onRowClick,
}) => {
    // TODO tech dept 应该通过某种配置项来判断是否允许在表格里展示
    // 过滤掉描述属性
    const filteredColumns = useMemo(() => {
        return columns.filter(column => column.id !== SystemPropertyId.DESCRIPTION);
    }, [columns]);

    // 把 props 的 columns 转换为 TanStack Table 的 ColumnDef
    const tanstackColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
        () => [
            ...filteredColumns.map(
                (column_) => ({
                    id: column_.id,
                    accessorKey: column_.id,
                    enableSorting: false,
                    // header: () => renderHeader(column),
                    header: ({ column }: { column: Column<Record<string, unknown>, unknown> }) => (
                        <DataTableColumnHeader className="cursor-pointer" column={column} title={column_.title} />
                    ),
                    cell: ({ row }: { row: Row<Record<string, unknown>> }) => (
                        <CellWrapper onClick={() => {
                            if (onRowClick) onRowClick(row.original);
                        }}>
                            {renderCell(column_, row.original, row.index)}
                        </CellWrapper>
                    ),
                    // TODO tech dept 支持拖拽调整列宽
                    // size: column_.id === SystemPropertyId.ASIGNEE || column_.id === SystemPropertyId.REPORTER ? 108 : undefined,
                    // size: 108,
                    meta: {
                        label: column_.title,
                        variant: "text" as const,
                        icon: Text,
                    },
                })
            ),
            // {
            //     id: 'actions',
            //     cell: ({ row }: { row: Row<Record<string, unknown>> }) => (
            //         <div className="hover:cursor-pointer hover:bg-gray-200 rounded-md p-1 bg-white" onClick={(e) => {
            //             e.stopPropagation(); // 阻止事件冒泡到行级别
            //             if (onRowClick) onRowClick(row.original);
            //         }}>
            //             <FiEdit className="text-gray-500 hover:text-gray-700" />
            //         </div>
            //     ),
            // }
        ], [filteredColumns, renderCell, onRowClick]
    )

    const { table } = useDataTable({
        data: data,
        columns: tanstackColumns,
        pageCount: 1,
        initialState: {},
        getRowId: (row) => row[SystemPropertyId.ID] as string,
    });

    return (
        <div className="data-table-container">
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>
    );
};

const CellWrapper = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return (
        <div className="hover:cursor-pointer" onClick={onClick}>
            {children}
        </div>
    );
};