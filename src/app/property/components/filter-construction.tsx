'use client';

import React, { useState } from 'react';
import { FilterCondition } from '@/app/property/types';
import { FilterOperator } from '@/app/property/types';
import { PropertyType } from '../constants';
import { PropertyDefinition } from '../../issue/components/IssuePage';

/**
 * 筛选构造器面板属性接口
 */
export interface FilterConstructorPanelProps {
    // 属性定义
    propertyDefinition: PropertyDefinition;
    // 当前筛选条件（如果有）
    currentFilter: FilterCondition | null;
    // 应用筛选回调
    onApply: (filter: FilterCondition | null) => void;
    // 取消回调
    onCancel: () => void;
    // 面板定位（可选）
    position?: { top?: number; left?: number; right?: number; bottom?: number };
}

/**
 * 筛选构造器面板组件类型
 * 
 * 不同属性类型应该实现自己的筛选面板组件，并注册到 FILTER_CONSTRUCTOR_PANELS 中
 */
export type FilterConstructorComponent = React.FC<FilterConstructorPanelProps>;

/**
 * 默认筛选构造器面板组件
 * 
 * 当找不到对应类型的筛选面板组件时使用
 */
export const DefaultFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    onCancel,
    position = {}
}) => (
    <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-64"
         style={{ ...position }}>
        <div className="text-red-500 text-sm p-2">
            不支持的筛选类型: {propertyDefinition.type}
        </div>
        <div className="flex justify-end mt-2">
            <button 
                onClick={onCancel}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
                关闭
            </button>
        </div>
    </div>
);

/**
 * 文本筛选构造器面板组件
 * 
 * 用于文本类型属性的筛选条件设置
 */
