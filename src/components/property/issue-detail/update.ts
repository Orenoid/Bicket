// TODO 等属性组件内的更新逻辑都替换成 property update hook 就可以移除了

export const handlePropertyUpdate = async (
  issueID: string,
  operation: {
    property_id: string;
    operation_type: string;
    operation_payload: Record<string, unknown>;
  },
) => {
  try {
    const response = await fetch("/api/issue/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        issue_id: issueID,
        operations: [operation],
      }),
    });

    const data = await response.json();

    if (data.code === 200) {
      return true;
    } else {
      console.error("更新失败:", data.message || "未知错误");
      return false;
    }
  } catch (error) {
    console.error("更新属性时发生错误:", error);
    return false;
  }
};
