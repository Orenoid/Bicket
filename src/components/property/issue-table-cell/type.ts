/**
 * 状态选项的定义
 */
export interface StatusOption {
  id: string; // 选项ID
  name: string; // 选项名称
  color: string; // 选项颜色（可以是CSS颜色值，如 #FF5733 或 rgb(255, 87, 51)）
}

/**
 * 单选类型属性的配置结构
 */
export interface SelectPropertyConfig extends Record<string, unknown> {
  options: StatusOption[]; // 所有可选项
}

/**
 * 多选类型属性的配置结构
 * 与单选类型相同，但处理多个选中值
 */
export interface MultiSelectPropertyConfig extends Record<string, unknown> {
  options: StatusOption[]; // 所有可选项
  maxSelect?: number; // 最大选择数量限制
}

/**
 * 矿机类型属性的配置结构
 */
export interface MinersPropertyConfig extends Record<string, unknown> {
  maxSelect?: number; // 最大选择数量限制
  displayCount?: number; // 表格中显示的最大矿机数
}

/**
 * 日期时间类型属性的配置结构
 */
export interface DatetimePropertyConfig extends Record<string, unknown> {
  format?: string; // 日期时间显示格式
  showTime?: boolean; // 是否显示时间部分
  showSeconds?: boolean; // 是否显示秒部分
  showTimezone?: boolean; // 是否显示时区部分
}
