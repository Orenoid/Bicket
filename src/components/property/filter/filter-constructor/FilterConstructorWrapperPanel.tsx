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
        <div className={`${props.className}`} onClick={ (e) => { console.log('click'); e.stopPropagation(); }}>
            <TransparentOverlay onClick={onCancel} />
            <ConstructorComponent {...props} />
        </div>
    );
}

