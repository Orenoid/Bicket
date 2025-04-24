import { property } from "@prisma/client";
import { PropertyOperationType } from "../constants";
import { ValidationResult, DbOperationResult } from "../types";
import { BasePropertyUpdateProcessor } from "./base";

export class SelectPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
  ): ValidationResult {
    // 检查操作类型是否支持
    if (
      operationType !== PropertyOperationType.SET &&
      operationType !== PropertyOperationType.REMOVE
    ) {
      return {
        valid: false,
        errors: [
          `选择类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`,
        ],
      };
    }

    // SET操作需要校验payload
    if (operationType === PropertyOperationType.SET) {
      // 检查payload中是否包含value字段
      if (!("value" in payload)) {
        return {
          valid: false,
          errors: ["SET操作的payload必须包含value字段"],
        };
      }

      // 选择类型value必须是字符串或null
      const value = payload.value;
      if (value !== null && typeof value !== "string") {
        return {
          valid: false,
          errors: ["选择类型value字段必须为字符串或null"],
        };
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
    // 只需要验证SET操作
    if (operationType === PropertyOperationType.SET && payload.value !== null) {
      const value = payload.value as string;
      const config = property.config as Record<string, unknown> | null;

      // 配置中必须有options字段，且为数组
      if (!config || !Array.isArray(config.options)) {
        return {
          valid: false,
          errors: ["属性配置中缺少options数组"],
        };
      }

      // 检查所选值是否在可选项列表中
      const options = config.options as Array<{
        id: string;
        name: string;
        color: string;
      }>;
      const validValues = options.map((option) => option.id);

      if (!validValues.includes(value)) {
        return {
          valid: false,
          errors: [`所选值 "${value}" 不在可选项列表中`],
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
      case PropertyOperationType.SET:
        // 设置单值属性
        result.singleValueUpdate = {
          value: payload.value as string | null,
          number_value: null, // 选择类型不设置number_value
        };
        break;
      case PropertyOperationType.REMOVE:
        // 删除单值属性
        result.singleValueRemove = true;
        break;
    }

    return result;
  }
}
