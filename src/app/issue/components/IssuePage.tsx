'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IssueTable, TableColumn } from './IssueTable';
import {
    PROPERTY_HEADER_COMPONENTS,
    PROPERTY_CELL_COMPONENTS
} from '../../property/components/table';
import { FilterCondition } from '@/app/property/types';
import { FiFilter } from 'react-icons/fi';
import { DropDownMenuV2 } from '../../components/ui/dropdownMenu';
import { FilterConstructorPanel } from '@/app/property/components/filter-construction';
import {
    AppliedFilterWrapper,
    APPLIED_FILTER_COMPONENTS
} from '@/app/property/components/applied-filter';

// 数据类型
export interface PropertyValue {
    property_id: string;
    property_type: string;
    value: unknown;
}

export interface Issue {
    issue_id: number;
    property_values: PropertyValue[];
}

// 属性定义接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

interface IssuePageProps {
    issues: Issue[];
    propertyDefinitions: PropertyDefinition[];
}

// 序列化筛选条件为URL参数字符串
function serializeFilters(filters: FilterCondition[]): string {
    if (!filters.length) return '';

    return filters.map(filter => {
        // 根据值类型进行序列化处理
        let valueStr: string;
        if (Array.isArray(filter.value)) {
            valueStr = filter.value.join(',');
        } else if (filter.value === null) {
            valueStr = 'null';
        } else {
            valueStr = String(filter.value);
        }
        
        return `${filter.propertyId}:${filter.propertyType}:${filter.operator}:${encodeURIComponent(valueStr)}`;
    }).join(';');
}

