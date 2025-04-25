import { FilterCondition } from "../types";
import { FilterTransformer, PrismaFilterCondition } from "./filter-transformer";
import { PropertyType } from "../constants";

/**
 * 用户类型属性的筛选转换器
 *
 * 处理用户类型属性的筛选条件转换
 */
export const UserFilterTransformer: FilterTransformer = {
  /**
   * 转换用户类型筛选条件为Prisma查询条件
   */
  toPrismaQuery(filter: FilterCondition): PrismaFilterCondition {
    // 确保操作符和值类型的正确性
    if (filter.operator !== "in" || !Array.isArray(filter.value)) {
      console.warn("用户筛选条件格式不正确，预期 in 操作符和数组值", filter);
      return {};
    }

    // 获取用户ID数组
    const userIds = filter.value as string[];
    if (userIds.length === 0) {
      // 空数组，应该不返回任何结果
      return {
        // 添加一个永远不会匹配的条件
        id: "-1", // 使用不可能存在的ID值
      };
    }

    // 构建查询条件 - 在单值表中查找
    return {
      property_single_value: {
        some: {
          property_id: filter.propertyId,
          property_type: PropertyType.USER,
          value: {
            in: userIds,
          },
        },
      },
    };
  },

  /**
   * 验证用户筛选条件是否有效
   */
  validate(filter: FilterCondition): boolean {
    // 基本验证
    if (!filter.propertyId || filter.propertyType !== PropertyType.USER) {
      return false;
    }

    // 验证操作符
    if (filter.operator !== "in") {
      return false;
    }

    // 验证值是否为数组
    if (!Array.isArray(filter.value)) {
      return false;
    }

    // 验证数组中的值是否都是字符串
    return (filter.value as string[]).every(
      (item) => typeof item === "string" && item.trim() !== "",
    );
  },

  /**
   * 预处理用户筛选条件（确保值是字符串数组）
   */
  preprocess(filter: FilterCondition): FilterCondition {
    // 复制筛选条件，避免修改原对象
    const processed = { ...filter };

    // 确保值是数组
    if (!Array.isArray(processed.value)) {
      processed.value = [String(processed.value)];
    }

    // 确保数组中的所有值都是字符串，并移除空值
    processed.value = (processed.value as string[])
      .map((item) => (item === null || item === undefined ? "" : String(item)))
      .filter((item) => item.trim() !== "");

    return processed;
  },
};
