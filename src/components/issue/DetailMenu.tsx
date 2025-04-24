'use client';

import { Button } from "@/components/shadcn/ui/button";
import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shadcn/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/shadcn/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { MdMoreHoriz } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner";
import { deleteIssueAction } from "./actions";

export default function DetailMoreMenu({ issueID }: { issueID: string }) {

    const deleteIssueWithID = deleteIssueAction.bind(null, issueID);
    const [actionResult, formAction, pending] = useActionState(deleteIssueWithID, { success: true, message: '' });
    useEffect(() => {
        if (!actionResult.success) {
            toast(actionResult.message)
        }
    }, [actionResult]);

    return <>
        <Dialog modal={false}> {/* 必须设置为 false，否则弹窗关闭后会导致页面无法交互 https://github.com/shadcn-ui/ui/issues/468 */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                    <MdMoreHoriz size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                        <DropdownMenuItem>
                            <RiDeleteBinLine className="text-red-500" /> Delete
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Are you sure you want to permanently
                        delete this issue?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <form action={formAction}>
                        <Button type="submit" variant="destructive" >
                            {pending && <Loader2 className="animate-spin" />}
                            Delete
                        </Button>
                    </form>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    </>
}