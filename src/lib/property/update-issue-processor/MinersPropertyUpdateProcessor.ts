import { property } from '@prisma/client';
import { PropertyOperationType } from '../constants';
import { ValidationResult, DbOperationResult } from '../types';
import { BasePropertyUpdateProcessor } from './base';


export class MinersPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 检查操作类型是否支持
    if (![PropertyOperationType.UPDATE, PropertyOperationType.ADD, PropertyOperationType.REMOVE].includes(operationType as PropertyOperationType)) {
      return {
        valid: false,
        errors: [`矿机列表属性不支持操作类型: ${operationType}，支持的操作类型为 ${PropertyOperationType.ADD}、${PropertyOperationType.UPDATE} 和 ${PropertyOperationType.REMOVE}`]
      };
    }

    // ADD操作需要校验payload
    if (operationType === PropertyOperationType.ADD) {
      // 检查payload中是否包含value字段
      if (!('value' in payload)) {
        return {
          valid: false,
          errors: ['ADD操作的payload必须包含value字段']
        };
      }

      // value必须是字符串
      if (typeof payload.value !== 'string') {
        return {
          valid: false,
          errors: ['ADD操作的value字段必须为字符串类型']
        };
      }
    }

    // UPDATE操作需要校验payload
    if (operationType === PropertyOperationType.UPDATE) {
      // 检查payload中是否包含values字段
      if (!('values' in payload)) {
        return {
          valid: false,
          errors: ['UPDATE操作的payload必须包含values字段']
        };
      }

      // values必须是数组
      if (!Array.isArray(payload.values)) {
        return {
          valid: false,
          errors: ['UPDATE操作的values字段必须为数组类型']
        };
      }

      // 数组中每个元素必须是字符串
      for (const value of payload.values as unknown[]) {
        if (typeof value !== 'string') {
          return {
            valid: false,
            errors: ['UPDATE操作的values数组中每个元素必须为字符串类型']
          };
        }
      }
    }

    // 格式验证通过
    return { valid: true };
  }

  validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    const config = property.config as Record<string, unknown> | null;

    // 检查是否存在最大选择数限制
    if (config && typeof config.maxSelect === 'number') {
      const maxSelect = config.maxSelect as number;

      // UPDATE操作：检查是否超过最大选择数
      if (operationType === PropertyOperationType.UPDATE) {
        const values = payload.values as string[];

        // 检查是否有重复值
        const uniqueValues = new Set(values);
        if (uniqueValues.size !== values.length) {
          return {
            valid: false,
            errors: ['values数组中存在重复的矿机ID']
          };
        }

        // 检查是否超过最大选择数
        if (values.length > maxSelect) {
          return {
            valid: false,
            errors: [`属性 ${property.name} 最多只能选择 ${maxSelect} 个矿机`]
          };
        }
      }

      // ADD操作：由于无法知道当前已有多少个矿机，所以无法在此验证
      // 实际应该在服务端实现完整的验证
    }

    // 业务规则验证通过
    return { valid: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, issueId: string): DbOperationResult {
    const result: DbOperationResult = {};

    switch (operationType) {
      case PropertyOperationType.REMOVE:
        // 删除所有多值数据
        result.multiValueRemovePositions = Array.from({ length: 1000 }, (_, i) => i); // 使用足够大的范围确保删除所有
        break;

      case PropertyOperationType.ADD:
        // 添加单个矿机ID
        const minerId = payload.value as string;

        // 实际实现应该先查询已有的多值数据，然后使用最大position + 1
        result.multiValueCreates = [{
          value: minerId,
          position: 0, // 实际实现应使用查询结果
          number_value: null
        }];
        break;

      case PropertyOperationType.UPDATE:
        // 先删除所有旧值，然后添加新矿机ID数组
        const minerIds = payload.values as string[];

        // 删除所有旧值
        result.multiValueRemovePositions = Array.from({ length: 1000 }, (_, i) => i);

        // 添加新矿机ID数组
        result.multiValueCreates = minerIds.map((minerId, index) => ({
          value: minerId,
          position: index,
          number_value: null
        }));
        break;
    }

    return result;
  }
}
