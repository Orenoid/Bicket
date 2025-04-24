import { FilterCondition } from '../types';
import { FilterTransformer, FilterTransformerContext } from './filter-transformer';

/**
 * ID类型的筛选转换器
 * 
 * 处理ID类型属性的筛选条件转换
 */
export const IdFilterTransformer: FilterTransformer = {
    /**
     * 将ID类型的筛选条件转换为Prisma查询条件
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toPrismaQuery(filter: FilterCondition, context?: FilterTransformerContext) {
        switch (filter.operator) {
            case 'eq':
                // 精确匹配，值应该是单个数字
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: String(filter.value) // 确保值是字符串
                        }
                    }
                };
                
            case 'in':
                // 包含于集合，值应该是数字或者字符串数组
                const values = Array.isArray(filter.value) 
                    ? filter.value.map(v => String(v)) // 确保所有值都是字符串
                    : [String(filter.value)];
                
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: { in: values }
                        }
                    }
                };
                
            default:
                throw new Error(`不支持的ID筛选操作符: ${filter.operator}`);
        }
    },
    
    /**
     * 验证ID类型的筛选条件
     */
    validate(filter: FilterCondition): boolean {
        // 确保操作符是ID类型支持的
        const validOperators = ['eq', 'in'];
        if (!validOperators.includes(filter.operator)) {
            return false;
        }
        
        // 验证值的类型
        if (filter.operator === 'eq') {
            // 对于等于操作符，值应该是数字或可以转换为数字的字符串
            const numValue = Number(filter.value);
            return !isNaN(numValue);
        } else if (filter.operator === 'in') {
            // 对于in操作符，值应该是数组
            if (!Array.isArray(filter.value)) {
                return false;
            }
            
            // 数组中的所有值都应该可以转换为数字
            return filter.value.every(v => !isNaN(Number(v)));
        }
        
        return false;
    },
    
    /**
     * 预处理ID类型的筛选条件
     */
    preprocess(filter: FilterCondition): FilterCondition {
        // 克隆筛选条件，避免修改原始对象
        const processedFilter = { ...filter };
        
        if (filter.operator === 'eq') {
            // 对于eq操作符，确保值是数字
            processedFilter.value = Number(filter.value);
        } else if (filter.operator === 'in' && Array.isArray(filter.value)) {
            // 对于in操作符，确保数组中的所有值都是数字
            processedFilter.value = filter.value.map(v => Number(v));
        }
        
        return processedFilter;
    }
}; 