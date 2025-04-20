'use client';

import { FilterConstructorComponent } from '../../type';


/**
 * 默认筛选构造器面板组件
 *
 * 当找不到对应类型的筛选面板组件时使用
 */
export const DefaultFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition, onCancel,
}) => (
    <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-64">
        <div className="text-red-500 text-sm p-2">
            Unsupported filter type: {propertyDefinition.type}
        </div>
        <div className="flex justify-end mt-2">
            <button
                onClick={onCancel}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
                Close
            </button>
        </div>
    </div>
);
