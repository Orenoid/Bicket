"use client";

import { AppliedFilterComponent } from "../../type";

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
    case "contains":
      return (
        <div className="flex items-center whitespace-nowrap">
          contains &ldquo;{value}&rdquo;
        </div>
      );
    default:
      return <div className="flex items-center whitespace-nowrap">{value}</div>;
  }
};
