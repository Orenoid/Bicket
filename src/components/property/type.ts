import { FilterCondition } from '@/lib/property/types';
import React from 'react';
import { PropertyDefinition } from '../issue/IssuePage';


export interface AppliedFilterProps {
    // 筛选条件
    filter: FilterCondition;
    // 对应的属性定义（用于获取属性名称等展示信息）
    propertyDefinition: PropertyDefinition;
}

/**
 * 当用户启用了属性筛选时，在页面中会展示当前已启用的筛选条件列表
 * 如果某个属性类型需要自定义在这个列表中的展示和交互效果时，则实现并注册该组件类型
 */
export type AppliedFilterComponent = React.FC<AppliedFilterProps>;
