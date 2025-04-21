export type FilterOperator =
    // 文本操作符
    'eq' | 'contains' | 'startsWith' | 'endsWith' | 'regex' |
    // 数字操作符
    'gt' | 'gte' | 'lt' | 'lte' | 'between' |
    // 通用操作符
    'in' | 'notIn' | 'isNull' | 'isNotNull';/**
 * 基础筛选条件接口
 */

export interface FilterCondition {
    propertyId: string; // 要筛选的属性ID
    propertyType: string; // 属性类型
    operator: FilterOperator; // 筛选操作符
    value: unknown; // 筛选值

    // 附加配置，如大小写敏感等
    config?: Record<string, unknown>;
}
/**
 * 复合筛选条件接口，用于组合多个条件
 */

export interface CompositeFilterCondition {
    logicOperator: 'and' | 'or'; // 逻辑操作符
    conditions: (FilterCondition | CompositeFilterCondition)[]; // 子条件列表
}

