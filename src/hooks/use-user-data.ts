import { PropertyType } from '@/lib/property/constants';
import { Issue, PropertyDefinition } from '@/lib/property/types';
import { getUserList, User } from '@/lib/user/service';
import { useEffect, useMemo, useState } from 'react';

/**
 * 用户数据上下文 Hook
 * 
 * 该 Hook 批量加载 issues 中用户类型属性值对应的用户数据，并提供用户数据上下文对象
 * 
 * @param issues 议题列表
 * @param propertyDefinitions 属性定义列表
 * @returns 用户数据上下文对象，包含用户数据和加载状态
 */
export function useUserData(issues: Issue[], propertyDefinitions: PropertyDefinition[]) {
    const [userData, setUserData] = useState<Record<string, User>>({});
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // 创建用户数据上下文值
    const userDataContextValue = useMemo(() => ({
        userData,
        isLoading: isLoadingUsers
    }), [userData, isLoadingUsers]);

    // 收集所有用户类型的属性值并批量加载用户信息
    useEffect(() => {
        async function loadUsersData() {
            try {
                // 找出所有用户类型的属性定义
                const userPropertyIds = propertyDefinitions
                    .filter(prop => prop.type === PropertyType.USER)
                    .map(prop => prop.id);

                if (userPropertyIds.length === 0) {
                    setIsLoadingUsers(false);
                    return;
                }

                // 从所有issue中收集用户ID
                const userIds = new Set<string>();
                issues.forEach(issue => {
                    issue.property_values.forEach(propValue => {
                        if (
                            userPropertyIds.includes(propValue.property_id) &&
                            propValue.value !== null &&
                            propValue.value !== undefined &&
                            propValue.value !== ""
                        ) {
                            userIds.add(String(propValue.value));
                        }
                    });
                });

                if (userIds.size === 0) {
                    setIsLoadingUsers(false);
                    return;
                }

                const userIdsArray = Array.from(userIds);
                const usersResponse = await getUserList({
                    userId: userIdsArray
                });
                const userDataMap: Record<string, User> = {};
                usersResponse.data.forEach(user => {
                    userDataMap[user.id] = user;
                });

                setUserData(userDataMap);
            } catch (error) {
                console.error('批量加载用户数据失败:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        }
        loadUsersData();
    }, [issues, propertyDefinitions]);

    return userDataContextValue;
} 