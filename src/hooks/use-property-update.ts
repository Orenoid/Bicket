import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import {
  createSetOperation,
  createRemoveOperation,
} from "@/lib/property/update-operations";

async function updateIssueProperty(
  url: string,
  {
    arg,
  }: {
    arg: {
      issue_id: string;
      operations: Array<{
        property_id: string;
        operation_type: string;
        operation_payload: Record<string, unknown>;
      }>;
    };
  },
) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(data.message || "Unknown Error");
  }

  return data;
}

/**
 * 用于更新 issue 属性的 hook
 * @param issueId 工单ID
 * @returns 返回更新操作相关的方法和状态
 */
export function usePropertyUpdate(issueId: string) {
  // 全局 mutate 函数，用于更新其他 SWR 缓存
  const { mutate } = useSWRConfig();

  // 使用 useSWRMutation 进行数据更新
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/issue/update",
    updateIssueProperty,
  );

  /**
   * 设置属性值
   * @param propertyId 属性ID
   * @param value 新的属性值
   */
  const setPropertyValue = async (propertyId: string, value: unknown) => {
    try {
      const operation = createSetOperation(propertyId, value as string | null);

      await trigger({
        issue_id: issueId,
        operations: [operation],
      });

      mutate(`/api/issue/${issueId}`);
      return true;
    } catch (error) {
      console.error("更新属性时发生错误:", error);
      return false;
    }
  };

  /**
   * 移除属性值
   * @param propertyId 属性ID
   */
  const removePropertyValue = async (propertyId: string) => {
    try {
      const operation = createRemoveOperation(propertyId);

      await trigger({
        issue_id: issueId,
        operations: [operation],
      });

      // 更新成功后重新验证相关数据
      mutate(`/api/issue/${issueId}`);
      return true;
    } catch (error) {
      console.error("移除属性时发生错误:", error);
      return false;
    }
  };

  return {
    setPropertyValue,
    removePropertyValue,
    isLoading: isMutating,
    error,
  };
}
