import { property } from "@prisma/client";
import { PropertyOperationType, SystemPropertyId } from "../constants";
import { ValidationResult, DbOperationResult } from "../types";
import { BasePropertyUpdateProcessor } from "./base";

export class TextPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
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
          `文本类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`,
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

      // 检查value字段是否为字符串类型或null
      const value = payload.value;
      if (value !== null && typeof value !== "string") {
        return {
          valid: false,
          errors: ["value字段必须为字符串类型或null"],
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
    // 对标题类型的特殊处理：标题不允许为空
    if (
      property.id === SystemPropertyId.TITLE &&
      operationType === PropertyOperationType.SET
    ) {
      const value = payload.value;

      // 不允许设置为null或空字符串
      if (
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return {
          valid: false,
          errors: ["标题不能为空"],
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
          number_value: null, // 文本类型不设置number_value
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
