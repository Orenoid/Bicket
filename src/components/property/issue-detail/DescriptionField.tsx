"use client";

import { handlePropertyUpdate } from "@/components/property/issue-detail/update";
import { Button } from "@/components/shadcn/ui/button";
import { createSetOperation } from "@/lib/property/update-operations";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  ListsToggle,
  MDXEditor,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { DetailFieldComponent } from "../type";
import "./DescriptionField.css";

export const DescriptionField: DetailFieldComponent = ({
  propertyDefinition,
  value,
  issueID,
}) => {
  // 组件状态
  const [internalValue, setInternalValue] = useState<string>(
    typeof value === "string" ? value : "",
  );
  const [originalValue, setOriginalValue] = useState<string>(
    typeof value === "string" ? value : "",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const hasChanges = internalValue !== originalValue;

  // 更新编辑器内容的处理函数
  const handleChange = (markdown: string) => {
    setInternalValue(markdown);
  };

  // 处理取消操作
  const handleCancel = () => {
    setInternalValue(originalValue);
  };

  // 处理保存操作
  const handleSave = async () => {
    const operation = createSetOperation(propertyDefinition.id, internalValue);
    setIsUpdating(true);
    const success = await handlePropertyUpdate(issueID, operation);
    if (success) {
      setOriginalValue(internalValue);
    }
    setIsUpdating(false);
  };

  // 渲染编辑模式
  return (
    <div className="border-gray-200 pt-4 mt-4 pb-4 flex flex-col flex-grow description-editor-container">
      <MDXEditor
        onChange={handleChange}
        markdown={internalValue}
        placeholder={
          <span className="text-gray-400 text-md">
            Issue description, supports markdown format
          </span>
        }
        contentEditableClassName="h-full"
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
            ),
          }),
        ]}
      />
      {/* 操作按钮 - 只有在有变化时才显示 */}
      <div
        className={clsx("mt-2 z-50 flex justify-end", {
          "opacity-0 pointer-events-none": !hasChanges,
        })}
      >
        <Button variant="ghost" onClick={handleCancel} className="mr-2">
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {isUpdating && <Loader2 className="animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
};
