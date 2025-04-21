'use client';

import { StatusOption } from './type';
import { PropertyTableCellComponent } from '../type';


// 单选类型的单元格组件

export const SelectPropertyCell: PropertyTableCellComponent = ({
    value, propertyConfig
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic"></span>;
    }

    // 获取选项配置
    const options = (propertyConfig?.options as StatusOption[]) || [];
    // 查找匹配的选项
    const selectedOption = options.find(option => option.id === value);

    if (!selectedOption) {
        return <span className="text-gray-400 italic">无效选项</span>;
    }

    return (
        <span
            className="inline-block px-3 py-0.5 rounded-full text-xs font-medium"
            style={{
                backgroundColor: selectedOption.color,
                color: selectedOption.color === '#e5e5e5' ? '#666666' : 'white'
            }}
        >
            {selectedOption.name}
        </span>
    );
};