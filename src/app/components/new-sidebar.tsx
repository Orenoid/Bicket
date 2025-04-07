import React, { useState, useEffect } from 'react';
import Divider from './ui/divider-new';
import { TbLayoutSidebarRightExpand, TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import Image from 'next/image';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface SidebarProps {
  sections: SidebarItem[][];
}

const Sidebar: React.FC<SidebarProps> = ({ sections = [[], [], []] }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // 监听折叠状态变化，更新文档根元素的 class
  useEffect(() => {
    if (collapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
    
    // 清理函数
    return () => {
      document.documentElement.classList.remove('sidebar-collapsed');
    };
  }, [collapsed]);
  
  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Make sure we always have 3 sections
  const [topSection, middleSection, bottomSection] = sections.length === 3 
    ? sections 
    : [...sections, ...Array(3 - sections.length).fill([])];

  // 渲染单个侧边栏项目
  const renderSidebarItem = (item: SidebarItem) => (
    <div
      key={item.id}
      className={`flex ${collapsed ? 'justify-center' : 'items-center'} p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 relative group w-full`}
      onClick={item.onClick}
    >
      {item.icon && <span className={collapsed ? '' : 'mr-4'}>{item.icon}</span>}
      {collapsed ? (
        <div className="fixed ml-16 bg-gray-700 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-[9999] pointer-events-none transition-opacity shadow-lg">
          {item.label}
        </div>
      ) : (
        <span className="truncate">{item.label}</span>
      )}
    </div>
  );

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-x-hidden z-10`}
    >
      {/* Logo和折叠按钮 */}
      <div className={`flex items-center p-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center">
            <Image src="/logo.png" alt="Bicket Logo" width={64} height={64} className="mr-1 pl-1" />
            <h1 className="text-2xl font-bold">Bicket</h1>
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hover:cursor-pointer"
          aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          {collapsed ? <TbLayoutSidebarRightCollapse size={20} /> : <TbLayoutSidebarRightExpand size={20} />}
        </button>
      </div>

      {/* Top section */}
      <div className="p-4 w-full">
        {topSection.map(renderSidebarItem)}
      </div>

      {/* Divider between top and middle sections */}
      <Divider />

      {/* Middle section (with overflow) */}
      <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden w-full">
        {middleSection.map(renderSidebarItem)}
      </div>
      
      {/* Divider between middle and bottom sections */}
      <Divider />

      {/* Bottom section */}
      <div className="p-4 w-full">
        {bottomSection.map(renderSidebarItem)}
      </div>
    </aside>
  );
};

export default Sidebar;
