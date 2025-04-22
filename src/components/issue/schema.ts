import { SystemPropertyId } from "@/lib/property/constants";
import { z } from "zod";


export const createIssueFormSchema = z.object({
    [SystemPropertyId.TITLE]: z.string().min(1, "Title cannot be empty"),
    [SystemPropertyId.DESCRIPTION]: z.string().optional(),
    [SystemPropertyId.STATUS]: z.string().optional(),
    [SystemPropertyId.PRIORITY]: z.string().optional(),
    [SystemPropertyId.CATEGORY]: z.string().optional(),
    [SystemPropertyId.DIAGNOSIS]: z.string().optional(),
    [SystemPropertyId.MINERS]: z.array(z.string()).optional(),
    [SystemPropertyId.ASIGNEE]: z.string().optional(),
    [SystemPropertyId.REPORTER]: z.string().optional(),
});
