import { Prisma } from '@prisma/client';
import { property } from '@prisma/client';
import { PropertyType } from './constants';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * 转换为数据库插入格式的结果
 */
export interface DbInsertData {
  singleValues?: Omit<Prisma.property_single_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[];
  multiValues?: Omit<Prisma.property_multi_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[];
}

/**
 * 属性值处理器接口
 * 
 * 定义了所有属性类型处理器必须实现的方法，用于验证和转换属性值
 */
export interface PropertyValueProcessor {
  /**
   * 验证前端传递的参数格式和类型是否正确
   * @param property 属性定义信息
   * @param value 前端传递的值
   * @returns 验证结果，包含是否验证通过及错误信息
   */
  validateFormat(property: property, value: unknown): ValidationResult;

  /**
   * 验证业务规则，如选项是否存在、数字是否在范围内等
   * @param property 属性定义信息
   * @param value 已通过格式验证的值
   * @returns 验证结果，包含是否验证通过及错误信息
   */
  validateBusinessRules(property: property, value: unknown): ValidationResult;

  /**
   * 将值转换为数据库可存储的格式
   * @param property 属性定义信息
   * @param value 已通过验证的值
   * @param issueId 关联的 issue ID
   * @returns 可直接用于 Prisma 创建操作的数据对象数组
   */
  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData;
}

/**
 * 属性处理器工厂
 * 
 * 根据属性类型创建对应的处理器实例
 */
export class PropertyProcessorFactory {
  static getProcessor(propertyType: string): PropertyValueProcessor {
    switch (propertyType) {
      case PropertyType.TEXT:
        return new TextPropertyProcessor();
      case PropertyType.SELECT:
        return new SelectPropertyProcessor();
      case PropertyType.RICH_TEXT:
        return new RichTextPropertyProcessor();
      default:
        throw new Error(`不支持的属性类型: ${propertyType}`);
    }
  }
}

/**
 * 抽象处理器基类
 * 
 * 提供一些共享的基础实现，具体的属性类型处理器可以继承此类
 */
export abstract class BasePropertyProcessor implements PropertyValueProcessor {
  abstract validateFormat(property: property, value: unknown): ValidationResult;
  abstract validateBusinessRules(property: property, value: unknown): ValidationResult;
  abstract transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData;

  /**
   * 创建单值属性数据
   */
  protected createSingleValue(
    issueId: string, 
    propertyId: string, 
    propertyType: string, 
    value: string | null, 
    numberValue?: number | null
  ): Omit<Prisma.property_single_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    return {
      issue_id: issueId,
      property_id: propertyId,
      property_type: propertyType,
      value,
      number_value: numberValue
    };
  }

  /**
   * 创建多值属性数据
   */
  protected createMultiValue(
    issueId: string, 
    propertyId: string, 
    propertyType: string, 
    value: string | null, 
    position: number,
    numberValue?: number | null
  ): Omit<Prisma.property_multi_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    return {
      issue_id: issueId,
      property_id: propertyId,
      property_type: propertyType,
      value,
      position,
      number_value: numberValue
    };
  }
}

/**
 * 文本类型属性处理器
 */
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

/**
 * 单选类型属性处理器
 */
export class SelectPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
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
    // 如果值为 null 而且允许为 null，通过验证
    if ((value === null || value === undefined) && property.nullable) {
      return { valid: true };
    }

    // 获取属性配置中的选项列表
    const config = property.config as { options?: Array<{ id: string; name: string }> } | undefined;
    
    if (!config || !Array.isArray(config.options) || config.options.length === 0) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 配置错误：未定义选项列表`]
      };
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
    // 如果值为 null 而且允许为 null，存储 null
    if ((value === null || value === undefined) && property.nullable) {
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

    // 转换为字符串并存储
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

/**
 * 富文本类型属性处理器
 */
export class RichTextPropertyProcessor extends BasePropertyProcessor {
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
    // 如果值为 null 而且允许为 null，存储 null
    if ((value === null || value === undefined) && property.nullable) {
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
