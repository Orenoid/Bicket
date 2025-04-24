import Link from 'next/link'
import { Button } from '@/components/shadcn/ui/button'
import { FiAlertTriangle, FiHome } from 'react-icons/fi'

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 px-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <FiAlertTriangle className="text-5xl text-amber-500 mb-2" />
                <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
                <p className="text-muted-foreground">The resource you requested could not be found</p>
            </div>
            <Button asChild variant="default" className="mt-4">
                <Link href="/" className="flex items-center gap-2">
                    <FiHome className="h-4 w-4" />
                    <span>Return to Home</span>
                </Link>
            </Button>
        </div>
    )
}