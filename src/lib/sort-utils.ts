/**
 * 排序配置接口
 * 定义了排序的基本结构
 */
export interface SortConfig {
  id: string;    // 排序的属性ID
  desc: boolean; // 是否降序排序
}

/**
 * 反序列化排序参数
 * 将URL中的排序参数解析为SortConfig数组
 * 
 * @param sortStr URL中的排序参数字符串
 * @returns 解析后的排序配置数组
 */
export function deserializeSort(sortStr: string): SortConfig[] {
    if (!sortStr) return [];

    try {
        // URL decode解码
        const decodedSortStr = decodeURIComponent(sortStr);
        // 解析JSON字符串为对象
        const sortConfigs = JSON.parse(decodedSortStr);
        
        // 确保结果是数组
        if (Array.isArray(sortConfigs)) {
            return sortConfigs.map(config => ({
                id: config.id,
                desc: Boolean(config.desc)
            }));
        }
        
        return [];
    } catch (error) {
        console.error('排序参数解析错误:', error);
        return [];
    }
}

/**
 * 序列化排序配置
 * 将排序配置数组转换为URL参数格式
 * 
 * @param sortConfigs 排序配置数组
 * @returns URL编码后的排序参数字符串
 */
export function serializeSort(sortConfigs: SortConfig[]): string {
    if (!sortConfigs || sortConfigs.length === 0) return '';
    
    try {
        // 转换为JSON字符串
        const sortStr = JSON.stringify(sortConfigs);
        // URL encode编码
        return encodeURIComponent(sortStr);
    } catch (error) {
        console.error('排序参数序列化错误:', error);
        return '';
    }
} 