import { prisma } from '@/app/lib/prisma';
import { PropertyUpdateProcessorFactory, MultiValueData } from '@/app/property/update-property-value';

// 定义操作负载接口
type OperationPayload = Record<string, unknown>;

// 定义操作接口
interface Operation {
  property_id: string;
  operation_type: string;
  operation_payload: OperationPayload;
}

// 定义更新Issue的输入参数接口
interface UpdateIssueInput {
  issueId: string;
  operations: Operation[];
}

// 定义更新结果接口
export interface UpdateIssueResult {
  success: boolean;
  issueId?: string;
  errors?: string[];
}

/**
 * 更新Issue
 * @param input 更新Issue的输入参数
 * @returns 更新结果
 */
export async function updateIssue(input: UpdateIssueInput): Promise<UpdateIssueResult> {
  try {
    // 1. 检查Issue是否存在
    const issue = await prisma.issue.findUnique({
      where: {
        id: input.issueId,
        deletedAt: null, // 未被软删除
      },
    });

    if (!issue) {
      return {
        success: false,
        errors: [`Issue不存在: ${input.issueId}`]
      };
    }
    
    // 2. 验证操作权限 (暂时不实现)
    
    // 3. 收集所有需要查询的属性ID
    const propertyIds = [...new Set(input.operations.map(op => op.property_id))];
    
    // 4. 一次性查询所有需要的属性
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        deletedAt: null, // 未被软删除
      },
    });
    
    // 将属性列表转换为Map以便快速查找
    const propertyMap = new Map(properties.map(prop => [prop.id, prop]));
    
    // 5. 验证所有属性是否存在且可写
    for (const operation of input.operations) {
      const property = propertyMap.get(operation.property_id);
      
      if (!property) {
        return {
          success: false,
          errors: [`属性不存在: ${operation.property_id}`]
        };
      }
      
      if (property.readonly) {
        return {
          success: false,
          errors: [`属性不可修改: ${property.name}`]
        };
      }
    }
    
    // 6. 处理每个操作并在事务中执行数据库操作
    await prisma.$transaction(async (tx) => {
      for (const operation of input.operations) {
        const property = propertyMap.get(operation.property_id)!;
        
        try {
          // 获取对应类型的处理器
          const processor = PropertyUpdateProcessorFactory.getProcessor(property.type);
          
          // 验证操作格式
          const formatValidation = processor.validateFormat(
            property, 
            operation.operation_type, 
            operation.operation_payload
          );
          
          if (!formatValidation.valid) {
            throw new Error(formatValidation.errors?.join(', ') || '格式验证失败');
          }
          
          // 验证业务规则
          const businessValidation = processor.validateBusinessRules(
            property, 
            operation.operation_type, 
            operation.operation_payload
          );
          
          if (!businessValidation.valid) {
            throw new Error(businessValidation.errors?.join(', ') || '业务规则验证失败');
          }
          
          // 转换为数据库操作
          const operationResult = processor.transformToDbOperations(
            property, 
            operation.operation_type, 
            operation.operation_payload, 
            input.issueId
          );
          
          // 执行单值属性操作
          if (operationResult.singleValueRemove) {
            // 硬删除单值属性
            await tx.property_single_value.deleteMany({
              where: {
                issue_id: input.issueId,
                property_id: property.id
              }
            });
          } else if (operationResult.singleValueUpdate) {
            // 更新单值属性
            await tx.property_single_value.upsert({
              where: {
                issue_id_property_id: {
                  issue_id: input.issueId,
                  property_id: property.id
                }
              },
              update: {
                value: operationResult.singleValueUpdate.value,
                number_value: operationResult.singleValueUpdate.number_value
              },
              create: {
                issue_id: input.issueId,
                property_id: property.id,
                property_type: property.type,
                value: operationResult.singleValueUpdate.value,
                number_value: operationResult.singleValueUpdate.number_value
              }
            });
          }
          
          // 执行多值属性操作
          if (operationResult.multiValueRemovePositions && operationResult.multiValueRemovePositions.length > 0) {
            // 硬删除指定位置的多值属性
            await tx.property_multi_value.deleteMany({
              where: {
                issue_id: input.issueId,
                property_id: property.id,
                position: { in: operationResult.multiValueRemovePositions }
              }
            });
          }
          
          if (operationResult.multiValueUpdates && operationResult.multiValueUpdates.size > 0) {
            // 更新多值属性
            for (const [position, updateData] of operationResult.multiValueUpdates.entries()) {
              await tx.property_multi_value.updateMany({
                where: {
                  issue_id: input.issueId,
                  property_id: property.id,
                  position: position
                },
                data: {
                  value: updateData.value,
                  number_value: updateData.number_value
                }
              });
            }
          }
          
          if (operationResult.multiValueCreates && operationResult.multiValueCreates.length > 0) {
            // 创建多值属性
            const multiValueCreateData = operationResult.multiValueCreates.map((item: MultiValueData) => ({
              issue_id: input.issueId,
              property_id: property.id,
              property_type: property.type,
              value: item.value,
              number_value: item.number_value,
              position: item.position
            }));
            
            await tx.property_multi_value.createMany({
              data: multiValueCreateData,
              skipDuplicates: true  // 如果位置已存在则跳过
            });
          }
        } catch (error) {
          throw new Error(`处理属性 ${property.name} 的操作时出错: ${(error as Error).message}`);
        }
      }
      
      // 更新issue的updatedAt时间
      await tx.issue.update({
        where: {
          id: input.issueId
        },
        data: {
          updatedAt: new Date()
        }
      });
    });
    
    // 返回成功结果
    return {
      success: true,
      issueId: input.issueId
    };

  } catch (error) {
    console.error('更新Issue时发生错误:', error);
    
    return {
      success: false,
      errors: [(error as Error).message]
    };
  }
}
