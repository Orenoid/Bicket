import { PrismaClient } from '@prisma/client';

// 防止在开发环境中创建多个Prisma实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 创建Prisma客户端实例
export const prisma = globalForPrisma.prisma || new PrismaClient();

// 只在非生产环境下将prisma分配给global对象
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma; 