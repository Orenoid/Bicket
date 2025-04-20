'use client';

import { PropertyTableCellComponent } from '../type';


export const DatetimePropertyCell: PropertyTableCellComponent = ({
    value, propertyConfig
}) => {
    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">{propertyConfig?.emptyText as string || ""}</span>;
    }

    try {
        // 尝试解析日期时间字符串
        const dateString = String(value);
        const date = new Date(dateString);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return <span className="text-gray-400 italic">Invalid datetime</span>;
        }

        // 格式化日期部分 (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFormatted = `${year}-${month}-${day}`;

        return <span>{dateFormatted}</span>;
    } catch (error) {
        console.error('日期格式化错误', error);
        return <span className="text-gray-400 italic">日期格式错误</span>;
    }
};