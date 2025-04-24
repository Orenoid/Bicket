'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/ui/select';
import { LoadingContainerOverlay } from '@/components/ui/overlay';
import { usePropertyUpdate } from '@/hooks/use-property-update';
import clsx from 'clsx';
import { useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { getPropertyTypeIcon } from '../common';
import { DetailFieldComponent } from '../type';

export const SelectField: DetailFieldComponent = ({
    propertyDefinition, value, issueID
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | undefined>(typeof value === 'string' ? value : undefined);

    const { setPropertyValue, removePropertyValue, isLoading } = usePropertyUpdate(issueID);

    const options = (propertyDefinition.config?.options || []) as Array<{ id: string; name: string; color: string; }>;

    const handleUpdateOption = async (optionID: string) => {
        const success = await setPropertyValue(propertyDefinition.id, optionID);
        if (success) {
            setSelectedValue(optionID);
        }
    };

    const handleClearOption = async () => {
        const success = await removePropertyValue(propertyDefinition.id);
        if (success) {
            setSelectedValue(undefined);
        }
    };

    return (
        <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600 font-semibold flex items-center">
                <div className="w-5 flex-shrink-0 flex justify-center">
                    {getPropertyTypeIcon(propertyDefinition.type)}
                </div>
                <span className="truncate" title={propertyDefinition.name}>{propertyDefinition.name}</span>
            </div>
            <div className="relative w-auto min-w-[120px] max-w-[240px] pl-3">
                <div className="relative w-full" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                    {/* 如果不使用 '' 的话，会无法清空选项 https://github.com/shadcn-ui/ui/discussions/638 */}
                    <Select value={selectedValue || ''} onValueChange={handleUpdateOption}>
                        <div className='flex flex-row items-center'>
                            <SelectTrigger className="w-full border-none shadow-none focus:ring-0 focus-visible:ring-0 p-0 [&_svg]:hidden">
                                <SelectValue placeholder="No selection" />
                            </SelectTrigger>
                            {(
                                <div className={clsx(
                                    "text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer",
                                    {
                                        "opacity-100": isHovering && selectedValue !== undefined,
                                        "opacity-0": !isHovering || selectedValue === undefined
                                    }
                                )}
                                    onClick={handleClearOption}
                                >
                                    <MdCancel size={16} />
                                </div>
                            )}
                        </div>
                        <SelectContent>
                            {options.map(option => (
                                <SelectItem key={option.id} value={option.id}>
                                    <span
                                        className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                        style={{ backgroundColor: option.color }}
                                    ></span>
                                    <span className="truncate">{option.name}</span>
                                </SelectItem>
                            ))}
                            {options.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    No options
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {isLoading && <LoadingContainerOverlay />}
                </div>
            </div>
        </div>
    );
};
