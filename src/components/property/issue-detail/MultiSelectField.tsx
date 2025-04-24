// 'use client';

// import { createRemoveOperation, createUpdateOperation } from '@/lib/property/update-operations';
// import React, { useState, useRef, useEffect } from 'react';
// import { MdCancel } from 'react-icons/md';
// import { getPropertyTypeIcon } from '../common';
// import { DetailFieldComponent } from '../type';
// import clsx from 'clsx';


// export const MultiSelectField: DetailFieldComponent = ({
//     propertyDefinition, value, onUpdate
// }) => {
//     // 状态
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isHovering, setIsHovering] = useState(false);
//     const [selectedValues, setSelectedValues] = useState<string[]>([]);

//     // 下拉框引用，用于检测点击外部关闭
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     // 从配置中获取选项
//     const options = (propertyDefinition.config?.options || []) as Array<{ id: string; name: string; color: string; }>;

//     // 当属性值变化时更新内部状态
//     useEffect(() => {
//         let newValues: string[] = [];
//         if (value === null || value === undefined) {
//             newValues = [];
//         } else if (Array.isArray(value)) {
//             newValues = value.map(v => String(v));
//         } else {
//             // 单个值情况，转为数组
//             newValues = [String(value)];
//         }

//         // 比较数组内容，避免不必要的更新
//         if (JSON.stringify(newValues) !== JSON.stringify(selectedValues)) {
//             setSelectedValues(newValues);
//         }
//     }, [value, selectedValues]);

//     // 获取已选中的选项
//     const selectedOptions = options.filter(option => selectedValues.includes(option.id));

//     // 处理选择选项
//     const handleSelectOption = async (optionId: string) => {
//         // 检查是否已选中
//         const isAlreadySelected = selectedValues.includes(optionId);

//         if (isAlreadySelected) {
//             // 若已选中，则从选中列表中移除
//             const newValues = selectedValues.filter(id => id !== optionId);

//             if (onUpdate) {
//                 if (newValues.length === 0) {
//                     // 如果没有选中项，则使用REMOVE操作
//                     const operation = createRemoveOperation(propertyDefinition.id);
//                     const success = await onUpdate(operation);
//                     if (success) {
//                         setSelectedValues([]);
//                     }
//                 } else {
//                     // 否则更新选中项列表
//                     const operation = createUpdateOperation(propertyDefinition.id, newValues);
//                     const success = await onUpdate(operation);
//                     if (success) {
//                         setSelectedValues(newValues);
//                     }
//                 }
//             } else {
//                 setSelectedValues(newValues);
//             }
//         } else {
//             // 若未选中，则添加到选中列表
//             const newValues = [...selectedValues, optionId];

//             if (onUpdate) {
//                 // 使用UPDATE操作更新整个列表
//                 const operation = createUpdateOperation(propertyDefinition.id, newValues);
//                 const success = await onUpdate(operation);
//                 if (success) {
//                     setSelectedValues(newValues);
//                 }
//             } else {
//                 setSelectedValues(newValues);
//             }
//         }
//     };

//     // 处理清除所有选项
//     const handleClearAllOptions = async (e: React.MouseEvent) => {
//         e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框

//         if (onUpdate) {
//             // 使用REMOVE操作
//             const operation = createRemoveOperation(propertyDefinition.id);
//             const success = await onUpdate(operation);
//             if (success) {
//                 setSelectedValues([]);
//             }
//         } else {
//             setSelectedValues([]);
//         }
//     };

//     // 处理删除单个选项
//     const handleRemoveOption = async (optionId: string, e: React.MouseEvent) => {
//         e.stopPropagation(); // 阻止事件冒泡，防止触发下拉框


//         // 从选中列表中移除
//         const newValues = selectedValues.filter(id => id !== optionId);

