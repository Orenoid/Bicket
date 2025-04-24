import { FilterCondition } from '../types';
import { FilterTransformer, FilterTransformerContext } from './filter-transformer';

/**
 * 多选类型的筛选转换器
 * 
 * 处理多选类型属性的筛选条件转换
 */
export const MultiSelectFilterTransformer: FilterTransformer = {
    /**
     * 将多选类型的筛选条件转换为Prisma查询条件
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toPrismaQuery(filter: FilterCondition, _context?: FilterTransformerContext) {
        // 多选类型主要支持 in 操作符（可以选择一个或多个选项）
        if (filter.operator === 'in') {
            // 确保值是数组
            const optionIds = Array.isArray(filter.value) 
                ? filter.value 
                : [filter.value];
            
            // 将选项ID转换为字符串数组
            const values = optionIds.map(id => String(id));
            
            // 多选类型使用 property_multi_value 表存储数据
            return {
                property_multi_value: {
                    some: {
                        property_id: filter.propertyId,
                        property_type: filter.propertyType,
                        value: { in: values }
                    }
                }
            };
        } 
        
        throw new Error(`不支持的多选类型筛选操作符: ${filter.operator}`);
    },
    
    /**
     * 验证多选类型的筛选条件
     */
    validate(filter: FilterCondition): boolean {
        // 确保操作符是多选类型支持的
        if (filter.operator !== 'in') {
            return false;
        }
        
        // 对于in操作符，值应该是数组
        return Array.isArray(filter.value) && filter.value.length > 0;
    },
    
    /**
     * 预处理多选类型的筛选条件
     */
    preprocess(filter: FilterCondition): FilterCondition {
        // 克隆筛选条件，避免修改原始对象
        const processedFilter = { ...filter };
        
        // 确保 in 操作符的值始终是数组
        if (filter.operator === 'in' && !Array.isArray(filter.value)) {
            processedFilter.value = [filter.value];
        }
        
        return processedFilter;
    }
}; 