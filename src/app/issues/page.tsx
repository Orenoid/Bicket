import { IssueTable } from '@/components/issue/IssueTable';
import { getIssues, getPropertyDefinitions } from '@/lib/issue/services/query';
import { loadSearchParams } from '@/lib/issue/validation';
import { auth } from '@clerk/nextjs/server';

export default async function Page({ searchParams }: {
    searchParams: Promise<{ filters?: string, page?: string, perPage?: string, sort?: string }>
}) {
    const { page, perPage, sort, filters } = await loadSearchParams(searchParams);

    const { orgId } = await auth();
    if (!orgId) {
        console.warn('没有获取到组织ID，无法查询工单数据');
        throw new Error('You are not in any workspace, please select a workspace or create one first.');
    }

    const [propertyDefinitions, issuesResult] = await Promise.all([
        getPropertyDefinitions(),
        getIssues(filters, orgId.toString(), page, perPage, sort || [])
    ]);
    const totalPages = Math.ceil(issuesResult.total / perPage);

    if (propertyDefinitions.length === 0) {
        console.warn('没有获取到属性定义，无法查询工单数据');
        throw new Error('Failed to get property definitions');
    }

    return <div className='h-full w-full p-8'>
        <IssueTable
            issues={issuesResult.issues}
            propertyDefinitions={propertyDefinitions}
            pageCount={totalPages}
        />
    </div>
}
