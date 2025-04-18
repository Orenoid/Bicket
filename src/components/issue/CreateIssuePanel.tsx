'use client';

import { useRef, useState } from 'react';
import { SecondaryButton, ButtonGroup, LoadingButton } from '@/components/ui/buttons';
import { PropertyValue as InputPropertyValue, SelectPropertyInput, TextareaPropertyInput, TextPropertyInput, MinersPropertyInput, UserPropertyInput } from '@/components/property/input';
import { SystemPropertyId } from '@/lib/property/constants';

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
    // 添加 loading 状态
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
        // 设置提交状态为 loading
        setIsSubmitting(true);
        
        // 收集所有属性的校验结果和构造的PropertyValue
        const submitResults = Object.values(propertyInputRefs.current).map(ref => {
            return ref.onSubmit();
        });

        // 检查是否所有属性都有效
        const allValid = submitResults.every(result => result.isValid);
        if (!allValid) {
            // 如果有无效的属性，阻止提交
            setIsSubmitting(false);
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
        } finally {
            // 无论成功或失败，都重置提交状态
            setIsSubmitting(false);
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
                    <div className="pt-6 flex-grow overflow-auto p-4">
                        <div className="flex">
                            {/* 左侧：标题和描述 */}
                            <div className="flex-grow pr-4 flex-col">
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
                            <LoadingButton 
                                className='mr-2' 
                                onClick={handleSubmit} 
                                isLoading={isSubmitting}
                            >
                                <span className="text-white text-sm">Submit</span>
                            </LoadingButton>
                            <SecondaryButton 
                                onClick={onClose} 
                                className="mr-4" 
                                disabled={isSubmitting}
                            >
                                <span className="text-gray-400 text-sm">Cancel</span>
                            </SecondaryButton>
                        </ButtonGroup>
                    </div>
                </div>
                {/* 右侧：其他属性列表 */}
                <div className="flex flex-col w-1/3 h-full pl-5 pt-5">
                    <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Properties</span>
                    <div className='flex flex-col gap-3 pl-3 mb-8'>
                        <SelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.STATUS) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.STATUS, ref)}
                        />
                        <SelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.PRIORITY) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.PRIORITY, ref)}
                        />
                        <SelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.CATEGORY) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.CATEGORY, ref)}
                        />
                        <SelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.DIAGNOSIS) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.DIAGNOSIS, ref)}
                        />
                        {/* <MultiSelectPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.LABEL) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.LABEL, ref)}
                        /> */}
                        <UserPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.ASIGNEE) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.ASIGNEE, ref)}
                        />
                        <UserPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.REPORTER) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.REPORTER, ref)}
                        />
                    </div>
                    
                    {/* 矿机相关属性区域 */}
                    <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Miners Related</span>
                    <div className='flex flex-col gap-3 pl-3'>
                        <MinersPropertyInput
                            propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.MINERS) as PropertyDefinition}
                            ref={(ref) => registerPropertyRef(SystemPropertyId.MINERS, ref)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}; 