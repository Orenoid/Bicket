import { NextRequest } from 'next/server';
import { batchCreateIssues, CreateIssueInput } from '@/app/issue/services/create';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // 获取认证信息
    const { userId, orgId } = await auth();
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

    // 解析请求体
    const requestBody = await req.json();

    // 验证请求体格式
    if (!requestBody || typeof requestBody !== 'object' || !Array.isArray(requestBody.issues)) {
      return new Response(JSON.stringify({
        success: false,
        message: '无效的请求数据格式，应提供issues数组'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 提取issue列表，并为每个 issue 添加 workspaceId
    const issues: CreateIssueInput[] = requestBody.issues.map((issue: Record<string, unknown>) => ({
      workspaceId: orgId.toString(),
      propertyValues: issue.propertyValues || {}
    }));

    // 验证是否提供了有效的issue
    if (issues.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '至少需要提供一个issue'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 调用批量创建服务
    const results = await batchCreateIssues(issues);

    // 检查是否有创建失败的issue
    const hasErrors = results.some(result => !result.success);

    if (hasErrors) {
      // 部分或全部创建失败
      return new Response(JSON.stringify({
        success: false,
        message: '部分或全部Issue创建失败',
        results
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 全部创建成功
    return new Response(JSON.stringify({
      success: true,
      message: `成功创建了 ${results.length} 个Issue`,
      data: {
        issues: results.map(result => ({ issueId: result.issueId }))
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('批量创建Issue时发生错误:', error);

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