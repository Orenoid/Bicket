import { property } from '@prisma/client';
import { PropertyType, PropertyOperationType, SystemPropertyId } from './constants';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * 单值属性更新数据
 */
export interface SingleValueUpdateData {
  value?: string | null;
  number_value?: number | null;
}

/**
 * 多值属性更新或创建数据
 */
export interface MultiValueData {
  value?: string | null;
  number_value?: number | null;
  position: number; // 多值属性必须指定位置
}

/**
 * 数据库操作结果
 * 
 * 处理器只需要返回要更新的值，上层调用会自动限定 issue_id 和 property_id
 */
export interface DbOperationResult {
  // 是否删除该属性的单值（硬删除）
  singleValueRemove?: boolean;
  
  // 是否更新单值属性 (value, number_value)
  singleValueUpdate?: SingleValueUpdateData;
  
  // 要删除的多值属性的位置数组（硬删除）
  multiValueRemovePositions?: number[];
  
  // 要更新的多值属性数据，键为位置，值为更新数据
  multiValueUpdates?: Map<number, Omit<MultiValueData, 'position'>>;
  
  // 要创建的多值属性数据数组
  multiValueCreates?: MultiValueData[];
}

/**
 * 属性更新处理器接口
 * 
 * 定义了处理属性更新操作的方法，支持不同类型的属性和不同的操作类型
 */
export interface PropertyUpdateProcessor {
  /**
   * 验证操作类型和操作负载的格式是否正确
   * @param property 属性定义信息
   * @param operationType 操作类型 (set, remove, add)
   * @param payload 操作负载
   * @returns 验证结果，包含是否验证通过及错误信息
   */
  validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult;

  /**
   * 验证业务规则，检查操作是否符合业务逻辑
   * @param property 属性定义信息
   * @param operationType 操作类型
   * @param payload 操作负载（已通过格式验证）
   * @returns 验证结果，包含是否验证通过及错误信息
   */
  validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult;

  /**
   * 转换为数据库操作
   * @param property 属性定义信息
   * @param operationType 操作类型
   * @param payload 操作负载（已通过验证）
   * @param issueId 关联的 issue ID
   * @returns 数据库操作结果，包含需要执行的值操作
   */
  transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, issueId: string): DbOperationResult;
}

/**
 * 属性更新处理器工厂
 * 
 * 根据属性类型创建对应的更新处理器实例
 */
export class PropertyUpdateProcessorFactory {
  static getProcessor(propertyType: string): PropertyUpdateProcessor {
    switch (propertyType) {
      case PropertyType.TEXT:
        return new TextPropertyUpdateProcessor();
      case PropertyType.SELECT:
        return new SelectPropertyUpdateProcessor();
      case PropertyType.RICH_TEXT:
        return new RichTextPropertyUpdateProcessor();
      // 其他属性类型暂未实现，后续会添加
      default:
        throw new Error(`暂未实现的属性类型处理器: ${propertyType}`);
    }
  }
}

/**
 * 抽象更新处理器基类
 * 
 * 提供基础实现，具体的属性类型处理器可以继承此类
 */
export abstract class BasePropertyUpdateProcessor implements PropertyUpdateProcessor {
  abstract validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult;
  abstract validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult;
  abstract transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, issueId: string): DbOperationResult;
}

/**
 * 文本类型属性更新处理器
 */
