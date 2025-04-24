"use server";

import { createIssue } from "@/lib/issue/services/create";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createIssueFormSchema } from "./schema";
import { ActionResult } from "@/lib/http";
import prisma from "@/lib/prisma";
import { clerkClient } from "@/lib/clerk/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import inittializeApp from "@/app/init";

export async function createIssueAction(
  prevState: { message: string },
  data: z.infer<typeof createIssueFormSchema>,
): Promise<ActionResult> {
  try {
    const propertyValues = convertFormDataToPropertyValues(data);

    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await createIssue({ workspaceId: orgId, propertyValues });

    return {
      success: true,
      message: "success",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Server Error",
    };
  } finally {
    revalidatePath("/issues");
    redirect("/issues");
  }
}

function convertFormDataToPropertyValues(
  data: z.infer<typeof createIssueFormSchema>,
): { property_id: string; value: unknown }[] {
  const propertyValues = [];
  for (const [key, value] of Object.entries(data)) {
    propertyValues.push({
      property_id: key,
      value: value,
    });
  }
  return propertyValues;
}

export async function deleteIssueAction(
  issueID: string,
): Promise<ActionResult> {
  try {
    // 获取当前用户信息
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // 获取 issue 信息
    const issue = await prisma.issue.findUnique({
      where: { id: issueID },
      select: { workspace_id: true },
    });
    if (!issue) {
      console.warn(`Issue ${issueID} does not exist`);
      return {
        success: false,
        // 防止权限漏洞，统一告知 issue 不存在
        message: "Issue does not exist.",
      };
    }
    // 检查用户是否属于 issue.workspace_id 对应的组织
    const organizationId = issue.workspace_id;
    if (!organizationId) {
      console.warn(`Issue ${issueID} does not belong to any workspace`);
      return {
        success: false,
        // 防止权限漏洞，统一告知 issue 不存在
        message: "Issue does not exist.",
      };
    }
    // 检查当前用户是否在组织成员列表中
    const { data: memberships } =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId,
        limit: 100,
      });
    const isMember = memberships.some(
      (membership) => membership.publicUserData?.userId === userId,
    );
    if (!isMember) {
      console.warn(
        `User ${userId} does not have permission to delete issue ${issueID}`,
      );
      return {
        success: false,
        // 防止权限漏洞，统一告知 issue 不存在
        message: "Issue does not exist.",
      };
    }

    await prisma.$transaction([
      prisma.property_single_value.deleteMany({
        where: { issue_id: issueID },
      }),
      prisma.property_multi_value.deleteMany({
        where: { issue_id: issueID },
      }),
      prisma.issue.delete({
        where: { id: issueID },
      }),
    ]);
  } catch (error) {
    console.error("删除Issue时出错:", error);
    return {
      success: false,
      message: "Server error",
    };
  }

  redirect("/issues");
}

// server action 不会触发 instrumentation.ts，官方没有提供解决方案，先临时绕过
inittializeApp();
