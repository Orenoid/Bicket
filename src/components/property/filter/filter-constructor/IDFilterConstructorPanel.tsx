'use client';

import { useState } from 'react';
import { FilterConstructorComponent } from '../../type';


/**
 * ID 筛选构造器面板组件
 *
 * 用于 ID 类型属性的筛选条件设置，支持数值比较操作
 */

export const IDFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition, currentFilter, onApply, onCancel,
}) => {
    // 初始化操作符和值
    const [operator, setOperator] = useState<string>(
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>

            {/* 操作符选择 */}
            <div className="mb-3">
                <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as string)}
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
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded" />
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
