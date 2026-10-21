import { Button } from "./button"
import { AlertCircle, RotateCcw } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/40 p-8 text-center">
      <div className="rounded-full bg-red-100 p-2.5 text-red-600 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-xs text-red-700 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-red-200 text-red-800 hover:bg-red-100"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}
