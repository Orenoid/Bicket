'use client';

import { useState, useEffect } from 'react';
import { PropertyType } from '../property/constant';
import {
    StatusOption,
    SelectPropertyConfig, PROPERTY_HEADER_COMPONENTS,
    PROPERTY_CELL_COMPONENTS
} from '../property/component';

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

// 属性定义接口
interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

export default function IssuePage() {
    // 状态管理
    const [data] = useState(mockData);
    const [propertyDefinitions] = useState(mockPropertyDefinitions);

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



// 定义状态选项
const statusOptions: StatusOption[] = [
    { id: 'todo', name: '待处理', color: '#e5e5e5' },
    { id: 'in_progress', name: '进行中', color: '#0052cc' },
    { id: 'testing', name: '测试中', color: '#fbca04' },
    { id: 'done', name: '已完成', color: '#36b37e' }
];

// 属性定义数据（从服务端获取）
const mockPropertyDefinitions: PropertyDefinition[] = [
    { 
        id: 'id', 
        name: 'ID', 
        type: PropertyType.ID
    },
    { 
        id: 'title', 
        name: '标题', 
        type: PropertyType.TEXT
    },
    { 
        id: 'status', 
        name: '状态', 
        type: PropertyType.SELECT,
        config: { options: statusOptions } as SelectPropertyConfig
    }
];

// 模拟数据
const mockData: Issue[] = [
    {
        issue_id: 1,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 1 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现登录功能' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'in_progress' }
        ]
    },
    {
        issue_id: 2,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 2 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '修复首页布局问题' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'todo' }
        ]
    },
    {
        issue_id: 3,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 3 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '优化数据库查询性能' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'testing' }
        ]
    },
    {
        issue_id: 4,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 4 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '添加用户管理界面' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'done' }
        ]
    },
    {
        issue_id: 5,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 5 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '完善错误处理机制' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'in_progress' }
        ]
    },
    {
        issue_id: 6,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 6 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现数据导出功能' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'todo' }
        ]
    },
    {
        issue_id: 7,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 7 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '添加多语言支持' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'testing' }
        ]
    },
    {
        issue_id: 8,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 8 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '修复移动端适配问题' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'in_progress' }
        ]
    },
    {
        issue_id: 9,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 9 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '优化页面加载速度' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'done' }
        ]
    },
    {
        issue_id: 10,
        property_values: [
            { property_id: 'id', property_type: PropertyType.ID, value: 10 },
            { property_id: 'title', property_type: PropertyType.TEXT, value: '实现文件上传功能' },
            { property_id: 'status', property_type: PropertyType.SELECT, value: 'todo' }
        ]
    }
];
