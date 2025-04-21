'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MdCancel } from 'react-icons/md';

// 分页下拉列表的通用接口定义
export interface PaginatedDropdownProps<T> {
  // 是否打开下拉框
  isOpen: boolean;
  // 打开下拉框的回调
  onOpen: () => void;
  // 关闭下拉框的回调
  onClose: () => void;
  // 当前选中的项
  selectedItem: T | null;
  // 选择项的回调
  onSelect: (item: T) => void;
  // 清除选择的回调
  onClear: () => void;
  // 项的唯一键获取函数
  getItemKey: (item: T) => string;
  // 项的展示内容渲染函数
  renderItem: (item: T) => React.ReactNode;
  // 选中项的显示内容渲染函数
  renderSelectedItem: (item: T) => React.ReactNode;
  // 是否有更多数据可加载
  hasMore: boolean;
  // 加载更多数据的回调
  onLoadMore: () => void;
  // 当前数据列表
  items: T[];
  // 是否正在加载
  isLoading?: boolean;
  // 未选择时的占位符文本
  placeholder?: string;
  // 数据为空时的显示内容
  emptyMessage?: string;
  // 自定义样式类
  className?: string;
}

/**
 * 支持分页的通用下拉列表组件
 */
export function PaginatedDropdown<T>({
  isOpen,
  onOpen,
  onClose,
  selectedItem,
  onSelect,
  onClear,
  getItemKey,
  renderItem,
  renderSelectedItem,
  hasMore,
  onLoadMore,
  items,
  isLoading = false,
  placeholder = "未选择",
  emptyMessage = "无可选项",
  className = "",
}: PaginatedDropdownProps<T>) {
  // 鼠标悬浮状态
  const [isHovering, setIsHovering] = useState(false);
  // 下拉列表容器引用
  const dropdownRef = useRef<HTMLDivElement>(null);
  // 列表内容区域引用，用于检测滚动到底部
  const listContentRef = useRef<HTMLDivElement>(null);

  // 处理项选择
  const handleSelectItem = (item: T) => {
    onSelect(item);
    onClose();
  };

  // 切换下拉框的显示状态
  const toggleDropdown = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  // 处理滚动加载更多
  const handleScroll = () => {
    if (!listContentRef.current || isLoading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listContentRef.current;
    // 当滚动到距离底部20px或更近时，触发加载更多
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      onLoadMore();
    }
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className={`relative w-auto min-w-[120px] max-w-[240px] ${className}`} ref={dropdownRef}>
      {/* 选择器触发区域 */}
      <div
        className="flex items-center w-full h-8 px-3 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleDropdown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {selectedItem ? (
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center truncate">
              {renderSelectedItem(selectedItem)}
            </div>
            {isHovering && (
              <button
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                title="清除选择"
              >
                <MdCancel size={16} />
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
      </div>

      {/* 下拉列表 */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg">
          <div 
            ref={listContentRef}
            className="py-1 max-h-60 overflow-y-auto"
            onScroll={handleScroll}
          >
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={getItemKey(item)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectItem(item)}
                >
                  {renderItem(item)}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {emptyMessage}
              </div>
            )}
            
            {/* 加载中提示 */}
            {isLoading && (
              <div className="px-4 py-2 text-gray-500 text-sm text-center">
                加载中...
              </div>
            )}
            
            {/* 加载更多按钮 - 作为备选加载方式 */}
            {!isLoading && hasMore && items.length > 0 && (
              <div 
                className="px-4 py-2 text-blue-600 text-sm text-center cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadMore();
                }}
              >
                加载更多
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 