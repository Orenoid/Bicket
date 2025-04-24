'use client';

import { createSetOperation } from '@/lib/property/update-operations';
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, InsertImage, ListsToggle, MDXEditor, headingsPlugin, imagePlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin, thematicBreakPlugin, toolbarPlugin } from '@mdxeditor/editor';
import { useEffect, useState } from 'react';
import { DetailFieldComponent } from '../type';
import './DescriptionField.css';
import { Button } from '@/components/shadcn/ui/button';
import { handlePropertyUpdate } from '@/components/property/issue-detail/update';


export const DescriptionField: DetailFieldComponent = ({
    propertyDefinition, value, issueID
}) => {
    // 组件状态
    const [internalValue, setInternalValue] = useState<string>(String(value));
    const [hasChanges, setHasChanges] = useState(false);
    const [originalValue, setOriginalValue] = useState<string>(String(value));

    // 初始化和同步内部值
    useEffect(() => {
        if (value !== undefined && value !== null) {
            setInternalValue(String(value));
            setOriginalValue(String(value));
        } else {
            setInternalValue('');
            setOriginalValue('');
        }
    }, [value]);

    // 更新编辑器内容的处理函数
    const handleChange = (markdown: string) => {
        setInternalValue(markdown);
        // 检查是否有变化
        setHasChanges(markdown !== originalValue);
    };

    // 处理取消操作
    const handleCancel = () => {
        setInternalValue(originalValue);
        setHasChanges(false);
    };

    // 处理保存操作
    const handleSave = async () => {
        const operation = createSetOperation(propertyDefinition.id, internalValue);

        // 调用回调函数更新值
        const success = await handlePropertyUpdate(issueID, operation);
        if (success) {
            setHasChanges(false);
            setOriginalValue(internalValue);
        }
    };

    // 渲染编辑模式
    return (
        <div id="description-editor-container" className="border-gray-200 pt-4 mt-4 pb-4 flex-grow">
            <MDXEditor
                onChange={handleChange}
                markdown={internalValue}
                placeholder={<span className="text-gray-400 text-md">Issue description, supports markdown format</span>}
                contentEditableClassName='h-full'
                plugins={[
                    headingsPlugin(),
                    quotePlugin(),
                    listsPlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    markdownShortcutPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                                <CreateLink />
                                <ListsToggle />
                                <CodeToggle />
                                <InsertImage />
                            </>
                        )
                    })
                ]} />

            {/* 操作按钮 - 只有在有变化时才显示 */}
            {hasChanges && (
                <div className="mt-2 z-50 flex justify-end">
                    <Button variant="ghost" onClick={handleCancel} className="mr-2">
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};
