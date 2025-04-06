'use client';

import { useRef } from 'react';
import { PrimaryButton, SecondaryButton, ButtonGroup } from '../../components/ui/buttons';
import { PropertyValue as InputPropertyValue, SelectPropertyInput, TextareaPropertyInput, TextPropertyInput } from '@/app/property/components/input';
import { SystemPropertyId } from '@/app/property/constants';

// 从IssuePage.tsx导入需要的接口
export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

/**
 * 新建issue面板组件
 */
export const CreateIssuePanel = ({ onClose, propertyDefinitions, onCreateSuccess }: {
    onClose: () => void;
    propertyDefinitions: PropertyDefinition[];
    onCreateSuccess?: () => void;
}) => {
    // 存储属性组件引用，用于调用onSubmit方法
    const propertyInputRefs = useRef<Record<string, {
        onSubmit: () => { isValid: boolean; propertyValue: InputPropertyValue | null }
    }>>({});
    // 注册属性组件引用
    const registerPropertyRef = (propertyId: string, ref: {
        onSubmit: () => { isValid: boolean; propertyValue: InputPropertyValue | null }
    } | null) => {
        if (ref) {
            propertyInputRefs.current[propertyId] = ref;
        }
    };

    // 处理提交
    const handleSubmit = async () => {
        // 收集所有属性的校验结果和构造的PropertyValue
        const submitResults = Object.values(propertyInputRefs.current).map(ref => {
            return ref.onSubmit();
        });

        // 检查是否所有属性都有效
        const allValid = submitResults.every(result => result.isValid);
        if (!allValid) {
            // 如果有无效的属性，阻止提交
            return;
        }

        // 收集有效的PropertyValue对象
        const validPropertyValues = submitResults
            .filter(result => result.isValid && result.propertyValue)
            .map(result => result.propertyValue) as InputPropertyValue[];

        try {
            // 调用API创建issue
            const response = await fetch('/api/issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyValues: validPropertyValues
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 创建成功，关闭面板
                onClose();
                
                // 调用刷新回调（如果提供）
                if (onCreateSuccess) {
                    onCreateSuccess();
                }
            } else {
                // 处理API返回的错误
                console.error('创建失败:', result.message);
            }
        } catch (error) {
            // 处理网络错误
            console.error('创建issue失败:', error);
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
                        <div className="flex">
                            {/* 左侧：标题和描述 */}
                            <div className="flex-grow pr-4 flex-col">
                                {/* TODO tech dept 可能找不到这个属性 */}
                                <TextPropertyInput
                                    propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.TITLE) as PropertyDefinition}
                                    ref={(ref) => registerPropertyRef(SystemPropertyId.TITLE, ref)}
                                />
                                <TextareaPropertyInput
                                    propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.DESCRIPTION) as PropertyDefinition}
                                    ref={(ref) => registerPropertyRef(SystemPropertyId.DESCRIPTION, ref)}
                                />
                            </div>
                        </div>
                    </div>
                    {/* 面板底部：按钮操作区 */}
                    <div className="p-4 flex justify-start">
                        <ButtonGroup>
                            <PrimaryButton className='mr-2' onClick={handleSubmit}>
                                <span className="text-white text-sm">Submit</span>
                            </PrimaryButton>
                            <SecondaryButton onClick={onClose} className="mr-4">
                                <span className="text-gray-400 text-sm">Cancel</span>
                            </SecondaryButton>
                        </ButtonGroup>
                    </div>
                </div>
                {/* 右侧：其他属性列表 */}
                <div className="flex flex-col w-1/3 h-full pl-5 pt-5">
                    <span className='text-md text-gray-500 whitespace-nowrap font-sans mb-10'>Properties</span>
                    <div className='flex flex-col gap-2 pl-3'>
                        <SelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.STATUS) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.STATUS, ref)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}; 