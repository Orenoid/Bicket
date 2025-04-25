"use client";
import { UserDataContext } from "@/components/issue/UserContext";
import { User, getUser } from "@/lib/user/service";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { PropertyTableCellComponent } from "../type";

// 用户类型的单元格组件
export const UserPropertyCell: PropertyTableCellComponent = ({ value }) => {
  // 使用上下文中的用户数据
  const { userData, isLoading: isContextLoading } = useContext(UserDataContext);

  // 本地状态，用于兜底和回退机制
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 转换userId
  const userId =
    value !== null && value !== undefined && value !== "" ? String(value) : "";

  // 从上下文中获取用户数据
  const contextUser = userId ? userData[userId] : null;

  // useEffect必须在组件顶层调用，不能放在条件判断后面
  useEffect(() => {
    // 只有在上下文中没有数据且上下文加载完成时才单独请求
    if (!contextUser && !isContextLoading && userId) {
      async function loadUser() {
        try {
          setLoading(true);
          setError(null);
          const userData = await getUser(userId);
          setUser(userData);
        } catch (err) {
          console.error("加载用户信息失败", err);
          setError("加载用户信息失败");
        } finally {
          setLoading(false);
        }
      }

      loadUser();
    }
  }, [userId, contextUser, isContextLoading]);

  // 处理空值显示
  if (!userId) {
    return <span className="text-gray-400 italic"></span>;
  }

  // 用户加载状态的骨架屏占位符
  const loadingPlaceholder = (
    <div className="flex items-center">
      {/* 用户头像占位符 */}
      <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200 bg-gray-100 animate-pulse"></div>
      {/* 用户名占位符 - 使用固定宽度的骨架屏 */}
      <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
    </div>
  );

  // 如果上下文中有数据，直接使用
  if (contextUser) {
    return (
      <div className="flex items-center">
        {/* 用户头像 */}
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200">
          <Image
            src={contextUser.imageUrl}
            alt={contextUser.username}
            width={24}
            height={24}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
        {/* 用户名 */}
        <span className="text-sm truncate max-w-[120px]">
          {contextUser.username}
        </span>
      </div>
    );
  }

  if (isContextLoading) {
    return loadingPlaceholder;
  }
  if (loading) {
    return loadingPlaceholder;
  }

  if (error) {
    return (
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200 bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-xs">!</span>
        </div>
        <span className="text-red-500 text-sm">加载失败</span>
      </div>
    );
  }

  // 单独加载的用户数据
  if (user) {
    return (
      <div className="flex items-center">
        {/* 用户头像 */}
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200">
          <Image
            src={user.imageUrl}
            alt={user.username}
            width={24}
            height={24}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
        {/* 用户名 */}
        <span className="text-sm truncate max-w-[120px]">{user.username}</span>
      </div>
    );
  }

  // 用户不存在显示
  return (
    <div className="flex items-center">
      {/* 未知用户的头像占位符 */}
      <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400 text-xs">?</span>
      </div>
      <span className="text-gray-400 italic text-sm">未知用户</span>
    </div>
  );
};
