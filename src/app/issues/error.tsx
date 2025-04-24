'use client'

import { Button } from '@/components/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/ui/dialog'
import { XCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  return (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-12 w-12 text-destructive" />
            <DialogTitle>{error.message || 'An error occurred while processing your request'}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogFooter className="flex justify-center sm:justify-center">
          <Button
            variant="default"
            onClick={reset}
          >
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}