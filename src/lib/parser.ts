import { createParser } from "nuqs/server";
import { z } from "zod";
import { FilterCondition } from "./property/types";

const sortingItemSchema = z.object({
    id: z.string(),
    desc: z.boolean(),
});

export const getSortingStateParser = () => {
    return createParser({
        parse: (value) => {
            try {
                const parsed = JSON.parse(value);
                const result = z.array(sortingItemSchema).safeParse(parsed);

                if (!result.success) return null;

                return result.data;
            } catch {
                return null;
            }
        },
        serialize: (value) => JSON.stringify(value),
        eq: (a, b) =>
            a.length === b.length &&
            a.every(
                (item, index) =>
                    item.id === b[index]?.id && item.desc === b[index]?.desc,
            ),
    });
};


const filterConditionSchema = z.object({
    propertyId: z.string(),
    propertyType: z.string(),
    operator: z.string(),
    value: z.unknown(),
    config: z.record(z.unknown()).optional(),
});

export const getFiltersStateParser = () => {
    return createParser<FilterCondition[]>({
        parse: (value) => {
            try {
                const parsed = JSON.parse(value);
                const result = z.array(filterConditionSchema).safeParse(parsed);

                if (!result.success) return null;

                return result.data as FilterCondition[];
            } catch {
                return null;
            }
        },
        serialize: (value) => JSON.stringify(value),
        eq: (a, b) =>
            a.length === b.length &&
            a.every(
                (item, index) =>
                    item.propertyId === b[index]?.propertyId &&
                    item.propertyType === b[index]?.propertyType &&
                    item.operator === b[index]?.operator &&
                    JSON.stringify(item.value) === JSON.stringify(b[index]?.value) &&
                    JSON.stringify(item.config) === JSON.stringify(b[index]?.config)
            ),
    });
}