'use client';

import { AppliedFilterComponent } from '../../type';


/**
 * 文本类型的已应用筛选组件
 * 注意：当前文本筛选构造器组件 (TextFilterConstructorPanel) 仅支持 'contains' 操作符
 * 其他操作符的支持是为了未来扩展做准备
 */
export const TextAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 从筛选条件中获取值
    const value = filter.value as string;

    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'contains':
            return <div className="flex items-center whitespace-nowrap">contains &ldquo;{value}&rdquo;</div>;
        // 以下操作符当前筛选构造器未实现，但为未来扩展做准备
        case 'eq':
            return <span>eq &ldquo;{value}&rdquo;</span>;
        case 'startsWith':
            return <span>以 &ldquo;{value}&rdquo; 开头</span>;
        case 'endsWith':
            return <span>以 &ldquo;{value}&rdquo; 结尾</span>;
        default:
            return <div className="flex items-center whitespace-nowrap">{value}</div>;
    }
};
