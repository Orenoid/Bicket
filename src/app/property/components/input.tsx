'use client';

import React, { useState, useImperativeHandle, useEffect } from 'react';
import { PropertyDefinition } from '@/app/issue/components/IssuePage';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { FaBold, FaItalic, FaListUl, FaListOl, FaQuoteLeft, FaImage, FaUndo, FaRedo, FaHeading, FaCode } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { PropertyType } from '../constants';

// 属性值接口，与API接口保持一致
export interface PropertyValue {
    property_id: string;
    value: unknown;
}

// 属性输入组件接口
export interface PropertyInputProps {
    // 基础属性信息
    propertyDefinition: PropertyDefinition;  // 包含 id, name, type, config 等
}

// 矿机类型定义
export interface Miner {
    id: string;                // 矿机 ID
    model: string;             // 矿机型号
    manufacturer: string;      // 制造商
    status: string;            // 矿机状态
    ipAddress: string;         // IP 地址
}

// 文本属性输入组件
export const TextPropertyInput = React.forwardRef<
    { onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null } },
    PropertyInputProps
>((props, ref) => {
    const { propertyDefinition } = props;

    // 存储组件内部状态
    const [internalValue, setInternalValue] = useState('');
    const [showError, setShowError] = useState(false);

    // 暴露onSubmit方法
    useImperativeHandle(ref, () => ({
        onSubmit: () => {
            // 执行校验逻辑
            const isValid: boolean = Boolean(internalValue && internalValue.trim() !== '');
            console.log(isValid)

            // 更新错误状态
            setShowError(!isValid);

            // 构造PropertyValue
            return {
                isValid,
                propertyValue: isValid ? {
                    property_id: propertyDefinition.id,
                    value: internalValue
                } : null
            };
        }
    }));

    // 处理内部值变更
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        // 用户开始输入时隐藏错误提示
        if (showError) {
            setShowError(false);
        }
    };

    return (
        <div className="mb-4">
            <input
                type="text"
                value={internalValue}
                onChange={handleChange}
                placeholder="Issue title"
                className="text-3xl w-full px-3 py-2 border-0 border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400 transition-colors"
            />
            {/* 错误提示区域 */}
            {showError && (
                <div className="mt-1 text-sm text-red-500">
                    Title cannot be empty or only contain spaces
                </div>
            )}
        </div>
    );
});

TextPropertyInput.displayName = 'TextPropertyInput';

// 文本域属性输入组件
export const TextareaPropertyInput = React.forwardRef<
    { onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null } },
    PropertyInputProps
