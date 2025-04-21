'use client';

import { useDataTable } from "@/hooks/use-data-table";
import { CAN_DISPLAY_IN_TABLE_PROPERTY_IDS, FILTERABLE_PROPERTY_TYPES, PropertyType, SORTABLE_PROPERTY_IDS, SystemPropertyId } from "@/lib/property/constants";
import { FilterCondition } from "@/lib/property/types";
import { getUserList, User } from "@/lib/user/service";
import { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MdClose, MdFilterList } from "react-icons/md";
import { AppliedFilterWrapper } from "../property/filter/applied-filter/AppliedFilterWrapper";
import { FilterConstructorWrapperPanel } from "../property/filter/filter-constructor/FilterConstructorWrapperPanel";
import { getAppliedFilterComponent, getFilterConstructorComponent, getPropertyTableCellComponent } from "../property/registry-utils";
import { DataTableColumnHeader } from "../shadcn/data-table/data-table-column-header";
import { DataTableSortList } from "../shadcn/data-table/data-table-sort-list";
import { DataTableToolbar } from "../shadcn/data-table/data-table-toolbar";
import { DropDownMenuV2 } from "../ui/dropdownMenu";
import { Issue, PropertyDefinition } from "@/lib/property/types";
import { UserDataContext } from "./UserContext";
import { useQueryState } from "nuqs";
import { getFiltersStateParser } from "@/lib/parser";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// 如果启用了 ssr，DataTable 在 hydration 之前会显示原始的数据库数据，观感反而不好，
// 所以改成动态导入，若追求响应速度，再考虑启用 ssr
const DataTable = dynamic(() => import("../shadcn/data-table/data-table").then(mod => mod.DataTable), { ssr: false });

const FILTERS_QUERY_KEY = 'filters';
interface TableColumn {
    id: string;
    title: string;
    width?: number;
}

