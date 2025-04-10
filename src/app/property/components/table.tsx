'use client';

import React, { useEffect, useState } from 'react';
import { PropertyType } from '../constants';
import { getMinerById, getMinerStatusStyle } from '../../miners/service';
import Image from 'next/image';
import { getUser, User } from '../../users/service';

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

/**
 * 日期时间类型属性的配置结构
 */
export interface DatetimePropertyConfig extends Record<string, unknown> {
    format?: string;                   // 日期时间显示格式
    showTime?: boolean;                // 是否显示时间部分
    showSeconds?: boolean;             // 是否显示秒部分
    showTimezone?: boolean;            // 是否显示时区部分
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
    
    // 以标签组形式显示矿机ID列表，带有状态指示和悬停详情
    return (
        <div className="flex flex-row items-center gap-1 w-full overflow-hidden whitespace-nowrap">
            {displayItems.map(minerId => {
                const miner = getMinerById(minerId.toString());
                const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                
                return (
                    <div 
                        key={minerId}
                        className="relative group"
                    >
                        <span 
                            className="inline-flex items-center shrink-0 justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800"
                            title={miner ? `${miner.model} (${miner.ipAddress})` : '未知矿机'}
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
                                <div>型号: {miner ? miner.model : '未知'}</div>
                                <div>IP: {miner ? miner.ipAddress : '未知'}</div>
                                <div>状态: <span className={statusStyle.replace('bg-', 'text-').replace('text-gray-800', 'text-white')}>{miner ? miner.status : '未知'}</span></div>
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

// 日期时间类型的表头组件
export const DatetimePropertyHeaderCell: PropertyHeaderCellComponent = ({ 
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

// 日期时间类型的单元格组件
export const DatetimePropertyCell: PropertyCellComponent = ({ 
    value, 
    propertyConfig 
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">{propertyConfig?.emptyText as string || "未设置"}</span>;
    }
    
    try {
        // 尝试解析日期时间字符串
        const dateString = String(value);
        const date = new Date(dateString);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return <span className="text-gray-400 italic">无效日期</span>;
        }
        
        // 获取配置
        const config = propertyConfig as DatetimePropertyConfig || {};
        const showTime = config.showTime !== false; // 默认显示时间
        const showSeconds = config.showSeconds !== false; // 默认显示秒
        const showTimezone = config.showTimezone === true; // 默认不显示时区
        
        // 格式化日期部分 (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFormatted = `${year}-${month}-${day}`;
        
        // 如果不显示时间，只返回日期部分
        if (!showTime) {
            return <span>{dateFormatted}</span>;
        }
        
        // 格式化时间部分
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        let timeFormatted = `${hours}:${minutes}`;
        
        // 添加秒部分（如果需要）
        if (showSeconds) {
            const seconds = String(date.getSeconds()).padStart(2, '0');
            timeFormatted += `:${seconds}`;
        }
        
        // 添加时区部分（如果需要）
        if (showTimezone) {
            const timezoneOffset = date.getTimezoneOffset();
            const timezoneHours = Math.abs(Math.floor(timezoneOffset / 60));
            const timezoneMinutes = Math.abs(timezoneOffset % 60);
            const timezoneSign = timezoneOffset <= 0 ? '+' : '-'; // 注意：getTimezoneOffset 返回的是与 UTC 的差值的负数
            const timezoneFormatted = `${timezoneSign}${String(timezoneHours).padStart(2, '0')}:${String(timezoneMinutes).padStart(2, '0')}`;
            timeFormatted += ` (UTC${timezoneFormatted})`;
        }
        
        // 返回完整的格式化日期时间
        return (
            <div className="whitespace-nowrap">
                <span className="mr-2">{dateFormatted}</span>
                <span className="text-gray-500">{timeFormatted}</span>
            </div>
        );
    } catch (error) {
        console.error('日期格式化错误', error);
        return <span className="text-gray-400 italic">日期格式错误</span>;
    }
};

// 用户类型的单元格组件
export const UserPropertyCell: PropertyCellComponent = ({ 
    value 
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // 转换userId并设置effect
    const userId = value !== null && value !== undefined && value !== "" 
        ? String(value) 
        : "";
    
    // 加载用户信息
    useEffect(() => {
        // 如果没有userId，不执行加载
        if (!userId) {
            setLoading(false);
            return;
        }
        
        async function loadUser() {
            try {
                setLoading(true);
                setError(null);
                const userData = await getUser(userId);
                setUser(userData);
            } catch (err) {
                console.error('加载用户信息失败', err);
                setError('加载用户信息失败');
            } finally {
                setLoading(false);
            }
        }
        
        loadUser();
    }, [userId]);
    
    // 处理空值显示
    if (!userId) {
        return <span className="text-gray-400 italic">未分配</span>;
    }
    
    // 加载中显示
    if (loading) {
        return <span className="text-gray-400">加载中...</span>;
    }
    
    // 错误显示
    if (error) {
        return <span className="text-red-500">加载失败</span>;
    }
    
    // 用户不存在显示
    if (!user) {
        return <span className="text-gray-400 italic">未知用户</span>;
    }
    
    // 显示用户信息
    return (
        <div className="flex items-center">
            {/* 用户头像 */}
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200">
                <Image 
                    src={user.imageUrl} 
                    alt={user.username}
                    width={24}
                    height={24}
                    unoptimized
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* 用户名 */}
            <span className="text-sm truncate">{user.username}</span>
        </div>
    );
};

// 表头组件映射
export const PROPERTY_HEADER_COMPONENTS: Record<string, PropertyHeaderCellComponent> = {
    [PropertyType.ID]: TextPropertyHeaderCell,
    [PropertyType.TEXT]: TextPropertyHeaderCell,
    [PropertyType.SELECT]: TextPropertyHeaderCell,
    [PropertyType.RICH_TEXT]: TextPropertyHeaderCell,
    [PropertyType.MULTI_SELECT]: TextPropertyHeaderCell,
    [PropertyType.MINERS]: TextPropertyHeaderCell,
    [PropertyType.DATETIME]: DatetimePropertyHeaderCell,
    [PropertyType.USER]: TextPropertyHeaderCell,
    // 其他类型的表头组件可以在这里添加
};

// 单元格组件映射
export const PROPERTY_CELL_COMPONENTS: Record<string, PropertyCellComponent> = {
    [PropertyType.ID]: TextPropertyCell,
    [PropertyType.TEXT]: TextPropertyCell,
    [PropertyType.SELECT]: SelectPropertyCell,
    [PropertyType.RICH_TEXT]: RichTextPropertyCell,
    [PropertyType.MULTI_SELECT]: MultiSelectPropertyCell,
    [PropertyType.MINERS]: MinersPropertyCell,
    [PropertyType.DATETIME]: DatetimePropertyCell,
    [PropertyType.USER]: UserPropertyCell,
    // 其他类型的单元格组件可以在这里添加
}; 
