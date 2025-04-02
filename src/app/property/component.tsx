'use client';

import React from 'react';
import { PropertyType } from './constant';

// 表头组件属性接口
export interface PropertyHeaderCellProps {
    // 基础属性信息
    propertyID: string;             // 属性ID
    propertyType: string;           // 属性类型
    propertyName: string;           // 属性名称
    propertyConfig?: Record<string, unknown>;  // 属性配置信息(可以是JSON对象，包含该类型特有配置)
}

export type PropertyHeaderCellComponent = React.FC<PropertyHeaderCellProps>;

/**
 * 状态选项的定义
 */
export interface StatusOption {
    id: string;                // 选项ID
    name: string;              // 选项名称
    color: string;             // 选项颜色（可以是CSS颜色值，如 #FF5733 或 rgb(255, 87, 51)）
}

/**
 * 单选类型属性的配置结构
 */
export interface SelectPropertyConfig extends Record<string, unknown> {
    options: StatusOption[];           // 所有可选项
}

// 文本类型的表头组件
export const TextPropertyHeaderCell: PropertyHeaderCellComponent = ({ 
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

// 单元格组件属性接口
export interface PropertyCellProps {
    // 基础属性信息
    propertyID: string;             // 属性ID
    propertyType: string;           // 属性类型
    propertyConfig?: Record<string, unknown>;  // 属性配置信息

    // 数据相关
    value: unknown;                 // 属性值
    issueId: string;                // 所属issue的ID
    rowData?: Record<string, unknown>;  // 整行数据(可选，有些复杂单元格可能需要访问其他字段)
}

export type PropertyCellComponent = React.FC<PropertyCellProps>;

// 文本类型的单元格组件
export const TextPropertyCell: PropertyCellComponent = ({ 
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

// 单选类型的单元格组件
export const SelectPropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">未设置</span>;
    }
    
    // 获取选项配置
    const options = (propertyConfig?.options as StatusOption[]) || [];
    // 查找匹配的选项
    const selectedOption = options.find(option => option.id === value);
    
    if (!selectedOption) {
        return <span className="text-gray-400 italic">无效选项</span>;
    }

    // 原始样式：圆点 + 文本
    /*
    return (
        <div className="flex items-center space-x-2">
            <span 
                className="inline-block w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedOption.color }}
            />
            <span>{selectedOption.name}</span>
        </div>
    );
    */

    // 新样式：扁平风格，完全圆角
    return (
        <span 
            className="inline-block px-3 py-0.5 rounded-full text-xs font-medium"
            style={{ 
                backgroundColor: selectedOption.color,
                color: selectedOption.color === '#e5e5e5' ? '#666666' : 'white'
            }}
        >
            {selectedOption.name}
        </span>
    );
};

// 表头组件映射
export const PROPERTY_HEADER_COMPONENTS: Record<string, PropertyHeaderCellComponent> = {
    [PropertyType.ID]: TextPropertyHeaderCell,
    [PropertyType.TEXT]: TextPropertyHeaderCell,
    [PropertyType.SELECT]: TextPropertyHeaderCell,
    // 其他类型的表头组件可以在这里添加
};

// 单元格组件映射
export const PROPERTY_CELL_COMPONENTS: Record<string, PropertyCellComponent> = {
    [PropertyType.ID]: TextPropertyCell,
    [PropertyType.TEXT]: TextPropertyCell,
    [PropertyType.SELECT]: SelectPropertyCell,
    // 其他类型的单元格组件可以在这里添加
}; 