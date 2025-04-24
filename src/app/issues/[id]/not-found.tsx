import Link from 'next/link'
import { Button } from '@/components/shadcn/ui/button'
import { FiAlertTriangle, FiList } from 'react-icons/fi'

export default function IssueNotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 px-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <FiAlertTriangle className="text-5xl text-amber-500 mb-2" />
                <h2 className="text-3xl font-bold tracking-tight">Issue Not Found</h2>
                <p className="text-muted-foreground">The issue you are looking for does not exist or has been removed</p>
            </div>
            <Button asChild variant="default" className="mt-4">
                <Link href="/issues" className="flex items-center gap-2">
                    <FiList className="h-4 w-4" />
                    <span>Back to Issues</span>
                </Link>
            </Button>
        </div>
    )
}
