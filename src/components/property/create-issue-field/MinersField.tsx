'use client';

import { PropertyDefinition } from "@/components/issue/CreateIssueModal";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/shadcn/ui/form";
import MultipleSelector, { Option } from "@/components/shadcn/ui/multi-select";
import { getSimpleMinersList } from "@/lib/miner/service";
import { cn } from "@/lib/shadcn/utils";
import { useEffect, useState } from "react";
import { Control, FieldValues, Path } from 'react-hook-form';
import { getPropertyTypeIcon } from "./common";


export const MinersField = <TFieldValues extends FieldValues>({
    control,
    propertyDefinition,
    className
}: {
    control: Control<TFieldValues>;
    propertyDefinition: PropertyDefinition;
    className?: string;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [miners, setMiners] = useState<Option[]>([]);

    // 加载矿机数据
    useEffect(() => {
        const fetchMiners = () => {
            setIsLoading(true);
            try {
                const minersList = getSimpleMinersList();

                const options = minersList.map(miner => ({
                    value: miner.id,
                    label: `${miner.id}`,
                    status: miner.status
                }));

                setMiners(options);
            } catch (error) {
                console.error("加载矿机数据失败:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMiners();
    }, []);

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
                                // 将选中的选项值数组传递给表单
                                field.onChange(selected.map(option => option.value));
                            }}
                            loadingIndicator={isLoading ? <div className="p-2 text-center text-sm text-gray-500">Loading miners data...</div> : undefined}
                            emptyIndicator={<div className="p-2 text-center text-sm text-gray-500">No miners available</div>}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default MinersField;
