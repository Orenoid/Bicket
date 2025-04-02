import { PrismaClient } from '@prisma/client';
import { IssuePage, Issue, PropertyValue, PropertyDefinition } from './components/IssuePage';

// 初始化 Prisma 客户端
const prisma = new PrismaClient();

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
async function getIssues(): Promise<Issue[]> {
    try {
        // 查询所有工单
        const issues = await prisma.issue.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true
            }
        });

        // 查询每个工单的属性值
        const issueData: Issue[] = [];
        
        for (const issue of issues) {
            // 获取该工单的所有属性值
            const propertyValues = await prisma.property_single_value.findMany({
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

            // 转换为前端需要的格式
            const values: PropertyValue[] = propertyValues.map(pv => ({
                property_id: pv.property_id,
                property_type: pv.property_type,
                value: pv.value
            }));

            // 添加到工单数据中
            issueData.push({
                issue_id: parseInt(issue.id.replace('issue', ''), 10),
                property_values: values
            });
        }

        return issueData;
    } catch (error) {
        console.error('获取工单数据失败:', error);
        throw new Error('获取工单数据失败');
    }
}

// 页面主组件
export default async function Page() {
    try {
        // 获取属性定义和工单数据
        const [propertyDefinitions, issues] = await Promise.all([
            getPropertyDefinitions(),
            getIssues()
        ]);

        // 检查是否获取到了数据
        if (propertyDefinitions.length === 0) {
            return <div className="p-8 text-red-500">错误：没有找到属性定义数据</div>;
        }

        if (issues.length === 0) {
            return <div className="p-8 text-yellow-500">暂无工单数据</div>;
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