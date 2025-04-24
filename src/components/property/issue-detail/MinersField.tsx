'use client';

import { LoadingContainerOverlay } from '@/components/ui/overlay';
import { getSimpleMinersList, getMinerById, getMinerStatusStyle } from '@/lib/miner/service';
import { createRemoveOperation, createUpdateOperation } from '@/lib/property/update-operations';
import React, { useState, useRef, useEffect } from 'react';
import { MdCancel } from 'react-icons/md';
import { getPropertyTypeIcon } from '../common';
import { DetailFieldComponent } from '../type';
import { handlePropertyUpdate } from '@/components/property/issue-detail/update';
import { cn } from '@/lib/shadcn/utils';


export const MinersField: DetailFieldComponent = ({
    propertyDefinition, value, issueID
}) => {
    // 状态管理
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [selectedMiners, setSelectedMiners] = useState<string[]>([]);
    const [tempSelectedMiners, setTempSelectedMiners] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // 下拉框引用，用于检测点击外部关闭
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 获取矿机列表数据
    const miners = getSimpleMinersList();

    // 当属性值变化时更新内部状态
    useEffect(() => {
        if (value === null || value === undefined) {
            setSelectedMiners([]);
            setTempSelectedMiners([]);
        } else if (Array.isArray(value)) {
            const minerIds = value.map(v => String(v));
            setSelectedMiners(minerIds);
            setTempSelectedMiners(minerIds);
        } else {
            // 单个值情况，转为数组
            const minerIds = [String(value)];
            setSelectedMiners(minerIds);
            setTempSelectedMiners(minerIds);
        }
        setHasChanges(false);
    }, [value]);

    // 获取已选中的矿机信息
    const selectedMinersInfo = (isDropdownOpen ? tempSelectedMiners : selectedMiners)
        .map(id => getMinerById(id))
        .filter(Boolean); // 过滤掉未找到的矿机


    // 处理选择矿机（只更新临时状态）
    const handleSelectMiner = (minerId: string) => {
        // 检查是否已选中
        const isAlreadySelected = tempSelectedMiners.includes(minerId);

        let newValues;
        if (isAlreadySelected) {
            // 若已选中，则从选中列表中移除
            newValues = tempSelectedMiners.filter(id => id !== minerId);
        } else {
            // 若未选中，则添加到选中列表
            newValues = [...tempSelectedMiners, minerId];
        }

        // 更新临时状态
        setTempSelectedMiners(newValues);
        // 标记有未保存的变更
        setHasChanges(JSON.stringify(newValues) !== JSON.stringify(selectedMiners));
    };

    // 处理清除所有矿机
    const handleClearAllMiners = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框


        // 清空临时选择
        setTempSelectedMiners([]);
        // 标记有变更
        setHasChanges(selectedMiners.length > 0);
    };

    // 处理删除单个矿机
    const handleRemoveMiner = (minerId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框

        if (isDropdownOpen) {
            // 下拉框打开时，从临时列表中移除
            const newValues = tempSelectedMiners.filter(id => id !== minerId);
            setTempSelectedMiners(newValues);
            // 标记有变更
            setHasChanges(JSON.stringify(newValues) !== JSON.stringify(selectedMiners));
        } else {
            // 下拉框关闭时，直接执行更新
            updateMinersSelection(selectedMiners.filter(id => id !== minerId));
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const applyChanges = async () => {
        if (hasChanges ) {
            updateMinersSelection(tempSelectedMiners);
        }
    };

    // 更新矿机选择的统一处理函数
    const updateMinersSelection = async (minerIds: string[]) => {

        setIsLoading(true);
        let operation;

        if (minerIds.length === 0) {
            // 如果没有选中项，则使用REMOVE操作
            operation = createRemoveOperation(propertyDefinition.id);
        } else {
            // 否则更新选中项列表
            operation = createUpdateOperation(propertyDefinition.id, minerIds);
        }

        // 调用回调函数更新值
        const success = await handlePropertyUpdate(issueID, operation);
        if (success) {
            setSelectedMiners(minerIds);
            setTempSelectedMiners(minerIds);
            setHasChanges(false);
        } else {
            // 更新失败，恢复临时选择
            setTempSelectedMiners(selectedMiners);
        }
        setIsLoading(false);
    };

    // 切换下拉框显示状态
    const toggleDropdown = () => {
        if (isDropdownOpen) {
            // 如果要关闭下拉框，且有变更，则应用变更
            if (hasChanges) {
                applyChanges();
            }
            setIsDropdownOpen(false);
        } else {
            // 打开下拉框时，确保临时选择与当前选择一致
            setTempSelectedMiners([...selectedMiners]);
            setHasChanges(false);
            setIsDropdownOpen(true);
        }
    };

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // 如果有变更，则应用变更
                if (hasChanges) {
                    applyChanges();
                }
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [applyChanges, hasChanges, selectedMiners, tempSelectedMiners]);

    return (
        <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600 font-semibold flex items-center">
                <div className="w-5 flex-shrink-0 flex justify-center">
                    {getPropertyTypeIcon(propertyDefinition.type)}
                </div>
                <span className="truncate" title={propertyDefinition.name}>{propertyDefinition.name}</span>
            </div>
            <div className="relative w-auto min-w-[120px] max-w-[320px] pl-3" ref={dropdownRef}>
                {/* 触发下拉框的按钮/显示区域 */}
                <div
                    className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors relative"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedMinersInfo.length > 0 ? (
                        <div className="flex flex-wrap items-center w-full gap-1">
                            {/* 显示选中的矿机标签 */}
                            <div className="flex flex-wrap items-center gap-1 max-w-full">
                                {selectedMinersInfo.map(miner => miner && (
                                    <div
                                        key={miner.id}
                                        className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 max-w-[140px] group"
                                        title={`${miner.model} - ${miner.status} - ${miner.ipAddress}`}
                                    >
                                        <span
                                            className={cn("inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0", getMinerStatusStyle(miner.status))}
                                        ></span>
                                        <span className="text-xs truncate">{miner.id}</span>
                                        <button
                                            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                            onClick={(e) => handleRemoveMiner(miner.id, e)}
                                            title="移除此矿机"
                                        >
                                            <MdCancel size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* 清除所有按钮 */}
                            {selectedMinersInfo.length > 1 && isHovering && (
                                <button
                                    onClick={handleClearAllMiners}
                                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                                    title="清除所有矿机"
                                >
                                    <MdCancel size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">Select miners</span>
                    )}
                    {isLoading && <LoadingContainerOverlay />}
                </div>

                {/* 下拉选项菜单 */}
                {isDropdownOpen && (
                    <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                            {miners.length > 0 ? (
                                miners.map(miner => (
                                    <div
                                        key={miner.id}
                                        onClick={() => handleSelectMiner(miner.id)}
                                        className={cn(
                                            "flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer",
                                            {
                                                "bg-gray-100": tempSelectedMiners.includes(miner.id)
                                            }
                                        )}
                                    >
                                        <div className="flex items-center flex-1 min-w-0">
                                            <span
                                                className={cn("inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0", getMinerStatusStyle(miner.status))}
                                            ></span>
                                            <div className="truncate">
                                                <span className="text-sm font-medium">{miner.id}</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {miner.model} - {miner.ipAddress}
                                                </span>
                                            </div>
                                        </div>
                                        {tempSelectedMiners.includes(miner.id) && (
                                            <span className="ml-2 text-blue-500">✓</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-3 text-gray-500">
                                    没有可用的矿机
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
