import { NextRequest } from 'next/server';
import { createIssue, CreateIssueInput } from '@/app/issue/services/create';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // 开始计时 - auth
    const authStartTime = performance.now();
    const { userId, orgId } = await auth()
    const authEndTime = performance.now();
    console.log(`认证耗时: ${authEndTime - authStartTime}ms`);
    
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

    // 开始计时 - 解析请求体
    const parseStartTime = performance.now();
    const requestBody = await req.json();
    const parseEndTime = performance.now();
    console.log(`解析请求体耗时: ${parseEndTime - parseStartTime}ms`);
    
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
    
    // 开始计时 - 创建 Issue
    const createStartTime = performance.now();
    const result = await createIssue(input);
    const createEndTime = performance.now();
    console.log(`创建 Issue 服务耗时: ${createEndTime - createStartTime}ms`);
    
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