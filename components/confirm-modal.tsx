"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No",
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-5 border-none shadow-lg bg-white/95 dark:bg-gray-800/95">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-4">
          <Button
            type="button"
            variant="destructive"
            className="opacity-80 hover:opacity-100 h-11 order-2 sm:order-1 bg-rose-500 hover:bg-rose-600"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
          <Button
            type="button"
            variant="default"
            className="font-semibold h-11 order-1 sm:order-2 bg-violet-600 hover:bg-violet-700 text-white"
            onClick={onClose}
            autoFocus
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

