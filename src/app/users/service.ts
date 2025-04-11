'use server';

import { createClerkClient } from '@clerk/backend';

// 创建Clerk客户端实例
const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY
});

// 用户信息接口
export interface User {
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
            imageUrl: user.imageUrl,
            hasImage: !!user.imageUrl,
            username
        };
    } catch (error) {
        console.error('获取用户信息失败:', error);
        throw new Error('获取用户信息失败');
    }
} 