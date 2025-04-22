'use client';

import { PropertyDefinition } from "@/components/issue/CreateIssueModal";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/shadcn/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/shadcn/ui/select";
import { cn } from "@/lib/shadcn/utils";
import { useOrganization } from "@clerk/clerk-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Control, FieldValues, Path } from 'react-hook-form';
import { getPropertyTypeIcon } from "./common";


interface UserData {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    hasImage: boolean;
    identifier: string;
    userId: string | null;
}

export const UserField = <TFieldValues extends FieldValues>({
    control,
    propertyDefinition,
    className
}: {
    control: Control<TFieldValues>;
    propertyDefinition: PropertyDefinition;
    className?: string;
}) => {
    // 用户数据状态
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserData[]>([]);

    // 获取组织成员列表
    const { memberships, isLoaded } = useOrganization({
        memberships: {
            infinite: true, // 使用无限滚动模式
            keepPreviousData: true, // 保持之前的数据直到新数据加载完成
        },
    });

    // 处理Clerk返回的数据，转换为内部使用的UserData
    useEffect(() => {
        if (!isLoaded || !memberships?.data) {
            setIsLoading(true);
            return;
        }

        const userData = memberships.data.map(membership => {
            const publicUserData = membership.publicUserData;
            return {
                firstName: publicUserData.firstName,
                lastName: publicUserData.lastName,
                imageUrl: publicUserData.imageUrl,
                hasImage: publicUserData.hasImage,
                identifier: publicUserData.identifier,
                userId: publicUserData.userId || membership.id // 使用用户ID或成员ID作为唯一标识
            } as UserData;
        });

        setUsers(userData);
        setIsLoading(false);
    }, [isLoaded, memberships?.data]);

    const getUserById = (id: string) => {
        return users.find(user => user.userId === id);
    };

    const formatUserName = (user: UserData) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
            return user.firstName;
        } else if (user.lastName) {
            return user.lastName;
        } else {
            return user.identifier;
        }
    };

    return (
        <FormField
            control={control}
            name={propertyDefinition.id as Path<TFieldValues>}
            render={({ field }) => (
                <FormItem className={cn("flex items-center gap-4", className)}>
                    <FormLabel className="text-sm text-gray-600 min-w-[100px] m-0 flex items-center">
                        <div className="w-5 flex-shrink-0 flex justify-center text-gray-500">
                            {getPropertyTypeIcon(propertyDefinition.type)}
                        </div>
                        {propertyDefinition.name}
                    </FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                    >
                        <FormControl>
                            <SelectTrigger className="w-full border-none shadow-none focus:ring-0 focus-visible:ring-0 p-0">
                                <SelectValue placeholder={`Select ${propertyDefinition.name}`}>
                                    {field.value && getUserById(field.value) && (
                                        <div className="flex items-center">
                                            <Image
                                                src={getUserById(field.value)?.imageUrl || ''}
                                                alt={formatUserName(getUserById(field.value)!)}
                                                width={24}
                                                height={24}
                                                unoptimized
                                                className="w-6 h-6 rounded-full mr-2 flex-shrink-0 object-cover border border-gray-200"
                                            />
                                            <span>{formatUserName(getUserById(field.value)!)}</span>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent align="end">
                            {isLoading ? (
                                <div className="py-2 px-2 text-sm text-center text-gray-500">
                                    Loading users...
                                </div>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <SelectItem key={user.userId} value={user.userId || ''}>
                                        <div className="flex items-center">
                                            <Image
                                                src={user.imageUrl}
                                                alt={formatUserName(user)}
                                                width={24}
                                                height={24}
                                                unoptimized
                                                className="w-6 h-6 rounded-full mr-2 flex-shrink-0 object-cover border border-gray-200"
                                            />
                                            <div>
                                                <span>{formatUserName(user)}</span>
                                                <span className="text-xs text-gray-500 ml-1">
                                                    {user.identifier}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="py-2 px-2 text-sm text-center text-gray-500">
                                    No users available
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
};

export default UserField;
