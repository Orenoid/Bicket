import { DataTableSkeleton } from "@/components/shadcn/data-table/data-table-skeleton";

export default function Loading() {
    // 骨架屏
    return <div className="flex flex-col h-full w-full">
        <DataTableSkeleton
            columnCount={7}
            filterCount={2}
            cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
                "6rem",
            ]}
            shrinkZero
        />
    </div>
}