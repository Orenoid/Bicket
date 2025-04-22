import { auth } from '@clerk/nextjs/server';
import { IssueTable } from '@/components/issue/IssueTable';
import { loadSearchParams } from '@/lib/issue/validation';
import { buildOrderByParams, getPropertyDefinitions, getIssues } from '@/lib/issue/services/query';

export default async function Page({ searchParams }: {
    searchParams: Promise<{ filters?: string, page?: string, perPage?: string, sort?: string }>
}) {
    const { page, perPage, sort, filters } = await loadSearchParams(searchParams);

    const { orgId } = await auth();
    if (!orgId) {
        // TODO throw error
        console.warn('没有获取到组织ID，无法查询工单数据');
        return <div className='flex flex-col items-center justify-center h-screen'>
            <span className='text-2xl font-bold text-gray-500'>You are not in any workspace, please join a workspace first.</span>
        </div>
    }

    const orderBy = buildOrderByParams(sort || []);
    const [propertyDefinitions, issuesResult] = await Promise.all([
        getPropertyDefinitions(),
        getIssues(filters, orgId.toString(), page, perPage, orderBy)
    ]);
    const totalPages = Math.ceil(issuesResult.total / perPage);

    if (propertyDefinitions.length === 0) {
        // TODO throw error
        return <div className="p-8 text-red-500">Error: No property definitions found</div>;
    }

    return <>
        <IssueTable
            issues={issuesResult.issues}
            propertyDefinitions={propertyDefinitions}
            pageCount={totalPages}
        />
    </>
}
