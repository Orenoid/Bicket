'use client';

import { useState } from 'react';
import { PropertyType } from '../property/constant';

interface PropertyHeaderCellProps {
    // 基础属性信息
    propertyID: string;             // 属性ID
    propertyType: string;           // 属性类型
    propertyName: string;           // 属性名称
    propertyConfig?: Record<string, unknown>;  // 属性配置信息(可以是JSON对象，包含该类型特有配置)
}

type PropertyHeaderCellComponent = React.FC<PropertyHeaderCellProps>;

const TextPropertyHeaderCell: PropertyHeaderCellComponent = ({ 
    propertyName, 
    propertyConfig 
}) => {
    return (
        <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">{propertyName}</span>
            {Boolean(propertyConfig?.required) && (
                <span className="text-red-500 text-xs">*</span>
            )}
        </div>
    );
};

interface PropertyCellProps {
    // 基础属性信息
    propertyID: string;             // 属性ID
    propertyType: string;           // 属性类型
    propertyConfig?: Record<string, unknown>;  // 属性配置信息

    // 数据相关
    value: unknown;                 // 属性值
    issueId: string;                // 所属issue的ID
    rowData?: Record<string, unknown>;  // 整行数据(可选，有些复杂单元格可能需要访问其他字段)
}

type PropertyCellComponent = React.FC<PropertyCellProps>;

// 文本类型的单元格组件
const TextPropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">{propertyConfig?.emptyText as string || "空"}</span>;
    }
    
    // 处理文本值
    const textValue = String(value);
    const maxLength = (propertyConfig?.maxDisplayLength as number) || 100;
    
    // 如果文本过长，截断并显示省略号
    if (textValue.length > maxLength) {
        return (
            <span title={textValue}>
                {textValue.substring(0, maxLength)}...
            </span>
        );
    }
    
    return <span>{textValue}</span>;
};

// 表头组件映射
export const PROPERTY_HEADER_COMPONENTS: Record<string, PropertyHeaderCellComponent> = {
    [PropertyType.ID]: TextPropertyHeaderCell,
    [PropertyType.TEXT]: TextPropertyHeaderCell,
    // 其他类型的表头组件可以在这里添加
};

// 单元格组件映射
export const PROPERTY_CELL_COMPONENTS: Record<string, PropertyCellComponent> = {
    [PropertyType.ID]: TextPropertyCell,
    [PropertyType.TEXT]: TextPropertyCell,
    // 其他类型的单元格组件可以在这里添加
};

