'use client';

import React, { useState, useEffect } from 'react';
import { FilterCondition } from '@/lib/property/types';
import { FilterOperator } from '@/lib/property/types';
import { PropertyType } from '../../lib/property/constants';
import { PropertyDefinition } from '../issue/IssuePage';
import { getSimpleMinersList, getMinerStatusStyle } from '../../lib/miner/service';
import { getUser } from '../../app/user/service';
import { useOrganization } from '@clerk/clerk-react';
import { TransparentOverlay } from '@/components/my-tmp-ui/overlay';

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
    // 面板样式类名（可选）
    className?: string;
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
    <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-64"
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
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
                    placeholder="Enter the text to search..."
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
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
export const IDFilterConstructorPanel: FilterConstructorComponent = ({
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
        { value: 'eq', label: 'Equal' },
        { value: 'in', label: 'Contains (multiple IDs separated by commas)' }
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
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
                    placeholder={operator === 'in' ? "1, 2, 3, ..." : "Enter te value ID value..."}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
                {operator === 'in' && (
                    <div className="text-xs text-gray-500 mt-1">
                        Please enter multiple IDs, separated by commas
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
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
                    No options available
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
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
                    placeholder="Enter the text to search..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
                <div className="text-xs text-gray-500 mt-1">
                    Search will be performed in Markdown text, including titles, paragraphs, etc.
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 矿机列表类型的筛选构造器面板
 * 
 * 提供矿机列表筛选界面，支持多选模式
 */
export const MinersFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 获取矿机列表
    const miners = getSimpleMinersList();
    
    // 选中的矿机IDs - 始终使用in操作符和数组值
    const [selectedMiners, setSelectedMiners] = useState<string[]>(
        currentFilter?.operator === 'in' && Array.isArray(currentFilter.value)
            ? currentFilter.value as string[]
            : []
    );

    // 处理矿机选择
    const handleMinerToggle = (minerId: string) => {
        // 多选模式，切换选中状态
        setSelectedMiners(prev => 
            prev.includes(minerId)
                ? prev.filter(id => id !== minerId)
                : [...prev, minerId]
        );
    };

    // 应用筛选条件
    const handleApply = () => {
        if (selectedMiners.length > 0) {
            // 多选模式，使用in操作符
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'in',
                value: selectedMiners
            });
        } else {
            // 没有选择任何矿机，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        onApply(null);
    };

    return (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>

            {/* 矿机列表 */}
            {miners.length > 0 ? (
                <div className="mb-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                        {miners.map(miner => (
                            <div
                                key={miner.id}
                                className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleMinerToggle(miner.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedMiners.includes(miner.id)}
                                    readOnly
                                    className="mr-2"
                                />
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${getMinerStatusStyle(miner.status)}`}
                                    />
                                    <span className="text-sm">{miner.id}</span>
                                    <span className="text-xs text-gray-500 ml-2">({miner.model})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 mb-3">
                    No miners available
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 筛选用户类型接口
 * 需要包含userId字段以便识别用户
 */
interface FilterUser {
    userId: string;
    username: string;
    imageUrl: string;
    hasImage: boolean;
}

/**
 * 用户类型的筛选构造器面板组件
 * 
 * 用于选择用户进行筛选
 */
export const UserFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
    position = {}
}) => {
    // 获取组织成员列表
    const { memberships, isLoaded } = useOrganization({
        memberships: {
            infinite: true,
            keepPreviousData: true,
        },
    });

    // 初始化选中的用户ID列表
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
        currentFilter?.operator === 'in' && Array.isArray(currentFilter.value)
            ? currentFilter.value
            : []
    );

    // 存储用户数据 - 这样我们就不必每次都进行转换
    const [users, setUsers] = useState<FilterUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    // 搜索过滤
    const [searchQuery, setSearchQuery] = useState('');

    // 处理成员数据转换为用户数据
    useEffect(() => {
        if (!isLoaded || !memberships?.data) return;
        
        const userData = memberships.data.map(membership => {
            const publicUserData = membership.publicUserData;
            return {
                userId: publicUserData.userId || membership.id,
                username: `${publicUserData.firstName || ''} ${publicUserData.lastName || ''}`.trim() || publicUserData.identifier,
                imageUrl: publicUserData.imageUrl,
                hasImage: !!publicUserData.hasImage
            };
        });
        
        setUsers(userData);
    }, [isLoaded, memberships?.data]);

    // 获取已选用户的详细信息 - 这个现在仅用于加载状态，不再用于显示
    useEffect(() => {
        async function loadSelectedUsers() {
            if (selectedUserIds.length === 0) {
                setIsLoadingUsers(false);
                return;
            }

            setIsLoadingUsers(true);
            try {
                // 只标记加载状态，不再存储结果
                await Promise.all(
                    selectedUserIds.map(async (userId) => {
                        try {
                            await getUser(userId);
                        } catch (error) {
                            console.error(`获取用户信息失败: ${userId}`, error);
                        }
                    })
                );
            } catch (error) {
                console.error('加载选中用户信息失败', error);
            } finally {
                setIsLoadingUsers(false);
            }
        }

        loadSelectedUsers();
    }, [selectedUserIds]);

    // 处理用户选择
    const handleUserSelect = (userId: string) => {
        setSelectedUserIds(prev => {
            // 如果已经选中，则移除
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            // 否则添加
            return [...prev, userId];
        });
    };

    // 应用筛选条件
    const handleApply = () => {
        if (selectedUserIds.length > 0) {
            // 有选中的用户，应用筛选
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'in', // 使用 in 操作符，表示包含于这些值中
                value: selectedUserIds
            });
        } else {
            // 没有选中的用户，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        setSelectedUserIds([]);
        onApply(null);
    };

    // 筛选用户列表
    const filteredUsers = searchQuery.trim() !== '' 
        ? users.filter(user => 
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : users;

    return (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64"
             style={{ ...position }}>
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>
            
            {/* 搜索输入框 */}
            <div className="mb-3">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
            </div>

            {/* 用户列表 */}
            <div className="mb-3 max-h-48 overflow-y-auto">
                {isLoaded ? (
                    filteredUsers.length > 0 ? (
                        <div className="space-y-1">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.userId}
                                    className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleUserSelect(user.userId)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.userId)}
                                        readOnly
                                        className="mr-2"
                                    />
                                    <span className="text-sm truncate">{user.username}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 text-center py-2">
                            {searchQuery.trim() !== '' ? 'No matching users' : 'No users available'}
                        </div>
                    )
                ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                        Loading...
                    </div>
                )}
            </div>
            
            {/* 已选用户计数 */}
            {selectedUserIds.length > 0 && (
                <div className="text-xs text-gray-600 mb-2">
                    Selected {selectedUserIds.length} users
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
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                        disabled={isLoadingUsers}
                    >
                        Apply
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
    [PropertyType.ID]: IDFilterConstructorPanel,
    // 注册单选筛选面板组件
    [PropertyType.SELECT]: SelectFilterConstructorPanel,
    // 注册富文本筛选面板组件
    [PropertyType.RICH_TEXT]: RichTextFilterConstructorPanel,
    // 注册多选筛选面板组件
    [PropertyType.MULTI_SELECT]: MultiSelectFilterConstructorPanel,
    // 注册矿机列表筛选面板组件
    [PropertyType.MINERS]: MinersFilterConstructorPanel,
    // 注册用户筛选面板组件
    [PropertyType.USER]: UserFilterConstructorPanel,
};

/**
 * 获取特定属性类型的筛选构造器面板组件
 * 
 * @param propertyType 属性类型
 * @returns 筛选构造器面板组件
 */
export function getFilterConstructorPanel(propertyType: string): FilterConstructorComponent {
    switch (propertyType) {
        case PropertyType.TEXT:
            return TextFilterConstructorPanel;
        case PropertyType.ID:
            return IDFilterConstructorPanel;
        case PropertyType.SELECT:
            return SelectFilterConstructorPanel;
        case PropertyType.RICH_TEXT:
            return RichTextFilterConstructorPanel;
        case PropertyType.MULTI_SELECT:
            return MultiSelectFilterConstructorPanel;
        case PropertyType.MINERS:
            return MinersFilterConstructorPanel;
        case PropertyType.USER:
            return UserFilterConstructorPanel;
        default:
            return DefaultFilterConstructorPanel;
    }
}

/**
 * 筛选构造器面板工厂函数
 * 
 * 根据属性类型返回相应的筛选构造器面板组件
 */
export function FilterConstructorPanel(props: FilterConstructorPanelProps): React.ReactElement {
    const { propertyDefinition, onCancel } = props;
    const Panel = getFilterConstructorPanel(propertyDefinition.type);
    
    return (
        // 阻止冒泡，防止触发 applied-filter 的点击事件（在编辑状态下， panel 会作为 applied-filter 的子组件）
        <div className={`${props.className}`} onClick={(e) => { e.stopPropagation(); }}>
            {/* 使用公共透明遮罩组件 */}
            <TransparentOverlay onClick={onCancel} />
            {/* 面板组件 */}
            <Panel {...props} />
        </div>
    );
} 