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

