import { Prisma, property } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { PropertyProcessorFactory } from '@/app/property/add-property-value';
import { SystemPropertyId } from '@/app/property/constants';
import { CounterService } from '@/app/counter/services/counter';
import { PropertyType } from '@/app/property/constants';

/**
 * 创建 issue 的请求参数接口
 */
export interface CreateIssueInput {
  // 属性值映射，键为属性ID，值为属性值
  propertyValues: Record<string, unknown>;
}

/**
 * 创建 issue 的处理结果
 */
export interface CreateIssueResult {
  issueId: string;
  success: boolean;
  errors?: string[];
}

/**
 * 批量创建 issue 的服务函数 - 使用单个事务处理所有创建操作
 * 
 * @param inputs 创建 issue 的输入参数数组
 * @returns 创建结果数组
 */
export async function batchCreateIssues(
  inputs: CreateIssueInput[]
): Promise<CreateIssueResult[]> {
  if (inputs.length === 0) {
    return [];
  }
  
  // 获取所有属性定义
  const properties = await prisma.property.findMany({
    where: {
      deletedAt: null
    }
  });

  // 预处理和验证所有输入
  const preprocessResults = inputs.map(input => 
    preprocessIssueInput(input, properties)
  );
  
  // 检查是否有验证错误
  const hasErrors = preprocessResults.some(result => !result.success);
  
  // 如果有验证错误，直接返回结果
  if (hasErrors) {
    return preprocessResults.map(result => ({
      issueId: '',
      success: result.success,
      errors: result.errors
    }));
  }

  // 批量分配 Issue IDs
  const issueIds = await allocateIssueIds(inputs.length);
  
  // 使用单个事务批量处理所有创建操作
  try {
    const results = await prisma.$transaction(async (tx) => {
      const batchResults: CreateIssueResult[] = [];
      
      // 创建所有 issues
      const issueCreatePromises = inputs.map(() => tx.issue.create({ data: {} }));
      const createdIssues = await Promise.all(issueCreatePromises);
      
      // 准备所有属性值数据
      const allSingleValues: Prisma.property_single_valueCreateManyInput[] = [];
      const allMultiValues: Prisma.property_multi_valueCreateManyInput[] = [];
      
      // 处理每个 issue 的属性值
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const issueId = createdIssues[i].id;
        
        // 添加系统分配的业务 ID
        allSingleValues.push({
          issue_id: issueId,
          property_id: SystemPropertyId.ID,
          property_type: PropertyType.ID,
          value: String(issueIds[i]),
          number_value: Number(issueIds[i])
        });
        
        // 处理用户输入的每个属性值
        for (const [propertyId, value] of Object.entries(input.propertyValues)) {
          const property = properties.find(p => p.id === propertyId)!;
          
          // 获取处理器并转换为数据库格式
          const processor = PropertyProcessorFactory.getProcessor(property.type);
          const dbData = processor.transformToDbFormat(property, value, issueId);
          
          // 收集单值和多值数据
          if (dbData.singleValues && dbData.singleValues.length > 0) {
            allSingleValues.push(...dbData.singleValues);
          }
          
          if (dbData.multiValues && dbData.multiValues.length > 0) {
            allMultiValues.push(...dbData.multiValues);
          }
        }
        
        // 添加到结果列表，将业务ID一同返回
        batchResults.push({
          issueId,
          success: true
        });
      }
      
      // 批量创建所有属性值
      if (allSingleValues.length > 0) {
        await tx.property_single_value.createMany({
          data: allSingleValues
        });
      }
      
      if (allMultiValues.length > 0) {
        await tx.property_multi_value.createMany({
          data: allMultiValues
        });
      }
      
      return batchResults;
    });
    
    return results;
  } catch (error) {
    console.error('批量创建 issue 事务失败:', error);
    return inputs.map(() => ({
      issueId: '',
      success: false,
      errors: [(error as Error).message]
    }));
  }
}

/**
 * 分配 Issue 业务 ID
 * 
 * @param count 需要分配的 ID 数量
 * @returns 分配的 ID 数组
 */
async function allocateIssueIds(count: number): Promise<bigint[]> {
  if (count <= 0) {
    return [];
  }
  return CounterService.allocateIds('issue', count);
}

/**
 * 预处理和验证 issue 输入
 * 
 * @param input 创建 issue 的输入参数
 * @param properties 所有属性定义的缓存
 * @returns 预处理结果
 */
function preprocessIssueInput(
  input: CreateIssueInput,
  properties: property[]
): { success: boolean; errors?: string[] } {
  // 验证输入中是否包含只读属性
  const readonlyPropertyIds = properties
    .filter(prop => prop.readonly)
    .map(prop => prop.id);

  const containsReadonlyProperty = Object.keys(input.propertyValues)
    .some(propertyId => readonlyPropertyIds.includes(propertyId));

  if (containsReadonlyProperty) {
    return {
      success: false,
      errors: ['不能修改只读属性']
    };
  }

  // 收集所有验证错误
  const validationErrors: string[] = [];

  // 验证所有属性值
  for (const [propertyId, value] of Object.entries(input.propertyValues)) {
    // 查找属性定义
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      validationErrors.push(`属性 ${propertyId} 不存在`);
      continue;
    }

    // 获取对应类型的处理器
    try {
      const processor = PropertyProcessorFactory.getProcessor(property.type);

      // 验证格式
      const formatResult = processor.validateFormat(property, value);
      if (!formatResult.valid) {
        validationErrors.push(...(formatResult.errors || []));
        continue;
      }

      // 验证业务规则
      const businessResult = processor.validateBusinessRules(property, value);
      if (!businessResult.valid) {
        validationErrors.push(...(businessResult.errors || []));
        continue;
      }
    } catch (error) {
      validationErrors.push(`属性 ${property.name} 处理器错误: ${(error as Error).message}`);
      continue;
    }
  }

  // 如果有验证错误，返回错误信息
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors
    };
  }

  return { success: true };
}

/**
 * 创建单个 issue 的服务函数
 * 
 * @param input 创建 issue 的输入参数
 * @returns 创建结果
 */
export async function createIssue(input: CreateIssueInput): Promise<CreateIssueResult> {
  const results = await batchCreateIssues([input]);
  return results[0];
}
