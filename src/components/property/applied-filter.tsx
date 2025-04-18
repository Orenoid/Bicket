'use client';

import React, { useEffect, useState } from 'react';
import { FilterCondition } from '../../lib/property/types';
import { PropertyDefinition } from '../issue/IssuePage';
import { FiX } from 'react-icons/fi';
import { PropertyType } from '../../lib/property/constants';
import { getMinerById, getMinerStatusStyle } from '../../lib/miner/service';
import { getUser } from '../../app/user/service';

/**
 * 已应用筛选条件的属性接口
 */
export interface AppliedFilterProps {
    // 筛选条件
    filter: FilterCondition;
    // 对应的属性定义（用于获取属性名称等展示信息）
    propertyDefinition: PropertyDefinition;
}

/**
 * 已应用筛选组件类型
 * 
 * 不同属性类型可以实现自己特定的展示方式，此处为通用接口
 */
export type AppliedFilterComponent = React.FC<AppliedFilterProps>;

/**
 * 已应用筛选包装器组件属性接口
 */
export interface AppliedFilterWrapperProps {
    // 筛选条件
    filter: FilterCondition;
    // 对应的属性定义
    propertyDefinition: PropertyDefinition;
    // 移除筛选条件的回调
    onRemove: (filterId: string) => void;
    // 要使用的筛选组件
    FilterComponent: AppliedFilterComponent;
    // 点击已应用筛选条件的回调
    onClick?: () => void;
    // 子组件
    children?: React.ReactNode;
}

/**
 * 已应用筛选包装器组件
 * 
 * 为不同属性类型的筛选条件提供一个统一的包装，包含通用功能（如移除按钮）
 */
export const AppliedFilterWrapper: React.FC<AppliedFilterWrapperProps> = ({
    filter,
    propertyDefinition,
    onRemove,
    FilterComponent,
    onClick,
    children,
}) => {
    return (
        <div 
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2 hover:cursor-pointer relative"
            onClick={(e) => {
                // 阻止事件冒泡，避免触发表格行点击事件
                e.stopPropagation();
                // 如果提供了点击回调，则调用
                if (onClick) onClick();
            }}
        >
            <span className="font-medium text-gray-700 mr-1">{propertyDefinition.name}:</span>
            <div className="mr-2">
                <FilterComponent 
                    filter={filter}
                    propertyDefinition={propertyDefinition}
                />
            </div>
            <button 
                onClick={(e) => {
                    // 阻止事件冒泡，避免触发筛选条件点击事件
                    e.stopPropagation();
                    onRemove(filter.propertyId);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label={`移除${propertyDefinition.name}筛选`}
            >
                <FiX size={14} />
            </button>
            {children}
        </div>
    );
};

/**
 * 文本类型的已应用筛选组件
 * 
 * 显示文本类型属性的筛选条件
 * 注意：当前文本筛选构造器组件 (TextFilterConstructorPanel) 仅支持 'contains' 操作符
 * 其他操作符的支持是为了未来扩展做准备
 */
export const TextAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 从筛选条件中获取值
    const value = filter.value as string;
    
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'contains':
            return <div className="flex items-center whitespace-nowrap">contains &ldquo;{value}&rdquo;</div>;
        // 以下操作符当前筛选构造器未实现，但为未来扩展做准备
        case 'eq':
            return <span>eq &ldquo;{value}&rdquo;</span>;
        case 'startsWith':
            return <span>以 &ldquo;{value}&rdquo; 开头</span>;
        case 'endsWith':
            return <span>以 &ldquo;{value}&rdquo; 结尾</span>;
        default:
            return <div className="flex items-center whitespace-nowrap">{value}</div>;
    }
};

/**
 * ID 类型的已应用筛选组件
 * 
 * 显示 ID 类型属性的筛选条件
 */
export const IdAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'eq':
            // 等于操作符，值为单个数字
            return <div className="flex items-center whitespace-nowrap"> equal to {String(filter.value)}</div>;
        case 'in':
            // 包含操作符，值为数字数组
            const values = filter.value as number[];
            if (values.length === 1) {
                return <div className="flex items-center whitespace-nowrap">equal to {values[0]}</div>;
            } else if (values.length <= 3) {
                // 最多显示3个值
                return <div className="flex items-center whitespace-nowrap">is {values.join('、')}</div>;
            } else {
                // 超过3个值，显示数量
                return <div className="flex items-center whitespace-nowrap">contains {values.length} values</div>;
            }
        default:
            return <div className="flex items-center">{String(filter.value)}</div>;
    }
};

/**
 * 单选类型的已应用筛选组件
 * 
 * 显示单选类型属性的筛选条件
 */