export const TextFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 初始化值 - 操作符固定为contains
    const [value, setValue] = useState<string>(
        (currentFilter?.value as string) || ''
    );

    // 应用筛选条件
    const handleApply = () => {
        if (value.trim()) {
            // 有值时应用筛选
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'contains', // 固定使用contains操作符
                value: value.trim()
            });
        } else {
            // 没有值，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>
            
            {/* 移除操作符选择，直接显示输入框 */}
            <div className="mb-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="输入包含的文本..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            清除
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * ID 筛选构造器面板组件
 * 
 * 用于 ID 类型属性的筛选条件设置，支持数值比较操作
 */
export const IdFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 初始化操作符和值
    const [operator, setOperator] = useState<FilterOperator>(
        currentFilter?.operator || 'eq'
    );
    const [value, setValue] = useState<string>(
        currentFilter?.value !== null && currentFilter?.value !== undefined
            ? String(currentFilter.value)
            : ''
    );

    // ID 筛选操作符选项 - 简化只保留等于和包含操作
    const operatorOptions = [
        { value: 'eq', label: '等于' },
        { value: 'in', label: '包含于 (多个ID用逗号分隔)' }
    ];

    // 应用筛选条件
    const handleApply = () => {
        if (!value.trim()) {
            // 没有值，等同于清除筛选
            onApply(null);
            return;
        }

        if (operator === 'in') {
            // 处理多个ID的情况
            const ids = value.split(',')
                .map(id => id.trim())
                .filter(id => id && !isNaN(Number(id)))
                .map(id => Number(id));
            
            if (ids.length > 0) {
                onApply({
                    propertyId: propertyDefinition.id,
                    propertyType: propertyDefinition.type,
                    operator,
                    value: ids
                });
            } else {
                onApply(null);
            }
        } else {
            // 等于操作符
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                onApply({
                    propertyId: propertyDefinition.id,
                    propertyType: propertyDefinition.type,
                    operator,
                    value: numValue
                });
            } else {
                onApply(null);
            }
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>
            
            {/* 操作符选择 */}
            <div className="mb-3">
                <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as FilterOperator)}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-white"
                >
                    {operatorOptions.map(op => (
                        <option key={op.value} value={op.value}>
                            {op.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 值输入框 */}
            <div className="mb-3">
                <input
                    type={operator === 'in' ? 'text' : 'number'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={operator === 'in' ? "1, 2, 3, ..." : "输入ID值..."}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
                {operator === 'in' && (
                    <div className="text-xs text-gray-500 mt-1">
                        请输入多个ID，以逗号分隔
                    </div>
                )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            清除
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 单选类型选项接口
 */
interface SelectOption {
    id: string;
    name: string;
    color: string;
}

/**
 * 单选筛选构造器面板组件
 * 
 * 用于单选类型属性的筛选条件设置
 */
export const SelectFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 获取选项列表
    const options = ((propertyDefinition.config?.options || []) as SelectOption[]);
    
    // 选中的选项IDs - 始终使用多选模式
    const [selectedValues, setSelectedValues] = useState<string[]>(
        currentFilter?.operator === 'in' && Array.isArray(currentFilter.value)
            ? currentFilter.value as string[]
            : currentFilter?.operator === 'eq' && currentFilter.value
                ? [currentFilter.value as string]
                : []
    );

    // 处理选项选择
    const handleOptionToggle = (optionId: string) => {
        // 多选模式，切换选中状态
        setSelectedValues(prev => 
            prev.includes(optionId)
                ? prev.filter(id => id !== optionId)
                : [...prev, optionId]
        );
    };

    // 应用筛选条件
    const handleApply = () => {
        if (selectedValues.length > 0) {
            // 多选模式
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'in',
                value: selectedValues
            });
        } else {
            // 没有选择任何值，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>

            {/* 选项列表 */}
            {options.length > 0 ? (
                <div className="mb-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                        {options.map(option => (
                            <div
                                key={option.id}
                                className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleOptionToggle(option.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option.id)}
                                    readOnly
                                    className="mr-2"
                                />
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: option.color }}
                                    />
                                    <span className="text-sm">{option.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 mb-3">
                    无可选选项
                </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            清除
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 富文本筛选构造器面板组件
 * 
 * 用于富文本类型属性的筛选条件设置，基本与文本筛选类似
 */
export const RichTextFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 初始化值 - 操作符固定为contains
    const [value, setValue] = useState<string>(
        (currentFilter?.value as string) || ''
    );

    // 应用筛选条件
    const handleApply = () => {
        if (value.trim()) {
            // 有值时应用筛选
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'contains', // 固定使用contains操作符
                value: value.trim()
            });
        } else {
            // 没有值，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>
            
            {/* 输入框 */}
            <div className="mb-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="输入包含的文本..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
                <div className="text-xs text-gray-500 mt-1">
                    搜索将在Markdown文本中进行，包括标题、段落等
                </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            清除
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 多选类型筛选构造器面板组件
 * 
 * 用于多选类型属性的筛选条件设置，与单选类型类似，但支持多个值的选择
 */
export const MultiSelectFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 获取选项列表
    const options = ((propertyDefinition.config?.options || []) as SelectOption[]);
    
    // 选中的选项IDs - 与单选不同，多选始终使用in操作符和数组值
    const [selectedValues, setSelectedValues] = useState<string[]>(
        currentFilter?.operator === 'in' && Array.isArray(currentFilter.value)
            ? currentFilter.value as string[]
            : []
    );

    // 处理选项选择
    const handleOptionToggle = (optionId: string) => {
        // 多选模式，切换选中状态
        setSelectedValues(prev => 
            prev.includes(optionId)
                ? prev.filter(id => id !== optionId)
                : [...prev, optionId]
        );
    };

    // 应用筛选条件
    const handleApply = () => {
        if (selectedValues.length > 0) {
            // 多选模式，使用in操作符
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'in',
                value: selectedValues
            });
        } else {
            // 没有选择任何值，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>

            {/* 选项列表 */}
            {options.length > 0 ? (
                <div className="mb-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                        {options.map(option => (
                            <div
                                key={option.id}
                                className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleOptionToggle(option.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option.id)}
                                    readOnly
                                    className="mr-2"
                                />
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: option.color }}
                                    />
                                    <span className="text-sm">{option.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 mb-3">
                    无可选选项
                </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            清除
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 筛选构造器面板组件映射表
 * 
 * 各属性类型的筛选面板组件应该注册到这里
 */
export const FILTER_CONSTRUCTOR_PANELS: Record<string, FilterConstructorComponent> = {
    // 注册文本筛选面板组件
    [PropertyType.TEXT]: TextFilterConstructorPanel,
    // 注册ID筛选面板组件
    [PropertyType.ID]: IdFilterConstructorPanel,
    // 注册单选筛选面板组件
    [PropertyType.SELECT]: SelectFilterConstructorPanel,
    // 注册富文本筛选面板组件
    [PropertyType.RICH_TEXT]: RichTextFilterConstructorPanel,
    // 注册多选筛选面板组件
    [PropertyType.MULTI_SELECT]: MultiSelectFilterConstructorPanel,
};

/**
 * 获取特定属性类型的筛选构造器面板组件
 * 
 * @param propertyType 属性类型
 * @returns 筛选构造器面板组件
 */
export function getFilterConstructorPanel(propertyType: string): FilterConstructorComponent {
    return FILTER_CONSTRUCTOR_PANELS[propertyType] || DefaultFilterConstructorPanel;
}

/**
 * 筛选构造器面板工厂函数
 * 
 * 根据属性类型返回相应的筛选构造器面板组件
 */
export function FilterConstructorPanel(props: FilterConstructorPanelProps): React.ReactElement {
    const { propertyDefinition } = props;
    const Panel = getFilterConstructorPanel(propertyDefinition.type);
    return <Panel {...props} />;
} 