import { property } from '@prisma/client';
import { PropertyType } from '../constants';
import { ValidationResult, DbInsertData } from '../types';
import { BasePropertyProcessor } from './base';


export class RichTextPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为字符串或可以转为字符串的类型
    if (value === null || value === undefined) {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 尝试转换为字符串 - 几乎所有值都可以转为字符串，所以基本不会抛出异常
    try {
      String(value);
      return { valid: true };
    } catch {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是字符串类型`]
      };
    }
  }

  validateBusinessRules(property: property, value: unknown): ValidationResult {
    // 如果值为 null 或 undefined，允许通过验证
    if (value === null || value === undefined) {
      return { valid: true };
    }

    const stringValue = String(value);
    const config = property.config as Record<string, unknown> | undefined;

    // 检查Markdown文本长度限制
    if (config) {
      // 最大长度检查
      if (typeof config.maxLength === 'number' && stringValue.length > config.maxLength) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 长度不能超过 ${config.maxLength} 个字符`]
        };
      }
    }

    return { valid: true };
  }

  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData {
    // 如果值为 null，存储 null
    if (value === null || value === undefined) {
      return {
        singleValues: [
          this.createSingleValue(
            issueId,
            property.id,
            PropertyType.RICH_TEXT,
            null,
            null
          )
        ]
      };
    }

    // 转换为字符串并存储
    const stringValue = String(value);

    return {
      singleValues: [
        this.createSingleValue(
          issueId,
          property.id,
          PropertyType.RICH_TEXT,
          stringValue,
          null
        )
      ]
    };
  }
}
