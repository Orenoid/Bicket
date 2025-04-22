'use server';

import { createIssue } from "@/lib/issue/services/create";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createIssueFormSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createIssueAction(prevState: { message: string }, data: z.infer<typeof createIssueFormSchema>) {
    try {
        const propertyValues = convertFormDataToPropertyValues(data);

        const { userId, orgId } = await auth()
        if (!userId || !orgId) {
            return {
                code: 401,
                message: 'Unauthorized'
            }
        }

        await createIssue({ workspaceId: orgId, propertyValues });

        revalidatePath('/issue');
        return {
            code: 200,
            message: 'success'
        }
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            message: 'Server Error'
        }
    }
}

function convertFormDataToPropertyValues(data: z.infer<typeof createIssueFormSchema>): { property_id: string, value: unknown }[] {
    const propertyValues = [];
    for (const [key, value] of Object.entries(data)) {
        propertyValues.push({
            property_id: key,
            value: value
        });
    }
    return propertyValues;
}
