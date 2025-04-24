'use server';

import { clerkClient } from '@/lib/clerk/client';

// TODO 原则上数据查询应该用 route handler 来实现，时间有限暂不改动

// 用户信息接口
export interface User {
    id: string;
    imageUrl: string;
    hasImage: boolean;
    username: string;
}

/**
 * 获取用户信息
 * @param userId 用户ID
 * @returns 用户信息对象，包含头像URL和用户名
 */
export async function getUser(userId: string): Promise<User> {
    try {
        // 从Clerk获取用户信息
        const user = await clerkClient.users.getUser(userId);
        
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 构建用户名 - 如果有名字则使用，否则使用邮箱或电话号码
        const username = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0]?.emailAddress || 
              user.phoneNumbers[0]?.phoneNumber || 
              '未命名用户';
        
        return {
            id: user.id,
            imageUrl: user.imageUrl,
            hasImage: !!user.imageUrl,
            username
        };
    } catch (error) {
        console.error('获取用户信息失败:', error);
        throw new Error('获取用户信息失败');
    }
}

// 用户查询参数接口
export interface UserListParams {
    limit?: number; // 返回结果数量，默认10
    offset?: number; // 分页偏移量，默认0
    orderBy?: 'created_at' | 'updated_at' | 'email_address' | 'web3wallet' | 'first_name' | 'last_name' | 'phone_number' | 'username' | 'last_active_at' | 'last_sign_in_at'; // 排序字段
    emailAddress?: string[]; // 按邮箱地址筛选
    phoneNumber?: string[]; // 按电话号码筛选
    externalId?: string[]; // 按外部ID筛选
    username?: string[]; // 按用户名筛选
    web3Wallet?: string[]; // 按Web3钱包地址筛选
    userId?: string[]; // 按用户ID筛选
    organizationId?: string[]; // 按组织ID筛选
    query?: string; // 通用查询字符串
    last_active_at_since?: number; // 按最后活跃时间筛选
}

// 分页响应接口
export interface PaginatedUserResponse {
    data: User[]; // 用户列表
    totalCount: number; // 总用户数
}

/**
 * 批量获取用户信息
 * @param params 查询参数
 * @returns 分页用户信息，包含用户列表和总数
 */
export async function getUserList(params?: UserListParams): Promise<PaginatedUserResponse> {
    try {
        // 从Clerk获取用户列表
        const response = await clerkClient.users.getUserList(params);
        
        // 将Clerk用户数据转换为应用所需格式
        const users = response.data.map(user => {
            const username = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.emailAddresses[0]?.emailAddress || 
                  user.phoneNumbers[0]?.phoneNumber || 
                  'Unnamed User';
            
            return {
                id: user.id,
                imageUrl: user.imageUrl,
                hasImage: !!user.imageUrl,
                username
            };
        });
        
        return {
            data: users,
            totalCount: response.totalCount
        };
    } catch (error) {
        console.error('批量获取用户信息失败:', error);
        throw new Error('批量获取用户信息失败');
    }
}

