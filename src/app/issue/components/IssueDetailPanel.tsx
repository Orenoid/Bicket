'use client';

import { SecondaryButton } from '../../components/ui/buttons';
import { TitlePropertyDetail } from '@/app/property/components/detail';
import { SystemPropertyId } from '@/app/property/constants';

// 从IssuePage.tsx导入需要的接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

export interface Issue {
    issue_id: number;
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

    // 获取标题属性值
    const getTitleValue = () => {
        const titlePropertyValue = issue.property_values.find(pv => pv.property_id === SystemPropertyId.TITLE);
        return titlePropertyValue ? titlePropertyValue.value : '';
    };

    // 处理属性更新
    const handlePropertyUpdate = async (propertyId: string, newValue: unknown) => {
        // 这里可以添加API调用来更新属性值
        console.log(`更新属性 ${propertyId} 的值为:`, newValue);
        
        // 目前只是返回成功，后续可以添加实际的API调用
        return true;
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
                                onUpdate={(newValue: unknown) => handlePropertyUpdate(SystemPropertyId.TITLE, newValue)}
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
                        {/* 这里保持空白，后续实现属性展示 */}
                    </div>
                </div>
            </div>
        </div>
    );
}; 