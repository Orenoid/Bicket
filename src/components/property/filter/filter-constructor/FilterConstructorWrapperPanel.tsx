'use client';

import { TransparentOverlay } from '@/components/ui/overlay';
import { FilterConstructorComponent, FilterConstructorPanelProps } from '../../type';


export function FilterConstructorWrapperPanel(
    {
        ConstructorComponent, props
    }: {
        ConstructorComponent: FilterConstructorComponent, props: FilterConstructorPanelProps
    }
) {
    const { onCancel } = props;

    return (
        // 阻止冒泡，防止触发 applied-filter 的点击事件（在编辑状态下， panel 会作为 applied-filter 的子组件）
        <div className={`${props.className}`} onClick={(e) => { e.stopPropagation(); }}>
            <TransparentOverlay onClick={onCancel} />
            <ConstructorComponent {...props} />
        </div>
    );
}

