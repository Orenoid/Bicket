import { NextRequest } from 'next/server';
import { updateIssue } from '@/lib/issue/services/update';
import { withErrorHandler, HttpError, toResponse, BadRequestError } from '@/lib/http';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import inittializeApp from '@/app/init';

export type OperationPayload = Record<string, unknown>;

const operationSchema = z.object({
  property_id: z.string({
    required_error: 'Missing required parameter: property_id'
  }),
  operation_type: z.string({
    required_error: 'Missing required parameter: operation_type'
  }),
  operation_payload: z.record(z.unknown()).default({})
});

const updateIssueRequestSchema = z.object({
  issue_id: z.string({
    required_error: 'Missing required parameter: issue_id'
  }),
  operations: z.array(operationSchema).nonempty({
    message: 'Missing required parameter: operations or operations is not a valid array'
  })
});

// 定义类型，供后续代码使用
interface Operation {
  property_id: string;
  operation_type: string;
  operation_payload: OperationPayload;
}

export interface UpdateIssueInput {
  issueId: string;
  operations: Operation[];
}

async function handler(req: NextRequest) {
  const requestBody = await req.json().catch(() => {
    throw new BadRequestError()
  });
  const parseResult = updateIssueRequestSchema.safeParse(requestBody);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.errors[0]?.message || 'Bad Request';
    throw new BadRequestError(errorMessage);
  }

  const { issue_id, operations } = parseResult.data;

  const result = await updateIssue({
    issueId: issue_id,
    operations: operations as Operation[]
  });
  if (!result.success) {
    throw new HttpError(403, result.errors?.[0] || 'Failed to update issue');
  }

  revalidatePath(`/issues/${issue_id}`);
  revalidatePath(`/issues`);

  return toResponse({
    code: 200,
    message: 'Issue updated successfully',
    payload: {
      issueId: result.issueId
    }
  });
}

export const PATCH = withErrorHandler(handler);
inittializeApp();