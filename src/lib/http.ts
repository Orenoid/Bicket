// 一些用于后端 API 或 server action 的辅助工具
// 简单搜索了下似乎并没有比较主流的通用方案，所以自己封装了

import { NextRequest } from "next/server";

export interface ActionResult<T = void> {
  success: boolean;
  message: string;
  payload?: T;
}

export type HttpResponse = {
  code: number;
  message: string;
  payload?: Record<string, unknown>;
};

export class HttpError extends Error {
  constructor(
    public code: number,
    public message: string,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(401, message || "Unauthorized");
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(400, message || "Bad Request");
  }
}

/**
 * API 路由处理器的错误捕捉装饰器
 * 用于包装 Next.js API 路由处理函数，捕获并处理异常，并统一转换为 HttpResponse 格式
 *
 * @param handler API 路由处理函数
 * @returns 包装后的处理函数
 */
export function withErrorHandler(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<Response>,
): (req: NextRequest, ...args: unknown[]) => Promise<Response> {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      // expected error
      if (error instanceof HttpError) {
        return toResponse({
          code: error.code,
          message: error.message,
        });
      }
      // unexpected error
      console.error(error);
      return toResponse({
        code: 500,
        message: "Unknown Server Error",
      });
    }
  };
}

export function toResponse(response: HttpResponse): Response {
  return new Response(JSON.stringify(response), {
    status: response.code,
    headers: { "Content-Type": "application/json" },
  });
}
