"use client";

import { PropertyTableCellComponent } from "../type";

// 文本类型的单元格组件

export const TextPropertyCell: PropertyTableCellComponent = ({
  value,
  propertyConfig,
}) => {
  // 处理空值显示
  if (value === null || value === undefined || value === "") {
    return (
      <span className="text-gray-400 italic">
        {(propertyConfig?.emptyText as string) || "空"}
      </span>
    );
  }

  // 处理文本值
  const textValue = String(value);
  const maxLength = (propertyConfig?.maxDisplayLength as number) || 100;

  // 如果文本过长，截断并显示省略号
  if (textValue.length > maxLength) {
    return (
      <span title={textValue}>{textValue.substring(0, maxLength)}...</span>
    );
  }

  return <span>{textValue}</span>;
};
