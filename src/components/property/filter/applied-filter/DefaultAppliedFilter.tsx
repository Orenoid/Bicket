"use client";

import { AppliedFilterComponent } from "../../type";

/**
 * 默认已应用筛选组件
 * 当找不到对应的组件时使用
 */

export const DefaultAppliedFilter: AppliedFilterComponent = ({ filter }) => {
  const value = filter.value ? String(filter.value) : "";
  return <span>{value}</span>;
};
