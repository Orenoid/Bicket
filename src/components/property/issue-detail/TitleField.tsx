"use client";

import { createSetOperation } from "@/lib/property/update-operations";
import React, { useState, useRef, useEffect } from "react";
import { DetailFieldComponent } from "../type";
import { handlePropertyUpdate } from "@/components/property/issue-detail/update";

export const TitleField: DetailFieldComponent = ({
  propertyDefinition: _propertyDefinition,
  value,
  issueID,
}) => {
  // 存储组件内部状态
  const [internalValue, setInternalValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showError, setShowError] = useState(false);

  // 输入框引用，用于设置光标位置
  const inputRef = useRef<HTMLInputElement>(null);

  // 记录点击位置
  const [clickPosition, setClickPosition] = useState<number | null>(null);

  // 初始化和同步内部值
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInternalValue(String(value));
    } else {
      setInternalValue("");
    }
  }, [value]);

  // 当进入编辑模式且有点击位置时，设置光标位置
  useEffect(() => {
    if (isEditing && inputRef.current && clickPosition !== null) {
      inputRef.current.focus();

      // 尝试将光标设置到点击位置
      try {
        inputRef.current.setSelectionRange(clickPosition, clickPosition);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // 如果设置失败（例如位置超出范围），将光标设置到末尾
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }

      // 重置点击位置
      setClickPosition(null);
    }
  }, [isEditing, clickPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (showError) {
      setShowError(false);
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      // 恢复原值
      if (value !== undefined && value !== null) {
        setInternalValue(String(value));
      }
    }
  };

  const handleSave = async () => {
    if (!internalValue.trim()) {
      setShowError(true);
      return;
    }

    // 如果值没有变化，直接关闭编辑状态，不触发更新回调
    const originalValue =
      value !== undefined && value !== null ? String(value) : "";
    if (internalValue === originalValue) {
      setIsEditing(false);
      return;
    }

    const operation = createSetOperation(_propertyDefinition.id, internalValue);
    const success = await handlePropertyUpdate(issueID, operation);
    if (success) {
      setIsEditing(false);
    }
  };

  // 处理单击事件，进入编辑模式
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) {
      // 计算点击位置相对于文本开始的偏移量
      // 这是一个近似计算，因为文本和输入框可能有样式差异
      const textElement = e.currentTarget.querySelector("h1");
      if (textElement) {
        const rect = textElement.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // 估算字符位置 - 使用平均字符宽度作为估算
        // 这个值可能需要根据实际字体调整
        const avgCharWidth = 18; // 根据字体大小估算的像素宽度
        const estimatedPosition = Math.floor(clickX / avgCharWidth);

        // 确保位置在文本范围内
        const clampedPosition = Math.min(
          Math.max(0, estimatedPosition),
          internalValue.length,
        );

        setClickPosition(clampedPosition);
      }

      setIsEditing(true);
    }
  };

  // 根据编辑状态渲染不同的视图
  if (isEditing) {
    return (
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          placeholder="Issue title"
          className="text-3xl w-full px-3 py-2 border-0 border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400 transition-colors"
        />
        {/* 错误提示区域 */}
        {showError && (
          <div className="mt-1 text-sm text-red-500">
            标题不能为空或只包含空格
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="mb-4" onClick={handleClick}>
        <h1 className="text-3xl px-3 py-2 cursor-text break-words">
          {internalValue || <span className="text-gray-400">No title</span>}
        </h1>
      </div>
    );
  }
};