//         if (onUpdate) {
//             if (newValues.length === 0) {
//                 // 如果没有选中项，则使用REMOVE操作
//                 const operation = createRemoveOperation(propertyDefinition.id);
//                 const success = await onUpdate(operation);
//                 if (success) {
//                     setSelectedValues([]);
//                 }
//             } else {
//                 // 否则更新选中项列表
//                 const operation = createUpdateOperation(propertyDefinition.id, newValues);
//                 const success = await onUpdate(operation);
//                 if (success) {
//                     setSelectedValues(newValues);
//                 }
//             }
//         } else {
//             setSelectedValues(newValues);
//         }
//     };

//     // 切换下拉框显示状态
//     const toggleDropdown = () => {
//         setIsDropdownOpen(!isDropdownOpen);
//     };

//     // 点击外部关闭下拉框
//     useEffect(() => {
//         const handleOutsideClick = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsDropdownOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleOutsideClick);
//         return () => {
//             document.removeEventListener('mousedown', handleOutsideClick);
//         };
//     }, []);

//     return (
//         <div className="flex items-center">
//             <div className="w-20 text-sm text-gray-600 font-semibold flex items-center">
//                 <div className="w-5 flex-shrink-0 flex justify-center">
//                     {getPropertyTypeIcon(propertyDefinition.type)}
//                 </div>
//                 <span className="truncate" title={propertyDefinition.name}>{propertyDefinition.name}</span>
//             </div>
//             <div className="relative w-auto min-w-[120px] max-w-[240px] pl-3" ref={dropdownRef}>
//                 {/* 触发下拉框的按钮/显示区域 */}
//                 <div
//                     className="flex items-center w-full min-h-[32px] px-3 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
//                     onClick={toggleDropdown}
//                     onMouseEnter={() => setIsHovering(true)}
//                     onMouseLeave={() => setIsHovering(false)}
//                 >
//                     {selectedOptions.length > 0 ? (
//                         <div className="flex flex-wrap items-center w-full gap-1">
//                             {/* 显示选中的标签 */}
//                             <div className="flex flex-wrap items-center gap-1 max-w-full">
//                                 {selectedOptions.map(option => (
//                                     <div
//                                         key={option.id}
//                                         className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 max-w-[120px] group"
//                                     >
//                                         <span
//                                             className="inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0"
//                                             style={{ backgroundColor: option.color }}
//                                         ></span>
//                                         <span className="text-xs truncate">{option.name}</span>
//                                         <button
//                                             className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
//                                             onClick={(e) => handleRemoveOption(option.id, e)}
//                                             title="移除此选项"
//                                         >
//                                             <MdCancel size={14} />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* 清除所有按钮 */}
//                             {isHovering && selectedOptions.length > 0 && (
//                                 <button
//                                     className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 -mr-1 cursor-pointer shrink-0"
//                                     onClick={handleClearAllOptions}
//                                     title="Clear all selection"
//                                 >
//                                     <MdCancel size={16} />
//                                 </button>
//                             )}
//                         </div>
//                     ) : (
//                         <span className="text-gray-400 text-sm">No selection</span>
//                     )}
//                 </div>

//                 {/* 下拉选项列表 */}
//                 {isDropdownOpen && (
//                     <div className="absolute z-10 mt-1 w-auto min-w-full max-w-[240px] bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
//                         <div className="py-1">
//                             {options.map(option => (
//                                 <div
//                                     key={option.id}
//                                     className={clsx("px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors", {
//                                         'bg-gray-50': selectedValues.includes(option.id)
//                                     })}
//                                     onClick={() => handleSelectOption(option.id)}
//                                 >
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedValues.includes(option.id)}
//                                         readOnly
//                                         className="mr-2" />
//                                     <span
//                                         className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
//                                         style={{ backgroundColor: option.color }}
//                                     ></span>
//                                     <span className="text-sm truncate">{option.name}</span>
//                                 </div>
//                             ))}

//                             {/* 无选项时的提示 */}
//                             {options.length === 0 && (
//                                 <div className="px-4 py-2 text-gray-500 text-sm">
//                                     无可选选项
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