interface TableColumn {
    id: string;
    title: string;
    width?: number;
    minWidth?: number;
}
interface IssueTableProps {
    columns: TableColumn[];
    data: Record<string, unknown>[];
    renderHeader?: (column: TableColumn) => React.ReactNode;
    renderCell?: (column: TableColumn, rowData: Record<string, unknown>, rowIndex: number) => React.ReactNode;
}
// 表格框架组件
const IssueTable: React.FC<IssueTableProps> = ({ 
    columns, 
    data, 
    renderHeader = (col) => col.title, 
    renderCell = () => null 
}) => {
    // 处理列宽
    const getColumnWidth = (column: TableColumn) => {
        return column.width ? `${column.width}px` : column.minWidth ? `${column.minWidth}px` : '150px';
    };

    return (
        <div className="overflow-auto border border-gray-200 rounded-lg" style={{ maxHeight: '500px' }}>
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <table className="min-w-full border-collapse table-fixed">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {columns.map((column, colIndex) => (
                                    <th 
                                        key={column.id} 
                                        className={`relative px-3 py-3.5 text-left text-sm font-semibold text-gray-700 ${colIndex > 0 ? 'border-l border-gray-200' : ''}`}
                                        style={{ width: getColumnWidth(column) }}
                                    >
                                        <div className="flex items-center">
                                            {renderHeader(column)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, rowIndex) => (
                                <tr 
                                    key={rowIndex} 
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td 
                                            key={`${rowIndex}-${column.id}`} 
                                            className={`px-3 py-3.5 text-sm text-gray-500 truncate ${colIndex > 0 ? 'border-l border-gray-200' : ''}`}
                                            style={{ 
                                                width: getColumnWidth(column),
                                                height: '48px' // 固定行高
                                            }}
                                        >
                                            {renderCell(column, row, rowIndex)}
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

// 定义新的数据类型
interface PropertyValue {
    property_id: string;
    property_type: string;
    value: unknown;
}

interface Issue {
    issue_id: number;
    property_values: PropertyValue[];
}

// 模拟数据
const mockData: Issue[] = [
    {
        issue_id: 1,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 1 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现登录功能' }
        ]
    },
    {
        issue_id: 2,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 2 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '修复首页布局问题' }
        ]
    },
    {
        issue_id: 3,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 3 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '优化数据库查询性能' }
        ]
    },
    {
        issue_id: 4,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 4 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '添加用户管理界面' }
        ]
    },
    {
        issue_id: 5,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 5 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '完善错误处理机制' }
        ]
    },
    {
        issue_id: 6,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 6 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现数据导出功能' }
        ]
    },
    {
        issue_id: 7,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 7 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '添加多语言支持' }
        ]
    },
    {
        issue_id: 8,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 8 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '修复移动端适配问题' }
        ]
    },
    {
        issue_id: 9,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 9 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '优化页面加载速度' }
        ]
    },
    {
        issue_id: 10,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 10 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现文件上传功能' }
        ]
    }
];

export default function IssuePage() {
    // 状态管理
    const [data] = useState(mockData);
    
    // 表格列定义
    const columns: TableColumn[] = [
        { id: 'id', title: 'ID', minWidth: 80 },
        { id: 'title', title: '标题', minWidth: 200 }
    ];

    // 获取行中特定属性的值和类型
    const getPropertyInfo = (issue: Issue, propertyId: string): PropertyValue | null => {
        return issue.property_values.find(p => p.property_id === propertyId) || null;
    };

    // 渲染表头
    const renderHeader = (column: TableColumn) => {
        // 假设所有行的属性类型都相同，从第一行获取属性类型
        if (data.length === 0) return column.title;
        
        const propertyInfo = getPropertyInfo(data[0], column.id);
        if (!propertyInfo) return column.title;
        
        // 从映射中获取对应的表头组件
        const HeaderComponent = PROPERTY_HEADER_COMPONENTS[propertyInfo.property_type];
        if (!HeaderComponent) return column.title;
        
        // 渲染表头组件
        return (
            <HeaderComponent
                propertyID={propertyInfo.property_id}
                propertyType={propertyInfo.property_type}
                propertyName={column.title}
                propertyConfig={{}}
            />
        );
    };

    // 渲染单元格
    const renderCell = (column: TableColumn, row: Record<string, unknown>) => {
        const issue = row as unknown as Issue;
        const propertyInfo = getPropertyInfo(issue, column.id);

        if (!propertyInfo) return '';
        
        // 从映射中获取对应的单元格组件
        const CellComponent = PROPERTY_CELL_COMPONENTS[propertyInfo.property_type];
        if (!CellComponent) {
            // 默认处理，如果没有找到对应组件
            return propertyInfo.value !== null && propertyInfo.value !== undefined 
                ? String(propertyInfo.value) 
                : '';
        }
        // 渲染单元格组件
        return (
            <CellComponent
                propertyID={propertyInfo.property_id}
                propertyType={propertyInfo.property_type}
                value={propertyInfo.value}
                issueId={String(issue.issue_id)}
                propertyConfig={{}}
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
                data={data as unknown as Record<string, unknown>[]}
                renderHeader={renderHeader}
                renderCell={renderCell}
            />

            {/* 数据统计 */}
            <div className="mt-4 text-sm text-gray-500">
                Total {data.length} issues
            </div>
        </div>
    );
}