import { Prisma } from '@prisma/client';
import prisma from '../../prisma';
import { NUMBER_VALUE_TYPES, PROPERTY_ID_TYPE_MAP, PropertyType, SystemPropertyId } from '../../property/constants';
import { FilterCondition, Issue, PropertyDefinition, PropertyValue } from '../../property/types';
import { notFound } from 'next/navigation';

export async function getPropertyDefinitions(): Promise<PropertyDefinition[]> {
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
        const result = properties.map(prop => ({
            id: prop.id,
            name: prop.name,
            type: prop.type,
            config: prop.config as Record<string, unknown> | undefined
        }));

        const propertyPriorityOrder = [
            SystemPropertyId.ID,
            SystemPropertyId.TITLE,
            SystemPropertyId.STATUS,
            SystemPropertyId.PRIORITY,
            SystemPropertyId.CATEGORY,
            SystemPropertyId.DIAGNOSIS,
            SystemPropertyId.MINERS,
            SystemPropertyId.ASIGNEE,
            SystemPropertyId.REPORTER,
            SystemPropertyId.CREATED_AT,
            SystemPropertyId.UPDATED_AT,
        ];
        result.sort((a, b) => {
            const indexA = propertyPriorityOrder.indexOf(a.id as SystemPropertyId);
            const indexB = propertyPriorityOrder.indexOf(b.id as SystemPropertyId);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        return result;
    } catch (error) {
        console.error('获取属性定义失败:', error);
        throw new Error('获取属性定义失败');
    }
}

export async function getIssues(
    filters: FilterCondition[] | undefined,
    workspaceId: string,
    page: number,
    pageSize: number,
    sort: SortConfig[]
): Promise<{ issues: Issue[]; total: number; }> {

    // 为了方便属性的垂直扩展，数据库表结构采用了很彻底的 EAV 模型，
    // 相应的代价是排序和筛选逻辑实现起来会比较复杂
    // 目前纯 sql 实现没什么问题，如果后期项目规模增长，可以通过添加倒排索引或 ES 等现成方案来优化解决

    const baseWhere: Prisma.issueWhereInput = {
        deletedAt: null,
        workspace_id: workspaceId
    };
    let orderBy = buildOrderByParams(sort);

    // 由于 property_single_value 和 property_multi_value 不是 issue 的直接关系字段，
    // 我们需要先获取符合条件的 issue id，然后根据这些记录找到对应的 issue
    const filteredIssueIDs = new Set<string>();
    const hasFilters = filters && filters.length > 0;
    if (hasFilters) {
        let hasSearched = false;
        for (const filter of filters) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let valueCondition: any = {};
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
                value: valueCondition,
                deletedAt: null
            };
            let propertyValues: { issue_id: string; }[] = [];
            if (filter.propertyType === PropertyType.MULTI_SELECT || filter.propertyType === PropertyType.MINERS) {
                propertyValues = await prisma.property_multi_value.findMany({
                    where: baseCondition,
                    select: {
                        issue_id: true
                    },
                    distinct: ['issue_id']
                });
            } else {
                propertyValues = await prisma.property_single_value.findMany({
                    where: baseCondition,
                    select: {
                        issue_id: true
                    }
                });
            }

            // 如果是首个筛选条件，初始化结果集
            if (!hasSearched) {
                propertyValues.forEach(pv => filteredIssueIDs.add(pv.issue_id));
                hasSearched = true;
            } else {
                // 如果已有结果集，取交集
                const currentIds = new Set<string>();
                propertyValues.forEach(pv => currentIds.add(pv.issue_id));
                for (const id of filteredIssueIDs) {
                    if (!currentIds.has(id)) {
                        filteredIssueIDs.delete(id);
                    }
                }
            }

            // 如果已经没有符合条件的工单了，直接返回空结果
            if (filteredIssueIDs.size === 0 && hasSearched) {
                return { issues: [], total: 0 };
            }
        }
    }

    // TODO 处理 SQL 注入风险
    if (!orderBy) {
        orderBy = 'issue."createdAt" DESC';
    }
    const skip = (page - 1) * pageSize;
    const query = `
                SELECT issue.id 
                FROM issue 
                WHERE 1=1 ${hasFilters ? `AND issue.id IN (${Array.from(filteredIssueIDs).map(id => `'${id}'`).join(',')})` : ''}
                AND issue."workspace_id" = '${workspaceId}'
                AND issue."deletedAt" IS NULL
                ORDER BY ${orderBy}
                LIMIT ${pageSize}
                OFFSET ${skip}
            `;
    const issues: { id: string; }[] = await prisma.$queryRawUnsafe<{ id: string; }[]>(query);

    let total = filteredIssueIDs.size;
    if (!hasFilters) {
        total = await prisma.issue.count({
            where: baseWhere
        });
    }

    // 查询属性值和构建返回数据
    const issuesWithValues = await getIssuesWithValues(issues.map(issue => issue.id));
    return { issues: issuesWithValues, total };

}

