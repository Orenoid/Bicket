import { property } from "@prisma/client";
import { PropertyOperationType } from "../constants";
import { ValidationResult, DbOperationResult } from "../types";
import { BasePropertyUpdateProcessor } from "./base";

export class MultiSelectPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
  ): ValidationResult {
    // 检查操作类型是否支持
    if (
      ![
        PropertyOperationType.UPDATE,
        PropertyOperationType.ADD,
        PropertyOperationType.REMOVE,
      ].includes(operationType as PropertyOperationType)
    ) {
      return {
        valid: false,
        errors: [
          `多选类型属性不支持操作类型: ${operationType}，支持的操作类型为 ${PropertyOperationType.ADD}、${PropertyOperationType.UPDATE} 和 ${PropertyOperationType.REMOVE}`,
        ],
      };
    }

    // ADD操作需要校验payload
    if (operationType === PropertyOperationType.ADD) {
      // 检查payload中是否包含value字段
      if (!("value" in payload)) {
        return {
          valid: false,
          errors: ["ADD操作的payload必须包含value字段"],
        };
      }

      // value必须是字符串
      if (typeof payload.value !== "string") {
        return {
          valid: false,
          errors: ["ADD操作的value字段必须为字符串类型"],
        };
      }
    }

    // UPDATE操作需要校验payload
    if (operationType === PropertyOperationType.UPDATE) {
      // 检查payload中是否包含values字段
      if (!("values" in payload)) {
        return {
          valid: false,
          errors: ["UPDATE操作的payload必须包含values字段"],
        };
      }

      // values必须是数组
      if (!Array.isArray(payload.values)) {
        return {
          valid: false,
          errors: ["UPDATE操作的values字段必须为数组类型"],
        };
      }

      // 数组中每个元素必须是字符串
      for (const value of payload.values as unknown[]) {
        if (typeof value !== "string") {
          return {
            valid: false,
            errors: ["UPDATE操作的values数组中每个元素必须为字符串类型"],
          };
        }
      }
    }

    // 格式验证通过
    return { valid: true };
  }

  validateBusinessRules(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
  ): ValidationResult {
    // 获取配置中的选项列表
    const config = property.config as Record<string, unknown> | null;

    // 配置中必须有options字段，且为数组
    if (!config || !Array.isArray(config.options)) {
      return {
        valid: false,
        errors: ["属性配置中缺少options数组"],
      };
    }

    // 获取所有有效的选项ID
    const options = config.options as Array<{
      id: string;
      name: string;
      color: string;
    }>;
    const validOptionIds = options.map((option) => option.id);

    // ADD操作：检查添加的值是否在可选项列表中
    if (operationType === PropertyOperationType.ADD) {
      const value = payload.value as string;

      if (!validOptionIds.includes(value)) {
        return {
          valid: false,
          errors: [`所选值 "${value}" 不在可选项列表中`],
        };
      }
    }

    // UPDATE操作：检查更新的所有值是否在可选项列表中
    if (operationType === PropertyOperationType.UPDATE) {
      const values = payload.values as string[];

      // 检查是否有重复值
      const uniqueValues = new Set(values);
      if (uniqueValues.size !== values.length) {
        return {
          valid: false,
          errors: ["values数组中存在重复的选项ID"],
        };
      }

      // 检查每个值是否在可选项列表中
      for (const value of values) {
        if (!validOptionIds.includes(value)) {
          return {
            valid: false,
            errors: [`所选值 "${value}" 不在可选项列表中`],
          };
        }
      }

      // 检查是否超过最大选择数
      const maxSelect = config.maxSelect as number | undefined;
      if (typeof maxSelect === "number" && values.length > maxSelect) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 最多只能选择 ${maxSelect} 个选项`],
        };
      }
    }

    // 业务规则验证通过
    return { valid: true };
  }

  transformToDbOperations(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    issueId: string,
  ): DbOperationResult {
    const result: DbOperationResult = {};

    switch (operationType) {
      case PropertyOperationType.REMOVE:
        // 删除所有多值数据
        result.multiValueRemovePositions = Array.from(
          { length: 1000 },
          (_, i) => i,
        ); // 使用足够大的范围确保删除所有
        break;

      case PropertyOperationType.ADD:
        // 添加单个值
        const valueToAdd = payload.value as string;

        // 使用计数查询获取当前多值数据的数量，作为新值的position
        // 注意：由于这里无法直接查询数据库，所以使用近似方法
        // 实际实现时应该先查询已有的多值数据，然后使用最大position + 1
        result.multiValueCreates = [
          {
            value: valueToAdd,
            position: 0, // 实际实现应使用查询结果
            number_value: null,
          },
        ];
        break;

      case PropertyOperationType.UPDATE:
        // 先删除所有旧值，然后添加新值数组
        const valuesToUpdate = payload.values as string[];

        // 删除所有旧值
        result.multiValueRemovePositions = Array.from(
          { length: 1000 },
          (_, i) => i,
        );

        // 添加新值数组
        result.multiValueCreates = valuesToUpdate.map((value, index) => ({
          value,
          position: index,
          number_value: null,
        }));
        break;
    }

    return result;
  }
}
