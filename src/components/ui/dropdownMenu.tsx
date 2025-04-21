import React, { useState, useRef, useEffect } from 'react';
import { TransparentOverlay } from './overlay';

export function DropDownMenuV2({ entryLabel, entryClassName, menuItems, menuClassName }: {
    entryLabel: React.ReactNode;
    menuItems: { label: React.ReactNode; onClick: () => void }[];
    entryClassName?: string;
    menuClassName?: string;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');

    useEffect(() => {
        if (showMenu && triggerRef.current && menuRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // 检查菜单是否超出屏幕底部
            if (triggerRect.bottom + menuRect.height > viewportHeight) {
                // 将菜单显示在触发元素上方
                setMenuPosition('top');
            } else {
                // 将菜单显示在触发元素下方
                setMenuPosition('bottom');
            }
        }
    }, [showMenu]);

    return (
        <div>
            <div className="relative">
                <div
                    ref={triggerRef}
                    className={`flex flex-row items-center hover:bg-gray-100 cursor-pointer rounded-md p-2 pl-3 ${entryClassName}`}
                    onClick={() => setShowMenu(!showMenu)}>
                    <div className="mr-2">{entryLabel}</div>
                </div>
                {/* 下拉菜单 */}
                {showMenu &&
                    <div
                        ref={menuRef}
                        className={`absolute z-50 bg-white border rounded-xl p-2 overflow-y-auto custom-scrollbar max-h-[300px] w-max ${menuClassName} ${menuPosition === 'bottom' ? 'top-full' : 'bottom-full'}`}>
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                className="p-2 cursor-pointer hover:bg-gray-100 rounded-md whitespace-nowrap"
                                onClick={() => {
                                    item.onClick();
                                    setShowMenu(false);
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                }
            </div>
            {showMenu && <TransparentOverlay onClick={() => setShowMenu(false)} />}
        </div>
    );
}

/**
 * 菜单项接口
 */
export interface MenuItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
}

/**
 * 纯下拉菜单组件Props接口
 */
export interface DropdownMenuProps {
    // 菜单项列表
    items: MenuItem[];
    // 是否显示菜单
    isOpen: boolean;
    // 点击菜单项回调
    onItemClick: (item: MenuItem) => void;
    // 点击外部区域回调
    onClose: () => void;
    // 菜单容器样式类名
    className?: string;
    // 菜单项样式类名
    itemClassName?: string;
    // 空列表提示文本
    emptyMessage?: string;
    // 菜单位置
    position?: {
        top?: number | string;
        left?: number | string;
        right?: number | string;
        bottom?: number | string;
    };
    // 菜单宽度
    width?: string;
    // 最大高度
    maxHeight?: string;
}

/**
 * 纯下拉菜单组件
 * 只包含菜单部分，不包含触发器
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    items,
    isOpen,
    onItemClick,
    onClose,
    className = '',
    itemClassName = '',
    emptyMessage = 'Empty',
    position = {},
    width = 'w-auto min-w-[160px] max-w-[240px]',
    maxHeight = 'max-h-60'
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // 处理菜单项点击
    const handleItemClick = (item: MenuItem) => {
        onItemClick(item);
        onClose();
    };

    // 点击外部关闭菜单
    useEffect(() => {
        if (!isOpen) return;
        
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // 构建位置样式
    const positionStyle: React.CSSProperties = {};
    if (position.top !== undefined) positionStyle.top = position.top;
    if (position.left !== undefined) positionStyle.left = position.left;
    if (position.right !== undefined) positionStyle.right = position.right;
    if (position.bottom !== undefined) positionStyle.bottom = position.bottom;

    return (
        <>
            <div 
                ref={menuRef}
                className={`absolute z-10 bg-white rounded-md shadow-lg overflow-y-auto ${width} ${maxHeight} ${className}`}
                style={positionStyle}
            >
                <div className="py-1">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${itemClassName}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.icon && (
                                    <span className="mr-2 flex-shrink-0">
                                        {item.icon}
                                    </span>
                                )}
                                <span className="text-sm truncate">{item.label}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            </div>
            <TransparentOverlay onClick={onClose} />
        </>
    );
};
