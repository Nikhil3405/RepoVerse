"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileCode2, Clock, Trash2, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  id: string
  title: string
  updated_at: string
}

export default function ConversationCard({ id, title, updated_at }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      setIsDeleting(true)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`,
        { method: "DELETE" }
      )

      if (res.ok) router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = updated_at
    ? new Date(updated_at).toLocaleString()
    : "Recently"

  return (
    <Card
      onClick={() => router.push(`/chat/${id}`)}
      className="cursor-pointer transition hover:shadow-md hover:-translate-y-[2px]"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">

          {/* LEFT */}
          <div className="flex gap-3">
            <div className="border rounded-md p-2 text-muted-foreground">
              <FileCode2 size={16} />
            </div>

            <div>
              <h3 className="text-sm font-medium line-clamp-1">
                {title || "Untitled"}
              </h3>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock size={12} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* DELETE */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-70 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete conversation?
                </AlertDialogTitle>

                <AlertDialogDescription className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </CardContent>
    </Card>
  )
}