import { createClerkClient } from "@clerk/backend";

// 创建Clerk客户端实例
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
