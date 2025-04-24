import { Registry, REGISTRY_NAMES } from "@/lib/registry";
import { PropertyUpdateProcessor, PropertyValueProcessor } from "./types";

/**
 * 批量注册属性更新处理器
 * 
 * @param processors 属性类型与处理器的映射对象
 */
export function registerPropertyUpdateProcessors(
  processors: Record<string, PropertyUpdateProcessor>
): void {
  Registry.getRegistry<PropertyUpdateProcessor>(REGISTRY_NAMES.PROPERTY_UPDATE_PROCESSOR).registerAll(processors);
}

/**
 * 获取属性类型对应的 PropertyUpdateProcessor
 *
 * @param propertyType 属性类型
 * @returns 对应的 PropertyUpdateProcessor
 */
export function getPropertyUpdateProcessor(propertyType: string): PropertyUpdateProcessor {
  return Registry.getRegistry<PropertyUpdateProcessor>(REGISTRY_NAMES.PROPERTY_UPDATE_PROCESSOR).mustGet(propertyType);
}

/**
 * 批量注册属性创建处理器
 * 
 * @param processors 属性类型与处理器的映射对象
 */
export function registerIssueCreationPropertyProcessors(
  processors: Record<string, PropertyValueProcessor>
): void {
  Registry.getRegistry<PropertyValueProcessor>(REGISTRY_NAMES.PROPERTY_VALUE_PROCESSOR).registerAll(processors);
}

/**
 * 获取属性类型对应的 PropertyValueProcessor
 *
 * @param propertyType 属性类型
 * @returns 对应的 PropertyValueProcessor
 */
export function getIssueCreationPropertyProcessor(propertyType: string): PropertyValueProcessor {
  return Registry.getRegistry<PropertyValueProcessor>(REGISTRY_NAMES.PROPERTY_VALUE_PROCESSOR).mustGet(propertyType);
}