export function IssuePage({ issues, propertyDefinitions }: IssuePageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // 当前选中的属性（用于显示筛选面板）
    const [selectedProperty, setSelectedProperty] = useState<PropertyDefinition | null>(null);

    // 筛选按钮引用
    const filterButtonRef = useRef<HTMLDivElement>(null);
    // 筛选面板位置状态
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
    // 活跃的筛选条件
    const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
    
    // 当按钮引用或选中属性改变时，更新面板位置
    useEffect(() => {
        if (filterButtonRef.current && selectedProperty) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            setPanelPosition({
                top: rect.height + 4, // 按钮底部 + 间距
                left: 0
            });
        }
    }, [selectedProperty]);
    
    // 当筛选条件变化时，更新URL
    useEffect(() => {
        const serialized = serializeFilters(activeFilters);
        
        // 构建新的 URL 查询参数
        const params = new URLSearchParams(searchParams);
        if (serialized) {
            params.set('filters', serialized);
        } else {
            params.delete('filters');
        }
        
        // 更新 URL，不触发页面刷新
        router.push(`?${params.toString()}`, { scroll: false });
    }, [activeFilters, router, searchParams]);
    
    // 筛选条件应用回调
    const handleFilterApply = (filter: FilterCondition | null) => {
        if (filter) {
            // 如果已有同一属性的筛选条件，则替换它
            const existingFilterIndex = activeFilters.findIndex(f => f.propertyId === filter.propertyId);
            if (existingFilterIndex >= 0) {
                const newFilters = [...activeFilters];
                newFilters[existingFilterIndex] = filter;
                setActiveFilters(newFilters);
            } else {
                // 否则添加新的筛选条件
                setActiveFilters([...activeFilters, filter]);
            }
        }
        setSelectedProperty(null); // 关闭筛选面板
    };
    
    // 筛选条件取消回调
    const handleFilterCancel = () => {
        setSelectedProperty(null); // 关闭筛选面板
    };
    
    // 移除筛选条件
    const handleRemoveFilter = (filterId: string) => {
        setActiveFilters(activeFilters.filter(f => f.propertyId !== filterId));
    };
    
    // 获取当前属性的筛选条件
    const getCurrentFilter = (propertyId: string): FilterCondition | null => {
        return activeFilters.find(f => f.propertyId === propertyId) || null;
    };

    // 表格列定义
    const columns: TableColumn[] = propertyDefinitions.map(prop => ({
        id: prop.id,
        title: prop.name,
        minWidth: prop.id === 'id' ? 80 : prop.id === 'title' ? 200 : 120
    }));

    // 获取行中特定属性的值
    const getPropertyValue = (issue: Issue, propertyId: string): PropertyValue | null => {
        return issue.property_values.find(p => p.property_id === propertyId) || null;
    };

    // 获取属性定义
    const getPropertyDefinition = (propertyId: string): PropertyDefinition | null => {
        return propertyDefinitions.find(p => p.id === propertyId) || null;
    };


    // 渲染表头
    const renderHeader = (column: TableColumn) => {
        const propertyDef = getPropertyDefinition(column.id);
        if (!propertyDef) return column.title;
        
        // 从映射中获取对应的表头组件
        const HeaderComponent = PROPERTY_HEADER_COMPONENTS[propertyDef.type];
        if (!HeaderComponent) return column.title;
        
        // 渲染表头组件
        return (
            <HeaderComponent
                propertyID={propertyDef.id}
                propertyType={propertyDef.type}
                propertyName={column.title}
                propertyConfig={propertyDef.config}
            />
        );
    };

    // 渲染单元格
    const renderCell = (column: TableColumn, row: Record<string, unknown>) => {
        const issue = row as unknown as Issue;
        const propertyValue = getPropertyValue(issue, column.id);
        if (!propertyValue) return '';
        
        const propertyDef = getPropertyDefinition(column.id);
        if (!propertyDef) return '';
        
        // 从映射中获取对应的单元格组件
        const CellComponent = PROPERTY_CELL_COMPONENTS[propertyValue.property_type];
        if (!CellComponent) {
            // 默认处理，如果没有找到对应组件
            return propertyValue.value !== null && propertyValue.value !== undefined 
                ? String(propertyValue.value) 
                : '';
        }
        // 渲染单元格组件
        return (
            <CellComponent
                propertyID={propertyValue.property_id}
                propertyType={propertyValue.property_type}
                value={propertyValue.value}
                issueId={String(issue.issue_id)}
                propertyConfig={propertyDef.config}
                rowData={issue as unknown as Record<string, unknown>}
            />
        );
    };

    // 筛选属性菜单项
    const filterMenuItems = propertyDefinitions.map(prop => ({
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
            ref={filterButtonRef} 
            className="flex items-center px-2 py-1 text-sm text-gray-700"
        >
            <FiFilter className="mr-2 h-4 w-4 text-gray-500" />
            <span>筛选</span>
        </div>
    );

    // 渲染已应用的筛选条件
    const renderAppliedFilters = () => {
        return activeFilters.map(filter => {
            const propertyDef = getPropertyDefinition(filter.propertyId);
            if (!propertyDef) return null;
            
            // 获取对应类型的筛选组件
            const FilterComponent = APPLIED_FILTER_COMPONENTS[propertyDef.type];
            if (!FilterComponent) return null;
            
            return (
                <AppliedFilterWrapper
                    key={filter.propertyId}
                    filter={filter}
                    propertyDefinition={propertyDef}
                    onRemove={handleRemoveFilter}
                    FilterComponent={FilterComponent}
                />
            );
        });
    };

    return (
        <div className="p-8">
            {/* 工具栏 */}
            <div className="mb-4 relative">
                <div className="flex flex-wrap items-center">
                    <div className="mr-2 mb-2">
                        <DropDownMenuV2 
                            entryLabel={FilterButton}
                            menuItems={filterMenuItems}
                            entryClassName="border border-gray-200 rounded"
                            menuClassName="w-64 bg-white border border-gray-200 rounded-md shadow-lg"
                        />
                    </div>
                    
                    {/* 显示已应用的筛选条件 */}
                    {renderAppliedFilters()}
                </div>
                
                {/* 设置筛选条件的面板 */}
                {selectedProperty && (
                    <FilterConstructorPanel
                        propertyDefinition={selectedProperty}
                        currentFilter={getCurrentFilter(selectedProperty.id)}
                        onApply={handleFilterApply}
                        onCancel={handleFilterCancel}
                        position={panelPosition}
                    />
                )}
            </div>

            {/* 表格组件 */}
            {issues.length > 0 ? (
                <>
                    <IssueTable 
                        columns={columns}
                        data={issues as unknown as Record<string, unknown>[]}
                        renderHeader={renderHeader}
                        renderCell={renderCell}
                    />
                    {/* 数据统计 */}
                    <div className="mt-4 text-sm text-gray-500">
                        Total {issues.length} issues
                    </div>
                </>
            ) : (
                <div className="p-4 text-gray-500 text-sm">暂无符合条件的工单</div>
            )}
        </div>
    );
} 