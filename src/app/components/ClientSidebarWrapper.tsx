'use client';

import { useEffect, useState } from 'react';
import ClientSidebar from './ClientSidebar';

/**
 * 客户端包装器组件，确保 ClientSidebar 只在客户端渲染
 * 解决 Clerk 组件的水合错误问题
 */
const ClientSidebarWrapper = () => {
  // 使用状态跟踪是否已在客户端挂载
  const [isMounted, setIsMounted] = useState(false);

  // 在组件挂载后设置状态
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 只在客户端渲染 ClientSidebar
  if (!isMounted) {
    return null;
  }

  return <ClientSidebar />;
};

export default ClientSidebarWrapper; 