export async function getIssuesWithValues(issueIDs: string[]): Promise<Issue[]> {

    // 并行查询工单的单值属性和多值属性
    const [singlePropertyValues, multiPropertyValues] = await Promise.all([
        prisma.property_single_value.findMany({
            where: {
                issue_id: { in: issueIDs },
                deletedAt: null
            },
            select: {
                issue_id: true,
                property_id: true,
                property_type: true,
                value: true
            }
        }),
        prisma.property_multi_value.findMany({
            where: {
                issue_id: { in: issueIDs },
                deletedAt: null
            },
            select: {
                issue_id: true,
                property_id: true,
                property_type: true,
                value: true,
                position: true
            },
            orderBy: {
                position: 'asc'
            }
        })
    ]);

    // 按工单ID分组数据
    const singleValuesByIssueId = new Map<string, Array<(typeof singlePropertyValues)[0]>>();
    const multiValuesByIssueId = new Map<string, Array<(typeof multiPropertyValues)[0]>>();

    // 处理单值属性分组
    for (const spv of singlePropertyValues) {
        if (!singleValuesByIssueId.has(spv.issue_id)) {
            singleValuesByIssueId.set(spv.issue_id, []);
        }
        singleValuesByIssueId.get(spv.issue_id)!.push(spv);
    }
    // 处理多值属性分组
    for (const mpv of multiPropertyValues) {
        if (!multiValuesByIssueId.has(mpv.issue_id)) {
            multiValuesByIssueId.set(mpv.issue_id, []);
        }
        multiValuesByIssueId.get(mpv.issue_id)!.push(mpv);
    }

    // 构建结果集
    const issues: Issue[] = [];
    for (const issueId of issueIDs) {

        const issueSingleValues = singleValuesByIssueId.get(issueId) || [];
        const issueMultiValues = multiValuesByIssueId.get(issueId) || [];

        // 处理多值属性，将同一属性的多个值合并成数组
        const multiValueMap = new Map<string, string[]>();
        for (const mpv of issueMultiValues) {
            if (!multiValueMap.has(mpv.property_id)) {
                multiValueMap.set(mpv.property_id, []);
            }
            if (mpv.value) {
                multiValueMap.get(mpv.property_id)?.push(mpv.value);
            }
        }
        // 转换为前端需要的格式，先处理单值属性
        const values: PropertyValue[] = issueSingleValues.map(pv => ({
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
        issues.push({
            issue_id: issueId,
            property_values: values
        });
    }
    return issues;
}

interface SortConfig {
    id: string;    // 排序的属性ID
    desc: boolean; // 是否降序排序
}

/**
 * 将排序配置转换为Prisma原始SQL
 *
 * @param sortConfigs 排序配置数组
 * @returns 包含原始 SQL 的对象或 undefined
 */
export function buildOrderByParams(sortConfigs: SortConfig[]): string | undefined {
    if (!sortConfigs || sortConfigs.length === 0) {
        return undefined;
    }

    const orderExpressions = sortConfigs.map(sort => {
        const propertyId = sort.id;
        const propertyType = PROPERTY_ID_TYPE_MAP[propertyId as SystemPropertyId];
        const direction = sort.desc ? 'DESC' : 'ASC';

        const selectColumn = NUMBER_VALUE_TYPES.includes(propertyType) ? 'psv."number_value"' : 'psv."value"';
        // 使用标量子查询获取对应的属性值，用于排序
        return `(
            SELECT 
                ${selectColumn}
            FROM property_single_value psv
            WHERE psv."issue_id" = issue.id
            AND psv."property_id" = '${propertyId}'
            AND psv."deletedAt" IS NULL
            LIMIT 1
        ) ${direction} NULLS LAST`;
    });

    // 组合所有排序表达式
    if (orderExpressions.length > 0) {
        return orderExpressions.join(', ');
    }

    return undefined;
}

export async function getIssueById(id: string): Promise<Issue> {

    const issueExists = await prisma.issue.findFirst({
        where: {
            id: id,
            deletedAt: null
        }
    });
    if (!issueExists) {
        notFound()
    }

    // 并行查询工单的单值属性和多值属性
    const [singlePropertyValues, multiPropertyValues] = await Promise.all([
        prisma.property_single_value.findMany({
            where: {
                issue_id: id,
                deletedAt: null
            },
            select: {
                property_id: true,
                property_type: true,
                value: true
            }
        }),
        prisma.property_multi_value.findMany({
            where: {
                issue_id: id,
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
        })
    ]);

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

    // 构建返回结果
    const issueData: Issue = {
        issue_id: id,
        property_values: values
    };

    return issueData;

}
