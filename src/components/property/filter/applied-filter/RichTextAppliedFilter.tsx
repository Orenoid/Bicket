'use client';

import { AppliedFilterComponent } from '../../type';


/**
 * 富文本类型的已应用筛选组件
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
