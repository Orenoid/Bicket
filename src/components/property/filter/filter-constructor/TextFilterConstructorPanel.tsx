'use client';

import { useState } from 'react';
import { FilterConstructorComponent } from '../../type';


/**
 * 文本筛选构造器面板组件
 */

export const TextFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition, currentFilter, onApply, onCancel,
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
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
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded" />
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
