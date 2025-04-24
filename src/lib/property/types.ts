import { Prisma, property } from '@prisma/client';

export enum CommonFilterOperator {
    // 文本操作符
    Eq = 'eq',
    Contains = 'contains',
    StartsWith = 'startsWith',
    EndsWith = 'endsWith',
    Regex = 'regex',
    // 数字操作符
    Gt = 'gt',
    Gte = 'gte',
    Lt = 'lt',
    Lte = 'lte',
    Between = 'between',
    // 通用操作符
    In = 'in',
    NotIn = 'notIn',
    IsNull = 'isNull',
    IsNotNull = 'isNotNull'
}


export interface FilterCondition {
    propertyId: string; // 要筛选的属性ID
    propertyType: string; // 属性类型
    operator: string; // 筛选操作符
    value: unknown | undefined; // 筛选值

    // 附加配置，如大小写敏感等
    config?: Record<string, unknown>;
}


export interface PropertyValue {
    property_id: string;
    value: unknown;
}

export interface Issue {
    issue_id: string;
    property_values: PropertyValue[];
}

export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

// === 属性更新相关 ===

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface SingleValueUpdateData {
  value?: string | null;
  number_value?: number | null;
}

export interface MultiValueData {
  value?: string | null;
  number_value?: number | null;
  position: number; // 多值属性必须指定位置
}

export interface DbOperationResult {
  singleValueRemove?: boolean;
  singleValueUpdate?: SingleValueUpdateData;
  multiValueRemovePositions?: number[];
  multiValueUpdates?: Map<number, Omit<MultiValueData, 'position'>>;
  multiValueCreates?: MultiValueData[];
}

/**
 * 属性更新 Processor
 *
 * 定义了处理属性更新操作的方法，允许不同属性类型实现自己的校验逻辑和数据库存储逻辑，注册对应实现后，
 * 在更新属性时，会根据属性类型自动调用对应的 Processor 进行处理
 */
export interface PropertyUpdateProcessor {
  /**
   * 验证操作类型和操作负载的格式是否正确，虽然一般表单层面都会有校验机制，这里属于底层兜底校验
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


// ==== 新建 issue 相关 ====

export interface DbInsertData {
  singleValues?: Omit<Prisma.property_single_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[];
  multiValues?: Omit<Prisma.property_multi_valueCreateManyInput, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[];
}

/**
 * 新建 issue 属性 processor
 *
 * 定义了所有属性类型处理器必须实现的方法，允许不同属性类型实现自己的校验逻辑和数据库存储逻辑，注册对应实现后，
 * 在创建 issue 时，会根据属性类型自动调用对应的 Processor 进行处理
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

