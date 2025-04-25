"use client";

import { FormControl, FormField, FormItem } from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";
import { SystemPropertyId } from "@/lib/property/constants";
import { cn } from "@/lib/shadcn/utils";
import { Control, FieldValues, Path } from "react-hook-form";

export const TitleField = <TFieldValues extends FieldValues>({
  control,
  className,
}: {
  control: Control<TFieldValues>;
  className?: string;
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
              className={cn(
                "border-0 rounded-none focus-visible:ring-0 placeholder:text-gray-400",
                className,
              )}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TitleField;
