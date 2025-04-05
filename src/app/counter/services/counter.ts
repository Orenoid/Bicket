import { prisma } from '@/app/lib/prisma';

/**
 * 初始化计数器服务
 * 用于管理各种实体的ID计数器
 */
export class CounterService {
  /**
   * 确保特定实体的计数器存在
   * 如果不存在则创建，如果存在则不做任何操作
   * 
   * @param entityName 实体名称（如 'issue'）
   * @param initialValue 初始值，默认为 0
   * @param description 计数器描述
   * @returns 创建的计数器
   */
  static async ensureCounter(
    entityName: string,
    initialValue: bigint = BigInt(0),
    description?: string
  ) {
    const counter = await prisma.counter.findUnique({
      where: { entity_name: entityName },
    });

    if (!counter) {
      return prisma.counter.create({
        data: {
          entity_name: entityName,
          current_value: initialValue,
          description: description || `Counter for ${entityName}`,
        },
      });
    }

    return counter;
  }

  /**
   * 获取特定实体的当前计数器值
   * 
   * @param entityName 实体名称
   * @returns 当前计数器值，如果计数器不存在则返回 null
   */
  static async getCurrentValue(entityName: string): Promise<bigint | null> {
    const counter = await prisma.counter.findUnique({
      where: { entity_name: entityName },
    });

    return counter ? counter.current_value : null;
  }

  /**
   * 分配一批连续的 ID
   * 此方法在一个事务中原子性地递增计数器并返回分配的 ID 范围
   * 
   * @param entityName 实体名称（如 'issue'）
   * @param count 需要分配的 ID 数量
   * @param maxRetries 最大重试次数（处理并发冲突）
   * @returns 分配的 ID 数组
   */
  static async allocateIds(
    entityName: string, 
    count: number, 
    maxRetries: number = 5
  ): Promise<bigint[]> {
    // 确保计数器存在
    await this.ensureCounter(entityName);
    
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // 在事务中执行以确保原子性
        return await prisma.$transaction(async (tx) => {
          // 获取当前计数器
          const counter = await tx.counter.findUnique({
            where: { entity_name: entityName },
          });
          
          if (!counter) {
            throw new Error(`Counter for entity '${entityName}' does not exist`);
          }
          
          // 计算新值
          const currentValue = counter.current_value;
          const newValue = currentValue + BigInt(count);
          
          // 更新计数器
          await tx.counter.update({
            where: { 
              entity_name: entityName,
              // 使用乐观锁确保在并发情况下的安全
              current_value: currentValue
            },
            data: {
              current_value: newValue
            }
          });
          
          // 生成分配的 ID 数组
          const result: bigint[] = [];
          for (let i = 0; i < count; i++) {
            result.push(currentValue + BigInt(i) + BigInt(1));
          }
          
          return result;
        });
      } catch (error) {
        // 处理并发冲突（乐观锁失败）
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to allocate IDs after ${maxRetries} retries due to concurrency conflicts`);
          }
          // 等待一小段随机时间后重试（避免所有冲突事务同时重试）
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }
        // 其他错误直接抛出
        throw error;
      }
    }
    
    throw new Error('Failed to allocate IDs due to unexpected error');
  }
} 