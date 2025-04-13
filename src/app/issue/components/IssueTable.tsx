'use client';

import { useMemo, useState, useEffect } from 'react';
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
import { DropDownMenuV2 } from '@/app/components/ui/dropdownMenu';
import { FilterConstructorPanel } from '@/app/property/components/filter-construction';
import {
    AppliedFilterWrapper,
    APPLIED_FILTER_COMPONENTS
} from '@/app/property/components/applied-filter';
import { FilterCondition } from '@/app/property/types';
import { PropertyType } from '@/app/property/constants';

import { DataTableToolbar } from '@/components/data-table-toolbar';
import { MdFilterList, MdClose } from 'react-icons/md';
export interface TableColumn {
    id: string;
    title: string;
    width?: number;
}

// 属性定义接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

export interface IssueTableProps {
    columns: TableColumn[];
    data: Record<string, unknown>[];
    renderHeader?: (column: TableColumn) => React.ReactNode;
    renderCell?: (column: TableColumn, rowData: Record<string, unknown>, rowIndex: number) => React.ReactNode;
    onRowClick?: (rowData: Record<string, unknown>) => void;
    // 新增：筛选器相关属性
    propertyDefinitions: PropertyDefinition[];
    activeFilters?: FilterCondition[];
    onFilterChange?: (filters: FilterCondition[]) => void;
}