>((props, ref) => {
    const { propertyDefinition } = props;

    // 存储组件内部状态
    const [internalValue, setInternalValue] = useState('');

    // 初始化编辑器
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3] // 启用h1, h2, h3标题
                },
                bulletList: {},
                orderedList: {},
                blockquote: {},
                codeBlock: {}, // 启用代码块
                code: {}, // 启用行内代码
            }),
            Image,
        ],
        content: internalValue,
        onUpdate: ({ editor }) => {
            // 获取HTML内容
            const html = editor.getHTML();
            setInternalValue(html);
        },
        autofocus: false,
        editorProps: {
            attributes: {
                class: 'focus:outline-none w-full min-h-[150px] prose max-w-none',
            },
        },
    });

    // 暴露onSubmit方法
    useImperativeHandle(ref, () => ({
        onSubmit: () => {
            // 执行校验逻辑
            const isRequired = propertyDefinition.config?.required === true;
            const isValid: boolean = Boolean(!isRequired || (internalValue && internalValue.trim() !== ''));

            // 构造PropertyValue
            return {
                isValid,
                propertyValue: isValid ? {
                    property_id: propertyDefinition.id,
                    value: internalValue
                } : null
            };
        }
    }));

    // 工具栏按钮组件
    interface MenuButtonProps {
        onClick: () => void;
        active: boolean;
        icon: React.ComponentType<{ className?: string }>;
        title: string;
    }

    const MenuButton: React.FC<MenuButtonProps> = ({ onClick, active, icon: Icon, title }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            title={title}
            type="button"
        >
            <Icon className="h-4 w-4" />
        </button>
    );

    // 添加图片的函数
    const addImage = () => {
        const url = window.prompt('输入图片URL');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="mb-4">
            {/* 编辑器工具栏 */}
            {editor && (
                <div className="flex flex-wrap items-center gap-1 mb-0 border border-gray-200 rounded-t-lg p-2 bg-white shadow-sm">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        icon={FaBold}
                        title="加粗"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        icon={FaItalic}
                        title="斜体"
                    />
                    <div className="h-5 w-px bg-gray-200 mx-1"></div>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive('heading', { level: 1 })}
                        icon={FaHeading}
                        title="大标题"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive('heading', { level: 3 })}
                        icon={FaHeading}
                        title="小标题"
                    />
                    <div className="h-5 w-px bg-gray-200 mx-1"></div>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        icon={FaListUl}
                        title="无序列表"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        icon={FaListOl}
                        title="有序列表"
                    />
                    <div className="h-5 w-px bg-gray-200 mx-1"></div>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive('blockquote')}
                        icon={FaQuoteLeft}
                        title="引用"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive('codeBlock')}
                        icon={FaCode}
                        title="代码块"
                    />
                    <MenuButton
                        onClick={addImage}
                        active={false}
                        icon={FaImage}
                        title="插入图片"
                    />
                    <div className="h-5 w-px bg-gray-200 mx-1"></div>
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        active={false}
                        icon={FaUndo}
                        title="撤销"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        active={false}
                        icon={FaRedo}
                        title="重做"
                    />
                </div>
            )}

            {/* 自定义CSS，解决交互问题 */}
            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                    padding: 1rem !important;
                    min-height: 180px;
                    color: #374151;
                    font-size: 0.95rem;
                }
                .ProseMirror-focused {
                    outline: none !important;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: "开始输入内容...";
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror .is-empty::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                /* 增强Markdown样式 */
                .ProseMirror h1 {
                    font-size: 1.75em;
                    font-weight: 600;
                    margin-top: 0.75em;
                    margin-bottom: 0.5em;
                    color: #111827;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.3em;
                }
                .ProseMirror h2 {
                    font-size: 1.5em;
                    font-weight: 600;
                    margin-top: 0.75em;
                    margin-bottom: 0.5em;
                    color: #111827;
                }
                .ProseMirror h3 {
                    font-size: 1.25em;
                    font-weight: 600;
                    margin-top: 0.75em;
                    margin-bottom: 0.5em;
                    color: #111827;
                }
                .ProseMirror pre {
                    background-color: #f9fafb;
                    border-radius: 6px;
                    padding: 0.75em 1em;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 0.9em;
                    overflow-x: auto;
                    margin: 0.5em 0;
                    border: 1px solid #e5e7eb;
                }
                .ProseMirror code {
                    background-color: #f3f4f6;
                    border-radius: 4px;
                    padding: 0.1em 0.3em;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 0.9em;
                    color: #ef4444;
                }
                .ProseMirror blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding: 0.5em 1em;
                    margin: 0.5em 0;
                    color: #4b5563;
                    background-color: #f9fafb;
                    border-radius: 0 4px 4px 0;
                }
                .ProseMirror ul,
                .ProseMirror ol {
                    padding-left: 1.5em;
                    margin: 0.5em 0;
                }
                .ProseMirror p {
                    margin: 0.5em 0;
                    line-height: 1.6;
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 0.5em 0;
                }
            `}</style>

            {/* TipTap编辑器内容区域 */}
            <div className="border border-gray-200 border-t-0 rounded-b-lg overflow-hidden shadow-sm bg-white">
                <EditorContent
                    editor={editor}
                    className="w-full focus-within:outline-none"
                />
            </div>
        </div>
    );
});

TextareaPropertyInput.displayName = 'TextareaPropertyInput';

// 选择属性输入组件
export const SelectPropertyInput = React.forwardRef<
    { onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null } },
    PropertyInputProps
>((props, ref) => {
    const { propertyDefinition } = props;

    // 存储组件内部状态
    const [internalValue, setInternalValue] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // 从配置中获取选项
    const options = (propertyDefinition.config?.options || []) as Array<{ id: string, name: string, color: string }>;

    // 暴露onSubmit方法
    useImperativeHandle(ref, () => ({
        onSubmit: () => {
            // 执行校验逻辑
            const isRequired = propertyDefinition.config?.required === true;
            const isValid: boolean = Boolean(!isRequired || (internalValue && internalValue.trim() !== ''));

            // 构造PropertyValue
            return {
                isValid,
                propertyValue: isValid ? {
                    property_id: propertyDefinition.id,
                    value: internalValue
                } : null
            };
        }
    }));

    // 选中的选项
    const selectedOption = options.find(option => option.id === internalValue);

    // 处理选项选择
    const handleSelectOption = (optionId: string) => {
        setInternalValue(optionId);
        setDropdownOpen(false);
    };

    // 清除已选项
    const handleClearOption = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        setInternalValue('');
    };

    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // 关闭下拉框的引用
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉框
    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold">{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[240px]" ref={dropdownRef}>
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
                {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {options.map(option => (
                                <div
                                    key={option.id}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors"
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
});

SelectPropertyInput.displayName = 'SelectPropertyInput';

// 多选属性输入组件
export const MultiSelectPropertyInput = React.forwardRef<
    { onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null } },
    PropertyInputProps
>((props, ref) => {
    const { propertyDefinition } = props;

    // 存储组件内部状态 - 多选值使用数组
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // 从配置中获取选项
    const options = (propertyDefinition.config?.options || []) as Array<{ id: string, name: string, color: string }>;

    // 暴露onSubmit方法
    useImperativeHandle(ref, () => ({
        onSubmit: () => {
            // 执行校验逻辑
            const isRequired = propertyDefinition.config?.required === true;
            const isValid: boolean = Boolean(!isRequired || (selectedValues.length > 0));

            // 构造PropertyValue
            return {
                isValid,
                propertyValue: isValid ? {
                    property_id: propertyDefinition.id,
                    value: selectedValues
                } : null
            };
        }
    }));

    // 获取选中的选项
    const selectedOptions = options.filter(option => selectedValues.includes(option.id));

    // 处理选项选择
    const handleSelectOption = (optionId: string) => {
        setSelectedValues(prev => {
            // 如果已经选中，则移除
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            }
            // 否则添加
            return [...prev, optionId];
        });
        // 注意：这里不关闭下拉框，允许用户继续选择多个选项
    };

    // 清除所有已选项
    const handleClearAllOptions = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        setSelectedValues([]);
    };

    // 清除单个选项
    const handleRemoveOption = (optionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡
        setSelectedValues(prev => prev.filter(id => id !== optionId));
    };

    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // 关闭下拉框的引用
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉框并保存选择
    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
                // 这里可以触发额外的保存逻辑，如果需要的话
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold">{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[240px]" ref={dropdownRef}>
                <div
                    className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedOptions.length > 0 ? (
                        <div className="flex flex-wrap w-full justify-between">
                            <div className="flex flex-wrap items-center gap-1 max-w-full">
                                {selectedOptions.map(option => (
                                    <div 
                                        key={option.id} 
                                        className="flex items-center bg-gray-100 rounded-md px-2 py-0.5 m-0.5"
                                    >
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                            style={{ backgroundColor: option.color }}
                                        ></span>
                                        <span className="text-xs truncate">{option.name}</span>
                                        <button
                                            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                                            onClick={(e) => handleRemoveOption(option.id, e)}
                                            title="移除标签"
                                        >
                                            <MdCancel size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {isHovering && selectedOptions.length > 0 && (
                                <button
                                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer flex-shrink-0"
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
                {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {options.map(option => (
                                <div
                                    key={option.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${
                                        selectedValues.includes(option.id) ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <div className="flex items-center">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                            style={{ backgroundColor: option.color }}
                                        ></span>
                                        <span className="text-sm truncate">{option.name}</span>
                                    </div>
                                    {selectedValues.includes(option.id) && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
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
});

MultiSelectPropertyInput.displayName = 'MultiSelectPropertyInput';

// 矿机列表属性输入组件
export const MinersPropertyInput = React.forwardRef<
    { onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null } },
    PropertyInputProps
>((props, ref) => {
    const { propertyDefinition } = props;

    // 存储组件内部状态 - 多选值使用数组
    const [selectedMiners, setSelectedMiners] = useState<string[]>([]);
    const [availableMiners, setAvailableMiners] = useState<Miner[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // 模拟获取矿机列表数据
    useEffect(() => {
        // 模拟延迟加载
        const fetchMiners = () => {
            // 在实际应用中，这里会从 API 获取矿机列表
            // 这里使用了硬编码的模拟数据
            const mockMiners = [
                {
                    id: 'M001',
                    model: 'Antminer S19 Pro',
                    manufacturer: 'Bitmain',
                    status: '在线',
                    ipAddress: '192.168.1.101',
                },
                {
                    id: 'M002',
                    model: 'Whatsminer M30S++',
                    manufacturer: 'MicroBT',
                    status: '过热警告',
                    ipAddress: '192.168.1.102',
                },
                {
                    id: 'M003',
                    model: 'Antminer S19j Pro',
                    manufacturer: 'Bitmain',
                    status: '离线',
                    ipAddress: '192.168.2.101',
                },
                {
                    id: 'M004',
                    model: 'Avalon 1246',
                    manufacturer: 'Canaan',
                    status: '在线',
                    ipAddress: '192.168.2.102',
                },
                {
                    id: 'M005',
                    model: 'Antminer S19 XP',
                    manufacturer: 'Bitmain',
                    status: '在线',
                    ipAddress: '192.168.3.101',
                },
                {
                    id: 'M006',
                    model: 'Whatsminer M30S',
                    manufacturer: 'MicroBT',
                    status: '在线',
                    ipAddress: '192.168.3.102',
                }
            ];
            setAvailableMiners(mockMiners);
        };

        fetchMiners();
    }, []);

    // 暴露onSubmit方法
    useImperativeHandle(ref, () => ({
        onSubmit: () => {
            // 执行校验逻辑
            const isRequired = propertyDefinition.config?.required === true;
            const isValid: boolean = Boolean(!isRequired || (selectedMiners.length > 0));

            // 构造PropertyValue
            return {
                isValid,
                propertyValue: isValid ? {
                    property_id: propertyDefinition.id,
                    value: selectedMiners
                } : null
            };
        }
    }));

    // 获取选中的矿机
    const selectedMinersData = availableMiners.filter(miner => selectedMiners.includes(miner.id));

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

    // 处理矿机选择
    const handleSelectMiner = (minerId: string) => {
        setSelectedMiners(prev => {
            // 如果已经选中，则移除
            if (prev.includes(minerId)) {
                return prev.filter(id => id !== minerId);
            }
            // 否则添加
            return [...prev, minerId];
        });
        // 注意：这里不关闭下拉框，允许用户继续选择多个矿机
    };

    // 清除所有已选矿机
    const handleClearAllMiners = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框
        setSelectedMiners([]);
    };

    // 清除单个矿机
    const handleRemoveMiner = (minerId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡
        setSelectedMiners(prev => prev.filter(id => id !== minerId));
    };

    // 切换下拉框显示状态
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // 关闭下拉框的引用
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉框并保存选择
    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
                // 这里可以触发额外的保存逻辑，如果需要的话
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div className="flex items-center">
            <div className="w-20 text-sm text-gray-600 font-semibold">{propertyDefinition.name}</div>
            <div className="relative w-auto min-w-[120px] max-w-[240px]" ref={dropdownRef}>
                <div
                    className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {selectedMinersData.length > 0 ? (
                        <div className="flex flex-wrap w-full justify-between">
                            <div className="flex flex-wrap items-center gap-1 max-w-full">
                                {selectedMinersData.map(miner => (
                                    <div 
                                        key={miner.id} 
                                        className="flex items-center bg-gray-100 rounded-md px-2 py-0.5 m-0.5"
                                    >
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0 ${getStatusStyle(miner.status)}`}
                                        ></span>
                                        <span className="text-xs truncate">{miner.id}</span>
                                        <button
                                            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                                            onClick={(e) => handleRemoveMiner(miner.id, e)}
                                            title="移除矿机"
                                        >
                                            <MdCancel size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {isHovering && selectedMinersData.length > 0 && (
                                <button
                                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer flex-shrink-0"
                                    onClick={handleClearAllMiners}
                                    title="清除所有选择"
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
                {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                            {availableMiners.map(miner => (
                                <div
                                    key={miner.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${
                                        selectedMiners.includes(miner.id) ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleSelectMiner(miner.id)}
                                >
                                    <div className="flex items-center">
                                        <span
                                            className={`inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getStatusStyle(miner.status)}`}
                                        ></span>
                                        <span className="text-sm truncate">{miner.id}</span>
                                    </div>
                                    {selectedMiners.includes(miner.id) && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            ))}

                            {/* 无选项时的提示 */}
                            {availableMiners.length === 0 && (
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
});

MinersPropertyInput.displayName = 'MinersPropertyInput';

// 属性输入组件映射表
export const PROPERTY_INPUT_COMPONENTS: Record<
    string,
    React.ForwardRefExoticComponent<
        PropertyInputProps & React.RefAttributes<{
            onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null }
        }>
    >
> = {
    [PropertyType.TEXT]: TextPropertyInput,
    [PropertyType.RICH_TEXT]: TextareaPropertyInput,
    [PropertyType.SELECT]: SelectPropertyInput,
    [PropertyType.MULTI_SELECT]: MultiSelectPropertyInput,
    [PropertyType.MINERS]: MinersPropertyInput,
    // 可以扩展更多属性类型...
}; 