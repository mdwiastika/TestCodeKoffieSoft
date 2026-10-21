import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "mark"
  size?: "sm" | "md" | "lg"
}

export function Logo({
  variant = "full",
  size = "md",
  className,
  ...props
}: LogoProps) {
  const sizeClasses = {
    sm: {
      mark: "h-6 w-6",
      text: "text-xs",
      subtext: "text-[9px]",
    },
    md: {
      mark: "h-8 w-8",
      text: "text-sm",
      subtext: "text-[11px]",
    },
    lg: {
      mark: "h-10 w-10",
      text: "text-lg",
      subtext: "text-xs",
    },
  }[size]

  return (
    <div
      className={cn("inline-flex items-center space-x-2.5 select-none", className)}
      {...props}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm ring-1 ring-slate-800/10 shrink-0",
          sizeClasses.mark
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4/6 w-4/6 text-white"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.4" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      </div>

      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight text-slate-900", sizeClasses.text)}>
            TaskFlow
          </span>
          <span className={cn("font-medium text-slate-500", sizeClasses.subtext)}>
            Workspace
          </span>
        </div>
      )}
    </div>
  )
}
