// 导入共享的 Prisma 实例
import { prisma } from '@/app/lib/prisma';
import { IssuePage, Issue, PropertyValue, PropertyDefinition } from './components/IssuePage';
import { FilterCondition } from '@/app/property/types';
import { Prisma } from '@prisma/client';

// 反序列化筛选条件
function deserializeFilters(filtersStr: string): FilterCondition[] {
    if (!filtersStr) return [];
    
    try {
        return filtersStr.split(';').map(filterStr => {
            const [propertyId, propertyType, operator, valueStr] = filterStr.split(':');
            const decodedValueStr = decodeURIComponent(valueStr);
            
            // 根据操作符和值类型进行适当的转换
            let value: unknown;
            if (decodedValueStr === 'null') {
                value = null;
            } else if (operator === 'in') {
                // in 操作符值通常是数组
                const valueArray = decodedValueStr.split(',');
                
                // 如果是ID类型，尝试将值转换为数字
                if (propertyType === 'id') {
                    value = valueArray.map(v => isNaN(Number(v)) ? v : Number(v));
                } else {
                    value = valueArray;
                }
            } else if (propertyType === 'id' && !isNaN(Number(decodedValueStr))) {
                // ID类型且是数字，转换为数字
                value = Number(decodedValueStr);
            } else {
                // 其他情况保持字符串
                value = decodedValueStr;
            }
            
            return {
                propertyId,
                propertyType,
                operator,
                value
            } as FilterCondition;
        });
    } catch (error) {
        console.error('筛选条件解析错误:', error);
        return [];
    }
}

// 从数据库中获取属性定义
async function getPropertyDefinitions(): Promise<PropertyDefinition[]> {
    try {
        // 查询所有属性定义
        const properties = await prisma.property.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                type: true,
                config: true
            }
        });

        // 转换为前端需要的格式
        return properties.map(prop => ({
            id: prop.id,
            name: prop.name,
            type: prop.type,
            config: prop.config as Record<string, unknown> | undefined
        }));
    } catch (error) {
        console.error('获取属性定义失败:', error);
        throw new Error('获取属性定义失败');
    }
}

// 从数据库中获取工单数据
async function getIssues(filters?: FilterCondition[]): Promise<Issue[]> {
    try {
        // 基本条件：未删除的工单
        const baseWhere: Prisma.issueWhereInput = { deletedAt: null };
        
        // 如果有筛选条件，应用筛选
        if (filters && filters.length > 0) {
            // 由于 property_single_value 和 property_multi_value 不是 issue 的直接关系字段，
            // 我们需要先获取符合条件的属性值记录，然后根据这些记录找到对应的 issue
            
            // 对于每个筛选条件，构建查询
            const issueIds = new Set<string>();
            
            // 记录是否已经查询过
            let hasSearched = false;
            
            for (const filter of filters) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let valueCondition: any = {};
                
                // 根据操作符构建查询条件
                switch (filter.operator) {
                    case 'contains':
                        valueCondition = { contains: String(filter.value) };
                        break;
                    case 'eq':
                        valueCondition = String(filter.value);
                        break;
                    case 'startsWith':
                        valueCondition = { startsWith: String(filter.value) };
                        break;
                    case 'endsWith':
                        valueCondition = { endsWith: String(filter.value) };
                        break;
                    case 'in':
                        const values = Array.isArray(filter.value) 
                            ? filter.value.map(v => String(v))
                            : [String(filter.value)];
                        valueCondition = { in: values };
                        break;
                    default:
                        throw new Error(`不支持的筛选操作符: ${filter.operator}`);
                }
                
                // 构建基本查询条件
                const baseCondition = {
                    property_id: filter.propertyId,
                    property_type: filter.propertyType,
                    value: valueCondition,
                    deletedAt: null
                };
                
                // 根据属性类型确定查询表
                let propertyValues: { issue_id: string }[] = [];
                
                // TODO tech dept 这里做了个特殊判断，感觉是有问题的，回头排查
                if (filter.propertyType === 'multi_select' || filter.propertyType === 'miners') {
                    // 多选类型和矿机列表类型都存储在 property_multi_value 表中
                    propertyValues = await prisma.property_multi_value.findMany({
                        where: baseCondition,
                        select: {
                            issue_id: true
                        },
                        distinct: ['issue_id'] // 避免一个工单因为有多个匹配值而被重复计算
                    });
                } else {
                    // 其他类型存储在 property_single_value 表中
                    propertyValues = await prisma.property_single_value.findMany({
                        where: baseCondition,
                        select: {
                            issue_id: true
                        }
                    });
                }
                
                // 如果是首个筛选条件，初始化结果集
                if (!hasSearched) {
                    propertyValues.forEach(pv => issueIds.add(pv.issue_id));
                    hasSearched = true;
                } else {
                    // 如果已有结果集，取交集
                    const currentIds = new Set<string>();
                    propertyValues.forEach(pv => currentIds.add(pv.issue_id));
                    
                    // 保留在当前结果中也存在的ID
                    for (const id of issueIds) {
                        if (!currentIds.has(id)) {
                            issueIds.delete(id);
                        }
                    }
                }
                
                // 如果已经没有符合条件的工单了，直接返回空结果
                if (issueIds.size === 0 && hasSearched) {
                    return [];
                }
            }
            
            // 如果有筛选结果，查询这些工单
            if (issueIds.size > 0) {
                // 构建 issue 查询条件
                const whereCondition: Prisma.issueWhereInput = {
                    ...baseWhere,
                    id: { in: Array.from(issueIds) }
                };
                
                // 查询符合条件的工单
                const issues = await prisma.issue.findMany({
                    where: whereCondition,
                    select: {
                        id: true
                    },
                    orderBy: {
                        createdAt: 'desc' // 按创建时间倒序排序
                    }
                });
                
                // 查询每个工单的属性值
                const issueData: Issue[] = [];
                
                for (const issue of issues) {
                    // 获取该工单的所有单值属性
                    const singlePropertyValues = await prisma.property_single_value.findMany({
                        where: {
                            issue_id: issue.id,
                            deletedAt: null
                        },
                        select: {
                            property_id: true,
                            property_type: true,
                            value: true
                        }
                    });
                    
                    // 获取该工单的所有多值属性
                    const multiPropertyValues = await prisma.property_multi_value.findMany({
                        where: {
                            issue_id: issue.id,
                            deletedAt: null
                        },
                        select: {
                            property_id: true,
                            property_type: true,
                            value: true,
                            position: true
                        },
                        orderBy: {
                            position: 'asc'
                        }
                    });
                    
                    // 处理多值属性，将同一属性的多个值合并成数组
                    const multiValueMap = new Map<string, string[]>();
                    
                    for (const mpv of multiPropertyValues) {
                        if (!multiValueMap.has(mpv.property_id)) {
                            multiValueMap.set(mpv.property_id, []);
                        }
                        if (mpv.value) {
                            multiValueMap.get(mpv.property_id)?.push(mpv.value);
                        }
                    }
                    
                    // 转换为前端需要的格式，先处理单值属性
                    const values: PropertyValue[] = singlePropertyValues.map(pv => ({
                        property_id: pv.property_id,
                        value: pv.value
                    }));
                    
                    // 添加多值属性
                    for (const [propertyId, valueArray] of multiValueMap.entries()) {
                        values.push({
                            property_id: propertyId,
                            value: valueArray
                        });
                    }
                    
                    // 添加到工单数据中
                    issueData.push({
                        issue_id: issue.id,
                        property_values: values
                    });
                }
                
                return issueData;
            } else {
                // 没有筛选条件或没有找到符合条件的工单，查询所有工单
                return await getIssuesWithoutFilter(baseWhere);
            }
        } else {
            // 没有筛选条件，查询所有工单
            return await getIssuesWithoutFilter(baseWhere);
        }
    } catch (error) {
        console.error('获取工单数据失败:', error);
        throw new Error('获取工单数据失败');
    }
}

