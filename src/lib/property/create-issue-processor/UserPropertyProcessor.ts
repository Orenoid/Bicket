import { property } from "@prisma/client";
import { PropertyType } from "../constants";
import { ValidationResult, DbInsertData } from "../types";
import { BasePropertyProcessor } from "./base";

export class UserPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
    if (value === null || value === undefined || value === "") {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 用户ID应该是字符串
    if (typeof value !== "string") {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是字符串类型`],
      };
    }

    return { valid: true };
  }

  validateBusinessRules(property: property, value: unknown): ValidationResult {
    // 如果值为 null、undefined 或空字符串，允许通过验证
    if (value === null || value === undefined || value === "") {
      return { valid: true };
    }

    return { valid: true };
  }

  transformToDbFormat(
    property: property,
    value: unknown,
    issueId: string,
  ): DbInsertData {
    if (value === null || value === undefined || value === "") {
      return {
        singleValues: [
          this.createSingleValue(
            issueId,
            property.id,
            PropertyType.USER,
            null,
            null,
          ),
        ],
      };
    }

    // 转换为字符串并存储
    const stringValue = String(value);

    return {
      singleValues: [
        this.createSingleValue(
          issueId,
          property.id,
          PropertyType.USER,
          stringValue,
          null,
        ),
      ],
    };
  }
}
