"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { ConfirmModal } from "@/components/confirm-modal"

interface ClearDataButtonProps {
  onClearData: () => void
}

export function ClearDataButton({ onClearData }: ClearDataButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-800/50 dark:hover:bg-rose-900/20 transition-all"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear All Data
      </Button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onClearData}
        title="Clear All Saved Data"
        description="Are you sure you want to clear all saved data? This will remove all players, scores, and game history. This action cannot be undone."
        confirmText="Yes, clear all data"
        cancelText="No, keep my data"
      />
    </>
  )
}

