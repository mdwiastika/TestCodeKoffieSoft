import React from "react"
import { Button } from "./button"
import { Logo } from "./logo"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
      <div className="rounded-full bg-slate-100 p-2.5 mb-3 flex items-center justify-center">
        {icon || <Logo variant="mark" size="md" />}
      </div>
      <h3 className="text-sm font-medium text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
