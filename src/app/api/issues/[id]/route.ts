import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth, OrganizationMembership } from "@clerk/nextjs/server";
import { clerkClient } from "@/app/clerk/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户信息
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    const issueID = (await params).id;
    
    // 获取 issue 信息
    const issue = await prisma.issue.findUnique({
      where: { id: issueID },
      select: { workspace_id: true }
    });
    
    if (!issue) {
      return NextResponse.json(
        { error: "Issue 不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否属于 issue.workspace_id 对应的组织
    const organizationId = issue.workspace_id;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Issue does not belong to any workspace, cannot delete" },
        { status: 403 }
      );
    }

    // 获取组织成员列表
    const { data: memberships } = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId, limit: 100 // TODO deal with pagination
      
    });
    // 检查当前用户是否在组织成员列表中
    const isMember = memberships.some((membership: OrganizationMembership) => 
      membership.publicUserData?.userId === userId
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have permission to delete this issue" },
        { status: 403 }
      );
    }

    // 删除与 issue 相关的所有属性值
    await prisma.property_single_value.deleteMany({
      where: { issue_id: issueID }
    });
    await prisma.property_multi_value.deleteMany({
      where: { issue_id: issueID }
    });

    // 删除 issue
    await prisma.issue.delete({
      where: { id: issueID }
    });
    
    return NextResponse.json(
      { message: "Issue deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Error deleting issue" },
      { status: 500 }
    );
  }
} 