export interface IssueTableProps {
    issues: Issue[]; // 符合筛选条件的 issue 列表，表格数据
    propertyDefinitions: PropertyDefinition[]; // 属性定义列表，用于表头
    pageCount: number; // 符合筛选条件的 issue 的总页数，供分页组件使用
}
export function IssueTable({ issues, propertyDefinitions, pageCount }: IssueTableProps) {

    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<PropertyDefinition | null>(null);
    const [editingFilter, setEditingFilter] = useState<string | null>(null);
    const [appliedFilters_, setAppliedFilters] = useQueryState(FILTERS_QUERY_KEY, getFiltersStateParser());
    const appliedFilters = appliedFilters_ ?? [];
    
    const searchParams = useSearchParams();
    const router = useRouter();
    useEffect(() => {
        router.refresh()
    }, [router, searchParams]);

    const columns = useMemo<TableColumn[]>(() =>
        propertyDefinitions
            .map(prop => ({ id: prop.id, title: prop.name }))
            .filter(column => CAN_DISPLAY_IN_TABLE_PROPERTY_IDS.includes(column.id as SystemPropertyId))
        , [propertyDefinitions]);

    // 设置新的 filter
    const handleFilterApply = (filter: FilterCondition | null) => {
        if (filter) {
            setAppliedFilters([...appliedFilters, filter]);
        }
        setSelectedPropertyFilter(null); // 关闭筛选面板
        setEditingFilter(null); // 关闭编辑面板
    };
    // 取消设置 filter
    const handleFilterCancel = () => {
        setSelectedPropertyFilter(null); // 关闭筛选面板
        setEditingFilter(null); // 关闭编辑面板
    };
    // 移除筛选条件
    const handleRemoveFilter = (propertyID: string) => {
        setAppliedFilters(appliedFilters.filter(filter => filter.propertyId !== propertyID));
    };
    // 清除所有筛选条件
    const handleClearAllFilters = () => {
        setAppliedFilters([]);
        setSelectedPropertyFilter(null);
        setEditingFilter(null);
    };
    // 获取某个属性的当前 filter
    const getCurrentFilter = (propertyId: string): FilterCondition | null => {
        return appliedFilters.find(f => f.propertyId === propertyId) || null;
    };

    const getPropertyDefinition = (propertyId: string): PropertyDefinition | null => {
        return propertyDefinitions.find(p => p.id === propertyId) || null;
    };

    // 可筛选属性下拉菜单
    const filterMenuItems = propertyDefinitions
        .filter(prop => FILTERABLE_PROPERTY_TYPES.includes(prop.type as PropertyType))
        // 过滤掉已经设置了过滤条件的属性
        .filter(prop => !appliedFilters.some(filter => filter.propertyId === prop.id))
        .map(prop => ({
            label: (
                <div className="flex items-center">
                    <span>{prop.name}</span>
                </div>
            ),
            onClick: () => {
                setSelectedPropertyFilter(prop);
            }
        }));

    // TODO tech dept 批量预加载 clerk 用户的临时解决方案，未来应该设计一套适用于所有属性类型的通用解决方案
    // 新增：用户数据状态
    const [userData, setUserData] = useState<Record<string, User>>({});
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    // 创建用户数据上下文值
    const userDataContextValue = useMemo(() => ({
        userData,
        isLoading: isLoadingUsers
    }), [userData, isLoadingUsers]);
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

    // 自定义筛选按钮 TODO 替换 shacdn ui 组件
    const FilterButton = (
        <div
            className="flex items-center text-sm text-gray-700"
        >
            <MdFilterList size={16} className={`${appliedFilters.length === 0 ? "mr-2" : ""} text-gray-500`} />
            {appliedFilters.length === 0 && <span>Filter</span>}
        </div>
    );

    // 渲染已应用的筛选条件
    const renderAppliedFilters = () => {
        return appliedFilters.map(filter => {
            const propertyDef = getPropertyDefinition(filter.propertyId);
            if (!propertyDef) return null;

            // 使用工厂方法动态获取对应类型的筛选组件
            const FilterComponent = getAppliedFilterComponent(propertyDef.type);
            const isEditing = editingFilter === filter.propertyId;

            return (
                <AppliedFilterWrapper
                    key={filter.propertyId}
                    filter={filter}
                    propertyDefinition={propertyDef}
                    onRemove={handleRemoveFilter}
                    FilterComponent={FilterComponent}
                    onClick={() => {
                        setEditingFilter(isEditing ? null : filter.propertyId);
                    }}
                >
                    {/* 点击 applied filter 时，打开编辑面板 */}
                    {isEditing && (
                        <FilterConstructorWrapperPanel
                            ConstructorComponent={getFilterConstructorComponent(propertyDef.type)}
                            props={{
                                propertyDefinition: propertyDef,
                                currentFilter: filter,
                                onApply: handleFilterApply,
                                onCancel: handleFilterCancel,
                                className: "absolute left-0 top-[100%]"
                            }}
                        />
                    )}
                </AppliedFilterWrapper>
            );
        });
    };

    // 把业务定义的 columns 转换为 TanStack Table 的 ColumnDef
    const tanstackColumns = useMemo<ColumnDef<Issue>[]>(
        () => {
            const renderCell = (column: TableColumn, issue: Issue) => {
                const propertyValue = issue.property_values.find(p => p.property_id === column.id);
                if (!propertyValue) return '';
                const propertyDef = propertyDefinitions.find(p => p.id === column.id);
                if (!propertyDef) return '';

                // 从工厂方法中获取对应的单元格组件
                const CellComponent = getPropertyTableCellComponent(propertyDef.type);
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
            };

            return [
                ...columns.map(
                    (column_) => ({
                        id: column_.id,
                        accessorKey: column_.id,
                        enableSorting: SORTABLE_PROPERTY_IDS.includes(column_.id as SystemPropertyId),
                        header: ({ column }: { column: Column<Issue, unknown> }) => (
                            <DataTableColumnHeader className="cursor-pointer" column={column} title={column_.title} />
                        ),
                        cell: ({ row }: { row: Row<Issue> }) => (
                            <CellWrapper onClick={() => { }}>
                                {renderCell(column_, row.original)}
                            </CellWrapper>
                        ),
                        meta: {
                            label: column_.title,
                        },
                    })
                ),
            ];
        }, [columns, propertyDefinitions, userDataContextValue]
    );

    const { table } = useDataTable({
        data: issues,
        columns: tanstackColumns as ColumnDef<Issue>[],
        pageCount: pageCount,
        // initialState: {
        //     sorting: [{ id: SystemPropertyId.ID, desc: true }],
        // },
        getRowId: (row) => row.issue_id as string,
        shallow: false,
    });

    return (
        <div className="data-table-container h-full">
            <DataTable table={table as Table<unknown>} className="h-full">
                <div className="flex flex-row justify-between">
                    {/* 筛选器相关UI */}
                    <div className="flex flex-row items-center">
                        <div className="flex flex-row items-center mr-2">
                            {/* 展示当前已设置的筛选条件 */}
                            {renderAppliedFilters()}
                            {/* clear 按钮，当筛选条件数量大于等于 2 时显示 */}
                            {appliedFilters.length >= 2 && (
                                <button
                                    onClick={handleClearAllFilters}
                                    className="flex items-center px-2 py-1 ml-1 mb-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <span className="mr-1">Clear</span>
                                    <MdClose size={16} />
                                </button>
                            )}
                        </div>
                        <div className="mr-2 mb-2 relative">
                            <DropDownMenuV2
                                entryLabel={FilterButton}
                                menuItems={filterMenuItems}
                                entryClassName="border border-gray-200 rounded"
                                menuClassName="w-64 bg-white border border-gray-200 rounded-md shadow-lg"
                            />
                            {/* 设置筛选条件的面板 */}
                            {selectedPropertyFilter && (
                                <FilterConstructorWrapperPanel
                                    ConstructorComponent={getFilterConstructorComponent(selectedPropertyFilter.type)}
                                    props={{
                                        propertyDefinition: selectedPropertyFilter,
                                        currentFilter: getCurrentFilter(selectedPropertyFilter.id),
                                        onApply: handleFilterApply,
                                        onCancel: handleFilterCancel,
                                        className: "absolute top-[100%] left-0"
                                    }}
                                />
                            )}
                        </div>

                    </div>
                    {/* 表格工具栏 */}
                    <DataTableToolbar table={table}>
                        <DataTableSortList table={table} align="end" />
                    </DataTableToolbar>
                </div>
            </DataTable>
        </div>
    );

}

const CellWrapper = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return (
        <div className="hover:cursor-pointer w-full h-full" onClick={onClick}>
            {children}
        </div>
    );
};
