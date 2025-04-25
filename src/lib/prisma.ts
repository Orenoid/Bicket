import { PrismaClient } from "@prisma/client";

// 声明PrismaClient接口，允许添加额外属性
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

// 在Node.js全局对象上声明prisma属性
declare const global: CustomNodeJsGlobal;

// 连接选项
const prismaClientSingleton = () => {
  return new PrismaClient({
    // 启用连接池
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ["error", "warn"],
  });
};

// 实现连接池复用
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// 在开发环境和Vercel Fluid Compute环境下保持连接池
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // 在生产环境中，Vercel的Fluid Compute会复用函数实例
  // 这允许多个调用共享同一个连接池
  globalForPrisma.prisma = prisma;
}

export default prisma;