export class TextPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 检查操作类型是否支持
    if (operationType !== PropertyOperationType.SET && operationType !== PropertyOperationType.REMOVE) {
      return {
        valid: false,
        errors: [`文本类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`]
      };
    }

    // SET操作需要校验payload
    if (operationType === PropertyOperationType.SET) {
      // 检查payload中是否包含value字段
      if (!('value' in payload)) {
        return {
          valid: false,
          errors: ['SET操作的payload必须包含value字段']
        };
      }

      // 检查value字段是否为字符串类型或null
      const value = payload.value;
      if (value !== null && typeof value !== 'string') {
        return {
          valid: false,
          errors: ['value字段必须为字符串类型或null']
        };
      }
    }

    // 格式验证通过
    return { valid: true };
  }

  validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 对标题类型的特殊处理：标题不允许为空
    if (property.id === SystemPropertyId.TITLE && operationType === PropertyOperationType.SET) {
      const value = payload.value;
      
      // 不允许设置为null或空字符串
      if (value === null || (typeof value === 'string' && value.trim() === '')) {
        return {
          valid: false,
          errors: ['标题不能为空']
        };
      }
    }

    // 业务规则验证通过
    return { valid: true };
  }

  transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, _issueId: string): DbOperationResult {
    const result: DbOperationResult = {};

    switch (operationType) {
      case PropertyOperationType.SET:
        // 设置单值属性
        result.singleValueUpdate = {
          value: payload.value as string | null,
          number_value: null  // 文本类型不设置number_value
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

/**
 * 选择类型属性更新处理器
 */
export class SelectPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 检查操作类型是否支持
    if (operationType !== PropertyOperationType.SET && operationType !== PropertyOperationType.REMOVE) {
      return {
        valid: false,
        errors: [`选择类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`]
      };
    }

    // SET操作需要校验payload
    if (operationType === PropertyOperationType.SET) {
      // 检查payload中是否包含value字段
      if (!('value' in payload)) {
        return {
          valid: false,
          errors: ['SET操作的payload必须包含value字段']
        };
      }

      // 选择类型value必须是字符串或null
      const value = payload.value;
      if (value !== null && typeof value !== 'string') {
        return {
          valid: false,
          errors: ['选择类型value字段必须为字符串或null']
        };
      }
    }

    // 格式验证通过
    return { valid: true };
  }

  validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 只需要验证SET操作
    if (operationType === PropertyOperationType.SET && payload.value !== null) {
      const value = payload.value as string;
      const config = property.config as Record<string, unknown> | null;
      
      // 配置中必须有options字段，且为数组
      if (!config || !Array.isArray(config.options)) {
        return {
          valid: false,
          errors: ['属性配置中缺少options数组']
        };
      }
      
      // 检查所选值是否在可选项列表中
      const options = config.options as Array<{ id: string; name: string; color: string }>;
      const validValues = options.map(option => option.id);
      
      if (!validValues.includes(value)) {
        return {
          valid: false,
          errors: [`所选值 "${value}" 不在可选项列表中`]
        };
      }
    }

    // 业务规则验证通过
    return { valid: true };
  }

  transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, _issueId: string): DbOperationResult {
    const result: DbOperationResult = {};

    switch (operationType) {
      case PropertyOperationType.SET:
        // 设置单值属性
        result.singleValueUpdate = {
          value: payload.value as string | null,
          number_value: null  // 选择类型不设置number_value
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

/**
 * 富文本类型属性更新处理器
 */
export class RichTextPropertyUpdateProcessor extends BasePropertyUpdateProcessor {
  validateFormat(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // 检查操作类型是否支持
    if (operationType !== PropertyOperationType.SET && operationType !== PropertyOperationType.REMOVE) {
      return {
        valid: false,
        errors: [`富文本类型属性不支持操作类型: ${operationType}，只支持 ${PropertyOperationType.SET} 和 ${PropertyOperationType.REMOVE}`]
      };
    }

    // SET操作需要校验payload
    if (operationType === PropertyOperationType.SET) {
      // 检查payload中是否包含value字段
      if (!('value' in payload)) {
        return {
          valid: false,
          errors: ['SET操作的payload必须包含value字段']
        };
      }

      // 富文本类型value必须是字符串或null
      const value = payload.value;
      if (value !== null && typeof value !== 'string') {
        return {
          valid: false,
          errors: ['富文本类型value字段必须为字符串或null']
        };
      }
    }

    // 格式验证通过
    return { valid: true };
  }

  validateBusinessRules(property: property, operationType: string, payload: Record<string, unknown>): ValidationResult {
    // SET操作且属性不允许为null时，不能设置为null或空
    if (operationType === PropertyOperationType.SET && !property.nullable) {
      const value = payload.value;
      
      // 如果不允许为null，检查值是否为null或空字符串
      if (value === null || (typeof value === 'string' && value.trim() === '')) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 不允许为空`]
        };
      }
    }

    // 如果设置了最大长度限制，检查值是否超过限制
    if (operationType === PropertyOperationType.SET && payload.value !== null) {
      const stringValue = payload.value as string;
      const config = property.config as Record<string, unknown> | undefined;

      if (config && typeof config.maxLength === 'number' && stringValue.length > config.maxLength) {
        return {
          valid: false,
          errors: [`属性 ${property.name} 长度不能超过 ${config.maxLength} 个字符`]
        };
      }
    }

    // 业务规则验证通过
    return { valid: true };
  }

  transformToDbOperations(property: property, operationType: string, payload: Record<string, unknown>, _issueId: string): DbOperationResult {
    const result: DbOperationResult = {};

    switch (operationType) {
      case PropertyOperationType.SET:
        // 设置单值属性
        result.singleValueUpdate = {
          value: payload.value as string | null,
          number_value: null  // 富文本类型不设置number_value
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