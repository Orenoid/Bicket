import { FilterCondition } from '../types';
import { FilterTransformer, FilterTransformerContext } from '../filter-transformer';

/**
 * 选择类型的筛选转换器
 * 
 * 处理选择类型属性的筛选条件转换
 */
export const SelectFilterTransformer: FilterTransformer = {
    /**
     * 将选择类型的筛选条件转换为Prisma查询条件
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toPrismaQuery(filter: FilterCondition, _context?: FilterTransformerContext) {
        // 选择类型主要支持 in 操作符（可以选择一个或多个选项）
        if (filter.operator === 'in') {
            // 确保值是数组
            const optionIds = Array.isArray(filter.value) 
                ? filter.value 
                : [filter.value];
            
            // 将选项ID转换为字符串数组
            const values = optionIds.map(id => String(id));
            
            return {
                property_single_value: {
                    some: {
                        property_id: filter.propertyId,
                        property_type: filter.propertyType,
                        value: { in: values }
                    }
                }
            };
        } 
        // 选择类型也可以支持 eq 操作符（只选择一个选项）
        else if (filter.operator === 'eq') {
            return {
                property_single_value: {
                    some: {
                        property_id: filter.propertyId,
                        property_type: filter.propertyType,
                        value: String(filter.value)
                    }
                }
            };
        }
        
        throw new Error(`不支持的选择类型筛选操作符: ${filter.operator}`);
    },
    
    /**
     * 验证选择类型的筛选条件
     */
    validate(filter: FilterCondition): boolean {
        // 确保操作符是选择类型支持的
        const validOperators = ['in', 'eq'];
        if (!validOperators.includes(filter.operator)) {
            return false;
        }
        
        // 如果有上下文且包含配置，可以进一步验证选项是否有效
        if (filter.operator === 'in') {
            // 对于in操作符，值应该是数组
            return Array.isArray(filter.value) && filter.value.length > 0;
        } else if (filter.operator === 'eq') {
            // 对于eq操作符，值应该是字符串或者数字
            return filter.value !== undefined && filter.value !== null;
        }
        
        return false;
    },
    
    /**
     * 预处理选择类型的筛选条件
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