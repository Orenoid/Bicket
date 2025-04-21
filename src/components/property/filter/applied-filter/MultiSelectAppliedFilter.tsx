'use client';

import { AppliedFilterComponent } from '../../type';


/**
 * 多选类型的已应用筛选组件
 */
export const MultiSelectAppliedFilter: AppliedFilterComponent = ({ filter, propertyDefinition }) => {
    // 获取选项配置
    const options = (propertyDefinition.config?.options || []) as { id: string; name: string; color: string; }[];

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
                            style={{ backgroundColor: option.color }} />
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
                                    style={{ backgroundColor: option.color }} />
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
                                    style={{ backgroundColor: option.color }} />
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
