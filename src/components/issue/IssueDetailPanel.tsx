'use client';

import { SecondaryButton } from '@/components/ui/buttons';
import {
    SelectPropertyDetail,
    TitlePropertyDetail,
    MinersPropertyDetail,
    DatetimePropertyDetail,
    RichTextPropertyDetail,
    UserPropertyDetail
} from '@/components/property/detail';
import { SystemPropertyId } from '@/lib/property/constants';
import { MdMoreHoriz } from 'react-icons/md';
import { useState } from 'react';
import { DropdownMenu } from '@/components/ui/dropdownMenu';
import { MenuItem } from '@/components/ui/dropdownMenu';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirmDialog';

// 从IssuePage.tsx导入需要的接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

export interface Issue {
    issue_id: string;
    property_values: {
        property_id: string;
        value: unknown;
    }[];
}

/**
 * Issue详情面板组件
 */
export const IssueDetailPanel = ({ onClose, issue, propertyDefinitions, onUpdateSuccess }: {
    onClose: () => void;
    issue: Issue;
    propertyDefinitions: PropertyDefinition[];
    onUpdateSuccess?: () => void;
}) => {
    // 添加下拉菜单状态
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 添加删除加载状态
    const [isDeleting, setIsDeleting] = useState(false);
    // 添加确认对话框状态
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    // 添加路由器
    const router = useRouter();

    // 获取标题属性
    const titleProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.TITLE);
    // 获取描述属性
    const descriptionProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.DESCRIPTION);
    // 获取状态属性
    const statusProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.STATUS);
    // 获取优先级属性
    const priorityProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.PRIORITY);
    // 获取类别属性
    const categoryProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.CATEGORY);
    // 获取诊断属性
    const diagnosisProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.DIAGNOSIS);
    // 获取矿机列表属性
    const minersProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.MINERS);
    // 获取创建时间属性
    const createdAtProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.CREATED_AT);
    // 获取更新时间属性
    const updatedAtProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.UPDATED_AT);
    // 获取经办人属性
    const assigneeProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.ASIGNEE);
    // 获取报告人属性
    const reporterProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.REPORTER);

    // 获取标题属性值
    const getTitleValue = () => {
        const titlePropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.TITLE);
        return titlePropertyValue ? titlePropertyValue.value : '';
    };

    // 获取描述属性值
    const getDescriptionValue = () => {
        const descriptionPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.DESCRIPTION);
        return descriptionPropertyValue ? descriptionPropertyValue.value : '';
    };

    // 获取状态属性值
    const getStatusValue = () => {
        const statusPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.STATUS);
        return statusPropertyValue ? statusPropertyValue.value : null;
    };

    // 获取优先级属性值
    const getPriorityValue = () => {
        const priorityPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.PRIORITY);
        return priorityPropertyValue ? priorityPropertyValue.value : null;
    };

    // 获取类别属性值
    const getCategoryValue = () => {
        const categoryPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.CATEGORY);
        return categoryPropertyValue ? categoryPropertyValue.value : null;
    };

    // 获取诊断属性值
    const getDiagnosisValue = () => {
        const diagnosisPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.DIAGNOSIS);
        return diagnosisPropertyValue ? diagnosisPropertyValue.value : null;
    };

    // 获取矿机列表属性值
    const getMinersValue = () => {
        const minersPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.MINERS);
        return minersPropertyValue ? minersPropertyValue.value : null;
    };

    // 获取创建时间属性值
    const getCreatedAtValue = () => {
        const createdAtPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.CREATED_AT);
        return createdAtPropertyValue ? createdAtPropertyValue.value : null;
    };

    // 获取更新时间属性值
    const getUpdatedAtValue = () => {
        const updatedAtPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.UPDATED_AT);
        return updatedAtPropertyValue ? updatedAtPropertyValue.value : null;
    };

    // 获取经办人属性值
    const getAssigneeValue = () => {
        const assigneePropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.ASIGNEE);
        return assigneePropertyValue ? assigneePropertyValue.value : null;
    };

    // 获取报告人属性值
    const getReporterValue = () => {
        const reporterPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.REPORTER);
        return reporterPropertyValue ? reporterPropertyValue.value : null;
    };

    // 处理属性更新
    const handlePropertyUpdate = async (operation: {
        property_id: string;
        operation_type: string;
        operation_payload: Record<string, unknown>;
    }) => {
        try {
            // 调用API更新属性值
            const response = await fetch('/api/issue/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    issue_id: issue.issue_id,
                    operations: [operation]
                }),
            });

            const data = await response.json();

            if (data.success) {
                // 如果更新成功并且提供了更新成功回调，则调用它
                // 这允许父组件(IssuePage)刷新issue列表数据，同时保持详情面板打开
                // 在IssuePage中，我们实现了在刷新后通过ID找回并更新选中的issue
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
                return true;
            } else {
                console.error('更新失败:', data.message || '未知错误');
                return false;
            }
        } catch (error) {
            console.error('更新属性时发生错误:', error);
            return false;
        }
    };

    // 处理更多选项按钮点击
    const handleMoreOptions = () => {
        setIsMenuOpen(true);
    };
    // 处理菜单项点击
    const handleMenuItemClick = (item: MenuItem) => {
        if (item.id === 'delete') {
            // 显示确认对话框
            setIsConfirmDialogOpen(true);
        }
    };
    // 菜单项定义
    const menuItems: MenuItem[] = [
        {
            id: 'delete',
            label: 'Delete',
            icon: <RiDeleteBinLine className="text-red-500" />
        }
    ];

    // 计算下拉菜单位置
    const getMenuPosition = () => {
        return { top: '100%', right: 0 };
    };

    // 处理删除 Issue
    const handleDeleteIssue = async () => {
        try {
            setIsDeleting(true);
            // 调用删除 API
            const response = await fetch(`/api/issues/${issue.issue_id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // 删除成功，关闭面板并刷新页面
                onClose();
                router.refresh();
            } else {
                // 处理错误
                const data = await response.json();
                console.error('删除失败:', data.error || '未知错误');
                alert(`删除失败: ${data.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('删除 Issue 时发生错误:', error);
            alert('删除 Issue 时发生错误');
        } finally {
            setIsDeleting(false);
            setIsConfirmDialogOpen(false);
        }
    };

    // 处理取消删除
    const handleCancelDelete = () => {
        setIsConfirmDialogOpen(false);
    };

    return (
        <div
            className="fixed top-0 right-0 h-screen bg-white z-50 border-l border-gray-200"
            style={{
                boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
                width: 'calc(100vw * 2/3)'
            }}
        >
            {/* 确认删除对话框 */}
            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                title="Confirm Delete"
                content={`Are you sure you want to delete Issue "${getTitleValue()}"? This action cannot be undone.`}
                onConfirm={handleDeleteIssue}
                onCancel={handleCancelDelete}
                confirmButtonColor="danger"
                isLoading={isDeleting}
            />
            
            <div className='flex flex-row h-full'>
                {/* 左侧面板内容 */}
                <div className="flex flex-col h-full w-3/4 border-r border-gray-200">
                    {/* Issue ID 显示区域 */}
                    {/* <div className="absolute top-4 left-4 flex items-center cursor-pointer" onClick={handleCopyId}>
                        <span className="text-2xl text-gray-400 hover:text-gray-500"># {getIdValue()}</span>
                    </div> */}
                    <div className="flex flex-col pt-8 p-4 flex-grow">
                        {/* 标题组件 */}
                        {titleProperty && (
                            <TitlePropertyDetail
                                propertyDefinition={titleProperty}
                                value={getTitleValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}

                        {/* 添加描述组件 */}
                        {descriptionProperty && (
                            <RichTextPropertyDetail
                                propertyDefinition={descriptionProperty}
                                value={getDescriptionValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 后续可以添加更多详情组件 */}
                    </div>
                    {/* 面板底部：按钮操作区 */}
                    <div className="p-4 flex justify-start">
                        <SecondaryButton onClick={onClose} className="mr-4">
                            <span className="text-gray-400 text-sm">Close</span>
                        </SecondaryButton>
                    </div>
                </div>
                {/* 右侧：属性列表 */}
                <div className="flex flex-col w-1/4 h-full pl-5 pt-5 overflow-y-auto">
                    {/* Properties 区域 - 修改为 Flex 容器 */}
                    <div className='flex justify-between items-center mb-4 pr-4'>
                        <span className='text-sm text-gray-400 whitespace-nowrap font-sans'>Properties</span>
                        <button
                            onClick={handleMoreOptions}
                            className="text-gray-600 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 cursor-pointer relative"
                        >
                            <MdMoreHoriz size={18} />
                            {/* 添加下拉菜单 */}
                            <DropdownMenu
                                items={menuItems}
                                isOpen={isMenuOpen}
                                onItemClick={handleMenuItemClick}
                                onClose={() => setIsMenuOpen(false)}
                                position={getMenuPosition()}
                                className="z-50"
                            />
                        </button>

                    </div>
                    <div className='flex flex-col gap-3 pl-3 mb-8'>
                        {/* 状态属性组件 */}
                        {statusProperty && (
                            <SelectPropertyDetail
                                propertyDefinition={statusProperty}
                                value={getStatusValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 优先级属性组件 */}
                        {priorityProperty && (
                            <SelectPropertyDetail
                                propertyDefinition={priorityProperty}
                                value={getPriorityValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 类别属性组件 */}
                        {categoryProperty && (
                            <SelectPropertyDetail
                                propertyDefinition={categoryProperty}
                                value={getCategoryValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 诊断属性组件 */}
                        {diagnosisProperty && (
                            <SelectPropertyDetail
                                propertyDefinition={diagnosisProperty}
                                value={getDiagnosisValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 经办人属性组件 */}
                        {assigneeProperty && (
                            <UserPropertyDetail
                                propertyDefinition={assigneeProperty}
                                value={getAssigneeValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 报告人属性组件 */}
                        {reporterProperty && (
                            <UserPropertyDetail
                                propertyDefinition={reporterProperty}
                                value={getReporterValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                    </div>

                    {/* 矿机相关属性区域 */}
                    <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Miners Related</span>
                    <div className='flex flex-col gap-3 pl-3 mb-8'>
                        {/* 矿机列表属性组件 */}
                        {minersProperty && (
                            <MinersPropertyDetail
                                propertyDefinition={minersProperty}
                                value={getMinersValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                    </div>

                    {/* Basic Info 区域 - 移到最底部 */}
                    <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Basic Info</span>
                    <div className='flex flex-col gap-3 pl-3 mb-8'>
                        {/* 创建时间属性组件 */}
                        {createdAtProperty && (
                            <DatetimePropertyDetail
                                propertyDefinition={createdAtProperty}
                                value={getCreatedAtValue()}
                            />
                        )}
                        {/* 更新时间属性组件 */}
                        {updatedAtProperty && (
                            <DatetimePropertyDetail
                                propertyDefinition={updatedAtProperty}
                                value={getUpdatedAtValue()}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 