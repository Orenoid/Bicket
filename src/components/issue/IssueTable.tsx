'use client';

import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import {
  Column,
  ColumnDef,
  Row
} from '@tanstack/react-table';
import { SystemPropertyId } from '@/lib/property/constants';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/shadcn/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shadcn/data-table/data-table-column-header';
import { DropDownMenuV2 } from '@/components/ui/dropdownMenu';
import { FilterConstructorPanel } from '@/components/property/filter-construction';
import {
  AppliedFilterWrapper,
  APPLIED_FILTER_COMPONENTS
} from '@/components/property/applied-filter';
import { FilterCondition } from '@/lib/property/types';
import { PropertyType } from '@/lib/property/constants';

import { DataTableToolbar } from '@/components/shadcn/data-table/data-table-toolbar';
import { MdFilterList, MdClose } from 'react-icons/md';
import './IssueTable.css';
import { DataTableSortList } from '@/components/shadcn/data-table/data-table-sort-list';

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
    pageCount?: number; // 总页数
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
    pageCount = 1, // 默认为1页
}) => {
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
                    enableSorting: [
                        SystemPropertyId.ID, SystemPropertyId.TITLE,
                    ].includes(column_.id as SystemPropertyId),
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
        pageCount: pageCount,
        initialState: {
            sorting: [{ id: SystemPropertyId.ID, desc: true }],
        },
        getRowId: (row) => row[SystemPropertyId.ID] as string,
    });

    return (
        <div className="data-table-container h-full">
            <DataTable table={table} className="h-full">
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
                        <DataTableSortList table={table} align="end" />
                    </DataTableToolbar>
                </div>

            </DataTable>
        </div>
    );
};

// 添加这个自定义的比较函数来决定何时重新渲染
function areEqual(prevProps: IssueTableProps, nextProps: IssueTableProps) {
    // 检查基本属性是否相等
    const renderCellEqual = prevProps.renderCell === nextProps.renderCell;
    const onRowClickEqual = prevProps.onRowClick === nextProps.onRowClick;
    const propertyDefinitionsEqual = prevProps.propertyDefinitions === nextProps.propertyDefinitions;
    const pageCountEqual = prevProps.pageCount === nextProps.pageCount;
    
    // 比较 columns 数组
    let columnsEqual = prevProps.columns.length === nextProps.columns.length;
    if (columnsEqual) {
        for (let i = 0; i < prevProps.columns.length; i++) {
            const prevColumn = prevProps.columns[i];
            const nextColumn = nextProps.columns[i];
            if (prevColumn.id !== nextColumn.id || prevColumn.title !== nextColumn.title) {
                columnsEqual = false;
                break;
            }
        }
    }
    
    // 比较 data 数组
    let dataEqual = prevProps.data.length === nextProps.data.length;
    if (dataEqual) {
        for (let i = 0; i < prevProps.data.length; i++) {
            const prevItem = prevProps.data[i];
            const nextItem = nextProps.data[i];
            
            // 首先检查对象引用是否相同
            if (prevItem !== nextItem) {
                // 如果对象引用不同，尝试比较 ID (用 SystemPropertyId.ID 或 'issue_id')
                const prevId = prevItem[SystemPropertyId.ID] || prevItem['issue_id'];
                const nextId = nextItem[SystemPropertyId.ID] || nextItem['issue_id'];
                
                if (prevId !== nextId) {
                    dataEqual = false;
                    break;
                }
            }
        }
    }
    
    const basicPropsEqual = 
        dataEqual &&
        columnsEqual &&
        renderCellEqual &&
        onRowClickEqual &&
        propertyDefinitionsEqual &&
        pageCountEqual;
    
    // 如果基本属性不相等，返回 false（需要重新渲染）
    if (!basicPropsEqual) {
        return false;
    }
    
    // 检查 activeFilters 是否相等
    if (prevProps.activeFilters?.length !== nextProps.activeFilters?.length) {
        return false;
    }
    
    // 详细比较 activeFilters 中的每个元素
    if (prevProps.activeFilters && nextProps.activeFilters) {
        for (let i = 0; i < prevProps.activeFilters.length; i++) {
            const prevFilter = prevProps.activeFilters[i];
            const nextFilter = nextProps.activeFilters[i];
            
            if (
                prevFilter.propertyId !== nextFilter.propertyId ||
                prevFilter.propertyType !== nextFilter.propertyType ||
                prevFilter.operator !== nextFilter.operator ||
                JSON.stringify(prevFilter.value) !== JSON.stringify(nextFilter.value)
            ) {
                return false;
            }
        }
    }
    
    // 如果所有检查都通过，返回 true（不需要重新渲染）
    return true;
}

// 使用 React.memo 包装组件以避免不必要的重新渲染
// 同时保留命名导出
const MemoizedIssueTable = React.memo(IssueTable, areEqual);
export default MemoizedIssueTable;
const CellWrapper = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return (
        <div className="hover:cursor-pointer w-full h-full" onClick={onClick}>
            {children}
        </div>
    );
};
