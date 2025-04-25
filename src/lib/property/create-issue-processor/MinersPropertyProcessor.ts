import { property } from "@prisma/client";
import { PropertyType } from "../constants";
import { ValidationResult, DbInsertData } from "../types";
import { BasePropertyProcessor } from "./base";

export class MinersPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
    if (value === null || value === undefined) {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 矿机列表值应该是数组
    if (!Array.isArray(value)) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是数组类型`],
      };
    }

    // 数组中的每个值应该是字符串或数字（矿机ID）
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item !== "string" && typeof item !== "number") {
        return {
          valid: false,
          errors: [
            `属性 ${property.name} 的第 ${i + 1} 个矿机ID必须是字符串或数字类型`,
          ],
        };
      }
    }

    return { valid: true };
  }

  validateBusinessRules(property: property, value: unknown): ValidationResult {
    // 如果值为 null 或 undefined，允许通过验证
    if (value === null || value === undefined) {
      return { valid: true };
    }

    // 空数组也允许通过验证
    if (Array.isArray(value) && value.length === 0) {
      return { valid: true };
    }

    // 转换为数组
    const valueArray = Array.isArray(value) ? value : [value];

    // 检查是否有重复选项
    const uniqueValues = new Set(valueArray.map((item) => String(item)));
    if (uniqueValues.size !== valueArray.length) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 包含重复矿机ID`],
      };
    }

    // 获取配置信息
    const config = property.config as Record<string, unknown> | undefined;

    // 检查是否超过最大选择数
    if (
      config &&
      typeof config.maxSelect === "number" &&
      valueArray.length > config.maxSelect
    ) {
      return {
        valid: false,
        errors: [
          `属性 ${property.name} 最多只能选择 ${config.maxSelect} 个矿机`,
        ],
      };
    }

    // 这里可以添加验证矿机ID是否存在的逻辑
    // 在实际应用中，可能需要调用矿机相关的API或数据库查询来验证
    // 为了简化，这里假设所有传入的ID都是有效的
    return { valid: true };
  }

  transformToDbFormat(
    property: property,
    value: unknown,
    issueId: string,
  ): DbInsertData {
    // 如果值为 null，返回空数组
    if (value === null || value === undefined) {
      return { multiValues: [] };
    }

    // 空数组时返回空结果
    if (Array.isArray(value) && value.length === 0) {
      return { multiValues: [] };
    }

    // 转换为数组并存储
    const valueArray = Array.isArray(value) ? value : [value];

    // 创建多值属性数据
    const multiValues = valueArray.map((item, index) => {
      return this.createMultiValue(
        issueId,
        property.id,
        PropertyType.MINERS,
        String(item),
        index,
        null,
      );
    });

    return { multiValues };
  }
}
