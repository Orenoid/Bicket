'use client';

import { useState } from 'react';
import { FilterConstructorComponent } from '../../type';
import { SelectOption } from './SelectFilterConstructorPanel';


/**
 * 多选类型筛选构造器面板组件
 *
 * 用于多选类型属性的筛选条件设置，与单选类型类似，但支持多个值的选择
 */

export const MultiSelectFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition, currentFilter, onApply, onCancel,
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
        setSelectedValues(prev => prev.includes(optionId)
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
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
                                    className="mr-2" />
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: option.color }} />
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