// 表格框架组件
export const IssueTable: React.FC<IssueTableProps> = ({
    columns,
    data,
    renderCell = () => <span></span>,
    onRowClick,
    propertyDefinitions = [],
    activeFilters = [],
    onFilterChange,
}) => {
    // TODO tech dept 应该通过某种配置项来判断是否允许在表格里展示
    // 过滤掉描述属性和 label 属性属性
    const filteredColumns = useMemo(() => {
        return columns.filter(column => column.id !== SystemPropertyId.DESCRIPTION && column.id !== SystemPropertyId.LABEL);
    }, [columns]);

    // 筛选器相关状态
    const [selectedProperty, setSelectedProperty] = useState<PropertyDefinition | null>(null);
    const [localActiveFilters, setLocalActiveFilters] = useState<FilterCondition[]>(activeFilters);
    // 添加状态跟踪哪个过滤器正在被编辑
    const [editingFilter, setEditingFilter] = useState<string | null>(null);

    // 当父组件的 activeFilters 变化时，更新本地状态
    useEffect(() => {
        setLocalActiveFilters(activeFilters);
    }, [activeFilters]);

    // 当本地筛选条件变化并且有回调函数时，通知父组件
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(localActiveFilters);
        }
    }, [localActiveFilters, onFilterChange]);


    // 筛选条件应用回调
    const handleFilterApply = (filter: FilterCondition | null) => {
        if (filter) {
            // 如果已有同一属性的筛选条件，则替换它
            const existingFilterIndex = localActiveFilters.findIndex(f => f.propertyId === filter.propertyId);
            if (existingFilterIndex >= 0) {
                const newFilters = [...localActiveFilters];
                newFilters[existingFilterIndex] = filter;
                setLocalActiveFilters(newFilters);
            } else {
                // 否则添加新的筛选条件
                setLocalActiveFilters([...localActiveFilters, filter]);
            }
        }
        setSelectedProperty(null); // 关闭筛选面板
        setEditingFilter(null); // 关闭编辑面板
    };

    // 筛选条件取消回调
    const handleFilterCancel = () => {
        setSelectedProperty(null); // 关闭筛选面板
        setEditingFilter(null); // 关闭编辑面板
    };

    // 移除筛选条件
    const handleRemoveFilter = (filterId: string) => {
        setLocalActiveFilters(localActiveFilters.filter(f => f.propertyId !== filterId));
    };

    // 清除所有筛选条件
    const handleResetAllFilters = () => {
        setLocalActiveFilters([]);
        setSelectedProperty(null);
        setEditingFilter(null);
    };

    // 获取当前属性的筛选条件
    const getCurrentFilter = (propertyId: string): FilterCondition | null => {
        return localActiveFilters.find(f => f.propertyId === propertyId) || null;
    };

    // 获取属性定义
    const getPropertyDefinition = (propertyId: string): PropertyDefinition | null => {
        return propertyDefinitions.find(p => p.id === propertyId) || null;
    };

    // 筛选属性菜单项
    const filterMenuItems = propertyDefinitions
        // TODO: 暂不支持时间类型和富文本类型的筛选
        .filter(prop => prop.type !== PropertyType.DATETIME && prop.type !== PropertyType.RICH_TEXT)
        // 过滤掉已经应用过滤条件的属性
        .filter(prop => !localActiveFilters.some(filter => filter.propertyId === prop.id))
        .map(prop => ({
            label: (
                <div className="flex items-center">
                    <span>{prop.name}</span>
                </div>
            ),
            onClick: () => {
                setSelectedProperty(prop);
            }
        }));

    // 自定义筛选按钮
    const FilterButton = (
        <div
            className="flex items-center text-sm text-gray-700"
        >
            <MdFilterList size={16} className={`${localActiveFilters.length === 0 ? "mr-2" : ""} text-gray-500`} />
            {localActiveFilters.length === 0 && <span>Filter</span>}
        </div>
    );

    // 渲染已应用的筛选条件
    const renderAppliedFilters = () => {
        return localActiveFilters.map(filter => {
            const propertyDef = getPropertyDefinition(filter.propertyId);
            if (!propertyDef) return null;

            // 获取对应类型的筛选组件
            const FilterComponent = APPLIED_FILTER_COMPONENTS[propertyDef.type];
            if (!FilterComponent) return null;

            // 判断当前过滤器是否处于编辑状态
            const isEditing = editingFilter === filter.propertyId;

            return (
                <AppliedFilterWrapper
                    key={filter.propertyId}
                    filter={filter}
                    propertyDefinition={propertyDef}
                    onRemove={handleRemoveFilter}
                    FilterComponent={FilterComponent}
                    onClick={() => {
                        // 如果已经在编辑，则关闭编辑面板；否则，打开编辑面板
                        setEditingFilter(isEditing ? null : filter.propertyId);
                    }}
                >
                    {isEditing && (
                        <FilterConstructorPanel
                            propertyDefinition={propertyDef}
                            currentFilter={filter}
                            onApply={handleFilterApply}
                            onCancel={handleFilterCancel}
                            className="absolute left-0 top-[100%]"
                        />
                    )}
                </AppliedFilterWrapper>
            );
        });
    };

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
        enableColumnResizing: true, // TODO bug: not working, even the doc says it's supported
        initialState: {},
        getRowId: (row) => row[SystemPropertyId.ID] as string,
    });

    return (
        <div className="data-table-container">
            <DataTable table={table}>
                <div className="flex flex-row justify-between">
                    {/* 筛选器相关UI */}
                    <div className="flex flex-row items-center">
                        <div className="flex flex-row items-center mr-2">
                            {/* 显示已应用的筛选条件 */}
                            {renderAppliedFilters()}
                            {/* clear 按钮，当筛选条件数量大于等于 2 时显示 */}
                            {localActiveFilters.length >= 2 && (
                                <button
                                    onClick={handleResetAllFilters}
                                    className="flex items-center px-2 py-1 ml-1 mb-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <span className="mr-1">Clear</span>
                                    <MdClose size={16} />
                                </button>
                            )}
                        </div>
                        <div className="mr-2 mb-2 relative">
                            <DropDownMenuV2
                                entryLabel={FilterButton}
                                menuItems={filterMenuItems}
                                entryClassName="border border-gray-200 rounded"
                                menuClassName="w-64 bg-white border border-gray-200 rounded-md shadow-lg"
                            />
                            {/* 设置筛选条件的面板 */}
                            {selectedProperty && (
                                <FilterConstructorPanel
                                    propertyDefinition={selectedProperty}
                                    currentFilter={getCurrentFilter(selectedProperty.id)}
                                    onApply={handleFilterApply}
                                    onCancel={handleFilterCancel}
                                    className="absolute top-[100%] left-0"
                                />
                            )}
                        </div>

                    </div>
                    <DataTableToolbar table={table}>
                    </DataTableToolbar>
                </div>

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