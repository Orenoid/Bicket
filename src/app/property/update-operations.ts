import { PropertyOperationType } from './constants';

/**
 * 简单值属性的SET操作负载
 */
export interface SetValuePayload extends Record<string, unknown> {
  value: string | null;
}

/**
 * 创建SET操作负载
 * @param value 属性值
 * @returns SET操作负载
 */
export function createSetValuePayload(value: string | null): SetValuePayload {
  return { value };
}

/**
 * 创建标准属性操作
 * @param propertyId 属性ID
 * @param operationType 操作类型
 * @param operationPayload 操作负载
 * @returns 标准属性操作对象
 */
export function createPropertyOperation(
  propertyId: string,
  operationType: string,
  operationPayload: Record<string, unknown>
) {
  return {
    property_id: propertyId,
    operation_type: operationType,
    operation_payload: operationPayload
  };
}

/**
 * 创建SET属性值操作
 * @param propertyId 属性ID
 * @param value 属性值
 * @returns 属性SET操作对象
 */
export function createSetOperation(propertyId: string, value: string | null) {
  return createPropertyOperation(
    propertyId,
    PropertyOperationType.SET,
    createSetValuePayload(value)
  );
}

/**
 * 创建REMOVE属性值操作
 * @param propertyId 属性ID
 * @returns 属性REMOVE操作对象
 */
export function createRemoveOperation(propertyId: string) {
  return createPropertyOperation(
    propertyId,
    PropertyOperationType.REMOVE,
    {}
  );
}