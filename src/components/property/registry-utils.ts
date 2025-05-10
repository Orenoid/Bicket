import { Registry, REGISTRY_NAMES } from "@/lib/registry";
import {
  AppliedFilterComponent,
  FilterConstructorComponent,
  PropertyTableCellComponent,
} from "./type";
import { DefaultPropertyCell } from "./issue-table-cell";
import { DefaultAppliedFilter, DefaultFilterConstructorPanel } from "./filter";

/**
 * 批量注册单元格组件
 *
 * @param components 属性类型与组件的映射对象
 */
export function registerPropertyTableCellComponents(
  components: Record<string, PropertyTableCellComponent>,
): void {
  Registry.getRegistry<PropertyTableCellComponent>(
    REGISTRY_NAMES.PROPERTY_TABLE_CELL,
  ).registerAll(components);
}

/**
 * 获取属性类型对应的 PropertyTableCellComponent
 *
 * @param propertyType 属性类型
 * @returns 对应的组件
 */
export function getPropertyTableCellComponent(
  propertyType: string,
): PropertyTableCellComponent {
  console.log('getPropertyTableCellComponent', propertyType);
  return Registry.getRegistry<PropertyTableCellComponent>(
    REGISTRY_NAMES.PROPERTY_TABLE_CELL,
  ).get(propertyType, DefaultPropertyCell);
}

/**
 * 批量注册已应用筛选组件
 *
 * @param components 属性类型与组件的映射对象
 */

export function registerAppliedFilterComponents(
  components: Record<string, AppliedFilterComponent>,
): void {
  Registry.getRegistry<AppliedFilterComponent>(
    REGISTRY_NAMES.APPLIED_FILTER,
  ).registerAll(components);
}

/**
 * 获取属性类型对应的 AppliedFilterComponent
 *
 * 使用工厂方法获取组件
 * 如果没有找到对应的组件，将使用默认组件
 *
 * @param propertyType 属性类型
 * @returns 对应的组件
 */

export function getAppliedFilterComponent(
  propertyType: string,
): AppliedFilterComponent {
  return Registry.getRegistry<AppliedFilterComponent>(
    REGISTRY_NAMES.APPLIED_FILTER,
  ).get(propertyType, DefaultAppliedFilter);
}

/**
 * 批量注册筛选构造器组件
 *
 * @param components 属性类型与组件的映射对象
 */
export function registerFilterConstructorComponents(
  components: Record<string, FilterConstructorComponent>,
): void {
  Registry.getRegistry<FilterConstructorComponent>(
    REGISTRY_NAMES.FILTER_CONSTRUCTOR,
  ).registerAll(components);
}

/**
 * 获取属性类型对应的 FilterConstructorComponent
 *
 * 使用工厂方法获取组件
 * 如果没有找到对应的组件，将使用默认组件
 *
 * @param propertyType 属性类型
 * @returns 对应的组件
 */

export function getFilterConstructorComponent(
  propertyType: string,
): FilterConstructorComponent {
  return Registry.getRegistry<FilterConstructorComponent>(
    REGISTRY_NAMES.FILTER_CONSTRUCTOR,
  ).get(propertyType, DefaultFilterConstructorPanel);
}
