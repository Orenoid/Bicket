import { property } from '@prisma/client';
import { PropertyType } from '../constants';
import { ValidationResult, DbInsertData } from '../types';
import { BasePropertyProcessor } from './base';


export class TextPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为字符串或可以转为字符串的类型
    if (value === null || value === undefined) {
      // 如果属性不允许为 null，则返回错误
      if (!property.nullable) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 不能为空`]
        };
      }
      return { valid: true };
    }

    // 尝试转换为字符串 - 几乎所有值都可以转为字符串，所以基本不会抛出异常
    // 但仍保留 try-catch 以应对极端情况
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
    // 如果值为 null 而且允许为 null，通过验证
    if ((value === null || value === undefined) && property.nullable) {
      return { valid: true };
    }

    const stringValue = String(value);
    const config = property.config as Record<string, unknown> | undefined;

    // 检查字符串长度限制
    if (config) {
      // 最小长度检查
      if (typeof config.minLength === 'number' && stringValue.length < config.minLength) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 长度不能小于 ${config.minLength} 个字符`]
        };
      }

      // 最大长度检查
      if (typeof config.maxLength === 'number' && stringValue.length > config.maxLength) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 长度不能超过 ${config.maxLength} 个字符`]
        };
      }

      // 正则表达式格式检查
      if (typeof config.pattern === 'string') {
        try {
          const regex = new RegExp(config.pattern);
          if (!regex.test(stringValue)) {
            return {
              valid: false,
              errors: [config.patternErrorMessage as string || `属性 ${property.name} 格式不正确`]
            };
          }
        } catch (error) {
          // 正则表达式错误，忽略此检查
          console.warn(`属性 ${property.name} 的正则表达式配置无效: ${error}`);
        }
      }
    }

    return { valid: true };
  }

  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData {
    // 如果值为 null 而且允许为 null，存储 null
    if ((value === null || value === undefined) && property.nullable) {
      return {
        singleValues: [
          this.createSingleValue(
            issueId,
            property.id,
            PropertyType.TEXT,
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
          PropertyType.TEXT,
          stringValue,
          null
        )
      ]
    };
  }
}
