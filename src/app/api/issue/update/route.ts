import { NextRequest } from 'next/server';
import { updateIssue } from '@/lib/issue/services/update';

// 定义操作负载接口（纯 Map 结构）
export type OperationPayload = Record<string, unknown>;

// 定义请求参数接口
interface UpdateIssueRequest {
  issue_id: string;
  operations: Operation[];
}

interface Operation {
  property_id: string;
  operation_type: string;
  operation_payload: OperationPayload; // 根据operation_type不同，payload的结构也不同
}

// 定义更新issue的输入参数接口 (供service层使用)
export interface UpdateIssueInput {
  issueId: string;
  operations: Operation[];
}

export async function PATCH(req: NextRequest) {
  try {
    // 未来可以在这里调用认证中间件
    // await authMiddleware(req)
    
    // 解析请求体
    const requestBody = await req.json();
    
    // 验证请求体格式
    if (!requestBody || typeof requestBody !== 'object') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '无效的请求数据格式'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 提取必要参数
    const { issue_id, operations } = requestBody as UpdateIssueRequest;
    
    // 验证必要参数
    if (!issue_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少必要的参数: issue_id'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少必要的参数: operations 或 operations 不是有效的数组'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证每个操作的有效性
    for (const operation of operations) {
      if (!operation.property_id || !operation.operation_type) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '操作缺少必要的参数: property_id 或 operation_type'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 调用更新服务
    const result = await updateIssue({
      issueId: issue_id,
      operations: operations
    });
    
    if (!result.success) {
      // 更新失败，返回错误信息
      return new Response(JSON.stringify({
        success: false,
        message: '更新 Issue 失败',
        errors: result.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 更新成功，返回结果
    return new Response(JSON.stringify({
      success: true,
      message: 'Issue 更新成功',
      data: {
        issueId: result.issueId
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('更新 Issue 时发生错误:', error);
    
    // 返回服务器错误
    return new Response(JSON.stringify({
      success: false,
      message: '服务器内部错误',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}