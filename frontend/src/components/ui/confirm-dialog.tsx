import { Dialog } from "./dialog"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: "destructive" | "default"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start space-x-3">
        {variant === "destructive" && (
          <div className="rounded-full bg-red-100 p-2 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        <p className="text-sm text-slate-600">{message}</p>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={variant}
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : confirmText}
        </Button>
      </div>
    </Dialog>
  )
}
