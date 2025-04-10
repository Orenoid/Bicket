'use client';

import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender
} from '@tanstack/react-table';
import { SystemPropertyId } from '@/app/property/constants';

export interface TableColumn {
    id: string;
    title: string;
    width?: number;
    minWidth?: number;
}

// 自定义列元数据类型，用于存储表格列的额外信息
interface CustomColumnMeta {
    width: string;  // 列的宽度，以字符串形式存储（如"150px"）
    originalColumn: TableColumn;  // 原始的列定义，保留原始配置信息
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
    renderHeader = (col) => col.title, 
    renderCell = () => null,
    onRowClick
}) => {
    // TODO tech dept 应该通过某种配置项来判断是否允许在表格里展示
    // 过滤掉描述属性
    const filteredColumns = useMemo(() => {
        return columns.filter(column => column.id !== SystemPropertyId.DESCRIPTION);
    }, [columns]);

    // 处理列宽
    const getColumnWidth = (column: TableColumn) => {
        return column.width ? `${column.width}px` : column.minWidth ? `${column.minWidth}px` : '150px';
    };

    // 使用 useState 和 useEffect 跟踪表格容器和视口高度
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [needScroll, setNeedScroll] = useState(false);

    // 计算表格是否需要滚动
    useEffect(() => {
        if (!containerRef) return;
        
        const calculateNeedScroll = () => {
            // 获取表格内容的高度
            const tableHeight = containerRef.scrollHeight;
            // 获取视口高度（减去一些外边距，这里用200px作为页面其他元素的预留空间）
            const viewportHeight = window.innerHeight - 200;
            
            // 如果表格高度大于视口高度，则需要滚动
            setNeedScroll(tableHeight > viewportHeight);
        };
        
        // 初始计算
        calculateNeedScroll();
        
        // 监听窗口大小变化
        window.addEventListener('resize', calculateNeedScroll);
        
        // 清理函数
        return () => {
            window.removeEventListener('resize', calculateNeedScroll);
        };
    }, [containerRef, data.length]);
    
    // 根据是否需要滚动确定样式
    const tableStyles = needScroll 
        ? { maxHeight: `calc(100vh - 200px)` } // 数据多时限制高度并允许滚动，使用 vh 单位根据视口高度计算
        : {}; // 数据少时自动适应内容高度

    // 将我们的列格式转换为TanStack Table需要的格式
    const tableColumns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
        return filteredColumns.map((column) => ({
            id: column.id,
            accessorKey: column.id,
            header: () => renderHeader(column),
            cell: ({ row }) => renderCell(column, row.original, row.index),
            meta: {
                width: getColumnWidth(column),
                originalColumn: column,
            } as CustomColumnMeta,
        }));
    }, [filteredColumns, renderHeader, renderCell]);

    // 初始化TanStack Table
    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div 
            ref={setContainerRef}
            className={`overflow-auto border border-gray-200 rounded-lg ${!needScroll ? 'overflow-visible' : ''}`} 
            style={tableStyles}
        >
            <div className="min-w-full inline-block align-middle">
                <div className={needScroll ? 'overflow-hidden' : ''}>
                    <table className="min-w-full border-collapse table-fixed">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header, colIndex) => (
                                        <th 
                                            key={header.id}
                                            className={`relative px-2 py-2 text-left text-sm font-semibold text-gray-700 ${colIndex > 0 ? 'border-l border-gray-200' : ''}`}
                                            style={{ width: (header.column.columnDef.meta as CustomColumnMeta)?.width }}
                                        >
                                            <div className="flex items-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <tr 
                                    key={row.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell, colIndex) => (
                                        <td 
                                            key={cell.id}
                                            className={`px-2 py-2 text-sm text-gray-500 truncate ${colIndex > 0 ? 'border-l border-gray-200' : ''}`}
                                            style={{ 
                                                width: (cell.column.columnDef.meta as CustomColumnMeta)?.width,
                                                height: '35px'
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}; 