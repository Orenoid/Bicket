import { property } from '@prisma/client';
import { PropertyType } from '../constants';
import { ValidationResult, DbInsertData } from '../types';
import { BasePropertyProcessor } from './base';



export class MultiSelectPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
    if (value === null || value === undefined) {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 多选值应该是数组
    if (!Array.isArray(value)) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是数组类型`]
      };
    }

    // 数组中的每个值应该是字符串或数字
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item !== 'string' && typeof item !== 'number') {
        return {
          valid: false,
          errors: [`属性 ${property.name} 的第 ${i + 1} 个选项必须是字符串或数字类型`]
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

    // 获取属性配置中的选项列表
    const config = property.config as { options?: Array<{ id: string; name: string; }>; } | undefined;

    if (!config || !Array.isArray(config.options) || config.options.length === 0) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 配置错误：未定义选项列表`]
      };
    }

    // 转换为数组
    const valueArray = Array.isArray(value) ? value : [value];

    // 检查每个值是否存在于选项列表中
    for (const item of valueArray) {
      const optionExists = config.options.some(option => option.id === String(item));

      if (!optionExists) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 的值 "${item}" 不在有效选项列表中`]
        };
      }
    }

    // 检查是否有重复选项
    const uniqueValues = new Set(valueArray.map(item => String(item)));
    if (uniqueValues.size !== valueArray.length) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 包含重复选项`]
      };
    }

    // 检查是否超过最大选择数
    // 扩展config类型以包含maxSelect属性
    const extendedConfig = config as { options?: Array<{ id: string; name: string; }>; maxSelect?: number; };
    if (extendedConfig.maxSelect && typeof extendedConfig.maxSelect === 'number' && valueArray.length > extendedConfig.maxSelect) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 最多只能选择 ${extendedConfig.maxSelect} 个选项`]
      };
    }

    return { valid: true };
  }

  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData {
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
        PropertyType.MULTI_SELECT,
        String(item),
        index,
        null
      );
    });

    return { multiValues };
  }
}