// 不带筛选条件的工单查询
async function getIssuesWithoutFilter(baseWhere: Prisma.issueWhereInput): Promise<Issue[]> {
    // 查询所有工单
    const issues = await prisma.issue.findMany({
        where: baseWhere,
        select: {
            id: true
        },
        orderBy: {
            createdAt: 'desc' // 按创建时间倒序排序
        }
    });
    
    // 查询每个工单的属性值
    const issueData: Issue[] = [];
    
    for (const issue of issues) {
        // 获取该工单的所有单值属性
        const singlePropertyValues = await prisma.property_single_value.findMany({
            where: {
                issue_id: issue.id,
                deletedAt: null
            },
            select: {
                property_id: true,
                property_type: true,
                value: true
            }
        });
        
        // 获取该工单的所有多值属性
        const multiPropertyValues = await prisma.property_multi_value.findMany({
            where: {
                issue_id: issue.id,
                deletedAt: null
            },
            select: {
                property_id: true,
                property_type: true,
                value: true,
                position: true
            },
            orderBy: {
                position: 'asc'
            }
        });
        
        // 处理多值属性，将同一属性的多个值合并成数组
        const multiValueMap = new Map<string, string[]>();
        
        for (const mpv of multiPropertyValues) {
            if (!multiValueMap.has(mpv.property_id)) {
                multiValueMap.set(mpv.property_id, []);
            }
            if (mpv.value) {
                multiValueMap.get(mpv.property_id)?.push(mpv.value);
            }
        }
        
        // 转换为前端需要的格式，先处理单值属性
        const values: PropertyValue[] = singlePropertyValues.map(pv => ({
            property_id: pv.property_id,
            value: pv.value
        }));
        
        // 添加多值属性
        for (const [propertyId, valueArray] of multiValueMap.entries()) {
            values.push({
                property_id: propertyId,
                value: valueArray
            });
        }
        
        // 添加到工单数据中
        issueData.push({
            issue_id: issue.id,
            property_values: values
        });
    }
    
    return issueData;
}

// 页面主组件
export default async function Page({ searchParams }: { searchParams: Promise<{ filters?: string }> }) {
    try {
        // 从 URL 参数获取筛选条件
        const resolvedParams = await searchParams;
        const filtersStr = resolvedParams.filters;
        const filters = filtersStr ? deserializeFilters(filtersStr) : [];
        
        // 获取属性定义和工单数据
        const [propertyDefinitions, issues] = await Promise.all([
            getPropertyDefinitions(),
            getIssues(filters)
        ]);

        // 检查是否获取到了属性定义
        if (propertyDefinitions.length === 0) {
            return <div className="p-8 text-red-500">错误：没有找到属性定义数据</div>;
        }

        // 渲染客户端组件，传递数据
        return <IssuePage issues={issues} propertyDefinitions={propertyDefinitions} />;
    } catch (error) {
        // 捕获并显示错误
        console.error('渲染页面时出错:', error);
        return (
            <div className="p-8 text-red-500">
                <h1 className="text-2xl font-bold mb-4">发生错误</h1>
                <p>{error instanceof Error ? error.message : '未知错误'}</p>
            </div>
        );
    }
} 