"use client";

import { AppliedFilterComponent } from "../../type";

/**
 * ID 类型的已应用筛选组件
 */
export const IDAppliedFilter: AppliedFilterComponent = ({ filter }) => {
  // 根据操作符显示不同的格式
  switch (filter.operator) {
    case "eq":
      return (
        <div className="whitespace-nowrap">
          {" "}
          equals to {String(filter.value)}
        </div>
      );
    case "in":
      // 包含操作符，值为数字数组
      const values = filter.value as number[];
      if (values.length === 1) {
        return <div className="whitespace-nowrap"> equals to {values[0]}</div>;
      } else if (values.length <= 3) {
        // 最多显示3个值
        return <div className="whitespace-nowrap">is {values.join("、")}</div>;
      } else {
        // 超过3个值，显示数量
        return (
          <div className="whitespace-nowrap">
            contains {values.length} values
          </div>
        );
      }
    default:
      return <div className="flex items-center">{String(filter.value)}</div>;
  }
};
