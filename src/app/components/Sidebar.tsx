import React from 'react';
import Divider from './ui/divider';

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
  // Make sure we always have 3 sections
  const [topSection, middleSection, bottomSection] = sections.length === 3 
    ? sections 
    : [...sections, ...Array(3 - sections.length).fill([])];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-50 border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
      {/* Top section */}
      <div className="p-4">
        {topSection.map((item: SidebarItem) => (
          <div
            key={item.id}
            className="flex items-center p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={item.onClick}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Divider between top and middle sections */}
      <Divider />

      {/* Middle section (with overflow) */}
      <div className="p-4 flex-1 overflow-y-auto">
        {middleSection.map((item: SidebarItem) => (
          <div
            key={item.id}
            className="flex items-center p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={item.onClick}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      
      {/* Divider between middle and bottom sections */}
      <Divider />

      {/* Bottom section */}
      <div className="p-4">
        {bottomSection.map((item: SidebarItem) => (
          <div
            key={item.id}
            className="flex items-center p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={item.onClick}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
