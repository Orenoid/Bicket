'use client';

import { IssueTable, TableColumn } from './IssueTable';
import {
    PROPERTY_HEADER_COMPONENTS,
    PROPERTY_CELL_COMPONENTS
} from '../../property/component';

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

export function IssuePage({ issues, propertyDefinitions }: IssuePageProps) {
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

    return (
        <div className="p-8">
            {/* 标题 */}
            <h1 className="text-2xl font-bold mb-4">Issues</h1>

            {/* 表格组件 */}
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
        </div>
    );
} 