'use client';

import { useState, useEffect, createContext, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import IssueTable, { TableColumn } from '@/components/issue/IssueTable';
import {
    PROPERTY_HEADER_COMPONENTS,
    PROPERTY_CELL_COMPONENTS
} from '../property/table';
import { FilterCondition } from '@/lib/property/types';
import { PropertyType } from '@/lib/property/constants';
import { FiPlus } from 'react-icons/fi';
import { CreateIssuePanel } from './CreateIssuePanel';
import { IssueDetailPanel } from './IssueDetailPanel';
import { User, getUserList } from '@/app/user/service';

// 创建用户数据上下文
export interface UserDataContextType {
    userData: Record<string, User>;
    isLoading: boolean;
}

export const UserDataContext = createContext<UserDataContextType>({
    userData: {},
    isLoading: true
});

// 数据类型
export interface PropertyValue {
    property_id: string;
    value: unknown;
}

export interface Issue {
    issue_id: string;
    property_values: PropertyValue[];
}

// 属性定义接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

interface IssuePageProps {
    issues: Issue[];
    propertyDefinitions: PropertyDefinition[];
    pageCount?: number; // 总页数参数，可选
}

// 序列化筛选条件为URL参数字符串
function serializeFilters(filters: FilterCondition[]): string {
    if (!filters.length) return '';

    return filters.map(filter => {
        // 根据值类型进行序列化处理
        let valueStr: string;
        if (Array.isArray(filter.value)) {
            valueStr = filter.value.join(',');
        } else if (filter.value === null) {
            valueStr = 'null';
        } else {
            valueStr = String(filter.value);
        }

        return `${filter.propertyId}:${filter.propertyType}:${filter.operator}:${encodeURIComponent(valueStr)}`;
    }).join(';');
}

export function IssuePage({ issues, propertyDefinitions, pageCount = 1 }: IssuePageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 活跃的筛选条件
    const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);

    // 新增：控制新建issue面板的显示状态
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

    // 新增：控制详情面板的显示状态和当前选中的issue
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    // 添加一个状态来保存当前打开的issue ID，用于在刷新后恢复选中的issue
    const [currentIssueId, setCurrentIssueId] = useState<string | null>(null);

    // TODO tech dept 批量预加载 clerk 用户的临时解决方案，未来应该设计一套适用于所有属性类型的通用解决方案
    // 新增：用户数据状态
    const [userData, setUserData] = useState<Record<string, User>>({});
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    
    // 创建用户数据上下文值
    const userDataContextValue = useMemo(() => ({
        userData,
        isLoading: isLoadingUsers
    }), [userData, isLoadingUsers]);

    // 当筛选条件变化时，更新URL
    useEffect(() => {
        const serialized = serializeFilters(activeFilters);

        // 构建新的 URL 查询参数
        const params = new URLSearchParams(searchParams);
        if (serialized) {
            params.set('filters', serialized);
        } else {
            params.delete('filters');
        }

        // 更新 URL，不触发页面刷新
        router.push(`?${params.toString()}`, { scroll: false });
    }, [activeFilters, router, searchParams]);

    // 筛选条件变更处理函数
    const handleFilterChange = useCallback((filters: FilterCondition[]) => {
        setActiveFilters(filters);
    }, []);
    
    // 收集所有用户类型的属性值并批量加载用户信息
    useEffect(() => {
        async function loadUsersData() {
            try {
                // 找出所有用户类型的属性定义
                const userPropertyIds = propertyDefinitions
                    .filter(prop => prop.type === PropertyType.USER)
                    .map(prop => prop.id);

                if (userPropertyIds.length === 0) {
                    setIsLoadingUsers(false);
                    return;
                }

                // 从所有issue中收集用户ID
                const userIds = new Set<string>();
                
                issues.forEach(issue => {
                    issue.property_values.forEach(propValue => {
                        if (
                            userPropertyIds.includes(propValue.property_id) && 
                            propValue.value !== null && 
                            propValue.value !== undefined &&
                            propValue.value !== ""
                        ) {
                            userIds.add(String(propValue.value));
                        }
                    });
                });
                
                if (userIds.size === 0) {
                    setIsLoadingUsers(false);
                    return;
                }

                // 批量请求用户数据
                const userIdsArray = Array.from(userIds);
                const usersResponse = await getUserList({
                    userId: userIdsArray
                });

                // 将用户数据转换为 ID -> User 映射
                const userDataMap: Record<string, User> = {};
                usersResponse.data.forEach(user => {
                    const userId = userIdsArray[usersResponse.data.indexOf(user)];
                    if (userId) {
                        userDataMap[userId] = user;
                    }
                });

                setUserData(userDataMap);
            } catch (error) {
                console.error('批量加载用户数据失败:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        }

        loadUsersData();
    }, [issues, propertyDefinitions]);

    // 刷新issue列表函数
    const refreshIssueList = () => {
        // 获取当前URL参数
        const currentParams = new URLSearchParams(searchParams);

        // 添加一个时间戳参数，强制页面刷新（服务端数据）
        currentParams.set('_t', Date.now().toString());

        // 刷新页面，获取最新数据
        // 注意：这里不会关闭详情面板，因为我们使用了currentIssueId来记住当前打开的issue
        router.refresh();
    };

    // 当选中issue变化时，更新currentIssueId
    // 这样在刷新列表后，我们可以通过这个ID找到更新后的issue数据
    useEffect(() => {
        if (selectedIssue) {
            setCurrentIssueId(selectedIssue.issue_id);
        }
    }, [selectedIssue]);
    // 当issues数据变化时，如果有保存的currentIssueId，则更新selectedIssue为新数据
    // 这个效果会在refreshIssueList触发页面刷新后执行，确保详情面板显示的是最新数据
    useEffect(() => {
        if (currentIssueId && isDetailPanelOpen) {
            const updatedIssue = issues.find(issue => issue.issue_id === currentIssueId);
            if (updatedIssue) {
                setSelectedIssue(updatedIssue);
            }
        }
    }, [issues, currentIssueId, isDetailPanelOpen]);

    // 表格列定义
    // const columns: TableColumn[] = propertyDefinitions.map(prop => ({
    //     id: prop.id,
    //     title: prop.name,
    // }));
    
    // 修改为使用 useMemo 记忆化 columns 数组
    const columns = useMemo<TableColumn[]>(() => 
        propertyDefinitions.map(prop => ({
            id: prop.id,
            title: prop.name,
        }))
    , [propertyDefinitions]);

    // 渲染表头
    const renderHeader = useCallback((column: TableColumn) => {
        const propertyDef = propertyDefinitions.find(p => p.id === column.id);
        if (!propertyDef) return column.title;

        // 从映射中获取对应的表头组件
        const HeaderComponent = PROPERTY_HEADER_COMPONENTS[propertyDef.type];
        if (!HeaderComponent) return column.title;

        // 渲染表头组件
        return (
            <HeaderComponent
                propertyID={propertyDef.id}
                propertyType={propertyDef.type}
                propertyName={column.title}
                propertyConfig={propertyDef.config}
            />
        );
    }, [propertyDefinitions]);

    // 渲染单元格
    const renderCell = useCallback((column: TableColumn, row: Record<string, unknown>) => {
        const issue = row as unknown as Issue;
        const propertyValue = issue.property_values.find(p => p.property_id === column.id) || null;
        if (!propertyValue) return '';

        const propertyDef = propertyDefinitions.find(p => p.id === column.id);
        if (!propertyDef) return '';

        // 从映射中获取对应的单元格组件
        const CellComponent = PROPERTY_CELL_COMPONENTS[propertyDef.type];
        if (!CellComponent) {
            // 默认处理，如果没有找到对应组件
            return propertyValue.value !== null && propertyValue.value !== undefined
                ? String(propertyValue.value)
                : '';
        }
        // 渲染单元格组件，为用户类型的组件提供上下文
        return (
            <UserDataContext.Provider value={userDataContextValue}>
                <CellComponent
                    propertyID={propertyValue.property_id}
                    propertyType={propertyDef.type}
                    value={propertyValue.value}
                    issueId={String(issue.issue_id)}
                    propertyConfig={propertyDef.config}
                    rowData={issue as unknown as Record<string, unknown>}
                />
            </UserDataContext.Provider>
        );
    }, [propertyDefinitions, userDataContextValue]);

    // 新增：行点击处理函数
    const handleRowClick = useCallback((issue: Record<string, unknown>) => {
        setSelectedIssue(issue as unknown as Issue);
        setIsDetailPanelOpen(true);
    }, []);

    return (
        <div className="p-8 w-full h-full">
            {/* 工具栏 - 创建Issue按钮 */}
            <div className="mb-4 flex justify-end">
                <button
                    className="p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none cursor-pointer"
                    aria-label="创建新工单"
                    onClick={() => setIsCreatePanelOpen(true)}
                >
                    <FiPlus className="h-5 w-5" />
                </button>
            </div>

            {/* 表格组件 */}
            <IssueTable
                columns={columns}
                data={issues as unknown as Record<string, unknown>[]}
                renderHeader={renderHeader}
                renderCell={renderCell}
                onRowClick={handleRowClick}
                propertyDefinitions={propertyDefinitions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                pageCount={pageCount}
            />

            {/* 新建issue面板 */}
            {isCreatePanelOpen && (
                <>
                    {/* 白色半透明遮罩 */}
                    <div
                        className="fixed inset-0 z-40"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => setIsCreatePanelOpen(false)}
                    />
                    <CreateIssuePanel
                        onClose={() => setIsCreatePanelOpen(false)}
                        propertyDefinitions={propertyDefinitions}
                        onCreateSuccess={refreshIssueList}
                    />
                </>
            )}

            {/* 新增：issue详情面板 */}
            {isDetailPanelOpen && selectedIssue && (
                <>
                    {/* 白色半透明遮罩 */}
                    <div
                        className="fixed inset-0 z-40"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                            setIsDetailPanelOpen(false);
                            // 清除当前选中的issue和ID
                            setSelectedIssue(null);
                            setCurrentIssueId(null);
                        }}
                    />
                    {/* TODO tech dept 严格来讲应该通过缓存来实现，但时间关系，这里先通过上下文来实现 */}
                    <UserDataContext.Provider value={userDataContextValue}>
                        <IssueDetailPanel
                        onClose={() => {
                            setIsDetailPanelOpen(false);
                            // 清除当前选中的issue和ID
                            setSelectedIssue(null);
                            setCurrentIssueId(null);
                            }}
                            issue={selectedIssue}
                            propertyDefinitions={propertyDefinitions}
                            onUpdateSuccess={refreshIssueList}
                        />
                    </UserDataContext.Provider>
                </>
            )}
        </div>
    );
} 