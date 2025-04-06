/**
 * 系统预定义的属性 ID
 */
export enum SystemPropertyId {
    ID = 'property0001',             // 工单 ID
    TITLE = 'property0002',          // 工单标题
    STATUS = 'property0003',         // 工单状态
    CREATED_AT = 'property0004',     // 创建时间
    UPDATED_AT = 'property0005',     // 更新时间
    DESCRIPTION = 'property0006',    // 工单描述
    PRIORITY = 'property0007',       // 工单优先级
    CATEGORY = 'property0008',       // 工单类别
    DIAGNOSIS = 'property0009',      // 工单诊断
}


/**
 * 属性类型常量
 */
export enum PropertyType {
    ID = 'id',               // 工单 ID 
    TEXT = 'text',           // 文本类型
    NUMBER = 'number',       // 数字类型
    SELECT = 'select',       // 单选类型
    MULTI_SELECT = 'multi_select', // 多选类型
    DATETIME = 'datetime',   // 日期时间类型
    BOOLEAN = 'boolean',     // 布尔类型
    USER = 'user',           // 用户类型
    RELATIONSHIP = 'relationship', // 关联类型
    RICH_TEXT = 'rich_text', // 富文本类型
}

/**
 * 系统属性ID与属性类型的映射关系
 */
export const PROPERTY_ID_TYPE_MAP = {
    [SystemPropertyId.ID]: PropertyType.ID,
    [SystemPropertyId.TITLE]: PropertyType.TEXT,
    [SystemPropertyId.STATUS]: PropertyType.SELECT,
    [SystemPropertyId.CREATED_AT]: PropertyType.DATETIME,
    [SystemPropertyId.UPDATED_AT]: PropertyType.DATETIME,
    [SystemPropertyId.DESCRIPTION]: PropertyType.RICH_TEXT,
    [SystemPropertyId.PRIORITY]: PropertyType.SELECT,
    [SystemPropertyId.CATEGORY]: PropertyType.SELECT,
    [SystemPropertyId.DIAGNOSIS]: PropertyType.SELECT,
};

/**
 * 属性操作类型常量
 */
export enum PropertyOperationType {
    SET = 'set',           // 设置属性值
    REMOVE = 'remove',     // 删除属性值
    ADD = 'add',           // 添加属性值（多值）
    UPDATE = 'update',     // 更新属性值（多值）
}


