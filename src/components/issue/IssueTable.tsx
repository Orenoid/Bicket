"use client";

import { useDataTable } from "@/hooks/use-data-table";
import { useUserData } from "@/hooks/use-user-data";
import {
  CAN_DISPLAY_IN_TABLE_PROPERTY_IDS,
  SORTABLE_PROPERTY_IDS,
  SystemPropertyId,
} from "@/lib/property/constants";
import { Issue, PropertyDefinition } from "@/lib/property/types";
import { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MdAdd } from "react-icons/md";
import { getPropertyTableCellComponent } from "../property/registry-utils";
import { DataTableColumnHeader } from "../shadcn/data-table/data-table-column-header";
import { DataTableSortList } from "../shadcn/data-table/data-table-sort-list";
import { DataTableToolbar } from "../shadcn/data-table/data-table-toolbar";
import { Button } from "../shadcn/ui/button";
import { CreateIssueModal } from "./CreateIssueModal";
import "./IssueTable.css";
import { UserDataContext } from "./UserContext";
import FiltersToolBar from "./FiltersToolBar";

// 如果启用了 ssr，DataTable 在 hydration 之前会显示原始的数据库数据，观感反而不好，
// 所以改成动态导入，若追求响应速度，再考虑启用 ssr
const DataTable = dynamic(
  () => import("../shadcn/data-table/data-table").then((mod) => mod.DataTable),
  { ssr: false },
);

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

export function IssueTable({
  issues,
  propertyDefinitions,
  pageCount,
}: IssueTableProps) {
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);

  const columns = useMemo<TableColumn[]>(
    () =>
      propertyDefinitions
        .map((prop) => ({ id: prop.id, title: prop.name }))
        .filter((column) =>
          CAN_DISPLAY_IN_TABLE_PROPERTY_IDS.includes(
            column.id as SystemPropertyId,
          ) || column.id === 'plugin0001',
        ),
    [propertyDefinitions],
  );
  console.log('columns', columns);

  // 提取 issue 列表中涉及的用户，批量预加载
  const userDataContextValue = useUserData(issues, propertyDefinitions);

  // 把业务定义的 columns 转换为 TanStack Table 的 ColumnDef
  const tanstackColumns = useMemo<ColumnDef<Issue>[]>(() => {
    const renderCell = (column: TableColumn, issue: Issue) => {
      let propertyValue = issue.property_values.find(
        (p) => p.property_id === column.id,
      );
      if (!propertyValue) {
        if (column.id === 'plugin0001') {
          propertyValue = {
            property_id: 'plugin0001',
            value: 'whatever',
          }
        } else {
          return ""
        }
      }
      console.log('propertyValue', propertyValue);
      const propertyDef = propertyDefinitions.find((p) => p.id === column.id);
      if (!propertyDef) return "";

      // 从工厂方法中获取对应的单元格组件
      if (propertyDef.type === 'plugin') {
        console.log('propertyDef', propertyDef);
        console.log('propertyDef.type', propertyDef.type);
      }
      const CellComponent = getPropertyTableCellComponent(propertyDef.type);
      // console.log('CellComponent', CellComponent);
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
      ...columns.map((column_) => ({
        id: column_.id,
        accessorKey: column_.id,
        enableSorting: SORTABLE_PROPERTY_IDS.includes(
          column_.id as SystemPropertyId,
        ),
        header: ({ column }: { column: Column<Issue, unknown> }) => (
          <DataTableColumnHeader
            className="cursor-pointer"
            column={column}
            title={column_.title}
          />
        ),
        cell: ({ row }: { row: Row<Issue> }) => (
          <CellWrapper issueID={String(row.original.issue_id)}>
            {renderCell(column_, row.original)}
          </CellWrapper>
        ),
        meta: {
          label: column_.title,
        },
      })),
    ];
  }, [columns, propertyDefinitions, userDataContextValue]);

  const { table } = useDataTable({
    data: issues,
    columns: tanstackColumns as ColumnDef<Issue>[],
    pageCount: pageCount,
    getRowId: (row) => row.issue_id as string,
    shallow: false,
  });

  return (
    <div className="data-table-container h-full">
      <DataTable table={table as Table<unknown>} className="h-full">
        {/* 表格工具栏 左端 */}
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center">
            <Button
              variant="outline"
              size="icon"
              className="mr-2"
              onClick={() => setShowCreateIssueModal(true)}
            >
              <MdAdd />
            </Button>
            {/* 筛选器相关UI - 使用提取的组件 */}
            <FiltersToolBar propertyDefinitions={propertyDefinitions} />
          </div>
          {/* 表格工具栏 右端 */}
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        </div>
      </DataTable>
      {showCreateIssueModal && (
        <CreateIssueModal
          onClose={() => setShowCreateIssueModal(false)}
          propertyDefinitions={propertyDefinitions}
          onCreateSuccess={() => {
            setShowCreateIssueModal(false);
          }}
        />
      )}
    </div>
  );
}

const CellWrapper = ({
  issueID,
  children,
}: {
  issueID: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <div className="w-full h-full">
      {/* 设置为 block 后，空白单元格也能点击 */}
      <Link className="block w-full h-full" href={`/issues/${issueID}`}>
        {children}
      </Link>
    </div>
  );
};
