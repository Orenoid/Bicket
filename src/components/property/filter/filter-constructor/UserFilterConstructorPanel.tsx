'use client';

import { getUser } from '@/lib/user/service';
import { useOrganization } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { FilterConstructorComponent } from '../../type';

/**
 * 筛选用户类型接口
 * 需要包含userId字段以便识别用户
 */
export interface FilterUser {
    userId: string;
    username: string;
    imageUrl: string;
    hasImage: boolean;
}

/**
 * 用户类型的筛选构造器面板组件
 * 
 * 用于选择用户进行筛选
 */
export const UserFilterConstructorPanel: FilterConstructorComponent = ({
    propertyDefinition,
    currentFilter,
    onApply,
    onCancel,
}) => {
    // 获取组织成员列表
    const { memberships, isLoaded } = useOrganization({
        memberships: {
            infinite: true,
            keepPreviousData: true,
        },
    });

    // 初始化选中的用户ID列表
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
        currentFilter?.operator === 'in' && Array.isArray(currentFilter.value)
            ? currentFilter.value
            : []
    );

    // 存储用户数据 - 这样我们就不必每次都进行转换
    const [users, setUsers] = useState<FilterUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    // 搜索过滤
    const [searchQuery, setSearchQuery] = useState('');

    // 处理成员数据转换为用户数据
    useEffect(() => {
        if (!isLoaded || !memberships?.data) return;

        const userData = memberships.data.map(membership => {
            const publicUserData = membership.publicUserData;
            return {
                userId: publicUserData.userId || membership.id,
                username: `${publicUserData.firstName || ''} ${publicUserData.lastName || ''}`.trim() || publicUserData.identifier,
                imageUrl: publicUserData.imageUrl,
                hasImage: !!publicUserData.hasImage
            };
        });

        setUsers(userData);
    }, [isLoaded, memberships?.data]);

    // 获取已选用户的详细信息 - 这个现在仅用于加载状态，不再用于显示
    useEffect(() => {
        async function loadSelectedUsers() {
            if (selectedUserIds.length === 0) {
                setIsLoadingUsers(false);
                return;
            }

            setIsLoadingUsers(true);
            try {
                // 只标记加载状态，不再存储结果
                await Promise.all(
                    selectedUserIds.map(async (userId) => {
                        try {
                            await getUser(userId);
                        } catch (error) {
                            console.error(`获取用户信息失败: ${userId}`, error);
                        }
                    })
                );
            } catch (error) {
                console.error('加载选中用户信息失败', error);
            } finally {
                setIsLoadingUsers(false);
            }
        }

        loadSelectedUsers();
    }, [selectedUserIds]);

    // 处理用户选择
    const handleUserSelect = (userId: string) => {
        setSelectedUserIds(prev => {
            // 如果已经选中，则移除
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            // 否则添加
            return [...prev, userId];
        });
    };

    // 应用筛选条件
    const handleApply = () => {
        if (selectedUserIds.length > 0) {
            // 有选中的用户，应用筛选
            onApply({
                propertyId: propertyDefinition.id,
                propertyType: propertyDefinition.type,
                operator: 'in', // 使用 in 操作符，表示包含于这些值中
                value: selectedUserIds
            });
        } else {
            // 没有选中的用户，等同于清除筛选
            onApply(null);
        }
    };

    // 清除筛选条件
    const handleClear = () => {
        setSelectedUserIds([]);
        onApply(null);
    };

    // 筛选用户列表
    const filteredUsers = searchQuery.trim() !== ''
        ? users.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : users;

    return (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
            {/* 面板标题 */}
            <div className="text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-3">
                {propertyDefinition.name}
            </div>

            {/* 搜索输入框 */}
            <div className="mb-3">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                />
            </div>

            {/* 用户列表 */}
            <div className="mb-3 max-h-48 overflow-y-auto">
                {isLoaded ? (
                    filteredUsers.length > 0 ? (
                        <div className="space-y-1">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.userId}
                                    className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleUserSelect(user.userId)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.userId)}
                                        readOnly
                                        className="mr-2"
                                    />
                                    <span className="text-sm truncate">{user.username}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 text-center py-2">
                            {searchQuery.trim() !== '' ? 'No matching users' : 'No users available'}
                        </div>
                    )
                ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                        Loading...
                    </div>
                )}
            </div>

            {/* 已选用户计数 */}
            {selectedUserIds.length > 0 && (
                <div className="text-xs text-gray-600 mb-2">
                    Selected {selectedUserIds.length} users
                </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                    {currentFilter && (
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-3 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-800"
                        disabled={isLoadingUsers}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
