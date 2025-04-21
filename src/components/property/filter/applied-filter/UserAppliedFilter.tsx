'use client';

import { getUser } from '@/lib/user/service';
import { useState, useEffect } from 'react';
import { AppliedFilterComponent } from '../../type';


/**
 * 用户类型的已应用筛选组件
 */
export const UserAppliedFilter: AppliedFilterComponent = ({ filter }) => {
    // 状态变量，存储已加载的用户数据
    const [users, setUsers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    // 根据操作符显示不同的格式
    const displayState = () => {
        const userIds = filter.value as string[];

        if (userIds.length === 0) {
            return <span>无选中用户</span>;
        }

        if (isLoading) {
            return <div className='flex items-center whitespace-nowrap'>Loading...</div>;
        }

        // 构建显示内容
        if (userIds.length === 1) {
            // 单个用户
            return <div className='flex items-center whitespace-nowrap'>{users[userIds[0]] || '未知用户'}</div>;
        } else if (userIds.length <= 2) {
            // 显示所有用户名称（最多2个）
            return (
                <div className="flex items-center gap-x-2 whitespace-nowrap">
                    {userIds.map(id => (
                        <div key={id}>
                            {users[id] || '未知用户'}
                        </div>
                    ))}
                </div>
            );
        } else {
            // 超过2个用户，显示前2个和数量提示
            return (
                <div className="flex items-center gap-x-2 whitespace-nowrap">
                    {userIds.slice(0, 2).map(id => (
                        <div key={id}>
                            {users[id] || '未知用户'}
                        </div>
                    ))}
                    <span className="text-xs text-gray-500">
                        +{userIds.length - 2}
                    </span>
                </div>
            );
        }
    };

    // 加载用户数据
    useEffect(() => {
        const userIds = filter.value as string[];
        if (userIds.length === 0) {
            setIsLoading(false);
            return;
        }

        async function loadUsers() {
            setIsLoading(true);
            try {
                // 创建一个用户ID到用户名的映射
                const userMap: Record<string, string> = {};

                // 并行加载所有用户数据
                await Promise.all(
                    userIds.map(async (userId) => {
                        try {
                            const userData = await getUser(userId);
                            userMap[userId] = userData.username;
                        } catch (error) {
                            console.error(`获取用户信息失败: ${userId}`, error);
                            userMap[userId] = '未知用户';
                        }
                    })
                );

                setUsers(userMap);
            } catch (error) {
                console.error('加载用户信息失败', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadUsers();
    }, [filter.value]);

    // 处理不同的操作符
    switch (filter.operator) {
        case 'in':
            return displayState();
        default:
            // 不支持的操作符，显示原始值
            return <div className='flex items-center whitespace-nowrap'>{String(filter.value)}</div>;
    }
};
