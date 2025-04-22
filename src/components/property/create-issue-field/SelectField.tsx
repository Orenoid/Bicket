'use client';

import { PropertyDefinition } from "@/components/issue/CreateIssueModal";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/shadcn/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/shadcn/ui/select";
import { cn } from "@/lib/shadcn/utils";
import { Control, FieldValues, Path } from 'react-hook-form';
import { getPropertyTypeIcon } from "./common";

interface Option {
    id: string;
    name: string;
    color: string;
}

export const SelectField = <TFieldValues extends FieldValues>({
    control,
    propertyDefinition,
    className
}: {
    control: Control<TFieldValues>;
    propertyDefinition: PropertyDefinition;
    className?: string;
}) => {
    const options: Option[] = (propertyDefinition.config?.options as Option[]) || [];

    const getOptionById = (id: string) => {
        return options.find(option => option.id === id);
    };

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full border-none shadow-none focus:ring-0 focus-visible:ring-0 p-0">
                                <SelectValue placeholder={`Select ${propertyDefinition.name}`}>
                                    {field.value && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: getOptionById(field.value)?.color || '#ccc' }}
                                            />
                                            {getOptionById(field.value)?.name || field.value}
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent align="end">
                            {options.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: option.color }}
                                        />
                                        {option.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
};

export default SelectField;
