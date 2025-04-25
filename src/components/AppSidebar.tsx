"use client";

import Link from "next/link";
import { CiViewTimeline } from "react-icons/ci";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/shadcn/ui/sidebar";

export function AppSidebar() {
  const { user, isLoaded } = useUser();
  const { toggleSidebar } = useSidebar();
  const userName = isLoaded
    ? user?.fullName || user?.emailAddresses[0].emailAddress || "My Account"
    : "Loading...";

  const handleUserClick = () => {
    // 将容器上的点击转发给 UserButton 组件中的按钮元素，增大可点击区域
    const userButton = document.querySelector(".cl-userButtonTrigger");
    if (userButton instanceof HTMLElement) {
      userButton.click();
    }
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* 统一高度的头部容器 */}
      <div className="h-16">
        {/* 侧边栏头部 - 展开状态 */}
        <SidebarHeader className="block group-data-[collapsible=icon]:hidden h-full">
          <div className="p-4 relative flex items-center justify-between h-full">
            <OrganizationSwitcher
              hidePersonal={true}
              appearance={{
                elements: {
                  rootBox: "w-full relative -left-6",
                  organizationSwitcherTrigger:
                    "flex text-left w-full justify-start",
                },
              }}
            />
            <SidebarTrigger onClick={toggleSidebar} className="ml-2 shrink-0" />
          </div>
        </SidebarHeader>

        {/* 侧边栏头部 - 折叠状态，保持固定高度 */}
        <SidebarHeader className="hidden group-data-[collapsible=icon]:flex justify-center items-center h-full">
          <SidebarTrigger onClick={toggleSidebar} />
        </SidebarHeader>
      </div>

      <SidebarContent className="pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Issues">
              <Link href="/issues">
                <CiViewTimeline
                  size={20}
                  className="mr-1 text-gray-600 [stroke-width:1.5px]"
                />
                <span className="text-md font-semibold">Issues</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleUserClick}
        >
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm truncate group-data-[collapsible=icon]:hidden">
            {userName}
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
