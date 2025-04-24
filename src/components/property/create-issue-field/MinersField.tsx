'use client';

import { PropertyDefinition } from "@/components/issue/CreateIssueModal";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/shadcn/ui/form";
import MultipleSelector from "@/components/shadcn/ui/multi-select";
import { getSimpleMinersList } from "@/lib/miner/service";
import { cn } from "@/lib/shadcn/utils";
import { Control, FieldValues, Path } from 'react-hook-form';
import { getPropertyTypeIcon } from "../common";


export const MinersField = <TFieldValues extends FieldValues>({
    control,
    propertyDefinition,
    className
}: {
    control: Control<TFieldValues>;
    propertyDefinition: PropertyDefinition;
    className?: string;
}) => {
    const miners = getSimpleMinersList().map(miner => ({
        value: miner.id,
        label: `${miner.id}`,
        status: miner.status
    }));

    return (
        <FormField
            control={control}
            name={propertyDefinition.id as Path<TFieldValues>}
            render={({ field }) => (
                <FormItem className={cn("flex items-center gap-4", className)}>
                    <FormLabel className="text-sm text-gray-600 min-w-[100px] m-0 flex items-center">
                        <div className="w-5 flex-shrink-0 flex justify-center text-gray-500">
                            {getPropertyTypeIcon(propertyDefinition.type)}
                        </div>
                        {propertyDefinition.name}
                    </FormLabel>
                    <FormControl>
                        <MultipleSelector
                            value={field.value ? field.value.map((id: string) => {
                                const miner = miners.find(m => m.value === id);
                                return miner || { value: id, label: id };
                            }) : []}
                            options={miners}
                            placeholder={`Select ${propertyDefinition.name}`}
                            onChange={(selected) => {
                                field.onChange(selected.map(option => option.value));
                            }}
                            emptyIndicator={<div className="p-2 text-center text-sm text-gray-500">No miners available</div>}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default MinersField;
