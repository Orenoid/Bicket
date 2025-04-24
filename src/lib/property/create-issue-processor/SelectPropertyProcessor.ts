import { property } from '@prisma/client';
import { PropertyType } from '../constants';
import { ValidationResult, DbInsertData } from '../types';
import { BasePropertyProcessor } from './base';


export class SelectPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
    if (value === null || value === undefined) {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 选项值应该是字符串或数字
    if (typeof value !== 'string' && typeof value !== 'number') {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是字符串或数字类型`]
      };
    }

    return { valid: true };
  }

  validateBusinessRules(property: property, value: unknown): ValidationResult {
    // 如果值为 null 或 undefined，允许通过验证
    if (value === null || value === undefined) {
      return { valid: true };
    }

    // 获取属性配置中的选项列表
    const config = property.config as { options?: Array<{ id: string; name: string; }>; } | undefined;

    if (!config || !Array.isArray(config.options) || config.options.length === 0) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 配置错误：未定义选项列表`]
      };
    }

    // 空字符串也视为空值，允许通过验证
    if (value === "") {
      return { valid: true };
    }

    // 检查值是否存在于选项列表中
    const optionExists = config.options.some(option => option.id === String(value));

    if (!optionExists) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 的值不在有效选项列表中`]
      };
    }

    return { valid: true };
  }

  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData {
    if (value === null || value === undefined || value === "") {
      return {
        singleValues: [
          this.createSingleValue(
            issueId,
            property.id,
            PropertyType.SELECT,
            null,
            null
          )
        ]
      };
    }
    const stringValue = String(value);
    return {
      singleValues: [
        this.createSingleValue(
          issueId,
          property.id,
          PropertyType.SELECT,
          stringValue,
          null
        )
      ]
    };
  }
}
