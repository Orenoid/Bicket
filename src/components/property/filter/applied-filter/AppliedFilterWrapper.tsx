'use client';

import { PropertyDefinition } from "@/lib/property/types";
import { FilterCondition } from '@/lib/property/types';
import React from 'react';
import { FiX } from 'react-icons/fi';
import { AppliedFilterComponent } from '../../type';


export interface AppliedFilterWrapperProps {
    // 筛选条件
    filter: FilterCondition;
    // 对应的属性定义
    propertyDefinition: PropertyDefinition;
    // 移除筛选条件的回调
    onRemove: (filterId: string) => void;
    // 要使用的筛选组件
    FilterComponent: AppliedFilterComponent;
    // 点击已应用筛选条件的回调
    onClick?: () => void;
    // 子组件
    children?: React.ReactNode;
}
/**
 * 为不同属性类型的筛选条件提供一个统一的包装，包含通用功能（如移除按钮）
 */
export const AppliedFilterWrapper: React.FC<AppliedFilterWrapperProps> = ({
    filter, propertyDefinition, onRemove, FilterComponent, onClick, children,
}) => {
    return (
        <div
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2 hover:cursor-pointer relative"
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            } }
        >
            <span className="font-medium text-gray-700 mr-1">{propertyDefinition.name}:</span>
            <div className="mr-2">
                <FilterComponent
                    filter={filter}
                    propertyDefinition={propertyDefinition} />
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(filter.propertyId);
                } }
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label={`移除${propertyDefinition.name}筛选`}
            >
                <FiX size={14} />
            </button>
            {children}
        </div>
    );
};
