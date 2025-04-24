'use client';

import { getMinerById, getMinerStatusStyle } from '@/lib/miner/service';
import { PropertyTableCellComponent } from '../type';
import { cn } from '@/lib/shadcn/utils';


export const MinersPropertyCell: PropertyTableCellComponent = ({
    value, propertyConfig
}) => {
    // 处理空值显示
    if (value === null || value === undefined ||
        (Array.isArray(value) && value.length === 0)) {
        return <span className="text-gray-400 italic"></span>;
    }

    // 确保值是数组
    const valueArray = Array.isArray(value) ? value : [value];

    // 获取配置(可选)
    const displayCount = (propertyConfig?.displayCount as number) || 3; // 默认显示3个


    // 判断是否需要显示"更多"提示
    const showMore = valueArray.length > displayCount;
    const displayItems = showMore ? valueArray.slice(0, displayCount) : valueArray;

    // 以标签组形式显示矿机ID列表，带有状态指示和悬停详情
    return (
        <div className="flex flex-row items-center gap-1 w-full overflow-hidden whitespace-nowrap">
            {displayItems.map(minerId => {
                const miner = getMinerById(minerId.toString());
                const statusStyle = miner ? getMinerStatusStyle(miner.status) : getMinerStatusStyle('未知');

                return (
                    <div
                        key={minerId}
                        className="relative group"
                    >
                        <span
                            className="inline-flex items-center shrink-0 justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800"
                            title={miner ? `${miner.model} (${miner.ipAddress})` : '未知矿机'}
                        >
                            <span
                                className={cn("inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0", statusStyle)}
                            ></span>
                            {minerId}
                        </span>

                        {/* 悬停提示 - 使用绝对定位但相对于父容器，避免被裁剪 */}
                        <div className="absolute z-20 left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                            <div className="bg-gray-800 text-white text-xs rounded shadow-lg py-1.5 px-3 whitespace-nowrap">
                                <div className="font-medium">ID: {minerId}</div>
                                <div>型号: {miner ? miner.model : '未知'}</div>
                                <div>IP: {miner ? miner.ipAddress : '未知'}</div>
                                <div>状态: <span className={statusStyle.replace('bg-', 'text-').replace('text-gray-800', 'text-white')}>{miner ? miner.status : '未知'}</span></div>
                            </div>
                            <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-3"></div>
                        </div>
                    </div>
                );
            })}
            {showMore && (
                <span className="text-xs text-gray-500 ml-1">
                    +{valueArray.length - displayCount}台
                </span>
            )}
        </div>
    );
};