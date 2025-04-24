import { property } from "@prisma/client";
import { PropertyOperationType } from "../constants";
import { ValidationResult, DbOperationResult } from "../types";
import { BasePropertyUpdateProcessor } from "./base";

export class RichTextPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
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
          `富文本类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`,
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

      // 富文本类型value必须是字符串或null
      const value = payload.value;
      if (value !== null && typeof value !== "string") {
        return {
          valid: false,
          errors: ["富文本类型value字段必须为字符串或null"],
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
    // SET操作且属性不允许为null时，不能设置为null或空
    if (operationType === PropertyOperationType.SET && !property.nullable) {
      const value = payload.value;

      // 如果不允许为null，检查值是否为null或空字符串
      if (
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 不允许为空`],
        };
      }
    }

    // 如果设置了最大长度限制，检查值是否超过限制
    if (operationType === PropertyOperationType.SET && payload.value !== null) {
      const stringValue = payload.value as string;
      const config = property.config as Record<string, unknown> | undefined;

      if (
        config &&
        typeof config.maxLength === "number" &&
        stringValue.length > config.maxLength
      ) {
        return {
          valid: false,
          errors: [
            `属性 ${property.name} 长度不能超过 ${config.maxLength} 个字符`,
          ],
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
          number_value: null, // 富文本类型不设置number_value
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
