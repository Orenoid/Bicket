import { Prisma } from '@prisma/client';
import { property } from '@prisma/client';
import { PropertyType } from './constants';

// TODO tech dept 现在很多属性在为空时，会产生 null value 的数据库记录，不合理

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
      case PropertyType.MULTI_SELECT:
        return new MultiSelectPropertyProcessor();
      case PropertyType.MINERS:
        return new MinersPropertyProcessor();
      case PropertyType.USER:
        return new UserPropertyProcessor();
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
    const config = property.config as { options?: Array<{ id: string; name: string }> } | undefined;
    
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
    // 如果值为 null，存储 null
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

/**
 * 多选类型属性处理器
 */
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
          errors: [`属性 ${property.name} 的第 ${i+1} 个选项必须是字符串或数字类型`]
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
    const config = property.config as { options?: Array<{ id: string; name: string }> } | undefined;
    
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
    const extendedConfig = config as { options?: Array<{ id: string; name: string }>; maxSelect?: number };
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

/**
 * 矿机列表类型属性处理器
 */
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
        errors: [`属性 ${property.name} 必须是数组类型`]
      };
    }

    // 数组中的每个值应该是字符串或数字（矿机ID）
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item !== 'string' && typeof item !== 'number') {
        return {
          valid: false,
          errors: [`属性 ${property.name} 的第 ${i+1} 个矿机ID必须是字符串或数字类型`]
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
    const uniqueValues = new Set(valueArray.map(item => String(item)));
    if (uniqueValues.size !== valueArray.length) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 包含重复矿机ID`]
      };
    }

    // 获取配置信息
    const config = property.config as Record<string, unknown> | undefined;
    
    // 检查是否超过最大选择数
    if (config && typeof config.maxSelect === 'number' && valueArray.length > config.maxSelect) {
      return {
        valid: false,
        errors: [`属性 ${property.name} 最多只能选择 ${config.maxSelect} 个矿机`]
      };
    }

    // 这里可以添加验证矿机ID是否存在的逻辑
    // 在实际应用中，可能需要调用矿机相关的API或数据库查询来验证
    // 为了简化，这里假设所有传入的ID都是有效的
    
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
        PropertyType.MINERS,
        String(item),
        index,
        null
      );
    });
    
    return { multiValues };
  }
}

/**
 * 用户类型属性处理器
 */
export class UserPropertyProcessor extends BasePropertyProcessor {
  validateFormat(property: property, value: unknown): ValidationResult {
    // 检查值是否为可用值
    if (value === null || value === undefined || value === '') {
      // 所有属性都允许为空
      return { valid: true };
    }

    // 用户ID应该是字符串
    if (typeof value !== 'string') {
      return {
        valid: false,
        errors: [`属性 ${property.name} 必须是字符串类型`]
      };
    }

    return { valid: true };
  }

  validateBusinessRules(property: property, value: unknown): ValidationResult {
    // 如果值为 null、undefined 或空字符串，允许通过验证
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    // TODO: 实现用户存在性校验，验证用户ID是否存在于系统中
    // 这通常需要调用 Clerk API 或检查数据库中的用户记录
    
    return { valid: true };
  }

  transformToDbFormat(property: property, value: unknown, issueId: string): DbInsertData {
    // 如果值为 null，存储 null
    if (value === null || value === undefined || value === '') {
      return {
        singleValues: [
          this.createSingleValue(
            issueId,
            property.id,
            PropertyType.USER,
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
          PropertyType.USER,
          stringValue,
          null
        )
      ]
    };
  }
}
