"use client";

import { getPropertyTypeIcon } from "../common";
import { DetailFieldComponent } from "../type";

export const DatetimeField: DetailFieldComponent = ({
  propertyDefinition,
  value,
}) => {
  // 处理空值显示
  if (value === null || value === undefined || value === "") {
    return (
      <div className="flex items-center">
        <div className="w-25 text-sm text-gray-600 font-semibold flex items-center">
          <div className="w-5 flex-shrink-0 flex justify-center">
            {getPropertyTypeIcon(propertyDefinition.type)}
          </div>
          <span className="truncate" title={propertyDefinition.name}>
            {propertyDefinition.name}
          </span>
        </div>
      </div>
    );
  }

  try {
    // 尝试解析日期时间字符串
    const dateString = String(value);
    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return (
        <div className="flex items-center">
          <div className="w-25 text-sm text-gray-600 font-semibold flex items-center">
            <div className="flex-shrink-0 flex justify-center">
              {getPropertyTypeIcon(propertyDefinition.type)}
            </div>
            <span className="w-8 truncate" title={propertyDefinition.name}>
              {propertyDefinition.name}
            </span>
          </div>
          <div className="pl-3">
            <span className="text-gray-400 italic">无效日期</span>
          </div>
        </div>
      );
    }

    // 获取配置
    const config = propertyDefinition.config || {};
    const showTime = config.showTime !== false; // 默认显示时间
    const showSeconds = config.showSeconds !== false; // 默认显示秒
    const showTimezone = config.showTimezone === true; // 默认不显示时区

    // 格式化日期部分 (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateFormatted = `${year}-${month}-${day}`;

    // 格式化时间部分
    let timeFormatted = "";
    if (showTime) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      timeFormatted = `${hours}:${minutes}`;

      // 添加秒部分（如果需要）
      if (showSeconds) {
        const seconds = String(date.getSeconds()).padStart(2, "0");
        timeFormatted += `:${seconds}`;
      }

      // 添加时区部分（如果需要）
      if (showTimezone) {
        const timezoneOffset = date.getTimezoneOffset();
        const timezoneHours = Math.abs(Math.floor(timezoneOffset / 60));
        const timezoneMinutes = Math.abs(timezoneOffset % 60);
        const timezoneSign = timezoneOffset <= 0 ? "+" : "-"; // 注意：getTimezoneOffset 返回的是与 UTC 的差值的负数
        const timezoneFormatted = `${timezoneSign}${String(timezoneHours).padStart(2, "0")}:${String(timezoneMinutes).padStart(2, "0")}`;
        timeFormatted += ` (UTC${timezoneFormatted})`;
      }
    }

    // 返回完整的格式化日期时间，整体使用浅灰色
    return (
      <div className="flex items-center">
        <div className="w-25 text-sm text-gray-600 font-semibold flex items-center">
          <div className="w-5 flex-shrink-0 flex justify-center">
            {getPropertyTypeIcon(propertyDefinition.type)}
          </div>
          <span className="truncate" title={propertyDefinition.name}>
            {propertyDefinition.name}
          </span>
        </div>
        <div className="pl-3 flex-grow">
          <div className="whitespace-nowrap text-gray-500">
            <span>{dateFormatted}</span>
            {showTime && <span className="ml-1">{timeFormatted}</span>}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("日期格式化错误", error);
    return (
      <div className="flex items-center">
        <div className="w-25 text-sm text-gray-600 font-semibold flex items-center">
          <div className="w-5 flex-shrink-0 flex justify-center">
            {getPropertyTypeIcon(propertyDefinition.type)}
          </div>
          <span className="truncate" title={propertyDefinition.name}>
            {propertyDefinition.name}
          </span>
        </div>
        <div className="pl-3">
          <span className="text-gray-400 italic">日期格式错误</span>
        </div>
      </div>
    );
  }
};
