import { FilterCondition } from "../types";
import {
  FilterTransformer,
  FilterTransformerContext,
} from "./filter-transformer";

/**
 * 富文本类型的筛选转换器
 *
 * 处理富文本类型属性的筛选条件转换
 */
export const RichTextFilterTransformer: FilterTransformer = {
  /**
   * 将富文本类型的筛选条件转换为Prisma查询条件
   *
   * 目前富文本类型主要支持contains操作符
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toPrismaQuery(filter: FilterCondition, _context?: FilterTransformerContext) {
    // 确保值是字符串
    const value = filter.value as string;

    // 根据不同的操作符构建不同的查询条件
    switch (filter.operator) {
      case "contains":
        return {
          property_single_value: {
            some: {
              property_id: filter.propertyId,
              property_type: filter.propertyType,
              value: { contains: value },
            },
          },
        };

      default:
        throw new Error(`不支持的富文本筛选操作符: ${filter.operator}`);
    }
  },

  /**
   * 验证富文本类型的筛选条件是否有效
   */
  validate(filter: FilterCondition): boolean {
    // 确保有操作符和值
    if (
      !filter.operator ||
      filter.value === undefined ||
      filter.value === null
    ) {
      return false;
    }

    // 目前只支持contains操作符
    if (filter.operator !== "contains") {
      return false;
    }

    // 确保值是字符串且非空
    return typeof filter.value === "string" && filter.value.trim().length > 0;
  },
};
