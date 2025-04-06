'use client';

import { SecondaryButton } from '../../components/ui/buttons';
import { SelectPropertyDetail, TitlePropertyDetail, MultiSelectPropertyDetail } from '@/app/property/components/detail';
import { SystemPropertyId } from '@/app/property/constants';

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
export const IssueDetailPanel = ({ onClose, issue, propertyDefinitions }: {
    onClose: () => void;
    issue: Issue;
    propertyDefinitions: PropertyDefinition[];
}) => {
    // 获取标题属性
    const titleProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.TITLE);
    // 获取状态属性
    const statusProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.STATUS);
    // 获取优先级属性
    const priorityProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.PRIORITY);
    // 获取类别属性
    const categoryProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.CATEGORY);
    // 获取诊断属性
    const diagnosisProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.DIAGNOSIS);
    // 获取标签属性
    const labelProperty = propertyDefinitions.find(p => p.id === SystemPropertyId.LABEL);

    // 获取标题属性值
    const getTitleValue = () => {
        const titlePropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.TITLE);
        return titlePropertyValue ? titlePropertyValue.value : '';
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

    // 获取标签属性值
    const getLabelValue = () => {
        const labelPropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.LABEL);
        return labelPropertyValue ? labelPropertyValue.value : null;
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
                console.log('更新成功:', data);
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

    return (
        <div
            className="fixed top-0 right-0 h-full bg-white z-50 border-l border-gray-200"
            style={{
                boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
                width: 'calc(100vw * 2/3)'
            }}
        >
            <div className='flex flex-row h-full'>
                {/* 左侧面板内容 */}
                <div className="flex flex-col h-full w-2/3 border-r border-gray-200">
                    <div className="pt-16 flex-grow overflow-auto p-4">
                        {/* 添加标题组件 */}
                        {titleProperty && (
                            <TitlePropertyDetail
                                propertyDefinition={titleProperty}
                                value={getTitleValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
                        {/* 后续可以添加更多详情组件 */}
                    </div>
                    {/* 面板底部：按钮操作区 */}
                    <div className="p-4 flex justify-start">
                        <SecondaryButton onClick={onClose} className="mr-4">
                            <span className="text-gray-400 text-sm">关闭</span>
                        </SecondaryButton>
                    </div>
                </div>
                {/* 右侧：属性列表 */}
                <div className="flex flex-col w-1/3 h-full pl-5 pt-5">
                    <span className='text-md text-gray-500 whitespace-nowrap font-sans mb-10'>属性</span>
                    <div className='flex flex-col gap-2 pl-3'>
                        {/* 标签属性组件 */}
                        {labelProperty && (
                            <MultiSelectPropertyDetail
                                propertyDefinition={labelProperty}
                                value={getLabelValue()}
                                onUpdate={handlePropertyUpdate}
                            />
                        )}
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
                    </div>
                </div>
            </div>
        </div>
    );
}; 