'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PropertyDefinition } from '@/app/issue/components/IssuePage';
import { createSetOperation, createRemoveOperation, createUpdateOperation } from '../update-operations';
import { MdCancel } from 'react-icons/md';
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    BoldItalicUnderlineToggles,
    linkPlugin,
    linkDialogPlugin,
    CreateLink,
    CodeToggle,
    ListsToggle,
    BlockTypeSelect,
    imagePlugin,
    InsertImage
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { PrimaryButton, SecondaryButton, ButtonGroup } from '@/app/components/ui/buttons';

// 属性值接口，与API接口保持一致
export interface PropertyValue {
    property_id: string;
    value: unknown;
}

// 详情组件的统一接口
export interface PropertyDetailProps {
    // 基础属性信息
    propertyDefinition: PropertyDefinition;  // 包含 id, name, type, config 等
    value: unknown;  // 属性值
    onUpdate?: (operation: {
        property_id: string;
        operation_type: string;
        operation_payload: Record<string, unknown>;
    }) => Promise<boolean>; // 更新值的回调，返回是否更新成功
}

// BUG: 改了一次标题后，如果再点击标题并什么都不改，依然会出现调用更新回调的情况
// 标题详情组件
export const TitlePropertyDetail: React.FC<PropertyDetailProps> = ({
    propertyDefinition: _propertyDefinition,  // 重命名但保留参数，以避免未使用警告
    value,
    onUpdate
}) => {
    // 存储组件内部状态
    const [internalValue, setInternalValue] = useState<string>('');
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
            setInternalValue('');
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

    // 处理内部值变更
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        // 用户开始输入时隐藏错误提示
        if (showError) {
            setShowError(false);
        }
    };

    // 处理按键事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            // 恢复原值
            if (value !== undefined && value !== null) {
                setInternalValue(String(value));
            }
        }
    };

    // 处理保存
    const handleSave = async () => {
        // 检查值是否有效
        if (!internalValue.trim()) {
            setShowError(true);
            return;
        }

        // 如果值没有变化，直接关闭编辑状态，不触发更新回调
        const originalValue = value !== undefined && value !== null ? String(value) : '';
        if (internalValue === originalValue) {
            setIsEditing(false);
            return;
        }

        if (onUpdate) {
            // 使用createSetOperation创建更新操作
            const operation = createSetOperation(_propertyDefinition.id, internalValue);
            
            // 调用回调函数更新值
            const success = await onUpdate(operation);
            if (success) {
                setIsEditing(false);
                // 成功后不要更新内部值，因为父组件应该会通过props传递新值进来
                // 这将使internalValue与原始value保持一致
            }
        } else {
            // 无回调时，直接关闭编辑状态
            setIsEditing(false);
        }
    };

    // 处理单击事件，进入编辑模式
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditing) {
            // 计算点击位置相对于文本开始的偏移量
            // 这是一个近似计算，因为文本和输入框可能有样式差异
            const textElement = e.currentTarget.querySelector('h1');
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
                    internalValue.length
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
                    {internalValue || <span className="text-gray-400">无标题</span>}
                </h1>
            </div>
        );
    }
};

/**
 * 单选属性详情组件
 */
