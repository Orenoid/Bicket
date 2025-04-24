import { FilterCondition } from '../types';
import { PropertyType } from '../constants';
import { FilterTransformer, PrismaFilterCondition } from './filter-transformer';

/**
 * 矿机列表筛选转换器
 * 
 * 用于将矿机列表类型的筛选条件转换为数据库查询条件
 */
export const MinersFilterTransformer: FilterTransformer = {
    /**
     * 转换为Prisma查询条件
     * 
     * @param filter 筛选条件
     * @returns Prisma查询条件对象
     */
    toPrismaQuery(filter: FilterCondition): PrismaFilterCondition {
        // 根据操作符构造不同的查询条件
        switch (filter.operator) {
            case 'in':
                // 包含操作符处理 - 使用多值关联查询
                if (Array.isArray(filter.value) && filter.value.length > 0) {
                    // 值是矿机ID数组
                    const minerIds = filter.value.map(String); // 确保所有ID都是字符串
                    
                    return {
                        property_multi_value: {
                            some: {
                                property_id: filter.propertyId,
                                property_type: PropertyType.MINERS,
                                value: {
                                    in: minerIds
                                }
                            }
                        }
                    };
                }
                // 空数组情况，返回始终不匹配的条件
                return { id: 'not-exists' };
                
            default:
                // 其他操作符暂不支持，可根据需要扩展
                console.warn(`矿机筛选不支持 ${filter.operator} 操作符，使用默认匹配`);
                return { id: 'not-exists' };
        }
    },
    
    /**
     * 验证筛选条件
     * 
     * @param filter 筛选条件
     * @returns 是否有效
     */
    validate(filter: FilterCondition): boolean {
        // 检查基础字段
        if (!filter.propertyId || filter.propertyType !== PropertyType.MINERS) {
            return false;
        }
        
        // 检查操作符
        if (filter.operator !== 'in') {
            return false;
        }
        
        // 检查值
        return Array.isArray(filter.value) && filter.value.length > 0;
    },
    
    /**
     * 预处理筛选条件
     * 
     * @param filter 筛选条件
     * @returns 处理后的筛选条件
     */
    preprocess(filter: FilterCondition): FilterCondition {
        // 对于矿机ID，确保值是字符串数组
        if (filter.operator === 'in' && Array.isArray(filter.value)) {
            // 过滤掉空值，并转换所有值为字符串
            const validValues = filter.value
                .filter(Boolean)
                .map(String);
            
            // 如果没有有效值，返回null以清除筛选
            if (validValues.length === 0) {
                return {
                    ...filter,
                    value: []
                };
            }
            
            // 返回处理后的筛选条件
            return {
                ...filter,
                value: validValues
            };
        }
        
        // 不支持的操作符，返回原始筛选条件
        return filter;
    }
}; 