export const SelectAppliedFilter: AppliedFilterComponent = ({ filter, propertyDefinition }) => {
    // 获取选项配置
    const options = (propertyDefinition.config?.options || []) as { id: string; name: string; color: string }[];
    
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'in':
            // 值为选项ID数组
            const selectedIds = filter.value as string[];
            // 找出选中的选项
            const selectedOptions = options.filter(option => selectedIds.includes(option.id));
            
            if (selectedOptions.length === 0) {
                return <span>无选中选项</span>;
            } else if (selectedOptions.length === 1) {
                // 单选情况
                const option = selectedOptions[0];
                return (
                    <div className="flex items-center whitespace-nowrap">
                        <span 
                            className="inline-block w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: option.color }} 
                        />
                        {option.name}
                    </div>
                );
            } else if (selectedOptions.length <= 2) {
                // 显示所有选中的选项名称（最多2个）
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedOptions.map(option => (
                            <div key={option.id} className="flex items-center">
                                <span 
                                    className="inline-block w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: option.color }} 
                                />
                                {option.name}
                            </div>
                        ))}
                    </div>
                );
            } else {
                // 超过2个选项，显示前2个和数量提示
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedOptions.slice(0, 2).map(option => (
                            <div key={option.id} className="flex items-center">
                                <span 
                                    className="inline-block w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: option.color }} 
                                />
                                {option.name}
                            </div>
                        ))}
                        <span className="text-xs text-gray-500">
                            +{selectedOptions.length - 2}
                        </span>
                    </div>
                );
            }
        default:
            return <span>{String(filter.value)}</span>;
    }
};

/**
 * 富文本类型的已应用筛选组件
 * 
 * 显示富文本类型属性的筛选条件
 */
export const RichTextAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 从筛选条件中获取值
    const value = filter.value as string;
    
    // 富文本筛选当前只支持contains操作符
    switch (filter.operator) {
        case 'contains':
            return <span>包含 &ldquo;{value}&rdquo;</span>;
        default:
            return <span>{value}</span>;
    }
};

/**
 * 多选类型的已应用筛选组件
 * 
 * 显示多选类型属性的筛选条件，支持多个标签的展示
 */
export const MultiSelectAppliedFilter: AppliedFilterComponent = ({ filter, propertyDefinition }) => {
    // 获取选项配置
    const options = (propertyDefinition.config?.options || []) as { id: string; name: string; color: string }[];
    
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'in':
            // 值为选项ID数组
            const selectedIds = filter.value as string[];
            // 找出选中的选项
            const selectedOptions = options.filter(option => selectedIds.includes(option.id));
            
            if (selectedOptions.length === 0) {
                return <div className="flex items-center whitespace-nowrap">无选中选项</div>;
            } else if (selectedOptions.length === 1) {
                // 单个选项情况
                const option = selectedOptions[0];
                return (
                    <div className="flex items-center whitespace-nowrap">
                        <span 
                            className="inline-block w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: option.color }} 
                        />
                        {option.name}
                    </div>
                );
            } else if (selectedOptions.length <= 3) {
                // 显示所有选中的选项名称（最多3个）
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedOptions.map(option => (
                            <div key={option.id} className="flex items-center">
                                <span 
                                    className="inline-block w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: option.color }} 
                                />
                                {option.name}
                            </div>
                        ))}
                    </div>
                );
            } else {
                // 超过3个选项，显示前2个和数量提示
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedOptions.slice(0, 2).map(option => (
                            <div key={option.id} className="flex items-center">
                                <span 
                                    className="inline-block w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: option.color }} 
                                />
                                {option.name}
                            </div>
                        ))}
                        <span className="text-xs text-gray-500">
                            +{selectedOptions.length - 2}
                        </span>
                    </div>
                );
            }
        default:
            return <span>{String(filter.value)}</span>;
    }
};

/**
 * 矿机列表类型的已应用筛选组件
 * 
 * 显示矿机列表类型属性的筛选条件，支持多个矿机ID的展示
 */
