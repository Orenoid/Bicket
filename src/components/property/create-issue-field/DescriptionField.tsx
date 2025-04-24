'use client'

import { PropertyDefinition } from "@/components/issue/CreateIssueModal";
import {
    FormControl,
    FormField,
    FormItem
} from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";
import { cn } from "@/lib/shadcn/utils";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeToggle,
    CreateLink,
    headingsPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin
} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css';
import { Fragment, useState } from "react";
import { Control, FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import './DescriptionField.css';

export const DescriptionField = <TFieldValues extends FieldValues>({
    control,
    propertyDefinition,
    setValue,
    className
}: {
    control: Control<TFieldValues>;
    propertyDefinition: PropertyDefinition;
    setValue: UseFormSetValue<TFieldValues>;
    className?: string;
}) => {

    const [internalValue, setInternalValue] = useState(``);

    const handleChange = (markdown: string) => {
        setInternalValue(markdown);
        setValue(propertyDefinition.id as Path<TFieldValues>, markdown as unknown as TFieldValues[Path<TFieldValues>]);
    };

    return (
        <Fragment>
            <div className="mb-4 description-editor-container flex-grow">
                <MDXEditor
                    onChange={handleChange}
                    markdown={internalValue}
                    placeholder={<span className="text-gray-400 text-md">Issue description, markdown supported</span>}
                    contentEditableClassName='h-full'
                    plugins={[
                        // 功能插件
                        headingsPlugin(),
                        quotePlugin(),
                        listsPlugin(),
                        thematicBreakPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        markdownShortcutPlugin(),
                        toolbarPlugin({
                            toolbarContents: () => (
                                <>
                                    <BlockTypeSelect />
                                    <BoldItalicUnderlineToggles />
                                    <CreateLink />
                                    <ListsToggle />
                                    <CodeToggle />
                                </>
                            )
                        })
                    ]}
                />
            </div>
            <FormField
                control={control}
                name={propertyDefinition.id as Path<TFieldValues>}
                render={({ field }) => (
                    <FormItem className={cn(className)}>
                        <FormControl>
                            <Input type="hidden" {...field} name={propertyDefinition.id as Path<TFieldValues>} value={internalValue} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </Fragment>

    );
};



export default DescriptionField;
