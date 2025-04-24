import { FilterCondition } from '../types';
import { FilterTransformer, FilterTransformerContext } from './filter-transformer';

/**
 * 文本类型的筛选转换器
 * 
 * 处理文本类型属性的筛选条件转换
 */
export const TextFilterTransformer: FilterTransformer = {
    /**
     * 将文本类型的筛选条件转换为Prisma查询条件
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toPrismaQuery(filter: FilterCondition, context?: FilterTransformerContext) {
        // 确保值是字符串
        const value = filter.value as string;
        
        // 根据不同的操作符构建不同的查询条件
        switch (filter.operator) {
            case 'contains':
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: { contains: value }
                        }
                    }
                };
                
            case 'eq':
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: value
                        }
                    }
                };
                
            case 'startsWith':
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: { startsWith: value }
                        }
                    }
                };
                
            case 'endsWith':
                return {
                    property_single_value: {
                        some: {
                            property_id: filter.propertyId,
                            property_type: filter.propertyType,
                            value: { endsWith: value }
                        }
                    }
                };
                
            default:
                throw new Error(`不支持的文本筛选操作符: ${filter.operator}`);
        }
    },
    
    /**
     * 验证文本类型的筛选条件
     */
    validate(filter: FilterCondition): boolean {
        // 确保操作符是文本类型支持的
        const validOperators = ['contains', 'eq', 'startsWith', 'endsWith'];
        if (!validOperators.includes(filter.operator)) {
            return false;
        }
        
        // 确保值是字符串且非空（除非是isNull/isNotNull操作符）
        if (filter.operator !== 'isNull' && filter.operator !== 'isNotNull') {
            if (typeof filter.value !== 'string' || filter.value.trim() === '') {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * 预处理文本类型的筛选条件
     */
    preprocess(filter: FilterCondition): FilterCondition {
        // 对于文本类型，可以进行一些标准化处理
        if (typeof filter.value === 'string') {
            // 克隆筛选条件，避免修改原始对象
            const processedFilter = { ...filter };
            // 例如，可以去除两端空白
            processedFilter.value = filter.value.trim();
            return processedFilter;
        }
        
        return filter;
    }
}; 