export const MinersAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'in':
            // 值为矿机ID数组
            const selectedIds = filter.value as string[];
            
            if (selectedIds.length === 0) {
                return <span>未选择矿机</span>;
            } else if (selectedIds.length === 1) {
                // 单个矿机情况
                const minerId = selectedIds[0];
                const miner = getMinerById(minerId);
                const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                return (
                    <span className="flex items-center">
                        <span 
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${statusStyle}`}
                        />
                        {minerId}
                    </span>
                );
            } else if (selectedIds.length <= 3) {
                // 显示所有选中的矿机ID（最多3个）
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedIds.map(minerId => {
                            const miner = getMinerById(minerId);
                            const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                            return (
                                <span key={minerId} className="flex items-center">
                                    <span 
                                        className={`inline-block w-2 h-2 rounded-full mr-1 ${statusStyle}`}
                                    />
                                    {minerId}
                                </span>
                            );
                        })}
                    </div>
                );
            } else {
                // 超过3个矿机，显示前2个和数量提示
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedIds.slice(0, 2).map(minerId => {
                            const miner = getMinerById(minerId);
                            const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                            return (
                                <span key={minerId} className="flex items-center">
                                    <span 
                                        className={`inline-block w-2 h-2 rounded-full mr-1 ${statusStyle}`}
                                    />
                                    {minerId}
                                </span>
                            );
                        })}
                        <span className="text-xs text-gray-500">
                            +{selectedIds.length - 2}
                        </span>
                    </div>
                );
            }
        default:
            return <span>{String(filter.value)}</span>;
    }
};

/**
 * 用户类型的已应用筛选组件
 * 
 * 显示用户类型属性的筛选条件，仅显示用户名
 */
export const UserAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 状态变量，存储已加载的用户数据
    const [users, setUsers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    
    // 根据操作符显示不同的格式
    const displayState = () => {
        const userIds = filter.value as string[];
        
        if (userIds.length === 0) {
            return <span>无选中用户</span>;
        }

        if (isLoading) {
            return <div className='flex items-center whitespace-nowrap'>Loading...</div>;
        }

        // 构建显示内容
        if (userIds.length === 1) {
            // 单个用户
            return <div className='flex items-center whitespace-nowrap'>{users[userIds[0]] || '未知用户'}</div>;
        } else if (userIds.length <= 2) {
            // 显示所有用户名称（最多2个）
            return (
                <div className="flex items-center gap-x-2 whitespace-nowrap">
                    {userIds.map(id => (
                        <div key={id}>
                            {users[id] || '未知用户'}
                        </div>
                    ))}
                </div>
            );
        } else {
            // 超过2个用户，显示前2个和数量提示
            return (
                <div className="flex items-center gap-x-2 whitespace-nowrap">
                    {userIds.slice(0, 2).map(id => (
                        <div key={id}>
                            {users[id] || '未知用户'}
                        </div>
                    ))}
                    <span className="text-xs text-gray-500">
                        +{userIds.length - 2}
                    </span>
                </div>
            );
        }
    };
    
    // 加载用户数据
    useEffect(() => {
        const userIds = filter.value as string[];
        if (userIds.length === 0) {
            setIsLoading(false);
            return;
        }
        
        async function loadUsers() {
            setIsLoading(true);
            try {
                // 创建一个用户ID到用户名的映射
                const userMap: Record<string, string> = {};
                
                // 并行加载所有用户数据
                await Promise.all(
                    userIds.map(async (userId) => {
                        try {
                            const userData = await getUser(userId);
                            userMap[userId] = userData.username;
                        } catch (error) {
                            console.error(`获取用户信息失败: ${userId}`, error);
                            userMap[userId] = '未知用户';
                        }
                    })
                );
                
                setUsers(userMap);
            } catch (error) {
                console.error('加载用户信息失败', error);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadUsers();
    }, [filter.value]);
    
    // 处理不同的操作符
    switch (filter.operator) {
        case 'in':
            return displayState();
        default:
            // 不支持的操作符，显示原始值
            return <div className='flex items-center whitespace-nowrap'>{String(filter.value)}</div>;
    }
};

/**
 * 已应用筛选组件映射表
 * 
 * 将属性类型映射到对应的应用筛选组件
 */
export const APPLIED_FILTER_COMPONENTS: Record<string, AppliedFilterComponent> = {
    // 基本类型使用 TextAppliedFilter 组件
    [PropertyType.TEXT]: TextAppliedFilter,
    [PropertyType.ID]: IdAppliedFilter,
    // 选项类型使用 SelectAppliedFilter 组件
    [PropertyType.SELECT]: SelectAppliedFilter,
    // 富文本类型使用 RichTextAppliedFilter 组件
    [PropertyType.RICH_TEXT]: RichTextAppliedFilter,
    // 多选类型使用 MultiSelectAppliedFilter 组件
    [PropertyType.MULTI_SELECT]: MultiSelectAppliedFilter,
    // 矿机列表类型使用 MinersAppliedFilter 组件
    [PropertyType.MINERS]: MinersAppliedFilter,
    // 用户类型使用 UserAppliedFilter 组件
    [PropertyType.USER]: UserAppliedFilter
};

/**
 * 获取属性类型对应的应用筛选组件
 * 
 * @param propertyType 属性类型
 * @returns 应用筛选组件
 */
export function getAppliedFilterComponent(propertyType: string): AppliedFilterComponent {
    switch (propertyType) {
        case PropertyType.TEXT:
            return TextAppliedFilter;
        case PropertyType.ID:
            return IdAppliedFilter;
        case PropertyType.SELECT:
            return SelectAppliedFilter;
        case PropertyType.RICH_TEXT:
            return RichTextAppliedFilter;
        case PropertyType.MULTI_SELECT:
            return MultiSelectAppliedFilter;
        case PropertyType.MINERS:
            return MinersAppliedFilter;
        case PropertyType.USER:
            return UserAppliedFilter;
        default:
            // 默认返回文本过滤器
            return TextAppliedFilter;
    }
} 