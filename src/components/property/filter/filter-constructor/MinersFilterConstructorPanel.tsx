'use client';

import { getSimpleMinersList, getMinerStatusStyle } from '@/lib/miner/service';
import { useState } from 'react';
import { FilterConstructorComponent } from '../../type';


/**
 * 矿机列表类型的筛选构造器面板
 *
 * 提供矿机列表筛选界面，支持多选模式
 */

export const MinersFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition, currentFilter, onApply, onCancel,
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
        setSelectedMiners(prev => prev.includes(minerId)
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
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
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
                                    className="mr-2" />
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${getMinerStatusStyle(miner.status)}`} />
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
