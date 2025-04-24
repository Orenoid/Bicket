import { Skeleton } from "@/components/shadcn/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-row h-full">
      {/* 左侧面板内容 */}
      <div className="flex flex-col h-full w-3/4 border-r border-gray-200 pt-4 px-8">
        <div className="flex flex-col flex-grow">
          {/* 标题 */}
          <div className="mb-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
          </div>

          {/* 描述 */}
          <div className="mt-4">
            <Skeleton className="h-96 w-full mb-2" />
          </div>
        </div>
      </div>

      {/* 右侧：属性列表 */}
      <div className="flex flex-col w-1/4 h-full pl-5 pt-5 overflow-y-auto">
        {/* 属性列表骨架 */}
        <div className="flex flex-col gap-3 pl-3 mb-8">
          {Array(10)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="flex flex-col gap-1">
                <Skeleton className="h-4 w-16 mb-1" /> {/* 属性名称 */}
                <Skeleton className="h-8 w-full" /> {/* 属性值 */}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
