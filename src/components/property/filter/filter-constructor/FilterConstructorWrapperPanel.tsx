'use client';

import { TransparentOverlay } from '@/components/ui/overlay';
import { FilterConstructorComponent, FilterConstructorPanelProps } from '../../type';
import { cn } from '@/lib/shadcn/utils';


export function FilterConstructorWrapperPanel(
    {
        ConstructorComponent, props
    }: {
        ConstructorComponent: FilterConstructorComponent, props: FilterConstructorPanelProps
    }
) {
    const { onCancel } = props;

    return (
        <div className={cn(props.className)} onClick={ (e) => { e.stopPropagation(); }}>
            <TransparentOverlay onClick={onCancel} />
            <ConstructorComponent {...props} />
        </div>
    );
}

