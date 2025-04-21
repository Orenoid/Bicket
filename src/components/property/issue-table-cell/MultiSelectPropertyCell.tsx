'use client';

import { StatusOption } from './type';
import { PropertyTableCellComponent } from '../type';

// 多选类型的单元格组件
export const MultiSelectPropertyCell: PropertyTableCellComponent = ({
    value, propertyConfig
}) => {
    // 处理空值显示
    if (value === null || value === undefined ||
        (Array.isArray(value) && value.length === 0)) {
        return <span className="text-gray-400 italic"></span>;
    }

    // 确保值是数组
    const valueArray = Array.isArray(value) ? value : [value];

    // 获取选项配置
    const options = (propertyConfig?.options as StatusOption[]) || [];
    // 查找匹配的选项
    const selectedOptions = options.filter(option => valueArray.includes(option.id)
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