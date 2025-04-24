'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
    Form
} from "@/components/shadcn/ui/form";
import { TransparentOverlay } from '@/components/ui/overlay';
import { SystemPropertyId } from '@/lib/property/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { Fragment, startTransition, useActionState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DescriptionField from '../property/create-issue-field/DescriptionField';
import MinersField from '../property/create-issue-field/MinersField';
import { SelectField } from '../property/create-issue-field/SelectField';
import TitleField from '../property/create-issue-field/TitleField';
import UserField from '../property/create-issue-field/UserField';
import { createIssueAction } from './actions';
import { createIssueFormSchema } from './schema';

export interface PropertyDefinition {
    id: string;
    name: string;
    type: string;
    config?: Record<string, unknown>;
}

export const CreateIssueModal = ({ onClose, propertyDefinitions }: {
    onClose: () => void;
    propertyDefinitions: PropertyDefinition[];
    onCreateSuccess?: () => void;
}) => {

    const formRef = useRef<HTMLFormElement>(null);
    const form = useForm<z.infer<typeof createIssueFormSchema>>({
        resolver: zodResolver(createIssueFormSchema),
    })

    const [{}, formAction, pending] = useActionState(createIssueAction, { success: false, message: '' });


    function mustFindPropertyDefinition(id: string) {
        const propertyDefinition = propertyDefinitions.find(p => p.id === id);
        if (!propertyDefinition) { // 有些系统属性在业务上是保证一定存在的，若找不到，属于脏数据问题，非正常流程
            throw new Error(`Property definition with id ${id} not found`);
        }
        return propertyDefinition;
    }

    return (
        <Fragment>
            <div className="fixed top-0 right-0 h-full bg-white z-50 border-l border-gray-200 shadow-[-4px_0_15px_rgba(0,0,0,0.1)] w-[calc(100vw*2/3)]">
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit((data) => { startTransition(() => formAction(data)); })}
                        className='h-full w-full'
                    >
                        <div className='flex flex-row h-full'>
                            {/* 左侧面板内容 */}
                            <div className="flex flex-col h-full w-2/3 border-r border-gray-200">
                                <div className="flex pt-6 flex-grow overflow-auto p-4">
                                    <div className="flex flex-grow">
                                        {/* 标题和描述 */}
                                        <div className="flex flex-grow pr-4 flex-col">
                                            <TitleField control={form.control} className='mb-8'/>
                                            <DescriptionField
                                                control={form.control}
                                                propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.DESCRIPTION)}
                                                setValue={form.setValue}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* 底部按钮操作区 */}
                                <div className="p-4 flex justify-start">
                                    <Button type="submit" disabled={pending} className={clsx('mr-2')}>
                                        {pending && <Loader2 className="animate-spin" />}
                                        <span className="text-white text-sm">Submit</span>
                                    </Button>
                                    <Button variant="ghost" onClick={onClose} disabled={pending}>
                                        <span className="text-gray-400 text-sm">Cancel</span>
                                    </Button>
                                </div>
                            </div>
                            {/* 右侧：其他属性列表 */}
                            <div className="flex flex-col w-1/3 h-full pl-5 pt-5 pr-8">
                                <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Properties</span>
                                <div className='flex flex-col gap-3 pl-3 mb-8'>
                                    {/* 这里的布局是手动规划的，只是碰巧几个属性类型都一样，不适合用 map 合并处理 */}
                                    <SelectField
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.STATUS)}
                                        control={form.control}
                                    />
                                    <SelectField
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.PRIORITY)}
                                        control={form.control}
                                    />
                                    <SelectField
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.CATEGORY)}
                                        control={form.control}
                                    />
                                    <SelectField
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.DIAGNOSIS)}
                                        control={form.control}
                                    />
                                    <UserField
                                        control={form.control}
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.ASIGNEE)}
                                    />
                                    <UserField
                                        control={form.control}
                                        propertyDefinition={mustFindPropertyDefinition(SystemPropertyId.REPORTER)}
                                    />
                                </div>

                                {/* 矿机相关属性区域 */}
                                <span className='text-sm text-gray-400 whitespace-nowrap font-sans mb-2'>Miners Related</span>
                                <div className='flex flex-col gap-3 pl-3'>
                                    <MinersField
                                        control={form.control}
                                        propertyDefinition={propertyDefinitions.find(p => p.id === SystemPropertyId.MINERS) as PropertyDefinition}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
            <TransparentOverlay onClick={onClose} />
        </Fragment>

    );
}; 