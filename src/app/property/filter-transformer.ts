import { FilterCondition } from './types';
import { PropertyType } from './constants';
import { TextFilterTransformer } from './transformers/text-transformer';
import { IdFilterTransformer } from './transformers/id-transformer';
import { SelectFilterTransformer } from './transformers/select-transformer';
import { RichTextFilterTransformer } from './transformers/rich-text-transformer';
import { MultiSelectFilterTransformer } from './transformers/multi-select-transformer';

/**
 * 筛选转换器上下文接口
 * 
 * 提供转换过程中可能需要的上下文信息，如属性定义、数据库连接等
 */
export interface FilterTransformerContext {
    // 可以根据需要扩展更多上下文信息
    propertyConfig?: Record<string, unknown>;
}

/**
 * Prisma查询条件类型
 * 
 * 定义了转换后的Prisma查询条件的基本结构
 */
export type PrismaFilterCondition = {
    property_single_value?: {
        some: {
            property_id: string;
            property_type?: string;
            value?: string | number | boolean | Record<string, unknown>;
            [key: string]: unknown;
        }
    };
    [key: string]: unknown;
};

/**
 * 筛选转换器接口
 * 
 * 定义了将筛选条件转换为数据库查询条件的核心方法
 */
export interface FilterTransformer {
    /**
     * 将筛选条件转换为Prisma查询条件
     * @param filter 筛选条件
     * @param context 转换上下文
     * @returns Prisma查询条件
     */
    toPrismaQuery(filter: FilterCondition, context?: FilterTransformerContext): PrismaFilterCondition;
    
    /**
     * 验证筛选条件是否有效（可选）
     * @param filter 筛选条件
     * @returns 是否有效
     */
    validate?(filter: FilterCondition): boolean;
    
    /**
     * 预处理筛选条件（可选，用于规范化或转换值）
     * @param filter 筛选条件
     * @returns 处理后的筛选条件
     */
    preprocess?(filter: FilterCondition): FilterCondition;
}

/**
 * 默认筛选转换器
 * 
 * 当找不到对应属性类型的转换器时使用
 */
export const DefaultFilterTransformer: FilterTransformer = {
    toPrismaQuery(filter: FilterCondition) {
        console.warn(`没有找到属性类型 "${filter.propertyType}" 的筛选转换器，使用默认转换`);
        
        // 默认实现，尝试进行简单匹配
        return {
            property_single_value: {
                some: {
                    property_id: filter.propertyId,
                    value: String(filter.value) // 简单地将值转换为字符串
                }
            }
        };
    },
    
    validate(filter: FilterCondition) {
        // 基本验证：确保至少有属性ID、类型和操作符
        return Boolean(filter.propertyId && filter.propertyType && filter.operator);
    }
};

/**
 * 筛选转换器注册表
 * 
 * 各属性类型的筛选转换器应该注册到这里
 */
export const FILTER_TRANSFORMERS: Record<string, FilterTransformer> = {
    // 注册基本类型的转换器
    [PropertyType.TEXT]: TextFilterTransformer,
    [PropertyType.ID]: IdFilterTransformer,
    [PropertyType.SELECT]: SelectFilterTransformer,
    [PropertyType.RICH_TEXT]: RichTextFilterTransformer,
    [PropertyType.MULTI_SELECT]: MultiSelectFilterTransformer,
    
    // 其他类型将在后续实现
};

/**
 * 获取特定属性类型的筛选转换器
 * 
 * @param propertyType 属性类型
 * @returns 筛选转换器
 */
export function getFilterTransformer(propertyType: string): FilterTransformer {
    return FILTER_TRANSFORMERS[propertyType] || DefaultFilterTransformer;
}

/**
 * 构建筛选查询
 * 
 * 组合多个筛选条件生成完整的查询对象
 * 
 * @param filters 筛选条件数组
 * @param context 转换上下文
 * @returns Prisma查询对象
 */
export function buildFilterQuery(filters: FilterCondition[], context?: FilterTransformerContext) {
    if (!filters || filters.length === 0) return {};
    
    const conditions = filters.map(filter => {
        const transformer = getFilterTransformer(filter.propertyType);
        
        // 可选的验证
        if (transformer.validate && !transformer.validate(filter)) {
            console.warn(`筛选条件验证失败:`, filter);
            return null;
        }
        
        // 可选的预处理
        const processedFilter = transformer.preprocess ? transformer.preprocess(filter) : filter;
        
        // 转换为查询条件
        return transformer.toPrismaQuery(processedFilter, context);
    }).filter(Boolean); // 移除无效的条件
    
    if (conditions.length === 0) return {};
    
    return {
        AND: conditions
    };
} 