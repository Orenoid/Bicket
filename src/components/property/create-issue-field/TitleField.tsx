'use client'

import {
    FormControl,
    FormField,
    FormItem
} from "@/components/shadcn/ui/form";
import { Input } from '@/components/shadcn/ui/input';
import { SystemPropertyId } from '@/lib/property/constants';
import { Control, FieldValues, Path } from 'react-hook-form';


export const TitleField = <TFieldValues extends FieldValues>({
    control
}: {
    control: Control<TFieldValues>
}) => {
    return (
        <FormField
            control={control}
            name={SystemPropertyId.TITLE as Path<TFieldValues>}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Input
                            placeholder="Issue title"
                            {...field}
                            className='border-0 border-b rounded-none focus-visible:ring-0'
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default TitleField;
