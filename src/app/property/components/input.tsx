'use client';

import React, { useState, useImperativeHandle } from 'react';
import { PropertyDefinition } from '@/app/issue/components/IssuePage';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { FaBold, FaItalic, FaListUl, FaListOl, FaQuoteLeft, FaImage, FaUndo, FaRedo, FaHeading, FaCode } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

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
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">{propertyDefinition.name}</span>
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

// // 属性输入组件映射表
// export const PROPERTY_INPUT_COMPONENTS: Record<
//     string,
//     React.ForwardRefExoticComponent<
//         PropertyInputProps & React.RefAttributes<{
//             onSubmit: () => { isValid: boolean; propertyValue: PropertyValue | null }
//         }>
//     >
// > = {
//     [PropertyType.TEXT]: TextPropertyInput,
//     [PropertyType.TEXTAREA]: TextareaPropertyInput,
//     [PropertyType.SELECT]: SelectPropertyInput,
//     // 可以扩展更多属性类型...
// }; 