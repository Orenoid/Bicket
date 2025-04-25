"use client";

import { PropertyDefinition } from "@/lib/property/types";
import { FilterCondition } from "@/lib/property/types";
import React from "react";
import { FiX } from "react-icons/fi";
import { AppliedFilterComponent } from "../../type";
import { Button } from "@/components/shadcn/ui/button";

export interface AppliedFilterWrapperProps {
  // 筛选条件
  filter: FilterCondition;
  // 对应的属性定义
  propertyDefinition: PropertyDefinition;
  // 移除筛选条件的回调
  onRemove: (filterId: string) => void;
  // 要使用的筛选组件
  FilterComponent: AppliedFilterComponent;
  // 点击已应用筛选条件的回调
  onClick?: () => void;
  // 子组件
  children?: React.ReactNode;
}
/**
 * 为不同属性类型的筛选条件提供一个统一的包装，包含通用功能（如移除按钮）
 */
export const AppliedFilterWrapper: React.FC<AppliedFilterWrapperProps> = ({
  filter,
  propertyDefinition,
  onRemove,
  FilterComponent,
  onClick,
  children,
}) => {
  return (
    <Button asChild
      variant="outline"
      className="flex items-center px-3 py-1 mr-2 relative"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div>
        <span className="font-medium text-gray-700 mr-1">
          {propertyDefinition.name}
        </span>
        <div className="mr-1 border-l border-r border-gray-300 px-2">
          <FilterComponent
            filter={filter}
            propertyDefinition={propertyDefinition}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(filter.propertyId);
          }}
          className="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label={`Remove ${propertyDefinition.name} filter`}
        >
          <FiX size={14} />
        </button>
        {children}
      </div>
    </Button>
  );
};
