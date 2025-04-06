'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/sidebar';
import { MdInbox, MdViewList, MdSettings } from "react-icons/md";
import { FaCode, FaServer } from "react-icons/fa";

const ClientSidebar = () => {
  const router = useRouter();

  const sidebarSections = [
    [
      { id: "inbox", label: "Inbox", icon: <MdInbox size={20} /> },
      { id: "views", label: "Views", icon: <MdViewList size={20} /> },
    ],
    [
      { 
        id: "issues", 
        label: "Issues", 
        icon: <FaCode size={18} />,
        onClick: () => router.push('/issue')
      },
      { 
        id: "miners", 
        label: "Miners", 
        icon: <FaServer size={18} />, 
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