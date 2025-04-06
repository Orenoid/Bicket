'use client';

import React from 'react';
import { PropertyType } from '../constants';

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

/**
 * 多选类型属性的配置结构
 * 与单选类型相同，但处理多个选中值
 */
export interface MultiSelectPropertyConfig extends Record<string, unknown> {
    options: StatusOption[];           // 所有可选项
    maxSelect?: number;                // 最大选择数量限制
}

/**
 * 矿机类型属性的配置结构
 */
export interface MinersPropertyConfig extends Record<string, unknown> {
    maxSelect?: number;                // 最大选择数量限制
    displayCount?: number;             // 表格中显示的最大矿机数
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

// 富文本类型的单元格组件
export const RichTextPropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">{propertyConfig?.emptyText as string || "空"}</span>;
    }
    
    // 处理富文本值（Markdown格式）
    const markdownValue = String(value);
    const maxLength = (propertyConfig?.maxDisplayLength as number) || 150;
    
    // 将Markdown转换为纯文本
    // 移除常见的Markdown标记：
    // - 标题 # ## ###
    // - 加粗 **text** 或 __text__
    // - 斜体 *text* 或 _text_
    // - 链接 [text](url)
    // - 图片 ![alt](url)
    // - 列表项 - 或 * 或 1.
    // - 引用 >
    // - 代码块 ``` 或 `
    const plainText = markdownValue
        .replace(/#+\s+/g, '') // 移除标题标记
        .replace(/[*_]{2}(.+?)[*_]{2}/g, '$1') // 移除加粗标记
        .replace(/[*_](.+?)[*_]/g, '$1') // 移除斜体标记
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 将链接转换为纯文本
        .replace(/!\[.+?\]\(.+?\)/g, '[图片]') // 将图片转换为[图片]标识
        .replace(/^[\-*]\s+/gm, '') // 移除无序列表标记
        .replace(/^\d+\.\s+/gm, '') // 移除有序列表标记
        .replace(/^>\s+/gm, '') // 移除引用标记
        .replace(/`{1,3}([^`]+?)`{1,3}/g, '$1'); // 移除代码块标记
    
    // 如果文本过长，截断并显示省略号
    if (plainText.length > maxLength) {
        return (
            <span title={plainText}>
                {plainText.substring(0, maxLength)}...
            </span>
        );
    }
    
    return <span>{plainText}</span>;
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

// 多选类型的单元格组件
export const MultiSelectPropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
        return <span className="text-gray-400 italic">未设置</span>;
    }
    
    // 确保值是数组
    const valueArray = Array.isArray(value) ? value : [value];
    
    // 获取选项配置
    const options = (propertyConfig?.options as StatusOption[]) || [];
    // 查找匹配的选项
    const selectedOptions = options.filter(option => 
        valueArray.includes(option.id)
    );
    
    if (selectedOptions.length === 0) {
        return <span className="text-gray-400 italic">无效选项</span>;
    }

    // 以标签组形式显示多个选项，强制水平排列
    return (
        <div className="flex flex-row items-center gap-1 w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            {selectedOptions.map(option => (
                <span 
                    key={option.id}
                    className="inline-flex items-center shrink-0 justify-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                        backgroundColor: option.color,
                        color: option.color === '#e5e5e5' ? '#666666' : 'white'
                    }}
                >
                    {option.name}
                </span>
            ))}
        </div>
    );
};

// 矿机列表类型的单元格组件
export const MinersPropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
        return <span className="text-gray-400 italic">未设置矿机</span>;
    }
    
    // 确保值是数组
    const valueArray = Array.isArray(value) ? value : [value];
    
    // 获取配置(可选)
    const displayCount = (propertyConfig?.displayCount as number) || 3; // 默认显示3个
    
    // 判断是否需要显示"更多"提示
    const showMore = valueArray.length > displayCount;
    const displayItems = showMore ? valueArray.slice(0, displayCount) : valueArray;
    
    // 模拟矿机状态信息 - 在实际应用中，这些信息应该从后端获取
    const minerStatusMap: Record<string, { status: string; model: string; ipAddress: string }> = {
        'M001': { status: '在线', model: 'Antminer S19 Pro', ipAddress: '192.168.1.101' },
        'M002': { status: '过热警告', model: 'Whatsminer M30S++', ipAddress: '192.168.1.102' },
        'M003': { status: '离线', model: 'Antminer S19j Pro', ipAddress: '192.168.2.101' },
        'M004': { status: '在线', model: 'Avalon 1246', ipAddress: '192.168.2.102' },
        'M005': { status: '在线', model: 'Antminer S19 XP', ipAddress: '192.168.3.101' },
        'M006': { status: '在线', model: 'Whatsminer M30S', ipAddress: '192.168.3.102' }
    };
    
    // 获取状态对应的样式
    const getStatusStyle = (status: string) => {
        switch (status) {
            case '在线':
                return 'bg-green-100 text-green-800';
            case '离线':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    // 获取矿机的状态信息
    const getMinerStatus = (minerId: string) => {
        return minerStatusMap[minerId] || { status: '未知', model: '未知', ipAddress: '未知' };
    };
    
    // 以标签组形式显示矿机ID列表，带有状态指示和悬停详情
    return (
        <div className="flex flex-row items-center gap-1 w-full overflow-hidden whitespace-nowrap">
            {displayItems.map(minerId => {
                const minerInfo = getMinerStatus(minerId.toString());
                const statusStyle = getStatusStyle(minerInfo.status);
                
                return (
                    <div 
                        key={minerId}
                        className="relative group"
                    >
                        <span 
                            className="inline-flex items-center shrink-0 justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800"
                            title={`${minerInfo.model} (${minerInfo.ipAddress})`}
                        >
                            <span
                                className={`inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0 ${statusStyle}`}
                            ></span>
                            {minerId}
                        </span>
                        
                        {/* 悬停提示 - 使用绝对定位但相对于父容器，避免被裁剪 */}
                        <div className="absolute z-20 left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                            <div className="bg-gray-800 text-white text-xs rounded shadow-lg py-1.5 px-3 whitespace-nowrap">
                                <div className="font-medium">ID: {minerId}</div>
                                <div>型号: {minerInfo.model}</div>
                                <div>IP: {minerInfo.ipAddress}</div>
                                <div>状态: <span className={statusStyle.replace('bg-', 'text-').replace('text-gray-800', 'text-white')}>{minerInfo.status}</span></div>
                            </div>
                            <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-3"></div>
                        </div>
                    </div>
                );
            })}
            {showMore && (
                <span className="text-xs text-gray-500 ml-1">
                    +{valueArray.length - displayCount}台
                </span>
            )}
        </div>
    );
};

// 表头组件映射
export const PROPERTY_HEADER_COMPONENTS: Record<string, PropertyHeaderCellComponent> = {
    [PropertyType.ID]: TextPropertyHeaderCell,
    [PropertyType.TEXT]: TextPropertyHeaderCell,
    [PropertyType.SELECT]: TextPropertyHeaderCell,
    [PropertyType.RICH_TEXT]: TextPropertyHeaderCell,
    [PropertyType.MULTI_SELECT]: TextPropertyHeaderCell, // 多选类型使用与单选相同的表头组件
    [PropertyType.MINERS]: TextPropertyHeaderCell, // 矿机列表类型使用通用的表头组件
    // 其他类型的表头组件可以在这里添加
};

// 单元格组件映射
export const PROPERTY_CELL_COMPONENTS: Record<string, PropertyCellComponent> = {
    [PropertyType.ID]: TextPropertyCell,
    [PropertyType.TEXT]: TextPropertyCell,
    [PropertyType.SELECT]: SelectPropertyCell,
    [PropertyType.RICH_TEXT]: RichTextPropertyCell,
    [PropertyType.MULTI_SELECT]: MultiSelectPropertyCell,
    [PropertyType.MINERS]: MinersPropertyCell, // 注册矿机列表类型的单元格组件
    // 其他类型的单元格组件可以在这里添加
}; 
