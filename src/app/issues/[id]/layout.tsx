import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";
import { Suspense } from "react";


export default function Layout({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col w-full h-full pt-4 px-8">
        <Link href={`/issues`} className="text-md text-gray-500 hover:text-gray-700 flex items-center gap-1 font-sans w-fit mb-2">
            <FaChevronLeft size={12} /> Issues
        </Link>
        <Suspense fallback={null}>
            {children}
        </Suspense>
    </div>
}