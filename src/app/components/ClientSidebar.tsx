'use client';

import Sidebar from '@/app/components/sidebar';
import { useRouter } from 'next/navigation';
import { CiViewTimeline } from 'react-icons/ci';
import { HiOutlineServer } from 'react-icons/hi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { MdSettings, MdViewList } from "react-icons/md";

const ClientSidebar = () => {
  const router = useRouter();

  const sidebarSections = [
    [
      { id: "inbox", label: "Inbox", icon: <IoNotificationsOutline size={20} /> },
      { id: "views", label: "Views", icon: <MdViewList size={20} /> },
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
      { id: "settings", label: "Settings", icon: <MdSettings size={20} /> },
    ],
  ];

  return <Sidebar sections={sidebarSections} />;
};

export default ClientSidebar; 