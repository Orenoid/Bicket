import { NextRequest } from 'next/server';
import { createIssue, CreateIssueInput } from '@/lib/issue/services/create';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // 开始计时 - auth

    const { userId, orgId } = await auth()
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证组织ID
    if (!orgId) {
      return new Response(JSON.stringify({
        success: false,
        message: '缺少工作区ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
    
    // 提取属性值
    const propertyValues = requestBody.propertyValues;
    
    if (!propertyValues || typeof propertyValues !== 'object') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少必要的属性值数据'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 构建创建 Issue 的输入参数，添加 workspaceId
    const input: CreateIssueInput = {
      workspaceId: orgId.toString(),
      propertyValues
    };
    
    const result = await createIssue(input);
    
    if (!result.success) {
      // 创建失败，返回错误信息
      return new Response(JSON.stringify({
        success: false,
        message: '创建 Issue 失败',
        errors: result.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 创建成功，返回结果
    return new Response(JSON.stringify({
      success: true,
      message: 'Issue 创建成功',
      data: {
        issueId: result.issueId
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('创建 Issue 时发生错误:', error);
    
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