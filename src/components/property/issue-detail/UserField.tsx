"use client";

import { getPropertyTypeIcon } from "@/components/property/common";
import { DetailFieldComponent } from "@/components/property/type";
import { LoadingContainerOverlay } from "@/components/ui/overlay";
import { useOrganization } from "@clerk/clerk-react";
import "@mdxeditor/editor/style.css";
import Image from "next/image";
import React, { useState } from "react";
import { MdCancel } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { Skeleton } from "@/components/shadcn/ui/skeleton";
import clsx from "clsx";
import { usePropertyUpdate } from "@/hooks/use-property-update";

export const UserField: DetailFieldComponent = ({
  propertyDefinition,
  value,
  issueID,
}) => {
  const [selectedUserID, setSelectedUserID] = useState<string>(
    typeof value === "string" ? value : "",
  );
  const hasValue = selectedUserID !== "";
  const [showClear, setShowClear] = useState(false); // shadcn select 不提供清除按钮，额外加上

  const {
    setPropertyValue,
    removePropertyValue,
    isLoading: isUpdating,
  } = usePropertyUpdate(issueID);

  // 获取可选的组织成员列表
  const { memberships, isLoaded: membersLoaded } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    },
  });
  const availableUsers = React.useMemo(() => {
    if (!membersLoaded || !memberships?.data) return [];
    return memberships.data.map((membership) => {
      const publicUserData = membership.publicUserData;
      return {
        firstName: publicUserData.firstName,
        lastName: publicUserData.lastName,
        imageUrl: publicUserData.imageUrl,
        hasImage: publicUserData.hasImage,
        identifier: publicUserData.identifier,
        userId: publicUserData.userId || membership.id,
      };
    });
  }, [membersLoaded, memberships?.data]);
  // const selectedUser = membersLoaded ? availableUsers.find(user => user.userId === selectedUserID) : null;

  // 通过用户ID加载用户详细信息，从上下文或服务器获取
  // const loadUserById = React.useCallback(async (userId: string) => {
  //     console.log('loadUserById', userId)
  //     setIsLoadingCurrentUser(true);
  //     try {
  //         if (isContextLoading) {
  //             setTimeout(() => loadUserById(userId), 500);
  //             return;
  //         }
  //         const contextUser = userData[userId];
  //         if (contextUser) {
  //             setSelectedUser({
  //                 firstName: contextUser.username.split(' ')[0] || null,
  //                 lastName: contextUser.username.split(' ').slice(1).join(' ') || null,
  //                 imageUrl: contextUser.imageUrl,
  //                 hasImage: contextUser.hasImage,
  //                 identifier: contextUser.username,
  //                 userId: userId
  //             });
  //         } else {
  //             const user = await getUser(userId);
  //             setSelectedUser({
  //                 firstName: user.username.split(' ')[0] || null,
  //                 lastName: user.username.split(' ').slice(1).join(' ') || null,
  //                 imageUrl: user.imageUrl,
  //                 hasImage: user.hasImage,
  //                 identifier: user.username,
  //                 userId: userId
  //             });
  //         }
  //     } catch (error) {
  //         console.error('加载用户数据失败:', error);
  //         setSelectedUser(null);
  //     } finally {
  //         setIsLoadingCurrentUser(false);
  //     }
  // }, [userData, isContextLoading]);

  const handleSelectUser = async (userId: string) => {
    const success = await setPropertyValue(propertyDefinition.id, userId);
    if (success) {
      setSelectedUserID(userId);
    }
  };

  const handleClearUser = async () => {
    const success = await removePropertyValue(propertyDefinition.id);
    if (success) {
      setSelectedUserID("");
    }
  };

  const handleLoadMore = () => {
    if (memberships && memberships.hasNextPage) {
      memberships.fetchNext();
    }
  };

  const renderUserItem = (user: NonNullable<typeof availableUsers>[number]) => (
    <div className="flex items-center">
      <Image
        src={user.imageUrl}
        alt={`${user.firstName || ""} ${user.lastName || ""}`}
        width={24}
        height={24}
        unoptimized
        className="w-6 h-6 rounded-full mr-2 flex-shrink-0 object-cover border border-gray-200"
      />
      <span className="text-sm truncate">
        {user.firstName || ""} {user.lastName || ""}
      </span>
    </div>
  );

  return (
    <div className="flex items-center">
      <div className="w-24 text-sm text-gray-600 font-semibold flex items-center">
        <div className="w-5 flex-shrink-0 flex justify-center">
          {getPropertyTypeIcon(propertyDefinition.type)}
        </div>
        <span className="truncate" title={propertyDefinition.name}>
          {propertyDefinition.name}
        </span>
      </div>
      <div className="relative w-auto min-w-[120px] max-w-[240px] pl-3">
        <div
          className="relative w-full"
          onMouseEnter={() => setShowClear(true)}
          onMouseLeave={() => setShowClear(false)}
        >
          {hasValue && !membersLoaded ? (
            <>
              <div className="flex items-center h-[36px]">
                <Skeleton className="w-6 h-6 rounded-full mr-2 flex-shrink-0" />
                <Skeleton className="h-4 w-24" />
              </div>
            </>
          ) : (
            <>
              <Select value={selectedUserID} onValueChange={handleSelectUser}>
                <div className="flex flex-row items-center">
                  <SelectTrigger className="w-full border-none shadow-none focus:ring-0 focus-visible:ring-0 p-0 [&_svg]:hidden">
                    <SelectValue placeholder="No selection" />
                  </SelectTrigger>
                  <div
                    className={clsx(
                      "text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer",
                      {
                        "opacity-100": showClear && selectedUserID !== "",
                        "opacity-0": !showClear || selectedUserID === "",
                      },
                    )}
                    onClick={handleClearUser}
                  >
                    <MdCancel size={16} />
                  </div>
                </div>
                <SelectContent>
                  {availableUsers.length > 0 ? (
                    <>
                      {availableUsers.map((user) => (
                        <SelectItem
                          key={user.userId || user.identifier}
                          value={user.userId || ""}
                        >
                          {renderUserItem(user)}
                        </SelectItem>
                      ))}
                      {memberships?.hasNextPage && (
                        <div
                          className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-50 cursor-pointer"
                          onClick={handleLoadMore}
                        >
                          {memberships.isFetching ? "Loading..." : "Load more"}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      {membersLoaded ? "No available users" : "Loading..."}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </>
          )}
          {isUpdating && <LoadingContainerOverlay />}
        </div>
      </div>
    </div>
  );
};
