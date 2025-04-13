'use client';

import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CiViewTimeline } from 'react-icons/ci';
import { HiOutlineServer } from 'react-icons/hi';
import Sidebar, { SidebarItem } from './new-sidebar';

// 动态导入 UserButton 组件，并禁用 SSR
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

const ClientSidebar = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser()

  const sidebarSections: SidebarItem[][] = [
    [
      // { id: "inbox", label: "Inbox", icon: <IoNotificationsOutline size={20} /> },
      // { id: "views", label: "Views", icon: <MdViewList size={20} /> },
    ],
    [
      { 
        id: "issues", 
        label: "Issues", 
        icon: <CiViewTimeline size={18} />,
        onClick: () => router.push('/issue')
      },
      { 
        id: "miners", 
        label: "Miners", 
        icon: <HiOutlineServer size={18} />, 
        onClick: () => router.push('/miners')
      },
    ],
    [
      // { id: "settings", label: "Settings", icon: <MdSettings size={20} /> },
      { 
        id: "user", 
        label: isLoaded ? user?.fullName || user?.emailAddresses[0].emailAddress || "" : " ",
        icon: <UserButton />,
        onClick: () => {
          // 查找UserButton组件中的按钮元素并点击它
          const userButton = document.querySelector('.cl-userButtonTrigger');
          if (userButton instanceof HTMLElement) {
            userButton.click();
          }
        }
      },
    ],
  ];

  return <Sidebar sections={sidebarSections} />;
};

export default ClientSidebar; 