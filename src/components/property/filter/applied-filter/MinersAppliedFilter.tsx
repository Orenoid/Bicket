'use client'

import { getMinerById, getMinerStatusStyle } from '@/lib/miner/service';
import { AppliedFilterComponent } from '../../type';
import { cn } from '@/lib/shadcn/utils';


/**
 * 矿机列表类型的已应用筛选组件
 */
export const MinersAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 根据操作符显示不同的格式
    switch (filter.operator) {
        case 'in':
            // 值为矿机ID数组
            const selectedIds = filter.value as string[];

            if (selectedIds.length === 0) {
                return <span>未选择矿机</span>;
            } else if (selectedIds.length === 1) {
                // 单个矿机情况
                const minerId = selectedIds[0];
                const miner = getMinerById(minerId);
                const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                return (
                    <span className="flex items-center">
                        <span
                            className={cn("inline-block w-2 h-2 rounded-full mr-1", statusStyle)} />
                        {minerId}
                    </span>
                );
            } else if (selectedIds.length <= 3) {
                // 显示所有选中的矿机ID（最多3个）
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedIds.map(minerId => {
                            const miner = getMinerById(minerId);
                            const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                            return (
                                <span key={minerId} className="flex items-center">
                                    <span
                                        className={cn("inline-block w-2 h-2 rounded-full mr-1", statusStyle)} />
                                    {minerId}
                                </span>
                            );
                        })}
                    </div>
                );
            } else {
                // 超过3个矿机，显示前2个和数量提示
                return (
                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                        {selectedIds.slice(0, 2).map(minerId => {
                            const miner = getMinerById(minerId);
                            const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');
                            return (
                                <span key={minerId} className="flex items-center">
                                    <span
                                        className={cn("inline-block w-2 h-2 rounded-full mr-1", statusStyle)} />
                                    {minerId}
                                </span>
                            );
                        })}
                        <span className="text-xs text-gray-500">
                            +{selectedIds.length - 2}
                        </span>
                    </div>
                );
            }
        default:
            return <span>{String(filter.value)}</span>;
    }
};