export const SelectPropertyDetail: React.FC<PropertyDetailProps> = ({
    propertyDefinition,
    value,
    onUpdate
}) => {
    // 状态
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    
    // 下拉框引用，用于检测点击外部关闭
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // 从配置中获取选项
    const options = (propertyDefinition.config?.options || []) as Array<{ id: string; name: string; color: string }>;
    
    // 当属性值变化时更新内部状态
    useEffect(() => {
        setSelectedValue(value !== undefined && value !== null ? String(value) : null);
    }, [value]);
    
    // 当前选中的选项
    const selectedOption = options.find(option => option.id === selectedValue);
    
    // 处理选择选项
    const handleSelectOption = async (optionId: string) => {
        if (onUpdate) {
            // 使用createSetOperation创建更新操作
            const operation = createSetOperation(propertyDefinition.id, optionId);
            
            // 调用回调函数更新值
            const success = await onUpdate(operation);
            if (success) {
                setSelectedValue(optionId);
            }
        } else {
            setSelectedValue(optionId);
        }
        
        setIsDropdownOpen(false);
    };
    
    // 处理清除选择
    const handleClearOption = async (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        
        if (onUpdate) {
            // 使用createRemoveOperation创建删除操作
            const operation = createRemoveOperation(propertyDefinition.id);
            
            // 调用回调函数更新值
            const success = await onUpdate(operation);
            if (success) {
                setSelectedValue(null);
            }
        } else {
            setSelectedValue(null);
        }
    };
    
    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    // 点击外部关闭下拉框
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    
    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[240px] pl-3" ref={dropdownRef}>
                <div
                    className="flex items-center w-full h-8 px-3 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedOption ? (
                        <div className="flex items-center w-full justify-between">
                            <div className="flex items-center truncate">
                                <span
                                    className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                    style={{ backgroundColor: selectedOption.color }}
                                ></span>
                                <span className="text-sm truncate">{selectedOption.name}</span>
                            </div>
                            {isHovering && (
                                <button
                                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer"
                                    onClick={handleClearOption}
                                    title="清除选择"
                                >
                                    <MdCancel size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">未选择</span>
                    )}
                </div>
                
                {/* 下拉选项列表 */}
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {options.map(option => (
                                <div
                                    key={option.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${option.id === selectedValue ? 'bg-gray-50' : ''}`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <span
                                        className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                        style={{ backgroundColor: option.color }}
                                    ></span>
                                    <span className="text-sm truncate">{option.name}</span>
                                </div>
                            ))}
                            
                            {/* 无选项时的提示 */}
                            {options.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    无可选选项
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 多选属性详情组件
 */
export const MultiSelectPropertyDetail: React.FC<PropertyDetailProps> = ({
    propertyDefinition,
    value,
    onUpdate
}) => {
    // 状态
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    
    // 下拉框引用，用于检测点击外部关闭
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // 从配置中获取选项
    const options = (propertyDefinition.config?.options || []) as Array<{ id: string; name: string; color: string }>;
    
    // 当属性值变化时更新内部状态
    useEffect(() => {
        if (value === null || value === undefined) {
            setSelectedValues([]);
        } else if (Array.isArray(value)) {
            setSelectedValues(value.map(v => String(v)));
        } else {
            // 单个值情况，转为数组
            setSelectedValues([String(value)]);
        }
    }, [value]);
    
    // 获取已选中的选项
    const selectedOptions = options.filter(option => selectedValues.includes(option.id));
    
    // 处理选择选项
    const handleSelectOption = async (optionId: string) => {
        // 检查是否已选中
        const isAlreadySelected = selectedValues.includes(optionId);
        
        if (isAlreadySelected) {
            // 若已选中，则从选中列表中移除
            const newValues = selectedValues.filter(id => id !== optionId);
            
            if (onUpdate) {
                if (newValues.length === 0) {
                    // 如果没有选中项，则使用REMOVE操作
                    const operation = createRemoveOperation(propertyDefinition.id);
                    const success = await onUpdate(operation);
                    if (success) {
                        setSelectedValues([]);
                    }
                } else {
                    // 否则更新选中项列表
                    const operation = createUpdateOperation(propertyDefinition.id, newValues);
                    const success = await onUpdate(operation);
                    if (success) {
                        setSelectedValues(newValues);
                    }
                }
            } else {
                setSelectedValues(newValues);
            }
        } else {
            // 若未选中，则添加到选中列表
            const newValues = [...selectedValues, optionId];
            
            if (onUpdate) {
                // 使用UPDATE操作更新整个列表
                const operation = createUpdateOperation(propertyDefinition.id, newValues);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedValues(newValues);
                }
            } else {
                setSelectedValues(newValues);
            }
        }
    };
    
    // 处理清除所有选项
    const handleClearAllOptions = async (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        
        if (onUpdate) {
            // 使用REMOVE操作
            const operation = createRemoveOperation(propertyDefinition.id);
            const success = await onUpdate(operation);
            if (success) {
                setSelectedValues([]);
            }
        } else {
            setSelectedValues([]);
        }
    };
    
    // 处理删除单个选项
    const handleRemoveOption = async (optionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        
        // 从选中列表中移除
        const newValues = selectedValues.filter(id => id !== optionId);
        
        if (onUpdate) {
            if (newValues.length === 0) {
                // 如果没有选中项，则使用REMOVE操作
                const operation = createRemoveOperation(propertyDefinition.id);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedValues([]);
                }
            } else {
                // 否则更新选中项列表
                const operation = createUpdateOperation(propertyDefinition.id, newValues);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedValues(newValues);
                }
            }
        } else {
            setSelectedValues(newValues);
        }
    };
    
    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    // 点击外部关闭下拉框
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    
    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[240px] pl-3" ref={dropdownRef}>
                {/* 触发下拉框的按钮/显示区域 */}
                <div
                    className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedOptions.length > 0 ? (
                        <div className="flex flex-wrap items-center w-full gap-1">
                            {/* 显示选中的标签 */}
                            <div className="flex flex-wrap items-center gap-1 max-w-full">
                                {selectedOptions.map(option => (
                                    <div 
                                        key={option.id}
                                        className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 max-w-[120px] group"
                                    >
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                            style={{ backgroundColor: option.color }}
                                        ></span>
                                        <span className="text-xs truncate">{option.name}</span>
                                        <button
                                            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                            onClick={(e) => handleRemoveOption(option.id, e)}
                                            title="移除此选项"
                                        >
                                            <MdCancel size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* 清除所有按钮 */}
                            {isHovering && selectedOptions.length > 0 && (
                                <button
                                    className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer shrink-0"
                                    onClick={handleClearAllOptions}
                                    title="清除所有选择"
                                >
                                    <MdCancel size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">未选择</span>
                    )}
                </div>
                
                {/* 下拉选项列表 */}
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {options.map(option => (
                                <div
                                    key={option.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${selectedValues.includes(option.id) ? 'bg-gray-50' : ''}`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.id)}
                                        readOnly
                                        className="mr-2"
                                    />
                                    <span
                                        className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                        style={{ backgroundColor: option.color }}
                                    ></span>
                                    <span className="text-sm truncate">{option.name}</span>
                                </div>
                            ))}
                            
                            {/* 无选项时的提示 */}
                            {options.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    无可选选项
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 矿机列表属性详情组件
 * 
 * 用于显示和编辑与工单关联的矿机列表，支持多选模式
 */
export const MinersPropertyDetail: React.FC<PropertyDetailProps> = ({
    propertyDefinition,
    value,
    onUpdate
}) => {
    // 状态管理
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [selectedMiners, setSelectedMiners] = useState<string[]>([]);
    
    // 下拉框引用，用于检测点击外部关闭
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // 模拟矿机列表数据 - 实际应用中应该从API获取
    const miners = [
        { id: 'M001', model: 'Antminer S19 Pro', status: '在线', ipAddress: '192.168.1.101' },
        { id: 'M002', model: 'Whatsminer M30S++', status: '过热警告', ipAddress: '192.168.1.102' },
        { id: 'M003', model: 'Antminer S19j Pro', status: '离线', ipAddress: '192.168.2.101' },
        { id: 'M004', model: 'Avalon 1246', status: '在线', ipAddress: '192.168.2.102' },
        { id: 'M005', model: 'Antminer S19 XP', status: '在线', ipAddress: '192.168.3.101' },
        { id: 'M006', model: 'Whatsminer M30S', status: '在线', ipAddress: '192.168.3.102' }
    ];
    
    // 当属性值变化时更新内部状态
    useEffect(() => {
        if (value === null || value === undefined) {
            setSelectedMiners([]);
        } else if (Array.isArray(value)) {
            setSelectedMiners(value.map(v => String(v)));
        } else {
            // 单个值情况，转为数组
            setSelectedMiners([String(value)]);
        }
    }, [value]);
    
    // 获取已选中的矿机信息
    const selectedMinersInfo = miners.filter(miner => selectedMiners.includes(miner.id));
    
    // 获取状态对应的样式
    const getStatusStyle = (status: string) => {
        switch (status) {
            case '在线':
                return 'bg-green-100 text-green-800';
            case '离线':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    // 处理选择矿机
    const handleSelectMiner = async (minerId: string) => {
        // 检查是否已选中
        const isAlreadySelected = selectedMiners.includes(minerId);
        
        if (isAlreadySelected) {
            // 若已选中，则从选中列表中移除
            const newValues = selectedMiners.filter(id => id !== minerId);
            
            if (onUpdate) {
                if (newValues.length === 0) {
                    // 如果没有选中项，则使用REMOVE操作
                    const operation = createRemoveOperation(propertyDefinition.id);
                    const success = await onUpdate(operation);
                    if (success) {
                        setSelectedMiners([]);
                    }
                } else {
                    // 否则更新选中项列表
                    const operation = createUpdateOperation(propertyDefinition.id, newValues);
                    const success = await onUpdate(operation);
                    if (success) {
                        setSelectedMiners(newValues);
                    }
                }
            } else {
                setSelectedMiners(newValues);
            }
        } else {
            // 若未选中，则添加到选中列表
            const newValues = [...selectedMiners, minerId];
            
            if (onUpdate) {
                // 使用UPDATE操作更新整个列表
                const operation = createUpdateOperation(propertyDefinition.id, newValues);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedMiners(newValues);
                }
            } else {
                setSelectedMiners(newValues);
            }
        }
    };
    
    // 处理清除所有矿机
    const handleClearAllMiners = async (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        
        if (onUpdate) {
            // 使用REMOVE操作
            const operation = createRemoveOperation(propertyDefinition.id);
            const success = await onUpdate(operation);
            if (success) {
                setSelectedMiners([]);
            }
        } else {
            setSelectedMiners([]);
        }
    };
    
    // 处理删除单个矿机
    const handleRemoveMiner = async (minerId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        
        // 从选中列表中移除
        const newValues = selectedMiners.filter(id => id !== minerId);
        
        if (onUpdate) {
            if (newValues.length === 0) {
                // 如果没有选中项，则使用REMOVE操作
                const operation = createRemoveOperation(propertyDefinition.id);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedMiners([]);
                }
            } else {
                // 否则更新选中项列表
                const operation = createUpdateOperation(propertyDefinition.id, newValues);
                const success = await onUpdate(operation);
                if (success) {
                    setSelectedMiners(newValues);
                }
            }
        } else {
            setSelectedMiners(newValues);
        }
    };
    
    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    // 点击外部关闭下拉框
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    
    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[320px] pl-3" ref={dropdownRef}>
                {/* 触发下拉框的按钮/显示区域 */}
                <div
                    className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedMinersInfo.length > 0 ? (
                        <div className="flex flex-wrap items-center w-full gap-1">
                            {/* 显示选中的矿机标签 */}
                            <div className="flex flex-wrap items-center gap-1 max-w-full">
                                {selectedMinersInfo.map(miner => (
                                    <div 
                                        key={miner.id}
                                        className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 max-w-[140px] group"
                                        title={`${miner.model} - ${miner.status} - ${miner.ipAddress}`}
                                    >
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0 ${getStatusStyle(miner.status)}`}
                                        ></span>
                                        <span className="text-xs truncate">{miner.id}</span>
                                        <button
                                            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                            onClick={(e) => handleRemoveMiner(miner.id, e)}
                                            title="移除此矿机"
                                        >
                                            <MdCancel size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* 清除所有按钮 */}
                            {isHovering && selectedMinersInfo.length > 0 && (
                                <button
                                    className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer shrink-0"
                                    onClick={handleClearAllMiners}
                                    title="清除所有矿机"
                                >
                                    <MdCancel size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">未选择矿机</span>
                    )}
                </div>
                
                {/* 下拉选项列表 */}
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[320px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {miners.map(miner => (
                                <div
                                    key={miner.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${selectedMiners.includes(miner.id) ? 'bg-gray-50' : ''}`}
                                    onClick={() => handleSelectMiner(miner.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMiners.includes(miner.id)}
                                        readOnly
                                        className="mr-2"
                                    />
                                    <div>
                                        <div className="flex items-center">
                                            <span
                                                className={`inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getStatusStyle(miner.status)}`}
                                            ></span>
                                            <span className="text-sm font-medium">{miner.id}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 ml-5">
                                            {miner.model} - {miner.ipAddress}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* 无矿机时的提示 */}
                            {miners.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    无可选矿机
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 日期时间类型详情组件
 * 当前仅展示日期时间，不支持用户编辑
 */
export const DatetimePropertyDetail: React.FC<PropertyDetailProps> = ({
    propertyDefinition,
    value
}) => {
    // TODO: 后续需要实现日期时间编辑功能，当前版本仅支持显示

    // 处理空值显示
    if (value === null || value === undefined || value === "") {
        return (
            <div className="flex items-center">
                <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
                <div className="pl-3">
                    <span className="text-gray-400 italic">未设置</span>
                </div>
            </div>
        );
    }
    
    try {
        // 尝试解析日期时间字符串
        const dateString = String(value);
        const date = new Date(dateString);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return (
                <div className="flex items-center">
                    <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
                    <div className="pl-3">
                        <span className="text-gray-400 italic">无效日期</span>
                    </div>
                </div>
            );
        }
        
        // 获取配置
        const config = propertyDefinition.config || {};
        const showTime = config.showTime !== false; // 默认显示时间
        const showSeconds = config.showSeconds !== false; // 默认显示秒
        const showTimezone = config.showTimezone === true; // 默认不显示时区
        
        // 格式化日期部分 (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFormatted = `${year}-${month}-${day}`;
        
        // 格式化时间部分
        let timeFormatted = '';
        if (showTime) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            timeFormatted = `${hours}:${minutes}`;
            
            // 添加秒部分（如果需要）
            if (showSeconds) {
                const seconds = String(date.getSeconds()).padStart(2, '0');
                timeFormatted += `:${seconds}`;
            }
            
            // 添加时区部分（如果需要）
            if (showTimezone) {
                const timezoneOffset = date.getTimezoneOffset();
                const timezoneHours = Math.abs(Math.floor(timezoneOffset / 60));
                const timezoneMinutes = Math.abs(timezoneOffset % 60);
                const timezoneSign = timezoneOffset <= 0 ? '+' : '-'; // 注意：getTimezoneOffset 返回的是与 UTC 的差值的负数
                const timezoneFormatted = `${timezoneSign}${String(timezoneHours).padStart(2, '0')}:${String(timezoneMinutes).padStart(2, '0')}`;
                timeFormatted += ` (UTC${timezoneFormatted})`;
            }
        }
        
        // 返回完整的格式化日期时间，整体使用浅灰色
        return (
            <div className="flex items-center">
                <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
                <div className="pl-3 flex-grow">
                    <div className="whitespace-nowrap text-gray-500">
                        <span>{dateFormatted}</span>
                        {showTime && (
                            <span className="ml-1">{timeFormatted}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('日期格式化错误', error);
        return (
            <div className="flex items-center">
                <div className="w-20 text-sm text-gray-600 font-semibold truncate" title={propertyDefinition.name}>{propertyDefinition.name}</div>
                <div className="pl-3">
                    <span className="text-gray-400 italic">日期格式错误</span>
                </div>
            </div>
        );
    }
};

/**
 * 富文本描述属性详情组件
 * 用于显示和编辑Issue的描述内容，支持Markdown格式
 */
export const RichTextPropertyDetail: React.FC<PropertyDetailProps> = ({
propertyDefinition,
value,
    onUpdate
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
        if (onUpdate) {
            // 使用createSetOperation创建更新操作
            const operation = createSetOperation(propertyDefinition.id, internalValue);
            
            // 调用回调函数更新值
            const success = await onUpdate(operation);
            if (success) {
                setHasChanges(false);
                setOriginalValue(internalValue);
            }
        } else {
            // 无回调时，直接重置状态
            setHasChanges(false);
        }
    };
    
    // 渲染编辑模式
    return (
        <div className="border-t border-gray-200 pt-4 mt-4 pb-4">
            <MDXEditor
                onChange={handleChange}
                markdown={internalValue}
                placeholder={<span className="text-gray-400 text-md">Issue描述，支持markdown格式</span>}
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
                ]}
            />
            
            {/* 操作按钮 - 只有在有变化时才显示 */}
            {hasChanges && (
                <ButtonGroup className="mt-2">
                    <SecondaryButton onClick={handleCancel} className="mr-2">
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave}>
                        Save
                    </PrimaryButton>
                </ButtonGroup>
            )}
        </div>
    );
};

