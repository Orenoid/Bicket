import { property, Prisma } from '@prisma/client';
import { PropertyValueProcessor, ValidationResult, DbInsertData } from '../types';


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
