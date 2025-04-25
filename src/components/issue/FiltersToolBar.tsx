"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import { getFiltersStateParser } from "@/lib/parser";
import {
  FILTERABLE_PROPERTY_TYPES,
  PropertyType,
} from "@/lib/property/constants";
import { FilterCondition, PropertyDefinition } from "@/lib/property/types";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { MdClose, MdFilterList } from "react-icons/md";
import { AppliedFilterWrapper } from "../property/filter/applied-filter/AppliedFilterWrapper";
import { FilterConstructorWrapperPanel } from "../property/filter/filter-constructor/FilterConstructorWrapperPanel";
import {
  getAppliedFilterComponent,
  getFilterConstructorComponent,
} from "../property/registry-utils";
import { Button } from "../shadcn/ui/button";

const FILTERS_QUERY_KEY = "filters";

export interface FilterToolBarProps {
  propertyDefinitions: PropertyDefinition[];
}

export default function FiltersToolBar({
  propertyDefinitions,
}: FilterToolBarProps) {
  const [selectedPropertyFilter, setSelectedPropertyFilter] =
    useState<PropertyDefinition | null>(null);
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [appliedFilters_, setAppliedFilters] = useQueryState(
    FILTERS_QUERY_KEY,
    getFiltersStateParser(),
  );
  const appliedFilters = appliedFilters_ ?? [];

  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    router.refresh();
  }, [router, searchParams]);

  const handleFilterApply = (filter: FilterCondition | null) => {
    if (filter) {
      if (editingFilter) {
        // 修改现有筛选条件
        setAppliedFilters(
          appliedFilters.map((existingFilter) =>
            existingFilter.propertyId === filter.propertyId
              ? filter // 替换现有的筛选条件
              : existingFilter,
          ),
        );
      } else {
        // 新增筛选条件
        setAppliedFilters([...appliedFilters, filter]);
      }
    }
    setSelectedPropertyFilter(null); // 关闭筛选面板
    setEditingFilter(null); // 关闭编辑面板
  };

  // 取消设置 filter
  const handleFilterCancel = () => {
    setSelectedPropertyFilter(null); // 关闭筛选面板
    setEditingFilter(null); // 关闭编辑面板
  };

  // 移除筛选条件
  const handleRemoveFilter = (propertyID: string) => {
    setAppliedFilters(
      appliedFilters.filter((filter) => filter.propertyId !== propertyID),
    );
  };

  // 清除所有筛选条件
  const handleClearAllFilters = () => {
    setAppliedFilters([]);
    setSelectedPropertyFilter(null);
    setEditingFilter(null);
  };

  // 获取某个属性的当前 filter
  const getCurrentFilter = (propertyId: string): FilterCondition | null => {
    return appliedFilters.find((f) => f.propertyId === propertyId) || null;
  };

  const getPropertyDefinition = (
    propertyId: string,
  ): PropertyDefinition | null => {
    return propertyDefinitions.find((p) => p.id === propertyId) || null;
  };

  // 可筛选属性下拉菜单
  const filterMenuItems = propertyDefinitions
    .filter((prop) =>
      FILTERABLE_PROPERTY_TYPES.includes(prop.type as PropertyType),
    )
    // 过滤掉已经设置了过滤条件的属性
    .filter(
      (prop) => !appliedFilters.some((filter) => filter.propertyId === prop.id),
    )
    .map((prop) => ({
      label: prop.name,
      onClick: () => {
        setSelectedPropertyFilter(prop);
      },
    }));

  // 渲染已应用的筛选条件
  const renderAppliedFilters = () => {
    return appliedFilters.map((filter) => {
      const propertyDef = getPropertyDefinition(filter.propertyId);
      if (!propertyDef) return null;

      // 使用工厂方法动态获取对应类型的筛选组件
      const FilterComponent = getAppliedFilterComponent(propertyDef.type);
      const isEditing = editingFilter === filter.propertyId;

      return (
        <AppliedFilterWrapper
          key={filter.propertyId}
          filter={filter}
          propertyDefinition={propertyDef}
          onRemove={handleRemoveFilter}
          FilterComponent={FilterComponent}
          onClick={() => {
            setEditingFilter(isEditing ? null : filter.propertyId);
          }}
        >
          {/* 点击 applied filter 时，打开编辑面板 */}
          {isEditing && (
            <FilterConstructorWrapperPanel
              ConstructorComponent={getFilterConstructorComponent(
                propertyDef.type,
              )}
              props={{
                propertyDefinition: propertyDef,
                currentFilter: filter,
                onApply: handleFilterApply,
                onCancel: handleFilterCancel,
                className: "absolute left-0 top-[100%]",
              }}
            />
          )}
        </AppliedFilterWrapper>
      );
    });
  };

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row items-center mr-2">
        {/* 横向展示当前已设置的筛选条件列表 */}
        {renderAppliedFilters()}
        {/* clear 按钮，当筛选条件数量大于等于 2 时显示 */}
        {appliedFilters.length >= 2 && (
          <Button onClick={handleClearAllFilters} variant="outline">
            <span className="mr-1">Clear</span>
            <MdClose size={16} />
          </Button>
        )}
      </div>
      {/* 筛选器下拉菜单 */}
      <DropdownMenu>
        <div className="relative">
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MdFilterList
                size={16}
                className={clsx("text-gray-500", {
                  "mr-2": appliedFilters.length === 0,
                })}
              />
              {appliedFilters.length === 0 && <span>Filter</span>}
            </Button>
          </DropdownMenuTrigger>
          {/* 设置筛选条件的面板，选择某个属性后显示 */}
          {selectedPropertyFilter && (
            <FilterConstructorWrapperPanel
              ConstructorComponent={getFilterConstructorComponent(
                selectedPropertyFilter.type,
              )}
              props={{
                propertyDefinition: selectedPropertyFilter,
                currentFilter: getCurrentFilter(selectedPropertyFilter.id),
                onApply: handleFilterApply,
                onCancel: handleFilterCancel,
                className: "absolute top-[100%] left-0",
              }}
            />
          )}
        </div>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Properties</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {filterMenuItems.map((item) => (
              <DropdownMenuItem key={item.label} onClick={item.onClick}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
